import {
  ChevronLeft,
  Map,
  MessageCircle,
  Pencil,
  ShieldCheck,
} from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import BadgeAwardsDashboard from '@/components/dashboard/BadgeAwardsDashboard';
import BadgeList from '@/components/dashboard/BadgeList';
import DeactivateAccountModal from '@/components/dashboard/DeactivateAccountModal';
import DiscountTierProgress from '@/components/dashboard/DiscountTierProgress';
import EditProfileModal from '@/components/dashboard/EditProfileModal';
import HostingDashboard from '@/components/dashboard/HostingDashboard';
import ParticipationHistory from '@/components/dashboard/ParticipationHistory';
import StatsGrid from '@/components/dashboard/StatsGrid';
import CityAttendanceModal from '@/components/profile/CityAttendanceModal';
import UserActivityChart from '@/components/profile/UserActivityChart';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useBadgeAwardsForUser, useEvents, useUsersActions } from '@/store';
import { useCurrentUser } from '@/store';
import { OnboardingStatus, type User } from '@/types';
import { getCityAttendanceForUser } from '@/utils';
import { getUserRoleDisplay } from '@/utils';

interface UserProfileProps {
  user: User;
}

const QuickActionButton: React.FC<{
  icon: React.ReactNode;
  text: string;
  onClick: () => void;
}> = ({ icon, text, onClick }) => (
  <Card className="cursor-pointer transition-all duration-200 hover:shadow-md">
    <CardContent
      className="flex size-full flex-col items-center justify-center p-6 text-center"
      onClick={onClick}
    >
      <div className="text-primary">{icon}</div>
      <p className="mt-2 text-lg font-semibold text-foreground">{text}</p>
    </CardContent>
  </Card>
);

