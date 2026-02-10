import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Pill, Package as PackageIcon, ShoppingCart, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { containerVariants, itemVariants } from '@/components/layout/PageContainer';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/stores/auth.store';
import { productsApi } from '@/api/products.api';
import { ordersApi } from '@/api/orders.api';
import { formatCurrency } from '@/lib/utils';
import { PRODUCT_TYPE_LABELS } from '@/lib/constants';
import { OrderType, ItemType } from '@/types/enums';
import type { ProductResponse } from '@/types/catalog';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [product, setProduct] = useState<ProductResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProduct() {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const result = await productsApi.getById(id);
        setProduct(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load product');
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [id]);

  async function handleBuyNow() {
    if (!product || !user) return;
    setBuying(true);
    try {
      const order = await ordersApi.create(
        {
          orderType: OrderType.PRODUCT,
          items: [{ referenceId: product.id, itemType: ItemType.PRODUCT, quantity: 1 }],
        },
        user.id,
      );
      toast.success('Order created!');
      navigate(`/patient/orders/${order.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create order');
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

  if (error || !product) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
        <Card className="py-12 text-center">
          <Pill className="mx-auto h-10 w-10 text-sage-300" />
          <p className="mt-3 text-sm text-red-500">{error || 'Product not found'}</p>
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
          Back to Pharmacy
        </button>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card className="p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-sage-50">
              <PackageIcon className="h-8 w-8 text-sage-500" />
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <h1 className="font-display text-2xl font-semibold text-sage-800">
                  {product.name}
                </h1>
                <Badge variant="sage" size="md">
                  {PRODUCT_TYPE_LABELS[product.productType] || product.productType}
                </Badge>
              </div>
            </div>
          </div>

          {/* Details grid */}
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {product.manufacturer && (
              <div>
                <p className="text-xs text-sage-700/60">Manufacturer</p>
                <p className="text-sm font-medium text-sage-800">{product.manufacturer}</p>
              </div>
            )}
            {product.specification && (
              <div>
                <p className="text-xs text-sage-700/60">Specification</p>
                <p className="text-sm font-medium text-sage-800">{product.specification}</p>
              </div>
            )}
            <div>
              <p className="text-xs text-sage-700/60">Stock</p>
              <p className="text-sm font-medium text-sage-800">
                {product.stockQuantity > 0 ? `${product.stockQuantity} available` : 'Out of stock'}
              </p>
            </div>
          </div>

          {product.contraindications && (
            <div className="mt-6">
              <h3 className="mb-2 text-sm font-semibold text-sage-700">Contraindications</h3>
              <p className="text-sm leading-relaxed text-sage-700/70">{product.contraindications}</p>
            </div>
          )}

          {product.sideEffects && (
            <div className="mt-4">
              <h3 className="mb-2 text-sm font-semibold text-sage-700">Side Effects</h3>
              <p className="text-sm leading-relaxed text-sage-700/70">{product.sideEffects}</p>
            </div>
          )}

          {/* Insurance note */}
          <div className="mt-6 flex items-start gap-3 rounded-lg bg-blue-50 p-4">
            <Shield className="mt-0.5 h-5 w-5 shrink-0 text-blue-500" />
            <div>
              <p className="text-sm font-medium text-blue-800">Insurance Coverage</p>
              <p className="mt-0.5 text-xs text-blue-700/70">
                This product may be partially covered by your insurance plan. Check the Insurance page for coverage details.
              </p>
            </div>
          </div>

          {/* Price and buy */}
          <div className="mt-6 rounded-lg bg-ivory-100 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-sage-700">Price</span>
              <span className="text-2xl font-bold text-sage-800">{formatCurrency(product.price)}</span>
            </div>
          </div>

          <div className="mt-8">
            <Button
              className="w-full"
              size="lg"
              loading={buying}
              disabled={product.stockQuantity <= 0}
              onClick={handleBuyNow}
              icon={<ShoppingCart className="h-5 w-5" />}
            >
              {product.stockQuantity > 0 ? 'Buy Now' : 'Out of Stock'}
            </Button>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}
