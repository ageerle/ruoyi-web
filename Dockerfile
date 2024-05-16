# 使用alpine版本的nginx作为基础镜像
FROM nginx:alpine

# 将dist文件中的内容复制到nginx的html目录下的web目录中
COPY dist/ /usr/share/nginx/html/web/

# 用本地的nginx.conf配置来替换nginx镜像里的默认配置
COPY nginx.conf /etc/nginx/nginx.conf

# 暴露8081端口
EXPOSE 8081
