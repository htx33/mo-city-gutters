// Smooth scrolling for navigation
document.querySelectorAll('nav a').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const section = document.querySelector(this.getAttribute('href'));
        section.scrollIntoView({ behavior: 'smooth' });
    });
});

// Form submission handling
document.querySelector('.contact-form').addEventListener('submit', function(e) {
    e.preventDefault();
    // Here you would typically send the form data to your server
    alert('Thank you for your message! We will get back to you soon.');
    this.reset();
});

// Responsive navigation for mobile
const nav = document.querySelector('nav ul');
const logo = document.querySelector('.logo');

// Add scroll effect to navigation
window.addEventListener('scroll', () => {
    const header = document.querySelector('header');
    header.classList.toggle('scrolled', window.scrollY > 0);
});

// Image lazy loading
document.addEventListener('DOMContentLoaded', function() {
    const images = document.querySelectorAll('img');
    const imageOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px 50px 0px"
    };

    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.src; // This will load the image
                observer.unobserve(img);
            }
        });
    }, imageOptions);

    images.forEach(img => imageObserver.observe(img));
});

// Before & After Slider functionality
document.addEventListener('DOMContentLoaded', function() {
    const slider = document.querySelector('.comparison-slider');
    const beforeImage = document.querySelector('.before-image');
    const sliderHandle = document.querySelector('.slider-handle');
    let isResizing = false;

    function handleResize(e) {
        if (!isResizing) return;

        const sliderRect = slider.getBoundingClientRect();
        const position = (e.pageX - sliderRect.left) / sliderRect.width;

        // Constrain position between 0 and 1
        const clampedPosition = Math.max(0, Math.min(1, position));
        
        // Update clip path and slider position
        beforeImage.style.clipPath = `polygon(0 0, ${clampedPosition * 100}% 0, ${clampedPosition * 100}% 100%, 0 100%)`;
        sliderHandle.style.left = `${clampedPosition * 100}%`;
    }

    sliderHandle.addEventListener('mousedown', () => {
        isResizing = true;
        document.body.style.cursor = 'ew-resize';
    });

    window.addEventListener('mousemove', handleResize);
    window.addEventListener('mouseup', () => {
        isResizing = false;
        document.body.style.cursor = 'default';
    });

    // Touch events for mobile
    sliderHandle.addEventListener('touchstart', (e) => {
        isResizing = true;
    });

    window.addEventListener('touchmove', (e) => {
        if (!isResizing) return;
        e.preventDefault();
        const touch = e.touches[0];
        const sliderRect = slider.getBoundingClientRect();
        const position = (touch.pageX - sliderRect.left) / sliderRect.width;
        
        const clampedPosition = Math.max(0, Math.min(1, position));
        beforeImage.style.clipPath = `polygon(0 0, ${clampedPosition * 100}% 0, ${clampedPosition * 100}% 100%, 0 100%)`;
        sliderHandle.style.left = `${clampedPosition * 100}%`;
    });

    window.addEventListener('touchend', () => {
        isResizing = false;
    });
});

// Bible verses array
const verses = [
    {
        text: "For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.",
        reference: "John 3:16"
    },
    {
        text: "For it is by grace you have been saved, through faith—and this is not from yourselves, it is the gift of God—not by works, so that no one can boast. For we are God's handiwork.",
        reference: "Ephesians 2:8-10"
    },
    {
        text: "But God demonstrates his own love for us in this: While we were still sinners, Christ died for us.",
        reference: "Romans 5:8"
    },
    {
        text: "Commit to the LORD whatever you do, and he will establish your plans.",
        reference: "Proverbs 16:3"
    },
    {
        text: "But seek first his kingdom and his righteousness, and all these things will be given to you as well.",
        reference: "Matthew 6:33"
    },
    {
        text: "Whatever you do, work at it with all your heart, as working for the Lord, not for human masters.",
        reference: "Colossians 3:23"
    },
    {
        text: "In their hearts humans plan their course, but the LORD establishes their steps.",
        reference: "Proverbs 16:9"
    },
    {
        text: "Trust in the LORD with all your heart and lean not on your own understanding.",
        reference: "Proverbs 3:5"
    }
];

