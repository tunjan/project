import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MemberProfile from '@/components/management/MemberProfile';
import { useUsers } from '@/store';

const MemberProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const user = useUsers().find((u) => u.id === userId);

  if (!user) {
    return <div className="py-16 text-center">User not found.</div>;
  }

  return <MemberProfile user={user} onBack={() => navigate('/manage')} />;
};

export default MemberProfilePage;
