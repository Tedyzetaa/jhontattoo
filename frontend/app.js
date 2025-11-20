// app.js - Jhow Tattoo Studio
// Versão otimizada para deploy no Vercel

// Detect environment
const isVercel = window.location.hostname.includes('vercel.app') || 
                 window.location.hostname.includes('now.sh');

console.log('Environment:', isVercel ? 'Vercel' : 'Local');
console.log('Current URL:', window.location.href);

// No Vercel, os caminhos são relativos à raiz do deploy
// Use caminhos absolutos começando com / para garantir que funcionem no Vercel
const imageFiles = [
    '/img/img1.jpg',
    '/img/img2.jpg',
    '/img/img3.jpg',
    '/img/img4.jpg',
    '/img/img5.jpg',
    '/img/img6.jpg',
    '/img/img7.jpg',
    '/img/img8.jpg',
    '/img/img9.jpg'
];

const videoFiles = [
    '/video/video1.mp4',
    '/video/video2.mp4',
    '/video/video3.mp4',
    '/video/video4.mp4',
    '/video/video5.mp4',
    '/video/video6.mp4',
    '/video/video7.mp4',
    '/video/video8.mp4'
];

// DOM Elements
const imageGallery = document.getElementById('imageGallery');
const videoGallery = document.getElementById('videoGallery');
const scrollLeftImages = document.getElementById('scrollLeftImages');
const scrollRightImages = document.getElementById('scrollRightImages');
const scrollLeftVideos = document.getElementById('scrollLeftVideos');
const scrollRightVideos = document.getElementById('scrollRightVideos');
const imageIndicator = document.getElementById('imageIndicator');
const videoIndicator = document.getElementById('videoIndicator');
const mediaModal = document.getElementById('mediaModal');
const modalImage = document.getElementById('modalImage');
const modalVideo = document.getElementById('modalVideo');
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

// Use BACKEND_URL do window.APP_CONFIG se disponível
const BACKEND_URL = window.APP_CONFIG ? window.APP_CONFIG.BACKEND_URL : 'https://jhontattoo-backend.onrender.com';

// Current visible item index for each gallery
let currentImageIndex = 0;
let currentVideoIndex = 0;

// Function to create placeholder for missing files
function createPlaceholder(type, index) {
    const placeholder = document.createElement('div');
    placeholder.className = 'gallery-item placeholder';
    placeholder.innerHTML = `
        <div class="placeholder-content">
            <div class="placeholder-icon">${type === 'image' ? '📷' : '🎥'}</div>
            <div class="placeholder-text">${type === 'image' ? 'Imagem' : 'Vídeo'} ${index + 1}<br><small>Carregando...</small></div>
        </div>
    `;
    return placeholder;
}

// Function to load image gallery
async function loadImageGallery() {
    if (!imageGallery) {
        console.error('imageGallery element not found');
        return;
    }

    console.log('Starting to load image gallery...');
    imageGallery.innerHTML = '<div class="loading">Carregando imagens...</div>';

    const loadPromises = imageFiles.map(async (src, i) => {
        const galleryItem = document.createElement('div');
        galleryItem.className = 'gallery-item';
        galleryItem.setAttribute('data-index', i);

        try {
            const img = new Image();
            img.src = src;
            img.alt = `Tattoo image ${i + 1}`;
            img.loading = 'lazy';
            
            img.onload = () => {
                console.log(`Image loaded successfully: ${src}`);
                galleryItem.classList.add('loaded');
            };
            
            img.onerror = () => {
                console.error(`Failed to load image: ${src}`);
                galleryItem.innerHTML = `
                    <div class="placeholder-content">
                        <div class="placeholder-icon">❌</div>
                        <div class="placeholder-text">Erro ao carregar</div>
                    </div>
                `;
                galleryItem.classList.add('error');
            };

            galleryItem.appendChild(img);
            galleryItem.addEventListener('click', () => openMediaModal('image', src, i));
        } catch (error) {
            console.error(`Error loading image ${src}:`, error);
            galleryItem.appendChild(createPlaceholder('image', i));
            galleryItem.classList.add('error');
        }
        return galleryItem;
    });

    try {
        const galleryItems = await Promise.all(loadPromises);
        imageGallery.innerHTML = ''; // Clear loading message
        galleryItems.forEach(item => imageGallery.appendChild(item));
        
        // Create indicator dots
        createIndicator(imageIndicator, imageFiles.length, 0);
        console.log('Image gallery loaded successfully');
    } catch (error) {
        console.error('Error loading image gallery:', error);
        imageGallery.innerHTML = '<div class="loading error">Erro ao carregar imagens</div>';
    }
}

