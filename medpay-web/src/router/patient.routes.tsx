import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';

/* ----- Lazy-loaded patient pages ----- */

const DashboardPage = lazy(() => import('@/pages/patient/DashboardPage'));
const DoctorListPage = lazy(() => import('@/pages/patient/DoctorListPage'));
const DoctorDetailPage = lazy(() => import('@/pages/patient/DoctorDetailPage'));
const AppointmentBookingPage = lazy(() => import('@/pages/patient/AppointmentBookingPage'));
const ServiceBrowsePage = lazy(() => import('@/pages/patient/ServiceBrowsePage'));
const ServiceDetailPage = lazy(() => import('@/pages/patient/ServiceDetailPage'));
const ProductBrowsePage = lazy(() => import('@/pages/patient/ProductBrowsePage'));
const ProductDetailPage = lazy(() => import('@/pages/patient/ProductDetailPage'));
const PackageBrowsePage = lazy(() => import('@/pages/patient/PackageBrowsePage'));
const PackageDetailPage = lazy(() => import('@/pages/patient/PackageDetailPage'));
const OrderListPage = lazy(() => import('@/pages/patient/OrderListPage'));
const OrderDetailPage = lazy(() => import('@/pages/patient/OrderDetailPage'));
const PaymentPage = lazy(() => import('@/pages/patient/PaymentPage'));
const PrescriptionListPage = lazy(() => import('@/pages/patient/PrescriptionListPage'));
const PrescriptionDetailPage = lazy(() => import('@/pages/patient/PrescriptionDetailPage'));
const InsurancePage = lazy(() => import('@/pages/patient/InsurancePage'));
const NotificationsPage = lazy(() => import('@/pages/patient/NotificationsPage'));
const ProfilePage = lazy(() => import('@/pages/patient/ProfilePage'));

export const patientRoutes: RouteObject[] = [
  { index: true, element: <DashboardPage /> },
  { path: 'doctors', element: <DoctorListPage /> },
  { path: 'doctors/:id', element: <DoctorDetailPage /> },
  { path: 'book/:scheduleId', element: <AppointmentBookingPage /> },
  { path: 'services', element: <ServiceBrowsePage /> },
  { path: 'services/:id', element: <ServiceDetailPage /> },
  { path: 'products', element: <ProductBrowsePage /> },
  { path: 'products/:id', element: <ProductDetailPage /> },
  { path: 'packages', element: <PackageBrowsePage /> },
  { path: 'packages/:id', element: <PackageDetailPage /> },
  { path: 'orders', element: <OrderListPage /> },
  { path: 'orders/:id', element: <OrderDetailPage /> },
  { path: 'orders/:id/pay', element: <PaymentPage /> },
  { path: 'prescriptions', element: <PrescriptionListPage /> },
  { path: 'prescriptions/:id', element: <PrescriptionDetailPage /> },
  { path: 'insurance', element: <InsurancePage /> },
  { path: 'notifications', element: <NotificationsPage /> },
  { path: 'profile', element: <ProfilePage /> },
];
