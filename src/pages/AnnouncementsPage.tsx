import React from 'react';
import { useNavigate } from 'react-router-dom';

import AnnouncementsPageComponent from '@/components/announcements/AnnouncementsPage';

const AnnouncementsPage: React.FC = () => {
  const navigate = useNavigate();

  const handleCreate = () => {
    navigate('/announcements/create');
  };

  return <AnnouncementsPageComponent onCreate={handleCreate} />;
};

export default AnnouncementsPage;
