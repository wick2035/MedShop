import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Calculator, FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { containerVariants, itemVariants } from '@/components/layout/PageContainer';
import PageHeader from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuthStore } from '@/stores/auth.store';
import { insuranceApi } from '@/api/insurance.api';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { InsuranceCoverageResult, InsuranceClaim } from '@/types/insurance';

export default function InsurancePage() {
  const { user } = useAuthStore();

  const [activeTab, setActiveTab] = useState<'calculate' | 'claims'>('calculate');

  // Calculate tab state
  const [orderId, setOrderId] = useState('');
  const [calculating, setCalculating] = useState(false);
  const [coverageResult, setCoverageResult] = useState<InsuranceCoverageResult | null>(null);

  // Claims tab state
  const [claims, setClaims] = useState<InsuranceClaim[]>([]);
  const [claimsLoading, setClaimsLoading] = useState(false);
  const [claimsError, setClaimsError] = useState<string | null>(null);

  useEffect(() => {
    if (activeTab === 'claims') {
      fetchClaims();
    }
  }, [activeTab]);

  async function fetchClaims() {
    setClaimsLoading(true);
    setClaimsError(null);
    try {
      const result = await insuranceApi.getClaims({ patientId: user?.patientId ?? undefined, page: 0, size: 50 });
      const items = 'content' in result ? (result as { content: InsuranceClaim[] }).content : (result as unknown as InsuranceClaim[]);
      setClaims(Array.isArray(items) ? items : []);
    } catch (err) {
      setClaimsError(err instanceof Error ? err.message : 'Failed to load claims');
    } finally {
      setClaimsLoading(false);
    }
  }

  async function handleCalculate() {
    if (!orderId.trim()) {
      toast.error('Please enter an order ID');
      return;
    }
    setCalculating(true);
    setCoverageResult(null);
    try {
      const result = await insuranceApi.calculate({ orderId: orderId.trim() });
      setCoverageResult(result);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Calculation failed');
    } finally {
      setCalculating(false);
    }
  }

  const tabs = [
    { key: 'calculate' as const, label: 'Calculate Coverage', icon: Calculator },
    { key: 'claims' as const, label: 'My Claims', icon: FileText },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8"
    >
      <motion.div variants={itemVariants}>
        <PageHeader title="Medical Insurance" subtitle="Insurance coverage and claims management" />
      </motion.div>

      {/* Tabs */}
      <motion.div variants={itemVariants} className="mb-6 flex gap-2 border-b border-ivory-200">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'border-sage-500 text-sage-700'
                : 'border-transparent text-sage-500 hover:text-sage-700'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </motion.div>

      {/* Calculate tab */}
      {activeTab === 'calculate' && (
        <motion.div variants={itemVariants}>
          <Card className="p-6">
            <h2 className="mb-4 text-base font-semibold text-sage-800">
              Calculate Insurance Coverage
            </h2>
            <p className="mb-4 text-sm text-sage-700/60">
              Enter an order ID to calculate the insurance coverage amount.
            </p>

            <div className="flex gap-3">
              <div className="flex-1">
                <Input
                  placeholder="Enter Order ID"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                />
              </div>
              <Button loading={calculating} onClick={handleCalculate}>
                Calculate
              </Button>
            </div>

            {/* Coverage result */}
            {coverageResult && (
              <div className="mt-6 rounded-lg border border-sage-200 bg-sage-50 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Shield className="h-5 w-5 text-sage-600" />
                  <h3 className="text-base font-semibold text-sage-800">Coverage Breakdown</h3>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-sage-700/70">Total Amount</span>
                    <span className="font-medium text-sage-800">
                      {formatCurrency(coverageResult.totalAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-sage-700/70">Insurance Coverage</span>
                    <span className="font-medium text-green-600">
                      -{formatCurrency(coverageResult.insurancePays)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-sage-700/70">Coverage Ratio</span>
                    <span className="font-medium text-sage-800">
                      {coverageResult.coverageRatio}%
                    </span>
                  </div>
                  <div className="border-t border-sage-200 pt-3">
                    <div className="flex justify-between text-sm font-semibold">
                      <span className="text-sage-800">Self-Pay Amount</span>
                      <span className="text-sage-800">
                        {formatCurrency(coverageResult.patientCopay)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </motion.div>
      )}

      {/* Claims tab */}
      {activeTab === 'claims' && (
        <motion.div variants={itemVariants}>
          {claimsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-sage-500" />
            </div>
          ) : claimsError ? (
            <Card className="py-12 text-center">
              <p className="text-sm text-red-500">{claimsError}</p>
              <Button variant="outline" className="mt-4" onClick={fetchClaims}>
                Retry
              </Button>
            </Card>
          ) : claims.length === 0 ? (
            <Card className="py-12 text-center">
              <FileText className="mx-auto h-10 w-10 text-sage-300" />
              <p className="mt-3 text-sm text-sage-700/60">No insurance claims found</p>
            </Card>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-ivory-200">
                    <th className="py-3 pr-4 text-left font-medium text-sage-700">Claim ID</th>
                    <th className="py-3 pr-4 text-left font-medium text-sage-700">Order</th>
                    <th className="py-3 pr-4 text-left font-medium text-sage-700">Amount</th>
                    <th className="py-3 pr-4 text-left font-medium text-sage-700">Status</th>
                    <th className="py-3 text-left font-medium text-sage-700">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ivory-100">
                  {claims.map((claim) => (
                    <tr key={claim.id} className="hover:bg-ivory-50">
                      <td className="py-3 pr-4 text-sage-800">{claim.claimNo || claim.id.slice(0, 8)}</td>
                      <td className="py-3 pr-4 text-sage-700/70">{claim.orderId?.slice(0, 8) || '-'}</td>
                      <td className="py-3 pr-4 font-medium text-sage-800">
                        {formatCurrency(claim.insurancePays)}
                      </td>
                      <td className="py-3 pr-4">
                        <Badge
                          variant={claim.status === 'APPROVED' ? 'sage' : claim.status === 'REJECTED' ? 'terracotta' : 'default'}
                          size="sm"
                        >
                          {claim.status}
                        </Badge>
                      </td>
                      <td className="py-3 text-sage-700/70">{formatDate(claim.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
