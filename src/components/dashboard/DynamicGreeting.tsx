import React from 'react';
import { useCurrentUser } from '@/store/auth.store';
import { useEvents, useOutreachLogs } from '@/store';
import { CubeEvent, OutreachLog } from '@/types';
import { isTomorrow, isToday } from 'date-fns';

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};

const DynamicGreeting: React.FC = () => {
  const currentUser = useCurrentUser();
  const events = useEvents();
  const outreachLogs = useOutreachLogs();

  const upcomingEvent = events
    .filter((e: CubeEvent) => new Date(e.startDate) >= new Date())
    .sort((a: CubeEvent, b: CubeEvent) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())[0];

  const weeklyConversations = outreachLogs.filter((log: OutreachLog) => {
    const logDate = new Date(log.createdAt);
    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    return logDate >= startOfWeek && log.userId === currentUser?.id;
  }).length;

  const renderMessage = () => {
    if (upcomingEvent) {
      const eventDate = new Date(upcomingEvent.startDate);
      if (isTomorrow(eventDate)) {
        return `Ready for your cube in ${upcomingEvent.city} tomorrow?`;
      } 
      if (isToday(eventDate)) {
        return `Hope your cube in ${upcomingEvent.city} is going well!`;
      }
    }

    if (weeklyConversations > 0) {
      return `You've logged ${weeklyConversations} conversations this week, great work!`;
    }

    return `${getGreeting()}, ${currentUser?.name}!`
  };

  return (
    <div className="flex h-full items-center justify-center bg-black text-white p-4">
      <h1 className="text-center text-2xl md:text-3xl font-bold">{renderMessage()}</h1>
    </div>
  );
};

export default DynamicGreeting;
