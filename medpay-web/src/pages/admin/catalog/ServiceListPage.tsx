import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Eye, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

import type { MedicalServiceResponse } from '@/types/catalog';
import type { PaginatedResponse } from '@/types/api';
import { ServiceType } from '@/types/enums';

import PageContainer, { itemVariants } from '@/components/layout/PageContainer';
import PageHeader from '@/components/layout/PageHeader';
import DataTable from '@/components/data/DataTable';
import type { DataTableColumn } from '@/components/data/DataTable';
import DataTableToolbar from '@/components/data/DataTableToolbar';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Select';

import { medicalServicesApi } from '@/api/medical-services.api';
import { SERVICE_TYPE_LABELS } from '@/lib/constants';
import { formatCurrency } from '@/lib/utils';
import { useHospitalContextStore } from '@/stores/hospital-context.store';

export default function ServiceListPage() {
  const navigate = useNavigate();
  const { selectedHospitalId } = useHospitalContextStore();

  const [services, setServices] = useState<MedicalServiceResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchServices = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await medicalServicesApi.list({
        hospitalId: selectedHospitalId ?? undefined,
        serviceType: typeFilter ? (typeFilter as ServiceType) : undefined,
        page,
        size: 20,
      });
      // Handle both paginated and array responses
      if (Array.isArray(result)) {
        setServices(result);
        setTotalPages(1);
      } else {
        const paginated = result as unknown as PaginatedResponse<MedicalServiceResponse>;
        setServices(paginated.content);
        setTotalPages(paginated.totalPages);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load services';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, [page, typeFilter, selectedHospitalId]);

  const filtered = search
    ? services.filter((s) => s.name.toLowerCase().includes(search.toLowerCase()))
    : services;

  const columns: DataTableColumn<MedicalServiceResponse>[] = [
    { key: 'name', header: 'Name', sortable: true },
    {
      key: 'serviceType',
      header: 'Type',
      render: (row) => (
        <Badge variant="sage" size="sm">
          {SERVICE_TYPE_LABELS[row.serviceType] ?? row.serviceType}
        </Badge>
      ),
    },
    { key: 'categoryName', header: 'Category' },
    {
      key: 'price',
      header: 'Price',
      sortable: true,
      render: (row) => <span className="font-medium">{formatCurrency(row.price)}</span>,
    },
    {
      key: 'requiresAppointment',
      header: 'Appointment',
      render: (row) =>
        row.requiresAppointment ? (
          <Badge variant="terracotta" size="sm">Required</Badge>
        ) : (
          <span className="text-xs text-gray-400">No</span>
        ),
    },
    {
      key: 'enabled',
      header: 'Status',
      render: (row) => (
        <Badge variant={row.enabled ? 'success' : 'error'} size="sm">
          {row.enabled ? 'Active' : 'Disabled'}
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
          icon={<Eye className="h-3.5 w-3.5" />}
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/admin/catalog/services/${row.id}/edit`);
          }}
        >
          View
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
          <Button variant="outline" onClick={fetchServices}>Retry</Button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Medical Services"
        subtitle="Manage medical service catalog"
        actions={
          <Button
            icon={<Plus className="h-4 w-4" />}
            onClick={() => navigate('/admin/catalog/services/create')}
          >
            Add Service
          </Button>
        }
      />

      <DataTableToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search services..."
        filters={
          <Select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setPage(0); }}>
            <option value="">All Types</option>
            {Object.entries(SERVICE_TYPE_LABELS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </Select>
        }
      />

      <motion.div variants={itemVariants} initial="hidden" animate="visible">
        <DataTable
          columns={columns}
          data={filtered}
          loading={loading}
          emptyMessage="No services found"
          onRowClick={(row) => navigate(`/admin/catalog/services/${row.id}/edit`)}
        />
      </motion.div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(page - 1)}>
            Previous
          </Button>
          <span className="text-sm text-gray-500">
            Page {page + 1} of {totalPages}
          </span>
          <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>
            Next
          </Button>
        </div>
      )}
    </PageContainer>
  );
}
