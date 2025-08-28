import React from 'react';
import { createBrowserRouter } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import MainLayout from '@/layouts/MainLayout';
import AuthLayout from '@/layouts/AuthLayout';
import RootSuspense from './RootSuspense';
import IndexRedirect from './IndexRedirect';

const CubeListPage = React.lazy(() => import('@/pages/CubeListPage'));
const CubeDetailPage = React.lazy(() => import('@/pages/CubeDetailPage'));
const CreateCubePage = React.lazy(() => import('@/pages/CreateCubePage'));
const ManageEventPage = React.lazy(() => import('@/pages/ManageEventPage'));
const DashboardPage = React.lazy(() => import('@/pages/DashboardPage'));

const ManagementPage = React.lazy(() => import('@/pages/ManagementPage'));
const MemberProfilePage = React.lazy(() => import('@/pages/MemberProfilePage'));
const AnalyticsPage = React.lazy(() => import('@/pages/AnalyticsPage'));
const AnnouncementsPage = React.lazy(() => import('@/pages/AnnouncementsPage'));
const CreateAnnouncementPage = React.lazy(
  () => import('@/pages/CreateAnnouncementPage')
);
const ResourcesPage = React.lazy(() => import('@/pages/ResourcesPage'));
const OutreachLogPage = React.lazy(() => import('@/pages/OutreachLogPage'));
const ChapterListPage = React.lazy(() => import('@/pages/ChapterListPage'));
const ChapterDetailPage = React.lazy(() => import('@/pages/ChapterDetailPage'));
const LoginPage = React.lazy(() => import('@/pages/LoginPage'));
const SignUpPage = React.lazy(() => import('@/pages/SignUpPage'));
const SignUpSuccessPage = React.lazy(() => import('@/pages/SignUpSuccessPage'));
const NotFoundPage = React.lazy(() => import('@/pages/NotFoundPage'));
const VerificationPage = React.lazy(() => import('@/pages/VerificationPage'));
const LeaderboardPage = React.lazy(() => import('@/pages/LeaderboardPage'));
const PublicProfilePage = React.lazy(() => import('@/pages/PublicProfilePage'));
const ApplicantStatusPage = React.lazy(
  () => import('@/pages/ApplicantStatusPage')
); // NEW
const NotificationsPage = React.lazy(() => import('@/pages/NotificationsPage'));

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootSuspense />,
    children: [
      // Public landing page at root (outside MainLayout to avoid sidebar/margins)
      { index: true, element: <IndexRedirect /> },
      {
        element: <MainLayout />,
        children: [
          {
            path: 'cubes',
            element: (
              <ProtectedRoute requireCoreAccess>
                <CubeListPage />
              </ProtectedRoute>
            ),
          },
          {
            path: 'cubes/:eventId',
            element: (
              <ProtectedRoute requireCoreAccess>
                <CubeDetailPage />
              </ProtectedRoute>
            ),
          },
          {
            path: 'chapters',
            element: (
              <ProtectedRoute requireCoreAccess>
                <ChapterListPage />
              </ProtectedRoute>
            ),
          },
          {
            path: 'chapters/:chapterName',
            element: (
              <ProtectedRoute requireCoreAccess>
                <ChapterDetailPage />
              </ProtectedRoute>
            ),
          },
          {
            path: 'dashboard',
            element: (
              <ProtectedRoute requireCoreAccess>
                <DashboardPage />
              </ProtectedRoute>
            ),
          },
          {
            path: 'onboarding-status', // NEW ROUTE
            element: (
              <ProtectedRoute>
                <ApplicantStatusPage />
              </ProtectedRoute>
            ),
          },
          {
            path: 'notifications',
            element: (
              <ProtectedRoute>
                <NotificationsPage />
              </ProtectedRoute>
            ),
          },
          {
            path: 'leaderboard',
            element: (
              <ProtectedRoute requireCoreAccess>
                <LeaderboardPage />
              </ProtectedRoute>
            ),
          },

          {
            path: 'members/:userId',
            element: (
              <ProtectedRoute requireCoreAccess>
                <PublicProfilePage />
              </ProtectedRoute>
            ),
          },
          {
            path: 'announcements',
            element: (
              <ProtectedRoute>
                <AnnouncementsPage />
              </ProtectedRoute>
            ),
          },
          {
            path: 'resources',
            element: (
              <ProtectedRoute>
                <ResourcesPage />
              </ProtectedRoute>
            ),
          },
          {
            path: 'verify/:userId',
            element: (
              <ProtectedRoute requiredRole="organizer" requireFullAccess>
                <VerificationPage />
              </ProtectedRoute>
            ),
          },
          {
            path: 'outreach',
            element: (
              <ProtectedRoute requireFullAccess>
                <OutreachLogPage />
              </ProtectedRoute>
            ),
          },
          {
            path: 'cubes/create',
            element: (
              <ProtectedRoute requiredRole="organizer" requireFullAccess>
                <CreateCubePage />
              </ProtectedRoute>
            ),
          },
          {
            path: 'announcements/create',
            element: (
              <ProtectedRoute requiredRole="organizer" requireFullAccess>
                <CreateAnnouncementPage />
              </ProtectedRoute>
            ),
          },
          {
            path: 'manage',
            element: (
              <ProtectedRoute requiredRole="organizer" requireFullAccess>
                <ManagementPage />
              </ProtectedRoute>
            ),
          },

          {
            path: 'manage/member/:userId',
            element: (
              <ProtectedRoute requiredRole="organizer" requireFullAccess>
                <MemberProfilePage />
              </ProtectedRoute>
            ),
          },
          {
            path: 'manage/event/:eventId',
            element: (
              <ProtectedRoute requiredRole="organizer" requireFullAccess>
                <ManageEventPage />
              </ProtectedRoute>
            ),
          },
          {
            path: 'analytics',
            element: (
              <ProtectedRoute requiredRole="organizer" requireFullAccess>
                <AnalyticsPage />
              </ProtectedRoute>
            ),
          },
          {
            path: '*',
            element: <NotFoundPage />,
          },
        ],
      },
      {
        element: <AuthLayout />,
        children: [
          { path: 'login', element: <LoginPage /> },
          { path: 'signup', element: <SignUpPage /> },
          { path: 'signup-success', element: <SignUpSuccessPage /> },
        ],
      },
    ],
  },
]);
