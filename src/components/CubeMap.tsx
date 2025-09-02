import React, { useMemo } from 'react';

import { LeafletMap, type MapMarker } from '@/components/ui';
import { type Chapter, type CubeEvent } from '@/types';

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
  const markers: MapMarker[] = useMemo(() => {
    return events
      .map((event) => {
        // Find the chapter for this event to get coordinates
        const chapter = chapters.find((c) => c.name === event.city);
        if (!chapter) return null;

        const coords: [number, number] = [chapter.lat, chapter.lng];
        return {
          position: coords,
          key: event.id,
          popupContent: (
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
                className="w-full border-black bg-black px-4 py-2 text-sm font-bold text-white hover:bg-black hover:shadow-brutal md:border-2"
              >
                {popupActionText}
              </button>
            </div>
          ),
        };
      })
      .filter(
        (marker): marker is NonNullable<typeof marker> =>
          marker !== null &&
          marker.position[0] !== 0 &&
          marker.position[1] !== 0 // Filter out invalid coordinates
      );
  }, [events, chapters, onSelectCube, popupActionText]);

  return <LeafletMap markers={markers} height="600px" />;
};

export default CubeMap;
