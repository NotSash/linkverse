import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import type { PieLabelRenderProps } from 'recharts';

// ============================================
// Constants & Types
// ============================================

const COLORS = [
  '#6366f1',
  '#ec4899',
  '#f59e0b',
  '#10b981',
  '#3b82f6',
  '#8b5cf6',
  '#ef4444',
  '#14b8a6',
];

interface ChartProps {
  data: any[];
  xKey: string;
  yKey: string;
  color?: string;
  title: string;
}

interface PieChartComponentProps {
  data: any[];
  nameKey: string;
  valueKey: string;
  title: string;
}

// ============================================
// Helpers
// ============================================

/**
 * Format date string from "2024-01-15" to "Jan 15"
 */
const formatDateLabel = (dateStr: string): string => {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr + 'T00:00:00');
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
};

/**
 * Format full date for tooltips: "15 Jan 2024"
 */
const formatDateTooltip = (dateStr: string): string => {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr + 'T00:00:00');
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
};

/**
 * Truncate long labels for bar chart x-axis
 */
const truncateLabel = (label: string, maxLen = 12): string => {
  if (!label) return '';
  return label.length > maxLen ? label.substring(0, maxLen) + '…' : label;
};

// ============================================
// Custom Tooltips
// ============================================

interface TooltipPayload {
  color: string;
  name: string;
  value: number;
}

const CustomTooltip = ({
  active,
  payload,
  label,
  isDate = false,
}: {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
  isDate?: boolean;
}) => {
  if (!active || !payload?.length) return null;

  const displayLabel = isDate && label ? formatDateTooltip(label) : label;

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg px-4 py-3 text-sm">
      <p className="font-medium text-gray-700 mb-1.5">{displayLabel}</p>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-full shrink-0"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-gray-500">{entry.name}:</span>
          <span className="font-semibold text-gray-900">
            {entry.value?.toLocaleString('en-IN')}
          </span>
        </div>
      ))}
    </div>
  );
};

const PieTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: any[];
}) => {
  if (!active || !payload?.length) return null;
  const entry = payload[0];
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg px-4 py-3 text-sm">
      <div className="flex items-center gap-2">
        <span
          className="w-2.5 h-2.5 rounded-full shrink-0"
          style={{ backgroundColor: entry.payload?.fill }}
        />
        <span className="font-medium text-gray-700">{entry.name}</span>
      </div>
      <p className="text-gray-900 font-semibold mt-1">
        {entry.value?.toLocaleString('en-IN')} (
        {((entry.payload?.percent || 0) * 100).toFixed(1)}%)
      </p>
    </div>
  );
};

// ============================================
// Empty State
// ============================================

function ChartEmpty({ title }: { title: string }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">{title}</h3>
      <div className="h-[250px] flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mb-3">
          <svg
            className="w-6 h-6 text-gray-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
        </div>
        <p className="text-sm text-gray-400">No data available</p>
      </div>
    </div>
  );
}

// ============================================
// Chart Components
// ============================================

export function LineChartComponent({
  data,
  xKey,
  yKey,
  color = '#6366f1',
  title,
}: ChartProps) {
  if (!data || data.length === 0) return <ChartEmpty title={title} />;

  const isDateAxis =
    data[0]?.[xKey] && /^\d{4}-\d{2}-\d{2}/.test(data[0][xKey]);

  const tickInterval =
    data.length > 60
      ? Math.floor(data.length / 8)
      : data.length > 14
      ? Math.floor(data.length / 7)
      : 0;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart
          data={data}
          margin={{ top: 5, right: 10, left: -10, bottom: 5 }}
        >
          <defs>
            <linearGradient
              id={`gradient-${color.replace('#', '')}`}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop offset="0%" stopColor={color} stopOpacity={0.15} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#f3f4f6"
            vertical={false}
          />
          <XAxis
            dataKey={xKey}
            tick={{ fontSize: 11, fill: '#9ca3af' }}
            tickLine={false}
            axisLine={{ stroke: '#e5e7eb' }}
            tickFormatter={isDateAxis ? formatDateLabel : undefined}
            interval={tickInterval}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#9ca3af' }}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
          />
          <Tooltip
            content={<CustomTooltip isDate={isDateAxis} />}
            cursor={{ stroke: '#e5e7eb', strokeDasharray: '4 4' }}
          />
          <Line
            type="monotone"
            dataKey={yKey}
            stroke={color}
            strokeWidth={2.5}
            dot={false}
            activeDot={{
              r: 5,
              fill: color,
              stroke: '#fff',
              strokeWidth: 2,
            }}
            fill={`url(#gradient-${color.replace('#', '')})`}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function BarChartComponent({
  data,
  xKey,
  yKey,
  color = '#6366f1',
  title,
}: ChartProps) {
  if (!data || data.length === 0) return <ChartEmpty title={title} />;

  const isDateAxis =
    data[0]?.[xKey] && /^\d{4}-\d{2}-\d{2}/.test(data[0][xKey]);

  const formatTick = (value: string) => {
    if (isDateAxis) return formatDateLabel(value);
    return truncateLabel(value, 10);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart
          data={data}
          margin={{ top: 5, right: 10, left: -10, bottom: 5 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#f3f4f6"
            vertical={false}
          />
          <XAxis
            dataKey={xKey}
            tick={{ fontSize: 10, fill: '#9ca3af' }}
            tickLine={false}
            axisLine={{ stroke: '#e5e7eb' }}
            tickFormatter={formatTick}
            interval={0}
            angle={data.length > 5 ? -30 : 0}
            textAnchor={data.length > 5 ? 'end' : 'middle'}
            height={data.length > 5 ? 60 : 30}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#9ca3af' }}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
          />
          <Tooltip
            content={<CustomTooltip isDate={isDateAxis} />}
            cursor={{ fill: '#f9fafb' }}
          />
          <Bar
            dataKey={yKey}
            fill={color}
            radius={[6, 6, 0, 0]}
            maxBarSize={48}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function PieChartComponent({
  data,
  nameKey,
  valueKey,
  title,
}: PieChartComponentProps) {
  if (!data || data.length === 0) return <ChartEmpty title={title} />;

  // Custom label — compatible with Recharts PieLabelRenderProps
  const renderLabel = (props: PieLabelRenderProps) => {
    const { name, percent, cx, x } = props;

    // Skip labels for small slices (< 5%)
    if (typeof percent !== 'number' || percent < 0.05) return null;

    const labelName = typeof name === 'string' ? name : String(name || '');
    const truncated =
      labelName.length > 10 ? labelName.substring(0, 10) + '…' : labelName;

    const numCx = typeof cx === 'number' ? cx : 0;
    const numX = typeof x === 'number' ? x : 0;

    return (
      <text
        x={numX}
        y={0}
        fill="#6b7280"
        textAnchor={numX > numCx ? 'start' : 'end'}
        dominantBaseline="central"
        fontSize={11}
      >
        {`${truncated} ${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={data}
            dataKey={valueKey}
            nameKey={nameKey}
            cx="50%"
            cy="45%"
            outerRadius={85}
            innerRadius={45}
            paddingAngle={2}
            label={renderLabel}
            labelLine={{ stroke: '#d1d5db', strokeWidth: 1 }}
          >
            {data.map((_: any, index: number) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
                className="transition-opacity hover:opacity-80"
              />
            ))}
          </Pie>
          <Tooltip content={<PieTooltip />} />
          <Legend
            verticalAlign="bottom"
            height={36}
            iconType="circle"
            iconSize={8}
            formatter={(value: string) => (
              <span className="text-xs text-gray-600">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}