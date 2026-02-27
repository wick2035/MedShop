import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronsLeft, ChevronsRight } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SidebarItem {
  id: string;
  label: string;
  icon: LucideIcon;
  href: string;
  badge?: number;
}

export interface SidebarGroup {
  title?: string;
  items: SidebarItem[];
}

interface SidebarProps {
  items?: SidebarItem[];
  groups?: SidebarGroup[];
  collapsed: boolean;
  onToggleCollapse: () => void;
  className?: string;
}

export default function Sidebar({
  items,
  groups,
  collapsed,
  onToggleCollapse,
  className,
}: SidebarProps) {
  // Build groups from flat items if groups not provided
  const resolvedGroups: SidebarGroup[] = groups ?? (items ? [{ items }] : []);

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 72 : 240 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className={cn(
        'fixed left-0 top-0 z-30 flex h-screen flex-col border-r border-ivory-300/60',
        'bg-white/60 backdrop-blur-xl backdrop-saturate-150',
        'shadow-glass',
        className,
      )}
    >
      {/* Logo area */}
      <div className="flex h-16 items-center border-b border-ivory-300/60 px-4">
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-sage-500 text-white">
            <span className="font-display text-sm font-bold">M</span>
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden whitespace-nowrap font-display text-lg font-semibold text-sage-800"
              >
                MedPay
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-3">
        {resolvedGroups.map((group, groupIndex) => (
          <div key={groupIndex} className={groupIndex > 0 ? 'mt-4' : ''}>
            {/* Group title */}
            <AnimatePresence>
              {group.title && !collapsed && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="mb-1 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-sage-400"
                >
                  {group.title}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Items */}
            <ul className="space-y-0.5">
              {group.items.map((item) => (
                <SidebarNavItem
                  key={item.id}
                  item={item}
                  collapsed={collapsed}
                />
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* Collapse toggle */}
      <div className="border-t border-ivory-300/60 p-2">
        <button
          onClick={onToggleCollapse}
          className={cn(
            'flex w-full items-center rounded-md px-3 py-2 text-sage-700/60 transition-colors hover:bg-ivory-200 hover:text-sage-700',
            collapsed && 'justify-center',
          )}
          aria-label={collapsed ? '展开侧栏' : '收起侧栏'}
        >
          {collapsed ? (
            <ChevronsRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronsLeft className="h-4 w-4" />
              <span className="ml-2 text-sm">收起</span>
            </>
          )}
        </button>
      </div>
    </motion.aside>
  );
}

/* ------------------------------------------------------------------ */
/* Individual nav item                                                */
/* ------------------------------------------------------------------ */

function SidebarNavItem({
  item,
  collapsed,
}: {
  item: SidebarItem;
  collapsed: boolean;
}) {
  const [showTooltip, setShowTooltip] = useState(false);
  const Icon = item.icon;

  return (
    <li className="relative">
      <NavLink
        to={item.href}
        end={item.href.split('/').filter(Boolean).length <= 1}
        onMouseEnter={() => collapsed && setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className={({ isActive }) =>
          cn(
            'group relative flex items-center rounded-md px-3 py-2 text-sm font-medium transition-all duration-150',
            collapsed && 'justify-center px-2',
            isActive
              ? 'bg-sage-500/10 text-sage-600'
              : 'text-sage-700/70 hover:bg-ivory-200 hover:text-sage-700',
          )
        }
      >
        {({ isActive }) => (
          <>
            {/* Active indicator */}
            {isActive && (
              <motion.div
                layoutId="sidebar-active-indicator"
                className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-sage-500"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}

            {/* Icon */}
            <Icon className="h-[18px] w-[18px] flex-shrink-0" />

            {/* Label */}
            <AnimatePresence>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2 }}
                  className="ml-3 overflow-hidden whitespace-nowrap"
                >
                  {item.label}
                </motion.span>
              )}
            </AnimatePresence>

            {/* Badge */}
            {item.badge !== undefined && item.badge > 0 && (
              <span
                className={cn(
                  'ml-auto flex h-5 min-w-[20px] items-center justify-center rounded-full bg-terracotta px-1.5 text-[10px] font-bold text-white',
                  collapsed && 'absolute -right-0.5 -top-0.5 ml-0 h-4 min-w-[16px] text-[9px]',
                )}
              >
                {item.badge > 99 ? '99+' : item.badge}
              </span>
            )}
          </>
        )}
      </NavLink>

      {/* Tooltip for collapsed state */}
      <AnimatePresence>
        {collapsed && showTooltip && (
          <motion.div
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute left-full top-1/2 z-50 ml-2 -translate-y-1/2 whitespace-nowrap rounded-md bg-sage-800 px-2.5 py-1 text-xs font-medium text-white shadow-md"
          >
            {item.label}
            {/* Arrow */}
            <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 border-4 border-transparent border-r-sage-800" />
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  );
}
