import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Phone,
  Shield,
  LogOut,
  Stethoscope,
  Building2,
  DollarSign,
  Star,
  Briefcase,
} from 'lucide-react';
import type { DoctorResponse } from '@/types/doctor';
import PageContainer, {
  containerVariants,
  itemVariants,
} from '@/components/layout/PageContainer';
import PageHeader from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/stores/auth.store';
import { doctorsApi } from '@/api/doctors.api';
import { formatCurrency, getInitials } from '@/lib/utils';
import { USER_ROLE_LABELS } from '@/lib/constants';
import type { UserRole } from '@/types/enums';

export default function ProfilePage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const [doctor, setDoctor] = useState<DoctorResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDoctorProfile() {
      if (!user) return;
      setLoading(true);
      setError(null);
      try {
        // Try to get doctor details by user ID
        const doctors = await doctorsApi.list({
          hospitalId: user.hospitalId ?? undefined,
        });
        const myProfile = doctors.find((d) => d.userId === user.id);
        if (myProfile) {
          setDoctor(myProfile);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to load profile',
        );
      } finally {
        setLoading(false);
      }
    }
    fetchDoctorProfile();
  }, [user]);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  if (loading) {
    return (
      <PageContainer>
        <PageHeader title="Profile" />
        <div className="flex min-h-[300px] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-sage-200 border-t-sage-500" />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <motion.div variants={containerVariants} initial="hidden" animate="visible">
        <motion.div variants={itemVariants}>
          <PageHeader
            title="Profile"
            subtitle="Your account information"
            breadcrumbs={[
              { label: 'Dashboard', href: '/doctor' },
              { label: 'Profile' },
            ]}
          />
        </motion.div>

        {error && (
          <motion.div
            variants={itemVariants}
            className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600"
          >
            {error}
          </motion.div>
        )}

        {/* Doctor Profile Card */}
        <motion.div
          variants={itemVariants}
          className="mb-6 rounded-xl border border-ivory-200 bg-white/80 p-6 shadow-sm backdrop-blur-sm"
        >
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
            {/* Avatar */}
            <div className="flex-shrink-0">
              {doctor?.avatarUrl || user?.avatarUrl ? (
                <img
                  src={doctor?.avatarUrl || user?.avatarUrl}
                  alt={doctor?.fullName || user?.fullName || 'Avatar'}
                  className="h-24 w-24 rounded-full border-4 border-ivory-200 object-cover shadow-sm"
                />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-ivory-200 bg-sage-100 text-2xl font-semibold text-sage-600 shadow-sm">
                  {getInitials(doctor?.fullName || user?.fullName || '?')}
                </div>
              )}
            </div>

            {/* Basic Info */}
            <div className="flex-1 text-center sm:text-left">
              <h2 className="font-display text-2xl font-semibold text-sage-800">
                Dr. {doctor?.fullName || user?.fullName || 'Doctor'}
              </h2>
              {doctor?.title && (
                <p className="mt-0.5 text-sm font-medium text-sage-600">
                  {doctor.title}
                </p>
              )}
              {doctor?.specialty && (
                <div className="mt-2 flex items-center justify-center gap-2 sm:justify-start">
                  <Stethoscope className="h-4 w-4 text-sage-400" />
                  <span className="text-sm text-sage-600">
                    {doctor.specialty}
                  </span>
                </div>
              )}
              {doctor?.departmentName && (
                <div className="mt-1 flex items-center justify-center gap-2 sm:justify-start">
                  <Building2 className="h-4 w-4 text-sage-400" />
                  <span className="text-sm text-sage-600">
                    {doctor.departmentName}
                  </span>
                </div>
              )}
              {doctor?.consultationFee !== undefined && (
                <div className="mt-1 flex items-center justify-center gap-2 sm:justify-start">
                  <DollarSign className="h-4 w-4 text-sage-400" />
                  <span className="text-sm text-sage-600">
                    Consultation Fee: {formatCurrency(doctor.consultationFee)}
                  </span>
                </div>
              )}
            </div>

            {/* Stats side */}
            {doctor && (
              <div className="flex flex-shrink-0 gap-4">
                <div className="flex flex-col items-center rounded-lg bg-ivory-100 px-4 py-3">
                  <Star className="h-5 w-5 text-amber-500" />
                  <span className="mt-1 text-lg font-semibold text-sage-800">
                    --
                  </span>
                  <span className="text-xs text-sage-500">Rating</span>
                </div>
              </div>
            )}
          </div>

          {/* Introduction */}
          {doctor?.introduction && (
            <div className="mt-6 rounded-lg bg-ivory-50 p-4">
              <h3 className="mb-2 text-sm font-medium text-sage-700">
                Introduction
              </h3>
              <p className="text-sm text-sage-600">{doctor.introduction}</p>
            </div>
          )}
        </motion.div>

        {/* Account Information */}
        <motion.div
          variants={itemVariants}
          className="mb-6 rounded-xl border border-ivory-200 bg-white/80 shadow-sm backdrop-blur-sm"
        >
          <div className="border-b border-ivory-200 px-6 py-4">
            <h3 className="font-display text-lg font-semibold text-sage-800">
              Account Information
            </h3>
          </div>

          <div className="divide-y divide-ivory-100">
            <div className="flex items-center gap-4 px-6 py-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sage-50">
                <User className="h-4 w-4 text-sage-500" />
              </div>
              <div>
                <p className="text-xs text-sage-500">Username</p>
                <p className="text-sm font-medium text-sage-800">
                  {user?.username ?? '--'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 px-6 py-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sage-50">
                <User className="h-4 w-4 text-sage-500" />
              </div>
              <div>
                <p className="text-xs text-sage-500">Full Name</p>
                <p className="text-sm font-medium text-sage-800">
                  {user?.fullName ?? '--'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 px-6 py-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sage-50">
                <Phone className="h-4 w-4 text-sage-500" />
              </div>
              <div>
                <p className="text-xs text-sage-500">Phone</p>
                <p className="text-sm font-medium text-sage-800">
                  {user?.phone ?? '--'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 px-6 py-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sage-50">
                <Mail className="h-4 w-4 text-sage-500" />
              </div>
              <div>
                <p className="text-xs text-sage-500">Email</p>
                <p className="text-sm font-medium text-sage-800">
                  {user?.email ?? '--'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 px-6 py-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sage-50">
                <Shield className="h-4 w-4 text-sage-500" />
              </div>
              <div>
                <p className="text-xs text-sage-500">Role</p>
                <p className="text-sm font-medium text-sage-800">
                  {user?.role
                    ? USER_ROLE_LABELS[user.role as UserRole] ?? user.role
                    : '--'}
                </p>
              </div>
            </div>

            {user?.hospitalId && (
              <div className="flex items-center gap-4 px-6 py-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sage-50">
                  <Briefcase className="h-4 w-4 text-sage-500" />
                </div>
                <div>
                  <p className="text-xs text-sage-500">Hospital ID</p>
                  <p className="text-sm font-medium text-sage-800">
                    {user.hospitalId}
                  </p>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Logout */}
        <motion.div variants={itemVariants}>
          <Button
            variant="danger"
            icon={<LogOut className="h-4 w-4" />}
            onClick={handleLogout}
          >
            Logout
          </Button>
        </motion.div>
      </motion.div>
    </PageContainer>
  );
}
