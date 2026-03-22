import React, { useEffect, useState, useMemo } from 'react';
import clsx from 'clsx';
import { fetchMetrics, type MetricData } from '../services/api';
import { ComparisonChart, type DataPoint } from './ComparisonChart';
import { DataTable } from './DataTable';
import { TvlTable } from './TvlTable';
import { Activity, DollarSign, PieChart, Table } from 'lucide-react';

const COLORS: Record<string, string> = {
  'aave-v3': '#8b5cf6', // Violet
  'morpho-v1': '#3b82f6', // Blue
  'euler-v2': '#0ea5e9',  // Sky
  'fluid-lending': '#10b981', // Emerald
};


const formatCurrency = (val: number) => {
  if (val >= 1e9) return `$${(val / 1e9).toFixed(2)}B`;
  if (val >= 1e6) return `$${(val / 1e6).toFixed(2)}M`;
  if (val >= 1e3) return `$${(val / 1e3).toFixed(2)}K`;
  return `$${val.toFixed(2)}`;
};

type TimeRange = '1W' | '1M' | '6M' | '1Y' | 'ALL';

export const Dashboard: React.FC = () => {
  const [data, setData] = useState<Record<string, MetricData[]>>({});
  const [loading, setLoading] = useState(true);
  const [fetchingData, setFetchingData] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>('ALL');

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    const loadData = () => {
      fetchMetrics()
        .then(res => {
          if (res.fetching) {
            setFetchingData(true);
            timeoutId = setTimeout(loadData, 3000); // Poll every 3 seconds
          } else if (res.data) {
            setData(res.data);
            setFetchingData(false);
            setLoading(false);
          }
        })
        .catch(e => {
          setError(e.message);
          setLoading(false);
        });
    };

    loadData();

    return () => clearTimeout(timeoutId);
  }, []);

  // Merge data for charts
  const { chartData, protocols } = useMemo(() => {
    const datesSet = new Set<number>();
    const protocols = Object.keys(data);
    
    protocols.forEach(p => {
      data[p].forEach(item => datesSet.add(item.date));
    });

    const ArrayDates = Array.from(datesSet).sort((a, b) => a - b);
    
    // Create a map for fast lookup
    const lookup: Record<string, Record<number, MetricData>> = {};
    protocols.forEach(p => {
      lookup[p] = {};
      data[p].forEach(item => lookup[p][item.date] = item);
    });

    const mergedData: DataPoint[] = ArrayDates.map(date => {
      const point: DataPoint = { date };
      protocols.forEach(p => {
        point[`${p}_tvl`] = lookup[p][date]?.tvl ?? null;
        point[`${p}_fees`] = lookup[p][date]?.fees ?? null;
        point[`${p}_revenue`] = lookup[p][date]?.revenue ?? null;
      });
      return point;
    });

    return { chartData: mergedData, protocols };
  }, [data]);

  const filteredChartData = useMemo(() => {
    if (timeRange === 'ALL' || !chartData.length) return chartData;
    
    // We'll use relative dates from the latest data point instead of Date.now() 
    // to accurately show what '1M' means relative to the data
    const latestDate = chartData[chartData.length - 1].date;
    let cutoff = 0;
    
    switch (timeRange) {
      case '1W': cutoff = latestDate - 7 * 86400; break;
      case '1M': cutoff = latestDate - 30 * 86400; break;
      case '6M': cutoff = latestDate - 180 * 86400; break;
      case '1Y': cutoff = latestDate - 365 * 86400; break;
      default: cutoff = latestDate - 30 * 86400;
    }
    
    return chartData.filter(d => d.date >= cutoff);
  }, [chartData, timeRange]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-slate-400">
        <div className="text-xl mb-4 font-medium text-slate-300">
          {fetchingData ? 'Syncing latest data from DefiLlama...' : 'Loading metrics...'}
        </div>
        {fetchingData && (
          <div className="animate-pulse text-sm text-blue-400 mt-2">
            This might take a few seconds
          </div>
        )}
      </div>
    );
  }
  if (error) return <div className="min-h-screen flex items-center justify-center text-rose-400">Error: {error}</div>;

  const tvlKeys = protocols.map(p => `${p}_tvl`);
  const feesKeys = protocols.map(p => `${p}_fees`);
  const revKeys = protocols.map(p => `${p}_revenue`);

  const chartColors: Record<string, string> = {};
  protocols.forEach(p => {
    chartColors[`${p}_tvl`] = COLORS[p];
    chartColors[`${p}_fees`] = COLORS[p];
    chartColors[`${p}_revenue`] = COLORS[p];
  });

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <header className="mb-10">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 mb-2">
          Lending Protocols Overview
        </h1>
        <p className="text-slate-400">Compare TVL, Fees, and Revenue across top lending markets.</p>
      </header>

      <div className="space-y-8">
        <div className="glass-panel p-6">
          <div className="flex items-center space-x-2 mb-6">
            <PieChart className="w-6 h-6 text-blue-400" />
            <h2 className="text-xl font-bold text-white">TVL Distribution & 30d Changes</h2>
          </div>
          <TvlTable data={chartData} protocols={protocols} />
        </div>

        <div className="glass-panel p-6">
          <div className="flex items-center space-x-2 mb-6">
            <Table className="w-6 h-6 text-emerald-400" />
            <h2 className="text-xl font-bold text-white">Fees & Revenue Summary</h2>
          </div>
          <DataTable data={chartData} protocols={protocols} />
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between pt-8 pb-2">
          <h2 className="text-2xl font-bold text-white mb-4 sm:mb-0">Interactive Charts</h2>
          <div className="btn-group">
            {['1W', '1M', '6M', '1Y', 'ALL'].map(range => (
              <button
                key={range}
                onClick={() => setTimeRange(range as TimeRange)}
                className={clsx("period-btn", timeRange === range && "active")}
              >
                {range}
              </button>
            ))}
          </div>
        </div>

        <div className="glass-panel p-6">
          <div className="flex items-center space-x-2 mb-6">
            <PieChart className="w-6 h-6 text-blue-400" />
            <h2 className="text-xl font-bold text-white">Total Value Locked (TVL) Trend</h2>
          </div>
          <ComparisonChart 
            data={filteredChartData} 
            dataKeys={tvlKeys} 
            colors={chartColors} 
            valueFormatter={formatCurrency}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="glass-panel p-6">
            <div className="flex items-center space-x-2 mb-6">
              <Activity className="w-6 h-6 text-rose-400" />
              <h2 className="text-xl font-bold text-white">Daily Fees</h2>
            </div>
            <ComparisonChart 
              data={filteredChartData} 
              dataKeys={feesKeys} 
              colors={chartColors} 
              valueFormatter={formatCurrency}
            />
          </div>
          
          <div className="glass-panel p-6">
            <div className="flex items-center space-x-2 mb-6">
              <DollarSign className="w-6 h-6 text-emerald-400" />
              <h2 className="text-xl font-bold text-white">Daily Revenue</h2>
            </div>
            <ComparisonChart 
              data={filteredChartData} 
              dataKeys={revKeys} 
              colors={chartColors} 
              valueFormatter={formatCurrency}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
