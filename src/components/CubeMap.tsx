import React, { useMemo, useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Import specific functions from leaflet to avoid module issues
import * as L from 'leaflet';
import { type CubeEvent, type Chapter } from '@/types';
import styles from './CubeMap.module.css';

const CustomMarkerIcon = L.divIcon({
  html: `<div style="width: 20px; height: 20px; background-color: #ef4444; border: 2px solid #000000; border-radius: 2px; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
  className: 'custom-marker-icon',
  iconSize: L.point(20, 20),
  iconAnchor: L.point(10, 10),
});

const ChangeView: React.FC<{ bounds: L.LatLngBounds | null }> = ({
  bounds,
}) => {
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
  popupActionText?: string;
}

const CubeMap: React.FC<CubeMapProps> = ({
  events,
  chapters,
  onSelectCube,
  popupActionText = 'View Event',
}) => {
  const [tileError, setTileError] = useState(false);
  const [mapReady, setMapReady] = useState(false);

  // CRITICAL FIX: Removed all DOM manipulation and MutationObserver
  // Custom styles are now handled through CSS modules

  const eventMarkers = useMemo(() => {
    return events
      .map((event) => {
        // Find the chapter for this event to get coordinates
        const chapter = chapters.find((c) => c.name === event.city);
        if (!chapter) return null;

        const coords: [number, number] = [chapter.lat, chapter.lng];
        return { event, coords };
      })
      .filter(
        (item): item is { event: CubeEvent; coords: [number, number] } =>
          item !== null && item.coords[0] !== 0 && item.coords[1] !== 0 // Filter out invalid coordinates
      );
  }, [events, chapters]);

  const bounds = useMemo(() => {
    if (eventMarkers.length === 0) return null;
    const allCoords = eventMarkers.map((m) => m.coords);

    return new L.LatLngBounds(allCoords);
  }, [eventMarkers]);

  // Handle tile loading errors
  const handleTileError = () => {
    console.warn('Primary tile provider failed, map may not display correctly');
    setTileError(true);
  };

  // Handle map ready
  const handleMapReady = () => {
    setMapReady(true);
  };

  // Fallback tile provider if primary fails
  const getTileUrl = () => {
    if (tileError) {
      // Use OpenStreetMap directly as fallback
      return 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    }
    // Primary: CARTO basemaps (HTTPS compatible)
    return 'https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png';
  };

  return (
    <div
      className={`${styles.cubeMapContainer} relative z-30 h-[600px] w-full border-2 border-black bg-white`}
    >
      {!mapReady && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-black"></div>
            <p className="text-gray-600">Loading map...</p>
          </div>
        </div>
      )}

      <MapContainer
        center={[20, 0] as [number, number]}
        zoom={2}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%' }}
        whenReady={handleMapReady}
      >
        <ChangeView bounds={bounds} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url={getTileUrl()}
          eventHandlers={{
            tileerror: handleTileError,
          }}
        />
        {eventMarkers.map(({ event, coords }) => (
          <Marker key={event.id} position={coords} icon={CustomMarkerIcon}>
            <Popup>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold leading-tight text-black">
                    {event.name}
                  </h3>
                  <p className="text-neutral-secondary text-sm font-semibold uppercase tracking-wide">
                    {event.city}
                  </p>
                  <p className="text-sm text-neutral">
                    {new Date(event.startDate).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => onSelectCube(event)}
                  className="w-full border-2 border-black bg-black px-4 py-2 text-sm font-bold text-white transition-all duration-200 hover:bg-black hover:shadow-brutal"
                >
                  {popupActionText}
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {tileError && (
        <div className="absolute right-2 top-2 z-50 rounded border border-yellow-400 bg-yellow-100 px-3 py-2 text-sm text-yellow-700">
          ⚠️ Using fallback map tiles
        </div>
      )}
    </div>
  );
};

export default CubeMap;
