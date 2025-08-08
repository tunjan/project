import React, { Suspense } from 'react';
import { createBrowserRouter, Outlet, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import MainLayout from '@/layouts/MainLayout';
import AuthLayout from '@/layouts/AuthLayout';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useCurrentUser } from '@/store/auth.store';

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
const NotFoundPage = React.lazy(() => import('@/pages/NotFoundPage'));
const VerificationPage = React.lazy(() => import('@/pages/VerificationPage'));
const LeaderboardPage = React.lazy(() => import('@/pages/LeaderboardPage'));
const PublicProfilePage = React.lazy(() => import('@/pages/PublicProfilePage'));
const ApplicantStatusPage = React.lazy(
  () => import('@/pages/ApplicantStatusPage')
); // NEW

const RootSuspense = () => (
  <Suspense
    fallback={
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    }
  >
    <Outlet />
  </Suspense>
);

const IndexRedirect = () => {
  const currentUser = useCurrentUser();
  return <Navigate to={currentUser ? '/dashboard' : '/cubes'} replace />;
};

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootSuspense />,
    children: [
      {
        element: <MainLayout />,
        children: [
          { index: true, element: <IndexRedirect /> },
          { path: 'cubes', element: <CubeListPage /> },
          { path: 'cubes/:eventId', element: <CubeDetailPage /> },
          { path: 'chapters', element: <ChapterListPage /> },
          { path: 'chapters/:chapterName', element: <ChapterDetailPage /> },
          {
            path: 'dashboard',
            element: (
              <ProtectedRoute>
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
            path: 'leaderboard',
            element: (
              <ProtectedRoute>
                <LeaderboardPage />
              </ProtectedRoute>
            ),
          },

          {
            path: 'members/:userId',
            element: (
              <ProtectedRoute>
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
              <ProtectedRoute requiredRole="organizer">
                <VerificationPage />
              </ProtectedRoute>
            ),
          },
          {
            path: 'outreach',
            element: (
              <ProtectedRoute>
                <OutreachLogPage />
              </ProtectedRoute>
            ),
          },
          {
            path: 'cubes/create',
            element: (
              <ProtectedRoute requiredRole="organizer">
                <CreateCubePage />
              </ProtectedRoute>
            ),
          },
          {
            path: 'announcements/create',
            element: (
              <ProtectedRoute requiredRole="organizer">
                <CreateAnnouncementPage />
              </ProtectedRoute>
            ),
          },
          {
            path: 'manage',
            element: (
              <ProtectedRoute requiredRole="organizer">
                <ManagementPage />
              </ProtectedRoute>
            ),
          },
          {
            path: 'manage/member/:userId',
            element: (
              <ProtectedRoute requiredRole="organizer">
                <MemberProfilePage />
              </ProtectedRoute>
            ),
          },
          {
            path: 'manage/event/:eventId',
            element: (
              <ProtectedRoute requiredRole="organizer">
                <ManageEventPage />
              </ProtectedRoute>
            ),
          },
          {
            path: 'analytics',
            element: (
              <ProtectedRoute requiredRole="organizer">
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
        ],
      },
    ],
  },
]);
