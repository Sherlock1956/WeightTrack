import React from 'react';
import { format } from 'date-fns';

interface WeightFormProps {
  onSubmit: (weight: number, date: string) => void;
  isLoading?: boolean;
}

const WeightForm: React.FC<WeightFormProps> = ({ onSubmit, isLoading = false }) => {
  const [weight, setWeight] = React.useState('');
  const [date, setDate] = React.useState(format(new Date(), 'yyyy-MM-dd\'T\'HH:mm'));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const weightValue = parseFloat(weight);
    if (weightValue > 0) {
      onSubmit(weightValue, date);
      setWeight('');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">添加体重记录</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-2">
            体重 (kg)
          </label>
          <input
            id="weight"
            type="number"
            step="0.1"
            min="0"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="请输入体重"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500"
            required
          />
        </div>
        
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
            日期
          </label>
          <input
            id="date"
            type="datetime-local"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500"
            required
          />
        </div>
        
        <button
          type="submit"
          disabled={isLoading || !weight}
          className="w-full bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? '添加中...' : '添加记录'}
        </button>
      </form>
    </div>
  );
};

export default WeightForm; 