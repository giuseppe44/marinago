"use client";

import { Map, Marker } from "pigeon-maps";
import { useRouter } from "next/navigation";

interface MapProps {
  markers: {
    id: string;
    latitude: number;
    longitude: number;
    name: string;
  }[];
}

export function MarinasMap({ markers }: MapProps) {
  const router = useRouter();

  // Center roughly on Sardinia
  return (
    <div className="w-full h-[500px] rounded-xl overflow-hidden shadow-lg border border-slate-200">
      <Map defaultCenter={[40.0, 9.0]} defaultZoom={7}>
        {markers.map((marker) => (
          <Marker 
            key={marker.id} 
            width={40}
            anchor={[marker.latitude, marker.longitude]} 
            color="#0f172a" // Luxury dark slate instead of bright blue
            onClick={() => {
              // Extract city from name or just pass name
              const searchName = marker.name.replace('[DEMO] Marina di ', '').replace('[DEMO] ', '');
              router.push(`/ricerca?dest=${encodeURIComponent(searchName)}`);
            }}
          />
        ))}
      </Map>
    </div>
  );
}
