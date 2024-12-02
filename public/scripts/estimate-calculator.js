// Pricing configuration
const PRICING = {
    gutters: {
        '5inch': 9.2,  // $9.20 per foot
        '6inch': 11    // $11.00 per foot
    },
    guards: {
        'none': 0,
        'standard': 8,    // $8 per foot
        'premium': 14     // $14 per foot
    },
    storyMultiplier: {
        '1': 1,
        '2': 1.3,  // 30% increase
        '3': 1.6   // 60% increase
    }
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

    // Contact form fields
    const quoteFullName = document.getElementById('quoteFullName');
    const quoteEmail = document.getElementById('quoteEmail');
    const quotePhone = document.getElementById('quotePhone');
    const quoteAddress = document.getElementById('quoteAddress');

    // Calculator fields
    const linearFeet = document.getElementById('linearFeet');
    const gutterSize = document.getElementById('gutterSize');
    const stories = document.getElementById('stories');
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
            
            // Send quote details to email
            const formData = {
                name: quoteFullName.value,
                email: quoteEmail.value,
                phone: quotePhone.value,
                address: quoteAddress.value,
                quote: document.querySelector('.quote-details').textContent,
                details: {
                    linearFeet: linearFeet.value,
                    gutterSize: gutterSize.value,
                    stories: stories.value,
                    guards: guards.value
                }
            };
            sendQuoteToEmail(formData);
        }
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
        const feet = parseFloat(linearFeet.value);
        const size = gutterSize.value;
        const numStories = stories.value;
        const guardType = guards.value;
        
        // Calculate base gutter cost
        let basePrice = feet * PRICING.gutters[size];
        
        // Apply story multiplier
        basePrice *= PRICING.storyMultiplier[numStories];
        
        // Add gutter guards if selected
        if (guardType !== 'none') {
            basePrice += feet * PRICING.guards[guardType];
        }

        return Math.round(basePrice); // Round to nearest dollar
    }

    function displayQuote(amount) {
        const quoteDetails = document.querySelector('.quote-details');
        const formattedAmount = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);

        const gutterSizeText = gutterSize.value === '5inch' ? '5-inch' : '6-inch';
        const guardText = guards.value === 'none' ? 'No guards' : 
                         guards.value === 'standard' ? 'Standard guards' : 'Premium guards';

        let details = `
            <h4>Estimated Project Cost: ${formattedAmount}</h4>
            <p>Based on:</p>
            <ul style="list-style: none; padding: 0;">
                <li>${linearFeet.value} linear feet of ${gutterSizeText} gutters</li>
                <li>${stories.value} story building</li>
                <li>${guardText}</li>
            </ul>
            <p class="quote-note">* Price includes materials and professional installation</p>
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
                Gutter Size: ${formData.details.gutterSize === '5inch' ? '5-inch' : '6-inch'}
                Stories: ${formData.details.stories}
                Guards: ${formData.details.guards === 'none' ? 'No guards' : 
                         formData.details.guards === 'standard' ? 'Standard guards' : 'Premium guards'}
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
