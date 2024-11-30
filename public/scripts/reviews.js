// Reviews Widget
class ReviewsWidget {
    constructor() {
        this.reviews = [];
        this.currentIndex = 0;
    }

    async fetchReviews() {
        try {
            const response = await fetch('/data/reviews.json');
            const data = await response.json();
            this.reviews = data.reviews;
            this.renderReviews();
            this.setupControls();
            this.startAutoScroll();
        } catch (error) {
            console.error('Error loading reviews:', error);
        }
    }

    renderReviews() {
        const container = document.getElementById('reviews-container');
        if (!container) return;

        const reviewsHtml = this.reviews.map((review, index) => `
            <div class="review-card ${index === 0 ? 'active' : ''}" data-index="${index}">
                <div class="review-header">
                    <div class="reviewer-avatar">
                        ${review.author_name.charAt(0).toUpperCase()}
                    </div>
                    <div class="reviewer-info">
                        <div class="reviewer-name">${review.author_name}</div>
                        <div class="reviewer-meta">
                            <span class="google-text">Google</span>
                            <span class="bullet">•</span>
                            <span class="review-time">${review.time}</span>
                        </div>
                    </div>
                </div>
                <div class="rating">
                    ${this.generateStars(review.rating)}
                </div>
                <div class="review-text">${review.text}</div>
            </div>
        `).join('');

        container.innerHTML = `
            <div class="reviews-track">
                ${reviewsHtml}
            </div>
            ${this.reviews.length > 1 ? `
                <div class="review-controls">
                    <button class="review-nav prev" aria-label="Previous review">
                        <i class="fas fa-chevron-left"></i>
                    </button>
                    <div class="review-dots">
                        ${this.reviews.map((_, i) => `
                            <button class="review-dot ${i === 0 ? 'active' : ''}" data-index="${i}" aria-label="Go to review ${i + 1}"></button>
                        `).join('')}
                    </div>
                    <button class="review-nav next" aria-label="Next review">
                        <i class="fas fa-chevron-right"></i>
                    </button>
                </div>
            ` : ''}
        `;
    }

    generateStars(rating) {
        return Array(5).fill('').map((_, i) => `
            <i class="fas fa-star ${i < rating ? 'filled' : ''}"></i>
        `).join('');
    }

    setupControls() {
        const container = document.getElementById('reviews-container');
        if (!container || this.reviews.length <= 1) return;

        container.querySelector('.prev').addEventListener('click', () => this.showReview(this.currentIndex - 1));
        container.querySelector('.next').addEventListener('click', () => this.showReview(this.currentIndex + 1));

        container.querySelectorAll('.review-dot').forEach(dot => {
            dot.addEventListener('click', () => {
                this.showReview(parseInt(dot.dataset.index));
            });
        });
    }

    showReview(index) {
        const container = document.getElementById('reviews-container');
        if (!container) return;

        if (index < 0) index = this.reviews.length - 1;
        if (index >= this.reviews.length) index = 0;

        this.currentIndex = index;

        container.querySelectorAll('.review-card').forEach((card, i) => {
            card.classList.toggle('active', i === index);
        });

        container.querySelectorAll('.review-dot').forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
        });
    }

    startAutoScroll() {
        if (this.reviews.length <= 1) return;
        
        setInterval(() => {
            this.showReview(this.currentIndex + 1);
        }, 7000);
    }
}

// Initialize the widget when the document is ready
document.addEventListener('DOMContentLoaded', () => {
    const widget = new ReviewsWidget();
    widget.fetchReviews();
});
