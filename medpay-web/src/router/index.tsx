import { lazy, Suspense } from 'react';
import type { ReactNode } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import type { RouteObject } from 'react-router-dom';
import { AuthGuard, RoleGuard } from './guards';
import { UserRole } from '@/types/enums';
import { patientRoutes } from './patient.routes';
import { doctorRoutes } from './doctor.routes';
import { adminRoutes } from './admin.routes';

/* ----- Layout components (eagerly loaded for shell) ----- */
import PatientLayout from '@/components/layout/PatientLayout';
import DoctorLayout from '@/components/layout/DoctorLayout';
import AdminLayout from '@/components/layout/AdminLayout';

/* ----- Lazy-loaded public pages ----- */
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage'));
const ForbiddenPage = lazy(() => import('@/pages/errors/ForbiddenPage'));
const NotFoundPage = lazy(() => import('@/pages/errors/NotFoundPage'));

/* ----- Root redirect component ----- */
const RootRedirect = lazy(() => import('@/pages/RootRedirect'));

/* ----- Loading spinner for Suspense fallback ----- */
function LoadingFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-ivory-50">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-sage-200 border-t-sage-500" />
        <span className="text-sm text-sage-700/60">加载中...</span>
      </div>
    </div>
  );
}

/* ----- Helper: wrap lazy element in Suspense ----- */
function withSuspense(element: ReactNode): ReactNode {
  return <Suspense fallback={<LoadingFallback />}>{element}</Suspense>;
}

/* ----- Wrap all children routes with Suspense ----- */
function wrapChildRoutes(routes: RouteObject[]): RouteObject[] {
  return routes.map((route) => ({
    ...route,
    element: route.element ? withSuspense(route.element) : undefined,
    children: route.children ? wrapChildRoutes(route.children) : undefined,
  })) as RouteObject[];
}

/* ----- Route definitions ----- */
const routes: RouteObject[] = [
  /* Public routes */
  {
    path: '/login',
    element: withSuspense(<LoginPage />),
  },
  {
    path: '/register',
    element: withSuspense(<RegisterPage />),
  },

  /* Patient portal */
  {
    path: '/patient',
    element: (
      <AuthGuard>
        <RoleGuard allowedRoles={[UserRole.PATIENT]}>
          <PatientLayout />
        </RoleGuard>
      </AuthGuard>
    ),
    children: wrapChildRoutes(patientRoutes),
  },

  /* Doctor portal */
  {
    path: '/doctor',
    element: (
      <AuthGuard>
        <RoleGuard allowedRoles={[UserRole.DOCTOR]}>
          <DoctorLayout />
        </RoleGuard>
      </AuthGuard>
    ),
    children: wrapChildRoutes(doctorRoutes),
  },

  /* Admin portal */
  {
    path: '/admin',
    element: (
      <AuthGuard>
        <RoleGuard allowedRoles={[UserRole.HOSPITAL_ADMIN, UserRole.SUPER_ADMIN]}>
          <AdminLayout />
        </RoleGuard>
      </AuthGuard>
    ),
    children: wrapChildRoutes(adminRoutes),
  },

  /* Root redirect (based on user role) */
  {
    path: '/',
    element: withSuspense(<RootRedirect />),
  },

  /* Error pages */
  {
    path: '/403',
    element: withSuspense(<ForbiddenPage />),
  },
  {
    path: '*',
    element: withSuspense(<NotFoundPage />),
  },
];

export const router = createBrowserRouter(routes);
