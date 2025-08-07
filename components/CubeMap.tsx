import React, { useEffect, useRef } from 'react';
import { type CubeEvent, type Chapter } from '../types';

// Since Leaflet is loaded from a CDN, we need to declare the `L` variable globally.
declare const L: any;

interface CubeMapProps {
  events: CubeEvent[];
  chapters: Chapter[];
  onSelectCube: (event: CubeEvent) => void;
}

const getEventCoords = (event: CubeEvent, chapters: Chapter[]): { lat: number; lng: number } | null => {
    const chapter = chapters.find(c => c.name === event.city);
    return chapter ? { lat: chapter.lat, lng: chapter.lng } : null;
};

const CustomMarkerIcon = L.divIcon({
    html: `<div class="w-4 h-4 bg-[#d81313] border-2 border-black"></div>`,
    className: '', // important to clear default styling
    iconSize: [16, 16],
    iconAnchor: [8, 8],
});

const CubeMap: React.FC<CubeMapProps> = ({ events, chapters, onSelectCube }) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstance = useRef<any>(null);

    useEffect(() => {
        if (mapRef.current && !mapInstance.current) {
            mapInstance.current = L.map(mapRef.current, {
                scrollWheelZoom: false,
            }).setView([20, 0], 2); // Default view

            L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
                subdomains: 'abcd',
                maxZoom: 20
            }).addTo(mapInstance.current);
        }

        // Cleanup function to remove map instance on component unmount
        return () => {
            if (mapInstance.current) {
                mapInstance.current.remove();
                mapInstance.current = null;
            }
        };
    }, []);

    useEffect(() => {
        if (mapInstance.current) {
            // Clear existing markers
            mapInstance.current.eachLayer((layer: any) => {
                if (layer instanceof L.Marker) {
                    mapInstance.current.removeLayer(layer);
                }
            });

            const eventMarkers: any[] = [];
            events.forEach(event => {
                const coords = getEventCoords(event, chapters);
                if (coords) {
                    const marker = L.marker([coords.lat, coords.lng], { icon: CustomMarkerIcon })
                        .addTo(mapInstance.current);
                    
                    const popupContent = `
                        <div style="font-family: 'Libre Franklin', sans-serif;">
                           <h3 style="font-weight: 800; font-size: 1rem; margin: 0 0 4px 0; color: #000;">${event.location}</h3>
                           <p style="margin: 0; font-size: 0.8rem; color: #6b7280;">${event.city}</p>
                           <p style="margin: 4px 0; font-size: 0.8rem; color: #333333;">${event.dateTime.toLocaleString([], {dateStyle: 'medium', timeStyle: 'short'})}</p>
                           <button id="popup-btn-${event.id}" style="width:100%; border:none; cursor:pointer; margin-top: 8px; padding: 4px 8px; background-color: #d81313; color: white; font-weight: bold;">View Details</button>
                        </div>
                    `;

                    marker.bindPopup(popupContent);
                    eventMarkers.push(marker);
                }
            });
            
             mapInstance.current.on('popupopen', (e: any) => {
                const content = e.popup.getContent();
                if (typeof content !== 'string') return;

                const match = content.match(/id="popup-btn-(.*?)"/);
                if (!match) return;

                const eventId = match[1];
                const btn = document.getElementById(`popup-btn-${eventId}`);
                if (btn) {
                    btn.onclick = () => {
                        const eventToSelect = events.find(ev => ev.id === eventId);
                        if(eventToSelect) {
                            onSelectCube(eventToSelect);
                        }
                    };
                }
            });

            if (eventMarkers.length > 0) {
                const group = L.featureGroup(eventMarkers);
                mapInstance.current.fitBounds(group.getBounds().pad(0.3));
            } else {
                 mapInstance.current.setView([20, 0], 2); // Reset to default if no events
            }
        }
    }, [events, chapters, onSelectCube]);


    return (
        <div className="border border-black bg-white">
            <div ref={mapRef} style={{ height: '600px', width: '100%' }} />
        </div>
    );
};

export default CubeMap;