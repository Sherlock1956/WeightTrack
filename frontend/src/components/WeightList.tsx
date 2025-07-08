import React from 'react';
import { WeightRecord } from '../types';
import { format } from 'date-fns';

interface WeightListProps {
  records: WeightRecord[];
  onDeleteRecord: (recordId: number) => void;
  onEditRecord: (record: WeightRecord) => void;
}

const WeightList: React.FC<WeightListProps> = ({
  records,
  onDeleteRecord,
  onEditRecord,
}) => {
  const [editingRecord, setEditingRecord] = React.useState<WeightRecord | null>(null);
  const [editWeight, setEditWeight] = React.useState('');
  const [editDate, setEditDate] = React.useState('');

  const handleEdit = (record: WeightRecord) => {
    setEditingRecord(record);
    setEditWeight(record.weight.toString());
    setEditDate(record.date);
  };

  const handleSaveEdit = () => {
    if (editingRecord && editWeight && editDate) {
      const weight = parseFloat(editWeight);
      if (weight > 0) {
        onEditRecord({
          ...editingRecord,
          weight,
          date: editDate,
        });
        setEditingRecord(null);
        setEditWeight('');
        setEditDate('');
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingRecord(null);
    setEditWeight('');
    setEditDate('');
  };

  const sortedRecords = [...records].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">体重记录</h2>
      
      {records.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          暂无体重记录
        </div>
      ) : (
        <div className="space-y-2">
          {sortedRecords.map((record) => (
            <div
              key={record.id}
              className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              {editingRecord?.id === record.id ? (
                // 编辑模式
                <div className="flex items-center gap-2 flex-1">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={editWeight}
                    onChange={(e) => setEditWeight(e.target.value)}
                    className="w-20 px-2 py-1 border border-gray-300 rounded"
                  />
                  <span className="text-gray-500">kg</span>
                  <input
                    type="datetime-local"
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    className="px-2 py-1 border border-gray-300 rounded"
                  />
                  <button
                    onClick={handleSaveEdit}
                    className="text-green-600 hover:text-green-800 text-sm"
                  >
                    保存
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="text-gray-600 hover:text-gray-800 text-sm"
                  >
                    取消
                  </button>
                </div>
              ) : (
                // 显示模式
                <>
                  <div className="flex items-center gap-4">
                    <span className="font-medium text-lg">{record.weight} kg</span>
                    <span className="text-gray-500">{format(new Date(record.date), 'yyyy年MM月dd日')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(record)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      编辑
                    </button>
                    <button
                      onClick={() => onDeleteRecord(record.id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      删除
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WeightList; 