import React, { useState } from "react";
import { type User, Role, OnboardingStatus } from "../../types";
import StatsGrid from "./StatsGrid";
import BadgeList from "./BadgeList";
import DiscountTierProgress from "./DiscountTierProgress";
import QrCodeModal from "./QrCodeModal";
import ParticipationHistory from "./ParticipationHistory";
import EditProfileModal from "./EditProfileModal";
import HostingDashboard from "./HostingDashboard";
import {
  QrCodeIcon,
  ShieldCheckIcon,
  PencilIcon,
  HomeIcon,
  InformationCircleIcon,
} from "../icons";
import { useData } from "../../contexts/DataContext";

interface DashboardProps {
  user: User;
}

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const { updateProfile } = useData();
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const getSubtext = () => {
    if (user.role === Role.REGIONAL_ORGANISER && user.managedCountry) {
      return `${user.managedCountry} Regional Organiser`;
    }
    if (
      user.role === Role.CHAPTER_ORGANISER &&
      user.organiserOf &&
      user.organiserOf.length > 0
    ) {
      return `Organiser of ${user.organiserOf.join(", ")}`;
    }
    if (user.chapters.length > 0) {
      return `${user.chapters.join(", ")} Chapter Member`;
    }
    return "No chapter affiliation";
  };

  const handleSaveProfile = (updatedData: {
    name: string;
    instagram: string;
    hostingAvailability: boolean;
    hostingCapacity: number;
  }) => {
    updateProfile(user.id, updatedData);
    setIsEditModalOpen(false);
    alert("Profile updated successfully.");
  };

  return (
    <>
      {isQrModalOpen && user.identityToken && (
        <QrCodeModal
          token={user.identityToken}
          onClose={() => setIsQrModalOpen(false)}
        />
      )}
      {isEditModalOpen && (
        <EditProfileModal
          user={user}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleSaveProfile}
        />
      )}
      <div className="py-8 md:py-12">
        {/* Verification Banner */}
        {user.onboardingStatus === "Awaiting Verification" && (
          <div
            className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-8"
            role="alert"
          >
            <div className="flex">
              <div className="py-1">
                <InformationCircleIcon className="h-6 w-6 text-yellow-500 mr-4" />
              </div>
              <div>
                <p className="font-bold">Account Pending Final Verification</p>
                <p className="text-sm">
                  Your application has been approved. To gain full access,
                  please meet a Chapter Organizer in person to have your
                  identity verified and receive your cryptographic ID.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* User Profile Header */}
        <div className=" bg-white mb-8">
          <div className="flex flex-col sm:flex-row items-start">
            <img
              src={user.profilePictureUrl}
              alt={user.name}
              className="w-24 h-24 md:w-32 md:h-32 object-cover rounded-none border-2 border-black flex-shrink-0"
            />
            <div className="flex-grow text-center sm:text-left mt-4 sm:mt-0 sm:ml-8">
              <div className="flex items-center justify-center sm:justify-start">
                <h1 className="text-3xl md:text-4xl font-extrabold text-black">
                  {user.name}
                </h1>
                {user.identityToken && (
                  <ShieldCheckIcon className="w-8 h-8 ml-2 text-[#d81313]" />
                )}
              </div>
              <p className="text-lg text-neutral-600">{user.role}</p>
              <p className="text-sm text-neutral-500 mt-1">{getSubtext()}</p>
              {user.instagram && (
                <p className="text-sm text-neutral-500 mt-1">
                  <a
                    href={`https://instagram.com/${user.instagram}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-[#d81313] hover:underline"
                  >
                    @{user.instagram}
                  </a>
                </p>
              )}
              {user.hostingAvailability && (
                <p className="text-sm text-neutral-500 mt-1 font-semibold flex items-center justify-center sm:justify-start">
                  Available to host {user.hostingCapacity}{" "}
                  {user.hostingCapacity === 1 ? "person" : "people"}
                </p>
              )}
            </div>
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="flex-shrink-0 mt-4 sm:mt-0 sm:ml-4 flex items-center bg-black text-white font-bold py-2 px-3 hover:bg-neutral-800 transition-colors duration-300"
            >
              <PencilIcon className="w-4 h-4 mr-2" />
              Edit Profile
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Stats Section */}
            <section>
              <h2 className="text-2xl font-bold text-black border-b-2 border-[#d81313] pb-2 mb-4">
                Activity Statistics
              </h2>
              <StatsGrid stats={user.stats} />
            </section>

            {/* Participation History */}
            <section>
              <h2 className="text-2xl font-bold text-black border-b-2 border-[#d81313] pb-2 mb-4">
                Participation History
              </h2>
              <ParticipationHistory userId={user.id} />
            </section>
          </div>

          <div className="lg:col-span-1 space-y-8">
            {/* Badges Section */}
            <section>
              <h2 className="text-2xl font-bold text-black border-b-2 border-[#d81313] pb-2 mb-4">
                Recognitions
              </h2>
              <BadgeList badges={user.badges} />
            </section>

            {/* Discount Tier Section */}
            <section>
              <h2 className="text-2xl font-bold text-black border-b-2 border-[#d81313] pb-2 mb-4">
                Reward Tier
              </h2>
              <DiscountTierProgress user={user} />
            </section>

            {/* Hosting Dashboard */}
            <section>
              <h2 className="text-2xl font-bold text-black border-b-2 border-[#d81313] pb-2 mb-4">
                Hosting
              </h2>
              <HostingDashboard />
            </section>

            {/* Verified Identity Section */}
            {user.identityToken && (
              <section>
                <h2 className="text-2xl font-bold text-black border-b-2 border-[#d81313] pb-2 mb-4">
                  Verified Identity
                </h2>
                <div className="bg-white border border-black p-6">
                  <div className="flex items-center border-b border-black pb-4 mb-4">
                    <ShieldCheckIcon className="w-6 h-6 mr-3 text-black" />
                    <h3 className="text-lg font-bold text-black">
                      Verified Activist
                    </h3>
                  </div>
                  <p className="text-sm text-neutral-600 mb-4">
                    Your identity is cryptographically verified. Show this QR
                    code to an organizer for in-person verification.
                  </p>
                  <button
                    onClick={() => setIsQrModalOpen(true)}
                    className="w-full flex items-center justify-center bg-[#d81313] text-white font-bold py-2 px-4 hover:bg-[#b81010] transition-colors duration-300"
                  >
                    <QrCodeIcon className="w-5 h-5 mr-2" />
                    Show QR Code
                  </button>
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
