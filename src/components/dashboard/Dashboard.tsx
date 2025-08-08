import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { type User } from '@/types';
import StatsGrid from './StatsGrid';
import BadgeList from './BadgeList';
import DiscountTierProgress from './DiscountTierProgress';
import ParticipationHistory from './ParticipationHistory';
import EditProfileModal from './EditProfileModal';
import HostingDashboard from './HostingDashboard';
import QRCode from 'qrcode.react';
import { toast } from 'sonner';
import {
  PencilIcon,
  InformationCircleIcon,
  ChatBubbleLeftRightIcon,
  MapIcon,
} from '@/icons';
import { useAppActions, useEvents } from '@/store/appStore';
import UserActivityChart from '@/components/profile/UserActivityChart';
import CityAttendanceModal from '@/components/profile/CityAttendanceModal';
import { getCityAttendanceForUser } from '@/utils/analytics';
import { getUserRoleDisplay } from '@/utils/user';

interface DashboardProps {
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

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const navigate = useNavigate();
  const { updateProfile } = useAppActions();
  const allEvents = useEvents();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCityModalOpen, setIsCityModalOpen] = useState(false);

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

  return (
    <>
      {isEditModalOpen && (
        <EditProfileModal
          user={user}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleSaveProfile}
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
        {user.onboardingStatus === 'Awaiting Verification' && (
          <div
            className="shadow-brutal mb-8 border-2 border-black bg-yellow-300 p-4"
            role="alert"
          >
            <div className="flex flex-col items-center gap-4 md:flex-row">
              <div className="flex-shrink-0">
                <InformationCircleIcon className="h-10 w-10 text-black" />
              </div>
              <div className="flex-grow text-center text-black md:text-left">
                <p className="font-extrabold">ACCOUNT PENDING VERIFICATION</p>
                <p className="text-sm">
                  To gain full access, meet a Chapter Organizer and have them
                  scan this QR code to confirm your identity.
                </p>
              </div>
              <div className="flex-shrink-0 border-2 border-black bg-white p-2">
                <QRCode
                  value={`${window.location.origin}/verify/${user.id}`}
                  size={100}
                  level="H"
                  includeMargin={false}
                />
              </div>
            </div>
          </div>
        )}

        {/* User Profile Header */}
        <div className="card-brutal mb-12 flex items-center gap-6 p-6 md:gap-8">
          <img
            src={user.profilePictureUrl}
            alt={user.name}
            className="border-brutal h-24 w-24 flex-shrink-0 object-cover md:h-32 md:w-32"
          />
          <div className="flex-grow">
            <p className="text-lg font-bold text-primary">
              {getUserRoleDisplay(user)}
            </p>
            <h1 className="text-3xl font-extrabold text-black md:text-5xl">
              {user.name}
            </h1>
            {user.instagram && (
              <a
                href={`https://instagram.com/${user.instagram}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-neutral-600 hover:text-primary hover:underline"
              >
                @{user.instagram}
              </a>
            )}
          </div>
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="border-brutal group flex h-14 w-14 flex-shrink-0 items-center justify-center bg-black transition-colors hover:bg-primary"
            aria-label="Edit Profile"
          >
            <PencilIcon className="h-6 w-6 text-white" />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-8 lg:col-span-2">
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

            <section>
              <h2 className="h-section">Activity Statistics</h2>
              <StatsGrid
                stats={user.stats}
                showPrivateStats={true}
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

            <section>
              <h2 className="h-section">Hosting</h2>
              <HostingDashboard />
            </section>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
