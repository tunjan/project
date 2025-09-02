import React, { useMemo } from 'react';

import { LeafletMap, type MapMarker } from '@/components/ui';
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
                <h3 className="text-lg font-bold leading-tight text-black">
                  {chapter.name}
                </h3>
                <p className="text-neutral-secondary text-sm font-semibold uppercase tracking-wide">
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
                className="w-full border-black bg-black px-4 py-2 text-sm font-bold text-white hover:bg-black hover:shadow-brutal md:border-2"
              >
                {popupActionText}
              </button>
            </div>
          ),
        };
      })
      .filter((marker) => marker.position[0] !== 0 && marker.position[1] !== 0); // Filter out invalid coordinates
  }, [chapters, onSelectChapter, popupActionText]);

  return <LeafletMap markers={markers} height="600px" />;
};

export default ChapterMap;
