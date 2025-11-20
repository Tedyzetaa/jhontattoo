const express = require('express');
const cors = require('cors');
require('dotenv').config();

const galleryRoutes = require('./routes/galleryRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/gallery', galleryRoutes);
app.use('/api/admin', adminRoutes);

// Health check com info do Firebase
app.get('/api/health', (req, res) => {
  const { firebaseInitialized } = require('./config/firebase');
  
  res.status(200).json({ 
    status: 'OK', 
    message: 'Jhow Tattoo Backend is running!',
    firebase: firebaseInitialized ? 'connected' : 'development_mode',
    timestamp: new Date().toISOString()
  });
});

// Mock data para desenvolvimento
app.get('/api/dev/mock-data', (req, res) => {
  const mockWorks = [
    {
      id: 'dev-1',
      title: 'Tatuagem Dragão - Exemplo',
      description: 'Tatuagem estilo tradicional japonês',
      category: 'Tradicional',
      style: 'Colorida',
      tags: ['dragão', 'japonês', 'colorido'],
      images: ['https://via.placeholder.com/600x400/333/fff?text=Tattoo+1'],
      published: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'dev-2',
      title: 'Flor de Lótus - Exemplo',
      description: 'Tatuagem minimalista de flor de lótus',
      category: 'Minimalista',
      style: 'Blackwork',
      tags: ['flor', 'lótus', 'minimalista'],
      images: ['https://via.placeholder.com/600x400/666/fff?text=Tattoo+2'],
      published: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  res.json({
    success: true,
    data: mockWorks,
    message: 'Dados de desenvolvimento - Configure o Firebase para dados reais'
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    message: error.message 
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Jhow Tattoo Backend running on port ${PORT}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📝 Mock data: http://localhost:${PORT}/api/dev/mock-data`);
});