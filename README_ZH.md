# RuoYi-AI 用户端

<div align="center">

<img src="https://github.com/ageerle/ruoyi-ai/raw/main/docs/image/logo.png" alt="RuoYi AI Logo" width="120" height="120">

### 企业级 AI 助手平台 - 用户前端

*RuoYi-AI 的用户前端，提供 AI 对话、智能体交互、知识库问答等功能*

**[English](README.md)** | **[在线体验](https://web.ruoyiai.chat)** | **[后端服务](https://github.com/ageerle/ruoyi-ai)** | **[管理后台](https://github.com/ageerle/ruoyi-admin)**

</div>

## 技术栈

- **框架**: Vue 3 + TypeScript
- **UI 组件**: Ant Design Vue
- **状态管理**: Pinia
- **构建工具**: Vite

## Docker 部署

本用户端支持两种 Docker 部署方式：

### 方式一：一键启动所有服务（推荐）

使用 `docker-compose-all.yaml` 可以一键启动所有服务（包括后端、管理端、用户端及依赖服务）：

```bash
# 克隆后端仓库
git clone https://github.com/ageerle/ruoyi-ai.git
cd ruoyi-ai

# 启动所有服务（从镜像仓库拉取预构建镜像）
docker-compose -f docker-compose-all.yaml up -d

# 访问用户端
# 地址: http://localhost:25137
# 账号: admin / admin123
```

### 方式二：分步部署（源码编译）

如果您需要从源码构建，请按照以下步骤操作：

#### 第一步：部署后端服务

```bash
# 进入后端项目目录
cd ruoyi-ai

# 启动后端服务（源码编译构建）
docker-compose up -d --build

# 等待后端服务启动完成
docker-compose logs -f backend
```

#### 第二步：部署用户端

```bash
# 进入用户端项目目录
cd ruoyi-web

# 构建并启动用户端
docker-compose up -d --build

# 访问用户端
# 地址: http://localhost:5137
```

#### 第三步：部署管理端（可选）

```bash
# 进入管理端项目目录
cd ruoyi-admin

# 构建并启动管理端
docker-compose up -d --build

# 访问管理端
# 地址: http://localhost:5666
```

### 服务端口说明

| 服务 | 端口 | 说明 |
|------|------|------|
| 用户端 | 5137 | 用户前端访问地址 |
| 管理端 | 5666 | 管理后台访问地址 |
| 后端服务 | 6039 | 后端 API 服务 |
| MySQL | 23306 | 数据库服务 |
| Redis | 6379 | 缓存服务 |
| Weaviate | 28080 | 向量数据库 |
| MinIO | 9000/9090 | 对象存储 |

## 本地开发

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 构建生产版本
pnpm build
```

## 常见问题

**Q: 用户端无法连接后端服务？**

A: 请确保后端服务已启动，并检查环境变量 `UPSTREAM_URL` 配置是否正确。

**Q: 一键启动和分步部署有什么区别？**

A: 一键启动使用预构建的镜像，部署速度快；分步部署从源码编译，适合需要自定义修改的场景。

## 开源协议

本项目采用 **MIT 开源协议**，详情请查看 [license](license) 文件。

---

<div align="center">

**[⭐ 点个 Star 支持一下](https://github.com/ageerle/ruoyi-web)** • **[Fork 开始贡献](https://github.com/ageerle/ruoyi-web/fork)**

*用 ❤️ 打造，由 RuoYi AI 开源社区维护*

</div>
