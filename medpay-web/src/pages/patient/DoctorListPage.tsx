import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Search, Stethoscope, Star } from 'lucide-react';
import { containerVariants, itemVariants } from '@/components/layout/PageContainer';
import PageHeader from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { doctorsApi } from '@/api/doctors.api';
import { hospitalsApi } from '@/api/hospitals.api';
import { departmentsApi } from '@/api/departments.api';
import { formatCurrency } from '@/lib/utils';
import type { DoctorResponse } from '@/types/doctor';
import type { HospitalResponse } from '@/types/hospital';
import type { DepartmentResponse } from '@/types/hospital';

export default function DoctorListPage() {
  const navigate = useNavigate();

  const [doctors, setDoctors] = useState<DoctorResponse[]>([]);
  const [hospitals, setHospitals] = useState<HospitalResponse[]>([]);
  const [departments, setDepartments] = useState<DepartmentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedHospital, setSelectedHospital] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [searchName, setSearchName] = useState('');

  useEffect(() => {
    hospitalsApi.list().then(setHospitals).catch(() => {});
  }, []);

  useEffect(() => {
    if (selectedHospital) {
      departmentsApi.list(selectedHospital).then(setDepartments).catch(() => {});
    } else {
      setDepartments([]);
      setSelectedDepartment('');
    }
  }, [selectedHospital]);

  useEffect(() => {
    async function fetchDoctors() {
      setLoading(true);
      setError(null);
      try {
        const result = await doctorsApi.list({
          hospitalId: selectedHospital || undefined,
          departmentId: selectedDepartment || undefined,
        });
        setDoctors(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : '加载医生列表失败');
      } finally {
        setLoading(false);
      }
    }
    fetchDoctors();
  }, [selectedHospital, selectedDepartment]);

  const filteredDoctors = doctors.filter((doc) =>
    searchName ? doc.fullName.toLowerCase().includes(searchName.toLowerCase()) : true,
  );

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8"
    >
      <motion.div variants={itemVariants}>
        <PageHeader title="找医生" subtitle="浏览医生信息并预约挂号" />
      </motion.div>

      {/* Filters */}
      <motion.div variants={itemVariants} className="mb-6 flex flex-col gap-4 sm:flex-row">
        <div className="sm:w-56">
          <Select
            placeholder="全部医院"
            options={[
              { value: '', label: '全部医院' },
              ...hospitals.map((h) => ({ value: h.id, label: h.name })),
            ]}
            value={selectedHospital}
            onChange={(e) => setSelectedHospital(e.target.value)}
          />
        </div>
        <div className="sm:w-56">
          <Select
            placeholder="全部科室"
            options={[
              { value: '', label: '全部科室' },
              ...departments.map((d) => ({ value: d.id, label: d.name })),
            ]}
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            disabled={!selectedHospital}
          />
        </div>
        <div className="flex-1">
          <Input
            icon={Search}
            placeholder="搜索医生姓名..."
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
          />
        </div>
      </motion.div>

      {/* Doctor grid */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton-shimmer h-48 rounded-lg" />
          ))}
        </div>
      ) : error ? (
        <Card className="py-12 text-center">
          <p className="text-sm text-red-500">{error}</p>
        </Card>
      ) : filteredDoctors.length === 0 ? (
        <Card className="py-12 text-center">
          <Stethoscope className="mx-auto h-10 w-10 text-sage-300" />
          <p className="mt-3 text-sm text-sage-700/60">未找到医生</p>
        </Card>
      ) : (
        <motion.div variants={itemVariants} className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredDoctors.map((doctor) => (
            <Card
              key={doctor.id}
              hover
              className="cursor-pointer p-5"
            >
              <button
                onClick={() => navigate(`/patient/doctors/${doctor.id}`)}
                className="flex w-full items-start gap-4 text-left"
              >
                <Avatar
                  name={doctor.fullName}
                  size="lg"
                />
                <div className="flex-1 overflow-hidden">
                  <h3 className="font-display text-base font-semibold text-sage-800">
                    {doctor.fullName}
                  </h3>
                  <p className="mt-0.5 text-xs text-sage-500">{doctor.title}</p>
                  <p className="mt-1 truncate text-xs text-sage-700/60">
                    {doctor.specialty}
                  </p>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 fill-muted-gold text-muted-gold" />
                      <span className="text-xs font-medium text-sage-700">{doctor.ratingScore.toFixed(1)}</span>
                    </div>
                    <span className="text-sm font-semibold text-terracotta">
                      {formatCurrency(doctor.consultationFee)}
                    </span>
                  </div>
                </div>
              </button>
            </Card>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}
