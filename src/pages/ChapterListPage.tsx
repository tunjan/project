import React from 'react';
import { useNavigate } from 'react-router-dom';
import ChapterListComponent from '@/components/chapters/ChapterList';
import { type Chapter } from '@/types';

const ChapterListPage: React.FC = () => {
  const navigate = useNavigate();

  const handleNavigateToChapter = (chapter: Chapter) => {
    navigate(`/chapters/${chapter.name}`);
  };

  return <ChapterListComponent onNavigateToChapter={handleNavigateToChapter} />;
};

export default ChapterListPage;
