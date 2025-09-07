import React from 'react';
import {
  ChevronUp,
  User2,
  LogOut,
  Settings,
  Search,
  Home,
  Package,
  Building,
  Trophy,
  Megaphone,
  BookOpen,
  Mail,
  BarChart3,
  Cog,
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

import { useNavItems } from '@/hooks/useNavItems';
import { useCurrentUser, useAuthActions } from '@/store/auth.store';
import { useSearchActions } from '@/store/search.store';

const getNavIcon = (path: string) => {
  switch (path) {
    case '/dashboard':
      return <Home className="h-4 w-4" />;
    case '/cubes':
      return <Package className="h-4 w-4" />;
    case '/chapters':
      return <Building className="h-4 w-4" />;
    case '/leaderboard':
      return <Trophy className="h-4 w-4" />;
    case '/announcements':
      return <Megaphone className="h-4 w-4" />;
    case '/resources':
      return <BookOpen className="h-4 w-4" />;
    case '/outreach':
      return <Mail className="h-4 w-4" />;
    case '/manage':
      return <Cog className="h-4 w-4" />;
    case '/analytics':
      return <BarChart3 className="h-4 w-4" />;
    case '/onboarding-status':
      return <User2 className="h-4 w-4" />;
    default:
      return null;
  }
};

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const navItems = useNavItems();
  const currentUser = useCurrentUser();
  const { logout } = useAuthActions();
  const { open: openSearch } = useSearchActions();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleOpenSearch = () => {
    openSearch();
  };

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <span className="text-sm font-semibold">AV</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold">AV Hub</span>
          </div>
        </div>

        {/* Search */}
        <div className="px-2">
          <Button
            variant="outline"
            onClick={handleOpenSearch}
            className="w-full justify-start text-sm text-muted-foreground"
          >
            <Search className="mr-2 h-4 w-4" />
            Search...
            <kbd className="ml-auto hidden rounded border bg-muted px-2 py-0.5 font-mono text-xs text-muted-foreground lg:inline-block">
              ⌘ K
            </kbd>
          </Button>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.to}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.to}
                  >
                    <Link to={item.to}>
                      {getNavIcon(item.to)}
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        {currentUser && (
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton
                    size="lg"
                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                  >
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarImage
                        src={currentUser.profilePictureUrl}
                        alt={currentUser.name}
                      />
                      <AvatarFallback className="rounded-lg">
                        {currentUser.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">
                        {currentUser.name}
                      </span>
                      <span className="truncate text-xs">
                        {currentUser.email}
                      </span>
                    </div>
                    <ChevronUp className="ml-auto size-4" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                  side="bottom"
                  align="end"
                  sideOffset={4}
                >
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="flex items-center">
                      <User2 className="mr-2 h-4 w-4" />
                      <span>Account</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/profile/manage" className="flex items-center">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="flex items-center"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
