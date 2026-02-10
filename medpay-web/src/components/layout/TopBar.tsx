import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, Bell, ChevronDown, LogOut, User, Building2 } from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import { useHospitalContextStore } from '@/stores/hospital-context.store';
import { UserRole } from '@/types/enums';
import { cn, getInitials } from '@/lib/utils';

interface TopBarProps {
  title?: string;
  showHospitalSelector?: boolean;
  onMenuClick?: () => void;
  className?: string;
}

export default function TopBar({
  title,
  showHospitalSelector = false,
  onMenuClick,
  className,
}: TopBarProps) {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { selectedHospitalId, setHospitalId } = useHospitalContextStore();

  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const isSuperAdmin = user?.role === UserRole.SUPER_ADMIN;
  const shouldShowHospitalSelector = showHospitalSelector && isSuperAdmin;

  // Close user menu on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <header
      className={cn(
        'sticky top-0 z-20 flex h-16 items-center justify-between border-b border-ivory-300 bg-white/80 px-4 backdrop-blur-lg sm:px-6',
        className,
      )}
    >
      {/* Left section */}
      <div className="flex items-center gap-3">
        {/* Mobile hamburger */}
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="rounded-md p-2 text-sage-700/70 transition-colors hover:bg-ivory-200 hover:text-sage-700 lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}

        {/* Page title */}
        {title && (
          <h2 className="font-display text-lg font-semibold text-sage-800">
            {title}
          </h2>
        )}
      </div>

      {/* Right section */}
      <div className="flex items-center gap-3">
        {/* Hospital selector (SUPER_ADMIN only) */}
        {shouldShowHospitalSelector && (
          <div className="hidden items-center gap-2 sm:flex">
            <Building2 className="h-4 w-4 text-sage-400" />
            <select
              value={selectedHospitalId ?? ''}
              onChange={(e) => setHospitalId(e.target.value || null)}
              className="h-9 rounded-md border border-ivory-300 bg-white/80 px-3 pr-8 text-sm text-sage-700 transition-colors focus:border-sage-400 focus:outline-none focus:ring-1 focus:ring-sage-400"
            >
              <option value="">All Hospitals</option>
              {/* Hospital options will be populated by the parent or a data-fetching hook */}
            </select>
          </div>
        )}

        {/* Notification bell */}
        <button
          className="relative rounded-md p-2 text-sage-700/70 transition-colors hover:bg-ivory-200 hover:text-sage-700"
          aria-label="Notifications"
          onClick={() => navigate('notifications')}
        >
          <Bell className="h-5 w-5" />
          {/* Unread indicator dot */}
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-terracotta ring-2 ring-white" />
        </button>

        {/* User avatar & dropdown */}
        <div ref={userMenuRef} className="relative">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2 rounded-md px-2 py-1.5 transition-colors hover:bg-ivory-200"
          >
            {/* Avatar */}
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.fullName}
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sage-100 text-xs font-semibold text-sage-600">
                {getInitials(user?.fullName ?? '')}
              </div>
            )}

            {/* Name (hidden on small screens) */}
            <span className="hidden text-sm font-medium text-sage-700 md:inline-block">
              {user?.fullName}
            </span>
            <ChevronDown
              className={cn(
                'hidden h-4 w-4 text-sage-400 transition-transform md:block',
                userMenuOpen && 'rotate-180',
              )}
            />
          </button>

          {/* Dropdown menu */}
          <AnimatePresence>
            {userMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -4, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full z-50 mt-1 w-56 overflow-hidden rounded-lg border border-ivory-300 bg-white py-1 shadow-lg"
              >
                {/* User info header */}
                <div className="border-b border-ivory-200 px-4 py-3">
                  <p className="text-sm font-medium text-sage-800">{user?.fullName}</p>
                  <p className="mt-0.5 text-xs text-sage-700/60">{user?.email}</p>
                </div>

                <button
                  onClick={() => {
                    setUserMenuOpen(false);
                    navigate('profile');
                  }}
                  className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-sage-700 transition-colors hover:bg-ivory-100"
                >
                  <User className="h-4 w-4" />
                  Profile
                </button>

                <div className="my-1 border-t border-ivory-200" />

                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-600 transition-colors hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                  Log out
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
