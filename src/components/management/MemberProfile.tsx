import React, { useState } from "react";
import { type User, Role } from "@/types";
import { useCurrentUser } from "@/store/auth.store";
import { useChapters, useDataActions } from "@/store/data.store";
import { getAssignableRoles, ROLE_HIERARCHY } from "@/utils/auth";
import StatsGrid from "@/components/dashboard/StatsGrid";
import BadgeList from "@/components/dashboard/BadgeList";
import DiscountTierProgress from "@/components/dashboard/DiscountTierProgress";
import PromoteToOrganiserModal from "./PromoteToOrganiserModal";
import EditChaptersModal from "./EditChaptersModal";
import DeleteUserModal from "./DeleteUserModal";
import { ChevronLeftIcon, PencilIcon } from "@/icons";

interface MemberProfileProps {
  user: User;
  onBack: () => void;
}

const MemberProfile: React.FC<MemberProfileProps> = ({ user, onBack }) => {
  const currentUser = useCurrentUser();
  const allChapters = useChapters();
  const {
    updateUserRole,
    setChapterOrganiser,
    issueIdentityToken,
    deleteUser,
    updateUserChapters,
  } = useDataActions();

  const [selectedRole, setSelectedRole] = useState<Role>(user.role);
  const [isPromoteModalOpen, setPromoteModalOpen] = useState(false);
  const [isEditChaptersModalOpen, setEditChaptersModalOpen] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);

  if (!currentUser) return null;

  const assignableRoles = getAssignableRoles(currentUser);

  const getSubtext = () => {
    if (user.role === Role.REGIONAL_ORGANISER && user.managedCountry)
      return `${user.managedCountry} Regional Organiser`;
    if (
      user.role === Role.CHAPTER_ORGANISER &&
      user.organiserOf &&
      user.organiserOf.length > 0
    )
      return `Organiser of ${user.organiserOf.join(", ")}`;
    if (user.chapters.length > 0)
      return `${user.chapters.join(", ")} Chapter Member`;
    return "No chapter affiliation";
  };

  const handleSaveRole = () => {
    if (selectedRole === user.role) return;
    if (
      selectedRole === Role.CHAPTER_ORGANISER &&
      ROLE_HIERARCHY[user.role] < ROLE_HIERARCHY[Role.CHAPTER_ORGANISER]
    ) {
      setPromoteModalOpen(true);
    } else {
      updateUserRole(user.id, selectedRole);
    }
  };

  const handleConfirmOrganiserUpdate = (chaptersToOrganise: string[]) => {
    setChapterOrganiser(user.id, chaptersToOrganise);
    setPromoteModalOpen(false);
  };

  const handleConfirmChapterUpdate = (newChapters: string[]) => {
    updateUserChapters(user.id, newChapters);
    setEditChaptersModalOpen(false);
  };

  const handleConfirmDelete = () => {
    deleteUser(user.id);
    setDeleteModalOpen(false);
    onBack();
  };

  const canEditChapters =
    ROLE_HIERARCHY[currentUser.role] >= ROLE_HIERARCHY[Role.REGIONAL_ORGANISER];
  const canDeleteUser =
    ROLE_HIERARCHY[currentUser.role] > ROLE_HIERARCHY[user.role];

  return (
    <>
      {isPromoteModalOpen && (
        <PromoteToOrganiserModal
          userToManage={user}
          onClose={() => setPromoteModalOpen(false)}
          onConfirm={handleConfirmOrganiserUpdate}
        />
      )}
      {isEditChaptersModalOpen && (
        <EditChaptersModal
          user={user}
          allChapters={allChapters}
          onClose={() => setEditChaptersModalOpen(false)}
          onSave={handleConfirmChapterUpdate}
        />
      )}
      {isDeleteModalOpen && (
        <DeleteUserModal
          user={user}
          onClose={() => setDeleteModalOpen(false)}
          onConfirm={handleConfirmDelete}
        />
      )}
      <div className="py-8 md:py-12 animate-fade-in">
        <button
          onClick={onBack}
          className="inline-flex items-center text-sm font-semibold text-primary hover:text-black transition mb-6"
        >
          <ChevronLeftIcon className="w-5 h-5 mr-1" /> Back to Member Directory
        </button>

        <div className="border border-black bg-white mb-8 p-6 md:p-8 flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-8">
          <img
            src={user.profilePictureUrl}
            alt={user.name}
            className="w-24 h-24 md:w-32 md:h-32 object-cover border-2 border-black"
          />
          <div className="text-center sm:text-left">
            <h1 className="text-3xl md:text-4xl font-extrabold text-black">
              {user.name}
            </h1>
            <p className="text-lg text-neutral-600">{getSubtext()}</p>
            {user.identityToken && (
              <button
                onClick={() => issueIdentityToken(user.id)}
                className="mt-2 text-xs font-semibold text-white bg-black px-2 py-1 hover:bg-neutral-800"
              >
                Re-Issue Identity Token
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-black border-b-2 border-primary pb-2 mb-4">
                Activity Statistics
              </h2>
              <StatsGrid stats={user.stats} />
            </section>
            <section>
              <h2 className="text-2xl font-bold text-black border-b-2 border-primary pb-2 mb-4">
                Recognitions
              </h2>
              <BadgeList badges={user.badges} />
            </section>
            <section>
              <h2 className="text-2xl font-bold text-black border-b-2 border-primary pb-2 mb-4">
                Reward Tier
              </h2>
              <DiscountTierProgress user={user} />
            </section>
          </div>
          <div className="lg:col-span-1 space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-black border-b-2 border-primary pb-2 mb-4">
                Manage User
              </h2>
              <div className="bg-white border border-black p-6 space-y-4">
                <div className="flex items-center">
                  <PencilIcon className="w-5 h-5 mr-3 text-black" />
                  <h3 className="text-lg font-bold text-black">Assign Role</h3>
                </div>
                <select
                  id="role-select"
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as Role)}
                  className="block w-full border border-black bg-white p-2 text-black"
                >
                  <option value={user.role} disabled>
                    {user.role} (Current)
                  </option>
                  {assignableRoles.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleSaveRole}
                  disabled={selectedRole === user.role}
                  className="w-full bg-primary text-white font-bold py-2 px-4 hover:bg-primary-hover disabled:opacity-50"
                >
                  Save Role
                </button>

                {canEditChapters && (
                  <button
                    onClick={() => setEditChaptersModalOpen(true)}
                    className="mt-2 w-full text-sm font-semibold text-black border border-black py-2 px-4 hover:bg-neutral-100"
                  >
                    Edit Chapter Memberships
                  </button>
                )}
              </div>
            </section>
            <section>
              <h2 className="text-2xl font-bold text-black border-b-2 border-primary pb-2 mb-4">
                Danger Zone
              </h2>
              <div className="bg-white border-2 border-primary p-6">
                <h3 className="text-lg font-bold text-black">Delete User</h3>
                <p className="text-sm text-neutral-600 mt-1">
                  This action is permanent and cannot be undone.
                </p>
                <button
                  onClick={() => setDeleteModalOpen(true)}
                  disabled={!canDeleteUser}
                  className="mt-4 w-full bg-primary text-white font-bold py-2 px-4 hover:bg-primary-hover disabled:opacity-50"
                >
                  Delete User
                </button>
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  );
};

export default MemberProfile;
