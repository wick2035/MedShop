import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Edit, Building2, Phone, Mail, MapPin, AlertCircle, GitBranch } from 'lucide-react';
import { toast } from 'sonner';

import type { HospitalResponse } from '@/types/hospital';
import { HospitalStatus } from '@/types/enums';

import PageContainer, { itemVariants } from '@/components/layout/PageContainer';
import PageHeader from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

import { hospitalsApi } from '@/api/hospitals.api';
import { HOSPITAL_STATUS_LABELS, HOSPITAL_STATUS_COLORS } from '@/lib/constants';
import { cn, formatDateTime } from '@/lib/utils';

export default function HospitalDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [hospital, setHospital] = useState<HospitalResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusUpdating, setStatusUpdating] = useState(false);

  const fetchHospital = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await hospitalsApi.getById(id);
      setHospital(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : '加载医院失败';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHospital();
  }, [id]);

  const handleStatusChange = async (status: HospitalStatus) => {
    if (!id) return;
    setStatusUpdating(true);
    try {
      await hospitalsApi.updateStatus(id, status);
      toast.success(`医院状态已更新为 ${HOSPITAL_STATUS_LABELS[status]}`);
      fetchHospital();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '更新状态失败');
    } finally {
      setStatusUpdating(false);
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

  if (error || !hospital) {
    return (
      <PageContainer>
        <div className="flex h-64 flex-col items-center justify-center gap-4 text-gray-500">
          <AlertCircle className="h-12 w-12 text-red-400" />
          <p>{error ?? '未找到医院'}</p>
          <Button variant="outline" onClick={fetchHospital}>
            重试
          </Button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title={hospital.name}
        breadcrumbs={[
          { label: '医院', href: '/admin/hospitals' },
          { label: hospital.name },
        ]}
        actions={
          <div className="flex items-center gap-3">
            <Link to={`/admin/hospitals/${id}/departments`}>
              <Button variant="outline" icon={<GitBranch className="h-4 w-4" />}>
                科室
              </Button>
            </Link>
            <Link to={`/admin/hospitals/${id}/edit`}>
              <Button variant="secondary" icon={<Edit className="h-4 w-4" />}>
                编辑
              </Button>
            </Link>
          </div>
        }
      />

      <motion.div
        variants={itemVariants}
        initial="hidden"
        animate="visible"
        className="rounded-lg border border-ivory-200/60 bg-white/70 p-6 backdrop-blur-sm"
      >
        <div className="mb-6 flex items-start gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-sage-50 text-sage-500">
            <Building2 className="h-8 w-8" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h2 className="font-display text-xl font-semibold text-sage-800">
                {hospital.name}
              </h2>
              <span
                className={cn(
                  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                  HOSPITAL_STATUS_COLORS[hospital.status] ?? 'bg-gray-100 text-gray-700',
                )}
              >
                {HOSPITAL_STATUS_LABELS[hospital.status] ?? hospital.status}
              </span>
            </div>
            {hospital.licenseNumber && (
              <p className="mt-1 text-sm text-gray-500">执照号：{hospital.licenseNumber}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex items-center gap-3 rounded-md bg-ivory-50 p-3">
            <MapPin className="h-4 w-4 text-gray-400" />
            <div>
              <p className="text-xs text-gray-400">地址</p>
              <p className="text-sm text-gray-700">{hospital.address}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-md bg-ivory-50 p-3">
            <Phone className="h-4 w-4 text-gray-400" />
            <div>
              <p className="text-xs text-gray-400">电话</p>
              <p className="text-sm text-gray-700">{hospital.contactPhone}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-md bg-ivory-50 p-3">
            <Mail className="h-4 w-4 text-gray-400" />
            <div>
              <p className="text-xs text-gray-400">邮箱</p>
              <p className="text-sm text-gray-700">{hospital.contactEmail || '--'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-md bg-ivory-50 p-3">
            <Building2 className="h-4 w-4 text-gray-400" />
            <div>
              <p className="text-xs text-gray-400">套餐</p>
              <p className="text-sm text-gray-700">
                <Badge variant="sage" size="sm">
                  {hospital.subscriptionTier}
                </Badge>
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2 text-xs text-gray-400">
          <span>创建时间：{formatDateTime(hospital.createdAt)}</span>
          <span>|</span>
          <span>更新时间：{formatDateTime(hospital.updatedAt)}</span>
        </div>

        {/* Status change actions */}
        <div className="mt-6 border-t border-ivory-200 pt-4">
          <p className="mb-3 text-sm font-medium text-gray-600">变更状态</p>
          <div className="flex gap-2">
            {Object.values(HospitalStatus)
              .filter((s) => s !== hospital.status)
              .map((status) => (
                <Button
                  key={status}
                  variant={status === HospitalStatus.DEACTIVATED ? 'danger' : 'outline'}
                  size="sm"
                  loading={statusUpdating}
                  onClick={() => handleStatusChange(status)}
                >
                  {HOSPITAL_STATUS_LABELS[status]}
                </Button>
              ))}
          </div>
        </div>
      </motion.div>
    </PageContainer>
  );
}
