import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, ChevronDown, ChevronRight, Shield, Search } from 'lucide-react';
import { toast } from 'sonner';

import type { AuditLog } from '@/types/audit';
import type { PaginatedResponse } from '@/types/api';

import PageContainer, { itemVariants } from '@/components/layout/PageContainer';
import PageHeader from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';

import { auditApi } from '@/api/audit.api';
import { formatDateTime } from '@/lib/utils';
import { useHospitalContextStore } from '@/stores/hospital-context.store';

const ENTITY_TYPES = ['', 'ORDER', 'PAYMENT', 'REFUND', 'HOSPITAL', 'USER', 'SERVICE', 'PRODUCT', 'SCHEDULE'];
const ACTIONS = ['', 'CREATE', 'UPDATE', 'DELETE', 'STATUS_CHANGE', 'LOGIN', 'LOGOUT'];

export default function AuditLogPage() {
  const { selectedHospitalId } = useHospitalContextStore();

  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Filters
  const [filters, setFilters] = useState({
    action: '',
    entityType: '',
    startDate: '',
    endDate: '',
  });

  // Expanded rows for JSON diff
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await auditApi.getLogs({
        hospitalId: selectedHospitalId ?? undefined,
        action: filters.action || undefined,
        entityType: filters.entityType || undefined,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
        page,
        size: 20,
      });
      if (Array.isArray(result)) {
        setLogs(result);
        setTotalPages(1);
      } else {
        const paginated = result as PaginatedResponse<AuditLog>;
        setLogs(paginated.content ?? []);
        setTotalPages(paginated.totalPages ?? 1);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load audit logs';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, selectedHospitalId]);

  const handleSearch = () => {
    setPage(0);
    fetchLogs();
  };

  const toggleExpand = (id: number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'CREATE':
        return <Badge variant="success" size="sm">{action}</Badge>;
      case 'UPDATE':
        return <Badge variant="sage" size="sm">{action}</Badge>;
      case 'DELETE':
        return <Badge variant="error" size="sm">{action}</Badge>;
      case 'STATUS_CHANGE':
        return <Badge variant="warning" size="sm">{action}</Badge>;
      case 'LOGIN':
        return <Badge variant="sky" size="sm">{action}</Badge>;
      case 'LOGOUT':
        return <Badge variant="default" size="sm">{action}</Badge>;
      default:
        return <Badge variant="default" size="sm">{action}</Badge>;
    }
  };

  /** Attempt to pretty-print a JSON string; fall back to raw text */
  const formatJson = (val: string | null) => {
    if (!val) return null;
    try {
      return JSON.stringify(JSON.parse(val), null, 2);
    } catch {
      return val;
    }
  };

  if (error) {
    return (
      <PageContainer>
        <div className="flex h-64 flex-col items-center justify-center gap-4 text-gray-500">
          <AlertCircle className="h-12 w-12 text-red-400" />
          <p>{error}</p>
          <Button variant="outline" onClick={fetchLogs}>Retry</Button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Audit Log"
        subtitle="System activity and change history"
        breadcrumbs={[
          { label: 'Audit', href: '/admin/audit' },
          { label: 'Logs' },
        ]}
      />

      {/* Filters */}
      <div className="mb-6 flex flex-wrap items-end gap-3 rounded-lg border border-ivory-200/60 bg-white/70 p-4 backdrop-blur-sm">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">Action</label>
          <Select
            value={filters.action}
            onChange={(e) => setFilters((prev) => ({ ...prev, action: e.target.value }))}
          >
            <option value="">All Actions</option>
            {ACTIONS.filter(Boolean).map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </Select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">Entity Type</label>
          <Select
            value={filters.entityType}
            onChange={(e) => setFilters((prev) => ({ ...prev, entityType: e.target.value }))}
          >
            <option value="">All Types</option>
            {ENTITY_TYPES.filter(Boolean).map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </Select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">Start Date</label>
          <Input
            type="date"
            value={filters.startDate}
            onChange={(e) => setFilters((prev) => ({ ...prev, startDate: e.target.value }))}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">End Date</label>
          <Input
            type="date"
            value={filters.endDate}
            onChange={(e) => setFilters((prev) => ({ ...prev, endDate: e.target.value }))}
          />
        </div>
        <Button icon={<Search className="h-4 w-4" />} onClick={handleSearch}>
          Search
        </Button>
      </div>

      {/* Log entries */}
      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-sage-200 border-t-sage-500" />
        </div>
      ) : logs.length === 0 ? (
        <div className="flex h-48 flex-col items-center justify-center gap-2 text-gray-400">
          <Shield className="h-12 w-12 text-gray-300" />
          <p className="text-sm">No audit log entries found</p>
        </div>
      ) : (
        <motion.div variants={itemVariants} initial="hidden" animate="visible" className="space-y-2">
          {logs.map((log) => {
            const isExpanded = expandedIds.has(log.id);
            const hasDetails = log.oldValue || log.newValue;

            return (
              <div
                key={log.id}
                className="rounded-lg border border-ivory-200/60 bg-white/70 backdrop-blur-sm overflow-hidden"
              >
                {/* Main row */}
                <div
                  className={`flex items-center gap-3 p-4 ${hasDetails ? 'cursor-pointer hover:bg-ivory-50/50' : ''}`}
                  onClick={() => hasDetails && toggleExpand(log.id)}
                >
                  {hasDetails ? (
                    isExpanded ? (
                      <ChevronDown className="h-4 w-4 shrink-0 text-gray-400" />
                    ) : (
                      <ChevronRight className="h-4 w-4 shrink-0 text-gray-400" />
                    )
                  ) : (
                    <div className="h-4 w-4 shrink-0" />
                  )}

                  <div className="flex flex-1 flex-wrap items-center gap-x-4 gap-y-1">
                    {/* Timestamp */}
                    <span className="text-xs text-gray-400 whitespace-nowrap">{formatDateTime(log.createdAt)}</span>

                    {/* Action badge */}
                    {getActionBadge(log.action)}

                    {/* Entity */}
                    <span className="text-sm text-gray-700">
                      <span className="font-medium">{log.entityType}</span>
                      {log.entityId && (
                        <span className="ml-1 font-mono text-xs text-gray-400">#{log.entityId.substring(0, 8)}</span>
                      )}
                    </span>

                    {/* Description */}
                    {log.description && (
                      <span className="text-sm text-gray-500">{log.description}</span>
                    )}

                    {/* User */}
                    <span className="ml-auto text-xs text-gray-400 whitespace-nowrap">
                      {log.userId ? (
                        <>
                          {log.userRole && <Badge variant="default" size="sm">{log.userRole}</Badge>}
                          {' '}
                          <span className="font-mono">{log.userId.substring(0, 8)}</span>
                        </>
                      ) : (
                        'System'
                      )}
                    </span>

                    {/* IP */}
                    {log.ipAddress && (
                      <span className="text-xs text-gray-300 font-mono">{log.ipAddress}</span>
                    )}
                  </div>
                </div>

                {/* Expanded details: JSON diff */}
                {isExpanded && hasDetails && (
                  <div className="border-t border-ivory-200/60 bg-ivory-50/30 px-4 py-3">
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                      {log.oldValue && (
                        <div>
                          <h4 className="mb-1 text-xs font-semibold text-red-600 uppercase tracking-wider">Old Value</h4>
                          <pre className="max-h-64 overflow-auto rounded bg-red-50 p-3 text-xs text-red-800 font-mono whitespace-pre-wrap">
                            {formatJson(log.oldValue)}
                          </pre>
                        </div>
                      )}
                      {log.newValue && (
                        <div>
                          <h4 className="mb-1 text-xs font-semibold text-emerald-600 uppercase tracking-wider">New Value</h4>
                          <pre className="max-h-64 overflow-auto rounded bg-emerald-50 p-3 text-xs text-emerald-800 font-mono whitespace-pre-wrap">
                            {formatJson(log.newValue)}
                          </pre>
                        </div>
                      )}
                    </div>
                    {(log.requestMethod || log.requestUri) && (
                      <div className="mt-3 text-xs text-gray-400">
                        {log.requestMethod && <span className="font-semibold mr-1">{log.requestMethod}</span>}
                        {log.requestUri && <span className="font-mono">{log.requestUri}</span>}
                      </div>
                    )}
                    {log.userAgent && (
                      <div className="mt-1 text-xs text-gray-300 truncate" title={log.userAgent}>
                        UA: {log.userAgent}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </motion.div>
      )}

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(page - 1)}>Previous</Button>
          <span className="text-sm text-gray-500">Page {page + 1} of {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>Next</Button>
        </div>
      )}
    </PageContainer>
  );
}
