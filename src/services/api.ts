const API_URL = 'http://localhost:3001/api';

export interface MetricData {
  protocol: string;
  date: number; // Unix timestamp
  tvl: number | null;
  fees: number | null;
  revenue: number | null;
}

export interface ApiResponse {
  fetching: boolean;
  message?: string;
  data?: Record<string, MetricData[]>;
}

export const fetchMetrics = async (): Promise<ApiResponse> => {
  const response = await fetch(`${API_URL}/metrics`);
  if (!response.ok && response.status !== 202) {
    throw new Error('Failed to fetch metrics');
  }
  return response.json();
};
