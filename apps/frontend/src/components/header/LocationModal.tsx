"use client";

import React, { useEffect, useState } from "react";
import {
  MapPin,
  X,
  Navigation,
  Zap,
  AlertCircle,
  CheckCircle2,
  Edit3,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { apiRequest } from "@/lib/apiClient";
import { InteractivePinMap } from "./InteractivePinMap";

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  isFirstVisitPrompt?: boolean;
}

async function reverseGeocode(lat: number, lng: number): Promise<{
  addressLine: string;
  area: string;
  city: string;
  pincode: string;
}> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(
        lat
      )}&lon=${encodeURIComponent(lng)}`,
      { headers: { Accept: "application/json" } }
    );
    if (!res.ok) throw new Error("Geocode failed");
    const data = await res.json();
    const addr = data.address || {};
    const area =
      addr.suburb ||
      addr.neighbourhood ||
      addr.road ||
      addr.village ||
      addr.city_district ||
      "Pinned Location";
    const city = addr.city || addr.town || addr.state_district || addr.state || "";
    const pincode = /^\d{6}$/.test(addr.postcode || "") ? addr.postcode : "";
    const addressLine = data.display_name
      ? String(data.display_name).split(",").slice(0, 3).join(", ").trim()
      : `${area}${city ? `, ${city}` : ""}`;
    return { addressLine, area, city, pincode };
  } catch {
    return {
      addressLine: `Pinned (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
      area: `Pinned (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
      city: "",
      pincode: "",
    };
  }
}

export function LocationModal({
  isOpen,
  onClose,
  isFirstVisitPrompt = false,
}: LocationModalProps) {
  const { deliveryLocation, setDeliveryLocation } = useCart();

  const [mode, setMode] = useState<"prompt" | "picker">(
    isFirstVisitPrompt ? "prompt" : "picker"
  );
  const [detecting, setDetecting] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  const [pinCoords, setPinCoords] = useState<{ lat: number; lng: number }>(() =>
    deliveryLocation?.lat != null && deliveryLocation?.lng != null
      ? { lat: deliveryLocation.lat, lng: deliveryLocation.lng }
      : { lat: 17.4435, lng: 78.3772 }
  );
  const [hasChosenCoords, setHasChosenCoords] = useState<boolean>(
    deliveryLocation?.lat != null && deliveryLocation?.lng != null
  );
  const [addressLine, setAddressLine] = useState(deliveryLocation?.addressLine || "");
  const [area, setArea] = useState(deliveryLocation?.area || "");
  const [city, setCity] = useState(deliveryLocation?.city || "");
  const [pincode, setPincode] = useState(deliveryLocation?.pincode || "");
  const [source, setSource] = useState<"gps" | "pin" | "manual">(
    deliveryLocation?.source || "manual"
  );
  const [previewEligibility, setPreviewEligibility] = useState<{
    checked: boolean;
    eligible: boolean;
    express15MinEligible: boolean;
    nearestDistanceKm: number | null;
    estimatedMins: number | null;
  }>({
    checked: false,
    eligible: false,
    express15MinEligible: false,
    nearestDistanceKm: null,
    estimatedMins: null,
  });

  useEffect(() => {
    if (isOpen) {
      setMode(isFirstVisitPrompt ? "prompt" : "picker");
      setGeoError(null);
      if (deliveryLocation?.lat != null && deliveryLocation?.lng != null) {
        setPinCoords({ lat: deliveryLocation.lat, lng: deliveryLocation.lng });
        setHasChosenCoords(true);
      }
      setAddressLine(deliveryLocation?.addressLine || "");
      setArea(deliveryLocation?.area || "");
      setCity(deliveryLocation?.city || "");
      setPincode(deliveryLocation?.pincode || "");
    }
  }, [isOpen, isFirstVisitPrompt, deliveryLocation]);

  useEffect(() => {
    if (!isOpen || !hasChosenCoords) return;
    let active = true;
    apiRequest<{
      eligible: boolean;
      express15MinEligible: boolean;
      nearestDistanceKm: number | null;
      estimatedMins: number | null;
    }>(
      `/api/v1/delivery/eligibility?lat=${encodeURIComponent(
        pinCoords.lat
      )}&lng=${encodeURIComponent(pinCoords.lng)}`
    )
      .then((res) => {
        if (active) setPreviewEligibility({ ...res, checked: true });
      })
      .catch(() => {
        if (active) {
          setPreviewEligibility({
            checked: true,
            eligible: false,
            express15MinEligible: false,
            nearestDistanceKm: null,
            estimatedMins: null,
          });
        }
      });
    return () => {
      active = false;
    };
  }, [isOpen, hasChosenCoords, pinCoords.lat, pinCoords.lng]);

  if (!isOpen) return null;

  const markPromptDecision = (decision: string) => {
    try {
      localStorage.setItem("xchicken_location_prompted", decision);
    } catch {}
  };

  const handleRequestBrowserLocation = () => {
    setGeoError(null);
    if (!navigator.geolocation) {
      setGeoError("Browser geolocation is unavailable. Please pin or enter your address manually.");
      markPromptDecision("unavailable");
      setMode("picker");
      return;
    }

    setDetecting(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(6));
        const lng = Number(pos.coords.longitude.toFixed(6));
        markPromptDecision("granted");
        setPinCoords({ lat, lng });
        setHasChosenCoords(true);
        setSource("gps");
        setMode("picker");

        const geo = await reverseGeocode(lat, lng);
        setAddressLine(geo.addressLine);
        setArea(geo.area);
        if (geo.city) setCity(geo.city);
        if (geo.pincode) setPincode(geo.pincode);
        setDetecting(false);
      },
      (err) => {
        setDetecting(false);
        markPromptDecision(err.code === err.PERMISSION_DENIED ? "denied" : "error");
        setGeoError(
          err.code === err.PERMISSION_DENIED
            ? "Location permission denied. You can pin your location on the map or enter your address manually."
            : "Could not detect GPS location. Please pin or enter your address manually."
        );
        setMode("picker");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleDenyPermission = () => {
    markPromptDecision("denied");
    setMode("picker");
  };

  const handlePinChange = async (coords: { lat: number; lng: number }) => {
    setPinCoords(coords);
    setHasChosenCoords(true);
    setSource("pin");
    const geo = await reverseGeocode(coords.lat, coords.lng);
    setAddressLine(geo.addressLine);
    setArea(geo.area);
    if (geo.city) setCity(geo.city);
    if (geo.pincode) setPincode(geo.pincode);
  };

  const handleConfirmLocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addressLine.trim() && !area.trim()) {
      setGeoError("Please enter your delivery address or select a pin on the map.");
      return;
    }
    markPromptDecision("set");
    setDeliveryLocation({
      addressLine: addressLine.trim() || area.trim(),
      area: area.trim() || addressLine.trim(),
      city: city.trim(),
      pincode: pincode.trim(),
      lat: hasChosenCoords ? pinCoords.lat : null,
      lng: hasChosenCoords ? pinCoords.lng : null,
      source,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden border border-gray-100 max-h-[92vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-[#FFF0F2]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[#D11243] flex items-center justify-center text-white">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-black text-gray-900 text-base">
                {mode === "prompt" ? "Allow X-Chicken to access your location?" : "Select Delivery Location"}
              </h3>
              <p className="text-[11px] text-gray-600">
                Used to check delivery availability and find the nearest fresh store
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              if (mode === "prompt") markPromptDecision("dismissed");
              onClose();
            }}
            className="p-2 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-200/50 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {mode === "prompt" ? (
          <div className="p-6 space-y-5">
            <p className="text-xs text-gray-600 leading-relaxed">
              Share your device location so X-Chicken can detect your delivery address, verify{" "}
              <strong>Express 15-min delivery</strong> eligibility, and route orders to the
              nearest open store.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={handleRequestBrowserLocation}
                disabled={detecting}
                className="flex-1 bg-[#D11243] hover:bg-[#B00E37] disabled:opacity-50 text-white py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <Navigation className="w-4 h-4" />
                <span>{detecting ? "Detecting Location..." : "Allow Location"}</span>
              </button>
              <button
                type="button"
                onClick={handleDenyPermission}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <Edit3 className="w-4 h-4" />
                <span>Enter Manually Instead</span>
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleConfirmLocation} className="p-5 space-y-4 overflow-y-auto">
            {geoError && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{geoError}</span>
              </div>
            )}

            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={handleRequestBrowserLocation}
                disabled={detecting}
                className="px-3.5 py-2 rounded-xl bg-[#FFF0F2] hover:bg-[#FFE0E5] text-[#D11243] text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>{detecting ? "Detecting..." : "Use Current GPS Location"}</span>
              </button>
              <span className="text-[11px] text-gray-400">
                Click or drag pin on map to adjust
              </span>
            </div>

            <InteractivePinMap
              lat={pinCoords.lat}
              lng={pinCoords.lng}
              onChange={handlePinChange}
              heightClass="h-52"
            />

            {hasChosenCoords && previewEligibility.checked && (
              <div
                className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
                  previewEligibility.express15MinEligible
                    ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                    : previewEligibility.eligible
                    ? "bg-blue-50 border-blue-200 text-blue-800"
                    : "bg-red-50 border-red-200 text-red-700"
                }`}
              >
                {previewEligibility.express15MinEligible ? (
                  <>
                    <Zap className="w-4 h-4 fill-current shrink-0" />
                    <span>
                      Express 15-min delivery available! (~{previewEligibility.estimatedMins} mins,{" "}
                      {previewEligibility.nearestDistanceKm} km away)
                    </span>
                  </>
                ) : previewEligibility.eligible ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>
                      Delivery available in ~{previewEligibility.estimatedMins} mins (
                      {previewEligibility.nearestDistanceKm} km from nearest store).
                    </span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>No open X-Chicken store currently covers this pinned location.</span>
                  </>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="sm:col-span-2">
                <label className="block font-bold text-gray-700 mb-1">
                  Street / Area / Landmark
                </label>
                <input
                  type="text"
                  required
                  value={addressLine}
                  onChange={(e) => {
                    setAddressLine(e.target.value);
                    if (!area) setArea(e.target.value);
                  }}
                  placeholder="Enter street, area or building name"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#D11243]"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">City</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="City"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#D11243]"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Pincode</label>
                <input
                  type="text"
                  maxLength={6}
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, ""))}
                  placeholder="6-digit pincode"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#D11243]"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-[#D11243] hover:bg-[#B00E37] text-white py-3 rounded-xl font-bold text-xs cursor-pointer"
            >
              Confirm Delivery Location
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
