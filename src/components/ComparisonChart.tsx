import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

export interface DataPoint {
  date: number;
  [key: string]: number | string | null;
}

interface ComparisonChartProps {
  data: DataPoint[];
  dataKeys: string[];
  colors: Record<string, string>;
  valueFormatter?: (val: number) => string;
}

const formatDate = (timestamp: number) => {
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};

export const ComparisonChart: React.FC<ComparisonChartProps> = ({
  data,
  dataKeys,
  colors,
  valueFormatter = (val) => val.toString()
}) => {
  return (
    <div className="w-full h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart 
          data={data} 
          margin={{ top: 20, right: 30, left: 10, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="4 4" stroke="#334155" vertical={false} />
          <XAxis 
            dataKey="date" 
            tickFormatter={formatDate} 
            stroke="#64748b" 
            tick={{ fill: '#94a3b8', fontSize: 12 }} 
            tickMargin={12}
            minTickGap={40}
            axisLine={false}
            tickLine={false}
          />
          <YAxis 
            tickFormatter={valueFormatter} 
            stroke="#64748b" 
            tick={{ fill: '#94a3b8', fontSize: 12 }} 
            width={85}
            axisLine={false}
            tickLine={false}
            tickMargin={10}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#f8fafc', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
            itemStyle={{ color: '#fff', fontWeight: 500 }}
            labelStyle={{ color: '#94a3b8', marginBottom: '8px' }}
            labelFormatter={(label) => formatDate(label as number)}
            formatter={(value: any, name: any) => [valueFormatter(value as number), name]}
          />
          <Legend 
            wrapperStyle={{ paddingTop: '20px' }} 
            iconType="circle"
          />
          {dataKeys.map((key) => (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              stroke={colors[key] || '#8884d8'}
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 6, fill: colors[key], stroke: '#fff', strokeWidth: 2 }}
              connectNulls={true}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
