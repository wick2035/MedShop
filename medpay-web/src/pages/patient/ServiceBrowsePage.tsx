import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Search, Heart, Clock, Tag } from 'lucide-react';
import { containerVariants, itemVariants } from '@/components/layout/PageContainer';
import PageHeader from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { medicalServicesApi } from '@/api/medical-services.api';
import { catalogCategoriesApi } from '@/api/catalog-categories.api';
import { formatCurrency } from '@/lib/utils';
import { SERVICE_TYPE_LABELS } from '@/lib/constants';
import { ServiceType } from '@/types/enums';
import type { MedicalServiceResponse, ServiceCategoryResponse } from '@/types/catalog';

const serviceTypes = Object.values(ServiceType);

export default function ServiceBrowsePage() {
  const navigate = useNavigate();

  const [services, setServices] = useState<MedicalServiceResponse[]>([]);
  const [categories, setCategories] = useState<ServiceCategoryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    catalogCategoriesApi.list().then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    async function fetchServices() {
      setLoading(true);
      setError(null);
      try {
        const result = await medicalServicesApi.list({
          categoryId: selectedCategory || undefined,
          serviceType: (selectedType as ServiceType) || undefined,
        });
        const items = 'content' in result ? (result as { content: MedicalServiceResponse[] }).content : (result as unknown as MedicalServiceResponse[]);
        setServices(Array.isArray(items) ? items : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : '加载失败');
      } finally {
        setLoading(false);
      }
    }
    fetchServices();
  }, [selectedCategory, selectedType]);

  const filteredServices = services.filter((s) =>
    search ? s.name.toLowerCase().includes(search.toLowerCase()) : true,
  );

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8"
    >
      <motion.div variants={itemVariants}>
        <PageHeader title="医疗服务" subtitle="浏览可用医疗服务" />
      </motion.div>

      {/* Category chips */}
      <motion.div variants={itemVariants} className="mb-4 flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setSelectedCategory('')}
          className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            !selectedCategory
              ? 'bg-sage-500 text-white'
              : 'bg-ivory-200 text-sage-700 hover:bg-ivory-300'
          }`}
        >
          全部
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              selectedCategory === cat.id
                ? 'bg-sage-500 text-white'
                : 'bg-ivory-200 text-sage-700 hover:bg-ivory-300'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </motion.div>

      {/* Type filter tabs */}
      <motion.div variants={itemVariants} className="mb-4 flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setSelectedType('')}
          className={`shrink-0 rounded-md px-3 py-1 text-xs font-medium transition-colors ${
            !selectedType ? 'bg-sage-100 text-sage-700' : 'text-sage-600 hover:bg-ivory-200'
          }`}
        >
          全部类型
        </button>
        {serviceTypes.map((type) => (
          <button
            key={type}
            onClick={() => setSelectedType(type)}
            className={`shrink-0 rounded-md px-3 py-1 text-xs font-medium transition-colors ${
              selectedType === type ? 'bg-sage-100 text-sage-700' : 'text-sage-600 hover:bg-ivory-200'
            }`}
          >
            {SERVICE_TYPE_LABELS[type]}
          </button>
        ))}
      </motion.div>

      {/* Search */}
      <motion.div variants={itemVariants} className="mb-6">
        <Input
          icon={Search}
          placeholder="搜索服务..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </motion.div>

      {/* Service grid */}
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
      ) : filteredServices.length === 0 ? (
        <Card className="py-12 text-center">
          <Heart className="mx-auto h-10 w-10 text-sage-300" />
          <p className="mt-3 text-sm text-sage-700/60">未找到服务</p>
        </Card>
      ) : (
        <motion.div variants={itemVariants} className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredServices.map((service) => (
            <Card
              key={service.id}
              hover
              className="cursor-pointer p-5"
            >
              <button
                onClick={() => navigate(`/patient/services/${service.id}`)}
                className="w-full text-left"
              >
                <div className="mb-3 flex items-start justify-between">
                  <h3 className="font-display text-base font-semibold text-sage-800">
                    {service.name}
                  </h3>
                  <Badge variant="sage" size="sm">
                    {SERVICE_TYPE_LABELS[service.serviceType] || service.serviceType}
                  </Badge>
                </div>
                <p className="mb-3 line-clamp-2 text-xs text-sage-700/60">
                  {service.description || '暂无描述'}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs text-sage-700/60">
                    {(service.durationMinutes ?? 0) > 0 && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {service.durationMinutes} 分钟
                      </span>
                    )}
                    {service.categoryId && (
                      <span className="flex items-center gap-1">
                        <Tag className="h-3.5 w-3.5" />
                        {categories.find((c) => c.id === service.categoryId)?.name || '未分类'}
                      </span>
                    )}
                  </div>
                  <span className="text-sm font-semibold text-terracotta">
                    {formatCurrency(service.price)}
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
