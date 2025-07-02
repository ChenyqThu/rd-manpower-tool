# 人力排布工具服务器部署指南

## 🚀 部署概览

本指南提供了在腾讯云CentOS服务器上部署人力排布工具的完整方案，使用Docker容器化部署，通过Nginx反向代理集成到你现有的服务架构中。

## 📋 部署架构

```
外网访问 -> 主Nginx -> 反向代理 -> Docker容器(人力排布工具)
                    -> 其他Node.js博客服务
                    -> 其他Docker服务
```

## 🛠 部署方式选择

### 方案一：一键部署脚本（推荐）

这是最简单的部署方式，适合快速部署。

#### 步骤1: 准备服务器环境

```bash
# 1. 确保Docker已安装
sudo yum update -y
sudo yum install -y docker
sudo systemctl start docker
sudo systemctl enable docker

# 2. 安装Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 3. 将用户添加到docker组（避免每次sudo）
sudo usermod -aG docker $USER
# 注销重新登录生效
```

#### 步骤2: 上传项目文件

```bash
# 在你的服务器上创建项目目录
mkdir -p /home/www/rd-manpower-tool
cd /home/www/rd-manpower-tool

# 上传项目文件（使用scp、git clone等方式）
# 例如：
# scp -r ./rd-manpower-tool/* user@your-server:/home/www/rd-manpower-tool/
```

#### 步骤3: 执行一键部署

```bash
# 给部署脚本执行权限
chmod +x deploy.sh

# 执行部署（默认端口8080）
./deploy.sh

# 或者指定自定义端口
# 编辑deploy.sh中的HOST_PORT变量
```

### 方案二：Docker Compose部署

适合需要更多控制和配置的场景。

#### 步骤1: 配置docker-compose.yml

```bash
# 编辑docker-compose.yml，修改端口配置
version: '3.8'

services:
  rd-manpower-tool:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: rd-manpower-tool
    restart: unless-stopped
    ports:
      - "8080:80"  # 修改为你需要的端口
    environment:
      - NGINX_PORT=80
    volumes:
      - ./logs:/var/log/nginx
    networks:
      - app-network
```

#### 步骤2: 启动服务

```bash
# 构建并启动
docker-compose up -d

# 查看状态
docker-compose ps

# 查看日志
docker-compose logs -f
```

### 方案三：手动Docker部署

适合高级用户和自定义需求。

```bash
# 构建镜像
docker build -t rd-manpower-tool:latest .

# 启动容器
docker run -d \
  --name rd-manpower-tool \
  --restart unless-stopped \
  -p 8080:80 \
  -v $(pwd)/logs:/var/log/nginx \
  rd-manpower-tool:latest
```

## 🔧 Nginx反向代理配置

在你的主Nginx配置中添加以下配置，实现通过子路径访问：

### 配置方式1: 子路径访问（推荐）

编辑你的主Nginx配置文件（通常在 `/etc/nginx/nginx.conf` 或 `/etc/nginx/conf.d/default.conf`）：

```nginx
server {
    listen 80;
    server_name your-domain.com;  # 替换为你的域名

    # 现有的博客服务
    location / {
        proxy_pass http://localhost:3000;  # 你的Node.js博客端口
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 人力排布工具
    location /rd-tool/ {
        proxy_pass http://localhost:8080/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # 处理单页应用的路由
        proxy_set_header Accept-Encoding "";
        sub_filter '<base href="/">' '<base href="/rd-tool/">';
        sub_filter_once on;
    }

    # 其他服务...
}
```

### 配置方式2: 二级域名访问

```nginx
server {
    listen 80;
    server_name rd-tool.your-domain.com;  # 二级域名

    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 重新加载Nginx配置

```bash
# 测试配置
sudo nginx -t

# 重新加载
sudo nginx -s reload

# 或重启nginx
sudo systemctl restart nginx
```

## 🔐 HTTPS配置（推荐）

如果你使用SSL证书，添加HTTPS配置：

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    ssl_certificate /path/to/your/cert.pem;
    ssl_certificate_key /path/to/your/key.pem;
    
    # 人力排布工具
    location /rd-tool/ {
        proxy_pass http://localhost:8080/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # 处理单页应用的路由
        proxy_set_header Accept-Encoding "";
        sub_filter '<base href="/">' '<base href="/rd-tool/">';
        sub_filter_once on;
    }
}

# HTTP重定向到HTTPS
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}
```

## 📊 监控和维护

### 查看容器状态

```bash
# 查看运行中的容器
docker ps

# 查看容器日志
docker logs rd-manpower-tool

# 查看详细信息
docker inspect rd-manpower-tool
```

### 更新部署

```bash
# 方法1: 使用一键部署脚本
./deploy.sh

# 方法2: 手动更新
docker stop rd-manpower-tool
docker rm rd-manpower-tool
docker build -t rd-manpower-tool:latest .
docker run -d --name rd-manpower-tool --restart unless-stopped -p 8080:80 rd-manpower-tool:latest
```

### 备份和恢复

```bash
# 备份容器
docker commit rd-manpower-tool rd-manpower-tool:backup-$(date +%Y%m%d)

# 导出镜像
docker save rd-manpower-tool:latest > rd-manpower-tool-backup.tar

# 恢复镜像
docker load < rd-manpower-tool-backup.tar
```

## 🔍 故障排查

### 常见问题解决

1. **容器无法启动**
   ```bash
   # 查看详细错误
   docker logs rd-manpower-tool
   
   # 检查端口占用
   netstat -tlnp | grep 8080
   ```

2. **访问404错误**
   - 检查Nginx配置是否正确
   - 确认反向代理路径配置
   - 检查防火墙设置

3. **静态资源加载失败**
   - 检查nginx配置中的base href设置
   - 确认静态资源路径正确

### 性能优化

1. **启用Gzip压缩**（已在nginx.conf中配置）
2. **设置静态资源缓存**（已配置）
3. **调整worker进程数**

## 📝 部署清单

- [ ] 服务器环境准备（Docker、Docker Compose）
- [ ] 项目文件上传
- [ ] 执行部署脚本
- [ ] 配置Nginx反向代理
- [ ] 测试访问
- [ ] 配置HTTPS（可选）
- [ ] 设置监控和备份

## 🌐 访问地址

部署完成后，你可以通过以下地址访问：

- **子路径访问**: `http://your-domain.com/rd-tool/`
- **二级域名**: `http://rd-tool.your-domain.com/`
- **直接访问**: `http://your-server-ip:8080/`

## 💡 生产环境建议

1. **使用HTTPS**: 配置SSL证书保证安全
2. **设置防火墙**: 只开放必要的端口
3. **定期备份**: 设置自动备份策略
4. **监控日志**: 配置日志轮转和监控
5. **资源限制**: 为Docker容器设置资源限制

---

🎉 **部署完成后，你的人力排布工具就可以在生产环境中使用了！** 