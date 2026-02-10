import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, AlertCircle, Plus, Minus } from 'lucide-react';
import { toast } from 'sonner';

import type { ProductResponse } from '@/types/catalog';

import PageContainer, { itemVariants } from '@/components/layout/PageContainer';
import PageHeader from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

import { productsApi } from '@/api/products.api';
import { formatCurrency } from '@/lib/utils';

export default function ProductStockPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [product, setProduct] = useState<ProductResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [quantity, setQuantity] = useState('');
  const [adjustType, setAdjustType] = useState<'ADD' | 'SUBTRACT'>('ADD');

  const fetchProduct = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await productsApi.getById(id);
      setProduct(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load product';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !quantity || Number(quantity) <= 0) {
      toast.error('Please enter a valid quantity');
      return;
    }
    const adj = adjustType === 'ADD' ? Number(quantity) : -Number(quantity);
    setSubmitting(true);
    try {
      await productsApi.adjustStock(id, {
        quantity: product ? product.stockQuantity + adj : adj,
        adjustment: adj,
      });
      toast.success('Stock adjusted successfully');
      setQuantity('');
      fetchProduct();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to adjust stock');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-sage-200 border-t-sage-500" />
        </div>
      </PageContainer>
    );
  }

  if (error || !product) {
    return (
      <PageContainer>
        <div className="flex h-64 flex-col items-center justify-center gap-4 text-gray-500">
          <AlertCircle className="h-12 w-12 text-red-400" />
          <p>{error ?? 'Product not found'}</p>
          <Button variant="outline" onClick={fetchProduct}>Retry</Button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Stock Management"
        breadcrumbs={[
          { label: 'Products', href: '/admin/catalog/products' },
          { label: product.name },
          { label: 'Stock' },
        ]}
      />

      <div className="mx-auto max-w-lg space-y-6">
        {/* Current stock card */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          className="rounded-lg border border-ivory-200/60 bg-white/70 p-6 backdrop-blur-sm"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-sage-50 text-sage-500">
              <Package className="h-7 w-7" />
            </div>
            <div>
              <h3 className="font-display text-lg font-semibold text-sage-800">{product.name}</h3>
              <p className="text-sm text-gray-500">
                {product.specification} | {formatCurrency(product.price)}
              </p>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-center">
            <div className="text-center">
              <p className="text-sm text-gray-500">Current Stock</p>
              <p
                className={`mt-1 font-display text-4xl font-bold ${
                  product.stockQuantity < 10 ? 'text-red-600' : 'text-sage-800'
                }`}
              >
                {product.stockQuantity}
              </p>
              <p className="text-xs text-gray-400">units</p>
            </div>
          </div>
        </motion.div>

        {/* Adjustment form */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          className="rounded-lg border border-ivory-200/60 bg-white/70 p-6 backdrop-blur-sm"
        >
          <h3 className="mb-4 font-display text-lg font-semibold text-sage-800">
            Adjust Stock
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setAdjustType('ADD')}
                className={`flex flex-1 items-center justify-center gap-2 rounded-md border py-3 text-sm font-medium transition-colors ${
                  adjustType === 'ADD'
                    ? 'border-sage-500 bg-sage-50 text-sage-700'
                    : 'border-ivory-200 bg-white text-gray-500 hover:bg-ivory-50'
                }`}
              >
                <Plus className="h-4 w-4" />
                Add Stock
              </button>
              <button
                type="button"
                onClick={() => setAdjustType('SUBTRACT')}
                className={`flex flex-1 items-center justify-center gap-2 rounded-md border py-3 text-sm font-medium transition-colors ${
                  adjustType === 'SUBTRACT'
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : 'border-ivory-200 bg-white text-gray-500 hover:bg-ivory-50'
                }`}
              >
                <Minus className="h-4 w-4" />
                Subtract Stock
              </button>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Quantity</label>
              <Input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="Enter quantity"
              />
            </div>

            {quantity && Number(quantity) > 0 && (
              <div className="rounded-md bg-ivory-50 p-3 text-sm text-gray-600">
                New stock will be:{' '}
                <strong>
                  {adjustType === 'ADD'
                    ? product.stockQuantity + Number(quantity)
                    : product.stockQuantity - Number(quantity)}
                </strong>{' '}
                units
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => navigate('/admin/catalog/products')}>
                Back
              </Button>
              <Button type="submit" loading={submitting}>
                Adjust Stock
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </PageContainer>
  );
}
