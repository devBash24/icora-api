# Icora API

Icora API is a RESTful service designed to manage and serve icon components efficiently.  
It enables developers to retrieve only the icons they need, reducing dependency bloat and improving application performance.

---

## 🚀 Features

- Retrieve icons by library and name
- Folder-based icon organization
- Fetch entire icon collections
- Optimized icon content formatting
- Built-in rate limiting and caching
- Compression-enabled responses
- Secure API with CORS and HTTP headers

---

## 🧠 Architecture Overview

The API follows a modular REST architecture:

- **Controller Layer** – Handles request/response lifecycle
- **Service Layer** – Business logic for icon retrieval and formatting
- **Data Layer (NEON DB)** – Stores icon metadata and content
- **Middleware Layer** – Handles security, rate limiting, and validation

Client → Express API → Service Layer → NEON DB → Response

---

## 🛠 Tech Stack

- Node.js
- TypeScript
- Express.js
- NEON DB (PostgreSQL)
- dotenv

---

## 📦 Prerequisites

- Node.js (v14+)
- npm or yarn
- NEON DB project with credentials

---

## 🔐 Environment Variables

Create a `.env` file:

PORT=4000  
NODE_ENV=development  
DATABASE_URL

---

## ⚙️ Installation

```bash
# Clone repository
git clone [your-repo-url]

# Install dependencies
npm install

# Build project
npm run build

# Start server
npm start
```

---

## 💻 Development

```bash
npm run dev
```

---

## 📡 API Endpoints

### Health Check

GET /

Returns:
"Iconium API is running!"

---

### Get Single Icon

GET /api/icons?library={library}&name={name}

**Query Parameters:**

- library (string, required)
- name (string, required)

**Rate Limit:** 100 requests / 15 minutes  
**Cache Duration:** 1 hour

---

### Get Icons by Library

GET /api/icons/:library

**Path Parameters:**

- library (string)

**Rate Limit:** 100 requests / 15 minutes  
**Cache Duration:** 1 hour

---

## Error Handling

| Code | Description           |
| ---- | --------------------- |
| 200  | Success               |
| 400  | Bad Request           |
| 404  | Not Found             |
| 429  | Too Many Requests     |
| 500  | Internal Server Error |

---

## Security Features

- Helmet (secure HTTP headers)
- CORS configuration
- Input validation & sanitization
- Rate limiting

---

## Performance Optimizations

- Response compression (gzip)
- Cache-Control headers
- Optimized database queries
- Reduced payload size for icons

---

## Future Improvements & Architecture Roadmap

The current implementation is designed for simplicity and rapid iteration.  
Future improvements aim to evolve Icora into a scalable, production-grade system:

### 1. Service-Oriented Architecture

- Separate API, processing, and storage services
- Introduce microservices or modular monolith structure

### 2. CDN-Based Icon Delivery

- Serve icons via CDN for faster global access
- Reduce API load for static content

### 3. Caching Layer (Redis)

- Add Redis for frequently requested icons
- Improve rate limiting performance

### 4. Improve CLI Integration

Example:
icora add home user settings

### 5. Pagination & Query Optimization

- Add pagination support for large icon libraries:
  - `limit` and `offset` query parameters
  - Example:
    GET /api/icons/:library?limit=50&offset=0

- Improve performance when handling large datasets
- Reduce payload size for faster responses
- Enable frontend infinite scrolling or lazy loading

Future enhancements:

- Cursor-based pagination for better scalability
- Filtering and sorting (e.g., by popularity, category)

---

## 🤝 Contributing

1. Fork the repo
2. Create a branch (feature/your-feature)
3. Commit changes
4. Push and open PR

---

## 📜 Scripts

- npm run dev – Start development server
- npm run build – Build project
- npm start – Run production server
- npm run postinstall – Auto build

---

## 📄 License

ISC
