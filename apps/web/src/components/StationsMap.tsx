"use client";

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { StationMarker } from "@/lib/api";

const TILES =
  process.env.NEXT_PUBLIC_MAP_TILES_URL ??
  "https://tile.openstreetmap.org/{z}/{x}/{y}.png";

export function StationsMap({ stations }: { stations: StationMarker[] }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: {
        version: 8,
        sources: {
          osm: {
            type: "raster",
            tiles: [TILES],
            tileSize: 256,
            attribution: "© OpenStreetMap contributors",
          },
        },
        layers: [{ id: "osm", type: "raster", source: "osm" }],
      },
      center: stations[0] ? [stations[0].longitude, stations[0].latitude] : [9.19, 45.46],
      zoom: 12,
    });

    for (const station of stations) {
      const el = document.createElement("div");
      el.className = "station-marker";
      el.innerHTML = station.allInPerKwh
        ? `€${station.allInPerKwh.toFixed(2)}/kWh`
        : station.status;

      new maplibregl.Marker({ element: el })
        .setLngLat([station.longitude, station.latitude])
        .setPopup(
          new maplibregl.Popup({ offset: 16 }).setHTML(
            `<strong>${station.name}</strong><br/>${station.address}, ${station.city}<br/>` +
              `${station.maxPowerKw} kW · ${station.status}` +
              (station.allInPerKwh ? `<br/><b>€${station.allInPerKwh.toFixed(2)}/kWh all-in</b>` : ""),
          ),
        )
        .addTo(map);
    }

    return () => map.remove();
  }, [stations]);

  return <div ref={containerRef} className="map" />;
}
