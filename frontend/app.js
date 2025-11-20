// app.js
// Sample gallery data (would normally come from backend)
const galleryItems = [
    {
        id: 1,
        title: "Dragão Oriental",
        artist: "Jhow",
        category: "Tradicional",
        description: "Tatuagem em estilo oriental com dragão em preto e cinza. Realizada em 3 sessões.",
        imageUrl: "https://i.imgur.com/example1.jpg"
    },
    {
        id: 2,
        title: "Rosa Realista",
        artist: "Jhow",
        category: "Realismo",
        description: "Rosa em estilo realista com sombreamento preciso e detalhes naturais.",
        imageUrl: "https://i.imgur.com/example2.jpg"
    },
    {
        id: 3,
        title: "Geométrico Tribal",
        artist: "Ana",
        category: "Geométrico",
        description: "Padrões geométricos inspirados em tribos antigas com simetria perfeita.",
        imageUrl: "https://i.imgur.com/example3.jpg"
    },
    {
        id: 4,
        title: "Retrato em Preto e Branco",
        artist: "Jhow",
        category: "Retrato",
        description: "Retrato realista em preto e branco com alto contraste e detalhes impressionantes.",
        imageUrl: "https://i.imgur.com/example4.jpg"
    },
    {
        id: 5,
        title: "Mandala Colorida",
        artist: "Ana",
        category: "Mandala",
        description: "Mandala intricada com cores vibrantes e padrões simétricos.",
        imageUrl: "https://i.imgur.com/example5.jpg"
    },
    {
        id: 6,
        title: "Minimalista Linhas",
        artist: "Carlos",
        category: "Minimalista",
        description: "Design minimalista com linhas finas e conceito abstrato.",
        imageUrl: "https://i.imgur.com/example6.jpg"
    },
    {
        id: 7,
        title: "Old School Anchor",
        artist: "Jhow",
        category: "Old School",
        description: "Âncora no estilo old school tradicional com cores vivas e contornos grossos.",
        imageUrl: "https://i.imgur.com/example7.jpg"
    },
    {
        id: 8,
        title: "Aquarela Abstrata",
        artist: "Ana",
        category: "Aquarela",
        description: "Efeito aquarela com cores que se misturam criando uma composição abstrata.",
        imageUrl: "https://i.imgur.com/example8.jpg"
    }
];

// DOM Elements
const galleryContainer = document.getElementById('galleryContainer');
const imageModal = document.getElementById('imageModal');
const modalImg = document.getElementById('modalImg');
const modalTitle = document.getElementById('modalTitle');
const modalArtist = document.getElementById('modalArtist');
const modalCategory = document.getElementById('modalCategory');
const modalDescription = document.getElementById('modalDescription');
const modalClose = document.getElementById('modalClose');
const bookingClose = document.getElementById('bookingClose');
const bookingForm = document.getElementById('bookingForm');
const tattooImage = document.getElementById('tattooImage');
const fileName = document.getElementById('fileName');
const submitBooking = document.getElementById('submitBooking');
const submitSpinner = document.getElementById('submitSpinner');
const submitText = document.getElementById('submitText');
const bookingError = document.getElementById('bookingError');
const bookingSuccess = document.getElementById('bookingSuccess');

// Backend URL from config
const BACKEND_URL = window.APP_CONFIG ? window.APP_CONFIG.BACKEND_URL : 'https://jhontattoo-backend.onrender.com';

// Populate gallery with items
function populateGallery() {
    if (!galleryContainer) return;
    
    galleryContainer.innerHTML = '';
    
    galleryItems.forEach(item => {
        const galleryItem = document.createElement('div');
        galleryItem.className = 'gallery-item';
        galleryItem.innerHTML = `
            <img src="https://via.placeholder.com/400x400/333333/ffffff?text=${encodeURIComponent(item.title)}" alt="${item.title}">
            <div class="gallery-overlay">
                <h3 class="gallery-title">${item.title}</h3>
                <p class="gallery-category">${item.category}</p>
            </div>
        `;
        
        galleryItem.addEventListener('click', () => openModal(item));
        galleryContainer.appendChild(galleryItem);
    });
}

