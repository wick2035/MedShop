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
      const msg = err instanceof Error ? err.message : 'Failed to load products';
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
    { key: 'name', header: 'Name', sortable: true },
    {
      key: 'productType',
      header: 'Type',
      render: (row) => (
        <Badge variant="sage" size="sm">
          {PRODUCT_TYPE_LABELS[row.productType] ?? row.productType}
        </Badge>
      ),
    },
    { key: 'manufacturer', header: 'Manufacturer' },
    {
      key: 'price',
      header: 'Price',
      sortable: true,
      render: (row) => <span className="font-medium">{formatCurrency(row.price)}</span>,
    },
    {
      key: 'stockQuantity',
      header: 'Stock',
      sortable: true,
      render: (row) => (
        <span className={row.stockQuantity < 10 ? 'font-medium text-red-600' : 'text-gray-700'}>
          {row.stockQuantity}
        </span>
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
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/admin/catalog/products/${row.id}/edit`);
            }}
          >
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/admin/catalog/products/${row.id}/stock`);
            }}
          >
            Stock
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
          <Button variant="outline" onClick={fetchProducts}>Retry</Button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Products & Medicines"
        subtitle="Manage products, medicines, and medical devices"
        actions={
          <Button
            icon={<Plus className="h-4 w-4" />}
            onClick={() => navigate('/admin/catalog/products/create')}
          >
            Add Product
          </Button>
        }
      />

      <DataTableToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search products..."
        filters={
          <Select
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value); setPage(0); }}
            options={[
              { value: '', label: 'All Types' },
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
          emptyMessage="No products found"
        />
      </motion.div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(page - 1)}>Previous</Button>
          <span className="text-sm text-gray-500">Page {page + 1} of {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>Next</Button>
        </div>
      )}
    </PageContainer>
  );
}
