import React, { useState } from 'react';
import Header from './components/Header';
import CubeList from './components/CubeList';
import CubeDetail from './components/CubeDetail';
import Dashboard from './components/dashboard/Dashboard';
import ManagementDashboard from './components/management/ManagementDashboard';
import Login from './components/auth/Login';
import SignUp from './components/auth/SignUp';
import CreateCubeForm from './components/events/CreateCubeForm';
import MemberProfile from './components/management/MemberProfile';
import ManageEventForm from './components/events/ManageEventForm';
import AnnouncementsPage from './components/announcements/AnnouncementsPage';
import CreateAnnouncementForm from './components/announcements/CreateAnnouncementForm';
import ResourcesPage from './components/resources/ResourcesPage';
import AnalyticsDashboard from './components/analytics/AnalyticsDashboard';
import OutreachLogPage from './components/outreach/OutreachLogPage';
import ChapterList from './components/chapters/ChapterList';
import ChapterDetailPage from './components/chapters/ChapterDetailPage';
import { type CubeEvent, type User, type OnboardingAnswers, Role, type View, type EventReport, type Announcement, AnnouncementScope, type Chapter, type Notification } from './types';
import { hasOrganizerRole, getAssignableRoles, ROLE_HIERARCHY } from './utils/auth';
import { useAuth } from './contexts/AuthContext';
import { useData } from './contexts/DataContext';
import { useNotifications } from './contexts/NotificationContext';


