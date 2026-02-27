import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ShieldX } from 'lucide-react';

export default function ForbiddenPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-ivory-50 px-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 24 }}
        className="text-center"
      >
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-terracotta/10">
          <ShieldX className="h-8 w-8 text-terracotta" />
        </div>
        <h1 className="font-display text-4xl font-semibold text-sage-800">403</h1>
        <p className="mt-2 text-lg text-sage-700/60">
          您没有权限访问此页面
        </p>
        <Link
          to="/"
          className="mt-6 inline-block rounded-md bg-sage-500 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-sage-600"
        >
          返回首页
        </Link>
      </motion.div>
    </div>
  );
}
