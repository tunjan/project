import React from 'react';
import { useEvents } from '@/store';
import { useNavigate } from 'react-router-dom';

interface ParticipationHistoryProps {
  userId: string;
}

const ParticipationHistory: React.FC<ParticipationHistoryProps> = ({
  userId,
}) => {
  const navigate = useNavigate();
  const allEvents = useEvents();

  const userHistory = allEvents
    .filter(
      (event) =>
        event.participants.some((p) => p.user.id === userId) &&
        new Date(event.startDate) < new Date()
    )
    .sort(
      (a, b) =>
        new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
    )
    .slice(0, 10);

  if (userHistory.length === 0) {
    return (
      <div className="card-brutal p-6 text-center">
        <p className="text-white">
          No participation history found. Attend a Cube to get started!
        </p>
      </div>
    );
  }

  return (
    <div className="card-brutal">
      <ul className="divide-y-2 divide-black">
        {userHistory.map((event) => {
          const participation = event.participants.find(
            (p) => p.user.id === userId
          )!;
          const formattedDate = new Date(event.startDate).toLocaleDateString(
            undefined,
            {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
            }
          );

          return (
            <li key={event.id}>
              <button
                onClick={() => navigate(`/cubes/${event.id}`)}
                className="flex w-full items-center justify-between space-x-4 p-4 text-left transition-colors hover:bg-white"
              >
                <div>
                  <p className="font-bold text-black">{event.location}</p>
                  <p className="text-sm text-neutral-500">{event.city}</p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-sm font-medium text-black">
                    {formattedDate}
                  </p>
                  <p className="text-xs font-semibold text-white">
                    {participation.user.role}
                  </p>
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default ParticipationHistory;
