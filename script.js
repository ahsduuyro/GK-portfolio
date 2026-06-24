document.addEventListener("DOMContentLoaded", () => {
    
    // --- PRELOADER REMOVAL TRACKER ---
    const preloader = document.getElementById("preloader");
    window.addEventListener("load", () => {
        setTimeout(() => {
            if(preloader) {
                preloader.classList.add("loaded");
                // Trigger camera flash burst right after shutter opens
                triggerCameraFlash();
            }
        }, 600);
    });

    // --- STUDIO FLASH FUNCTION ---
    function triggerCameraFlash() {
        const flashEl = document.getElementById("cameraFlash");
        if(flashEl) {
            flashEl.classList.add("flash-fire");
            flashEl.addEventListener("animationend", () => {
                flashEl.classList.remove("flash-fire");
            }, { once: true });
        }
    }

    // --- MOBILE CAMERA MODE DIAL NAVIGATION ---
    const menuToggle = document.getElementById("menuToggle");
    const mobileNav = document.getElementById("mobileNav");
    const mobileLinks = document.querySelectorAll(".mobile-nav-item");

    if (menuToggle && mobileNav) {
        menuToggle.addEventListener("click", () => {
            const isOpened = mobileNav.classList.toggle("open");
            menuToggle.classList.toggle("active", isOpened);
            document.body.style.overflow = isOpened ? "hidden" : "";
            // Accessibility: reflect expanded state and update label
            menuToggle.setAttribute('aria-expanded', isOpened ? 'true' : 'false');
            menuToggle.setAttribute('aria-label', isOpened ? 'Close navigation menu' : 'Toggle Navigation Menu');
        });

        // Close layout drawer on items selection
        mobileLinks.forEach(link => {
            link.addEventListener("click", () => {
                mobileNav.classList.remove("open");
                menuToggle.classList.remove("active");
                document.body.style.overflow = "";
            });
        });
        // Close button inside mobile overlay
        const mobileCloseBtn = document.getElementById('mobileClose');
        if (mobileCloseBtn) {
            mobileCloseBtn.addEventListener('click', () => {
                mobileNav.classList.remove('open');
                menuToggle.classList.remove('active');
                menuToggle.setAttribute('aria-expanded', 'false');
                menuToggle.setAttribute('aria-label', 'Toggle Navigation Menu');
                document.body.style.overflow = '';
            });
        }
    }

    // --- MASONRY SORT / FILTER ENGINE ---
    const filterButtons = document.querySelectorAll(".filter-btn");
    const galleryItems = document.querySelectorAll(".gallery-item");

    filterButtons.forEach(button => {
        button.addEventListener("click", () => {
            filterButtons.forEach(btn => btn.classList.remove("active"));
            button.classList.add("active");

            const selector = button.getAttribute("data-filter");

            galleryItems.forEach(item => {
                const category = item.getAttribute("data-category");
                if (selector === "all" || category === selector) {
                    item.classList.remove("hidden");
                } else {
                    item.classList.add("hidden");
                }
            });
        });
    });

    // --- LIGHTBOX GALLERY MODULE ---
    const lightbox = document.getElementById("lightbox");
    const lightboxImg = document.getElementById("lightboxImg");
    const lightboxCaption = document.getElementById("lightboxCaption");
    const closeLightbox = document.getElementById("closeLightbox");
    const imageWrappers = document.querySelectorAll(".image-inner-wrapper");

    imageWrappers.forEach(wrapper => {
        wrapper.addEventListener("click", () => {
            let activeImg = null;

            // If it's a slideshow track, identify which image is currently active based on CSS visibility
            if (wrapper.classList.contains("slideshow-track")) {
                const imgs = wrapper.querySelectorAll(".portfolio-img");
                // Find the image layer that is currently fading into view (opacity > 0)
                activeImg = Array.from(imgs).find(img => {
                    const opacity = window.getComputedStyle(img).opacity;
                    return parseFloat(opacity) > 0;
                }) || imgs[0]; // Fallback to first if layout is hidden or unrendered
            } else {
                // Standard portfolio items fallback
                activeImg = wrapper.querySelector(".portfolio-img");
            }

            const title = wrapper.querySelector(".overlay-details h3")?.textContent || "";
            const category = wrapper.querySelector(".overlay-details p")?.textContent || "";

            if(activeImg && lightbox && lightboxImg) {
                lightboxImg.src = activeImg.src;
                if(lightboxCaption) {
                    lightboxCaption.innerHTML = `<strong>${title}</strong> — ${category}`;
                }
                lightbox.classList.add("active");
                document.body.style.overflow = "hidden";
            }
        });
    });

    if (closeLightbox && lightbox) {
        const exitLightbox = () => {
            lightbox.classList.remove("active");
            if (mobileNav && !mobileNav.classList.contains("open")) {
                document.body.style.overflow = "";
            }
        };
        closeLightbox.addEventListener("click", exitLightbox);
        lightbox.addEventListener("click", (e) => {
            if (e.target === lightbox) exitLightbox();
        });
    }

    // --- DSLR BACK TO TOP PROGRESS METERS ---
    const scrollTopBtn = document.getElementById("scrollToTopBtn");
    const progressCircle = document.getElementById("scrollProgressCircle");
    
    if (progressCircle) {
        const radius = progressCircle.r.baseVal.value;
        const circumference = 2 * Math.PI * radius;
        
        progressCircle.style.strokeDasharray = `${circumference} ${circumference}`;
        progressCircle.style.strokeDashoffset = circumference;

        function updateScrollProgress() {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            
            if (docHeight > 0) {
                const progress = scrollTop / docHeight;
                const offset = circumference - (progress * circumference);
                progressCircle.style.strokeDashoffset = offset;
            }

            if (scrollTopBtn) {
                if (scrollTop > 500) {
                    scrollTopBtn.classList.add("reveal");
                } else {
                    scrollTopBtn.classList.remove("reveal");
                }
            }
        }

        window.addEventListener("scroll", updateScrollProgress, { passive: true });
        
        if (scrollTopBtn) {
            scrollTopBtn.addEventListener("click", () => {
                window.scrollTo({ top: 0, behavior: "smooth" });
            });
        }
    }
});

