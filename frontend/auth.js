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
let currentUser = null; // Variável para manter o estado do usuário globalmente

// DOM Elements
const bookBtn = document.getElementById('bookBtn');
const authModal = document.getElementById('authModal');
const googleLogin = document.getElementById('googleLogin');
const bookingModal = document.getElementById('bookingModal');

// Auth state observer
auth.onAuthStateChanged((user) => {
    currentUser = user; // Atualiza o estado do usuário
    updateUI(user);
});

// Função única para atualizar a UI baseada no estado do usuário
function updateUI(user) {
    if (user) {
        // Usuário logado
        bookBtn.innerHTML = `
            <div class="user-info">
                <img src="${user.photoURL || 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI2ZmZmZmZiI+PHBhdGggZD0iTTEyIDJDNi40OCAyIDIgNi40OCAyIDEyczQuNDggMTAgMTAgMTAgMTAtNC40OCAxMC0xMFMxNy41MiAyIDEyIDJ6bTAgM2MzLjMxIDAgNiAyLjY5IDYgNnMtMi42OSA2LTYgNi02LTIuNjktNi02IDIuNjktNiA2LTZ6bTAgMTdjLTIuNjcgMC04IDEuMzQtOCA0djJoMTZ2LTJjMC0yLjY2LTUuMzMtNC04LTR6Ii8+PC9zdmc+'}" 
                     alt="Avatar" class="user-avatar">
                <span class="user-name">${user.displayName || 'Usuário'}</span>
            </div>
            <button class="logout-btn" id="logoutBtn">Sair</button>
        `;
    } else {
        // Usuário deslogado
        bookBtn.innerHTML = 'Agende sua Tattoo';
    }
}

// Manipulador de clique centralizado para o botão principal
function handleBookBtnClick(event) {
    // Usa 'closest' para detectar clique no botão de logout ou em seus filhos
    if (event.target.closest('#logoutBtn')) {
        handleLogout();
        return; // Impede que outras ações de clique ocorram
    }

    // Se o usuário estiver logado, abre o modal de agendamento. Senão, o de autenticação.
    if (currentUser) {
        openBookingModal();
    } else {
        openAuthModal();
    }
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

if (bookBtn) {
    bookBtn.addEventListener('click', handleBookBtnClick);
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