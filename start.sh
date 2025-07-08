#!/bin/bash

echo "启动体重追踪应用..."

# 检查Python是否安装
if ! command -v python3 &> /dev/null; then
    echo "错误: 未找到Python3，请先安装Python"
    exit 1
fi

# 检查Node.js是否安装
if ! command -v node &> /dev/null; then
    echo "错误: 未找到Node.js，请先安装Node.js"
    exit 1
fi

# 启动后端
echo "启动后端服务器..."
cd backend
if [ ! -d "venv" ]; then
    echo "创建虚拟环境..."
    python3 -m venv venv
fi

source venv/bin/activate
pip install -r requirements.txt

echo "后端服务器启动在 http://localhost:5000"
python app.py &
BACKEND_PID=$!

# 等待后端启动
sleep 3

# 启动前端
echo "启动前端服务器..."
cd ../frontend
npm install
echo "前端服务器启动在 http://localhost:3000"
npm start &
FRONTEND_PID=$!

echo "应用已启动!"
echo "前端: http://localhost:3000"
echo "后端API: http://localhost:5000"
echo ""
echo "按 Ctrl+C 停止所有服务"

# 等待用户中断
trap "echo '正在停止服务...'; kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait 