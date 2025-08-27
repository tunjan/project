import React, { useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Import specific functions from leaflet to avoid module issues
import * as L from 'leaflet';
import { type Chapter } from '@/types';

const CustomMarkerIcon = L.divIcon({
  html: `<div class="w-5 h-5 bg-red border-2 border-black"></div>`,
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

interface ChapterMapProps {
  chapters: Chapter[];
  onSelectChapter: (chapter: Chapter) => void;
}

const ChapterMap: React.FC<ChapterMapProps> = ({
  chapters,
  onSelectChapter,
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
          popup.style.mozBorderRadius = '0';
          popup.style.msBorderRadius = '0';
          popup.style.oBorderRadius = '0';
          popup.style.boxShadow = 'none';
          popup.style.webkitBoxShadow = 'none';
          popup.style.mozBoxShadow = 'none';
          popup.style.msBoxShadow = 'none';
          popup.style.oBoxShadow = 'none';
          popup.style.filter = 'none';
          popup.style.webkitFilter = 'none';
          popup.style.mozFilter = 'none';
          popup.style.msFilter = 'none';
          popup.style.oFilter = 'none';
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

  const chapterMarkers = useMemo(() => {
    return chapters
      .map((chapter) => {
        const coords: [number, number] = [chapter.lat, chapter.lng];
        return { chapter, coords };
      })
      .filter(
        (item): item is { chapter: Chapter; coords: [number, number] } =>
          item.coords[0] !== 0 && item.coords[1] !== 0 // Filter out invalid coordinates
      );
  }, [chapters]);

  const bounds = useMemo(() => {
    if (chapterMarkers.length === 0) return null;
    const allCoords = chapterMarkers.map((m) => m.coords);

    return new L.LatLngBounds(allCoords);
  }, [chapterMarkers]);

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
        {chapterMarkers.map(({ chapter, coords }) => (
          <Marker key={chapter.name} position={coords} icon={CustomMarkerIcon}>
            <Popup>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold leading-tight text-black">
                    {chapter.name}
                  </h3>
                  <p className="text-sm font-semibold uppercase tracking-wide text-neutral-secondary">
                    {chapter.country}
                  </p>
                </div>
                {chapter.instagram && (
                  <div className="border-t-2 border-black pt-3">
                    <p className="text-sm font-medium text-neutral">
                      Instagram:{' '}
                      <a
                        href={`https://instagram.com/${chapter.instagram.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-red underline transition-colors duration-200 hover:text-primary"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {chapter.instagram}
                      </a>
                    </p>
                  </div>
                )}
                <button
                  onClick={() => onSelectChapter(chapter)}
                  className="w-full border-2 border-black bg-black px-4 py-2 text-sm font-bold text-white transition-all duration-200 hover:bg-black hover:shadow-brutal"
                >
                  View Chapter
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default ChapterMap;
