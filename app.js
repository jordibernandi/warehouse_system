const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const config = require('./config');

// routes
const authRoutes = require('./routes/api/auth');
const userRoutes = require('./routes/api/users');
const locationRoutes = require('./routes/api/locations');
const brandRoutes = require('./routes/api/brands');
const productRoutes = require('./routes/api/products');
const invoiceRoutes = require('./routes/api/invoices');
const shipmentRoutes = require('./routes/api/shipments');
const customerRoutes = require('./routes/api/customers');
const actionRoutes = require('./routes/api/actions');

const { MONGO_URI, MONGO_DB_NAME } = config;

const app = express();

// CORS Middleware
app.use(cors());
// Logger Middleware
app.use(morgan('dev'));
// Bodyparser Middleware
app.use(bodyParser.json());

// DB Config
const db = `${MONGO_URI}/${MONGO_DB_NAME}`;

// Connect to Mongo
mongoose
  .connect(db, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
  })
  .then(() => console.log('MongoDB Connected...'))
  .catch(err => console.error(err));

// Use Routes
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/brands', brandRoutes);
app.use('/api/products', productRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/shipments', shipmentRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/actions', actionRoutes);

// Serve static assets if in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('client/build'));

  app.get('*', (req, res) => {
    res.sendFile(
      path.resolve(__dirname, 'client', 'build', 'index.html')
    );
  });
}

module.exports = app;
