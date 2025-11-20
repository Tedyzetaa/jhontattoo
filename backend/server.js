const express = require('express');
const cors = require('cors');
require('dotenv').config();
const multer = require('multer');
const { initializeApp, cert } = require('firebase-admin/app');
const { getStorage } = require('firebase-admin/storage');

const galleryRoutes = require('./routes/galleryRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const PORT = process.env.PORT || 3001;

// --- Configuração do Firebase Admin SDK ---
// Monta o objeto de credenciais a partir das variáveis de ambiente
const serviceAccount = {
  type: process.env.FIREBASE_TYPE,
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: process.env.FIREBASE_AUTH_URI,
  token_uri: process.env.FIREBASE_TOKEN_URI,
  auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
  client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL
};

initializeApp({
  credential: cert(serviceAccount),
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET
});

const bucket = getStorage().bucket();
const upload = multer({ storage: multer.memoryStorage() });

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

// --- Rota para Agendamentos ---
app.post('/api/appointments', upload.single('tattooImage'), async (req, res) => {
  try {
    const { fullName, whatsapp, bodyPart, additionalInfo, userId } = req.body;
    const imageFile = req.file;

    if (!fullName || !whatsapp || !bodyPart) {
      return res.status(400).json({ error: 'Campos obrigatórios não preenchidos.' });
    }

    let imageUrl = '';

    // Faz o upload da imagem, se ela existir
    if (imageFile) {
      const fileName = `references/${userId}-${Date.now()}-${imageFile.originalname}`;
      const file = bucket.file(fileName);

      const stream = file.createWriteStream({
        metadata: {
          contentType: imageFile.mimetype,
        },
      });

      await new Promise((resolve, reject) => {
        stream.on('error', (err) => {
          console.error('Erro no stream de upload:', err);
          reject(new Error('Erro ao fazer upload da imagem.'));
        });
        stream.on('finish', resolve);
        stream.end(imageFile.buffer);
      });

      imageUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
    }

    // --- Lógica para o WhatsApp ---
    const tattooArtistWhatsapp = process.env.TATTOO_ARTIST_WHATSAPP || 'SEU_NUMERO_DE_WHATSAPP_AQUI';
    
    let message = `Olá! Gostaria de agendar uma tatuagem.\n\n`;
    message += `*Nome:* ${fullName}\n`;
    message += `*Parte do Corpo:* ${bodyPart}\n`;
    if (additionalInfo) message += `*Detalhes:* ${additionalInfo}\n`;
    if (imageUrl) message += `*Imagem de Referência:* ${imageUrl}\n`;

    const whatsappUrl = `https://wa.me/${tattooArtistWhatsapp}?text=${encodeURIComponent(message)}`;

    // Responde ao frontend com sucesso e a URL do WhatsApp
    res.status(200).json({
      message: 'Agendamento recebido! Você será redirecionado para o WhatsApp.',
      whatsappUrl: whatsappUrl,
    });
  } catch (error) {
    console.error('Erro ao processar agendamento:', error);
    res.status(500).json({ error: 'Ocorreu um erro interno no servidor.' });
  }
});

// Health check com info do Firebase
app.get('/api/health', (req, res) => {
  const rebaseAp
  res.status(200).json({ 
    status: 'OK', 
    message: 'Jhow Tattoo Backend is running!',
    firebase: firebaseApp.name ? 'connected' 
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