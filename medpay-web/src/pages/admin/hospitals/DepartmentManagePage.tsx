import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, GitBranch, AlertCircle, X } from 'lucide-react';
import { toast } from 'sonner';

import type { DepartmentResponse } from '@/types/department';

import PageContainer, { containerVariants, itemVariants } from '@/components/layout/PageContainer';
import PageHeader from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';

import { departmentsApi } from '@/api/departments.api';
import { hospitalsApi } from '@/api/hospitals.api';

export default function DepartmentManagePage() {
  const { hospitalId } = useParams<{ hospitalId: string }>();

  const [departments, setDepartments] = useState<DepartmentResponse[]>([]);
  const [hospitalName, setHospitalName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dialog states
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editDept, setEditDept] = useState<DepartmentResponse | null>(null);
  const [deleteDept, setDeleteDept] = useState<DepartmentResponse | null>(null);
  const [detailDept, setDetailDept] = useState<DepartmentResponse | null>(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formSort, setFormSort] = useState('0');
  const [formSubmitting, setFormSubmitting] = useState(false);

  const fetchData = async () => {
    if (!hospitalId) return;
    setLoading(true);
    setError(null);
    try {
      const [depts, hosp] = await Promise.all([
        departmentsApi.list(hospitalId),
        hospitalsApi.getById(hospitalId),
      ]);
      setDepartments(depts);
      setHospitalName(hosp.name);
    } catch (err) {
      const msg = err instanceof Error ? err.message : '加载科室列表失败';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [hospitalId]);

  const openAdd = () => {
    setFormName('');
    setFormDesc('');
    setFormSort('0');
    setShowAddDialog(true);
  };

  const openEdit = (dept: DepartmentResponse) => {
    setFormName(dept.name);
    setFormDesc(dept.description ?? '');
    setFormSort(String(dept.sortOrder ?? 0));
    setEditDept(dept);
  };

  const handleAdd = async () => {
    if (!hospitalId || !formName.trim()) {
      toast.error('名称为必填项');
      return;
    }
    setFormSubmitting(true);
    try {
      await departmentsApi.create(hospitalId, {
        name: formName,
        code: formName.toUpperCase().replace(/\s+/g, '-'),
        description: formDesc || undefined,
        sortOrder: Number(formSort) || 0,
      });
      toast.success('科室已创建');
      setShowAddDialog(false);
      fetchData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '创建科室失败');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleEdit = async () => {
    if (!hospitalId || !editDept || !formName.trim()) {
      toast.error('名称为必填项');
      return;
    }
    setFormSubmitting(true);
    try {
      await departmentsApi.update(hospitalId, editDept.id, {
        name: formName,
        code: formName.toUpperCase().replace(/\s+/g, '-'),
        description: formDesc || undefined,
        sortOrder: Number(formSort) || 0,
      });
      toast.success('科室已更新');
      setEditDept(null);
      fetchData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '更新科室失败');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!hospitalId || !deleteDept) return;
    setFormSubmitting(true);
    try {
      await departmentsApi.remove(hospitalId, deleteDept.id);
      toast.success('科室已删除');
      setDeleteDept(null);
      fetchData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '删除科室失败');
    } finally {
      setFormSubmitting(false);
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
          <Button variant="outline" onClick={fetchData}>
            重试
          </Button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="科室管理"
        subtitle={hospitalName}
        breadcrumbs={[
          { label: '医院', href: '/admin/hospitals' },
          { label: hospitalName, href: `/admin/hospitals/${hospitalId}` },
          { label: '科室' },
        ]}
        actions={
          <Button icon={<Plus className="h-4 w-4" />} onClick={openAdd}>
            添加科室
          </Button>
        }
      />

      {departments.length === 0 ? (
        <div className="flex h-48 flex-col items-center justify-center gap-2 text-gray-400">
          <GitBranch className="h-12 w-12 text-gray-300" />
          <p className="text-sm">暂无科室</p>
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-3"
        >
          {departments.map((dept) => (
            <motion.div
              key={dept.id}
              variants={itemVariants}
              className="flex items-center justify-between rounded-lg border border-ivory-200/60 bg-white/70 p-4 backdrop-blur-sm transition-all hover:shadow-sm"
            >
              <div
                className="flex-1 cursor-pointer"
                onClick={() => setDetailDept(dept)}
              >
                <div className="flex items-center gap-2">
                  <GitBranch className="h-4 w-4 text-sage-400" />
                  <h3 className="font-medium text-sage-800">{dept.name}</h3>
                  <span className="text-xs text-gray-400">#{dept.sortOrder}</span>
                </div>
                {dept.description && (
                  <p className="mt-1 pl-6 text-sm text-gray-500">{dept.description}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => openEdit(dept)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setDeleteDept(dept)}>
                  <Trash2 className="h-4 w-4 text-red-400" />
                </Button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Add Dialog */}
      {showAddDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-lg font-semibold text-sage-800">添加科室</h3>
              <button onClick={() => setShowAddDialog(false)}>
                <X className="h-5 w-5 text-gray-400" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">名称 *</label>
                <Input value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="科室名称" />
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
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>取消</Button>
              <Button loading={formSubmitting} onClick={handleAdd}>创建</Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Sheet */}
      {editDept && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40">
          <div className="h-full w-full max-w-md overflow-y-auto bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-lg font-semibold text-sage-800">编辑科室</h3>
              <button onClick={() => setEditDept(null)}>
                <X className="h-5 w-5 text-gray-400" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">名称 *</label>
                <Input value={formName} onChange={(e) => setFormName(e.target.value)} />
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
              <Button variant="outline" onClick={() => setEditDept(null)}>取消</Button>
              <Button loading={formSubmitting} onClick={handleEdit}>保存</Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteDept && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl">
            <h3 className="mb-2 font-display text-lg font-semibold text-sage-800">删除科室</h3>
            <p className="mb-4 text-sm text-gray-600">
              确定要删除 <strong>{deleteDept.name}</strong> 吗？此操作不可撤销。
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setDeleteDept(null)}>取消</Button>
              <Button variant="danger" loading={formSubmitting} onClick={handleDelete}>删除</Button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Sheet */}
      {detailDept && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40">
          <div className="h-full w-full max-w-md overflow-y-auto bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-lg font-semibold text-sage-800">{detailDept.name}</h3>
              <button onClick={() => setDetailDept(null)}>
                <X className="h-5 w-5 text-gray-400" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-400">ID</p>
                <p className="font-mono text-sm text-gray-700">{detailDept.id}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">描述</p>
                <p className="text-sm text-gray-700">{detailDept.description || '--'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">排序</p>
                <p className="text-sm text-gray-700">{detailDept.sortOrder}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
