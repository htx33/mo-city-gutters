// Main JavaScript file

// Mobile menu toggle
document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const nav = document.querySelector('nav');
    
    if (mobileMenuBtn && nav) {
        mobileMenuBtn.addEventListener('click', function() {
            nav.classList.toggle('active');
            mobileMenuBtn.classList.toggle('active');
        });
    }

    // Smooth scrolling for navigation
    document.querySelectorAll('nav a').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const section = document.querySelector(this.getAttribute('href'));
            if (section) {
                section.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // Add scroll effect to navigation
    const header = document.querySelector('header');
    if (header) {
        window.addEventListener('scroll', () => {
            header.classList.toggle('scrolled', window.scrollY > 0);
        });
    }

    // Image lazy loading
    const images = document.querySelectorAll('img[data-src]');
    const imageOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px 50px 0px"
    };

    if (images.length > 0) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    observer.unobserve(img);
                }
            });
        }, imageOptions);

        images.forEach(img => imageObserver.observe(img));
    }
});
