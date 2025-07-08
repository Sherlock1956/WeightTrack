from flask import Flask
from flask_cors import CORS
from models import db
from routes import api
import os

def create_app():
    app = Flask(__name__)
    
    # 配置数据库
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///weight_tracker.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    # 初始化扩展
    db.init_app(app)
    CORS(app)  # 允许跨域请求
    
    # 注册蓝图
    app.register_blueprint(api, url_prefix='/api')
    
    # 创建数据库表
    with app.app_context():
        db.create_all()
    
    return app

if __name__ == '__main__':
    app = create_app()
    print("体重追踪API服务器启动在 http://localhost:5000")
    print("API文档:")
    print("GET  /api/users - 获取所有用户")
    print("POST /api/users - 创建新用户")
    print("DELETE /api/users/<id> - 删除用户")
    print("GET  /api/users/<id>/weight - 获取用户体重记录")
    print("POST /api/users/<id>/weight - 添加体重记录")
    print("PUT  /api/users/<id>/weight/<record_id> - 更新体重记录")
    print("DELETE /api/users/<id>/weight/<record_id> - 删除体重记录")
    app.run(debug=True, host='0.0.0.0', port=5000) 