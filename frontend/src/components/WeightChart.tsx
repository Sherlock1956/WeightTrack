import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { WeightRecord, TimeRange, ChartData } from '../types';
import { format } from 'date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface WeightChartProps {
  records: WeightRecord[];
  timeRange: TimeRange;
  onTimeRangeChange: (range: TimeRange) => void;
  smoothness: number;
  onSmoothnessChange: (smoothness: number) => void;
  userName: string;
}

const WeightChart: React.FC<WeightChartProps> = ({
  records,
  timeRange,
  onTimeRangeChange,
  smoothness,
  onSmoothnessChange,
  userName,
}) => {
  // 处理数据，应用平滑度
  const processData = (data: WeightRecord[]): ChartData => {
    if (data.length === 0) {
      return {
        labels: [],
        datasets: [{
          label: '体重 (kg)',
          data: [],
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0,
        }],
      };
    }

    // 按日期排序
    const sortedData = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    // 应用平滑度
    const smoothedData = sortedData.map((record, index) => {
      if (index === 0 || index === sortedData.length - 1) {
        return record.weight;
      }
      
      const prevWeight = sortedData[index - 1].weight;
      const currentWeight = record.weight;
      const nextWeight = sortedData[index + 1].weight;
      
      // 使用加权平均进行平滑
      const smoothedWeight = prevWeight * smoothness + currentWeight * (1 - 2 * smoothness) + nextWeight * smoothness;
      return smoothedWeight;
    });

    return {
      labels: sortedData.map(record => format(new Date(record.date), 'MM/dd')),
      datasets: [{
        label: '体重 (kg)',
        data: smoothedData,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.1,
        pointRadius: 4,
        pointHoverRadius: 6,
      }],
    };
  };

  const chartData = processData(records);

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: `${userName} 的体重变化趋势`,
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        title: {
          display: true,
          text: '体重 (kg)',
        },
      },
      x: {
        title: {
          display: true,
          text: '日期',
        },
      },
    },
  };

  const timeRangeOptions = [
    { value: 'week', label: '近一周' },
    { value: 'month', label: '近一个月' },
    { value: 'year', label: '近一年' },
    { value: 'all', label: '历史所有' },
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex flex-wrap items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800">体重趋势图</h2>
        
        <div className="flex items-center gap-4">
          {/* 时间范围选择 */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">时间范围:</label>
            <select
              value={timeRange}
              onChange={(e) => onTimeRangeChange(e.target.value as TimeRange)}
              className="px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500"
            >
              {timeRangeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          {/* 平滑度调节 */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">平滑度:</label>
            <input
              type="range"
              min="0"
              max="0.5"
              step="0.01"
              value={smoothness}
              onChange={(e) => onSmoothnessChange(parseFloat(e.target.value))}
              className="w-20"
            />
            <span className="text-sm text-gray-600 w-8">{Math.round(smoothness * 100)}%</span>
          </div>
        </div>
      </div>
      
      {records.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          暂无体重数据，请先添加一些记录
        </div>
      ) : (
        <div className="h-80">
          <Line data={chartData} options={options} />
        </div>
      )}
      
      {records.length > 0 && (
        <div className="mt-4 text-sm text-gray-600">
          共 {records.length} 条记录，时间范围: {timeRangeOptions.find(opt => opt.value === timeRange)?.label}
        </div>
      )}
    </div>
  );
};

export default WeightChart; 