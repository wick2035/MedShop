import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, RotateCcw } from 'lucide-react';

export default function ErrorPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-ivory-50 px-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 24 }}
        className="max-w-md text-center"
      >
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-50">
          <AlertTriangle className="h-10 w-10 text-red-500" />
        </div>

        <h1 className="font-display text-4xl font-bold text-sage-800">
          Something Went Wrong
        </h1>
        <p className="mt-3 text-sage-700/60">
          An unexpected error has occurred. Our team has been notified and is working
          on a fix. Please try again later.
        </p>

        <div className="mt-8 flex items-center justify-center gap-3">
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 rounded-md border border-sage-200 bg-white px-5 py-2.5 text-sm font-medium text-sage-700 transition-colors hover:bg-sage-50"
          >
            <RotateCcw className="h-4 w-4" />
            Try Again
          </button>
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-md bg-sage-500 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-sage-600"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
