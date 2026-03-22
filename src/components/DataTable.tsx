import React, { useMemo } from 'react';
import type { DataPoint } from './ComparisonChart';

interface DataTableProps {
  data: DataPoint[];
  protocols: string[];
}

const formatCurrency = (val: number) => {
  if (val >= 1e9) return `$${(val / 1e9).toFixed(2)}B`;
  if (val >= 1e6) return `$${(val / 1e6).toFixed(2)}M`;
  if (val >= 1e3) return `$${(val / 1e3).toFixed(2)}K`;
  return `$${val.toFixed(2)}`;
};

const PROTOCOL_NAMES: Record<string, string> = {
  'aave-v3': 'Aave V3',
  'morpho-v1': 'Morpho',
  'euler-v2': 'Euler V2',
  'fluid-lending': 'Fluid Lending',
};

export const DataTable: React.FC<DataTableProps> = ({ data, protocols }) => {
  const stats = useMemo(() => {
    if (!data.length) return [];
    
    const latestDate = data[data.length - 1].date;
    const cutoff7d = latestDate - 7 * 86400;
    const cutoff30d = latestDate - 30 * 86400;

    return protocols.map(p => {
      let fees7d = 0;
      let rev7d = 0;
      let fees30d = 0;
      let rev30d = 0;

      data.forEach(d => {
        if (d.date >= cutoff7d) {
          fees7d += Number(d[`${p}_fees`]) || 0;
          rev7d += Number(d[`${p}_revenue`]) || 0;
        }
        if (d.date >= cutoff30d) {
          fees30d += Number(d[`${p}_fees`]) || 0;
          rev30d += Number(d[`${p}_revenue`]) || 0;
        }
      });

      return {
        protocol: PROTOCOL_NAMES[p] || p,
        fees7d,
        fees30d,
        feesAnnual: fees30d * 12,
        rev7d,
        rev30d,
        revAnnual: rev30d * 12,
      };
    });
  }, [data, protocols]);

  return (
    <div className="glass-panel overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-[#1e293b]/80 text-slate-400 border-b border-white/5 font-medium">
            <tr>
              <th className="px-6 py-4">Protocol</th>
              <th className="px-6 py-4 text-right">Fees (7d)</th>
              <th className="px-6 py-4 text-right">Fees (30d)</th>
              <th className="px-6 py-4 text-right">Fees (Annualized)</th>
              <th className="px-6 py-4 text-right">Revenue (7d)</th>
              <th className="px-6 py-4 text-right">Revenue (30d)</th>
              <th className="px-6 py-4 text-right">Revenue (Annualized)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {stats.map(s => (
              <tr key={s.protocol} className="hover:bg-slate-800/30 transition-colors">
                <td className="px-6 py-4 font-semibold text-white truncate">{s.protocol}</td>
                <td className="px-6 py-4 text-right">{formatCurrency(s.fees7d)}</td>
                <td className="px-6 py-4 text-right">{formatCurrency(s.fees30d)}</td>
                <td className="px-6 py-4 text-right text-emerald-400 font-medium">{formatCurrency(s.feesAnnual)}</td>
                <td className="px-6 py-4 text-right">{formatCurrency(s.rev7d)}</td>
                <td className="px-6 py-4 text-right">{formatCurrency(s.rev30d)}</td>
                <td className="px-6 py-4 text-right text-blue-400 font-medium">{formatCurrency(s.revAnnual)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
