import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import type { TooltipProps } from 'recharts';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/utils';

interface RevenueDataPoint {
  date: string;
  revenue: number;
  orders?: number;
}

interface RevenueChartProps {
  data: RevenueDataPoint[];
  className?: string;
}

function CustomTooltip({
  active,
  payload,
  label,
}: TooltipProps<number, string>) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="rounded-md border border-ivory-200 bg-ivory-50/95 px-3 py-2 shadow-md backdrop-blur-sm">
      <p className="mb-1 text-xs font-medium text-gray-600">{label}</p>
      {payload.map((entry) => (
        <p key={entry.dataKey} className="text-sm">
          <span
            className="mr-1.5 inline-block h-2 w-2 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-gray-500">
            {entry.dataKey === 'revenue' ? '营收' : '订单'}:
          </span>{' '}
          <span className="font-medium text-gray-900">
            {entry.dataKey === 'revenue'
              ? formatCurrency(entry.value ?? 0)
              : entry.value}
          </span>
        </p>
      ))}
    </div>
  );
}

export default function RevenueChart({ data, className }: RevenueChartProps) {
  const hasOrders = data.some((d) => d.orders !== undefined);

  return (
    <div className={cn('h-[320px] w-full', className)}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3D7A4A" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#3D7A4A" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="ordersGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#C67B5C" stopOpacity={0.2} />
              <stop offset="100%" stopColor="#C67B5C" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#E8DFCF" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: '#9CA3AF' }}
            axisLine={{ stroke: '#E8DFCF' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#9CA3AF' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v: number) =>
              v >= 10000 ? `${(v / 10000).toFixed(0)}万` : `${v}`
            }
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="top"
            align="right"
            iconType="circle"
            iconSize={8}
            formatter={(value: string) =>
              value === 'revenue' ? '营收' : '订单'
            }
            wrapperStyle={{ fontSize: '12px', color: '#6B7280' }}
          />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#3D7A4A"
            strokeWidth={2}
            fill="url(#revenueGradient)"
            dot={false}
            activeDot={{ r: 4, fill: '#3D7A4A', stroke: '#fff', strokeWidth: 2 }}
          />
          {hasOrders && (
            <Area
              type="monotone"
              dataKey="orders"
              stroke="#C67B5C"
              strokeWidth={2}
              fill="url(#ordersGradient)"
              dot={false}
              activeDot={{ r: 4, fill: '#C67B5C', stroke: '#fff', strokeWidth: 2 }}
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
