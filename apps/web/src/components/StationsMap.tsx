/**
 * @file StationsMap.tsx
 * @module @voltaway/web
 *
 * Scopo: mappa MapLibre con pin colonnine, prezzo all-in e selezione EVSE.
 * Flusso: props stations → marker DOM → click → onSelect + flyTo.
 * Dipendenze: maplibre-gl, @/lib/api.
 */
'use client';

import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { StationMarker } from '@/lib/api';

const TILES =
  process.env.NEXT_PUBLIC_MAP_TILES_URL ?? 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';

const CATANIA_CENTER: [number, number] = [15.087, 37.508];

export function StationsMap({
  stations,
  selectedUid,
  onSelect,
}: {
  stations: StationMarker[];
  selectedUid?: string;
  onSelect?: (station: StationMarker) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);

  // Inizializza mappa una sola volta; cleanup rimuove marker e istanza
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: {
        version: 8,
        sources: {
          osm: {
            type: 'raster',
            tiles: [TILES],
            tileSize: 256,
            attribution: '© OpenStreetMap',
          },
        },
        layers: [{ id: 'osm', type: 'raster', source: 'osm' }],
      },
      center: stations[0] ? [stations[0].longitude, stations[0].latitude] : CATANIA_CENTER,
      zoom: 13,
      attributionControl: false,
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
    mapRef.current = map;

    return () => {
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Ricrea marker quando cambiano stazioni o selezione (pin prezzo vs stato)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    for (const station of stations) {
      const isSelected = station.ocpiEvseUid === selectedUid;
      const el = document.createElement('button');
      el.type = 'button';
      el.className = `map-pin${isSelected ? ' map-pin--selected' : ''}`;
      el.innerHTML =
        station.allInPerKwh != null
          ? `<span class="map-pin-price">€${station.allInPerKwh.toFixed(2)}</span>`
          : `<span class="map-pin-status">${station.status.slice(0, 3)}</span>`;

      el.addEventListener('click', (e) => {
        e.stopPropagation();
        onSelect?.(station);
        map.flyTo({
          center: [station.longitude, station.latitude],
          zoom: 15,
          duration: 800,
        });
      });

      const marker = new maplibregl.Marker({ element: el, anchor: 'bottom' })
        .setLngLat([station.longitude, station.latitude])
        .addTo(map);

      markersRef.current.push(marker);
    }
  }, [stations, selectedUid, onSelect]);

  // Centra mappa quando la selezione cambia da fuori (es. bottom sheet)
  useEffect(() => {
    const station = stations.find((s) => s.ocpiEvseUid === selectedUid);
    const map = mapRef.current;
    if (!station || !map) return;
    map.flyTo({ center: [station.longitude, station.latitude], zoom: 15, duration: 600 });
  }, [selectedUid, stations]);

  return <div ref={containerRef} className="absolute inset-0 h-full w-full" />;
}
