import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, ShoppingCart, User, Calendar, Pill } from 'lucide-react';
import { toast } from 'sonner';
import { containerVariants, itemVariants } from '@/components/layout/PageContainer';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { prescriptionsApi } from '@/api/prescriptions.api';
import { formatDate, formatCurrency } from '@/lib/utils';
import type { PrescriptionResponse } from '@/types/prescription';

export default function PrescriptionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [prescription, setPrescription] = useState<PrescriptionResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [converting, setConverting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPrescription() {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const result = await prescriptionsApi.getById(id);
        setPrescription(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load prescription');
      } finally {
        setLoading(false);
      }
    }
    fetchPrescription();
  }, [id]);

  async function handleConvertToOrder() {
    if (!prescription) return;
    setConverting(true);
    try {
      const order = await prescriptionsApi.createOrder(prescription.id);
      toast.success('Prescription converted to order!');
      navigate(`/patient/orders/${order.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Conversion failed');
    } finally {
      setConverting(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="skeleton-shimmer h-8 w-40 rounded" />
        <div className="mt-6 skeleton-shimmer h-64 rounded-lg" />
      </div>
    );
  }

  if (error || !prescription) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
        <Card className="py-12 text-center">
          <FileText className="mx-auto h-10 w-10 text-sage-300" />
          <p className="mt-3 text-sm text-red-500">{error || 'Prescription not found'}</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate(-1)}>Go Back</Button>
        </Card>
      </div>
    );
  }

  const canConvert = prescription.status === 'CONFIRMED';

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 lg:px-8"
    >
      <motion.div variants={itemVariants} className="mb-6">
        <button
          onClick={() => navigate('/patient/prescriptions')}
          className="flex items-center gap-2 text-sm font-medium text-sage-600 transition-colors hover:text-sage-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Prescriptions
        </button>
      </motion.div>

      {/* Prescription header */}
      <motion.div variants={itemVariants}>
        <Card className="p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="font-display text-xl font-semibold text-sage-800">
                Prescription #{prescription.prescriptionNo}
              </h1>
              <Badge variant="sage" size="md" className="mt-2">
                {prescription.status}
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-sm text-sage-700/60">
              <Calendar className="h-4 w-4" />
              {formatDate(prescription.createdAt)}
            </div>
          </div>

          {/* Doctor info */}
          <div className="mt-6 flex items-center gap-3 rounded-lg bg-ivory-100 p-3">
            <User className="h-5 w-5 text-sage-500" />
            <div>
              <p className="text-sm font-medium text-sage-800">
                Prescribed by Doctor
              </p>
              <p className="text-xs text-sage-700/60">ID: {prescription.doctorId}</p>
            </div>
          </div>

          {/* Diagnosis */}
          {prescription.diagnosis && (
            <div className="mt-4">
              <h3 className="mb-1 text-sm font-semibold text-sage-700">Diagnosis</h3>
              <p className="text-sm text-sage-700/70">{prescription.diagnosis}</p>
            </div>
          )}
        </Card>
      </motion.div>

      {/* Prescription items */}
      <motion.div variants={itemVariants} className="mt-4">
        <Card className="p-6">
          <h2 className="mb-4 text-base font-semibold text-sage-800">Medications</h2>
          {prescription.items && prescription.items.length > 0 ? (
            <div className="space-y-3">
              {prescription.items.map((item, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 rounded-lg border border-ivory-200 p-3"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                    <Pill className="h-4 w-4 text-blue-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-sage-800">{item.productName}</p>
                    <p className="mt-0.5 text-xs text-sage-700/60">
                      {item.dosageInstruction} &middot; {item.frequency}
                      {item.durationDays ? ` &middot; ${item.durationDays} days` : ''}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-sage-700/60">Qty: {item.quantity}</p>
                    <p className="text-sm font-medium text-sage-800">
                      {formatCurrency(item.subtotal)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-sage-700/60">No medications listed</p>
          )}

          {prescription.totalAmount > 0 && (
            <div className="mt-4 rounded-lg bg-ivory-100 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-sage-700">Total Amount</span>
                <span className="text-lg font-semibold text-sage-800">
                  {formatCurrency(prescription.totalAmount)}
                </span>
              </div>
            </div>
          )}
        </Card>
      </motion.div>

      {/* Notes */}
      {prescription.notes && (
        <motion.div variants={itemVariants} className="mt-4">
          <Card className="p-6">
            <h3 className="mb-2 text-base font-semibold text-sage-800">Notes</h3>
            <p className="text-sm text-sage-700/70">{prescription.notes}</p>
          </Card>
        </motion.div>
      )}

      {/* Convert to order button */}
      {canConvert && (
        <motion.div variants={itemVariants} className="mt-6">
          <Button
            className="w-full"
            size="lg"
            loading={converting}
            onClick={handleConvertToOrder}
            icon={<ShoppingCart className="h-5 w-5" />}
          >
            Convert to Order
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
}
