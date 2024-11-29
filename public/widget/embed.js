class MoCityGuttersEstimate {
    constructor(containerId, options = {}) {
        this.containerId = containerId;
        this.options = {
            width: options.width || '100%',
            height: options.height || '800px',
            onSubmit: options.onSubmit || this.defaultSubmitHandler,
            ...options
        };
        this.init();
    }

    init() {
        const container = document.getElementById(this.containerId);
        if (!container) {
            console.error(`Container with ID "${this.containerId}" not found`);
            return;
        }

        // Create iframe with local development URL
        const iframe = document.createElement('iframe');
        const baseUrl = window.location.hostname === 'localhost' ? 
            `http://localhost:3000` : 
            'https://your-production-domain.com';
        
        iframe.src = `${baseUrl}/widget/estimate-widget.html`;
        iframe.style.width = this.options.width;
        iframe.style.height = this.options.height;
        iframe.style.border = 'none';
        iframe.style.borderRadius = '10px';
        iframe.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';

        container.appendChild(iframe);

        // Listen for messages from the iframe
        window.addEventListener('message', (event) => {
            // In production, verify origin
            if (event.data.type === 'ESTIMATE_SUBMITTED') {
                this.options.onSubmit(event.data.data);
            }
        });
    }

    defaultSubmitHandler(data) {
        console.log('Estimate submitted:', data);
    }
}

// Example usage:
/*
const estimateTool = new MoCityGuttersEstimate('estimate-container', {
    width: '100%',
    height: '800px',
    onSubmit: function(data) {
        // Handle the submitted estimate data
        console.log('Estimate received:', data);
    }
});
*/
