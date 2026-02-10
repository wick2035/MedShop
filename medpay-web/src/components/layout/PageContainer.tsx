import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
    },
  },
};

export const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 300,
      damping: 24,
    },
  },
};

interface PageContainerProps {
  children: ReactNode;
  className?: string;
  title?: string;
}

export default function PageContainer({ children, className, title }: PageContainerProps) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={cn('mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8', className)}
    >
      {title && (
        <motion.h1
          variants={itemVariants}
          className="mb-6 font-display text-2xl font-semibold text-sage-800"
        >
          {title}
        </motion.h1>
      )}
      {children}
    </motion.div>
  );
}