const UserProfile: React.FC<UserProfileProps> = ({ user }) => {
  const navigate = useNavigate();
  const currentUser = useCurrentUser();
  const { updateProfile, deleteUser } = useUsersActions();
  const allEvents = useEvents();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);
  const [isCityModalOpen, setIsCityModalOpen] = useState(false);

  const isOwnProfile = currentUser?.id === user.id;

  const allBadgeAwards = useBadgeAwardsForUser(currentUser?.id);

  const pendingAwards = useMemo(() => {
    if (!currentUser?.id) return [];
    return allBadgeAwards.filter(
      (award) =>
        award.recipient.id === currentUser.id && award.status === 'Pending'
    );
  }, [allBadgeAwards, currentUser?.id]);

  const cityAttendanceData = useMemo(
    () => getCityAttendanceForUser(user.id, allEvents),
    [user.id, allEvents]
  );

  const handleSaveProfile = (updatedData: {
    name: string;
    instagram: string;
    hostingAvailability: boolean;
    hostingCapacity: number;
    profilePictureUrl: string;
  }) => {
    updateProfile(user.id, updatedData);
    setIsEditModalOpen(false);
    toast.success('Profile updated successfully.');
  };

  const handleDeactivateInitiation = () => {
    setIsEditModalOpen(false);
    setIsDeactivateModalOpen(true);
  };

  const handleDeactivateConfirm = async () => {
    if (!currentUser) return;
    try {
      await deleteUser(currentUser.id);
      toast.success('Your account has been permanently deleted.');
      setIsDeactivateModalOpen(false);
    } catch (error) {
      console.error('Failed to delete account:', error);
      toast.error('Failed to delete your account. Please try again.');
    }
  };

  return (
    <>
      {/* MODAL LOGIC (OWNER ONLY) */}
      {isOwnProfile && isEditModalOpen && (
        <EditProfileModal
          user={user}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleSaveProfile}
          onDeactivate={handleDeactivateInitiation}
        />
      )}
      {isOwnProfile && isDeactivateModalOpen && (
        <DeactivateAccountModal
          user={user}
          onClose={() => setIsDeactivateModalOpen(false)}
          onConfirm={handleDeactivateConfirm}
          isOpen={isDeactivateModalOpen}
        />
      )}
      {isCityModalOpen && (
        <CityAttendanceModal
          userName={user.name}
          attendanceData={cityAttendanceData}
          onClose={() => setIsCityModalOpen(false)}
        />
      )}
      <div className="min-h-screen bg-background">
        <div className="container mx-auto max-w-7xl px-4 py-8">
          {/* BACK BUTTON (PUBLIC/MANAGEMENT VIEW ONLY) */}
          {!isOwnProfile && (
            <Button
              onClick={() => navigate(-1)}
              variant="ghost"
              className="mb-6 inline-flex items-center"
            >
              <ChevronLeft className="mr-1 size-5" /> Back
            </Button>
          )}

          {/* HEADER SECTION */}
          <Card className="mb-8">
            <CardContent className="p-8">
              <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:text-left md:gap-8">
                <div className="flex flex-col items-center">
                  <Avatar className="size-24 shrink-0 md:size-32">
                    <AvatarImage
                      src={user.profilePictureUrl}
                      alt={user.name}
                      className="object-cover"
                    />
                    <AvatarFallback className="text-2xl">
                      {user.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </AvatarFallback>
                  </Avatar>
                  {isOwnProfile && (
                    <p className="mt-2 text-center text-xs text-muted-foreground">
                      Click to upload new avatar
                    </p>
                  )}
                </div>
                <div className="grow">
                  <p className="text-lg font-semibold text-primary">
                    {getUserRoleDisplay(user)}
                  </p>
                  <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight text-foreground md:text-5xl">
                    {user.name}
                  </h1>
                  {user.instagram && (
                    <a
                      href={`https://instagram.com/${user.instagram.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center text-sm font-semibold text-muted-foreground hover:text-primary hover:underline"
                    >
                      {user.instagram}
                    </a>
                  )}
                  {user.onboardingStatus === OnboardingStatus.CONFIRMED && (
                    <span
                      className="mt-4 inline-flex items-center gap-1 rounded bg-green-100 px-2 py-1 text-sm font-semibold text-green-700"
                      title="Verified activist"
                    >
                      <ShieldCheck className="size-5" /> Verified
                    </span>
                  )}
                </div>
                {/* EDIT BUTTON (OWNER ONLY) */}
                {isOwnProfile && (
                  <Button
                    onClick={() => setIsEditModalOpen(true)}
                    size="icon"
                    className="size-14 shrink-0"
                    aria-label="Edit Profile"
                  >
                    <Pencil className="size-6" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
          <Separator className="mb-8" />

          {/* MAIN CONTENT GRID */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="space-y-8 lg:col-span-2">
              {/* PENDING AWARDS (OWNER ONLY) */}
              {isOwnProfile && (
                <BadgeAwardsDashboard pendingAwards={pendingAwards} />
              )}

              {/* QUICK ACTIONS (OWNER ONLY) */}
              {isOwnProfile && (
                <section>
                  <h2 className="mb-6 text-xl font-semibold text-foreground">
                    Quick Actions
                  </h2>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <QuickActionButton
                      icon={<Map className="size-10" />}
                      text="Find a Cube"
                      onClick={() => navigate('/cubes')}
                    />
                    <QuickActionButton
                      icon={<MessageCircle className="size-10" />}
                      text="Log Outreach"
                      onClick={() => navigate('/outreach')}
                    />
                  </div>
                </section>
              )}

              <section>
                <h2 className="mb-6 text-xl font-semibold text-foreground">
                  Activity Statistics
                </h2>
                <StatsGrid
                  stats={user.stats}
                  showPrivateStats={isOwnProfile}
                  onCityClick={() => setIsCityModalOpen(true)}
                />
              </section>

              <section>
                <h2 className="mb-6 text-xl font-semibold text-foreground">
                  Participation History
                </h2>
                <ParticipationHistory userId={user.id} />
              </section>

              <section>
                <h2 className="mb-6 text-xl font-semibold text-foreground">
                  Monthly Activity
                </h2>
                <UserActivityChart userId={user.id} />
              </section>
            </div>

            <div className="space-y-8 lg:col-span-1">
              <section>
                <h2 className="mb-6 text-xl font-semibold text-foreground">
                  Recognitions
                </h2>
                <BadgeList badges={user.badges} />
              </section>

              <section>
                <h2 className="mb-6 text-xl font-semibold text-foreground">
                  Reward Tier
                </h2>
                <DiscountTierProgress user={user} />
              </section>

              {/* HOSTING DASHBOARD (OWNER ONLY) */}
              {isOwnProfile && (
                <section>
                  <h2 className="mb-6 text-xl font-semibold text-foreground">
                    Hosting
                  </h2>
                  <HostingDashboard />
                </section>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UserProfile;
