document.addEventListener('DOMContentLoaded', () => {
    // Get navigation elements
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    const nav = document.querySelector('nav');

    // Mobile menu toggle
    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', (e) => {
            e.preventDefault();
            mobileMenuBtn.classList.toggle('active');
            navLinks.classList.toggle('active');
            document.body.classList.toggle('menu-open');
        });
    }

    // Navigation click handling
    if (nav) {
        nav.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            if (!link) return;

            const href = link.getAttribute('href');
            if (!href) return;

            // Allow external links to work normally
            if (href.startsWith('http')) {
                e.preventDefault();
                window.location.href = href;
                return;
            }

            // Handle internal anchor links
            if (href.startsWith('#')) {
                e.preventDefault();
                const section = document.querySelector(href);
                if (section) {
                    section.scrollIntoView({ behavior: 'smooth' });
                    // Close mobile menu if open
                    if (mobileMenuBtn && navLinks && navLinks.classList.contains('active')) {
                        mobileMenuBtn.classList.remove('active');
                        navLinks.classList.remove('active');
                        document.body.classList.remove('menu-open');
                    }
                }
            }
        });
    }
});
