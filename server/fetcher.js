import db from './db.js';

const protocols = ['aave-v3', 'morpho-v1', 'euler-v2', 'fluid-lending'];

async function fetchWithRetry(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Status ${res.status}`);
      return await res.json();
    } catch (e) {
      if (i === retries - 1) throw e;
      await new Promise(r => setTimeout(r, 1000 * (i + 1)));
    }
  }
}

async function syncProtocol(slug) {
  console.log(`Syncing ${slug}...`);
  try {
    const [tvlData, feesData, revData] = await Promise.allSettled([
      fetchWithRetry(`https://api.llama.fi/protocol/${slug}`),
      fetchWithRetry(`https://api.llama.fi/summary/fees/${slug}?dataType=dailyFees`),
      fetchWithRetry(`https://api.llama.fi/summary/fees/${slug}?dataType=dailyRevenue`)
    ]);

    const dataByDate = {};
    
    // Process TVL (Unix timestamp vs Date)
    // The TVL API returns a real-time entry at the end with a non-midnight timestamp,
    // while fees/revenue APIs only have midnight (00:00 UTC) timestamps.
    // Normalize all TVL timestamps to midnight UTC so they align with fees/revenue data.
    if (tvlData.status === 'fulfilled' && tvlData.value && tvlData.value.tvl) {
      tvlData.value.tvl.forEach(item => {
        const normalizedDate = Math.floor(item.date / 86400) * 86400;
        // Use the latest TVL value for each day (real-time entry overwrites midnight entry)
        dataByDate[normalizedDate] = { tvl: item.totalLiquidityUSD };
      });
    }
    
    // Process Fees (totalDataChart)
    if (feesData.status === 'fulfilled' && feesData.value && feesData.value.totalDataChart) {
      feesData.value.totalDataChart.forEach(([timestamp, value]) => {
        if (!dataByDate[timestamp]) dataByDate[timestamp] = {};
        dataByDate[timestamp].fees = value || 0;
      });
    }
    
    // Process Revenue
    if (revData.status === 'fulfilled' && revData.value && revData.value.totalDataChart) {
      revData.value.totalDataChart.forEach(([timestamp, value]) => {
        if (!dataByDate[timestamp]) dataByDate[timestamp] = {};
        dataByDate[timestamp].revenue = value || 0;
      });
    }

    const insertStmt = db.prepare(`
      INSERT OR REPLACE INTO metrics (protocol, date, tvl, fees, revenue)
      VALUES (@protocol, @date, @tvl, @fees, @revenue)
    `);

    const insertMany = db.transaction((items) => {
      for (const item of items) insertStmt.run(item);
    });

    const items = Object.entries(dataByDate).map(([date, vals]) => ({
      protocol: slug,
      date: parseInt(date),
      tvl: vals.tvl || null,
      fees: vals.fees || null,
      revenue: vals.revenue || null
    }));

    if (items.length > 0) {
      insertMany(items);
      console.log(`Inserted/Updated ${items.length} records for ${slug}`);
    }

  } catch (error) {
    console.error(`Failed to sync ${slug}:`, error.message);
  }
}

let isSyncing = false;

export async function runSync() {
  if (isSyncing) return;
  isSyncing = true;
  console.log('Starting background sync...');
  try {
    for (const slug of protocols) {
      await syncProtocol(slug);
      // Respect API rate limits
      await new Promise(r => setTimeout(r, 1000));
    }
  } finally {
    isSyncing = false;
    console.log('Sync complete');
  }
}

export function getSyncStatus() {
  return isSyncing;
}
