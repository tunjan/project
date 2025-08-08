import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { type User } from '@/types';
import StatsGrid from '@/components/dashboard/StatsGrid';
import BadgeList from '@/components/dashboard/BadgeList';
import DiscountTierProgress from '@/components/dashboard/DiscountTierProgress';
import ParticipationHistory from '@/components/dashboard/ParticipationHistory';
import { ChevronLeftIcon } from '@/icons';
import UserActivityChart from './UserActivityChart';
import CityAttendanceModal from './CityAttendanceModal';
import { useEvents } from '@/store/appStore';
import { getCityAttendanceForUser } from '@/utils/analytics';
import { getUserRoleDisplay } from '@/utils/user'; // IMPORT THE NEW UTILITY

interface PublicProfileProps {
  user: User;
}

const PublicProfile: React.FC<PublicProfileProps> = ({ user }) => {
  const navigate = useNavigate();
  const allEvents = useEvents();
  const [isCityModalOpen, setIsCityModalOpen] = useState(false);

  const cityAttendanceData = useMemo(
    () => getCityAttendanceForUser(user.id, allEvents),
    [user.id, allEvents]
  );

  return (
    <>
      {isCityModalOpen && (
        <CityAttendanceModal
          userName={user.name}
          attendanceData={cityAttendanceData}
          onClose={() => setIsCityModalOpen(false)}
        />
      )}
      <div className="animate-fade-in py-8 md:py-12">
        <button
          onClick={() => navigate(-1)} // Go back to the previous page
          className="mb-6 inline-flex items-center text-sm font-semibold text-primary transition hover:text-black"
        >
          <ChevronLeftIcon className="mr-1 h-5 w-5" /> Back
        </button>

        <div className="mb-8 flex flex-col items-center space-y-4 border border-black bg-white p-6 sm:flex-row sm:space-x-8 sm:space-y-0 md:p-8">
          <img
            src={user.profilePictureUrl}
            alt={user.name}
            className="h-24 w-24 border-2 border-black object-cover md:h-32 md:w-32"
          />
          <div className="text-center sm:text-left">
            <h1
              className="text-3xl font-extrabold text-black md:text-4xl"
              aria-label={`Public profile of ${user.name}`}
            >
              {user.name}
            </h1>
            <p
              className="text-lg text-neutral-600"
              aria-label="Role and affiliation"
            >
              {getUserRoleDisplay(user)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-8 lg:col-span-2">
            <section>
              <h2 className="mb-4 border-b-2 border-primary pb-2 text-2xl font-bold text-black">
                Activity Statistics
              </h2>
              {/* Set showPrivateStats to false to hide conversion data */}
              <StatsGrid
                stats={user.stats}
                showPrivateStats={false}
                onCityClick={() => setIsCityModalOpen(true)}
              />
            </section>
            <section>
              <h2 className="mb-4 border-b-2 border-primary pb-2 text-2xl font-bold text-black">
                Participation History
              </h2>
              <ParticipationHistory userId={user.id} />
            </section>
            {/* NEW SECTION FOR CHARTS */}
            <section>
              <h2 className="mb-4 border-b-2 border-primary pb-2 text-2xl font-bold text-black">
                Monthly Activity
              </h2>
              <UserActivityChart userId={user.id} />
            </section>
          </div>
          <div className="space-y-8 lg:col-span-1">
            <section>
              <h2 className="mb-4 border-b-2 border-primary pb-2 text-2xl font-bold text-black">
                Recognitions
              </h2>
              <BadgeList badges={user.badges} />
            </section>
            <section>
              <h2 className="mb-4 border-b-2 border-primary pb-2 text-2xl font-bold text-black">
                Reward Tier
              </h2>
              <DiscountTierProgress user={user} />
            </section>
          </div>
        </div>
      </div>
    </>
  );
};

export default PublicProfile;
