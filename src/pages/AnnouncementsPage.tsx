import React from 'react';
import { useNavigate } from 'react-router-dom';
import AnnouncementsPageComponent from '@/components/announcements/AnnouncementsPage';
import { type View } from '@/types';

const AnnouncementsPage: React.FC = () => {
  const navigate = useNavigate();

  const handleNavigate = (view: View) => {
    if (view === 'createAnnouncement') {
      navigate('/announcements/create');
    }
  };

  return <AnnouncementsPageComponent onNavigate={handleNavigate} />;
};

export default AnnouncementsPage;
