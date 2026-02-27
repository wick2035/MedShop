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
        setServices(paginated.content ?? []);
        setTotalPages(paginated.totalPages ?? 1);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : '加载服务失败';
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
    { key: 'name', header: '名称', sortable: true },
    {
      key: 'serviceType',
      header: '类型',
      render: (row) => (
        <Badge variant="sage" size="sm">
          {SERVICE_TYPE_LABELS[row.serviceType] ?? row.serviceType}
        </Badge>
      ),
    },
    { key: 'categoryName', header: '分类' },
    {
      key: 'price',
      header: '价格',
      sortable: true,
      render: (row) => <span className="font-medium">{formatCurrency(row.price)}</span>,
    },
    {
      key: 'requiresPrescription',
      header: '处方',
      render: (row) =>
        row.requiresPrescription ? (
          <Badge variant="terracotta" size="sm">需要</Badge>
        ) : (
          <span className="text-xs text-gray-400">否</span>
        ),
    },
    {
      key: 'status',
      header: '状态',
      render: (row) => (
        <Badge variant={row.status === 'ACTIVE' ? 'success' : 'error'} size="sm">
          {row.status === 'ACTIVE' ? '启用' : row.status === 'INACTIVE' ? '停用' : row.status}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: '操作',
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
          查看
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
          <Button variant="outline" onClick={fetchServices}>重试</Button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="医疗服务"
        subtitle="管理医疗服务目录"
        actions={
          <Button
            icon={<Plus className="h-4 w-4" />}
            onClick={() => navigate('/admin/catalog/services/create')}
          >
            添加服务
          </Button>
        }
      />

      <DataTableToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="搜索服务..."
        filters={
          <Select
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value); setPage(0); }}
            options={[
              { value: '', label: '全部类型' },
              ...Object.entries(SERVICE_TYPE_LABELS).map(([key, label]) => ({
                value: key,
                label: label,
              })),
            ]}
          />
        }
      />

      <motion.div variants={itemVariants} initial="hidden" animate="visible">
        <DataTable
          columns={columns as any}
          data={filtered as any}
          loading={loading}
          emptyMessage="暂无服务"
          onRowClick={(row) => navigate(`/admin/catalog/services/${row.id}/edit`)}
        />
      </motion.div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(page - 1)}>
            上一页
          </Button>
          <span className="text-sm text-gray-500">
            第 {page + 1} 页 / 共 {totalPages} 页
          </span>
          <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>
            下一页
          </Button>
        </div>
      )}
    </PageContainer>
  );
}
