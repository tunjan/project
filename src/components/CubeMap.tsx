import React, { useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Import specific functions from leaflet to avoid module issues
import * as L from 'leaflet';
import { type CubeEvent, type Chapter } from '@/types';
import { safeFormatLocaleString } from '@/utils/date';

const CustomMarkerIcon = L.divIcon({
  html: `<div class="w-5 h-5 bg-red border-2 border-black "></div>`,
  className: '',
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
}

const CubeMap: React.FC<CubeMapProps> = ({
  events,
  chapters,
  onSelectCube,
}) => {
  // Force remove rounded corners and shadows from Leaflet popups
  useEffect(() => {
    const forceLeafletStyles = () => {
      const popups = document.querySelectorAll(
        '.leaflet-popup, .leaflet-popup-content-wrapper, .leaflet-popup-tip'
      );
      popups.forEach((popup) => {
        if (popup instanceof HTMLElement) {
          popup.style.borderRadius = '0';
          popup.style.webkitBorderRadius = '0';
          popup.style.boxShadow = 'none';
          popup.style.webkitBoxShadow = 'none';
          popup.style.filter = 'none';
          popup.style.webkitFilter = 'none';
        }
      });
    };

    // Apply styles immediately
    forceLeafletStyles();

    // Set up a mutation observer to catch dynamically created popups
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node instanceof HTMLElement) {
              if (
                node.classList.contains('leaflet-popup') ||
                node.classList.contains('leaflet-popup-content-wrapper') ||
                node.classList.contains('leaflet-popup-tip')
              ) {
                forceLeafletStyles();
              }
              // Also check child elements
              const popupElements = node.querySelectorAll(
                '.leaflet-popup, .leaflet-popup-content-wrapper, .leaflet-popup-tip'
              );
              if (popupElements.length > 0) {
                forceLeafletStyles();
              }
            }
          });
        }
      });
    });

    // Start observing
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Cleanup
    return () => {
      observer.disconnect();
    };
  }, []);

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

  const bounds = useMemo(() => {
    if (eventMarkers.length === 0) return null;
    const allCoords = eventMarkers.map((m) => m.coords);

    return new L.LatLngBounds(allCoords);
  }, [eventMarkers]);

  return (
    <div className="h-[600px] w-full border-2 border-black bg-white">
      <MapContainer
        center={[20, 0] as [number, number]}
        zoom={2}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%' }}
      >
        <ChangeView bounds={bounds} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png"
        />
        {eventMarkers.map(({ event, coords }) => (
          <Marker key={event.id} position={coords} icon={CustomMarkerIcon}>
            <Popup>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold leading-tight text-black">
                    {event.location}
                  </h3>
                  <p className="text-neutral-secondary text-sm font-semibold uppercase tracking-wide">
                    {event.city}
                  </p>
                </div>
                <div className="border-t-2 border-black pt-3">
                  <p className="text-sm font-medium text-neutral">
                    {safeFormatLocaleString(event.startDate, {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </p>
                </div>
                <button
                  onClick={() => onSelectCube(event)}
                  className="w-full border-2 border-black bg-black px-4 py-2 text-sm font-bold text-white transition-all duration-200 hover:bg-black hover:shadow-brutal"
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
