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
import { useHospitalContextStore } from '@/stores/hospital-context.store';

export default function CategoryListPage() {
  const { selectedHospitalId } = useHospitalContextStore();
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
      const data = await catalogCategoriesApi.list(selectedHospitalId ?? undefined);
      setCategories(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : '加载分类失败';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [selectedHospitalId]);

  const openAdd = () => {
    setFormName('');
    setFormDesc('');
    setFormSort('0');
    setDialogMode('add');
    setEditCategory(null);
  };

  const openEdit = (cat: ServiceCategoryResponse) => {
    setFormName(cat.name);
    setFormDesc('');
    setFormSort(String(cat.sortOrder ?? 0));
    setEditCategory(cat);
    setDialogMode('edit');
  };

  const handleSubmit = async () => {
    if (!formName.trim()) {
      toast.error('名称不能为空');
      return;
    }
    setSubmitting(true);
    try {
      if (dialogMode === 'add') {
        await catalogCategoriesApi.create({
          name: formName,
          code: formName.toUpperCase().replace(/\s+/g, '_'),
          sortOrder: Number(formSort) || 0,
        });
        toast.success('分类已创建');
      } else if (dialogMode === 'edit' && editCategory) {
        await catalogCategoriesApi.update(editCategory.id, {
          name: formName,
          code: editCategory.code,
          sortOrder: Number(formSort) || 0,
        });
        toast.success('分类已更新');
      }
      setDialogMode(null);
      setEditCategory(null);
      fetchCategories();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '操作失败');
    } finally {
      setSubmitting(false);
    }
  };

  const columns: DataTableColumn<ServiceCategoryResponse>[] = [
    { key: 'name', header: '名称', sortable: true },
    { key: 'code', header: '编码' },
    {
      key: 'sortOrder',
      header: '排序',
      sortable: true,
      render: (row) => <span className="font-mono text-sm">{row.sortOrder}</span>,
    },
    {
      key: 'status',
      header: '状态',
      render: (row) => <span className="text-xs text-gray-500">{row.status === 'ACTIVE' ? '启用' : row.status === 'INACTIVE' ? '停用' : row.status}</span>,
    },
    {
      key: 'actions',
      header: '操作',
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
          编辑
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
          <Button variant="outline" onClick={fetchCategories}>重试</Button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="服务分类"
        subtitle="管理医疗服务分类"
        actions={
          <Button icon={<Plus className="h-4 w-4" />} onClick={openAdd}>
            添加分类
          </Button>
        }
      />

      <motion.div variants={itemVariants} initial="hidden" animate="visible">
        <DataTable
          columns={columns as any}
          data={categories as any}
          loading={loading}
          emptyMessage="暂无分类"
        />
      </motion.div>

      {/* Add / Edit Dialog */}
      {dialogMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-lg font-semibold text-sage-800">
                {dialogMode === 'add' ? '添加分类' : '编辑分类'}
              </h3>
              <button onClick={() => setDialogMode(null)}>
                <X className="h-5 w-5 text-gray-400" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">名称 *</label>
                <Input value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="分类名称" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">描述</label>
                <Textarea value={formDesc} onChange={(e) => setFormDesc(e.target.value)} rows={2} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">排序</label>
                <Input type="number" value={formSort} onChange={(e) => setFormSort(e.target.value)} />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setDialogMode(null)}>取消</Button>
              <Button loading={submitting} onClick={handleSubmit}>
                {dialogMode === 'add' ? '创建' : '保存'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
