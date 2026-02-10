import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  FileText,
  Pill,
  Calendar,
  DollarSign,
} from 'lucide-react';
import type { PrescriptionResponse } from '@/types/prescription';
import PageContainer, {
  containerVariants,
  itemVariants,
} from '@/components/layout/PageContainer';
import PageHeader from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { prescriptionsApi } from '@/api/prescriptions.api';
import { cn, formatCurrency, formatDate } from '@/lib/utils';

const STATUS_STYLES: Record<string, string> = {
  PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
  CONFIRMED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  CANCELLED: 'bg-gray-100 text-gray-500 border-gray-200',
  DISPENSED: 'bg-blue-50 text-blue-700 border-blue-200',
};

export default function PrescriptionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [prescription, setPrescription] = useState<PrescriptionResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchPrescription = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await prescriptionsApi.getById(id);
      setPrescription(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load prescription',
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchPrescription();
  }, [fetchPrescription]);

  async function handleConfirm() {
    if (!id) return;
    setActionLoading('confirm');
    try {
      const updated = await prescriptionsApi.confirm(id);
      setPrescription(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to confirm prescription');
    } finally {
      setActionLoading(null);
    }
  }

  async function handleCancel() {
    if (!id) return;
    setActionLoading('cancel');
    try {
      await prescriptionsApi.cancel(id);
      await fetchPrescription();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel prescription');
    } finally {
      setActionLoading(null);
    }
  }

  if (loading) {
    return (
      <PageContainer>
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-sage-200 border-t-sage-500" />
        </div>
      </PageContainer>
    );
  }

  if (error && !prescription) {
    return (
      <PageContainer>
        <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
          <p className="text-red-500">{error}</p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => navigate('/doctor/prescriptions')}>
              Back to List
            </Button>
            <Button variant="primary" onClick={fetchPrescription}>
              Retry
            </Button>
          </div>
        </div>
      </PageContainer>
    );
  }

  if (!prescription) return null;

  const statusStyle = STATUS_STYLES[prescription.status] ?? 'bg-gray-100 text-gray-500 border-gray-200';

  return (
    <PageContainer>
      <motion.div variants={containerVariants} initial="hidden" animate="visible">
        <motion.div variants={itemVariants}>
          <PageHeader
            title={`Prescription ${prescription.prescriptionNo}`}
            breadcrumbs={[
              { label: 'Dashboard', href: '/doctor' },
              { label: 'Prescriptions', href: '/doctor/prescriptions' },
              { label: prescription.prescriptionNo },
            ]}
            actions={
              <Button
                variant="ghost"
                icon={<ArrowLeft className="h-4 w-4" />}
                onClick={() => navigate('/doctor/prescriptions')}
              >
                Back
              </Button>
            }
          />
        </motion.div>

        {error && (
          <motion.div
            variants={itemVariants}
            className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600"
          >
            {error}
          </motion.div>
        )}

        {/* Status & Summary */}
        <motion.div
          variants={itemVariants}
          className="mb-6 rounded-xl border border-ivory-200 bg-white/80 p-6 shadow-sm backdrop-blur-sm"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-sage-500" />
                <span
                  className={cn(
                    'inline-flex rounded-full border px-3 py-1 text-sm font-medium',
                    statusStyle,
                  )}
                >
                  {prescription.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
                <div>
                  <span className="text-sage-500">Patient ID:</span>
                  <p className="font-medium text-sage-800">
                    {prescription.patientId}
                  </p>
                </div>
                <div>
                  <span className="text-sage-500">Doctor ID:</span>
                  <p className="font-medium text-sage-800">
                    {prescription.doctorId}
                  </p>
                </div>
                <div>
                  <span className="text-sage-500">Diagnosis:</span>
                  <p className="font-medium text-sage-800">
                    {prescription.diagnosis}
                    {prescription.diagnosisCode && (
                      <span className="ml-1 text-sage-500">
                        ({prescription.diagnosisCode})
                      </span>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-sage-400" />
                  <span className="text-sage-500">Created:</span>
                  <p className="font-medium text-sage-800">
                    {formatDate(prescription.createdAt)}
                  </p>
                </div>
              </div>

              {prescription.notes && (
                <div className="text-sm">
                  <span className="text-sage-500">Notes:</span>
                  <p className="text-sage-700">{prescription.notes}</p>
                </div>
              )}
            </div>

            <div className="flex-shrink-0 rounded-lg bg-ivory-100 p-4 text-right">
              <p className="text-xs text-sage-500">Total Amount</p>
              <p className="text-2xl font-semibold text-sage-800">
                {formatCurrency(prescription.totalAmount)}
              </p>
              <div className="mt-1 space-y-0.5 text-xs">
                <p className="text-sage-500">
                  Insurance: {formatCurrency(prescription.insuranceAmount)}
                </p>
                <p className="text-sage-500">
                  Self-pay: {formatCurrency(prescription.selfPayAmount)}
                </p>
              </div>
              {prescription.validUntil && (
                <p className="mt-2 text-xs text-sage-400">
                  Valid until: {formatDate(prescription.validUntil)}
                </p>
              )}
            </div>
          </div>
        </motion.div>

        {/* Items */}
        <motion.div
          variants={itemVariants}
          className="mb-6 rounded-xl border border-ivory-200 bg-white/80 shadow-sm backdrop-blur-sm"
        >
          <div className="border-b border-ivory-200 px-6 py-4">
            <h3 className="flex items-center gap-2 font-display text-lg font-semibold text-sage-800">
              <Pill className="h-5 w-5 text-sage-500" />
              Prescribed Medicines ({prescription.items.length})
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-ivory-100 text-left text-xs font-medium uppercase tracking-wider text-sage-500">
                  <th className="px-6 py-3">#</th>
                  <th className="px-6 py-3">Medicine</th>
                  <th className="px-6 py-3">Specification</th>
                  <th className="px-6 py-3">Dosage</th>
                  <th className="px-6 py-3">Frequency</th>
                  <th className="px-6 py-3">Duration</th>
                  <th className="px-6 py-3">Qty</th>
                  <th className="px-6 py-3">Unit Price</th>
                  <th className="px-6 py-3">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ivory-100">
                {prescription.items.map((item, index) => (
                  <tr
                    key={item.id}
                    className="transition-colors hover:bg-ivory-50"
                  >
                    <td className="px-6 py-3 text-sm text-sage-500">
                      {index + 1}
                    </td>
                    <td className="px-6 py-3 text-sm font-medium text-sage-800">
                      {item.productName}
                    </td>
                    <td className="px-6 py-3 text-sm text-sage-600">
                      {item.specification}
                    </td>
                    <td className="px-6 py-3 text-sm text-sage-600">
                      {item.dosageInstruction}
                    </td>
                    <td className="px-6 py-3 text-sm text-sage-600">
                      {item.frequency}
                    </td>
                    <td className="px-6 py-3 text-sm text-sage-600">
                      {item.durationDays ? `${item.durationDays} days` : '--'}
                    </td>
                    <td className="px-6 py-3 text-sm text-sage-700">
                      {item.quantity}
                    </td>
                    <td className="px-6 py-3 text-sm text-sage-600">
                      {formatCurrency(item.unitPrice)}
                    </td>
                    <td className="px-6 py-3 text-sm font-medium text-sage-800">
                      {formatCurrency(item.subtotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-ivory-200 bg-ivory-50/50">
                  <td
                    colSpan={8}
                    className="px-6 py-3 text-right text-sm font-medium text-sage-700"
                  >
                    Total:
                  </td>
                  <td className="px-6 py-3 text-sm font-semibold text-sage-800">
                    {formatCurrency(prescription.totalAmount)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </motion.div>

        {/* Action Buttons */}
        {prescription.status === 'PENDING' && (
          <motion.div variants={itemVariants} className="flex gap-3">
            <Button
              variant="danger"
              loading={actionLoading === 'cancel'}
              disabled={actionLoading !== null && actionLoading !== 'cancel'}
              onClick={handleCancel}
              icon={<XCircle className="h-4 w-4" />}
            >
              Cancel Prescription
            </Button>
            <Button
              variant="primary"
              loading={actionLoading === 'confirm'}
              disabled={actionLoading !== null && actionLoading !== 'confirm'}
              onClick={handleConfirm}
              icon={<CheckCircle2 className="h-4 w-4" />}
            >
              Confirm Prescription
            </Button>
          </motion.div>
        )}

        {prescription.status === 'CONFIRMED' && (
          <motion.div
            variants={itemVariants}
            className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              This prescription has been confirmed and is ready for dispensing.
            </div>
          </motion.div>
        )}

        {prescription.status === 'CANCELLED' && (
          <motion.div
            variants={itemVariants}
            className="rounded-lg bg-gray-50 px-4 py-3 text-sm text-gray-500"
          >
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4" />
              This prescription has been cancelled.
            </div>
          </motion.div>
        )}
      </motion.div>
    </PageContainer>
  );
}
