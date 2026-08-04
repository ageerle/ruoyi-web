# RuoYi-AI User Frontend

<div align="center">

<img src="https://github.com/ageerle/ruoyi-ai/raw/main/docs/image/logo.png" alt="RuoYi AI Logo" width="120" height="120">

### Enterprise-Grade AI Assistant Platform - User Frontend

*The RuoYi-AI user frontend for AI conversations, agent interactions, and knowledge-base Q&A.*

**[中文](README_ZH.md)** | **[Live Demo](https://web.ruoyiai.chat)** | **[Backend Service](https://github.com/ageerle/ruoyi-ai)** | **[Admin Panel](https://github.com/ageerle/ruoyi-admin)**

</div>

## Tech Stack

- **Framework**: Vue 3 + TypeScript
- **UI Components**: Ant Design Vue
- **State Management**: Pinia
- **Build Tool**: Vite

## Docker Deployment

This user frontend supports two Docker deployment methods:

### Method 1: Start All Services with One Command (Recommended)

Use `docker-compose-all.yaml` to start all services at once, including the backend, admin panel, user frontend, and dependencies:

```bash
# Clone the backend repository
git clone https://github.com/ageerle/ruoyi-ai.git
cd ruoyi-ai

# Start all services using pre-built images
docker-compose -f docker-compose-all.yaml up -d

# Open the user frontend
# URL: http://localhost:25137
# Account: admin / admin123
```

### Method 2: Deploy Services Separately (Build from Source)

If you need to build from source, follow these steps:

#### Step 1: Deploy the Backend Service

```bash
# Enter the backend project directory
cd ruoyi-ai

# Start the backend service and build from source
docker-compose up -d --build

# Wait for the backend service to start
docker-compose logs -f backend
```

#### Step 2: Deploy the User Frontend

```bash
# Enter the user frontend project directory
cd ruoyi-web

# Build and start the user frontend
docker-compose up -d --build

# Open the user frontend
# URL: http://localhost:5137
```

#### Step 3: Deploy the Admin Panel (Optional)

```bash
# Enter the admin project directory
cd ruoyi-admin

# Build and start the admin panel
docker-compose up -d --build

# Open the admin panel
# URL: http://localhost:5666
```

### Service Ports

| Service | Port | Description |
|------|------|------|
| User frontend | 5137 | User frontend URL |
| Admin panel | 5666 | Admin panel URL |
| Backend service | 6039 | Backend API service |
| MySQL | 23306 | Database service |
| Redis | 6379 | Cache service |
| Weaviate | 28080 | Vector database |
| MinIO | 9000/9090 | Object storage |

## Local Development

```bash
# Install dependencies
pnpm install

# Start the development server
pnpm dev

# Build the production version
pnpm build
```

## FAQ

**Q: The user frontend cannot connect to the backend service.**

A: Make sure the backend service is running and verify that the `UPSTREAM_URL` environment variable is configured correctly.

**Q: What is the difference between one-command startup and separate deployment?**

A: One-command startup uses pre-built images for faster deployment. Separate deployment builds from source and is suitable when custom changes are required.

## License

This project is licensed under the **MIT License**. See the [license](license) file for details.

---

<div align="center">

**[⭐ Star this project](https://github.com/ageerle/ruoyi-web)** • **[Fork and contribute](https://github.com/ageerle/ruoyi-web/fork)**

*Made with ❤️ and maintained by the RuoYi AI open-source community*

</div>
