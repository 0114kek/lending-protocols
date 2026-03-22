import React, { useMemo } from 'react';
import type { DataPoint } from './ComparisonChart';

interface TvlTableProps {
  data: DataPoint[];
  protocols: string[];
}

const formatCurrency = (val: number) => {
  if (val >= 1e9) return `$${(val / 1e9).toFixed(2)}B`;
  if (val >= 1e6) return `$${(val / 1e6).toFixed(2)}M`;
  if (val >= 1e3) return `$${(val / 1e3).toFixed(2)}K`;
  return `$${val.toFixed(2)}`;
};

const formatPercent = (val: number) => {
  return `${val > 0 ? '+' : ''}${val.toFixed(2)}%`;
};

const PROTOCOL_NAMES: Record<string, string> = {
  'aave-v3': 'Aave V3',
  'morpho-v1': 'Morpho',
  'euler-v2': 'Euler V2',
  'fluid-lending': 'Fluid Lending',
};

export const TvlTable: React.FC<TvlTableProps> = ({ data, protocols }) => {
  const stats = useMemo(() => {
    if (!data.length) return [];
    
    // We base 30d cutoff on the absolute latest date available
    const latestDate = data[data.length - 1].date;
    const cutoff30d = latestDate - 30 * 86400;

    let totalTvl = 0;

    const protocolStats = protocols.map(p => {
      let currentTvl = 0;
      for (let i = data.length - 1; i >= 0; i--) {
        if (data[i][`${p}_tvl`] != null) {
          currentTvl = Number(data[i][`${p}_tvl`]);
          break;
        }
      }

      let pastTvl = 0;
      for (let i = data.length - 1; i >= 0; i--) {
        if (data[i].date <= cutoff30d && data[i][`${p}_tvl`] != null) {
          pastTvl = Number(data[i][`${p}_tvl`]);
          break;
        }
      }

      totalTvl += currentTvl;
      
      const changeAbs = currentTvl - pastTvl;
      const changePct = pastTvl > 0 ? (changeAbs / pastTvl) * 100 : 0;

      return {
        protocol: PROTOCOL_NAMES[p] || p,
        currentTvl,
        changeAbs,
        changePct
      };
    });

    return protocolStats.map(s => ({
      ...s,
      share: totalTvl > 0 ? (s.currentTvl / totalTvl) * 100 : 0
    })).sort((a, b) => b.currentTvl - a.currentTvl);
  }, [data, protocols]);

  return (
    <div className="glass-panel overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="text-slate-400">
            <tr>
              <th className="px-6 py-4">Protocol</th>
              <th className="px-6 py-4 text-right">Current TVL</th>
              <th className="px-6 py-4 text-right">TVL Share</th>
              <th className="px-6 py-4 text-right">30d Change</th>
            </tr>
          </thead>
          <tbody>
            {stats.map(s => (
              <tr key={s.protocol}>
                <td className="px-6 py-4 font-semibold text-white truncate">{s.protocol}</td>
                <td className="px-6 py-4 text-right font-medium text-white">{formatCurrency(s.currentTvl)}</td>
                <td className="px-6 py-4 text-right text-blue-400">{s.share.toFixed(2)}%</td>
                <td className={`px-6 py-4 text-right font-medium ${s.changePct >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {formatPercent(s.changePct)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
