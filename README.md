# 体重追踪网站

一个前后端分离的体重追踪应用，支持多用户数据管理和图表展示。

## 功能特性

- 多用户支持：可以创建多个用户并管理各自的体重数据
- 体重数据录入：支持指定日期的体重数据添加
- 图表展示：支持不同时间范围的数据展示（近一周、近一个月、近一年、历史所有）
- 平滑度调节：类似TensorBoard的平滑度滑块功能
- 响应式设计：适配不同设备

## 技术栈

### 后端
- Python Flask
- SQLite 数据库
- SQLAlchemy ORM

### 前端
- React 18
- TypeScript
- Chart.js
- Tailwind CSS

## 项目结构

```
WeightTrack/
├── backend/          # Flask后端
│   ├── app.py       # 主应用文件
│   ├── models.py    # 数据模型
│   ├── routes.py    # API路由
│   └── requirements.txt
├── frontend/        # React前端
│   ├── src/
│   ├── public/
│   └── package.json
└── README.md
```

## 快速开始

### 后端启动
```bash
cd backend
pip install -r requirements.txt
python app.py
```

### 前端启动
```bash
cd frontend
npm install
npm start
```

访问 http://localhost:3000 查看应用 