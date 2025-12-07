# RIA Command Center - Backend Setup

## Overview
This backend provides persistent remote storage for the RIA Command Center application using Express.js and SQLite.

## Features
- **Persistent Storage**: All vendor data, images, notes, and weights are stored in a SQLite database
- **RESTful API**: Simple API endpoints for CRUD operations
- **Auto-sync**: Frontend automatically syncs with backend
- **Fallback Support**: Works offline with localStorage fallback

## Installation

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

## Running the Backend

Start the server:
```bash
npm start
```

Or for development with auto-reload:
```bash
npm run dev
```

The backend will run on **http://localhost:3001**

## API Endpoints

### Vendors
- `GET /api/vendors` - Get all vendors
- `GET /api/vendors/:name` - Get specific vendor
- `POST /api/vendors/:name` - Save/update vendor data

### Images
- `GET /api/images/:vendorName/:location` - Get images (front/back)
- `POST /api/images/:vendorName/:location` - Save images

### Notes
- `GET /api/notes/:vendorName` - Get vendor notes
- `POST /api/notes/:vendorName` - Save vendor notes

### Weights
- `GET /api/weights` - Get category weights
- `POST /api/weights` - Save category weights

### Health
- `GET /api/health` - Health check

## Database

The SQLite database (`ria-data.db`) is automatically created in the backend directory.

## Frontend Integration

The frontend automatically connects to the backend at `http://localhost:3001/api`.

All editable fields now save to remote storage:
- Vendor pros/cons/bestFor
- Vendor notes
- Vendor images
- Category weights

## Troubleshooting

If the backend is not running, the frontend will fall back to localStorage.

Check backend status at: http://localhost:3001/api/health
