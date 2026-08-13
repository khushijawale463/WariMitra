require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const methodOverride = require('method-override');

const indexRouter = require('./routes/index');
const facilitiesRouter = require('./routes/facilities');
const emergencyRouter = require('./routes/emergency');
const sevaRouter = require('./routes/seva');
const trackerRouter = require('./routes/tracker');
const navigationRouter = require('./routes/navigation');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/pandharpur_wari';

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/', indexRouter);
app.use('/facilities', facilitiesRouter);
app.use('/emergency', emergencyRouter);
app.use('/seva', sevaRouter);
app.use('/tracker', trackerRouter);
app.use('/api/navigation', navigationRouter);


// 404 handler
app.use((req, res) => {
  res.status(404).render('404', { title: 'Page Not Found' });
});

mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 3000 })
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    console.log('Starting server without a live DB connection. Pages using the database will show errors until MongoDB is connected.');
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
  });
