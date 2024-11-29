// Testimonial data
const testimonials = [
    {
        name: "Sarah Johnson",
        location: "Missouri City, TX",
        text: "Mo City Gutters did an amazing job installing new gutters on our home. The team was professional, efficient, and the quality of work is outstanding. Highly recommend!",
        rating: 5
    },
    {
        name: "Michael Rodriguez",
        location: "Sugar Land, TX",
        text: "I've used Mo City Gutters twice now - once for installation and recently for maintenance. Both times they exceeded my expectations. Fair pricing and excellent service.",
        rating: 5
    },
    {
        name: "Jennifer Williams",
        location: "Stafford, TX",
        text: "The team at Mo City Gutters was fantastic! They helped us choose the right gutters for our home and the installation was quick and clean. Great experience overall.",
        rating: 5
    },
    {
        name: "David Chen",
        location: "Missouri City, TX",
        text: "Professional service from start to finish. They were on time, courteous, and did excellent work. Our new gutters look great and work perfectly.",
        rating: 5
    }
];

// Initialize testimonials slider
function initTestimonials() {
    const sliderContainer = document.querySelector('.testimonials-slider');
    const navigationContainer = document.querySelector('.testimonial-navigation');
    
    // Clear existing content
    sliderContainer.innerHTML = '';
    navigationContainer.innerHTML = '';

    // Create testimonial cards
    testimonials.forEach((testimonial, index) => {
        // Create testimonial card
        const card = document.createElement('div');
        card.className = `testimonial-card${index === 0 ? ' active' : ''}`;
        card.innerHTML = `
            <div class="testimonial-content">
                <div class="stars">
                    ${'★'.repeat(testimonial.rating)}${'☆'.repeat(5 - testimonial.rating)}
                </div>
                <p class="testimonial-text">${testimonial.text}</p>
                <div class="testimonial-author">
                    <strong>${testimonial.name}</strong>
                    <span>${testimonial.location}</span>
                </div>
            </div>
        `;
        sliderContainer.appendChild(card);

        // Create navigation dot
        const dot = document.createElement('button');
        dot.className = `nav-dot${index === 0 ? ' active' : ''}`;
        dot.setAttribute('data-index', index);
        dot.addEventListener('click', () => showTestimonial(index));
        navigationContainer.appendChild(dot);
    });

    // Start auto-rotation
    startAutoRotation();
}

let currentTestimonial = 0;
let autoRotateInterval;

function showTestimonial(index) {
    // Update cards
    const cards = document.querySelectorAll('.testimonial-card');
    cards.forEach(card => card.classList.remove('active'));
    cards[index].classList.add('active');

    // Update navigation dots
    const dots = document.querySelectorAll('.nav-dot');
    dots.forEach(dot => dot.classList.remove('active'));
    dots[index].classList.add('active');

    currentTestimonial = index;
}

function startAutoRotation() {
    // Clear existing interval if any
    if (autoRotateInterval) {
        clearInterval(autoRotateInterval);
    }

    // Set new interval
    autoRotateInterval = setInterval(() => {
        const nextIndex = (currentTestimonial + 1) % testimonials.length;
        showTestimonial(nextIndex);
    }, 5000); // Rotate every 5 seconds
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initTestimonials);
