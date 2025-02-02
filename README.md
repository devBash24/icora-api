# Icora API

A RESTful API service for managing and serving icon components.

## Features

- Icon retrieval by folder and name
- Folder-based icon collections
- List all available icons
- Automatic icon content formatting
- Rate limiting and compression
- CORS enabled

## Tech Stack

- Node.js
- TypeScript
- Express.js
- Supabase
- dotenv

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Supabase account and credentials

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
PORT=3000
NODE_ENV=development
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
```

## Installation

```bash
# Clone the repository
git clone [your-repo-url]

# Install dependencies
npm install

# Build the project
npm run build

# Start the server
npm start
```

## Development

```bash
# Run in development mode with hot-reload
npm run dev
```

## API Endpoints

### GET /
- Health check endpoint
- Returns: "Iconium API is running!"

### GET /api/icons
- Query Parameters:
  - library: string (required)
  - name: string (required)
- Returns: Single icon data
- Rate Limit: 100 requests per 15 minutes
- Cache Duration: 1 hour

### GET /api/icons/:library
- Path Parameters:
  - library: string
- Returns: All icons in the specified library
- Rate Limit: 100 requests per 15 minutes
- Cache Duration: 1 hour



## Error Handling

The API implements standard HTTP status codes:
- 200: Success
- 400: Bad Request
- 404: Not Found
- 500: Internal Server Error


## Rate Limiting

- General API endpoints: 100 requests per 15 minutes
- Bulk operations: 50 requests per hour

## Security Features

- Helmet security headers
- CORS protection
- Input validation and sanitization
- Rate limiting
- Error handling

## Performance Optimizations

- Response compression
- Cache-Control headers
- Database query optimization
- Input sanitization

## Error Handling

The API implements standard HTTP status codes:
- 200: Success
- 400: Bad Request
- 404: Not Found
- 429: Too Many Requests
- 500: Internal Server Error

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm start`: Start production server
- `npm run postinstall`: Automatic build after install

## License

ISC