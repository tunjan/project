import React from 'react';
import { createBrowserRouter } from 'react-router-dom';

import AuthLayout from '@/layouts/AuthLayout';
import MainLayout from '@/layouts/MainLayout';

import IndexRedirect from './IndexRedirect';
import ProtectedRoute from './ProtectedRoute';
import RootSuspense from './RootSuspense';

const CubeListPage = React.lazy(() => import('@/pages/CubeListPage'));
const CubeDetailPage = React.lazy(() => import('@/pages/CubeDetailPage'));
const ManageEventPage = React.lazy(() => import('@/pages/ManageEventPage'));
const DashboardPage = React.lazy(() => import('@/pages/DashboardPage'));

const ManagementPage = React.lazy(() => import('@/pages/ManagementPage'));
const ManageProfilePage = React.lazy(() => import('@/pages/ManageProfilePage'));
const AnalyticsPage = React.lazy(() => import('@/pages/AnalyticsPage'));
const AnnouncementsPage = React.lazy(() => import('@/pages/AnnouncementsPage'));
const ResourcesPage = React.lazy(() => import('@/pages/ResourcesPage'));
const OutreachLogPage = React.lazy(() => import('@/pages/OutreachLogPage'));
const ChapterListPage = React.lazy(() => import('@/pages/ChapterListPage'));
const ChapterDetailPage = React.lazy(() => import('@/pages/ChapterDetailPage'));
const LoginPage = React.lazy(() => import('@/pages/LoginPage'));
const SignUpPage = React.lazy(() => import('@/pages/SignUpPage'));
const SignUpSuccessPage = React.lazy(() => import('@/pages/SignUpSuccessPage'));
const NotFoundPage = React.lazy(() => import('@/pages/NotFoundPage'));

const LeaderboardPage = React.lazy(() => import('@/pages/LeaderboardPage'));
const ViewProfilePage = React.lazy(() => import('@/pages/ViewProfilePage'));
const ApplicantStatusPage = React.lazy(
  () => import('@/pages/ApplicantStatusPage')
);
const NotificationsPage = React.lazy(() => import('@/pages/NotificationsPage'));

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootSuspense />,
    children: [
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
            path: 'onboarding-status',
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
                <ViewProfilePage />
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
            path: 'outreach',
            element: (
              <ProtectedRoute requireFullAccess>
                <OutreachLogPage />
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
                <ManageProfilePage />
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