const App: React.FC = () => {
  const [view, setView] = useState<View>('cubes');
  const [selectedCube, setSelectedCube] = useState<CubeEvent | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedEventForManagement, setSelectedEventForManagement] = useState<CubeEvent | null>(null);
  const [selectedChapterForDetail, setSelectedChapterForDetail] = useState<Chapter | null>(null);

  const { currentUser, login, logout } = useAuth();
  const data = useData();

  const handleNavigate = (newView: View) => {
    setView(newView);
    setSelectedCube(null);
    setSelectedUser(null);
    setSelectedEventForManagement(null);
    setSelectedChapterForDetail(null);
    window.scrollTo(0, 0);
  };
  
  const handleLogin = (user: User) => {
    login(user);
    handleNavigate('dashboard');
  };
  
  const handleLogout = () => {
    logout();
    handleNavigate('cubes');
  };

  const handleRegister = (formData: { name: string; instagram: string; chapter: string; answers: OnboardingAnswers }) => {
    data.register(formData);
    alert('Application submitted! An organizer will review it shortly.');
    handleNavigate('login');
  };

  const handleSelectCube = (cube: CubeEvent) => {
    setSelectedCube(cube);
    window.scrollTo(0, 0);
  };

  const handleDeselectCube = () => {
    setSelectedCube(null);
    window.scrollTo(0, 0);
  };

  const handleCreateEvent = (eventData: Omit<CubeEvent, 'id' | 'organizer' | 'participants' | 'status'>) => {
    if (!currentUser || !hasOrganizerRole(currentUser)) return;
    data.createEvent(eventData, currentUser);
    handleNavigate('cubes');
  };

  const handleRsvp = (eventId: string) => {
    if (!currentUser) {
        handleNavigate('login');
        return;
    };
    const updatedEvent = data.rsvp(eventId, currentUser);
    if (updatedEvent && selectedCube?.id === eventId) {
        setSelectedCube(updatedEvent);
    }
  };

  const handleCancelRsvp = (eventId: string) => {
    if (!currentUser) return;
    const updatedEvent = data.cancelRsvp(eventId, currentUser);
    if (updatedEvent && selectedCube?.id === eventId) {
        setSelectedCube(updatedEvent);
    }
  };

  const handleSelectUser = (user: User) => {
    setSelectedUser(user);
    setView('memberProfile');
    window.scrollTo(0, 0);
  };

  const handleUpdateUserRole = (userId: string, role: Role) => {
    if (!currentUser) return;
    const assignableRoles = getAssignableRoles(currentUser);
    if (!assignableRoles.includes(role)) {
      alert(`You do not have permission to assign the role: ${role}.`);
      return;
    }
    const updatedUser = data.updateUserRole(userId, role);
    if (updatedUser && selectedUser?.id === userId) {
        setSelectedUser(updatedUser);
    }
    alert(`User role updated to ${role}.`);
  };
  
  const handleUpdateUserChapters = (userId: string, newChapters: string[]) => {
     if (!currentUser || ROLE_HIERARCHY[currentUser.role] < ROLE_HIERARCHY[Role.REGIONAL_ORGANISER]) {
          alert('You do not have permission to perform this action.');
          return;
      }
      const updatedUser = data.updateUserChapters(userId, newChapters);
      if (updatedUser && selectedUser?.id === userId) {
          setSelectedUser(updatedUser);
      }
      alert(`User chapter memberships updated.`);
  }

  const handleSetChapterOrganiser = (userId: string, chaptersToOrganise: string[]) => {
      if (!currentUser || ROLE_HIERARCHY[currentUser.role] < ROLE_HIERARCHY[Role.REGIONAL_ORGANISER]) {
          alert('You do not have permission to perform this action.');
          return;
      }
      const userBeforeUpdate = data.users.find(u => u.id === userId);
      const isPromotion = userBeforeUpdate?.role !== Role.CHAPTER_ORGANISER;
      const updatedUser = data.setChapterOrganiser(userId, chaptersToOrganise);
      if (updatedUser && selectedUser?.id === userId) {
          setSelectedUser(updatedUser);
      }
      const actionText = isPromotion ? 'promoted to' : 'assignments updated for';
      alert(`User has been ${actionText} Chapter Organiser of ${chaptersToOrganise.join(', ')}.`);
  };

  const handleNavigateToManageEvent = (event: CubeEvent) => {
    setSelectedEventForManagement(event);
    setView('manageEvent');
  };

  const handleLogEventReport = (eventId: string, report: EventReport) => {
    const updatedEvent = data.logEventReport(eventId, report);
    alert('Event report submitted successfully! Attendee stats have been updated.');
    handleNavigate('cubes');
    if (updatedEvent) {
        setSelectedCube(updatedEvent);
    }
  };

   const handleCreateAnnouncement = (formData: { title: string; content: string; scope: AnnouncementScope; target?: string }) => {
    if (!currentUser) return;
    if (formData.scope === AnnouncementScope.CHAPTER && currentUser.role === Role.CHAPTER_ORGANISER) {
        if (!formData.target || !currentUser.organiserOf?.includes(formData.target)) {
            alert('You can only post announcements to chapters you organize.'); return;
        }
    }
    if (formData.scope === AnnouncementScope.REGIONAL && currentUser.role === Role.REGIONAL_ORGANISER) {
        if (!formData.target || currentUser.managedCountry !== formData.target) {
            alert('You can only post announcements to the country you manage.'); return;
        }
    }
    data.createAnnouncement(formData, currentUser);
    handleNavigate('announcements');
  };
  
  const handleIssueIdentityToken = (userId: string) => {
    const userToUpdate = data.users.find(u => u.id === userId);
    if (!userToUpdate || !currentUser || !hasOrganizerRole(currentUser)) {
        alert("Operation not permitted."); return;
    }
    const updatedUser = data.issueIdentityToken(userId);
    if (updatedUser && selectedUser?.id === userId) {
        setSelectedUser(updatedUser);
    }
    alert(`Identity token issued for ${userToUpdate.name}. They are now a Confirmed Activist.`);
  };

  const handleDeleteUser = (userIdToDelete: string) => {
    if (!currentUser) return;
    const userToDelete = data.users.find(u => u.id === userIdToDelete);
    if (!userToDelete) { alert("User not found."); return; }
    if (ROLE_HIERARCHY[currentUser.role] <= ROLE_HIERARCHY[userToDelete.role]) {
      alert("You do not have permission to delete this user."); return;
    }
    data.deleteUser(userIdToDelete, currentUser);
    alert(`User ${userToDelete.name} has been deleted.`);
    handleNavigate('management');
  };

  const handleNavigateToChapter = (chapter: Chapter) => {
    setSelectedChapterForDetail(chapter);
    setView('chapterDetail');
    window.scrollTo(0, 0);
  }

  const { markAsRead } = useNotifications();
  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    handleNavigate(notification.linkTo);
  };

  const renderContent = () => {
    if (!currentUser) {
        if (view === 'signup') return <SignUp onRegister={handleRegister} onNavigateLogin={() => handleNavigate('login')} />;
        if (view === 'login') return <Login onLogin={handleLogin} />;
    }
    
    if (currentUser) {
      switch (view) {
        case 'dashboard':
          return <Dashboard user={currentUser} />;
        case 'management':
          return <ManagementDashboard onSelectUser={handleSelectUser} />;
        case 'analytics':
          if (hasOrganizerRole(currentUser)) return <AnalyticsDashboard />;
          handleNavigate('dashboard');
          return null;
        case 'chapters':
            return <ChapterList onNavigateToChapter={handleNavigateToChapter} />;
        case 'chapterDetail':
            if (selectedChapterForDetail) return <ChapterDetailPage chapter={selectedChapterForDetail} onBack={() => handleNavigate('chapters')} />;
            handleNavigate('chapters');
            return null;
        case 'announcements':
            return <AnnouncementsPage onNavigate={handleNavigate} />;
        case 'outreach': 
            return <OutreachLogPage />;
        case 'resources':
            return <ResourcesPage />;
        case 'createAnnouncement':
            return <CreateAnnouncementForm onCreate={handleCreateAnnouncement} onCancel={() => handleNavigate('announcements')} />;
        case 'createCube':
            return <CreateCubeForm onCreateEvent={handleCreateEvent} onCancel={() => handleNavigate('cubes')} />;
        case 'memberProfile':
            if (selectedUser) {
                return <MemberProfile 
                    user={selectedUser}
                    onUpdateRole={handleUpdateUserRole}
                    onUpdateChapters={handleUpdateUserChapters}
                    onSetOrganiserChapters={handleSetChapterOrganiser}
                    onIssueToken={handleIssueIdentityToken}
                    onDeleteUser={handleDeleteUser}
                    onBack={() => handleNavigate('management')}
                />
            }
            handleNavigate('management');
            return null;
        case 'manageEvent':
            if(selectedEventForManagement){
                return <ManageEventForm 
                    event={selectedEventForManagement}
                    onLogReport={handleLogEventReport}
                    onCancel={() => {
                        handleNavigate('cubes');
                        setSelectedCube(selectedEventForManagement);
                    }}
                />
            }
            handleNavigate('cubes');
            return null;
        case 'cubes':
        default:
           return selectedCube ? (
              <CubeDetail 
                event={selectedCube} 
                onBack={handleDeselectCube} 
                onRsvp={handleRsvp}
                onCancelRsvp={handleCancelRsvp}
                onManageEvent={handleNavigateToManageEvent}
              />
            ) : (
              <CubeList 
                onSelectCube={handleSelectCube} 
                onNavigate={handleNavigate}
              />
            );
      }
    }
    
    return selectedCube ? (
      <CubeDetail 
        event={selectedCube} 
        onBack={handleDeselectCube}
        onRsvp={() => handleNavigate('login')}
        onCancelRsvp={() => {}}
        onManageEvent={() => {}}
       />
    ) : (
      <CubeList 
        onSelectCube={handleSelectCube}
        onNavigate={handleNavigate}
      />
    );
  };

  return (
    <div className="min-h-screen bg-white">
      <Header 
        currentView={view}
        onNavigate={handleNavigate} 
        onLogout={handleLogout}
        onNotificationClick={handleNotificationClick}
      />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-fade-in">
        {renderContent()}
      </main>
      <footer className="bg-black mt-12 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-white/70">
          <p>&copy; {new Date().getFullYear()} Vegan Action Hub. All rights reserved.</p>
          <p className="mt-1">For a world where all animals are free.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;