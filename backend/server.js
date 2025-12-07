const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const Database = require('better-sqlite3');
const path = require('path');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Initialize SQLite Database
const db = new Database(path.join(__dirname, 'ria-data.db'));

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS vendors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    data TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS vendor_images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    vendor_name TEXT NOT NULL,
    location TEXT NOT NULL,
    image_data TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS vendor_notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    vendor_name TEXT UNIQUE NOT NULL,
    notes TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS weights (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    data TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// API Routes

// Get all vendor data
app.get('/api/vendors', (req, res) => {
    try {
        const vendors = db.prepare('SELECT * FROM vendors').all();
        res.json(vendors.map(v => ({
            name: v.name,
            data: JSON.parse(v.data),
            updated_at: v.updated_at
        })));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get specific vendor data
app.get('/api/vendors/:name', (req, res) => {
    try {
        const vendor = db.prepare('SELECT * FROM vendors WHERE name = ?').get(req.params.name);
        if (vendor) {
            res.json({
                name: vendor.name,
                data: JSON.parse(vendor.data),
                updated_at: vendor.updated_at
            });
        } else {
            res.status(404).json({ error: 'Vendor not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Save/Update vendor data
app.post('/api/vendors/:name', (req, res) => {
    try {
        const { name } = req.params;
        const data = JSON.stringify(req.body);

        const stmt = db.prepare(`
      INSERT INTO vendors (name, data, updated_at) 
      VALUES (?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(name) DO UPDATE SET 
        data = excluded.data,
        updated_at = CURRENT_TIMESTAMP
    `);

        stmt.run(name, data);
        res.json({ success: true, message: 'Vendor data saved' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get vendor images
app.get('/api/images/:vendorName/:location', (req, res) => {
    try {
        const { vendorName, location } = req.params;
        const images = db.prepare(
            'SELECT image_data FROM vendor_images WHERE vendor_name = ? AND location = ?'
        ).all(vendorName, location);

        res.json(images.map(img => img.image_data));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Save vendor image
app.post('/api/images/:vendorName/:location', (req, res) => {
    try {
        const { vendorName, location } = req.params;
        const { images } = req.body;

        // Delete existing images for this vendor/location
        db.prepare('DELETE FROM vendor_images WHERE vendor_name = ? AND location = ?')
            .run(vendorName, location);

        // Insert new images
        const stmt = db.prepare(
            'INSERT INTO vendor_images (vendor_name, location, image_data) VALUES (?, ?, ?)'
        );

        images.forEach(imageData => {
            stmt.run(vendorName, location, imageData);
        });

        res.json({ success: true, message: 'Images saved' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get vendor notes
app.get('/api/notes/:vendorName', (req, res) => {
    try {
        const note = db.prepare('SELECT notes FROM vendor_notes WHERE vendor_name = ?')
            .get(req.params.vendorName);

        res.json({ notes: note ? note.notes : '' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Save vendor notes
app.post('/api/notes/:vendorName', (req, res) => {
    try {
        const { vendorName } = req.params;
        const { notes } = req.body;

        const stmt = db.prepare(`
      INSERT INTO vendor_notes (vendor_name, notes, updated_at) 
      VALUES (?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(vendor_name) DO UPDATE SET 
        notes = excluded.notes,
        updated_at = CURRENT_TIMESTAMP
    `);

        stmt.run(vendorName, notes);
        res.json({ success: true, message: 'Notes saved' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get weights
app.get('/api/weights', (req, res) => {
    try {
        const weights = db.prepare('SELECT data FROM weights ORDER BY id DESC LIMIT 1').get();
        res.json(weights ? JSON.parse(weights.data) : {});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Save weights
app.post('/api/weights', (req, res) => {
    try {
        const data = JSON.stringify(req.body);
        db.prepare('INSERT INTO weights (data) VALUES (?)').run(data);
        res.json({ success: true, message: 'Weights saved' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 RIA Backend API running on http://localhost:${PORT}`);
    console.log(`📊 Database: ${path.join(__dirname, 'ria-data.db')}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    db.close();
    process.exit(0);
});
