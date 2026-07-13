"use client";

import * as React from "react";
import L from "leaflet";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";

type LocationMapProps = {
  latitude: number;
  longitude: number;
  onMove: (latitude: number, longitude: number) => void;
};

function Recenter({ latitude, longitude }: Pick<LocationMapProps, "latitude" | "longitude">) {
  const map = useMap();

  React.useEffect(() => {
    map.setView([latitude, longitude], map.getZoom(), { animate: true });
  }, [latitude, longitude, map]);

  return null;
}

function ClickPicker({ onMove }: Pick<LocationMapProps, "onMove">) {
  useMapEvents({
    click(event) {
      onMove(event.latlng.lat, event.latlng.lng);
    },
  });
  return null;
}

export function LocationMap({ latitude, longitude, onMove }: LocationMapProps) {
  const pinIcon = React.useMemo(
    () =>
      L.divIcon({
        className: "cartwise-map-pin",
        html: "<span></span>",
        iconSize: [30, 38],
        iconAnchor: [15, 36],
      }),
    [],
  );

  return (
    <MapContainer
      center={[latitude, longitude]}
      zoom={14}
      scrollWheelZoom
      className="h-[360px] w-full rounded-xl"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ClickPicker onMove={onMove} />
      <Recenter latitude={latitude} longitude={longitude} />
      <Marker
        draggable
        icon={pinIcon}
        position={[latitude, longitude]}
        eventHandlers={{
          dragend(event) {
            const marker = event.target as L.Marker;
            const position = marker.getLatLng();
            onMove(position.lat, position.lng);
          },
        }}
      />
    </MapContainer>
  );
}
