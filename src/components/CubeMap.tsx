import React, { useMemo } from 'react';

import { LeafletMap, type MapMarker } from '@/components/ui';
import { Button } from '@/components/ui/button';
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
        const chapter = chapters.find((c) => c.name === event.city);
        if (!chapter) return null;

        const coords: [number, number] = [chapter.lat, chapter.lng];
        return {
          position: coords,
          key: event.id,
          popupContent: (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold leading-tight">
                  {event.name}
                </h3>
                <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  {event.city}
                </p>
                <p className="text-sm text-muted-foreground">
                  {new Date(event.startDate).toLocaleDateString()}
                </p>
              </div>
              <Button onClick={() => onSelectCube(event)} className="w-full">
                {popupActionText}
              </Button>
            </div>
          ),
        };
      })
      .filter(
        (marker): marker is NonNullable<typeof marker> =>
          marker !== null &&
          marker.position[0] !== 0 &&
          marker.position[1] !== 0
      );
  }, [events, chapters, onSelectCube, popupActionText]);

  return <LeafletMap markers={markers} height="600px" />;
};

export default CubeMap;
