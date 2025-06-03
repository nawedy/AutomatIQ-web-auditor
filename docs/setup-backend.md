# Backend Setup Guide - AutomatIQ AI Website Auditor

## Overview
This guide covers the complete setup of the backend audit system with real website crawling, performance testing, accessibility scanning, and database integration.

## Prerequisites

### System Requirements
- Node.js 18+ 
- MongoDB 6.0+ (local or cloud instance)
- Chrome/Chromium (for Puppeteer)
- Minimum 4GB RAM (8GB+ recommended for performance audits)
- 2GB+ free disk space for screenshots and data

### Required Dependencies
The following packages have been installed for the backend system:

```bash
# Core audit dependencies
npm install puppeteer lighthouse @axe-core/puppeteer

# Database and utilities  
npm install mongoose uuid cheerio node-html-parser

# TypeScript types
npm install --save-dev @types/uuid @types/cheerio
```

## Environment Configuration

Create a `.env.local` file in the project root with the following configuration:

```bash
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/automatiq-auditor

# Application Configuration
NODE_ENV=development
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# Audit Configuration
MAX_CONCURRENT_AUDITS=3
AUDIT_TIMEOUT_MS=300000
BROWSER_POOL_SIZE=2

# Screenshot Storage
SCREENSHOT_DIR=./public/screenshots
MAX_SCREENSHOT_SIZE_MB=10

# Rate Limiting
RATE_LIMIT_REQUESTS_PER_MINUTE=10
RATE_LIMIT_REQUESTS_PER_HOUR=100

# Optional: For production MongoDB Atlas
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/automatiq-auditor?retryWrites=true&w=majority

# Optional: External Services
# OPENAI_API_KEY=your-openai-key-for-enhanced-content-analysis
# GOOGLE_PAGESPEED_API_KEY=your-google-pagespeed-api-key
```

## MongoDB Setup

### Option 1: Local MongoDB

1. **Install MongoDB**:
   ```bash
   # macOS
   brew install mongodb/brew/mongodb-community
   brew services start mongodb/brew/mongodb-community
   
   # Ubuntu/Debian
   sudo apt update
   sudo apt install mongodb
   sudo systemctl start mongodb
   
   # Windows
   # Download from https://www.mongodb.com/try/download/community
   ```

2. **Verify Installation**:
   ```bash
   mongosh
   # Should connect to mongodb://localhost:27017
   ```

### Option 2: MongoDB Atlas (Cloud)

1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Get connection string and update `MONGODB_URI` in `.env.local`
4. Whitelist your IP address in Network Access

## Directory Structure

The backend implementation adds the following structure:

```
lib/
├── types/
│   └── audit.ts           # TypeScript interfaces
├── models/
│   └── audit.ts           # Mongoose database models
├── db/
│   └── mongodb.ts         # Database connection utility
└── services/
    ├── audit-service.ts   # Main orchestration service
    ├── crawler.ts         # Puppeteer website crawler
    ├── seo-analyzer.ts    # SEO analysis engine
    ├── performance-analyzer.ts  # Lighthouse integration
    └── accessibility-analyzer.ts # axe-core integration

app/api/audit/
├── start/
│   └── route.ts          # POST /api/audit/start
├── status/[auditId]/
│   └── route.ts          # GET /api/audit/status/{id}
└── results/[auditId]/
    └── route.ts          # GET /api/audit/results/{id}

public/
└── screenshots/          # Generated website screenshots
```

## API Endpoints

### Start Audit
```bash
POST /api/audit/start
Content-Type: application/json

{
  "url": "https://example.com",
  "options": {
    "seo": true,
    "performance": true,
    "accessibility": true,
    "security": false,
    "mobile": true,
    "content": false
  },
  "userId": "optional-user-id"
}

Response:
{
  "success": true,
  "auditId": "uuid-here",
  "message": "Audit started successfully"
}
```

### Check Progress
```bash
GET /api/audit/status/{auditId}

Response:
{
  "success": true,
  "audit": {
    "id": "uuid",
    "url": "https://example.com",
    "status": "analyzing",
    "currentStep": "Analyzing performance",
    "progress": 65,
    "createdAt": "2025-01-28T10:00:00Z",
    "updatedAt": "2025-01-28T10:02:30Z"
  }
}
```

