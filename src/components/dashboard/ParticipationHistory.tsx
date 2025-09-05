import React from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useEvents } from '@/store';

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
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">
            No participation history found. Attend a Cube to get started!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <ul className="divide-y divide-border">
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
                <Button
                  onClick={() => navigate(`/cubes/${event.id}`)}
                  variant="ghost"
                  className="flex h-auto w-full justify-between space-x-4 p-4"
                >
                  <div className="text-left">
                    <p className="font-bold text-foreground">
                      {event.location}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {event.city}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-foreground">
                      {formattedDate}
                    </p>
                    <p className="text-xs font-semibold text-muted-foreground">
                      {participation.user.role}
                    </p>
                  </div>
                </Button>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
};

export default ParticipationHistory;
