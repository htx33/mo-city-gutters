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

// Rate limiting variables
let lastSubmissionTime = 0;
const SUBMISSION_COOLDOWN = 30000; // 30 seconds

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded');

    // Get navigation elements
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    const nav = document.querySelector('nav');

    // Debug log to check if elements are found
    console.log('Elements found:', {
        mobileMenuBtn: !!mobileMenuBtn,
        navLinks: !!navLinks,
        nav: !!nav
    });

    // Mobile menu toggle
    if (mobileMenuBtn && navLinks) {
        console.log('Setting up mobile menu');
        mobileMenuBtn.addEventListener('click', (e) => {
            e.preventDefault();
            mobileMenuBtn.classList.toggle('active');
            navLinks.classList.toggle('active');
            document.body.classList.toggle('menu-open');
        });
    }

    // Navigation click handling
    if (nav) {
        console.log('Setting up navigation clicks');
        nav.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            if (!link) return;

            const href = link.getAttribute('href');
            if (!href) return;

            console.log('Link clicked:', href);

            // Handle internal anchor links
            if (href.startsWith('#')) {
                e.preventDefault();
                const section = document.querySelector(href);
                if (section && typeof section.scrollIntoView === 'function') {
                    console.log(`Scrolling to section: ${href}`);
                    section.scrollIntoView({ behavior: 'smooth' });
                    // Close mobile menu if open
                    if (mobileMenuBtn && navLinks && navLinks.classList.contains('active')) {
                        console.log('Closing mobile menu after navigation');
                        mobileMenuBtn.classList.remove('active');
                        navLinks.classList.remove('active');
                        document.body.classList.remove('menu-open');
                    }
                } else {
                    console.error(`Section ${href} not found or scrollIntoView not supported`, {
                        elementExists: !!section,
                        scrollSupported: typeof section?.scrollIntoView === 'function'
                    });
                }
            }
        });
    }

    // Form submission handling
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const now = Date.now();
            if (now - lastSubmissionTime < SUBMISSION_COOLDOWN) {
                alert('Please wait a moment before submitting another message.');
                return false;
            }
            lastSubmissionTime = now;
            validateForm(event);
        });
    }

    // Responsive navigation for mobile
    const header = document.querySelector('header');
    if (header) {
        window.addEventListener('scroll', () => {
            header.classList.toggle('scrolled', window.scrollY > 0);
        });
    }

    // Image lazy loading
    const images = document.querySelectorAll('img');
    if (images.length > 0) {
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
    }

    // Before & After Slider functionality
    const slider = document.querySelector('.comparison-slider');
    if (slider) {
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
    }

    // Function to update the verse
    function updateVerse() {
        const verseDisplay = document.getElementById('verse-display');
        if (verseDisplay) {
            const currentIndex = verses.findIndex(verse => 
                verseDisplay.querySelector('.verse-text').textContent === verse.text
            );
            const nextIndex = (currentIndex + 1) % verses.length;
            const nextVerse = verses[nextIndex];

            verseDisplay.querySelector('.verse-text').textContent = nextVerse.text;
            verseDisplay.querySelector('.verse-reference').textContent = nextVerse.reference;
        }
    }

    // Start verse rotation
    setInterval(updateVerse, 10000);

    // Error logging setup
    window.onerror = function(msg, url, lineNo, columnNo, error) {
        const errorLog = {
            message: msg,
            url: url,
            line: lineNo,
            column: columnNo,
            error: error ? error.stack : 'No error stack available',
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent
        };
        console.error('Logged Error:', errorLog);
        return false; // Prevents the default error handling
    };

    // Initialize features
    if (typeof fetchGoogleReviews === 'function') {
        fetchGoogleReviews();
    }
});

// Security Configuration
const securityConfig = {
    maxAttempts: 5,
    cooldownPeriod: 30000,
    maxMessageLength: 1000,
    bannedIPs: new Set(),
    recaptchaSiteKey: 'YOUR_KEY_HERE'
};

