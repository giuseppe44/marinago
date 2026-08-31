"use client";

import { Map, Marker } from "pigeon-maps";
import { stamenTerrain } from "pigeon-maps/providers";

interface MapProps {
  markers: {
    id: string;
    latitude: number;
    longitude: number;
    name: string;
  }[];
}

export function MarinasMap({ markers }: MapProps) {
  // Center roughly on Sardinia
  return (
    <div className="w-full h-[500px] rounded-xl overflow-hidden shadow-lg border border-slate-200">
      <Map defaultCenter={[40.0, 9.0]} defaultZoom={7}>
        {markers.map((marker) => (
          <Marker 
            key={marker.id} 
            width={40}
            anchor={[marker.latitude, marker.longitude]} 
            color="#2563eb"
            onClick={() => alert(`Cliccato: ${marker.name}`)}
          />
        ))}
      </Map>
    </div>
  );
}
