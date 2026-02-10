import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  Plus,
  FileText,
  Search,
  Eye,
} from 'lucide-react';
import type { PrescriptionResponse } from '@/types/prescription';
import PageContainer, {
  containerVariants,
  itemVariants,
} from '@/components/layout/PageContainer';
import PageHeader from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/stores/auth.store';
import { prescriptionsApi } from '@/api/prescriptions.api';
import { cn, formatCurrency, formatDate } from '@/lib/utils';

const STATUS_TABS = [
  { key: 'ALL', label: 'All' },
  { key: 'PENDING', label: 'Pending' },
  { key: 'CONFIRMED', label: 'Confirmed' },
  { key: 'CANCELLED', label: 'Cancelled' },
] as const;

const STATUS_STYLES: Record<string, string> = {
  PENDING: 'bg-amber-50 text-amber-700',
  CONFIRMED: 'bg-emerald-50 text-emerald-700',
  CANCELLED: 'bg-gray-100 text-gray-500',
  DISPENSED: 'bg-blue-50 text-blue-700',
};

export default function PrescriptionListPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const [prescriptions, setPrescriptions] = useState<PrescriptionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchPrescriptions = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const data = await prescriptionsApi.listByDoctor(user.doctorId ?? user.id);
      setPrescriptions(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load prescriptions',
      );
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchPrescriptions();
  }, [fetchPrescriptions]);

  const filtered = prescriptions.filter((rx) => {
    if (activeTab !== 'ALL' && rx.status !== activeTab) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        rx.prescriptionNo.toLowerCase().includes(q) ||
        rx.diagnosis.toLowerCase().includes(q) ||
        rx.patientId.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <PageContainer>
      <motion.div variants={containerVariants} initial="hidden" animate="visible">
        <motion.div variants={itemVariants}>
          <PageHeader
            title="My Prescriptions"
            subtitle="View and manage your prescriptions"
            breadcrumbs={[
              { label: 'Dashboard', href: '/doctor' },
              { label: 'Prescriptions' },
            ]}
            actions={
              <Link to="/doctor/prescriptions/new">
                <Button icon={<Plus className="h-4 w-4" />}>
                  New Prescription
                </Button>
              </Link>
            }
          />
        </motion.div>

        {/* Status Tabs */}
        <motion.div
          variants={itemVariants}
          className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex gap-1 rounded-lg border border-ivory-200 bg-white/80 p-1">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  'rounded-md px-4 py-1.5 text-sm font-medium transition-colors',
                  activeTab === tab.key
                    ? 'bg-sage-500 text-white shadow-sm'
                    : 'text-sage-600 hover:bg-ivory-100',
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-sage-400" />
            <input
              type="text"
              placeholder="Search prescriptions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-ivory-200 bg-white/80 py-2 pl-9 pr-4 text-sm text-sage-800 placeholder:text-sage-300 focus:border-sage-400 focus:outline-none focus:ring-2 focus:ring-sage-200 sm:w-72"
            />
          </div>
        </motion.div>

        {/* Table */}
        <motion.div
          variants={itemVariants}
          className="rounded-xl border border-ivory-200 bg-white/80 shadow-sm backdrop-blur-sm"
        >
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-sage-200 border-t-sage-500" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center gap-3 py-12">
              <p className="text-red-500">{error}</p>
              <Button variant="outline" size="sm" onClick={fetchPrescriptions}>
                Retry
              </Button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-sage-500">
              <FileText className="mb-3 h-12 w-12 text-sage-300" />
              <p className="text-lg font-medium">No prescriptions found</p>
              <p className="mt-1 text-sm text-sage-400">
                {activeTab !== 'ALL'
                  ? 'Try selecting a different status filter.'
                  : 'Create your first prescription to get started.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-ivory-100 text-left text-xs font-medium uppercase tracking-wider text-sage-500">
                    <th className="px-6 py-3">Prescription No.</th>
                    <th className="px-6 py-3">Patient</th>
                    <th className="px-6 py-3">Diagnosis</th>
                    <th className="px-6 py-3">Amount</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Date</th>
                    <th className="px-6 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ivory-100">
                  {filtered.map((rx) => (
                    <tr
                      key={rx.id}
                      className="cursor-pointer transition-colors hover:bg-ivory-50"
                      onClick={() => navigate(`/doctor/prescriptions/${rx.id}`)}
                    >
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-sage-800">
                          {rx.prescriptionNo}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-sage-700">
                          {rx.patientId.slice(0, 8)}...
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-sage-700">
                          {rx.diagnosis}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-sage-800">
                          {formatCurrency(rx.totalAmount)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={cn(
                            'inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium',
                            STATUS_STYLES[rx.status] ?? 'bg-gray-100 text-gray-500',
                          )}
                        >
                          {rx.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-sage-600">
                        {formatDate(rx.createdAt)}
                      </td>
                      <td className="px-6 py-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<Eye className="h-3.5 w-3.5" />}
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/doctor/prescriptions/${rx.id}`);
                          }}
                        >
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </motion.div>
    </PageContainer>
  );
}
