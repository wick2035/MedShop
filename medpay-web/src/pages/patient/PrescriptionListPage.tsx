import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FileText, Calendar, Eye } from 'lucide-react';
import { containerVariants, itemVariants } from '@/components/layout/PageContainer';
import PageHeader from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/stores/auth.store';
import { prescriptionsApi } from '@/api/prescriptions.api';
import { formatDate } from '@/lib/utils';
import type { PrescriptionResponse } from '@/types/prescription';

export default function PrescriptionListPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [prescriptions, setPrescriptions] = useState<PrescriptionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPrescriptions() {
      if (!user) return;
      setLoading(true);
      setError(null);
      try {
        const result = await prescriptionsApi.listByPatient(user.id);
        setPrescriptions(Array.isArray(result) ? result : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load prescriptions');
      } finally {
        setLoading(false);
      }
    }
    fetchPrescriptions();
  }, [user]);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8"
    >
      <motion.div variants={itemVariants}>
        <PageHeader title="My Prescriptions" subtitle="View your medical prescriptions" />
      </motion.div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton-shimmer h-24 rounded-lg" />
          ))}
        </div>
      ) : error ? (
        <Card className="py-12 text-center">
          <p className="text-sm text-red-500">{error}</p>
        </Card>
      ) : prescriptions.length === 0 ? (
        <Card className="py-12 text-center">
          <FileText className="mx-auto h-10 w-10 text-sage-300" />
          <p className="mt-3 text-sm text-sage-700/60">No prescriptions found</p>
        </Card>
      ) : (
        <motion.div variants={itemVariants} className="space-y-3">
          {prescriptions.map((rx) => (
            <Card key={rx.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50">
                    <FileText className="h-5 w-5 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-sage-800">
                      {rx.prescriptionNo}
                    </p>
                    <p className="mt-0.5 text-xs text-sage-700/60">
                      {rx.diagnosis || 'No diagnosis'}
                    </p>
                    <div className="mt-1 flex items-center gap-2 text-xs text-sage-700/60">
                      <Calendar className="h-3 w-3" />
                      {formatDate(rx.createdAt)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="sage" size="sm">{rx.status}</Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/patient/prescriptions/${rx.id}`)}
                    icon={<Eye className="h-3.5 w-3.5" />}
                  >
                    View
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}
