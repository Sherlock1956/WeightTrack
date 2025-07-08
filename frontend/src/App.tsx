import React from 'react';
import UserSelector from './components/UserSelector.tsx';
import WeightForm from './components/WeightForm.tsx';
import WeightChart from './components/WeightChart.tsx';
import WeightList from './components/WeightList.tsx';
import PhotoWall from './components/PhotoWall.tsx';
import { User, WeightRecord, TimeRange } from './types.ts';
import { userApi, weightApi } from './api.ts';

const App: React.FC = () => {
  const [users, setUsers] = React.useState<User[]>([]);
  const [selectedUser, setSelectedUser] = React.useState<User | null>(null);
  const [weightRecords, setWeightRecords] = React.useState<WeightRecord[]>([]);
  const [timeRange, setTimeRange] = React.useState<TimeRange>('all');
  const [smoothness, setSmoothness] = React.useState(0.1);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [activeTab, setActiveTab] = React.useState<'weight' | 'photo'>('weight');

  // 加载用户列表
  const loadUsers = async () => {
    try {
      const usersData = await userApi.getUsers();
      setUsers(usersData);
      if (usersData.length > 0 && !selectedUser) {
        setSelectedUser(usersData[0]);
      }
    } catch (err) {
      setError('加载用户列表失败');
      console.error(err);
    }
  };

  // 加载体重记录
  const loadWeightRecords = async () => {
    if (!selectedUser) return;
    
    try {
      setLoading(true);
      const records = await weightApi.getWeightRecords(selectedUser.id, timeRange);
      setWeightRecords(records);
    } catch (err) {
      setError('加载体重记录失败');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 创建用户
  const handleCreateUser = async (name: string) => {
    try {
      const newUser = await userApi.createUser(name);
      setUsers(prev => [...prev, newUser]);
      setSelectedUser(newUser);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || '创建用户失败');
    }
  };

  // 删除用户
  const handleDeleteUser = async (userId: number) => {
    try {
      await userApi.deleteUser(userId);
      setUsers(prev => prev.filter(user => user.id !== userId));
      if (selectedUser?.id === userId) {
        setSelectedUser(users.length > 1 ? users.find(u => u.id !== userId) || null : null);
      }
      setError(null);
    } catch (err) {
      setError('删除用户失败');
    }
  };

  // 添加体重记录
  const handleAddWeightRecord = async (weight: number, date: string) => {
    if (!selectedUser) return;
    
    try {
      const newRecord = await weightApi.addWeightRecord(selectedUser.id, weight, date);
      setWeightRecords(prev => [...prev, newRecord]);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || '添加体重记录失败');
    }
  };

  // 更新体重记录
  const handleUpdateWeightRecord = async (record: WeightRecord) => {
    if (!selectedUser) return;
    
    try {
      const updatedRecord = await weightApi.updateWeightRecord(
        selectedUser.id,
        record.id,
        record.weight,
        record.date
      );
      setWeightRecords(prev => 
        prev.map(r => r.id === record.id ? updatedRecord : r)
      );
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || '更新体重记录失败');
    }
  };

  // 删除体重记录
  const handleDeleteWeightRecord = async (recordId: number) => {
    if (!selectedUser) return;
    
    try {
      await weightApi.deleteWeightRecord(selectedUser.id, recordId);
      setWeightRecords(prev => prev.filter(r => r.id !== recordId));
      setError(null);
    } catch (err) {
      setError('删除体重记录失败');
    }
  };

  // 选择用户
  const handleUserSelect = (user: User) => {
    setSelectedUser(user);
  };

  // 时间范围变化
  const handleTimeRangeChange = (range: TimeRange) => {
    setTimeRange(range);
  };

  // 平滑度变化
  const handleSmoothnessChange = (newSmoothness: number) => {
    setSmoothness(newSmoothness);
  };

  // 初始化加载
  React.useEffect(() => {
    loadUsers();
  }, []);

  // 当选择用户或时间范围变化时重新加载数据
  React.useEffect(() => {
    if (selectedUser) {
      loadWeightRecords();
    }
  }, [selectedUser, timeRange]);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">体重追踪</h1>
          <p className="text-gray-600">记录和管理您的体重数据</p>
        </header>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
            <button
              onClick={() => setError(null)}
              className="float-right font-bold"
            >
              ×
            </button>
          </div>
        )}

        <UserSelector
          users={users}
          selectedUser={selectedUser}
          onUserSelect={handleUserSelect}
          onUserCreate={handleCreateUser}
          onUserDelete={handleDeleteUser}
        />

        {selectedUser && (
          <>
            {/* Tab 切换 */}
            <div className="flex gap-4 mb-6">
              <button
                className={`px-4 py-2 rounded-lg font-medium ${activeTab === 'weight' ? 'bg-primary-600 text-white' : 'bg-white text-gray-700 border border-gray-300'}`}
                onClick={() => setActiveTab('weight')}
              >体重管理</button>
              <button
                className={`px-4 py-2 rounded-lg font-medium ${activeTab === 'photo' ? 'bg-primary-600 text-white' : 'bg-white text-gray-700 border border-gray-300'}`}
                onClick={() => setActiveTab('photo')}
              >照片墙</button>
            </div>
            {activeTab === 'weight' && (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  <WeightForm
                    onSubmit={handleAddWeightRecord}
                    isLoading={loading}
                  />
                  <WeightChart
                    records={weightRecords}
                    timeRange={timeRange}
                    onTimeRangeChange={handleTimeRangeChange}
                    smoothness={smoothness}
                    onSmoothnessChange={handleSmoothnessChange}
                    userName={selectedUser.name}
                  />
                </div>
                <WeightList
                  records={weightRecords}
                  onDeleteRecord={handleDeleteWeightRecord}
                  onEditRecord={handleUpdateWeightRecord}
                />
              </>
            )}
            {activeTab === 'photo' && (
              <PhotoWall user={selectedUser} />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default App; 