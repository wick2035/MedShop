import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';

/* ----- Lazy-loaded doctor pages ----- */

const DashboardPage = lazy(() => import('@/pages/doctor/DashboardPage'));
const ScheduleListPage = lazy(() => import('@/pages/doctor/ScheduleListPage'));
const ScheduleCreatePage = lazy(() => import('@/pages/doctor/ScheduleCreatePage'));
const PatientListPage = lazy(() => import('@/pages/doctor/PatientListPage'));
const PrescriptionListPage = lazy(() => import('@/pages/doctor/PrescriptionListPage'));
const PrescriptionCreatePage = lazy(() => import('@/pages/doctor/PrescriptionCreatePage'));
const PrescriptionDetailPage = lazy(() => import('@/pages/doctor/PrescriptionDetailPage'));
const AppointmentCheckInPage = lazy(() => import('@/pages/doctor/AppointmentCheckInPage'));
const NotificationsPage = lazy(() => import('@/pages/doctor/NotificationsPage'));
const ProfilePage = lazy(() => import('@/pages/doctor/ProfilePage'));

export const doctorRoutes: RouteObject[] = [
  { index: true, element: <DashboardPage /> },
  { path: 'schedules', element: <ScheduleListPage /> },
  { path: 'schedules/new', element: <ScheduleCreatePage /> },
  { path: 'patients', element: <PatientListPage /> },
  { path: 'prescriptions', element: <PrescriptionListPage /> },
  { path: 'prescriptions/new', element: <PrescriptionCreatePage /> },
  { path: 'prescriptions/:id', element: <PrescriptionDetailPage /> },
  { path: 'check-in/:id', element: <AppointmentCheckInPage /> },
  { path: 'notifications', element: <NotificationsPage /> },
  { path: 'profile', element: <ProfilePage /> },
];