// Function to load video gallery
async function loadVideoGallery() {
    if (!videoGallery) {
        console.error('videoGallery element not found');
        return;
    }

    console.log('Starting to load video gallery...');
    videoGallery.innerHTML = '<div class="loading">Carregando vídeos...</div>';

    const loadPromises = videoFiles.map(async (src, i) => {
        const galleryItem = document.createElement('div');
        galleryItem.className = 'gallery-item';
        galleryItem.setAttribute('data-index', i);

        try {
            // Para vídeos, vamos criá-los e deixar o navegador lidar com o carregamento
            const video = document.createElement('video');
            video.src = src;
            video.alt = `Tattoo video ${i + 1}`;
            video.preload = 'metadata';
            video.muted = true; // Mute for autoplay prevention
            
            const playIcon = document.createElement('div');
            playIcon.className = 'play-icon';

            video.onloadeddata = () => {
                console.log(`Video loaded successfully: ${src}`);
                galleryItem.classList.add('loaded');                
            };
            
            video.onerror = () => {
                console.error(`Failed to load video: ${src}`);
                galleryItem.innerHTML = `
                    <div class="placeholder-content">
                        <div class="placeholder-icon">❌</div>
                        <div class="placeholder-text">Erro ao carregar</div>
                    </div>
                `;
                galleryItem.classList.add('error');
            };

            galleryItem.appendChild(video);
            galleryItem.appendChild(playIcon);
            galleryItem.addEventListener('click', () => openMediaModal('video', src, i));
        } catch (error) {
            console.error(`Error loading video ${src}:`, error);
            galleryItem.appendChild(createPlaceholder('video', i));
            galleryItem.classList.add('error');
        }

        return galleryItem;
    });

    try {
        const galleryItems = await Promise.all(loadPromises);
        videoGallery.innerHTML = ''; // Clear loading message
        galleryItems.forEach(item => videoGallery.appendChild(item));
        
        // Create indicator dots
        createIndicator(videoIndicator, videoFiles.length, 0);
        console.log('Video gallery loaded successfully');
    } catch (error) {
        console.error('Error loading video gallery:', error);
        videoGallery.innerHTML = '<div class="loading error">Erro ao carregar vídeos</div>';
    }
}

// Function to create indicator dots
function createIndicator(container, count, activeIndex) {
    if (!container) return;
    
    container.innerHTML = '';
    
    for (let i = 0; i < count; i++) {
        const dot = document.createElement('div');
        dot.className = 'indicator-dot';
        if (i === activeIndex) {
            dot.classList.add('active');
        }
        dot.addEventListener('click', () => {
            scrollToItem(container === imageIndicator ? 'image' : 'video', i);
        });
        container.appendChild(dot);
    }
}

// Function to scroll to specific item
function scrollToItem(type, index) {
    const gallery = type === 'image' ? imageGallery : videoGallery;
    const indicator = type === 'image' ? imageIndicator : videoIndicator;
    
    if (!gallery) return;
    
    const items = gallery.querySelectorAll('.gallery-item');
    if (items.length === 0) return;
    
    const itemWidth = items[0].offsetWidth + 15; // 15px gap
    const scrollPosition = itemWidth * index;
    
    gallery.scrollTo({
        left: scrollPosition,
        behavior: 'smooth'
    });
    
    // Update current index and indicator
    if (type === 'image') {
        currentImageIndex = index;
    } else {
        currentVideoIndex = index;
    }
    
    updateIndicator(indicator, index);
}

// Function to update indicator
function updateIndicator(container, activeIndex) {
    const dots = container.querySelectorAll('.indicator-dot');
    dots.forEach((dot, index) => {
        if (index === activeIndex) {
            dot.classList.add('active');
        } else {
            dot.classList.remove('active');
        }
    });
}

