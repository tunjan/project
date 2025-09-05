import React from 'react';

import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface CityAttendanceData {
  city: string;
  count: number;
}

interface CityAttendanceModalProps {
  userName: string;
  attendanceData: CityAttendanceData[];
  onClose: () => void;
}

const CityAttendanceModal: React.FC<CityAttendanceModalProps> = ({
  userName,
  attendanceData,
  onClose,
}) => {
  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>City Attendance</DialogTitle>
          <DialogDescription>
            Events attended by {userName} in each city.
          </DialogDescription>
        </DialogHeader>
        {attendanceData.length > 0 ? (
          <div className="max-h-[60vh] overflow-y-auto">
            <ul className="divide-y divide-border">
              {attendanceData.map(({ city, count }) => (
                <li
                  key={city}
                  className="flex items-center justify-between p-4"
                >
                  <span className="font-bold">{city}</span>
                  <Badge variant="default">
                    {count} {count === 1 ? 'visit' : 'visits'}
                  </Badge>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="flex h-full items-center justify-center p-8 text-center">
            <p className="text-muted-foreground">
              No city attendance data is available yet.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CityAttendanceModal;
