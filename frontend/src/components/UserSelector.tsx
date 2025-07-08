import React from 'react';
import { User } from '../types';

interface UserSelectorProps {
  users: User[];
  selectedUser: User | null;
  onUserSelect: (user: User) => void;
  onUserCreate: (name: string) => void;
  onUserDelete: (userId: number) => void;
}

const UserSelector: React.FC<UserSelectorProps> = ({
  users,
  selectedUser,
  onUserSelect,
  onUserCreate,
  onUserDelete,
}) => {
  const [newUserName, setNewUserName] = React.useState('');
  const [showCreateForm, setShowCreateForm] = React.useState(false);

  const handleCreateUser = () => {
    if (newUserName.trim()) {
      onUserCreate(newUserName.trim());
      setNewUserName('');
      setShowCreateForm(false);
    }
  };

  const handleDeleteUser = (userId: number) => {
    if (window.confirm('确定要删除这个用户吗？这将删除所有相关的体重记录。')) {
      onUserDelete(userId);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">用户管理</h2>
      
      {users.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-500 mb-4">还没有创建任何用户</div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            创建第一个用户
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {users.map((user) => (
              <button
                key={user.id}
                onClick={() => onUserSelect(user)}
                className={`px-4 py-2 rounded-lg border transition-colors ${
                  selectedUser?.id === user.id
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-primary-500'
                }`}
              >
                {user.name}
              </button>
            ))}
            <button
              onClick={() => setShowCreateForm(true)}
              className="px-4 py-2 rounded-lg border border-dashed border-gray-300 text-gray-500 hover:border-primary-500 hover:text-primary-600 transition-colors"
            >
              + 新建用户
            </button>
          </div>
          
          {selectedUser && (
            <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
              <span className="text-sm text-gray-600">
                当前选择: <span className="font-medium">{selectedUser.name}</span>
              </span>
              <button
                onClick={() => handleDeleteUser(selectedUser.id)}
                className="text-red-600 hover:text-red-800 text-sm"
              >
                删除用户
              </button>
            </div>
          )}
        </div>
      )}

      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">创建新用户</h3>
            <input
              type="text"
              value={newUserName}
              onChange={(e) => setNewUserName(e.target.value)}
              placeholder="请输入用户名"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500 mb-4"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={handleCreateUser}
                className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
              >
                创建
              </button>
              <button
                onClick={() => {
                  setShowCreateForm(false);
                  setNewUserName('');
                }}
                className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserSelector; 