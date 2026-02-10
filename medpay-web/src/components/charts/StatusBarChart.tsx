import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import type { TooltipProps } from 'recharts';
import { cn } from '@/lib/utils';

const DEFAULT_COLORS = ['#3D7A4A', '#C67B5C', '#C9A962', '#7AAFC4', '#C4898A'];

interface BarDataPoint {
  name: string;
  value: number;
  color?: string;
}

interface StatusBarChartProps {
  data: BarDataPoint[];
  className?: string;
}

function CustomTooltip({
  active,
  payload,
  label,
}: TooltipProps<number, string>) {
  if (!active || !payload || payload.length === 0) return null;
  const entry = payload[0];

  return (
    <div className="rounded-md border border-ivory-200 bg-ivory-50/95 px-3 py-2 shadow-md backdrop-blur-sm">
      <p className="text-sm">
        <span className="text-gray-500">{label}:</span>{' '}
        <span className="font-medium text-gray-900">{entry.value}</span>
      </p>
    </div>
  );
}

export default function StatusBarChart({ data, className }: StatusBarChartProps) {
  return (
    <div className={cn('h-[280px] w-full', className)}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 4, right: 20, left: 4, bottom: 4 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#E8DFCF" horizontal={false} />
          <XAxis
            type="number"
            tick={{ fontSize: 11, fill: '#9CA3AF' }}
            axisLine={{ stroke: '#E8DFCF' }}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fontSize: 12, fill: '#6B7280' }}
            axisLine={false}
            tickLine={false}
            width={80}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(61, 122, 74, 0.04)' }} />
          <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
            {data.map((entry, index) => (
              <Cell
                key={entry.name}
                fill={entry.color ?? DEFAULT_COLORS[index % DEFAULT_COLORS.length]}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
