import express from 'express';
import cors from 'cors';
import db from './db.js';
import { runSync, getSyncStatus } from './fetcher.js';

const app = express();
app.use(cors());

app.get('/api/metrics', (req, res) => {
  try {
    // Check latest data date
    const latest = db.prepare('SELECT MAX(date) as maxDate FROM metrics').get();
    const isDbEmpty = !latest || !latest.maxDate;
    
    // One day in seconds (DefiLlama stores dates usually at 00:00 UTC)
    // We check if the latest date is older than 2 days ago to be safe,
    // or simply 1 day (86400 seconds)
    const currentUnixDate = Math.floor(Date.now() / 1000);
    const isOutdated = !isDbEmpty && (currentUnixDate - latest.maxDate) >= 86400 * 1.5;

    if (getSyncStatus()) {
      return res.status(202).json({ fetching: true, message: 'Data is currently being fetched' });
    }

    if (isDbEmpty || isOutdated) {
      // Trigger background sync
      runSync().catch(err => console.error(err));
      // Return 202 to tell frontend to poll
      return res.status(202).json({ fetching: true, message: 'Initiated background fetch' });
    }

    const rows = db.prepare('SELECT protocol, date, tvl, fees, revenue FROM metrics ORDER BY date ASC').all();
    
    const result = {};
    rows.forEach(row => {
      if (!result[row.protocol]) {
        result[row.protocol] = [];
      }
      result[row.protocol].push(row);
    });
    
    res.json({ fetching: false, data: result });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
