// Pricing configuration
const PRICING = {
    gutterTypes: {
        standard: 9.12,    // Price per linear foot for 5-inch K-Style
        premium: 12.00     // Price per linear foot for 6-inch K-Style
    },
    downspout: {
        1: 85.00,         // Price per downspout for single story
        2: 125.00         // Price per downspout for two story
    },
    guards: {
        standard: 10.00,   // Price per linear foot for 5-inch guards
        premium: 15.00     // Price per linear foot for 6-inch guards
    },
    additionalServices: {
        cleaning: 2.00     // Price per linear foot for cleaning
    },
    minimumQuote: 300.00  // Minimum quote amount
};

document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const showCalculatorBtn = document.getElementById('showCalculator');
    const estimateTool = document.getElementById('estimateTool');
    const contactStep = document.getElementById('contactStep');
    const calculatorStep = document.getElementById('calculatorStep');
    const resultsStep = document.getElementById('resultsStep');
    const contactNextBtn = document.getElementById('contactNextBtn');
    const calculateBtn = document.getElementById('calculateBtn');
    const scheduleBtn = document.getElementById('scheduleBtn');

    // Contact form fields
    const quoteFullName = document.getElementById('quoteFullName');
    const quoteEmail = document.getElementById('quoteEmail');
    const quotePhone = document.getElementById('quotePhone');
    const quoteAddress = document.getElementById('quoteAddress');

    // Calculator fields
    const linearFeet = document.getElementById('linearFeet');
    const stories = document.getElementById('stories');
    const material = document.getElementById('material');
    const guards = document.getElementById('guards');

    // Show calculator
    showCalculatorBtn.addEventListener('click', function() {
        estimateTool.style.display = 'block';
        contactStep.style.display = 'block';
    });

    // Handle contact form submission
    contactNextBtn.addEventListener('click', function() {
        if (validateContactInfo()) {
            contactStep.style.display = 'none';
            calculatorStep.style.display = 'block';
        }
    });

    // Handle calculation
    calculateBtn.addEventListener('click', function() {
        if (validateCalculatorInputs()) {
            const quote = calculateQuote();
            displayQuote(quote);
            calculatorStep.style.display = 'none';
            resultsStep.style.display = 'block';
        }
    });

    // Handle schedule button
    scheduleBtn.addEventListener('click', function() {
        const formData = {
            name: quoteFullName.value,
            email: quoteEmail.value,
            phone: quotePhone.value,
            address: quoteAddress.value,
            quote: document.querySelector('.quote-details').textContent,
            details: {
                linearFeet: linearFeet.value,
                stories: stories.value,
                material: material.value,
                guards: guards.value
            }
        };

        // Send form data to email
        sendQuoteToEmail(formData);
    });

    // Validation functions
    function validateContactInfo() {
        if (!quoteFullName.value || !quoteEmail.value || !quotePhone.value || !quoteAddress.value) {
            alert('Please fill in all contact information fields');
            return false;
        }
        if (!isValidEmail(quoteEmail.value)) {
            alert('Please enter a valid email address');
            return false;
        }
        if (!isValidPhone(quotePhone.value)) {
            alert('Please enter a valid phone number');
            return false;
        }
        return true;
    }

    function validateCalculatorInputs() {
        if (!linearFeet.value || linearFeet.value <= 0) {
            alert('Please enter valid linear feet');
            return false;
        }
        return true;
    }

    // Helper functions
    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function isValidPhone(phone) {
        return /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/.test(phone);
    }

    function calculateQuote() {
        let basePrice = linearFeet.value * 8; // $8 per linear foot base price
        
        // Adjust for stories
        if (stories.value === '2') basePrice *= 1.3;
        if (stories.value === '3') basePrice *= 1.6;
        
        // Adjust for material
        if (material.value === 'copper') basePrice *= 2.5;
        if (material.value === 'steel') basePrice *= 1.5;
        
        // Add gutter guards
        if (guards.value === 'yes') {
            basePrice += linearFeet.value * 4; // $4 per linear foot for guards
        }

        return basePrice;
    }

    function displayQuote(amount) {
        const quoteDetails = document.querySelector('.quote-details');
        const formattedAmount = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);

        let details = `
            <h4>Estimated Project Cost: ${formattedAmount}</h4>
            <p>Based on:</p>
            <ul style="list-style: none; padding: 0;">
                <li>${linearFeet.value} linear feet</li>
                <li>${stories.value} story building</li>
                <li>${material.value.charAt(0).toUpperCase() + material.value.slice(1)} gutters</li>
                ${guards.value === 'yes' ? '<li>Including gutter guards</li>' : ''}
            </ul>
        `;

        quoteDetails.innerHTML = details;
    }

    function sendQuoteToEmail(formData) {
        // Use FormSubmit to send the quote details
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = 'https://formsubmit.co/mocityclean@gmail.com';

        // Add all form fields
        const fields = {
            _subject: 'New Gutter Quote Request - Mo City Gutters',
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            address: formData.address,
            'Project Details': `
                Linear Feet: ${formData.details.linearFeet}
                Stories: ${formData.details.stories}
                Material: ${formData.details.material}
                Gutter Guards: ${formData.details.guards}
                Estimated Cost: ${formData.quote}
            `
        };

        for (const [name, value] of Object.entries(fields)) {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = name;
            input.value = value;
            form.appendChild(input);
        }

        document.body.appendChild(form);
        form.submit();
    }
});
