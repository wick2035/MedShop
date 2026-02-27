import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Building2, AlertCircle, Search } from 'lucide-react';
import { toast } from 'sonner';

import type { HospitalResponse } from '@/types/hospital';

import PageContainer, { containerVariants, itemVariants } from '@/components/layout/PageContainer';
import PageHeader from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

import { hospitalsApi } from '@/api/hospitals.api';
import { HOSPITAL_STATUS_LABELS, HOSPITAL_STATUS_COLORS } from '@/lib/constants';
import { cn } from '@/lib/utils';

export default function HospitalListPage() {
  const navigate = useNavigate();
  const [hospitals, setHospitals] = useState<HospitalResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const fetchHospitals = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await hospitalsApi.list();
      setHospitals(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : '加载医院列表失败';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHospitals();
  }, []);

  const filtered = hospitals.filter(
    (h) =>
      h.name.toLowerCase().includes(search.toLowerCase()) ||
      h.address.toLowerCase().includes(search.toLowerCase()),
  );

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
          <Button variant="outline" onClick={fetchHospitals}>
            重试
          </Button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="医院管理"
        subtitle="管理系统中的医院"
        actions={
          <Button icon={<Plus className="h-4 w-4" />} onClick={() => navigate('/admin/hospitals/create')}>
            添加医院
          </Button>
        }
      />

      {/* Search */}
      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="搜索医院..."
          className="w-full rounded-md border border-ivory-200 bg-white py-2 pl-9 pr-3 text-sm text-gray-700 placeholder:text-gray-400 focus:border-sage-300 focus:outline-none focus:ring-2 focus:ring-sage-500/20"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="flex h-48 flex-col items-center justify-center gap-2 text-gray-400">
          <Building2 className="h-12 w-12 text-gray-300" />
          <p className="text-sm">未找到医院</p>
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
        >
          {filtered.map((hospital) => (
            <motion.div
              key={hospital.id}
              variants={itemVariants}
              onClick={() => navigate(`/admin/hospitals/${hospital.id}`)}
              className="cursor-pointer rounded-lg border border-ivory-200/60 bg-white/70 p-5 backdrop-blur-sm transition-all hover:shadow-md"
            >
              <div className="mb-3 flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sage-50 text-sage-500">
                  <Building2 className="h-5 w-5" />
                </div>
                <span
                  className={cn(
                    'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                    HOSPITAL_STATUS_COLORS[hospital.status as keyof typeof HOSPITAL_STATUS_COLORS] ?? 'bg-gray-100 text-gray-700',
                  )}
                >
                  {HOSPITAL_STATUS_LABELS[hospital.status as keyof typeof HOSPITAL_STATUS_LABELS] ?? hospital.status}
                </span>
              </div>
              <h3 className="mb-1 font-display text-lg font-semibold text-sage-800">
                {hospital.name}
              </h3>
              <p className="mb-2 text-sm text-gray-500">{hospital.address}</p>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span>{hospital.contactPhone}</span>
                <span>|</span>
                <Badge variant="sage" size="sm">
                  {hospital.subscriptionTier}
                </Badge>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </PageContainer>
  );
}
