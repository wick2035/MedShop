import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package as PackageIcon, ShoppingCart, Tag, Clock, Gift } from 'lucide-react';
import { toast } from 'sonner';
import { containerVariants, itemVariants } from '@/components/layout/PageContainer';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/stores/auth.store';
import { healthPackagesApi } from '@/api/health-packages.api';
import { ordersApi } from '@/api/orders.api';
import { formatCurrency } from '@/lib/utils';
import { PACKAGE_TYPE_LABELS } from '@/lib/constants';
import { OrderType, ItemType } from '@/types/enums';
import type { HealthPackageResponse } from '@/types/health-package';

export default function PackageDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [pkg, setPkg] = useState<HealthPackageResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPackage() {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const result = await healthPackagesApi.getById(id);
        setPkg(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load package');
      } finally {
        setLoading(false);
      }
    }
    fetchPackage();
  }, [id]);

  async function handlePurchase() {
    if (!pkg || !user) return;
    setBuying(true);
    try {
      const order = await ordersApi.create(
        {
          orderType: OrderType.PACKAGE,
          items: [{ referenceId: pkg.id, itemType: ItemType.SERVICE, quantity: 1 }],
        },
        user.patientId ?? user.id,
      );
      toast.success('Package purchased!');
      navigate(`/patient/orders/${order.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to purchase');
    } finally {
      setBuying(false);
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

  if (error || !pkg) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
        <Card className="py-12 text-center">
          <Gift className="mx-auto h-10 w-10 text-sage-300" />
          <p className="mt-3 text-sm text-red-500">{error || 'Package not found'}</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate(-1)}>Go Back</Button>
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
          Back to Packages
        </button>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card className="p-6 sm:p-8">
          <div className="mb-4 flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-sage-50">
              <PackageIcon className="h-7 w-7 text-sage-500" />
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <h1 className="font-display text-2xl font-semibold text-sage-800">{pkg.name}</h1>
                <Badge variant="sage" size="md">
                  {PACKAGE_TYPE_LABELS[pkg.packageType] || pkg.packageType}
                </Badge>
              </div>
            </div>
          </div>

          <div className="mb-6 flex flex-wrap gap-4 text-sm text-sage-700/70">
            {pkg.validityDays && (
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-sage-400" />
                Valid for {pkg.validityDays} days
              </div>
            )}
            {pkg.maxUsage && (
              <div className="flex items-center gap-1.5">
                <Tag className="h-4 w-4 text-sage-400" />
                Max {pkg.maxUsage} uses
              </div>
            )}
          </div>

          {pkg.description && (
            <div className="mb-6">
              <h3 className="mb-2 text-sm font-semibold text-sage-700">Description</h3>
              <p className="text-sm leading-relaxed text-sage-700/70">{pkg.description}</p>
            </div>
          )}

          {/* Included items */}
          {pkg.includedItems && pkg.includedItems.length > 0 && (
            <div className="mb-6">
              <h3 className="mb-3 text-sm font-semibold text-sage-700">Included Items</h3>
              <div className="space-y-2">
                {pkg.includedItems.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 rounded-md bg-ivory-100 px-3 py-2 text-sm text-sage-700"
                  >
                    <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-sage-400" />
                    {Object.values(item).join(' - ')}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Price */}
          <div className="rounded-lg bg-ivory-100 p-4">
            <div className="flex items-end justify-between">
              <div>
                <span className="text-sm text-sage-700">Package Price</span>
                {pkg.originalPrice && pkg.originalPrice > pkg.price && (
                  <div className="mt-1">
                    <span className="text-sm text-sage-400 line-through">
                      {formatCurrency(pkg.originalPrice)}
                    </span>
                    <Badge variant="terracotta" size="sm" className="ml-2">
                      Save {formatCurrency(pkg.originalPrice - pkg.price)}
                    </Badge>
                  </div>
                )}
              </div>
              <span className="text-2xl font-bold text-sage-800">{formatCurrency(pkg.price)}</span>
            </div>
          </div>

          <div className="mt-8">
            <Button
              className="w-full"
              size="lg"
              loading={buying}
              onClick={handlePurchase}
              icon={<ShoppingCart className="h-5 w-5" />}
            >
              Purchase
            </Button>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}
