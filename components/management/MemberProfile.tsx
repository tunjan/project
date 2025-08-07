import React, { useState } from 'react';
import { type User, Role, type Chapter } from '../../types';
import StatsGrid from '../dashboard/StatsGrid';
import BadgeList from '../dashboard/BadgeList';
import DiscountTierProgress from '../dashboard/DiscountTierProgress';
import PromoteToOrganiserModal from './PromoteToOrganiserModal';
import EditChaptersModal from './EditChaptersModal';
import DeleteUserModal from './DeleteUserModal';
import { ChevronLeftIcon, PencilIcon, ShieldCheckIcon, UserGroupIcon, TrashIcon, HomeIcon } from '../icons';
import { getAssignableRoles, ROLE_HIERARCHY } from '../../utils/auth';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';

interface MemberProfileProps {
  user: User;
  onUpdateRole: (userId: string, role: Role) => void;
  onUpdateChapters: (userId: string, chapters: string[]) => void;
  onSetOrganiserChapters: (userId: string, chapters: string[]) => void;
  onIssueToken: (userId: string) => void;
  onDeleteUser: (userId: string) => void;
  onBack: () => void;
}

const MemberProfile: React.FC<MemberProfileProps> = ({ user, onUpdateRole, onUpdateChapters, onSetOrganiserChapters, onIssueToken, onDeleteUser, onBack }) => {
  const { currentUser } = useAuth();
  const { chapters } = useData();
  const [selectedRole, setSelectedRole] = useState<Role>(user.role);
  const [isManagementModalOpen, setManagementModalOpen] = useState(false);
  const [isEditChaptersModalOpen, setEditChaptersModalOpen] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);

  if (!currentUser) return null;

  const assignableRoles = getAssignableRoles(currentUser);
  
  const getSubtext = () => {
    if (user.role === Role.REGIONAL_ORGANISER && user.managedCountry) {
        return `${user.managedCountry} Regional Organiser`;
    }
    if (user.role === Role.CHAPTER_ORGANISER && user.organiserOf && user.organiserOf.length > 0) {
        return `Organiser of ${user.organiserOf.join(', ')}`;
    }
    if (user.chapters.length > 0) {
        return `${user.chapters.join(', ')} Chapter Member`;
    }
    return 'No chapter affiliation';
  }

  const handleSaveClick = () => {
    if (selectedRole === user.role) return;

    if (selectedRole === Role.CHAPTER_ORGANISER && ROLE_HIERARCHY[user.role] < ROLE_HIERARCHY[Role.CHAPTER_ORGANISER]) {
        // Promotion TO Chapter Organiser
        setManagementModalOpen(true);
    } else {
        // Any other role change (promotion or demotion)
        onUpdateRole(user.id, selectedRole);
    }
  };

  const handleConfirmOrganiserUpdate = (chaptersToOrganise: string[]) => {
      onSetOrganiserChapters(user.id, chaptersToOrganise);
      setManagementModalOpen(false);
  }
  
  const handleConfirmChapterUpdate = (newChapters: string[]) => {
      onUpdateChapters(user.id, newChapters);
      setEditChaptersModalOpen(false);
  }

  const canManageChapterOrganisers = assignableRoles.includes(Role.CHAPTER_ORGANISER);
  const canEditChapters = ROLE_HIERARCHY[currentUser.role] >= ROLE_HIERARCHY[Role.REGIONAL_ORGANISER];
  const canDeleteUser = ROLE_HIERARCHY[currentUser.role] > ROLE_HIERARCHY[user.role];

  return (
    <>
    {isManagementModalOpen && (
        <PromoteToOrganiserModal
            userToManage={user}
            onClose={() => setManagementModalOpen(false)}
            onConfirm={handleConfirmOrganiserUpdate}
        />
    )}
    {isEditChaptersModalOpen && (
        <EditChaptersModal
            user={user}
            allChapters={chapters}
            onClose={() => setEditChaptersModalOpen(false)}
            onSave={handleConfirmChapterUpdate}
        />
    )}
    {isDeleteModalOpen && (
        <DeleteUserModal
            user={user}
            onClose={() => setDeleteModalOpen(false)}
            onConfirm={() => {
                onDeleteUser(user.id);
                setDeleteModalOpen(false);
            }}
        />
    )}
    <div className="py-8 md:py-12 animate-fade-in">
      <div className="mb-6">
        <button onClick={onBack} className="inline-flex items-center text-sm font-semibold text-[#d81313] hover:text-black transition">
          <ChevronLeftIcon className="w-5 h-5 mr-1" />
          Back to Member Directory
        </button>
      </div>

       {/* User Profile Header from Dashboard */}
      <div className="border border-black bg-white mb-8">
        <div className="p-6 md:p-8 flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-8">
          <img
            src={user.profilePictureUrl}
            alt={user.name}
            className="w-24 h-24 md:w-32 md:h-32 object-cover rounded-none border-2 border-black"
          />
          <div className="text-center sm:text-left">
             <div className="flex items-center justify-center sm:justify-start">
                <h1 className="text-3xl md:text-4xl font-extrabold text-black">{user.name}</h1>
                {user.identityToken && <ShieldCheckIcon className="w-8 h-8 ml-2 text-[#d81313]" />}
            </div>
            <p className="text-lg text-neutral-600">{user.role}</p>
            <p className="text-sm text-neutral-500 mt-1">{getSubtext()}</p>
             {user.instagram && (
                <p className="text-sm text-neutral-500 mt-1">
                    <a href={`https://instagram.com/${user.instagram}`} target="_blank" rel="noopener noreferrer" className="font-semibold text-[#d81313] hover:underline">@{user.instagram}</a>
                </p>
            )}
             {user.hostingAvailability && (
                <p className="text-sm text-neutral-500 mt-1 font-semibold flex items-center justify-center sm:justify-start">
                    <HomeIcon className="w-4 h-4 mr-1.5 text-black"/>
                    Available to host {user.hostingCapacity} {user.hostingCapacity === 1 ? 'person' : 'people'}.
                </p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
            <section>
                <h2 className="text-2xl font-bold text-black border-b-2 border-[#d81313] pb-2 mb-4">Activity Statistics</h2>
                <StatsGrid stats={user.stats} />
            </section>
            <section>
                <h2 className="text-2xl font-bold text-black border-b-2 border-[#d81313] pb-2 mb-4">Recognitions</h2>
                <BadgeList badges={user.badges} />
            </section>
        </div>
        <div className="lg:col-span-1 space-y-8">
            <section>
                <h2 className="text-2xl font-bold text-black border-b-2 border-[#d81313] pb-2 mb-4">Reward Tier</h2>
                <DiscountTierProgress user={user} />
            </section>

            <section>
                <h2 className="text-2xl font-bold text-black border-b-2 border-[#d81313] pb-2 mb-4">Manage User</h2>
                 <div className="bg-white border border-black p-6 space-y-4">
                    <div className="flex items-center">
                        <PencilIcon className="w-5 h-5 mr-3 text-black" />
                        <h3 className="text-lg font-bold text-black">Assign Role</h3>
                    </div>
                    
                    <div>
                        <label htmlFor="role-select" className="block text-sm font-bold text-black mb-1">User Role</label>
                        <select 
                             id="role-select" 
                             value={selectedRole}
                             onChange={(e) => setSelectedRole(e.target.value as Role)}
                             className="block w-full border border-black bg-white p-2 text-black focus:ring-0 sm:text-sm"
                        >
                            <option value={user.role} disabled>{user.role} (Current)</option>
                            {assignableRoles.map(r => (
                               <option key={r} value={r}>{r}</option>
                            ))}
                        </select>
                    </div>

                    <button 
                        onClick={handleSaveClick}
                        disabled={selectedRole === user.role}
                        className="w-full bg-[#d81313] text-white font-bold py-2 px-4 hover:bg-[#b81010] transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Save Role
                    </button>
                    
                    {user.role === Role.CHAPTER_ORGANISER && canManageChapterOrganisers && (
                        <button
                            onClick={() => setManagementModalOpen(true)}
                            className="w-full bg-black text-white font-bold py-2 px-4 hover:bg-neutral-800 transition-colors duration-300"
                        >
                            Edit Organised Chapters
                        </button>
                    )}
                 </div>
            </section>
             {canEditChapters && (
                <section>
                    <h2 className="text-2xl font-bold text-black border-b-2 border-[#d81313] pb-2 mb-4">Chapter Memberships</h2>
                    <div className="bg-white border border-black p-6 space-y-4">
                        <div className="flex items-center">
                            <UserGroupIcon className="w-5 h-5 mr-3 text-black" />
                            <h3 className="text-lg font-bold text-black">Chapters</h3>
                        </div>
                        <div className="text-sm text-black">
                            {user.chapters.length > 0 ? user.chapters.join(', ') : 'Not a member of any chapter.'}
                        </div>
                        <button
                            onClick={() => setEditChaptersModalOpen(true)}
                            className="w-full bg-black text-white font-bold py-2 px-4 hover:bg-neutral-800 transition-colors duration-300"
                        >
                            Edit Chapters
                        </button>
                    </div>
                </section>
             )}
            <section>
                <h2 className="text-2xl font-bold text-black border-b-2 border-[#d81313] pb-2 mb-4">Identity Verification</h2>
                 <div className="bg-white border border-black p-6 space-y-4">
                    <div className="flex items-center">
                        <ShieldCheckIcon className="w-5 h-5 mr-3 text-black" />
                        <h3 className="text-lg font-bold text-black">Cryptographic ID</h3>
                    </div>
                    {user.identityToken ? (
                        <div className="text-center bg-neutral-100 border border-black p-4">
                            <p className="font-bold text-black">Token Issued</p>
                            <p className="text-xs text-neutral-600 break-all">Public Key: {user.identityToken.publicKey.substring(0,24)}...</p>
                        </div>
                    ) : (
                         <button 
                            onClick={() => onIssueToken(user.id)}
                            className="w-full bg-black text-white font-bold py-2 px-4 hover:bg-neutral-800 transition-colors duration-300"
                        >
                            Issue Identity Token
                        </button>
                    )}
                 </div>
            </section>
             <section>
                <h2 className="text-2xl font-bold text-black border-b-2 border-[#d81313] pb-2 mb-4">Danger Zone</h2>
                <div className="bg-white border-2 border-[#d81313] p-6">
                    <div className="flex items-start">
                        <div className="flex-shrink-0">
                            <TrashIcon className="w-6 h-6 text-[#d81313]" />
                        </div>
                        <div className="ml-4 flex-grow">
                             <h3 className="text-lg font-bold text-black">Delete this user</h3>
                             <p className="text-sm text-neutral-600 mt-1">Once you delete a user, there is no going back. Please be certain.</p>
                        </div>
                        <div className="ml-4">
                             <button
                                onClick={() => setDeleteModalOpen(true)}
                                disabled={!canDeleteUser}
                                className="bg-[#d81313] text-white font-bold py-2 px-4 hover:bg-[#b81010] transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Delete User
                            </button>
                        </div>
                    </div>
                     {!canDeleteUser && (
                        <p className="text-xs text-neutral-500 mt-2 text-right">You do not have permission to delete this user.</p>
                    )}
                </div>
            </section>
        </div>
      </div>
    </div>
    </>
  );
};

export default MemberProfile;
