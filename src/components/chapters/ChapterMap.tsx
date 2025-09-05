import React, { useMemo } from 'react';

import { LeafletMap, type MapMarker } from '@/components/ui';
import { Button } from '@/components/ui/button';
import { type Chapter } from '@/types';

interface ChapterMapProps {
  chapters: Chapter[];
  onSelectChapter: (chapter: Chapter) => void;
  popupActionText?: string;
}

const ChapterMap: React.FC<ChapterMapProps> = ({
  chapters,
  onSelectChapter,
  popupActionText = 'View Chapter',
}) => {
  const markers: MapMarker[] = useMemo(() => {
    return chapters
      .map((chapter) => {
        const coords: [number, number] = [chapter.lat, chapter.lng];
        return {
          position: coords,
          key: chapter.name,
          popupContent: (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold leading-tight text-foreground">
                  {chapter.name}
                </h3>
                <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  {chapter.country}
                </p>
              </div>
              {chapter.instagram && (
                <div className="border-t border-border pt-3">
                  <p className="text-sm font-medium text-foreground">
                    Instagram:{' '}
                    <a
                      href={`https://instagram.com/${chapter.instagram.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline transition-colors duration-200 hover:text-primary/80"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {chapter.instagram}
                    </a>
                  </p>
                </div>
              )}
              <Button
                onClick={() => onSelectChapter(chapter)}
                className="w-full"
                size="sm"
              >
                {popupActionText}
              </Button>
            </div>
          ),
        };
      })
      .filter((marker) => marker.position[0] !== 0 && marker.position[1] !== 0);
  }, [chapters, onSelectChapter, popupActionText]);

  return <LeafletMap markers={markers} height="600px" />;
};

export default ChapterMap;
