"use client";

import React, { useEffect, useRef } from "react";
import type LType from "leaflet";

interface InteractivePinMapProps {
  lat: number;
  lng: number;
  onChange: (coords: { lat: number; lng: number }) => void;
  heightClass?: string;
}

export function InteractivePinMap({
  lat,
  lng,
  onChange,
  heightClass = "h-56",
}: InteractivePinMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LType.Map | null>(null);
  const markerRef = useRef<LType.Marker | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    let active = true;
    let mapInstance: LType.Map | null = null;

    async function initMap() {
      if (!containerRef.current || mapRef.current) return;
      const L = (await import("leaflet")).default;
      if (!active || !containerRef.current) return;

      // Ensure Leaflet CSS is loaded once
      if (!document.getElementById("leaflet-css")) {
        const link = document.createElement("link");
        link.id = "leaflet-css";
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);
      }

      mapInstance = L.map(containerRef.current, {
        center: [lat, lng],
        zoom: 15,
        zoomControl: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
        maxZoom: 19,
      }).addTo(mapInstance);

      const pinIcon = L.divIcon({
        className: "xchicken-map-pin",
        html: `<div style="width:28px;height:28px;border-radius:9999px;background:#D11243;border:3px solid #ffffff;box-shadow:0 4px 12px rgba(0,0,0,0.35);"></div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const marker = L.marker([lat, lng], {
        draggable: true,
        icon: pinIcon,
      }).addTo(mapInstance);

      marker.on("dragend", () => {
        const pos = marker.getLatLng();
        onChangeRef.current({
          lat: Number(pos.lat.toFixed(6)),
          lng: Number(pos.lng.toFixed(6)),
        });
      });

      mapInstance.on("click", (e: LType.LeafletMouseEvent) => {
        marker.setLatLng(e.latlng);
        onChangeRef.current({
          lat: Number(e.latlng.lat.toFixed(6)),
          lng: Number(e.latlng.lng.toFixed(6)),
        });
      });

      mapRef.current = mapInstance;
      markerRef.current = marker;
    }

    initMap();

    return () => {
      active = false;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (mapRef.current && markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
      mapRef.current.panTo([lat, lng], { animate: true });
    }
  }, [lat, lng]);

  return (
    <div
      ref={containerRef}
      className={`w-full ${heightClass} rounded-xl overflow-hidden border border-gray-200 bg-gray-100 z-0`}
    />
  );
}
