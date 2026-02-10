import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Pill,
} from 'lucide-react';
import type { PrescriptionCreateRequest, PrescriptionItemRequest } from '@/types/prescription';
import type { ProductResponse } from '@/types/catalog';
import { ProductType } from '@/types/enums';
import PageContainer, {
  containerVariants,
  itemVariants,
} from '@/components/layout/PageContainer';
import PageHeader from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuthStore } from '@/stores/auth.store';
import { prescriptionsApi } from '@/api/prescriptions.api';
import { productsApi } from '@/api/products.api';
import { formatCurrency } from '@/lib/utils';

interface PrescriptionItemForm {
  productId: string;
  quantity: number;
  dosageInstruction: string;
  frequency: string;
  durationDays: number;
}

function emptyItem(): PrescriptionItemForm {
  return {
    productId: '',
    quantity: 1,
    dosageInstruction: '',
    frequency: '',
    durationDays: 7,
  };
}

export default function PrescriptionCreatePage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  const [patientId, setPatientId] = useState('');
  const [appointmentId, setAppointmentId] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [diagnosisCode, setDiagnosisCode] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<PrescriptionItemForm[]>([emptyItem()]);

  const [medicines, setMedicines] = useState<ProductResponse[]>([]);
  const [loadingMeds, setLoadingMeds] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function loadMedicines() {
      setLoadingMeds(true);
      try {
        const res = await productsApi.list({
          productType: ProductType.MEDICINE,
        });
        setMedicines(res.content);
      } catch {
        // Non-critical, user can still type product IDs
        setMedicines([]);
      } finally {
        setLoadingMeds(false);
      }
    }
    loadMedicines();
  }, []);

  function updateItem(index: number, field: keyof PrescriptionItemForm, value: string | number) {
    setItems((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, [field]: value } : item,
      ),
    );
  }

  function addItem() {
    setItems((prev) => [...prev, emptyItem()]);
  }

  function removeItem(index: number) {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;

    if (!patientId.trim()) {
      setError('Patient ID is required.');
      return;
    }
    if (!diagnosis.trim()) {
      setError('Diagnosis is required.');
      return;
    }
    if (items.some((it) => !it.productId)) {
      setError('All items must have a medicine selected.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const prescriptionItems: PrescriptionItemRequest[] = items.map((it) => ({
        productId: it.productId,
        quantity: it.quantity,
        dosageInstruction: it.dosageInstruction || undefined,
        frequency: it.frequency || undefined,
        durationDays: it.durationDays || undefined,
      }));

      const body: PrescriptionCreateRequest = {
        patientId,
        diagnosis,
        ...(appointmentId ? { appointmentId } : {}),
        ...(diagnosisCode ? { diagnosisCode } : {}),
        ...(notes ? { notes } : {}),
        items: prescriptionItems,
      };

      const result = await prescriptionsApi.create(body);
      setSuccess(true);
      setTimeout(() => navigate(`/doctor/prescriptions/${result.id}`), 1500);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to create prescription',
      );
    } finally {
      setSubmitting(false);
    }
  }

  function getProductName(productId: string): string {
    const med = medicines.find((m) => m.id === productId);
    return med ? `${med.name} (${med.specification ?? med.code})` : '';
  }

  function getProductPrice(productId: string): number {
    const med = medicines.find((m) => m.id === productId);
    return med?.price ?? 0;
  }

  const estimatedTotal = items.reduce((sum, it) => {
    return sum + getProductPrice(it.productId) * it.quantity;
  }, 0);

  return (
    <PageContainer>
      <motion.div variants={containerVariants} initial="hidden" animate="visible">
        <motion.div variants={itemVariants}>
          <PageHeader
            title="Write Prescription"
            subtitle="Create a new prescription for a patient"
            breadcrumbs={[
              { label: 'Dashboard', href: '/doctor' },
              { label: 'Prescriptions', href: '/doctor/prescriptions' },
              { label: 'Create' },
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

        {success && (
          <motion.div
            variants={itemVariants}
            className="mb-6 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
          >
            Prescription created successfully! Redirecting...
          </motion.div>
        )}

        {error && (
          <motion.div
            variants={itemVariants}
            className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600"
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Patient & Diagnosis */}
          <motion.div
            variants={itemVariants}
            className="mb-6 rounded-xl border border-ivory-200 bg-white/80 p-6 shadow-sm backdrop-blur-sm"
          >
            <h3 className="mb-4 font-display text-lg font-semibold text-sage-800">
              Patient Information
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label="Patient ID"
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                placeholder="Enter patient ID"
                required
              />
              <Input
                label="Appointment ID (optional)"
                value={appointmentId}
                onChange={(e) => setAppointmentId(e.target.value)}
                placeholder="Link to appointment"
              />
              <Input
                label="Diagnosis"
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                placeholder="Primary diagnosis"
                required
              />
              <Input
                label="Diagnosis Code (optional)"
                value={diagnosisCode}
                onChange={(e) => setDiagnosisCode(e.target.value)}
                placeholder="ICD-10 code"
              />
            </div>
            <div className="mt-4">
              <label className="mb-1.5 block text-sm font-medium text-sage-700">
                Notes (optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full rounded-md border border-ivory-300 bg-ivory-50 px-3 py-2 text-sm text-sage-800 placeholder:text-sage-300 focus:border-sage-400 focus:outline-none focus:ring-2 focus:ring-sage-200"
                placeholder="Additional notes for the prescription"
              />
            </div>
          </motion.div>

          {/* Medicine Items */}
          <motion.div
            variants={itemVariants}
            className="mb-6 rounded-xl border border-ivory-200 bg-white/80 p-6 shadow-sm backdrop-blur-sm"
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-lg font-semibold text-sage-800">
                Medicines
              </h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                icon={<Plus className="h-4 w-4" />}
                onClick={addItem}
              >
                Add Medicine
              </Button>
            </div>

            {loadingMeds && (
              <p className="mb-4 text-sm text-sage-500">
                Loading medicine catalog...
              </p>
            )}

            <div className="space-y-4">
              {items.map((item, index) => (
                <div
                  key={index}
                  className="rounded-lg border border-ivory-200 bg-ivory-50/50 p-4"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Pill className="h-4 w-4 text-sage-500" />
                      <span className="text-sm font-medium text-sage-700">
                        Medicine #{index + 1}
                      </span>
                    </div>
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="text-red-400 transition-colors hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="sm:col-span-2 lg:col-span-1">
                      <label className="mb-1 block text-xs font-medium text-sage-600">
                        Medicine
                      </label>
                      <select
                        value={item.productId}
                        onChange={(e) =>
                          updateItem(index, 'productId', e.target.value)
                        }
                        className="w-full rounded-md border border-ivory-300 bg-ivory-50 px-3 py-2 text-sm text-sage-800 focus:border-sage-400 focus:outline-none focus:ring-2 focus:ring-sage-200"
                        required
                      >
                        <option value="">Select medicine...</option>
                        {medicines.map((med) => (
                          <option key={med.id} value={med.id}>
                            {med.name}{' '}
                            {med.specification
                              ? `(${med.specification})`
                              : ''}{' '}
                            - {formatCurrency(med.price)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-medium text-sage-600">
                        Quantity
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(e) =>
                          updateItem(index, 'quantity', Number(e.target.value))
                        }
                        className="w-full rounded-md border border-ivory-300 bg-ivory-50 px-3 py-2 text-sm text-sage-800 focus:border-sage-400 focus:outline-none focus:ring-2 focus:ring-sage-200"
                        required
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-medium text-sage-600">
                        Dosage Instruction
                      </label>
                      <input
                        type="text"
                        value={item.dosageInstruction}
                        onChange={(e) =>
                          updateItem(index, 'dosageInstruction', e.target.value)
                        }
                        placeholder="e.g., 1 tablet"
                        className="w-full rounded-md border border-ivory-300 bg-ivory-50 px-3 py-2 text-sm text-sage-800 placeholder:text-sage-300 focus:border-sage-400 focus:outline-none focus:ring-2 focus:ring-sage-200"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-medium text-sage-600">
                        Frequency
                      </label>
                      <select
                        value={item.frequency}
                        onChange={(e) =>
                          updateItem(index, 'frequency', e.target.value)
                        }
                        className="w-full rounded-md border border-ivory-300 bg-ivory-50 px-3 py-2 text-sm text-sage-800 focus:border-sage-400 focus:outline-none focus:ring-2 focus:ring-sage-200"
                      >
                        <option value="">Select...</option>
                        <option value="QD">Once daily (QD)</option>
                        <option value="BID">Twice daily (BID)</option>
                        <option value="TID">Three times daily (TID)</option>
                        <option value="QID">Four times daily (QID)</option>
                        <option value="PRN">As needed (PRN)</option>
                        <option value="QOD">Every other day (QOD)</option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-medium text-sage-600">
                        Duration (days)
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={item.durationDays}
                        onChange={(e) =>
                          updateItem(index, 'durationDays', Number(e.target.value))
                        }
                        className="w-full rounded-md border border-ivory-300 bg-ivory-50 px-3 py-2 text-sm text-sage-800 focus:border-sage-400 focus:outline-none focus:ring-2 focus:ring-sage-200"
                      />
                    </div>
                  </div>

                  {item.productId && (
                    <p className="mt-2 text-right text-xs text-sage-500">
                      Subtotal: {formatCurrency(getProductPrice(item.productId) * item.quantity)}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Estimated Total */}
            <div className="mt-4 flex justify-end border-t border-ivory-200 pt-4">
              <div className="text-right">
                <p className="text-sm text-sage-500">Estimated Total</p>
                <p className="text-xl font-semibold text-sage-800">
                  {formatCurrency(estimatedTotal)}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Submit */}
          <motion.div variants={itemVariants} className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/doctor/prescriptions')}
              className="flex-1 sm:flex-none"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={submitting}
              disabled={success}
              className="flex-1 sm:flex-none"
            >
              Create Prescription
            </Button>
          </motion.div>
        </form>
      </motion.div>
    </PageContainer>
  );
}
