import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Phone,
  Mail,
  Shield,
  LogOut,
  ChevronRight,
} from 'lucide-react';
import { toast } from 'sonner';
import { containerVariants, itemVariants } from '@/components/layout/PageContainer';
import PageHeader from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/stores/auth.store';
import { USER_ROLE_LABELS } from '@/lib/constants';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  function handleLogout() {
    logout();
    toast.success('You have been logged out');
    navigate('/login', { replace: true });
  }

  if (!user) {
    navigate('/login', { replace: true });
    return null;
  }

  const profileFields = [
    { icon: User, label: 'Full Name', value: user.fullName },
    { icon: User, label: 'Username', value: user.username },
    { icon: Phone, label: 'Phone', value: user.phone || 'Not set' },
    { icon: Mail, label: 'Email', value: user.email || 'Not set' },
    { icon: Shield, label: 'Role', value: USER_ROLE_LABELS[user.role] || user.role },
  ];

  const quickLinks = [
    { label: 'My Orders', href: '/patient/orders' },
    { label: 'My Prescriptions', href: '/patient/prescriptions' },
    { label: 'Insurance', href: '/patient/insurance' },
    { label: 'Notifications', href: '/patient/notifications' },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 lg:px-8"
    >
      <motion.div variants={itemVariants}>
        <PageHeader title="Profile" subtitle="View and manage your account" />
      </motion.div>

      {/* Profile card */}
      <motion.div variants={itemVariants}>
        <Card className="p-6 sm:p-8">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
            <Avatar
              name={user.fullName}
              size="xl"
              className="h-20 w-20 text-2xl"
            />
            <div className="flex-1 text-center sm:text-left">
              <h2 className="font-display text-xl font-semibold text-sage-800">
                {user.fullName}
              </h2>
              <p className="mt-0.5 text-sm text-sage-700/60">@{user.username}</p>
              <Badge variant="sage" size="md" className="mt-2">
                {USER_ROLE_LABELS[user.role] || user.role}
              </Badge>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Profile details */}
      <motion.div variants={itemVariants} className="mt-4">
        <Card className="p-6">
          <h3 className="mb-4 text-base font-semibold text-sage-800">Account Information</h3>
          <div className="space-y-4">
            {profileFields.map((field) => (
              <div key={field.label} className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-ivory-100">
                  <field.icon className="h-4 w-4 text-sage-500" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-sage-700/60">{field.label}</p>
                  <p className="text-sm font-medium text-sage-800">{field.value}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Quick links */}
      <motion.div variants={itemVariants} className="mt-4">
        <Card className="p-6">
          <h3 className="mb-4 text-base font-semibold text-sage-800">Quick Links</h3>
          <div className="space-y-1">
            {quickLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => navigate(link.href)}
                className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm text-sage-700 transition-colors hover:bg-ivory-100"
              >
                {link.label}
                <ChevronRight className="h-4 w-4 text-sage-400" />
              </button>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Logout */}
      <motion.div variants={itemVariants} className="mt-6">
        <Button
          variant="outline"
          className="w-full border-red-200 text-red-600 hover:bg-red-50"
          onClick={handleLogout}
          icon={<LogOut className="h-4 w-4" />}
        >
          Log Out
        </Button>
      </motion.div>
    </motion.div>
  );
}
