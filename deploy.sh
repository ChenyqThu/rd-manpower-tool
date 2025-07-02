#!/bin/bash

# 人力排布工具一键部署脚本
# 适用于腾讯云CentOS服务器

set -e

# 配置变量
APP_NAME="rd-manpower-tool"
IMAGE_NAME="rd-manpower-tool:latest"
CONTAINER_NAME="rd-manpower-tool"
HOST_PORT="8080"  # 修改为你想要的端口
NGINX_CONFIG_BACKUP="/etc/nginx/conf.d/rd-manpower-tool.conf.backup"

echo "🚀 开始部署 $APP_NAME..."

# 检查Docker是否安装
if ! command -v docker &> /dev/null; then
    echo "❌ Docker 未安装，请先安装Docker"
    exit 1
fi

# 检查Docker Compose是否安装
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose 未安装，请先安装Docker Compose"
    exit 1
fi

# 停止并删除旧容器
echo "🛑 停止旧容器..."
docker stop $CONTAINER_NAME 2>/dev/null || true
docker rm $CONTAINER_NAME 2>/dev/null || true

# 删除旧镜像
echo "🗑️  删除旧镜像..."
docker rmi $IMAGE_NAME 2>/dev/null || true

# 构建新镜像
echo "🔨 构建Docker镜像..."
docker build -t $IMAGE_NAME .

# 启动容器
echo "🚀 启动新容器..."
docker run -d \
  --name $CONTAINER_NAME \
  --restart unless-stopped \
  -p $HOST_PORT:80 \
  -v $(pwd)/logs:/var/log/nginx \
  $IMAGE_NAME

# 等待容器启动
echo "⏳ 等待容器启动..."
sleep 5

# 检查容器状态
if docker ps | grep $CONTAINER_NAME > /dev/null; then
    echo "✅ 容器启动成功!"
    echo "📝 服务信息:"
    echo "   - 容器名称: $CONTAINER_NAME"
    echo "   - 访问端口: $HOST_PORT"
    echo "   - 本地访问: http://localhost:$HOST_PORT"
    echo "   - 服务器访问: http://你的服务器IP:$HOST_PORT"
    echo ""
    echo "🔧 Nginx反向代理配置示例:"
    echo "   请将以下配置添加到你的主Nginx配置中:"
    echo ""
    echo "   location /rd-manpower-tool/ {"
    echo "       proxy_pass http://localhost:$HOST_PORT/;"
    echo "       proxy_set_header Host \$host;"
    echo "       proxy_set_header X-Real-IP \$remote_addr;"
    echo "       proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;"
    echo "       proxy_set_header X-Forwarded-Proto \$scheme;"
    echo "   }"
    echo ""
    echo "   然后重新加载Nginx: sudo nginx -s reload"
else
    echo "❌ 容器启动失败，请检查日志:"
    docker logs $CONTAINER_NAME
    exit 1
fi

echo "🎉 部署完成!" 