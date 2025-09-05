import 'leaflet/dist/leaflet.css';

// Import specific functions from leaflet to avoid module issues
import * as L from 'leaflet';
import { Loader2 } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';

import { Card } from '@/components/ui/card';

const CustomMarkerIcon = L.divIcon({
  html: `<div style="width: 20px; height: 20px; background-color: hsl(var(--primary)); border: 2px solid hsl(var(--border)); border-radius: 4px; display: flex; align-items: center; justify-content: center; color: hsl(var(--primary-foreground));"><svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg></div>`,
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
    <Card
      className={`${className} relative z-30 w-full overflow-hidden`}
      style={{ height }}
    >
      {!mapReady && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-muted/50">
          <div className="text-center">
            <Loader2 className="mx-auto mb-4 size-8 animate-spin text-muted-foreground" />
            <p className="text-muted-foreground">Loading map...</p>
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
        <div className="absolute right-2 top-2 z-50 rounded-md border border-yellow-400 bg-yellow-100 px-3 py-2 text-sm text-yellow-700">
          ⚠️ Using fallback map tiles
        </div>
      )}
    </Card>
  );
};

export default LeafletMap;
