"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useRef, useState } from "react";

// Carte de la fiche espace, identique au site snapdesk.co : fond OpenStreetMap grisé,
// ping officiel Snapdesk (goutte noire au monogramme SK), zoom 14, molette désactivée.

const TILES_URL = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
const ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">Contributeurs OpenStreetMap</a>';
const ZOOM = 14;

type LatLng = [number, number];

// Géocodage de l'adresse : Géoplateforme IGN (Base Adresse Nationale), sans clé,
// puis Nominatim (OpenStreetMap) en secours.
async function geocode(query: string): Promise<LatLng | null> {
  try {
    const res = await fetch(
      `https://data.geopf.fr/geocodage/search?q=${encodeURIComponent(query)}&limit=1`
    );
    if (res.ok) {
      const data = await res.json();
      const coords = data?.features?.[0]?.geometry?.coordinates;
      if (Array.isArray(coords)) return [coords[1], coords[0]];
    }
  } catch {
    // on tente le service de secours
  }
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`
    );
    if (res.ok) {
      const data = await res.json();
      if (data?.[0]) return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
    }
  } catch {
    // pas de coordonnées : la carte reste sur son fond
  }
  return null;
}

interface LocationMapProps {
  address: string;
  name: string;
}

export default function LocationMap({ address, name }: LocationMapProps) {
  const container = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let cleanup: (() => void) | undefined;

    (async () => {
      const [L, coords] = await Promise.all([
        import("leaflet").then((m) => m.default),
        geocode(address),
      ]);
      if (cancelled || !container.current) return;
      if (!coords) {
        setFailed(true);
        return;
      }

      const map = L.map(container.current, {
        scrollWheelZoom: false,
        zoomControl: false,
        maxZoom: 18,
      }).setView(coords, ZOOM);

      L.control
        .zoom({ position: "topright", zoomInTitle: "Zoomer", zoomOutTitle: "Dézoomer" })
        .addTo(map);
      L.tileLayer(TILES_URL, {
        attribution: ATTRIBUTION,
        maxZoom: 19,
        className: "sk-map-tiles",
      }).addTo(map);
      L.marker(coords, {
        title: name,
        keyboard: false,
        icon: L.divIcon({
          className: "",
          html: '<span class="sk-map-pin"><img src="/carte/ping-snapdesk.png" alt="" width="36" height="49" draggable="false" /></span>',
          iconSize: [36, 49],
          iconAnchor: [18, 48],
        }),
      }).addTo(map);

      const observer = new ResizeObserver(() => map.invalidateSize());
      observer.observe(container.current);
      cleanup = () => {
        observer.disconnect();
        map.remove();
      };
    })();

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [address, name]);

  return (
    <div className="relative w-full h-full overflow-hidden rounded-lg bg-[#eef0f0]">
      <div
        ref={container}
        className="absolute inset-0 z-0 font-sans"
        role="region"
        aria-label={`Plan d’accès : ${name}`}
      />
      {failed && (
        <div className="absolute inset-0 grid place-items-center text-sm text-luxury-muted">
          Carte indisponible
        </div>
      )}
    </div>
  );
}
