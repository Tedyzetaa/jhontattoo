const admin = require('firebase-admin');

// Função para formatar corretamente a private key
const formatPrivateKey = (key) => {
  if (!key) return null;
  
  // Remove aspas extras e formata as quebras de linha
  return key
    .replace(/\\n/g, '\n')
    .replace(/"/g, '')
    .trim();
};

let serviceAccount;
let firebaseInitialized = false;

try {
  // Verifica se todas as variáveis necessárias estão presentes
  const privateKey = formatPrivateKey(process.env.FIREBASE_PRIVATE_KEY);
  
  if (privateKey && process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL) {
    serviceAccount = {
      type: "service_account",
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key: privateKey,
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_CLIENT_ID,
      auth_uri: "https://accounts.google.com/o/oauth2/auth",
      token_uri: "https://oauth2.googleapis.com/token",
      auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
      client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL,
    };

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET
    });
    
    firebaseInitialized = true;
    console.log('✅ Firebase Admin inicializado com sucesso!');
  } else {
    console.log('⚠️  Firebase não inicializado - variáveis de ambiente faltando');
    console.log('📝 Modo de desenvolvimento sem Firebase ativado');
  }
} catch (error) {
  console.error('❌ Erro na inicialização do Firebase:', error.message);
  console.log('📝 Continuando em modo de desenvolvimento sem Firebase...');
}

// Cria objetos vazios para desenvolvimento
const db = firebaseInitialized ? admin.firestore() : { 
  collection: () => ({ 
    doc: () => ({
      get: () => Promise.resolve({ exists: false, data: () => null }),
      set: () => Promise.resolve(),
      update: () => Promise.resolve(),
      delete: () => Promise.resolve()
    }),
    where: () => ({ orderBy: () => ({ get: () => Promise.resolve({ forEach: (cb) => cb() }) }) }),
    get: () => Promise.resolve({ forEach: (cb) => cb() }),
    add: () => Promise.resolve({ id: 'dev-' + Date.now() })
  })
};

const bucket = firebaseInitialized ? admin.storage().bucket() : {
  file: () => ({
    createWriteStream: () => ({
      on: (event, cb) => {
        if (event === 'finish') cb();
        return this;
      },
      end: () => {}
    }),
    makePublic: () => Promise.resolve()
  })
};

// Firebase Collections
const GALLERY_COLLECTION = 'tattooWorks';
const CATEGORIES_COLLECTION = 'categories';

module.exports = { 
  admin: firebaseInitialized ? admin : null, 
  db, 
  bucket, 
  GALLERY_COLLECTION, 
  CATEGORIES_COLLECTION,
  firebaseInitialized 
};