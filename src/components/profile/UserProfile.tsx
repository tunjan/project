import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { type User, OnboardingStatus } from '@/types';
import StatsGrid from '@/components/dashboard/StatsGrid';
import BadgeList from '@/components/dashboard/BadgeList';
import DiscountTierProgress from '@/components/dashboard/DiscountTierProgress';
import ParticipationHistory from '@/components/dashboard/ParticipationHistory';
import EditProfileModal from '@/components/dashboard/EditProfileModal';
import DeactivateAccountModal from '@/components/dashboard/DeactivateAccountModal';
import HostingDashboard from '@/components/dashboard/HostingDashboard';
import BadgeAwardsDashboard from '@/components/dashboard/BadgeAwardsDashboard';
import Avatar from '@/components/ui/Avatar';
// QR flow deprecated
import { toast } from 'sonner';
import {
  PencilIcon,
  ChatBubbleLeftRightIcon,
  MapIcon,
  ChevronLeftIcon,
  ShieldCheckIcon,
} from '@/icons';
import { useUsersActions, useEvents, useBadgeAwardsForUser } from '@/store';
import { useCurrentUser } from '@/store';
import UserActivityChart from '@/components/profile/UserActivityChart';
import CityAttendanceModal from '@/components/profile/CityAttendanceModal';
import { getCityAttendanceForUser } from '@/utils/analytics';
import { getUserRoleDisplay } from '@/utils/user';

interface UserProfileProps {
  user: User;
}

const QuickActionButton: React.FC<{
  icon: React.ReactNode;
  text: string;
  onClick: () => void;
}> = ({ icon, text, onClick }) => (
  <button
    onClick={onClick}
    className="card-brutal-hover flex h-full w-full flex-col items-center justify-center p-6 text-center"
  >
    <div className="text-primary">{icon}</div>
    <p className="mt-2 text-lg font-bold text-black">{text}</p>
  </button>
);

const UserProfile: React.FC<UserProfileProps> = ({ user }) => {
  const navigate = useNavigate();
  const currentUser = useCurrentUser();
  const { updateProfile, deleteUser } = useUsersActions();
  const allEvents = useEvents();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);
  const [isCityModalOpen, setIsCityModalOpen] = useState(false);

  // CONSOLIDATED LOGIC: This boolean now controls all view variations.
  const isOwnProfile = currentUser?.id === user.id;

  const pendingAwards = useBadgeAwardsForUser(currentUser?.id);

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
    setIsEditModalOpen(false); // Close edit modal
    setIsDeactivateModalOpen(true); // Open deactivate modal
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

  const handleAvatarChange = (newImageUrl: string) => {
    updateProfile(user.id, {
      name: user.name,
      instagram: user.instagram || '',
      hostingAvailability: user.hostingAvailability,
      hostingCapacity: user.hostingCapacity || 1,
      profilePictureUrl: newImageUrl,
    });
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
        />
      )}
      {isCityModalOpen && (
        <CityAttendanceModal
          userName={user.name}
          attendanceData={cityAttendanceData}
          onClose={() => setIsCityModalOpen(false)}
        />
      )}
      <div className="py-8 md:py-12">
        {/* Verification banner removed with new onboarding pipeline */}

        {/* BACK BUTTON (PUBLIC/MANAGEMENT VIEW ONLY) */}
        {!isOwnProfile && (
          <button
            onClick={() => navigate(-1)}
            className="mb-6 inline-flex items-center text-sm font-semibold text-primary transition hover:text-black"
          >
            <ChevronLeftIcon className="mr-1 h-5 w-5" /> Back
          </button>
        )}

        {/* HEADER SECTION */}
        <div className="card-brutal mb-12 flex flex-col items-center gap-6 p-6 text-center sm:flex-row sm:text-left md:gap-8">
          <div className="flex flex-col items-center">
            <Avatar
              src={user.profilePictureUrl}
              alt={user.name}
              className="border-brutal h-24 w-24 flex-shrink-0 object-cover md:h-32 md:w-32"
              editable={isOwnProfile}
              onImageChange={handleAvatarChange}
            />
            {isOwnProfile && (
              <p className="mt-2 text-center text-xs text-white">
                Click to upload new avatar
              </p>
            )}
          </div>
          <div className="flex-grow">
            <p className="text-lg font-bold text-primary">
              {getUserRoleDisplay(user)}
            </p>
            <h1 className="flex items-center gap-2 text-3xl font-extrabold text-black md:text-5xl">
              {user.name}
              {user.onboardingStatus === OnboardingStatus.CONFIRMED && (
                <span
                  className="inline-flex items-center gap-1 rounded bg-green-100 px-2 py-1 text-sm font-bold text-green-700"
                  title="Verified activist"
                >
                  <ShieldCheckIcon className="h-5 w-5" /> Verified
                </span>
              )}
            </h1>
            {user.instagram && (
              <a
                href={`https://instagram.com/${user.instagram}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-red font-semibold hover:text-primary hover:underline"
              >
                @{user.instagram}
              </a>
            )}
          </div>
          {/* EDIT BUTTON (OWNER ONLY) */}
          {isOwnProfile && (
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="border-brutal group flex h-14 w-14 flex-shrink-0 items-center justify-center bg-black transition-colors hover:bg-primary"
              aria-label="Edit Profile"
            >
              <PencilIcon className="h-6 w-6 text-white" />
            </button>
          )}
        </div>

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
                <h2 className="h-section">Quick Actions</h2>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <QuickActionButton
                    icon={<MapIcon className="h-10 w-10" />}
                    text="Find a Cube"
                    onClick={() => navigate('/cubes')}
                  />
                  <QuickActionButton
                    icon={<ChatBubbleLeftRightIcon className="h-10 w-10" />}
                    text="Log Outreach"
                    onClick={() => navigate('/outreach')}
                  />
                </div>
              </section>
            )}

            <section>
              <h2 className="h-section">Activity Statistics</h2>
              <StatsGrid
                stats={user.stats}
                showPrivateStats={isOwnProfile}
                onCityClick={() => setIsCityModalOpen(true)}
              />
            </section>

            <section>
              <h2 className="h-section">Participation History</h2>
              <ParticipationHistory userId={user.id} />
            </section>

            <section>
              <h2 className="h-section">Monthly Activity</h2>
              <UserActivityChart userId={user.id} />
            </section>
          </div>

          <div className="space-y-8 lg:col-span-1">
            <section>
              <h2 className="h-section">Recognitions</h2>
              <BadgeList badges={user.badges} />
            </section>

            <section>
              <h2 className="h-section">Reward Tier</h2>
              <DiscountTierProgress user={user} />
            </section>

            {/* HOSTING DASHBOARD (OWNER ONLY) */}
            {isOwnProfile && (
              <section>
                <h2 className="h-section">Hosting</h2>
                <HostingDashboard />
              </section>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default UserProfile;
