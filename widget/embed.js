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

        // Create iframe
        const iframe = document.createElement('iframe');
        
        // Get the current script path and use it to determine the widget path
        const scripts = document.getElementsByTagName('script');
        const currentScript = scripts[scripts.length - 1];
        const scriptPath = currentScript.src;
        const widgetPath = scriptPath.replace('embed.js', 'estimate-widget.html');
        
        iframe.src = widgetPath;
        iframe.style.width = this.options.width;
        iframe.style.height = this.options.height;
        iframe.style.border = 'none';
        iframe.style.borderRadius = '10px';
        iframe.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
        
        // Add a loading message
        container.innerHTML = '<div style="text-align: center; padding: 20px;">Loading calculator...</div>';
        
        // Handle iframe load event
        iframe.onload = () => {
            container.innerHTML = '';
            container.appendChild(iframe);
        };

        // Handle iframe error
        iframe.onerror = () => {
            console.error('Failed to load the estimate widget');
            container.innerHTML = '<div style="text-align: center; padding: 20px; color: red;">Error loading calculator. Please refresh the page.</div>';
        };

        // Listen for messages from the iframe
        window.addEventListener('message', (event) => {
            if (event.data.type === 'ESTIMATE_SUBMITTED') {
                this.options.onSubmit(event.data.data);
            }
        });
    }

    defaultSubmitHandler(data) {
        console.log('Estimate submitted:', data);
    }
}
