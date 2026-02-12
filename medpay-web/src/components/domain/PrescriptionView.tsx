import { FileText } from 'lucide-react';
import type { PrescriptionResponse } from '@/types/prescription';
import { formatCurrency, formatDateTime, cn } from '@/lib/utils';

interface PrescriptionViewProps {
  prescription: PrescriptionResponse;
  className?: string;
}

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: 'bg-emerald-50 text-emerald-700',
  FILLED: 'bg-blue-50 text-blue-700',
  EXPIRED: 'bg-gray-100 text-gray-500',
  CANCELLED: 'bg-red-50 text-red-700',
};

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: '有效',
  FILLED: '已配药',
  EXPIRED: '已过期',
  CANCELLED: '已取消',
};

export default function PrescriptionView({
  prescription,
  className,
}: PrescriptionViewProps) {
  const statusStyle =
    STATUS_STYLES[prescription.status] ?? 'bg-gray-100 text-gray-700';
  const statusLabel =
    STATUS_LABELS[prescription.status] ?? prescription.status;

  return (
    <div
      className={cn(
        'rounded-lg bg-white border border-ivory-200/60 shadow-sm overflow-hidden',
        className,
      )}
    >
      {/* Header */}
      <div className="border-b border-ivory-200 bg-ivory-50/50 px-5 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sage-100 text-sage-600">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-sage-700 font-display">
                  Rx
                </h3>
                <span className="font-mono text-sm text-gray-600">
                  {prescription.id.slice(0, 8).toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-gray-400">
                开具于 {formatDateTime(prescription.createdAt)}
              </p>
            </div>
          </div>
          <span
            className={cn(
              'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
              statusStyle,
            )}
          >
            {statusLabel}
          </span>
        </div>

        {/* Patient + Doctor */}
        <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm">
          <span className="text-gray-500">
            患者：<span className="text-gray-700">{prescription.patientId.slice(0, 8)}</span>
          </span>
          <span className="text-gray-500">
            医生：<span className="text-gray-700">{prescription.doctorId.slice(0, 8)}</span>
          </span>
          <span className="text-gray-500">
            处方号：<span className="text-gray-700">{prescription.prescriptionNo}</span>
          </span>
        </div>
      </div>

      {/* Diagnosis */}
      <div className="border-b border-ivory-200/60 px-5 py-3">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
          诊断
        </h4>
        <p className="mt-1 text-sm text-gray-800">{prescription.diagnosis}</p>
        {prescription.notes && (
          <p className="mt-1 text-xs text-gray-500">
            备注：{prescription.notes}
          </p>
        )}
      </div>

      {/* Items table */}
      <div className="px-5 py-3">
        <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
          药品明细
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ivory-200 text-left text-xs text-gray-500">
                <th className="pb-2 pr-4 font-medium">药品名称</th>
                <th className="pb-2 pr-4 font-medium">用法用量</th>
                <th className="pb-2 pr-4 font-medium">频次</th>
                <th className="pb-2 pr-4 font-medium text-right">数量</th>
                <th className="pb-2 pr-4 font-medium text-right">单价</th>
                <th className="pb-2 font-medium text-right">小计</th>
              </tr>
            </thead>
            <tbody>
              {prescription.items.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-ivory-200/40"
                >
                  <td className="py-2 pr-4 text-gray-800">{item.productName}</td>
                  <td className="py-2 pr-4 text-gray-600">{item.dosageInstruction}</td>
                  <td className="py-2 pr-4 text-gray-600">{item.frequency}</td>
                  <td className="py-2 pr-4 text-right text-gray-700">
                    {item.quantity}
                  </td>
                  <td className="py-2 pr-4 text-right text-gray-500">
                    {formatCurrency(item.unitPrice)}
                  </td>
                  <td className="py-2 text-right font-medium text-gray-800">
                    {formatCurrency(item.unitPrice * item.quantity)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Total */}
      <div className="flex items-center justify-end border-t border-ivory-200 bg-ivory-50/30 px-5 py-3">
        <span className="mr-3 text-sm text-gray-500">合计金额</span>
        <span className="text-xl font-semibold text-sage-600 font-display">
          {formatCurrency(prescription.totalAmount)}
        </span>
      </div>
    </div>
  );
}
