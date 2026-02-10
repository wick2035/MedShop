import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, AlertCircle, X, FolderTree } from 'lucide-react';
import { toast } from 'sonner';

import type { ServiceCategoryResponse } from '@/types/catalog';

import PageContainer, { itemVariants } from '@/components/layout/PageContainer';
import PageHeader from '@/components/layout/PageHeader';
import DataTable from '@/components/data/DataTable';
import type { DataTableColumn } from '@/components/data/DataTable';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';

import { catalogCategoriesApi } from '@/api/catalog-categories.api';
import { formatDateTime } from '@/lib/utils';

export default function CategoryListPage() {
  const [categories, setCategories] = useState<ServiceCategoryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dialog state
  const [dialogMode, setDialogMode] = useState<'add' | 'edit' | null>(null);
  const [editCategory, setEditCategory] = useState<ServiceCategoryResponse | null>(null);
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formSort, setFormSort] = useState('0');
  const [submitting, setSubmitting] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await catalogCategoriesApi.list();
      setCategories(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load categories';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openAdd = () => {
    setFormName('');
    setFormDesc('');
    setFormSort('0');
    setDialogMode('add');
    setEditCategory(null);
  };

  const openEdit = (cat: ServiceCategoryResponse) => {
    setFormName(cat.name);
    setFormDesc(cat.description ?? '');
    setFormSort(String(cat.sortOrder ?? 0));
    setEditCategory(cat);
    setDialogMode('edit');
  };

  const handleSubmit = async () => {
    if (!formName.trim()) {
      toast.error('Name is required');
      return;
    }
    setSubmitting(true);
    try {
      if (dialogMode === 'add') {
        await catalogCategoriesApi.create({
          name: formName,
          description: formDesc || undefined,
          sortOrder: Number(formSort) || 0,
        });
        toast.success('Category created');
      } else if (dialogMode === 'edit' && editCategory) {
        await catalogCategoriesApi.update(editCategory.id, {
          name: formName,
          description: formDesc || undefined,
          sortOrder: Number(formSort) || 0,
        });
        toast.success('Category updated');
      }
      setDialogMode(null);
      setEditCategory(null);
      fetchCategories();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const columns: DataTableColumn<ServiceCategoryResponse>[] = [
    { key: 'name', header: 'Name', sortable: true },
    { key: 'description', header: 'Description' },
    {
      key: 'sortOrder',
      header: 'Sort Order',
      sortable: true,
      render: (row) => <span className="font-mono text-sm">{row.sortOrder}</span>,
    },
    {
      key: 'createdAt',
      header: 'Created',
      render: (row) => <span className="text-xs text-gray-500">{formatDateTime(row.createdAt)}</span>,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <Button
          variant="ghost"
          size="sm"
          icon={<Edit className="h-3.5 w-3.5" />}
          onClick={(e) => {
            e.stopPropagation();
            openEdit(row);
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
          <Button variant="outline" onClick={fetchCategories}>Retry</Button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Service Categories"
        subtitle="Manage medical service categories"
        actions={
          <Button icon={<Plus className="h-4 w-4" />} onClick={openAdd}>
            Add Category
          </Button>
        }
      />

      <motion.div variants={itemVariants} initial="hidden" animate="visible">
        <DataTable
          columns={columns}
          data={categories}
          loading={loading}
          emptyMessage="No categories found"
        />
      </motion.div>

      {/* Add / Edit Dialog */}
      {dialogMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-lg font-semibold text-sage-800">
                {dialogMode === 'add' ? 'Add Category' : 'Edit Category'}
              </h3>
              <button onClick={() => setDialogMode(null)}>
                <X className="h-5 w-5 text-gray-400" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Name *</label>
                <Input value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="Category name" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Description</label>
                <Textarea value={formDesc} onChange={(e) => setFormDesc(e.target.value)} rows={2} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Sort Order</label>
                <Input type="number" value={formSort} onChange={(e) => setFormSort(e.target.value)} />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setDialogMode(null)}>Cancel</Button>
              <Button loading={submitting} onClick={handleSubmit}>
                {dialogMode === 'add' ? 'Create' : 'Save'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