// Open image modal
function openModal(item) {
    if (!imageModal || !modalImg || !modalTitle || !modalArtist || !modalCategory || !modalDescription) return;
    
    modalImg.src = "https://via.placeholder.com/600x600/333333/ffffff?text=" + encodeURIComponent(item.title);
    modalTitle.textContent = item.title;
    modalArtist.textContent = `Artista: ${item.artist}`;
    modalCategory.textContent = `Categoria: ${item.category}`;
    modalDescription.textContent = item.description;
    
    imageModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Close image modal
function closeModal() {
    if (!imageModal) return;
    
    imageModal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

// Close booking modal
function closeBookingModal() {
    if (!bookingModal) return;
    
    bookingModal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

// Handle file upload display
if (tattooImage) {
    tattooImage.addEventListener('change', function() {
        if (this.files && this.files[0]) {
            fileName.textContent = this.files[0].name;
        } else {
            fileName.textContent = 'Nenhum arquivo selecionado';
        }
    });
}

// Handle booking form submission
if (bookingForm) {
    bookingForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Get current user
        const user = firebase.auth ? firebase.auth().currentUser : null;
        if (!user) {
            bookingError.textContent = 'Você precisa estar logado para agendar.';
            bookingError.style.display = 'block';
            return;
        }
        
        // Get form data
        const formData = new FormData();
        formData.append('fullName', document.getElementById('fullName').value);
        formData.append('whatsapp', document.getElementById('whatsapp').value);
        formData.append('bodyPart', document.getElementById('bodyPart').value);
        formData.append('additionalInfo', document.getElementById('additionalInfo').value);
        formData.append('userId', user.uid);
        formData.append('userEmail', user.email);
        
        // Add image file if selected
        if (tattooImage.files[0]) {
            formData.append('tattooImage', tattooImage.files[0]);
        }
        
        // Show loading state
        submitSpinner.style.display = 'inline-block';
        submitText.textContent = 'Enviando...';
        submitBooking.disabled = true;
        bookingError.style.display = 'none';
        
        try {
            // Send data to backend
            const response = await fetch(`${BACKEND_URL}/api/appointments`, {
                method: 'POST',
                body: formData
            });
            
            const data = await response.json();

            if (response.ok) {
                // Atualiza a mensagem de sucesso com a resposta do backend
                bookingSuccess.textContent = data.message || 'Sucesso! Redirecionando para o WhatsApp...';
                bookingForm.style.display = 'none';
                bookingSuccess.style.display = 'block';

                // Abre a URL do WhatsApp em uma nova aba
                if (data.whatsappUrl) {
                    window.open(data.whatsappUrl, '_blank');
                }

                // Reset form
                bookingForm.reset();
                fileName.textContent = 'Nenhum arquivo selecionado';
                
                // Fecha o modal e reseta a UI após um tempo
                setTimeout(() => {
                    closeBookingModal();
                    bookingForm.style.display = 'block';
                    bookingSuccess.style.display = 'none';
                    // Reseta o texto padrão da mensagem de sucesso
                    bookingSuccess.textContent = 'Agendamento enviado com sucesso! Entraremos em contato em breve.';
                }, 4000); // Aumentado para 4 segundos para dar tempo de ler a mensagem
            } else {
                throw new Error(data.error || 'Erro ao enviar agendamento');
            }
        } catch (error) {
            console.error('Error submitting booking:', error);
            bookingError.textContent = error.message || 'Erro ao enviar agendamento. Tente novamente.';
            bookingError.style.display = 'block';
        } finally {
            // Reset button state
            submitSpinner.style.display = 'none';
            submitText.textContent = 'Enviar Agendamento';
            submitBooking.disabled = false;
        }
    });
}

// Event Listeners
if (modalClose) {
    modalClose.addEventListener('click', closeModal);
}

if (imageModal) {
    imageModal.addEventListener('click', (e) => {
        if (e.target === imageModal) closeModal();
    });
}

if (bookingClose) {
    bookingClose.addEventListener('click', closeBookingModal);
}

if (bookingModal) {
    bookingModal.addEventListener('click', (e) => {
        if (e.target === bookingModal) closeBookingModal();
    });
}

// Initialize gallery quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    populateGallery();
});