### Get Results
```bash
GET /api/audit/results/{auditId}
# Optional query params:
# ?includeRawData=true
# ?modules=seo,performance

Response:
{
  "success": true,
  "results": {
    "id": "uuid",
    "url": "https://example.com",
    "timestamp": "2025-01-28T10:03:00Z",
    "overallScore": 87,
    "status": "completed",
    "seo": { ... },
    "performance": { ... },
    "accessibility": { ... }
  }
}
```

## Testing the System

### 1. Start Development Server
```bash
npm run dev
# Server starts on http://localhost:3002 (or available port)
```

### 2. Test API Endpoints

```bash
# Test audit start
curl -X POST http://localhost:3002/api/audit/start \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com",
    "options": {
      "seo": true,
      "performance": true,
      "accessibility": true,
      "security": false,
      "mobile": true,
      "content": false
    }
  }'

# Test progress (replace with actual auditId)
curl http://localhost:3002/api/audit/status/{auditId}

# Test results (replace with actual auditId)
curl http://localhost:3002/api/audit/results/{auditId}
```

### 3. Test Frontend Integration

1. Navigate to `http://localhost:3002/audit`
2. Enter a URL (e.g., `https://example.com`)
3. Select audit options
4. Click "Start Comprehensive Audit"
5. Watch real-time progress
6. View comprehensive results

## Database Collections

The system creates the following MongoDB collections:

### audit_results
Stores complete audit results with module data:
```javascript
{
  _id: ObjectId,
  id: String (UUID),
  url: String,
  timestamp: Date,
  overallScore: Number,
  status: "completed" | "failed" | "partial",
  seo: { score, issues, suggestions, metrics },
  performance: { score, metrics, opportunities, diagnostics },
  accessibility: { score, issues, suggestions, metrics },
  // ... other modules
  crawlDuration: Number,
  analysisDuration: Number,
  totalDuration: Number,
  userId: String (optional),
  userAgent: String,
  screenshotPath: String,
  rawData: Object (optional)
}
```

### audit_progress
Tracks real-time audit progress:
```javascript
{
  _id: ObjectId,
  id: String (UUID),
  url: String,
  status: "pending" | "crawling" | "analyzing" | "completed" | "failed",
  currentStep: String,
  progress: Number (0-100),
  createdAt: Date,
  updatedAt: Date,
  estimatedCompletion: Date (optional)
}
```

## Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   ```bash
   # Check if MongoDB is running
   sudo systemctl status mongodb
   # Or for macOS
   brew services list | grep mongodb
   ```

2. **Puppeteer Installation Issues**
   ```bash
   # Install Chromium dependencies (Linux)
   sudo apt-get install -y gconf-service libasound2 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 ca-certificates fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils wget
   ```

3. **Lighthouse Errors**
   ```bash
   # Increase Node.js memory limit
   NODE_OPTIONS="--max-old-space-size=4096" npm run dev
   ```

4. **Performance Issues**
   - Reduce `MAX_CONCURRENT_AUDITS` in environment
   - Increase server memory allocation
   - Use SSD storage for screenshot directory

### Logs and Debugging

Monitor console output for detailed audit progress:
```bash
npm run dev
# Look for:
# ✅ Connected to MongoDB
# ✅ Audit {auditId} completed in {time}ms
# ❌ Audit {auditId} failed: {error}
```

## Production Deployment

### Environment Updates
```bash
NODE_ENV=production
MONGODB_URI=mongodb+srv://...  # Use MongoDB Atlas
NEXTAUTH_URL=https://yourdomain.com
```

### Performance Optimizations
- Use MongoDB replica sets
- Implement Redis caching for results
- Set up CDN for screenshot delivery
- Configure horizontal scaling for audit workers

### Security Considerations
- Enable MongoDB authentication
- Use HTTPS for all endpoints
- Implement rate limiting
- Validate and sanitize all inputs
- Set up proper CORS policies

## Next Steps

1. **Enhanced Features** (Future Sprints):
   - Security analysis with SSL/TLS checking
   - Advanced content analysis with NLP
   - Competitor comparison audits
   - Scheduled audit monitoring
   - White-label report generation

2. **Scalability**:
   - Queue system for high-volume audits
   - Worker process distribution
   - Real-time WebSocket progress updates
   - Audit result caching

3. **Integrations**:
   - Google Search Console API
   - Social media analysis
   - Third-party SEO tools
   - Automated report delivery

---

**Status**: Backend integration complete ✅  
**Next**: Enhanced analysis modules and production scaling  
**Performance**: Real audits complete in 60-180 seconds depending on site complexity 