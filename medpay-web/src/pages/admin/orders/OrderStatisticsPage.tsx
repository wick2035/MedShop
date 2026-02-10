import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, DollarSign, ShoppingCart, TrendingUp, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

import PageContainer, { containerVariants, itemVariants } from '@/components/layout/PageContainer';
import PageHeader from '@/components/layout/PageHeader';
import StatCard from '@/components/data/StatCard';
import { Button } from '@/components/ui/Button';

import { adminOrdersApi } from '@/api/admin-orders.api';
import { ORDER_STATUS_LABELS, ORDER_TYPE_LABELS } from '@/lib/constants';
import { useHospitalContextStore } from '@/stores/hospital-context.store';

export default function OrderStatisticsPage() {
  const { selectedHospitalId } = useHospitalContextStore();

  const [stats, setStats] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminOrdersApi.getStatistics(selectedHospitalId ?? undefined);
      setStats(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load statistics';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [selectedHospitalId]);

  const totalOrders = (stats?.totalOrders as number) ?? 0;
  const totalRevenue = (stats?.totalRevenue as number) ?? 0;
  const byType = (stats?.byType as Record<string, number>) ?? {};
  const byStatus = (stats?.byStatus as Record<string, number>) ?? {};

  if (loading) {
    return (
      <PageContainer>
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-sage-200 border-t-sage-500" />
        </div>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <div className="flex h-64 flex-col items-center justify-center gap-4 text-gray-500">
          <AlertCircle className="h-12 w-12 text-red-400" />
          <p>{error}</p>
          <Button variant="outline" onClick={fetchStats}>Retry</Button>
        </div>
      </PageContainer>
    );
  }

  const typeEntries = Object.entries(byType);
  const statusEntries = Object.entries(byStatus);
  const maxTypeVal = Math.max(...typeEntries.map(([, v]) => v), 1);
  const maxStatusVal = Math.max(...statusEntries.map(([, v]) => v), 1);

  return (
    <PageContainer>
      <PageHeader title="Order Statistics" subtitle="Comprehensive order analysis" />

      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <motion.div variants={itemVariants}><StatCard icon={ShoppingCart} label="Total Orders" value={totalOrders} prefix="" /></motion.div>
        <motion.div variants={itemVariants}><StatCard icon={DollarSign} label="Total Revenue" value={totalRevenue} prefix="¥" /></motion.div>
        <motion.div variants={itemVariants}><StatCard icon={TrendingUp} label="Avg Order Value" value={totalOrders > 0 ? totalRevenue / totalOrders : 0} prefix="¥" /></motion.div>
        <motion.div variants={itemVariants}><StatCard icon={BarChart3} label="Order Types" value={typeEntries.length} prefix="" /></motion.div>
      </motion.div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <motion.div variants={itemVariants} initial="hidden" animate="visible" className="rounded-lg border border-ivory-200/60 bg-white/70 p-6 backdrop-blur-sm">
          <h3 className="mb-4 font-display text-lg font-semibold text-sage-800">Orders by Type</h3>
          {typeEntries.length === 0 ? (
            <p className="text-sm text-gray-400">No data available</p>
          ) : (
            <div className="space-y-3">
              {typeEntries.map(([key, value]) => (
                <div key={key}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="text-gray-600">{ORDER_TYPE_LABELS[key as keyof typeof ORDER_TYPE_LABELS] ?? key}</span>
                    <span className="font-medium text-gray-800">{value}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                    <div className="h-full rounded-full bg-sage-400 transition-all" style={{ width: `${(value / maxTypeVal) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        <motion.div variants={itemVariants} initial="hidden" animate="visible" className="rounded-lg border border-ivory-200/60 bg-white/70 p-6 backdrop-blur-sm">
          <h3 className="mb-4 font-display text-lg font-semibold text-sage-800">Orders by Status</h3>
          {statusEntries.length === 0 ? (
            <p className="text-sm text-gray-400">No data available</p>
          ) : (
            <div className="space-y-3">
              {statusEntries.map(([key, value]) => (
                <div key={key}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="text-gray-600">{ORDER_STATUS_LABELS[key as keyof typeof ORDER_STATUS_LABELS] ?? key}</span>
                    <span className="font-medium text-gray-800">{value}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                    <div className="h-full rounded-full bg-terracotta transition-all" style={{ width: `${(value / maxStatusVal) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </PageContainer>
  );
}
