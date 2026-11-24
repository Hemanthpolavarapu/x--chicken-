"use client";

import React, { useState } from "react";
import { MapPin, X, Check, Store, Navigation } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { STORE_HUBS } from "@/data/stores";

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LocationModal({ isOpen, onClose }: LocationModalProps) {
  const { selectedLocation, setSelectedLocation, selectedPincode, setSelectedPincode } = useCart();
  const [customPincode, setCustomPincode] = useState("");
  const [pincodeError, setPincodeError] = useState("");
  const [pincodeSuccess, setPincodeSuccess] = useState("");

  if (!isOpen) return null;

  const handleSelectHub = (hub: typeof STORE_HUBS[0]) => {
    setSelectedLocation(`${hub.area}, ${hub.city}`);
    setSelectedPincode(hub.pincodes[0]);
    onClose();
  };

  const handleVerifyPincode = (e: React.FormEvent) => {
    e.preventDefault();
    setPincodeError("");
    setPincodeSuccess("");

    if (!customPincode || customPincode.length !== 6) {
      setPincodeError("Please enter a valid 6-digit Indian PIN code.");
      return;
    }

    const matchedHub = STORE_HUBS.find((hub) =>
      hub.pincodes.includes(customPincode)
    );

    if (matchedHub) {
      setSelectedLocation(`${matchedHub.area}, ${matchedHub.city}`);
      setSelectedPincode(customPincode);
      setPincodeSuccess(`Express store delivery available in ~${matchedHub.avgDeliveryMins} mins!`);
      setTimeout(() => {
        onClose();
      }, 1200);
    } else {
      // Allow delivery with standard store routing
      setSelectedLocation(`Pincode: ${customPincode}, Bangalore Hub`);
      setSelectedPincode(customPincode);
      setPincodeSuccess("Store service confirmed! Dispatched from central chilled hub (35-45 mins).");
      setTimeout(() => {
        onClose();
      }, 1200);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-[#FFF0F2]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full bg-[#D11243] flex items-center justify-center text-white">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg">Select Store Hub</h3>
              <p className="text-xs text-gray-600">Fresh chicken is cut & dispatched from your nearest store</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-200/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Custom Pincode Input */}
          <form onSubmit={handleVerifyPincode} className="space-y-2">
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Enter Delivery Pincode
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Navigation className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  suppressHydrationWarning
                  type="text"
                  maxLength={6}
                  placeholder="e.g. 560038"
                  value={customPincode}
                  onChange={(e) => setCustomPincode(e.target.value.replace(/\D/g, ""))}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#D11243] focus:border-transparent"
                />
              </div>
              <button
                suppressHydrationWarning
                type="submit"
                className="bg-[#D11243] hover:bg-[#B00E37] text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm cursor-pointer"
              >
                Check
              </button>
            </div>
            {pincodeError && <p className="text-xs text-red-600 font-medium">{pincodeError}</p>}
            {pincodeSuccess && (
              <p className="text-xs text-green-700 font-medium flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> {pincodeSuccess}
              </p>
            )}
          </form>

          {/* Available Hub Stores */}
          <div className="space-y-2.5">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Or Choose Active Neighborhood Store:
            </p>
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {STORE_HUBS.map((hub) => {
                const isSelected = selectedLocation.includes(hub.area);
                return (
                  <button
                    key={hub.id}
                    onClick={() => handleSelectHub(hub)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center justify-between ${
                      isSelected
                        ? "border-[#D11243] bg-[#FFF0F2] text-gray-900 shadow-xs"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <MapPin
                        className={`w-4 h-4 mt-0.5 shrink-0 ${
                          isSelected ? "text-[#D11243]" : "text-gray-400"
                        }`}
                      />
                      <div>
                        <div className="font-semibold text-sm flex items-center gap-2">
                          {hub.name}
                          {isSelected && (
                            <span className="text-[10px] bg-[#D11243] text-white px-2 py-0.2 rounded-full font-bold">
                              Selected
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">{hub.area}</p>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          Pins: {hub.pincodes.slice(0, 3).join(", ")}...
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-md">
                        ⚡ {hub.avgDeliveryMins} mins
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
