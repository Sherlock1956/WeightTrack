from flask import Blueprint, request, jsonify, send_from_directory, current_app
from models import db, User, WeightRecord, Photo
from datetime import datetime, timedelta
from dateutil import parser
import json
import os

api = Blueprint('api', __name__)

# 用户相关API
@api.route('/users', methods=['GET'])
def get_users():
    """获取所有用户"""
    users = User.query.all()
    return jsonify([user.to_dict() for user in users])

@api.route('/users', methods=['POST'])
def create_user():
    """创建新用户"""
    data = request.get_json()
    name = data.get('name')
    
    if not name:
        return jsonify({'error': '用户名不能为空'}), 400
    
    # 检查用户名是否已存在
    existing_user = User.query.filter_by(name=name).first()
    if existing_user:
        return jsonify({'error': '用户名已存在'}), 400
    
    user = User(name=name)
    db.session.add(user)
    db.session.commit()
    
    return jsonify(user.to_dict()), 201

@api.route('/users/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    """删除用户"""
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': '用户不存在'}), 404
    
    db.session.delete(user)
    db.session.commit()
    
    return jsonify({'message': '用户删除成功'})

# 体重记录相关API
@api.route('/users/<int:user_id>/weight', methods=['GET'])
def get_weight_records(user_id):
    """获取用户的体重记录"""
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': '用户不存在'}), 404
    
    # 获取查询参数
    time_range = request.args.get('time_range', 'all')  # all, week, month, year
    
    # 根据时间范围过滤数据
    today = datetime.now().date()
    if time_range == 'week':
        start_date = today - timedelta(days=7)
        records = WeightRecord.query.filter(
            WeightRecord.user_id == user_id,
            WeightRecord.date >= start_date
        ).order_by(WeightRecord.date).all()
    elif time_range == 'month':
        start_date = today - timedelta(days=30)
        records = WeightRecord.query.filter(
            WeightRecord.user_id == user_id,
            WeightRecord.date >= start_date
        ).order_by(WeightRecord.date).all()
    elif time_range == 'year':
        start_date = today - timedelta(days=365)
        records = WeightRecord.query.filter(
            WeightRecord.user_id == user_id,
            WeightRecord.date >= start_date
        ).order_by(WeightRecord.date).all()
    else:  # all
        records = WeightRecord.query.filter_by(user_id=user_id).order_by(WeightRecord.date).all()
    
    return jsonify([record.to_dict() for record in records])

@api.route('/users/<int:user_id>/weight', methods=['POST'])
def add_weight_record(user_id):
    """添加体重记录"""
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': '用户不存在'}), 404
    
    data = request.get_json()
    weight = data.get('weight')
    date_str = data.get('date')
    
    if not weight or weight <= 0:
        return jsonify({'error': '体重数据无效'}), 400
    
    if not date_str:
        return jsonify({'error': '日期不能为空'}), 400
    
    try:
        date = parser.parse(date_str)
    except:
        return jsonify({'error': '日期格式无效'}), 400
    
    # 检查同一时刻是否已有记录
    existing_record = WeightRecord.query.filter_by(
        user_id=user_id, 
        date=date
    ).first()
    
    if existing_record:
        return jsonify({'error': '该日期已有体重记录'}), 400
    
    record = WeightRecord(
        user_id=user_id,
        weight=weight,
        date=date
    )
    
    db.session.add(record)
    db.session.commit()
    
    return jsonify(record.to_dict()), 201

@api.route('/users/<int:user_id>/weight/<int:record_id>', methods=['PUT'])
def update_weight_record(user_id, record_id):
    """更新体重记录"""
    record = WeightRecord.query.filter_by(id=record_id, user_id=user_id).first()
    if not record:
        return jsonify({'error': '记录不存在'}), 404
    
    data = request.get_json()
    weight = data.get('weight')
    date_str = data.get('date')
    
    if weight is not None:
        if weight <= 0:
            return jsonify({'error': '体重数据无效'}), 400
        record.weight = weight
    
    if date_str:
        try:
            date = parser.parse(date_str)
            record.date = date
        except:
            return jsonify({'error': '日期格式无效'}), 400
    
    db.session.commit()
    
    return jsonify(record.to_dict())

@api.route('/users/<int:user_id>/weight/<int:record_id>', methods=['DELETE'])
def delete_weight_record(user_id, record_id):
    """删除体重记录"""
    record = WeightRecord.query.filter_by(id=record_id, user_id=user_id).first()
    if not record:
        return jsonify({'error': '记录不存在'}), 404
    
    db.session.delete(record)
    db.session.commit()
    
    return jsonify({'message': '记录删除成功'})

# 照片相关API
@api.route('/users/<int:user_id>/photos', methods=['POST'])
def upload_photo(user_id):
    """上传用户照片"""
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': '用户不存在'}), 404
    if 'file' not in request.files:
        return jsonify({'error': '未选择文件'}), 400
    file = request.files['file']
    date_str = request.form.get('date')
    if not date_str:
        return jsonify({'error': '日期不能为空'}), 400
    try:
        date = parser.parse(date_str)
    except:
        return jsonify({'error': '日期格式无效'}), 400
    if file.filename == '':
        return jsonify({'error': '未选择文件'}), 400
    # 确保保存目录存在
    upload_dir = os.path.join(current_app.instance_path, 'photos')
    os.makedirs(upload_dir, exist_ok=True)
    # 生成唯一文件名
    ext = os.path.splitext(file.filename)[1]
    filename = f"user{user_id}_{int(datetime.now().timestamp())}{ext}"
    file_path = os.path.join(upload_dir, filename)
    file.save(file_path)
    # 数据库记录
    photo = Photo(user_id=user_id, image_path=filename, date=date)
    db.session.add(photo)
    db.session.commit()
    return jsonify(photo.to_dict()), 201

@api.route('/users/<int:user_id>/photos', methods=['GET'])
def get_photos(user_id):
    """获取用户所有照片信息，按上传时间倒序"""
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': '用户不存在'}), 404
    photos = Photo.query.filter_by(user_id=user_id).order_by(Photo.created_at.desc()).all()
    # 构造图片URL
    def photo_to_dict(photo):
        d = photo.to_dict()
        d['image_url'] = f"/api/photos/{photo.id}"
        return d
    return jsonify([photo_to_dict(p) for p in photos])

@api.route('/photos/<int:photo_id>', methods=['GET'])
def serve_photo(photo_id):
    """预览/原图访问"""
    photo = Photo.query.get(photo_id)
    if not photo:
        return jsonify({'error': '照片不存在'}), 404
    upload_dir = os.path.join(current_app.instance_path, 'photos')
    return send_from_directory(upload_dir, photo.image_path)

@api.route('/photos/<int:photo_id>/download', methods=['GET'])
def download_photo(photo_id):
    """下载照片"""
    photo = Photo.query.get(photo_id)
    if not photo:
        return jsonify({'error': '照片不存在'}), 404
    upload_dir = os.path.join(current_app.instance_path, 'photos')
    return send_from_directory(upload_dir, photo.image_path, as_attachment=True)

@api.route('/photos/<int:photo_id>', methods=['DELETE'])
def delete_photo(photo_id):
    """删除照片（数据库和文件）"""
    photo = Photo.query.get(photo_id)
    if not photo:
        return jsonify({'error': '照片不存在'}), 404
    upload_dir = os.path.join(current_app.instance_path, 'photos')
    file_path = os.path.join(upload_dir, photo.image_path)
    # 删除数据库记录
    db.session.delete(photo)
    db.session.commit()
    # 删除文件
    if os.path.exists(file_path):
        os.remove(file_path)
    return jsonify({'message': '照片已删除'}) 