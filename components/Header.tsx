import React, { useState, useRef, useEffect } from 'react';
import { type View, type Notification } from '../types';
import { hasOrganizerRole } from '../utils/auth';
import { LoginIcon, LogoutIcon, UserAddIcon, MegaphoneIcon, BookOpenIcon, ChartBarIcon, ShieldCheckIcon, ClipboardListIcon, BellIcon, BuildingOfficeIcon, MenuIcon, XIcon, ChevronDownIcon } from './icons';
import NotificationPopover from './header/NotificationPopover';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';


interface HeaderProps {
  currentView: View;
  onNavigate: (view: View) => void;
  onLogout: () => void;
  onNotificationClick: (notification: Notification) => void;
}

const NavButton: React.FC<{
  onClick: () => void;
  isActive: boolean;
  children: React.ReactNode;
}> = ({ onClick, isActive, children }) => (
  <button
    onClick={onClick}
    className={`flex items-center space-x-2 px-3 py-2 text-sm font-semibold transition-colors duration-200 ${
      isActive
        ? 'text-black border-b-2 border-[#d81313]'
        : 'text-neutral-500 hover:text-black'
    }`}
  >
    {children}
  </button>
);

const AuthButton: React.FC<{
    onClick: () => void;
    children: React.ReactNode;
    isRed?: boolean;
}> = ({ onClick, children, isRed = false }) => (
    <button
        onClick={onClick}
        className={`flex items-center space-x-2 px-3 py-1.5 text-sm font-semibold border border-black transition-colors duration-200 ${
            isRed
             ? 'bg-[#d81313] text-white hover:bg-[#b81010]'
             : 'bg-white text-black hover:bg-neutral-100'
        }`}
    >
        {children}
    </button>
);

const MobileNavButton: React.FC<{
    onClick: () => void;
    isActive: boolean;
    children: React.ReactNode;
}> = ({ onClick, isActive, children }) => (
    <button
        onClick={onClick}
        className={`flex items-center space-x-3 w-full text-left px-4 py-3 text-base font-semibold transition-colors duration-200 ${
            isActive ? 'bg-neutral-100 text-black' : 'text-neutral-600 hover:bg-neutral-50'
        }`}
    >
        {children}
    </button>
);

const DropdownItem: React.FC<{
    onClick: () => void;
    isActive: boolean;
    children: React.ReactNode;
}> = ({ onClick, isActive, children }) => (
    <button
        onClick={onClick}
        className={`flex items-center w-full text-left px-4 py-2 text-sm font-semibold transition-colors duration-200 ${
            isActive ? 'bg-neutral-100 text-black' : 'text-neutral-600 hover:bg-neutral-100'
        }`}
    >
        {children}
    </button>
);


