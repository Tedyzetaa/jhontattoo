// auth.js
// Verificar se as configurações do Firebase estão disponíveis
if (!window.APP_CONFIG || !window.APP_CONFIG.FIREBASE_CONFIG) {
    console.error('Configurações do Firebase não encontradas. Verifique o arquivo config.js');
    // Exibir mensagem de erro para o usuário
    document.addEventListener('DOMContentLoaded', function() {
        const bookBtn = document.getElementById('bookBtn');
        if (bookBtn) {
            bookBtn.textContent = 'Erro de Configuração';
            bookBtn.style.backgroundColor = '#ff4444';
            bookBtn.disabled = true;
        }
    });
} else {
    // Inicializar Firebase com as configurações do config.js
    try {
        firebase.initializeApp(window.APP_CONFIG.FIREBASE_CONFIG);
        console.log('Firebase inicializado com sucesso');
    } catch (error) {
        console.error('Erro ao inicializar Firebase:', error);
    }
}

const auth = firebase.auth();
let currentUser = null; // Variável para manter o estado do usuário

// DOM Elements
const bookBtn = document.getElementById('bookBtn');
const authModal = document.getElementById('authModal');
const googleLogin = document.getElementById('googleLogin');
const bookingModal = document.getElementById('bookingModal');
const logoutBtnContainer = document.createElement('div'); // Container para o botão de logout

// Auth state observer
auth.onAuthStateChanged((user) => {
    if (user) {
        // User is signed in
        updateUIForUser(user);
    } else {
        // User is signed out
        updateUIForGuest();
    }
    currentUser = user; // Atualiza o estado do usuário
});

// Update UI for logged in user
function updateUIForUser(user) {
    // Limpa o conteúdo anterior do botão
    bookBtn.innerHTML = ''; 
    bookBtn.classList.add('user-logged-in'); // Adiciona uma classe para estilização

    const userInfo = document.createElement('div');
    userInfo.className = 'user-info';
    userInfo.innerHTML = `
        <img src="${user.photoURL || 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI2ZmZmZmZiI+PHBhdGggZD0iTTEyIDJDNi40OCAyIDIgNi40OCAyIDEyczQuNDggMTAgMTAgMTAgMTAtNC40OCAxMC0xMFMxNy41MiAyIDEyIDJ6bTAgM2MzLjMxIDAgNiAyLjY5IDYgNnMtMi42OSA2LTYgNi02LTIuNjktNi02IDIuNjktNiA2LTZ6bTAgMTdjLTIuNjcgMC04IDEuMzQtOCA0djJoMTZ2LTJjMC0yLjY2LTUuMzMtNC04LTR6Ii8+PC9zdmc+'}" 
             alt="Avatar" class="user-avatar">
        <span class="user-name">${user.displayName || 'Usuário'}</span>
    `;

    logoutBtnContainer.innerHTML = `<button class="logout-btn" id="logoutBtn">Sair</button>`;

    bookBtn.appendChild(userInfo);
    bookBtn.appendChild(logoutBtnContainer);
}

// Update UI for guest
function updateUIForGuest() {
    bookBtn.classList.remove('user-logged-in');
    bookBtn.innerHTML = `Agende sua Tattoo`;
}

// Handle Google login
function handleGoogleLogin() {
    // Verificar se o Firebase foi inicializado corretamente
    if (!firebase.apps.length) {
        alert('Erro de configuração do Firebase. Por favor, recarregue a página.');
        return;
    }
    
    const provider = new firebase.auth.GoogleAuthProvider();
    
    auth.signInWithPopup(provider)
        .then((result) => {
            // User signed in successfully
            console.log('User signed in:', result.user);
            closeAuthModal();
        })
        .catch((error) => {
            console.error('Error during Google login:', error);
            
            // Mensagens de erro mais específicas
            let errorMessage = 'Erro ao fazer login com Google. Tente novamente.';
            
            if (error.code === 'auth/popup-blocked') {
                errorMessage = 'Popup bloqueado. Por favor, permita popups para este site.';
            } else if (error.code === 'auth/popup-closed-by-user') {
                errorMessage = 'Login cancelado.';
            } else if (error.code === 'auth/unauthorized-domain') {
                errorMessage = 'Domínio não autorizado. Verifique as configurações do Firebase.';
            } else if (error.code.includes('api-key-not-valid')) {
                errorMessage = 'Chave API inválida. Verifique as configurações do Firebase.';
            }
            
            alert(errorMessage);
        });
}

// Handle logout
function handleLogout() {
    auth.signOut()
        .then(() => {
            console.log('User signed out');
        })
        .catch((error) => {
            console.error('Error during logout:', error);
        });
}

// Open auth modal
function openAuthModal() {
    authModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Close auth modal
function closeAuthModal() {
    authModal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

// Open booking modal
function openBookingModal() {
    bookingModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Centraliza a lógica de clique do botão principal
function handleBookBtnClick(event) {
    // Se o clique foi no botão de logout, executa o logout
    if (event.target.closest('#logoutBtn')) {
        handleLogout();
        return;
    }

    // Se o usuário estiver logado, abre o modal de agendamento. Senão, o de autenticação.
    if (currentUser) {
        openBookingModal();
    } else {
        openAuthModal();
    }
}

// Event listeners
if (googleLogin) {
    googleLogin.addEventListener('click', handleGoogleLogin);
}

if (authModal) {
    authModal.addEventListener('click', (e) => {
        if (e.target === authModal) closeAuthModal();
    });
}

if (bookBtn) {
    bookBtn.addEventListener('click', handleBookBtnClick);
}