// CSRF Token Generation
function generateCSRFToken() {
    const token = crypto.randomUUID();
    document.cookie = `csrf_token=${token}; SameSite=Strict; Secure`;
    return token;
}

// External function declarations
function validateForm(event) {
    event.preventDefault();

    // Check reCAPTCHA
    if (!window.recaptchaToken) {
        alert('Please complete the reCAPTCHA verification.');
        return false;
    }

    // Get form elements
    const form = document.getElementById('contactForm');
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    const messageInput = document.getElementById('message');
    const honeypotInput = document.getElementById('honeypot');
    const submitBtn = document.getElementById('submitBtn');

    if (form && nameInput && emailInput && phoneInput && messageInput && honeypotInput && submitBtn) {
        // Enhanced security checks
        if (!checkRateLimit() || !checkMessageLength(messageInput.value)) {
            return false;
        }

        // Honeypot check
        if (honeypotInput.value !== '') {
            console.log('Potential spam detected');
            incrementAttempts();
            return false;
        }

        // CSRF check
        if (!validateCSRFToken()) {
            console.error('Invalid security token');
            return false;
        }

        // Enhanced input sanitization
        const formData = sanitizeFormData({
            name: nameInput.value,
            email: emailInput.value,
            phone: phoneInput.value,
            message: messageInput.value,
            recaptchaToken: window.recaptchaToken
        });

        // Submit button protection
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending...';

        // Simulated secure submission
        submitSecurely(formData)
            .then(() => {
                form.reset();
                grecaptcha.reset();
                window.recaptchaToken = null;
                generateNewCSRFToken();
                showSuccess();
            })
            .catch(error => {
                console.error('Submission error:', error);
                showError();
            })
            .finally(() => {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Send Message';
            });

        return false;
    }
}

function checkRateLimit() {
    const clientIP = 'client-ip'; // In real implementation, this would be server-side
    const attempts = securityConfig.attempts.get(clientIP) || 0;
    
    if (securityConfig.bannedIPs.has(clientIP)) {
        console.error('IP is temporarily banned');
        return false;
    }

    if (attempts >= securityConfig.maxAttempts) {
        securityConfig.bannedIPs.add(clientIP);
        setTimeout(() => securityConfig.bannedIPs.delete(clientIP), 3600000); // 1 hour ban
        return false;
    }

    return true;
}

function incrementAttempts() {
    const clientIP = 'client-ip';
    const attempts = (securityConfig.attempts.get(clientIP) || 0) + 1;
    securityConfig.attempts.set(clientIP, attempts);
}

function checkMessageLength(message) {
    if (message.length > securityConfig.maxMessageLength) {
        alert('Message is too long. Please keep it under 1000 characters.');
        return false;
    }
    return true;
}

function sanitizeFormData(data) {
    const sanitized = {};
    for (let [key, value] of Object.entries(data)) {
        // Remove HTML tags and trim
        sanitized[key] = value.toString()
            .replace(/<[^>]*>/g, '')
            .replace(/[^\w\s@.-]/gi, '')
            .trim();
    }
    return sanitized;
}

function validateCSRFToken() {
    const formToken = document.getElementById('csrf_token').value;
    const storedToken = sessionStorage.getItem('csrf_token');
    return formToken === storedToken;
}

function generateNewCSRFToken() {
    const newToken = generateCSRFToken();
    document.getElementById('csrf_token').value = newToken;
    sessionStorage.setItem('csrf_token', newToken);
}

async function submitSecurely(formData) {
    // In a real implementation, this would be an encrypted HTTPS POST request
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log('Secure form submission:', formData);
            resolve();
        }, 1000);
    });
}

function showSuccess() {
    alert('Thank you for your message! We will get back to you soon.');
}

function showError() {
    alert('There was an error submitting your message. Please try again later.');
}

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
    
    if (slider && navigation) {
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
}

function showTestimonial(index) {
    const slider = document.querySelector('.testimonials-slider');
    if (slider) {
        slider.style.transform = `translateX(-${index * 100}%)`;
        
        document.querySelectorAll('.testimonial-dot').forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
        });
    }
}
