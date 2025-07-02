# 🚀 快速部署指南

## 30秒部署到腾讯云CentOS服务器

### 前提条件
- ✅ 腾讯云CentOS服务器
- ✅ 已安装Docker和Docker Compose
- ✅ 已配置Nginx（用于反向代理）

### 📦 一键部署命令

```bash
# 1. 上传项目到服务器
scp -r ./rd-manpower-tool user@your-server:/home/www/

# 2. 连接到服务器
ssh user@your-server

# 3. 进入项目目录
cd /home/www/rd-manpower-tool

# 4. 一键部署
chmod +x deploy.sh && ./deploy.sh
```

### 🔧 配置Nginx反向代理

在你的主Nginx配置文件中添加：

```nginx
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
```

重新加载Nginx：
```bash
sudo nginx -t && sudo nginx -s reload
```

### 🌐 访问应用

部署完成后访问：`http://your-domain.com/rd-tool/`

---

🎉 **就这么简单！你的人力排布工具已经部署成功！**

### 📋 故障排查

如果遇到问题，运行：
```bash
# 查看容器状态
docker ps

# 查看日志
docker logs rd-manpower-tool

# 重新部署
./deploy.sh
```

详细部署文档请查看：[DEPLOYMENT.md](./DEPLOYMENT.md) 