import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, Clock, Tag, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { containerVariants, itemVariants } from '@/components/layout/PageContainer';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/stores/auth.store';
import { medicalServicesApi } from '@/api/medical-services.api';
import { ordersApi } from '@/api/orders.api';
import { formatCurrency } from '@/lib/utils';
import { SERVICE_TYPE_LABELS } from '@/lib/constants';
import { OrderType, ItemType } from '@/types/enums';
import type { MedicalServiceResponse } from '@/types/catalog';

export default function ServiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [service, setService] = useState<MedicalServiceResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchService() {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const result = await medicalServicesApi.getById(id);
        setService(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load service');
      } finally {
        setLoading(false);
      }
    }
    fetchService();
  }, [id]);

  async function handleBookNow() {
    if (!service || !user) return;
    setBooking(true);
    try {
      const order = await ordersApi.create(
        {
          orderType: OrderType.SERVICE,
          items: [{ referenceId: service.id, itemType: ItemType.SERVICE, quantity: 1 }],
        },
        user.id,
      );
      toast.success('Order created successfully!');
      navigate(`/patient/orders/${order.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create order');
    } finally {
      setBooking(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="skeleton-shimmer h-8 w-32 rounded" />
        <div className="mt-6 skeleton-shimmer h-64 rounded-lg" />
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
        <Card className="py-12 text-center">
          <Heart className="mx-auto h-10 w-10 text-sage-300" />
          <p className="mt-3 text-sm text-red-500">{error || 'Service not found'}</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate(-1)}>
            Go Back
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 lg:px-8"
    >
      <motion.div variants={itemVariants} className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm font-medium text-sage-600 transition-colors hover:text-sage-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Services
        </button>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card className="p-6 sm:p-8">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
            <h1 className="font-display text-2xl font-semibold text-sage-800">
              {service.name}
            </h1>
            <Badge variant="sage" size="md">
              {SERVICE_TYPE_LABELS[service.serviceType] || service.serviceType}
            </Badge>
          </div>

          <div className="mb-6 flex flex-wrap gap-4 text-sm text-sage-700/70">
            {service.durationMinutes > 0 && (
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-sage-400" />
                {service.durationMinutes} minutes
              </div>
            )}
            {service.requiresPrescription && (
              <div className="flex items-center gap-1.5">
                <Tag className="h-4 w-4 text-sage-400" />
                Requires prescription
              </div>
            )}
          </div>

          {service.description && (
            <div className="mb-6">
              <h3 className="mb-2 text-sm font-semibold text-sage-700">Description</h3>
              <p className="text-sm leading-relaxed text-sage-700/70">
                {service.description}
              </p>
            </div>
          )}

          {/* Price section */}
          <div className="rounded-lg bg-ivory-100 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-sage-700">Price</span>
              <span className="text-2xl font-bold text-sage-800">
                {formatCurrency(service.price)}
              </span>
            </div>
          </div>

          <div className="mt-8">
            <Button
              className="w-full"
              size="lg"
              loading={booking}
              onClick={handleBookNow}
              icon={<CheckCircle className="h-5 w-5" />}
            >
              Book Now
            </Button>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}