const carouselImage = document.getElementById('carouselImage');
const prevButton = document.getElementById('carouselPrev');
const nextButton = document.getElementById('carouselNext');
const indicatorsContainer = document.getElementById('carouselIndicators');
const captureOverlay = document.getElementById('captureOverlay');

const slides = [
    { src: 'img1.jpg' },
    { src: 'img5.jpg' },
    { src: 'img9.jpg' },
    { src: 'img13.jpg' },
    { src: 'img17.jpg' }
];

let currentSlide = 0;
let autoAdvanceTimer = null;

const isCarouselPage = Boolean(carouselImage && prevButton && nextButton && indicatorsContainer && captureOverlay);

function setSlide(index) {
    const slide = slides[(index + slides.length) % slides.length];
    currentSlide = (index + slides.length) % slides.length;

    if (!carouselImage) return;
    const nextImage = new Image();
    nextImage.src = slide.src;
    nextImage.onload = () => {
        carouselImage.classList.add('fade-out');
        setTimeout(() => {
            carouselImage.src = slide.src;
            carouselImage.alt = slide.title || 'Collection photo';
            carouselImage.classList.remove('fade-out');
            carouselImage.classList.add('fade-in');
            setTimeout(() => carouselImage.classList.remove('fade-in'), 450);
        }, 200);
    };

    updateIndicators();
    triggerCaptureEffect();
}

function createIndicator(index) {
    if (!indicatorsContainer) return null;
    const indicator = document.createElement('button');
    indicator.className = 'carousel-indicator';
    indicator.type = 'button';
    indicator.dataset.index = index;
    indicator.setAttribute('aria-label', `Go to slide ${index + 1}`);
    indicator.addEventListener('click', () => {
        setSlide(index);
        resetAutoAdvance();
    });
    indicatorsContainer.appendChild(indicator);
    return indicator;
}

