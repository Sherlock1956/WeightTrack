import React, { useEffect, useState, useRef } from 'react';
import { Photo, User } from '../types.ts';
import { photoApi } from '../api.ts';

interface PhotoWallProps {
  user: User;
}

const PhotoWall: React.FC<PhotoWallProps> = ({ user }) => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [date, setDate] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<Photo | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadPhotos = async () => {
    try {
      const data = await photoApi.getPhotos(user.id);
      setPhotos(data);
    } catch (e) {
      setError('加载照片失败');
    }
  };

  useEffect(() => {
    if (user) loadPhotos();
    // eslint-disable-next-line
  }, [user]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !date) {
      setError('请选择照片和日期');
      return;
    }
    setUploading(true);
    setError(null);
    try {
      await photoApi.uploadPhoto(user.id, file, date);
      setFile(null);
      setDate('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      await loadPhotos();
    } catch (e) {
      setError('上传失败');
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (photo: Photo) => {
    try {
      const blob = await photoApi.downloadPhoto(photo.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `photo_${photo.id}.jpg`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      setError('下载失败');
    }
  };

  const handleDelete = async (photo: Photo) => {
    if (!window.confirm('确定要删除这张照片吗？')) return;
    try {
      await photoApi.deletePhoto(photo.id);
      await loadPhotos();
    } catch (e) {
      setError('删除失败');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">照片墙</h2>
      <form onSubmit={handleUpload} className="flex flex-wrap gap-4 items-end mb-6">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          ref={fileInputRef}
          className="block border border-gray-300 rounded-lg px-3 py-2"
        />
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          className="block border border-gray-300 rounded-lg px-3 py-2"
        />
        <button
          type="submit"
          disabled={uploading}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
        >
          {uploading ? '上传中...' : '上传'}
        </button>
      </form>
      {error && <div className="text-red-600 mb-4">{error}</div>}
      {photos.length === 0 ? (
        <div className="text-center py-8 text-gray-500">暂无照片</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {photos.map(photo => (
            <div key={photo.id} className="relative group cursor-pointer">
              <img
                src={photo.image_url}
                alt="身材照片"
                className="w-full h-40 object-cover rounded-lg shadow"
                onClick={() => setPreview(photo)}
              />
              <div className="absolute bottom-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={e => { e.stopPropagation(); handleDownload(photo); }}
                  className="bg-white bg-opacity-80 rounded px-2 py-1 text-sm text-blue-600 hover:bg-opacity-100 shadow"
                >下载</button>
                <button
                  onClick={e => { e.stopPropagation(); handleDelete(photo); }}
                  className="bg-white bg-opacity-80 rounded px-2 py-1 text-sm text-red-600 hover:bg-opacity-100 shadow"
                >删除</button>
              </div>
              <div className="absolute top-2 left-2 bg-white bg-opacity-80 rounded px-2 py-1 text-xs text-gray-700">
                {photo.date.slice(0, 10)}
              </div>
            </div>
          ))}
        </div>
      )}
      {/* 预览弹窗 */}
      {preview && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50" onClick={() => setPreview(null)}>
          <div className="bg-white rounded-lg p-4 max-w-2xl w-full relative" onClick={e => e.stopPropagation()}>
            <img src={preview.image_url} alt="预览" className="max-h-[70vh] w-auto mx-auto rounded" />
            <div className="flex justify-between items-center mt-2">
              <span className="text-gray-700 text-sm">{preview.date.slice(0, 10)}</span>
              <button onClick={() => setPreview(null)} className="text-gray-500 hover:text-gray-800">关闭</button>
              <button onClick={() => handleDownload(preview)} className="text-blue-600 hover:underline ml-2">下载</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotoWall; 