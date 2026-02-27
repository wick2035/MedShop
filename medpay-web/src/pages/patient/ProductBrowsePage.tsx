import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Search, Pill, Package as PackageIcon } from 'lucide-react';
import { containerVariants, itemVariants } from '@/components/layout/PageContainer';
import PageHeader from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { productsApi } from '@/api/products.api';
import { formatCurrency } from '@/lib/utils';
import { PRODUCT_TYPE_LABELS } from '@/lib/constants';
import { ProductType } from '@/types/enums';
import type { ProductResponse } from '@/types/catalog';

const productTypes = Object.values(ProductType);

export default function ProductBrowsePage() {
  const navigate = useNavigate();

  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      setError(null);
      try {
        const result = await productsApi.list({
          productType: (selectedType as ProductType) || undefined,
        });
        const items = 'content' in result ? (result as { content: ProductResponse[] }).content : (result as unknown as ProductResponse[]);
        setProducts(Array.isArray(items) ? items : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : '加载失败');
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, [selectedType]);

  const filteredProducts = products.filter((p) =>
    search ? p.name.toLowerCase().includes(search.toLowerCase()) : true,
  );

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8"
    >
      <motion.div variants={itemVariants}>
        <PageHeader title="药房" subtitle="浏览药品和健康产品" />
      </motion.div>

      {/* Type filter */}
      <motion.div variants={itemVariants} className="mb-4 flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setSelectedType('')}
          className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            !selectedType
              ? 'bg-sage-500 text-white'
              : 'bg-ivory-200 text-sage-700 hover:bg-ivory-300'
          }`}
        >
          全部
        </button>
        {productTypes.map((type) => (
          <button
            key={type}
            onClick={() => setSelectedType(type)}
            className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              selectedType === type
                ? 'bg-sage-500 text-white'
                : 'bg-ivory-200 text-sage-700 hover:bg-ivory-300'
            }`}
          >
            {PRODUCT_TYPE_LABELS[type]}
          </button>
        ))}
      </motion.div>

      {/* Search */}
      <motion.div variants={itemVariants} className="mb-6">
        <Input
          icon={Search}
          placeholder="搜索商品..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </motion.div>

      {/* Product grid */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton-shimmer h-40 rounded-lg" />
          ))}
        </div>
      ) : error ? (
        <Card className="py-12 text-center">
          <p className="text-sm text-red-500">{error}</p>
        </Card>
      ) : filteredProducts.length === 0 ? (
        <Card className="py-12 text-center">
          <Pill className="mx-auto h-10 w-10 text-sage-300" />
          <p className="mt-3 text-sm text-sage-700/60">未找到商品</p>
        </Card>
      ) : (
        <motion.div variants={itemVariants} className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((product) => (
            <Card
              key={product.id}
              hover
              className="cursor-pointer p-5"
            >
              <button
                onClick={() => navigate(`/patient/products/${product.id}`)}
                className="w-full text-left"
              >
                <div className="mb-2 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sage-50">
                    <PackageIcon className="h-5 w-5 text-sage-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-sage-800">{product.name}</h3>
                    <Badge variant="sage" size="sm">
                      {PRODUCT_TYPE_LABELS[product.productType] || product.productType}
                    </Badge>
                  </div>
                </div>
                {product.manufacturer && (
                  <p className="mb-1 text-xs text-sage-700/60">{product.manufacturer}</p>
                )}
                {product.specification && (
                  <p className="mb-2 text-xs text-sage-700/60">{product.specification}</p>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-sage-700/60">
                    库存：{product.stockQuantity}
                  </span>
                  <span className="text-sm font-semibold text-terracotta">
                    {formatCurrency(product.price)}
                  </span>
                </div>
              </button>
            </Card>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}