function updateIndicators() {
    if (!indicatorsContainer) return;
    indicatorsContainer.innerHTML = '';
    slides.forEach((_, index) => {
        const indicator = createIndicator(index);
        if (indicator && index === currentSlide) indicator.classList.add('active');
    });
}

function triggerCaptureEffect() {
    if (!captureOverlay) return;
    captureOverlay.classList.add('active');
    setTimeout(() => captureOverlay.classList.remove('active'), 800);
}

function resetAutoAdvance() {
    if (!isCarouselPage) return;
    if (autoAdvanceTimer) clearInterval(autoAdvanceTimer);
    autoAdvanceTimer = setInterval(() => setSlide(currentSlide + 1), 5800);
}

if (isCarouselPage) {
    prevButton.addEventListener('click', () => {
        setSlide(currentSlide - 1);
        resetAutoAdvance();
    });
    nextButton.addEventListener('click', () => {
        setSlide(currentSlide + 1);
        resetAutoAdvance();
    });

    slides.forEach((_, idx) => createIndicator(idx));
    setSlide(0);
    resetAutoAdvance();
}

// --- PLACE GALLERY MODAL ---
const placeModal = document.getElementById('placeModal');
const placeModalClose = document.getElementById('placeModalClose');
const placeModalTitle = document.getElementById('placeModalTitle');
const placeModalCopy = document.getElementById('placeModalCopy');
const placePhotoGrid = document.getElementById('placePhotoGrid');
const placeCards = document.querySelectorAll('.place-card');

const placeCollections = {
    chennai: {
        title: 'Chennai Streets',
        description: 'A filmic portrait of city streets, quiet alleys, and raw human moments.',
        photos: ['img1.jpg','img2.jpg','img3.jpg','img4.jpg','img11.jpg','img12.jpg']
    },
    coastal: {
        title: 'Coastal Journey',
        description: 'Slow waves, warm light and intimate travel frames from the coastline.',
        photos: ['img5.jpg','img6.jpg','img7.jpg','img8.jpg','img19.jpg']
    },
    nightlife: {
        title: 'Night Life',
        description: 'Soft neon, motion blur, and quiet scenes from the city after dark.',
        photos: ['img9.jpg','img10.jpg','img14.jpg','img15.jpg','img16.jpg']
    },
    urban: {
        title: 'Urban Portraits',
        description: 'Architectural rhythm and candid people shots across bustling neighborhoods.',
        photos: ['img13.jpg','img17.jpg','img18.jpg','img20.jpg']
    },
    documentary: {
        title: 'Documentary Frames',
        description: 'A poetic record of everyday life captured with cinematic clarity.',
        photos: ['img21.jpg','img22.jpg','img14.jpg','img15.jpg']
    }
};

function openPlaceModal(placeKey) {
    const collection = placeCollections[placeKey];
    if (!collection || !placeModal || !placePhotoGrid || !placeModalTitle || !placeModalCopy) return;

    placeModalTitle.textContent = collection.title;
    placeModalCopy.textContent = collection.description;
    placePhotoGrid.innerHTML = '';

    collection.photos.forEach(src => {
        const img = document.createElement('img');
        img.src = src;
        img.alt = collection.title;
        img.loading = 'lazy';
        placePhotoGrid.appendChild(img);
    });

    placeModal.classList.add('active');
    placeModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
}

function closePlaceModal() {
    if (!placeModal) return;
    placeModal.classList.remove('active');
    placeModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
}

placeCards.forEach(card => {
    card.addEventListener('click', () => {
        openPlaceModal(card.dataset.place);
    });
});

placeModalClose?.addEventListener('click', closePlaceModal);
placeModal?.addEventListener('click', (event) => {
    if (event.target === placeModal) closePlaceModal();
});
