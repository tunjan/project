import React, { useMemo, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
// FIX: featureGroup is no longer needed, but LatLngBounds is.
import { divIcon, point, LatLngBounds } from "leaflet";
import { type CubeEvent, type Chapter } from "@/types";

const getEventCoords = (
  event: CubeEvent,
  chapters: Chapter[]
): [number, number] | null => {
  const chapter = chapters.find((c) => c.name === event.city);
  return chapter ? [chapter.lat, chapter.lng] : null;
};

const CustomMarkerIcon = divIcon({
  html: `<div class="w-4 h-4 bg-primary border-2 border-black"></div>`,
  className: "",
  iconSize: point(16, 16),
  iconAnchor: point(8, 8),
});

const ChangeView: React.FC<{ bounds: LatLngBounds | null }> = ({ bounds }) => {
  const map = useMap();
  useEffect(() => {
    if (bounds) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [map, bounds]);
  return null;
};

interface CubeMapProps {
  events: CubeEvent[];
  chapters: Chapter[];
  onSelectCube: (event: CubeEvent) => void;
}

const CubeMap: React.FC<CubeMapProps> = ({
  events,
  chapters,
  onSelectCube,
}) => {
  const eventMarkers = useMemo(() => {
    return events
      .map((event) => {
        const chapter = chapters.find((c) => c.name === event.city);
        const coords: [number, number] | null = chapter
          ? [chapter.lat, chapter.lng]
          : null;
        return { event, coords };
      })
      .filter(
        (item): item is { event: CubeEvent; coords: [number, number] } =>
          item.coords !== null
      );
  }, [events, chapters]);

  // FIX: This section is now corrected and more efficient.
  const bounds = useMemo(() => {
    if (eventMarkers.length === 0) return null;
    const allCoords = eventMarkers.map((m) => m.coords);
    // Directly create a LatLngBounds object from the coordinates array.
    // This avoids the problematic `new Marker()` call.
    return new LatLngBounds(allCoords);
  }, [eventMarkers]);

  return (
    <div className="border border-black bg-white h-[600px] w-full">
      <MapContainer
        center={[20, 0]}
        zoom={2}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%" }}
      >
        <ChangeView bounds={bounds} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png"
        />
        {eventMarkers.map(({ event, coords }) => (
          <Marker key={event.id} position={coords} icon={CustomMarkerIcon}>
            <Popup>
              <div className="font-sans">
                <h3 className="font-extrabold text-base mb-1 text-black">
                  {event.location}
                </h3>
                <p className="m-0 text-sm text-neutral-600">{event.city}</p>
                <p className="m-0 my-1 text-sm text-neutral-800">
                  {new Date(event.dateTime).toLocaleString([], {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </p>
                <button
                  onClick={() => onSelectCube(event)}
                  className="w-full border-none cursor-pointer mt-2 p-1 bg-primary text-white font-bold hover:bg-primary-hover"
                >
                  View Details
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default CubeMap;
