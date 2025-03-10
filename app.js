import express from 'express';
import mongoose from 'mongoose';
import path from 'path';
import cors from 'cors';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import config from './config';

// routes
import authRoutes from './routes/api/auth';
import userRoutes from './routes/api/users';
import locationRoutes from './routes/api/locations';
import brandRoutes from './routes/api/brands';
import productRoutes from './routes/api/products';
import invoiceRoutes from './routes/api/invoices';
import shipmentRoutes from './routes/api/shipments';
import customerRoutes from './routes/api/customers';
import actionRoutes from './routes/api/actions';

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
  }) // Adding new mongo url parser
  .then(() => console.log('MongoDB Connected...'))
  .catch(err => console.log(err));

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
  // Set static folder
  app.use(express.static('client/build'));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

export default app;
