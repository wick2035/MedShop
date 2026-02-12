import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, AlertCircle, Gift } from 'lucide-react';
import { toast } from 'sonner';

import type { HealthPackageResponse } from '@/types/health-package';

import PageContainer, { itemVariants } from '@/components/layout/PageContainer';
import PageHeader from '@/components/layout/PageHeader';
import DataTable from '@/components/data/DataTable';
import type { DataTableColumn } from '@/components/data/DataTable';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

import { healthPackagesApi } from '@/api/health-packages.api';
import { PACKAGE_TYPE_LABELS } from '@/lib/constants';
import { formatCurrency } from '@/lib/utils';
import { useHospitalContextStore } from '@/stores/hospital-context.store';

export default function PackageListPage() {
  const navigate = useNavigate();
  const { selectedHospitalId } = useHospitalContextStore();

  const [packages, setPackages] = useState<HealthPackageResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPackages = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await healthPackagesApi.list({
        hospitalId: selectedHospitalId ?? undefined,
      });
      setPackages(Array.isArray(data) ? data : []);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load packages';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, [selectedHospitalId]);

  const columns: DataTableColumn<HealthPackageResponse>[] = [
    { key: 'name', header: 'Name', sortable: true },
    { key: 'code', header: 'Code' },
    {
      key: 'packageType',
      header: 'Type',
      render: (row) => (
        <Badge variant="sage" size="sm">
          {PACKAGE_TYPE_LABELS[row.packageType] ?? row.packageType}
        </Badge>
      ),
    },
    {
      key: 'price',
      header: 'Price',
      sortable: true,
      render: (row) => (
        <div>
          <span className="font-medium">{formatCurrency(row.price)}</span>
          {row.originalPrice && row.originalPrice > row.price && (
            <span className="ml-2 text-xs text-gray-400 line-through">
              {formatCurrency(row.originalPrice)}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <Badge variant={row.status === 'ACTIVE' ? 'success' : 'error'} size="sm">
          {row.status}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/admin/catalog/packages/${row.id}/edit`);
          }}
        >
          Edit
        </Button>
      ),
    },
  ];

  if (error) {
    return (
      <PageContainer>
        <div className="flex h-64 flex-col items-center justify-center gap-4 text-gray-500">
          <AlertCircle className="h-12 w-12 text-red-400" />
          <p>{error}</p>
          <Button variant="outline" onClick={fetchPackages}>Retry</Button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Health Packages"
        subtitle="Manage bundled service and product packages"
        actions={
          <Button icon={<Plus className="h-4 w-4" />} onClick={() => navigate('/admin/catalog/packages/create')}>
            Add Package
          </Button>
        }
      />

      <motion.div variants={itemVariants} initial="hidden" animate="visible">
        <DataTable
          columns={columns as any}
          data={packages as any}
          loading={loading}
          emptyMessage="No packages found"
        />
      </motion.div>
    </PageContainer>
  );
}
