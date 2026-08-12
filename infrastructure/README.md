# LifeKit — Infrastructure & Reverse Proxy Setup

This directory contains configuration files and deployment scripts used to orchestrate LifeKit's containers, reverse proxies, and server routing.

---

## 📂 Directory Structure

```
infrastructure/
├── docker/           # Production Dockerfiles and build scripts (placeholder)
├── nginx/            # NGINX reverse proxy configuration
│   └── default.conf  # NGINX port routing configurations
└── README.md         # This file
```

---

## 🛰 NGINX Reverse Proxy (`infrastructure/nginx/default.conf`)

In production or staging, **NGINX** acts as the primary reverse proxy gateway. It listens on port `80` (HTTP) and maps incoming routes to their corresponding services running on the host or inside docker:

| Request Route | Target Service | Address / Port | Purpose |
| :--- | :--- | :--- | :--- |
| `/` | **Frontend (Next.js)** | `host.docker.internal:3000` | Serves client pages and assets |
| `/api` | **Backend Core (NestJS)** | `host.docker.internal:4000` | Processes REST API queries |
| `/ws` | **WebSockets (Socket.io)** | `host.docker.internal:4000` | Establishes persistent real-time connections |
| `/ai` | **FastAPI AI Service** | `host.docker.internal:8000` | Processes AI planner/agent calls |

---

## 🛡 Why We Use a Reverse Proxy

1. **Unified Host Port**: Clients can make all request queries to a single port (`80` or `443` with SSL), simplifying DNS and network setups.
2. **CORS Resolution**: By routing both frontend requests and backend requests through the same domain and port, we eliminate browser Cross-Origin Resource Sharing (CORS) issues.
3. **Load Balancing & SSL Termination**: NGINX can be easily updated to handle HTTPS SSL certificate verification (e.g. Certbot/Let's Encrypt) and load balance requests across replica server containers.
