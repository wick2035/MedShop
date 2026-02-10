import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';

/* ----- Lazy-loaded admin pages ----- */

// Overview
const DashboardPage = lazy(() => import('@/pages/admin/DashboardPage'));

// Hospitals
const HospitalListPage = lazy(() => import('@/pages/admin/hospitals/HospitalListPage'));
const HospitalCreatePage = lazy(() => import('@/pages/admin/hospitals/HospitalCreatePage'));
const HospitalDetailPage = lazy(() => import('@/pages/admin/hospitals/HospitalDetailPage'));
const HospitalEditPage = lazy(() => import('@/pages/admin/hospitals/HospitalEditPage'));
const HospitalDepartmentsPage = lazy(() => import('@/pages/admin/hospitals/DepartmentManagePage'));

// Catalog
const CategoryListPage = lazy(() => import('@/pages/admin/catalog/CategoryListPage'));
const ServiceListPage = lazy(() => import('@/pages/admin/catalog/ServiceListPage'));
const ServiceCreatePage = lazy(() => import('@/pages/admin/catalog/ServiceCreatePage'));
const ServiceEditPage = lazy(() => import('@/pages/admin/catalog/ServiceEditPage'));
const ProductListPage = lazy(() => import('@/pages/admin/catalog/ProductListPage'));
const ProductCreatePage = lazy(() => import('@/pages/admin/catalog/ProductCreatePage'));
const ProductEditPage = lazy(() => import('@/pages/admin/catalog/ProductEditPage'));
const ProductStockPage = lazy(() => import('@/pages/admin/catalog/ProductStockPage'));
const PackageListPage = lazy(() => import('@/pages/admin/catalog/PackageListPage'));
const PackageCreatePage = lazy(() => import('@/pages/admin/catalog/PackageCreatePage'));
const PackageEditPage = lazy(() => import('@/pages/admin/catalog/PackageEditPage'));

// Schedules
const ScheduleOverviewPage = lazy(() => import('@/pages/admin/ScheduleOverviewPage'));

// Orders
const OrderListPage = lazy(() => import('@/pages/admin/orders/OrderListPage'));
const OrderDetailPage = lazy(() => import('@/pages/admin/orders/OrderDetailPage'));
const OrderStatisticsPage = lazy(() => import('@/pages/admin/orders/OrderStatisticsPage'));

// Payments
const PaymentListPage = lazy(() => import('@/pages/admin/PaymentListPage'));

// Ledger
const LedgerPage = lazy(() => import('@/pages/admin/LedgerPage'));

// Refunds
const RefundListPage = lazy(() => import('@/pages/admin/refunds/RefundListPage'));
const RefundReviewPage = lazy(() => import('@/pages/admin/refunds/RefundReviewPage'));

// Insurance
const InsuranceClaimsPage = lazy(() => import('@/pages/admin/insurance/InsuranceClaimsPage'));
const InsuranceReimbursementsPage = lazy(() => import('@/pages/admin/insurance/InsuranceReimbursementsPage'));
const InsuranceSplitsPage = lazy(() => import('@/pages/admin/insurance/InsuranceSplitsPage'));

// Reconciliation
const ReconciliationListPage = lazy(() => import('@/pages/admin/reconciliation/ReconciliationListPage'));
const ReconciliationTriggerPage = lazy(() => import('@/pages/admin/reconciliation/ReconciliationTriggerPage'));
const ReconciliationDetailPage = lazy(() => import('@/pages/admin/reconciliation/ReconciliationDetailPage'));

// Reports
const RevenueDashboardPage = lazy(() => import('@/pages/admin/RevenueDashboardPage'));

// Settlements
const SettlementListPage = lazy(() => import('@/pages/admin/SettlementListPage'));

// Export
const ExportPage = lazy(() => import('@/pages/admin/ExportPage'));

// System
const NotificationListPage = lazy(() => import('@/pages/admin/NotificationListPage'));
const AuditLogPage = lazy(() => import('@/pages/admin/AuditLogPage'));

export const adminRoutes: RouteObject[] = [
  /* Overview */
  { index: true, element: <DashboardPage /> },

  /* Hospitals */
  { path: 'hospitals', element: <HospitalListPage /> },
  { path: 'hospitals/new', element: <HospitalCreatePage /> },
  { path: 'hospitals/:id', element: <HospitalDetailPage /> },
  { path: 'hospitals/:id/edit', element: <HospitalEditPage /> },
  { path: 'hospitals/:id/departments', element: <HospitalDepartmentsPage /> },

  /* Catalog */
  { path: 'catalog/categories', element: <CategoryListPage /> },
  { path: 'catalog/services', element: <ServiceListPage /> },
  { path: 'catalog/services/new', element: <ServiceCreatePage /> },
  { path: 'catalog/services/:id/edit', element: <ServiceEditPage /> },
  { path: 'catalog/products', element: <ProductListPage /> },
  { path: 'catalog/products/new', element: <ProductCreatePage /> },
  { path: 'catalog/products/:id/edit', element: <ProductEditPage /> },
  { path: 'catalog/products/:id/stock', element: <ProductStockPage /> },
  { path: 'catalog/packages', element: <PackageListPage /> },
  { path: 'catalog/packages/new', element: <PackageCreatePage /> },
  { path: 'catalog/packages/:id/edit', element: <PackageEditPage /> },

  /* Schedules */
  { path: 'schedules', element: <ScheduleOverviewPage /> },

  /* Orders */
  { path: 'orders', element: <OrderListPage /> },
  { path: 'orders/statistics', element: <OrderStatisticsPage /> },
  { path: 'orders/:id', element: <OrderDetailPage /> },

  /* Payments */
  { path: 'payments', element: <PaymentListPage /> },

  /* Ledger */
  { path: 'ledger', element: <LedgerPage /> },

  /* Refunds */
  { path: 'refunds', element: <RefundListPage /> },
  { path: 'refunds/:id', element: <RefundReviewPage /> },

  /* Insurance */
  { path: 'insurance/claims', element: <InsuranceClaimsPage /> },
  { path: 'insurance/reimbursements', element: <InsuranceReimbursementsPage /> },
  { path: 'insurance/splits', element: <InsuranceSplitsPage /> },

  /* Reconciliation */
  { path: 'reconciliation', element: <ReconciliationListPage /> },
  { path: 'reconciliation/trigger', element: <ReconciliationTriggerPage /> },
  { path: 'reconciliation/:batchId', element: <ReconciliationDetailPage /> },

  /* Reports */
  { path: 'reports', element: <RevenueDashboardPage /> },

  /* Settlements */
  { path: 'settlements', element: <SettlementListPage /> },

  /* Export */
  { path: 'export', element: <ExportPage /> },

  /* System */
  { path: 'notifications', element: <NotificationListPage /> },
  { path: 'audit', element: <AuditLogPage /> },
];
