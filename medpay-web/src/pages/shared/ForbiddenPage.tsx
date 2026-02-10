import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ShieldX, ArrowLeft } from 'lucide-react';

export default function ForbiddenPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-ivory-50 px-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 24 }}
        className="max-w-md text-center"
      >
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-terracotta/10">
          <ShieldX className="h-10 w-10 text-terracotta" />
        </div>

        <h1 className="font-display text-5xl font-bold text-sage-800">403</h1>
        <h2 className="mt-2 font-display text-xl font-semibold text-sage-700">
          Access Denied
        </h2>
        <p className="mt-3 text-sage-700/60">
          You do not have permission to access this page. If you believe this is a
          mistake, please contact your administrator.
        </p>

        <Link
          to="/"
          className="mt-8 inline-flex items-center gap-2 rounded-md bg-sage-500 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-sage-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>
      </motion.div>
    </div>
  );
}
