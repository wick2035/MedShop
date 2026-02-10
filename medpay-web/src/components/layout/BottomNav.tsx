import { NavLink } from 'react-router-dom';
import { Home, Stethoscope, ClipboardList, Bell, User } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BottomNavItem {
  label: string;
  icon: LucideIcon;
  href: string;
}

const navItems: BottomNavItem[] = [
  { label: 'Home', icon: Home, href: '/patient' },
  { label: 'Services', icon: Stethoscope, href: '/patient/services' },
  { label: 'Orders', icon: ClipboardList, href: '/patient/orders' },
  { label: 'Messages', icon: Bell, href: '/patient/notifications' },
  { label: 'Profile', icon: User, href: '/patient/profile' },
];

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-ivory-300 bg-white md:hidden">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.label}
              to={item.href}
              end={item.href === '/patient'}
              className={({ isActive }) =>
                cn(
                  'flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-medium transition-colors',
                  isActive ? 'text-sage-500' : 'text-sage-400',
                )
              }
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>

      {/* Safe area inset for iOS */}
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
}
