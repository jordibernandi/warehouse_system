### Warehouse System

A warehouse management system developed to support daily warehouse operations, including stock monitoring and inventory tracking for a small business.

## 📋 Overview

This application provides the following features:

- Authentication and login system
- User and role management
- Product registration and catalog management
- Customer registration and management
- Location registration and warehouse mapping
- Product shipment handling with automatic inventory calculation
- Product serial number search
- Invoice and shipment report generation (PDF)

## 🛠️ Technology Stack

- **React 17**: React UI library

- **TypeScript**: For type-safe code
  
- **ExpressJS**: Backend node framework

- **MongoDB**: Database schema NoSQL

- **MaterialUI**: UI framework library

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v16)

- npm/yarn

### Installation

Add your MONGO_URI to the default.json file. Make sure you set an env var for that and the jwtSecret on deployment

```bash
# Install dependencies for server
npm install

# Install dependencies for client
npm run client-install

# Run the client & server with concurrently
npm run dev

# Run the Express server only
npm run server

# Run the React client only
npm run client

# Server runs on http://localhost:5000 and client on http://localhost:3000
```
## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.



