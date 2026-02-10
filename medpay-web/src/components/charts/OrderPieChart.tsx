import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import type { TooltipProps } from 'recharts';
import { cn } from '@/lib/utils';

const DEFAULT_COLORS = ['#3D7A4A', '#C67B5C', '#C9A962', '#7AAFC4', '#C4898A'];

interface PieDataPoint {
  name: string;
  value: number;
  color?: string;
}

interface OrderPieChartProps {
  data: PieDataPoint[];
  className?: string;
}

function CustomTooltip({
  active,
  payload,
}: TooltipProps<number, string>) {
  if (!active || !payload || payload.length === 0) return null;
  const entry = payload[0];
  return (
    <div className="rounded-md border border-ivory-200 bg-ivory-50/95 px-3 py-2 shadow-md backdrop-blur-sm">
      <p className="text-sm">
        <span
          className="mr-1.5 inline-block h-2 w-2 rounded-full"
          style={{ backgroundColor: entry.payload?.fill ?? '#3D7A4A' }}
        />
        <span className="text-gray-500">{entry.name}:</span>{' '}
        <span className="font-medium text-gray-900">{entry.value}</span>
      </p>
    </div>
  );
}

export default function OrderPieChart({ data, className }: OrderPieChartProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className={cn('flex flex-col items-center', className)}>
      <div className="h-[240px] w-full max-w-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={95}
              paddingAngle={3}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell
                  key={entry.name}
                  fill={entry.color ?? DEFAULT_COLORS[index % DEFAULT_COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            {/* Center label */}
            <text
              x="50%"
              y="48%"
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-gray-900 text-xl font-semibold"
              style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
            >
              {total}
            </text>
            <text
              x="50%"
              y="58%"
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-gray-400 text-xs"
            >
              总计
            </text>
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1.5">
        {data.map((entry, index) => {
          const pct = total > 0 ? ((entry.value / total) * 100).toFixed(1) : '0';
          return (
            <div key={entry.name} className="flex items-center gap-1.5 text-xs">
              <span
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{
                  backgroundColor:
                    entry.color ?? DEFAULT_COLORS[index % DEFAULT_COLORS.length],
                }}
              />
              <span className="text-gray-600">
                {entry.name}{' '}
                <span className="text-gray-400">({pct}%)</span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
