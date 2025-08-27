import React from 'react';
import Modal from '@/components/ui/Modal';

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
    <Modal
      title="City Attendance"
      description={`Events attended by ${userName} in each city.`}
      onClose={onClose}
    >
      {attendanceData.length > 0 ? (
        <div className="-m-6 max-h-[60vh] flex-grow overflow-y-auto bg-white">
          <ul className="divide-y divide-black">
            {attendanceData.map(({ city, count }) => (
              <li key={city} className="flex items-center justify-between p-4">
                <span className="font-bold text-black">{city}</span>
                <span className="rounded-none bg-black px-2 py-1 text-sm font-semibold text-white">
                  {count} {count === 1 ? 'visit' : 'visits'}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="flex h-full items-center justify-center p-8 text-center">
          <p className="text-white0">
            No city attendance data is available yet.
          </p>
        </div>
      )}
    </Modal>
  );
};

export default CityAttendanceModal;
