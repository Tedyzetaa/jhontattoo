// app.js

// Arrays de imagens e vídeos (caminhos relativos)
const imageFiles = [
    'img/img1.jpg',
    'img/img2.jpg',
    'img/img3.jpg',
    'img/img4.jpg',
    'img/img5.jpg',
    'img/img6.jpg',
    'img/img7.jpg',
    'img/img8.jpg',
    'img/img9.jpg'
];

const videoFiles = [
    'video/video1.mp4',
    'video/video2.mp4',
    'video/video3.mp4',
    'video/video4.mp4',
    'video/video5.mp4',
    'video/video6.mp4',
    'video/video7.mp4',
    'video/video8.mp4'
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

// Backend URL from config
const BACKEND_URL = window.APP_CONFIG ? window.APP_CONFIG.BACKEND_URL : 'https://jhontattoo-backend.onrender.com';

// Current visible item index for each gallery
let currentImageIndex = 0;
let currentVideoIndex = 0;

// Function to check if file exists
async function checkFileExists(url) {
    try {
        const response = await fetch(url, { method: 'HEAD' });
        return response.ok;
    } catch (error) {
        console.error(`Error checking file ${url}:`, error);
        return false;
    }
}

// Function to create placeholder for missing files
function createPlaceholder(type, index) {
    const placeholder = document.createElement('div');
    placeholder.className = 'gallery-item placeholder';
    placeholder.innerHTML = `
        <div class="placeholder-content">
            <div class="placeholder-icon">${type === 'image' ? '📷' : '🎥'}</div>
            <div class="placeholder-text">${type === 'image' ? 'Imagem' : 'Vídeo'} ${index + 1}<br><small>Não encontrado</small></div>
        </div>
    `;
    return placeholder;
}

// Function to load image gallery
async function loadImageGallery() {
    if (!imageGallery) return;

    imageGallery.innerHTML = '<div class="loading">Carregando imagens...</div>';

    for (let i = 0; i < imageFiles.length; i++) {
        const src = imageFiles[i];
        const fileExists = await checkFileExists(src);
        
        const galleryItem = document.createElement('div');
        galleryItem.className = 'gallery-item';
        galleryItem.setAttribute('data-index', i);

        if (fileExists) {
            const img = document.createElement('img');
            img.src = src;
            img.alt = `Tattoo image ${i + 1}`;
            img.loading = 'lazy';
            
            // Add error handling for individual images
            img.onerror = function() {
                console.error(`Erro ao carregar imagem: ${src}`);
                galleryItem.innerHTML = `
                    <div class="placeholder-content">
                        <div class="placeholder-icon">❌</div>
                        <div class="placeholder-text">Erro ao carregar<br><small>${src}</small></div>
                    </div>
                `;
                galleryItem.classList.add('error');
            };

            galleryItem.appendChild(img);
            galleryItem.addEventListener('click', () => openMediaModal('image', src, i));
        } else {
            galleryItem.appendChild(createPlaceholder('image', i));
            console.warn(`Imagem não encontrada: ${src}`);
        }

        imageGallery.appendChild(galleryItem);
    }

    // Remove loading message
    const loadingMsg = imageGallery.querySelector('.loading');
    if (loadingMsg) loadingMsg.remove();

    // Create indicator dots
    createIndicator(imageIndicator, imageFiles.length, 0);
}

// Function to load video gallery
async function loadVideoGallery() {
    if (!videoGallery) return;

    videoGallery.innerHTML = '<div class="loading">Carregando vídeos...</div>';

    for (let i = 0; i < videoFiles.length; i++) {
        const src = videoFiles[i];
        const fileExists = await checkFileExists(src);
        
        const galleryItem = document.createElement('div');
        galleryItem.className = 'gallery-item';
        galleryItem.setAttribute('data-index', i);

        if (fileExists) {
            const video = document.createElement('video');
            video.src = src;
            video.alt = `Tattoo video ${i + 1}`;
            video.preload = 'metadata';
            
            // Add error handling for individual videos
            video.onerror = function() {
                console.error(`Erro ao carregar vídeo: ${src}`);
                galleryItem.innerHTML = `
                    <div class="placeholder-content">
                        <div class="placeholder-icon">❌</div>
                        <div class="placeholder-text">Erro ao carregar<br><small>${src}</small></div>
                    </div>
                `;
                galleryItem.classList.add('error');
            };

            const playIcon = document.createElement('div');
            playIcon.className = 'play-icon';

            galleryItem.appendChild(video);
            galleryItem.appendChild(playIcon);
            galleryItem.addEventListener('click', () => openMediaModal('video', src, i));
        } else {
            galleryItem.appendChild(createPlaceholder('video', i));
            console.warn(`Vídeo não encontrado: ${src}`);
        }

        videoGallery.appendChild(galleryItem);
    }

    // Remove loading message
    const loadingMsg = videoGallery.querySelector('.loading');
    if (loadingMsg) loadingMsg.remove();

    // Create indicator dots
    createIndicator(videoIndicator, videoFiles.length, 0);
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
            // This would scroll to the specific item
            // For simplicity, we'll just update the active dot
            updateIndicator(container, i);
        });
        container.appendChild(dot);
    }
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
            
            if (response.ok) {
                // Show success message
                bookingForm.style.display = 'none';
                bookingSuccess.style.display = 'block';
                
                // Reset form
                bookingForm.reset();
                fileName.textContent = 'Nenhum arquivo selecionado';
                
                // Close modal after 3 seconds
                setTimeout(() => {
                    closeBookingModal();
                    bookingForm.style.display = 'block';
                    bookingSuccess.style.display = 'none';
                }, 3000);
            } else {
                throw new Error('Erro ao enviar agendamento');
            }
        } catch (error) {
            console.error('Error submitting booking:', error);
            bookingError.textContent = 'Erro ao enviar agendamento. Tente novamente.';
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

// Initialize galleries when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM carregado, iniciando galerias...');
    loadImageGallery();
    loadVideoGallery();
});