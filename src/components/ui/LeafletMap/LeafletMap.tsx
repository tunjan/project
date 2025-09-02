import 'leaflet/dist/leaflet.css';

// Import specific functions from leaflet to avoid module issues
import * as L from 'leaflet';
import React, { useEffect, useMemo, useState } from 'react';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';

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

export interface MapMarker {
  position: [number, number];
  popupContent: React.ReactNode;
  key: string;
}

interface LeafletMapProps {
  markers: MapMarker[];
  className?: string;
  height?: string;
}

const LeafletMap: React.FC<LeafletMapProps> = ({
  markers,
  className = '',
  height = '600px',
}) => {
  const [tileError, setTileError] = useState(false);
  const [mapReady, setMapReady] = useState(false);

  const bounds = useMemo(() => {
    if (markers.length === 0) return null;
    const allCoords = markers.map((m) => m.position);

    return new L.LatLngBounds(allCoords);
  }, [markers]);

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
      className={`${className} relative z-30 w-full border-black bg-white md:border-2`}
      style={{ height }}
    >
      {!mapReady && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <div className="mx-auto mb-4 size-12 animate-spin rounded-full border-b-2 border-black"></div>
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
        {markers.map((marker) => (
          <Marker
            key={marker.key}
            position={marker.position}
            icon={CustomMarkerIcon}
          >
            <Popup>{marker.popupContent}</Popup>
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

export default LeafletMap;