const Header: React.FC<HeaderProps> = ({ currentView, onNavigate, onLogout, onNotificationClick }) => {
  const { currentUser } = useAuth();
  const { notifications, getUnreadCount, markAllAsRead } = useNotifications();

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  
  const moreMenuRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  const unreadCount = currentUser ? getUnreadCount(currentUser.id) : 0;
  
  const handleNotificationToggle = () => {
    setIsNotificationsOpen(prev => !prev);
    setIsMobileMenuOpen(false);
    setIsMoreMenuOpen(false);
  };
  
  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(prev => !prev);
    setIsNotificationsOpen(false);
    setIsMoreMenuOpen(false);
  }

  const handleMoreMenuToggle = () => {
      setIsMoreMenuOpen(prev => !prev);
      setIsMobileMenuOpen(false);
      setIsNotificationsOpen(false);
  }

  const handleNavigateAndCloseMenus = (view: View) => {
    onNavigate(view);
    setIsMobileMenuOpen(false);
    setIsMoreMenuOpen(false);
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
        setIsMoreMenuOpen(false);
      }
      // This is a simplified popover handler; for multiple popovers, more complex logic is needed
      // but for now, let's keep it specific to the 'More' menu.
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const isMoreMenuActive = ['outreach', 'resources', 'management', 'analytics', 'memberProfile'].includes(currentView);

  return (
    <header className="bg-white sticky top-0 z-20 border-b border-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-6">
            <button onClick={() => onNavigate('cubes')} className="text-2xl font-bold text-black tracking-tighter">
              AV
            </button>
            {currentUser && (
               <nav className="hidden lg:flex items-center space-x-1">
                <NavButton onClick={() => onNavigate('cubes')} isActive={currentView === 'cubes'}>
                  <span>Cubes</span>
                </NavButton>
                 <NavButton onClick={() => onNavigate('chapters')} isActive={currentView === 'chapters' || currentView === 'chapterDetail'}>
                  <span>Chapters</span>
                </NavButton>
                 <NavButton onClick={() => onNavigate('announcements')} isActive={currentView === 'announcements' || currentView === 'createAnnouncement'}>
                  <span>Announcements</span>
                </NavButton>
                <NavButton onClick={() => onNavigate('dashboard')} isActive={currentView === 'dashboard'}>
                  <span>Dashboard</span>
                </NavButton>

                <div className="relative" ref={moreMenuRef}>
                    <NavButton onClick={handleMoreMenuToggle} isActive={isMoreMenuActive}>
                        <span>More</span>
                        <ChevronDownIcon className="w-4 h-4 ml-1" />
                    </NavButton>
                    {isMoreMenuOpen && (
                        <div className="absolute top-full mt-2 w-56 bg-white border border-black shadow-lg z-30 right-0 animate-fade-in">
                            <div className="py-1">
                                <DropdownItem onClick={() => handleNavigateAndCloseMenus('outreach')} isActive={currentView === 'outreach'}>
                                    <ClipboardListIcon className="w-4 h-4 mr-3" />
                                    <span>Outreach Log</span>
                                </DropdownItem>
                                <DropdownItem onClick={() => handleNavigateAndCloseMenus('resources')} isActive={currentView === 'resources'}>
                                    <BookOpenIcon className="w-4 h-4 mr-3" />
                                    <span>Resources</span>
                                </DropdownItem>
                                {hasOrganizerRole(currentUser) && (
                                    <div className="border-t border-neutral-200 my-1">
                                        <DropdownItem onClick={() => handleNavigateAndCloseMenus('management')} isActive={currentView === 'management' || currentView === 'memberProfile'}>
                                            <ShieldCheckIcon className="w-4 h-4 mr-3" />
                                            <span>Management</span>
                                        </DropdownItem>
                                        <DropdownItem onClick={() => handleNavigateAndCloseMenus('analytics')} isActive={currentView === 'analytics'}>
                                            <ChartBarIcon className="w-4 h-4 mr-3" />
                                            <span>Analytics</span>
                                        </DropdownItem>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

              </nav>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {currentUser ? (
              <>
                <div className="relative">
                    <button onClick={handleNotificationToggle} className="relative p-2 rounded-none hover:bg-neutral-100">
                        <BellIcon className="h-6 w-6"/>
                        {unreadCount > 0 && (
                            <span className="absolute top-1.5 right-1.5 flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#d81313] opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#d81313]"></span>
                            </span>
                        )}
                    </button>
                    {isNotificationsOpen && (
                        <NotificationPopover
                            notifications={notifications.filter(n => n.userId === currentUser.id)}
                            onNotificationClick={(notif) => {
                                onNotificationClick(notif);
                                setIsNotificationsOpen(false);
                            }}
                            onMarkAllRead={() => {
                                markAllAsRead(currentUser.id);
                            }}
                            onClose={() => setIsNotificationsOpen(false)}
                        />
                    )}
                </div>

                <button onClick={() => onNavigate('dashboard')} className="hidden sm:flex items-center space-x-4 p-1 -m-1 rounded-none hover:bg-neutral-100 transition-colors duration-200">
                  <div className="text-right">
                    <div className="flex items-center space-x-1">
                      <p className="text-sm font-semibold text-black">{currentUser.name}</p>
                      {currentUser.identityToken && <ShieldCheckIcon className="h-4 w-4 text-[#d81313]" />}
                    </div>
                    <p className="text-xs text-neutral-500">{currentUser.role}</p>
                  </div>
                  <img 
                    className="h-10 w-10 object-cover border border-neutral-300" 
                    src={currentUser.profilePictureUrl} 
                    alt="User profile" 
                  />
                </button>
                <div className="hidden sm:block">
                  <AuthButton onClick={onLogout}>
                      <LogoutIcon className="w-4 h-4" />
                      <span>Logout</span>
                  </AuthButton>
                </div>
              </>
            ) : (
                <div className="flex items-center space-x-2">
                    <AuthButton onClick={() => onNavigate('login')}>
                       <LoginIcon className="w-4 h-4" />
                       <span>Log In</span>
                    </AuthButton>
                    <AuthButton onClick={() => onNavigate('signup')} isRed>
                        <UserAddIcon className="w-4 h-4" />
                        <span>Sign Up</span>
                    </AuthButton>
                </div>
            )}
             {currentUser && (
                <div className="lg:hidden">
                    <button onClick={handleMobileMenuToggle} className="p-2 -mr-2">
                        {isMobileMenuOpen ? <XIcon className="h-6 w-6"/> : <MenuIcon className="h-6 w-6"/>}
                    </button>
                </div>
            )}
          </div>
        </div>
      </div>
      {isMobileMenuOpen && currentUser && (
        <div className="lg:hidden absolute top-16 left-0 w-full bg-white border-b border-black shadow-lg z-20 animate-fade-in">
            <nav className="flex flex-col">
                <MobileNavButton onClick={() => handleNavigateAndCloseMenus('cubes')} isActive={currentView === 'cubes'}>
                  <span>Cubes</span>
                </MobileNavButton>
                 <MobileNavButton onClick={() => handleNavigateAndCloseMenus('chapters')} isActive={currentView === 'chapters' || currentView === 'chapterDetail'}>
                  <BuildingOfficeIcon className="w-5 h-5" />
                  <span>Chapters</span>
                </MobileNavButton>
                 <MobileNavButton onClick={() => handleNavigateAndCloseMenus('announcements')} isActive={currentView === 'announcements' || currentView === 'createAnnouncement'}>
                  <MegaphoneIcon className="w-5 h-5" />
                  <span>Announcements</span>
                </MobileNavButton>
                <MobileNavButton onClick={() => handleNavigateAndCloseMenus('outreach')} isActive={currentView === 'outreach'}>
                  <ClipboardListIcon className="w-5 h-5" />
                  <span>Outreach Log</span>
                </MobileNavButton>
                 <MobileNavButton onClick={() => handleNavigateAndCloseMenus('resources')} isActive={currentView === 'resources'}>
                  <BookOpenIcon className="w-5 h-5" />
                  <span>Resources</span>
                </MobileNavButton>
                <MobileNavButton onClick={() => handleNavigateAndCloseMenus('dashboard')} isActive={currentView === 'dashboard'}>
                  <span>Dashboard</span>
                </MobileNavButton>
                {hasOrganizerRole(currentUser) && (
                  <>
                    <MobileNavButton onClick={() => handleNavigateAndCloseMenus('management')} isActive={currentView === 'management' || currentView === 'memberProfile'}>
                      <span>Management</span>
                    </MobileNavButton>
                    <MobileNavButton onClick={() => handleNavigateAndCloseMenus('analytics')} isActive={currentView === 'analytics'}>
                      <ChartBarIcon className="w-5 h-5" />
                      <span>Analytics</span>
                    </MobileNavButton>
                  </>
                )}
                <div className="border-t border-neutral-200 mt-2 pt-2 sm:hidden">
                    <MobileNavButton isActive={false} onClick={() => { onLogout(); setIsMobileMenuOpen(false); }}>
                        <LogoutIcon className="w-5 h-5" />
                        <span>Logout</span>
                    </MobileNavButton>
                </div>
            </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