// Function to update the verse
function updateVerse() {
    const verseDisplay = document.getElementById('verse-display');
    const currentIndex = verses.findIndex(verse => 
        verseDisplay.querySelector('.verse-text').textContent === verse.text
    );
    const nextIndex = (currentIndex + 1) % verses.length;
    
    verseDisplay.classList.add('fade');
    
    setTimeout(() => {
        verseDisplay.querySelector('.verse-text').textContent = verses[nextIndex].text;
        verseDisplay.querySelector('.verse-reference').textContent = `- ${verses[nextIndex].reference}`;
        verseDisplay.classList.remove('fade');
    }, 500);
}

// Start verse rotation
setInterval(updateVerse, 10000);

// Google Reviews Integration
async function fetchGoogleReviews() {
    // Note: This is a placeholder. You'll need to replace this with actual Google My Business API integration
    try {
        const response = await fetch('YOUR_GOOGLE_REVIEWS_ENDPOINT');
        const reviews = await response.json();
        updateTestimonials(reviews);
    } catch (error) {
        console.error('Error fetching reviews:', error);
    }
}

function updateTestimonials(reviews) {
    const slider = document.querySelector('.testimonials-slider');
    const navigation = document.querySelector('.testimonial-navigation');
    
    reviews.forEach((review, index) => {
        const card = document.createElement('div');
        card.className = 'testimonial-card';
        card.innerHTML = `
            <div class="testimonial-content">${review.text}</div>
            <div class="testimonial-author">
                <img src="${review.authorImage || 'default-avatar.png'}" alt="${review.authorName}">
                <div class="author-info">
                    <div class="author-name">${review.authorName}</div>
                    <div class="author-rating">★★★★★</div>
                </div>
            </div>
        `;
        slider.appendChild(card);
        
        const dot = document.createElement('div');
        dot.className = 'testimonial-dot' + (index === 0 ? ' active' : '');
        dot.addEventListener('click', () => showTestimonial(index));
        navigation.appendChild(dot);
    });
}

function showTestimonial(index) {
    const slider = document.querySelector('.testimonials-slider');
    slider.style.transform = `translateX(-${index * 100}%)`;
    
    document.querySelectorAll('.testimonial-dot').forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
    });
}

// Initialize HubSpot forms
function initHubSpotForms() {
    if (window.hbspt) {
        // Initialize calculator form
        window.hbspt.forms.create({
            region: "na1",
            portalId: "48384794",
            formId: "7f60e194-301c-4b67-b9f5-2a25f16aae07",
            target: "#calculator-hubspot-form"
        });

        // Initialize contact form
        window.hbspt.forms.create({
            region: "na1",
            portalId: "48384794",
            formId: "7f60e194-301c-4b67-b9f5-2a25f16aae07",
            target: "#contact-hubspot-form"
        });
    } else {
        console.error('HubSpot forms script not loaded');
    }
}

// Handle Get Quote button click
document.addEventListener('DOMContentLoaded', function() {
    const showCalculatorBtn = document.getElementById('showCalculator');
    if (showCalculatorBtn) {
        showCalculatorBtn.addEventListener('click', function() {
            const calculatorForm = document.getElementById('calculator-hubspot-form');
            if (calculatorForm) {
                calculatorForm.style.display = 'block';
                showCalculatorBtn.style.display = 'none';
            }
        });
    }
});

// Initialize HubSpot forms when the script is loaded
if (window.hbspt) {
    initHubSpotForms();
} else {
    // Wait for HubSpot script to load
    window.addEventListener('load', function() {
        setTimeout(function() {
            if (window.hbspt) {
                initHubSpotForms();
            }
        }, 1000); // Give HubSpot script time to initialize
    });
}

// Initialize mobile menu
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const mobileMenu = document.querySelector('.mobile-menu');

if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', function() {
        mobileMenu.classList.toggle('active');
    });
}

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth'
            });
            // Close mobile menu if open
            if (mobileMenu) {
                mobileMenu.classList.remove('active');
            }
        }
    });
});

// Error handling
window.onerror = function(msg, url, lineNo, columnNo, error) {
    console.log('Logged Error:', error);
    return false;
};
