export interface User {
  id: number;
  name: string;
  created_at: string;
}

export interface WeightRecord {
  id: number;
  user_id: number;
  weight: number;
  date: string;
  created_at: string;
}

export type TimeRange = 'week' | 'month' | 'year' | 'all';

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor: string;
    tension: number;
  }[];
}

export interface Photo {
  id: number;
  user_id: number;
  image_url: string;
  date: string;
  created_at: string;
} 