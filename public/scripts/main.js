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

            // Skip handling for external links and non-anchor links
            if (!href.startsWith('#')) {
                return;
            }

            // Handle internal anchor links
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
        });
    }

    // Initialize verse rotation
    let currentVerseIndex = 0;
    const verseText = document.querySelector('.verse-text');
    const verseReference = document.querySelector('.verse-reference');

    function updateVerse() {
        if (verseText && verseReference) {
            verseText.textContent = verses[currentVerseIndex].text;
            verseReference.textContent = verses[currentVerseIndex].reference;
            currentVerseIndex = (currentVerseIndex + 1) % verses.length;
        }
    }

    // Start verse rotation
    updateVerse();
    setInterval(updateVerse, 10000);
});

// Error logging setup
window.onerror = function(msg, url, lineNo, columnNo, error) {
    console.error('Error: ' + msg + '\nURL: ' + url + '\nLine: ' + lineNo + '\nColumn: ' + columnNo + '\nError object: ' + JSON.stringify(error));
    return false;
};

// Initialize features
if (typeof fetchGoogleReviews === 'function') {
    fetchGoogleReviews();
}

// CSRF Token Generation
function generateCSRFToken() {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
}

// Form validation
function validateForm(event) {
    event.preventDefault();
    
    // Get form elements
    const form = event.target;
    const nameInput = form.querySelector('input[name="name"]');
    const emailInput = form.querySelector('input[name="email"]');
    const phoneInput = form.querySelector('input[name="phone"]');
    const messageInput = form.querySelector('textarea[name="message"]');
    
    // Reset previous error states
    const errorElements = form.querySelectorAll('.error-message');
    errorElements.forEach(el => el.remove());
    
    let isValid = true;
    
    // Validate Name
    if (!nameInput.value.trim()) {
        showError(nameInput, 'Name is required');
        isValid = false;
    }
    
    // Validate Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailInput.value)) {
        showError(emailInput, 'Please enter a valid email address');
        isValid = false;
    }
    
    // Validate Phone
    const phoneRegex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
    if (!phoneRegex.test(phoneInput.value)) {
        showError(phoneInput, 'Please enter a valid phone number');
        isValid = false;
    }
    
    // Validate Message
    if (!messageInput.value.trim()) {
        showError(messageInput, 'Message is required');
        isValid = false;
    }
    
    if (isValid) {
        // Check rate limiting
        if (!checkRateLimit()) {
            showError(form.querySelector('button[type="submit"]'), 'Please wait before submitting again');
            return;
        }
        
        // Proceed with form submission
        const formData = {
            name: nameInput.value,
            email: emailInput.value,
            phone: phoneInput.value,
            message: messageInput.value,
            csrf: generateCSRFToken()
        };
        
        submitForm(formData);
    }
}

function checkRateLimit() {
    const now = Date.now();
    if (now - lastSubmissionTime < SUBMISSION_COOLDOWN) {
        return false;
    }
    lastSubmissionTime = now;
    return true;
}

function showError(element, message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    element.parentNode.insertBefore(errorDiv, element.nextSibling);
    element.classList.add('error');
}

// Google Reviews Integration
async function fetchGoogleReviews() {
    try {
        const response = await fetch('/api/reviews');
        if (!response.ok) throw new Error('Failed to fetch reviews');
        const reviews = await response.json();
        updateTestimonials(reviews);
    } catch (error) {
        console.error('Error fetching reviews:', error);
    }
}

function updateTestimonials(reviews) {
    const container = document.querySelector('.testimonials-container');
    if (!container || !reviews.length) return;

    let html = '';
    reviews.forEach((review, index) => {
        html += `
            <div class="testimonial ${index === 0 ? 'active' : ''}">
                <div class="testimonial-content">
                    <p>${review.text}</p>
                    <div class="testimonial-author">
                        <img src="${review.authorImage}" alt="${review.author}">
                        <div>
                            <h4>${review.author}</h4>
                            <div class="stars">${'★'.repeat(review.rating)}</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

function showTestimonial(index) {
    const testimonials = document.querySelectorAll('.testimonial');
    testimonials.forEach((t, i) => {
        t.classList.toggle('active', i === index);
    });
}
