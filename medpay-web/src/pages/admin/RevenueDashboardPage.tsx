import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, TrendingUp, DollarSign, ShoppingCart, RotateCcw, Download } from 'lucide-react';
import { toast } from 'sonner';

import type { DashboardKpiResponse } from '@/types/report';

import PageContainer, { containerVariants, itemVariants } from '@/components/layout/PageContainer';
import PageHeader from '@/components/layout/PageHeader';
import StatCard from '@/components/data/StatCard';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

import { reportsApi } from '@/api/reports.api';
import { formatCurrency } from '@/lib/utils';
import { useHospitalContextStore } from '@/stores/hospital-context.store';

/** Minimal bar chart rendered with divs when Recharts components are not yet wired up */
function RevenueBarChart({ data }: { data: { label: string; value: number }[] }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="rounded-lg border border-ivory-200/60 bg-white/70 p-6 backdrop-blur-sm">
      <h3 className="font-display text-lg font-semibold text-sage-800 mb-4">Revenue Overview</h3>
      <div className="flex items-end gap-3 h-48">
        {data.map((d) => (
          <div key={d.label} className="flex flex-1 flex-col items-center gap-1">
            <span className="text-xs text-gray-500">{formatCurrency(d.value)}</span>
            <div
              className="w-full rounded-t bg-sage-400 transition-all duration-500"
              style={{ height: `${(d.value / max) * 100}%`, minHeight: '4px' }}
            />
            <span className="text-xs text-gray-600">{d.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function RevenueDashboardPage() {
  const { selectedHospitalId } = useHospitalContextStore();

  const [kpi, setKpi] = useState<DashboardKpiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);

  const fetchKpi = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await reportsApi.getDashboard(selectedHospitalId ?? undefined);
      setKpi(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load revenue data';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKpi();
  }, [selectedHospitalId]);

  const handleExport = async () => {
    setExporting(true);
    try {
      const blob = await reportsApi.exportCsv({
        hospitalId: selectedHospitalId ?? undefined,
        startDate,
        endDate,
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `revenue-report-${startDate}-to-${endDate}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Report exported successfully');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to export report');
    } finally {
      setExporting(false);
    }
  };

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
          <Button variant="outline" onClick={fetchKpi}>Retry</Button>
        </div>
      </PageContainer>
    );
  }

  const chartData = [
    { label: 'Today Rev.', value: kpi?.todayRevenue ?? 0 },
    { label: 'Month Rev.', value: kpi?.monthRevenue ?? 0 },
    { label: 'Today Orders', value: kpi?.todayOrders ?? 0 },
    { label: 'Month Orders', value: kpi?.monthOrders ?? 0 },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Revenue Dashboard"
        subtitle="Revenue analytics and reporting"
        breadcrumbs={[
          { label: 'Reports', href: '/admin/reports' },
          { label: 'Revenue Dashboard' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" icon={<Download className="h-4 w-4" />} loading={exporting} onClick={handleExport}>
              Export CSV
            </Button>
          </div>
        }
      />

      {/* Date range filter */}
      <div className="mb-6 flex flex-wrap items-end gap-3">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Start Date</label>
          <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">End Date</label>
          <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </div>
      </div>

      {/* KPI cards */}
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <motion.div variants={itemVariants}>
          <StatCard icon={DollarSign} label="Today Revenue" value={kpi?.todayRevenue ?? 0} />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatCard icon={ShoppingCart} label="Today Orders" value={kpi?.todayOrders ?? 0} prefix="" />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatCard icon={TrendingUp} label="Month Revenue" value={kpi?.monthRevenue ?? 0} />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatCard icon={ShoppingCart} label="Month Orders" value={kpi?.monthOrders ?? 0} prefix="" />
        </motion.div>
      </motion.div>

      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <motion.div variants={itemVariants}>
          <StatCard icon={RotateCcw} label="Today Refunds" value={kpi?.todayRefunds ?? 0} />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatCard icon={RotateCcw} label="Pending Refunds" value={kpi?.pendingRefunds ?? 0} prefix="" />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatCard icon={RotateCcw} label="Month Refunds" value={kpi?.monthRefunds ?? 0} />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatCard icon={DollarSign} label="Pending Settlement" value={kpi?.settlementPending ?? 0} />
        </motion.div>
      </motion.div>

      {/* Chart */}
      <motion.div variants={itemVariants} initial="hidden" animate="visible">
        <RevenueBarChart data={chartData} />
      </motion.div>
    </PageContainer>
  );
}
