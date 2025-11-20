// config.js
// Configurações do Firebase - Substitua com suas próprias credenciais
const FIREBASE_CONFIG = {
    apiKey: "AIzaSyDsHzmc1HNyTroBpnTBPCdYJEqz5VAnToI", // Copie do painel do Firebase
    authDomain: "jhontattoo-4922e.firebaseapp.com",
    projectId: "jhontattoo-4922e",
    storageBucket: "jhontattoo-4922e.appspot.com",
    messagingSenderId: "273673583724", // Copie do painel do Firebase
    appId: "1:273673583724:web:e38dae93beb69ae077ec49" // Copie do painel do Firebase
};

const BACKEND_URL = "https://jhontattoo-backend.onrender.com";

// Exportar para uso global
window.APP_CONFIG = {
    FIREBASE_CONFIG,
    BACKEND_URL
};