// Function to open media modal
function openMediaModal(type, src, index) {
    // Hide both media elements first
    modalImage.style.display = 'none';
    modalVideo.style.display = 'none';

    if (type === 'image') {
        modalImage.src = src;
        modalImage.style.display = 'block';
        modalTitle.textContent = `Tatuagem ${index + 1}`;
        modalDescription.textContent = 'Imagem do portfólio do estúdio.';
    } else if (type === 'video') {
        modalVideo.src = src;
        modalVideo.style.display = 'block';
        modalTitle.textContent = `Processo de Tatuagem ${index + 1}`;
        modalDescription.textContent = 'Vídeo do processo de criação no estúdio.';
    }

    // Update other modal details
    modalArtist.textContent = 'Artista: Jhow';
    modalCategory.textContent = `Categoria: ${type === 'image' ? 'Fotos' : 'Vídeos'}`;

    mediaModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Function to close modal
function closeModal() {
    if (!mediaModal) return;
    
    // Pause video if playing
    if (modalVideo.style.display !== 'none') {
        modalVideo.pause();
        modalVideo.currentTime = 0;
    }
    
    mediaModal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

// Function to scroll gallery
function scrollGallery(gallery, direction, indicator, currentIndex) {
    if (!gallery) return currentIndex;
    
    const items = gallery.querySelectorAll('.gallery-item');
    if (items.length === 0) return currentIndex;
    
    const itemWidth = items[0].offsetWidth + 15; // 15px gap
    const scrollAmount = itemWidth * 3; // Scroll 3 items at a time
    
    if (direction === 'left') {
        gallery.scrollLeft -= scrollAmount;
        currentIndex = Math.max(0, currentIndex - 3);
    } else {
        gallery.scrollLeft += scrollAmount;
        currentIndex = Math.min(
            (items.length - 1), 
            currentIndex + 3
        );
    }
    
    // Update indicator
    if (indicator) {
        updateIndicator(indicator, currentIndex);
    }
    
    return currentIndex;
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
                // Show success message
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

if (mediaModal) {
    mediaModal.addEventListener('click', (e) => {
        if (e.target === mediaModal) closeModal();
    });
}

if (scrollLeftImages) {
    scrollLeftImages.addEventListener('click', () => {
        currentImageIndex = scrollGallery(imageGallery, 'left', imageIndicator, currentImageIndex);
    });
}

if (scrollRightImages) {
    scrollRightImages.addEventListener('click', () => {
        currentImageIndex = scrollGallery(imageGallery, 'right', imageIndicator, currentImageIndex);
    });
}

if (scrollLeftVideos) {
    scrollLeftVideos.addEventListener('click', () => {
        currentVideoIndex = scrollGallery(videoGallery, 'left', videoIndicator, currentVideoIndex);
    });
}

if (scrollRightVideos) {
    scrollRightVideos.addEventListener('click', () => {
        currentVideoIndex = scrollGallery(videoGallery, 'right', videoIndicator, currentVideoIndex);
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

// Add keyboard navigation
document.addEventListener('keydown', (e) => {
    if (mediaModal.classList.contains('active')) {
        if (e.key === 'Escape') {
            closeModal();
        }
    }
});

// Initialize galleries when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM carregado, iniciando galerias...');
    console.log('Image files to load:', imageFiles);
    console.log('Video files to load:', videoFiles);
    
    // Load galleries with a small delay to ensure DOM is ready
    setTimeout(() => {
        loadImageGallery();
        loadVideoGallery();
    }, 100);
});

// Add debug info to page
function addDebugInfo() {
    const debugInfo = document.createElement('div');
    debugInfo.style.cssText = `
        position: fixed;
        bottom: 10px;
        left: 10px;
        background: rgba(0,0,0,0.8);
        color: white;
        padding: 10px;
        border-radius: 5px;
        font-size: 12px;
        z-index: 10000;
        font-family: monospace;
    `;
    debugInfo.innerHTML = `
        <div>Env: ${isVercel ? 'Vercel' : 'Local'}</div>
        <div>Images: ${imageFiles.length}</div>
        <div>Videos: ${videoFiles.length}</div>
    `;
    document.body.appendChild(debugInfo);
}

// Uncomment the line below to enable debug info
// addDebugInfo();