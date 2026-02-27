import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Eye, Package, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

import type { ProductResponse } from '@/types/catalog';
import type { PaginatedResponse } from '@/types/api';
import { ProductType } from '@/types/enums';

import PageContainer, { itemVariants } from '@/components/layout/PageContainer';
import PageHeader from '@/components/layout/PageHeader';
import DataTable from '@/components/data/DataTable';
import type { DataTableColumn } from '@/components/data/DataTable';
import DataTableToolbar from '@/components/data/DataTableToolbar';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Select';

import { productsApi } from '@/api/products.api';
import { PRODUCT_TYPE_LABELS } from '@/lib/constants';
import { formatCurrency } from '@/lib/utils';
import { useHospitalContextStore } from '@/stores/hospital-context.store';

export default function ProductListPage() {
  const navigate = useNavigate();
  const { selectedHospitalId } = useHospitalContextStore();

  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await productsApi.list({
        hospitalId: selectedHospitalId ?? undefined,
        productType: typeFilter ? (typeFilter as ProductType) : undefined,
        page,
        size: 20,
      });
      if (Array.isArray(result)) {
        setProducts(result);
        setTotalPages(1);
      } else {
        const paginated = result as unknown as PaginatedResponse<ProductResponse>;
        setProducts(paginated.content ?? []);
        setTotalPages(paginated.totalPages ?? 1);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : '加载商品失败';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page, typeFilter, selectedHospitalId]);

  const filtered = search
    ? products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
    : products;

  const columns: DataTableColumn<ProductResponse>[] = [
    { key: 'name', header: '名称', sortable: true },
    {
      key: 'productType',
      header: '类型',
      render: (row) => (
        <Badge variant="sage" size="sm">
          {PRODUCT_TYPE_LABELS[row.productType] ?? row.productType}
        </Badge>
      ),
    },
    { key: 'manufacturer', header: '生产厂商' },
    {
      key: 'price',
      header: '价格',
      sortable: true,
      render: (row) => <span className="font-medium">{formatCurrency(row.price)}</span>,
    },
    {
      key: 'stockQuantity',
      header: '库存',
      sortable: true,
      render: (row) => (
        <span className={row.stockQuantity < 10 ? 'font-medium text-red-600' : 'text-gray-700'}>
          {row.stockQuantity}
        </span>
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
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/admin/catalog/products/${row.id}/edit`);
            }}
          >
            编辑
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/admin/catalog/products/${row.id}/stock`);
            }}
          >
            库存
          </Button>
        </div>
      ),
    },
  ];

  if (error) {
    return (
      <PageContainer>
        <div className="flex h-64 flex-col items-center justify-center gap-4 text-gray-500">
          <AlertCircle className="h-12 w-12 text-red-400" />
          <p>{error}</p>
          <Button variant="outline" onClick={fetchProducts}>重试</Button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="商品与药品"
        subtitle="管理商品、药品和医疗器械"
        actions={
          <Button
            icon={<Plus className="h-4 w-4" />}
            onClick={() => navigate('/admin/catalog/products/create')}
          >
            添加商品
          </Button>
        }
      />

      <DataTableToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="搜索商品..."
        filters={
          <Select
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value); setPage(0); }}
            options={[
              { value: '', label: '全部类型' },
              ...Object.entries(PRODUCT_TYPE_LABELS).map(([key, label]) => ({
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
          emptyMessage="暂无商品"
        />
      </motion.div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(page - 1)}>上一页</Button>
          <span className="text-sm text-gray-500">第 {page + 1} 页 / 共 {totalPages} 页</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>下一页</Button>
        </div>
      )}
    </PageContainer>
  );
}
