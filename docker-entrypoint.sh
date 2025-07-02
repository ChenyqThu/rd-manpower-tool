#!/bin/sh

# 设置默认值
export NGINX_PORT=${NGINX_PORT:-80}

# 替换nginx配置中的端口
sed -i "s/listen       80;/listen       ${NGINX_PORT};/g" /etc/nginx/nginx.conf
sed -i "s/listen  \[::\]:80;/listen  [::]:${NGINX_PORT};/g" /etc/nginx/nginx.conf

# 启动nginx
exec "$@" 