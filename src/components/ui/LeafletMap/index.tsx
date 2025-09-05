import { Loader2 } from 'lucide-react';
import React, { lazy, Suspense } from 'react';

import { Card } from '@/components/ui/card';

import MapErrorBoundary from './MapErrorBoundary';

const LazyMapComponent = lazy(() => import('./MapComponent'));

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

const LeafletMap: React.FC<LeafletMapProps> = (props) => {
  return (
    <MapErrorBoundary
      fallback={
        <Card
          className={`${props.className || ''} relative z-30 w-full overflow-hidden`}
          style={{ height: props.height || '600px' }}
        >
          <div className="flex h-full items-center justify-center bg-muted/20">
            <div className="text-center">
              <p className="mb-2 text-lg font-medium text-foreground">
                Map temporarily unavailable
              </p>
              <p className="text-sm text-muted-foreground">
                Please try refreshing the page
              </p>
            </div>
          </div>
        </Card>
      }
    >
      <Suspense
        fallback={
          <Card
            className={`${props.className || ''} relative z-30 w-full overflow-hidden`}
            style={{ height: props.height || '600px' }}
          >
            <div className="flex h-full items-center justify-center bg-muted/50">
              <div className="text-center">
                <Loader2 className="mx-auto mb-4 size-8 animate-spin text-muted-foreground" />
                <p className="text-muted-foreground">Loading map...</p>
              </div>
            </div>
          </Card>
        }
      >
        <LazyMapComponent {...props} />
      </Suspense>
    </MapErrorBoundary>
  );
};

export default LeafletMap;
