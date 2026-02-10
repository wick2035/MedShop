import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Package as PackageIcon, Gift, Tag } from 'lucide-react';
import { containerVariants, itemVariants } from '@/components/layout/PageContainer';
import PageHeader from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { healthPackagesApi } from '@/api/health-packages.api';
import { formatCurrency } from '@/lib/utils';
import { PACKAGE_TYPE_LABELS } from '@/lib/constants';
import { PackageType } from '@/types/enums';
import type { HealthPackageResponse } from '@/types/health-package';

const packageTypes = Object.values(PackageType);

export default function PackageBrowsePage() {
  const navigate = useNavigate();

  const [packages, setPackages] = useState<HealthPackageResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState('');

  useEffect(() => {
    async function fetchPackages() {
      setLoading(true);
      setError(null);
      try {
        const result = await healthPackagesApi.list({
          packageType: (selectedType as PackageType) || undefined,
        });
        setPackages(Array.isArray(result) ? result : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load packages');
      } finally {
        setLoading(false);
      }
    }
    fetchPackages();
  }, [selectedType]);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8"
    >
      <motion.div variants={itemVariants}>
        <PageHeader title="Health Packages" subtitle="Browse comprehensive health check-up packages" />
      </motion.div>

      {/* Type filter */}
      <motion.div variants={itemVariants} className="mb-6 flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setSelectedType('')}
          className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            !selectedType ? 'bg-sage-500 text-white' : 'bg-ivory-200 text-sage-700 hover:bg-ivory-300'
          }`}
        >
          All
        </button>
        {packageTypes.map((type) => (
          <button
            key={type}
            onClick={() => setSelectedType(type)}
            className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              selectedType === type ? 'bg-sage-500 text-white' : 'bg-ivory-200 text-sage-700 hover:bg-ivory-300'
            }`}
          >
            {PACKAGE_TYPE_LABELS[type]}
          </button>
        ))}
      </motion.div>

      {/* Packages grid */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton-shimmer h-44 rounded-lg" />
          ))}
        </div>
      ) : error ? (
        <Card className="py-12 text-center">
          <p className="text-sm text-red-500">{error}</p>
        </Card>
      ) : packages.length === 0 ? (
        <Card className="py-12 text-center">
          <Gift className="mx-auto h-10 w-10 text-sage-300" />
          <p className="mt-3 text-sm text-sage-700/60">No packages available</p>
        </Card>
      ) : (
        <motion.div variants={itemVariants} className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {packages.map((pkg) => (
            <Card
              key={pkg.id}
              hover
              className="cursor-pointer p-5"
            >
              <button
                onClick={() => navigate(`/patient/packages/${pkg.id}`)}
                className="w-full text-left"
              >
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sage-50">
                    <PackageIcon className="h-5 w-5 text-sage-500" />
                  </div>
                  <Badge variant="sage" size="sm">
                    {PACKAGE_TYPE_LABELS[pkg.packageType] || pkg.packageType}
                  </Badge>
                </div>
                <h3 className="font-display text-base font-semibold text-sage-800">
                  {pkg.name}
                </h3>
                {pkg.description && (
                  <p className="mt-1 line-clamp-2 text-xs text-sage-700/60">
                    {pkg.description}
                  </p>
                )}
                <div className="mt-4 flex items-end justify-between">
                  <div>
                    {pkg.originalPrice && pkg.originalPrice > pkg.price && (
                      <span className="text-xs text-sage-400 line-through">
                        {formatCurrency(pkg.originalPrice)}
                      </span>
                    )}
                    <span className="ml-1 text-lg font-bold text-terracotta">
                      {formatCurrency(pkg.price)}
                    </span>
                  </div>
                  {pkg.validityDays && (
                    <span className="flex items-center gap-1 text-xs text-sage-700/60">
                      <Tag className="h-3 w-3" />
                      {pkg.validityDays} days
                    </span>
                  )}
                </div>
              </button>
            </Card>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}
