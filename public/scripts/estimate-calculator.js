document.addEventListener('DOMContentLoaded', function() {
    // Constants and Variables
    const PRICE_PER_LINEAR_FOOT = {
        '5inch': 8.50,
        '6inch': 9.50
    };
    const STORY_MULTIPLIER = {
        '1': 1,
        '2': 1.3,
        '3': 1.6
    };
    const GUARD_PRICES = {
        'none': 0,
        'standard': 4.50,
        'premium': 6.50
    };

    // Show/Hide Calculator
    const showCalculatorBtn = document.getElementById('showCalculator');
    const estimateTool = document.getElementById('estimateTool');
    
    showCalculatorBtn.addEventListener('click', function() {
        estimateTool.style.display = 'block';
        showCalculatorBtn.style.display = 'none';
    });

    // Form elements
    const contactStep = document.getElementById('contactStep');
    const calculatorStep = document.getElementById('calculatorStep');
    const resultsStep = document.getElementById('resultsStep');
    const contactNextBtn = document.getElementById('contactNextBtn');
    const calculateBtn = document.getElementById('calculateBtn');

    // Contact form elements
    const quoteFullName = document.getElementById('quoteFullName');
    const quoteEmail = document.getElementById('quoteEmail');
    const quotePhone = document.getElementById('quotePhone');
    const quoteAddress = document.getElementById('quoteAddress');

    // Calculator form elements
    const linearFeet = document.getElementById('linearFeet');
    const gutterSize = document.getElementById('gutterSize');
    const stories = document.getElementById('stories');
    const guards = document.getElementById('guards');

    function validateContact() {
        if (!quoteFullName.value.trim() || 
            !quoteEmail.value.trim() || 
            !quotePhone.value.trim() || 
            !quoteAddress.value.trim()) {
            alert('Please fill in all contact fields');
            return false;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(quoteEmail.value.trim())) {
            alert('Please enter a valid email address');
            return false;
        }

        // Phone validation (accept various formats)
        const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4}$/;
        if (!phoneRegex.test(quotePhone.value.replace(/\s/g, ''))) {
            alert('Please enter a valid phone number');
            return false;
        }

        return true;
    }

    function validateCalculator() {
        if (!linearFeet.value || 
            !gutterSize.value || 
            !stories.value || 
            !guards.value) {
            alert('Please fill in all measurement fields');
            return false;
        }

        if (isNaN(linearFeet.value) || linearFeet.value <= 0) {
            alert('Please enter a valid number of linear feet');
            return false;
        }

        return true;
    }

    function calculateTotal() {
        const feet = parseFloat(linearFeet.value);
        const size = gutterSize.value;
        const story = stories.value;
        const guard = guards.value;

        const basePrice = PRICE_PER_LINEAR_FOOT[size] * feet;
        const storyAdjusted = basePrice * STORY_MULTIPLIER[story];
        const guardPrice = GUARD_PRICES[guard] * feet;
        
        return Math.round((storyAdjusted + guardPrice) * 100) / 100;
    }

    function showQuoteResult() {
        const total = calculateTotal();
        const quoteDetails = document.querySelector('.quote-details');
        
        quoteDetails.innerHTML = `
            <div class="quote-item">
                <span>Linear Feet:</span>
                <span>${linearFeet.value} ft</span>
            </div>
            <div class="quote-item">
                <span>Gutter Size:</span>
                <span>${gutterSize.value === '5inch' ? '5-inch' : '6-inch'}</span>
            </div>
            <div class="quote-item">
                <span>Stories:</span>
                <span>${stories.value}</span>
            </div>
            <div class="quote-item">
                <span>Guards:</span>
                <span>${guards.value === 'none' ? 'No Guards' : 
                       guards.value === 'standard' ? 'Standard Guards' : 'Premium Guards'}</span>
            </div>
            <div class="quote-item total">
                <span>Estimated Total:</span>
                <span>$${total.toFixed(2)}</span>
            </div>
        `;
    }

    // Event Listeners
    contactNextBtn.addEventListener('click', function(e) {
        e.preventDefault();
        if (validateContact()) {
            contactStep.style.display = 'none';
            calculatorStep.style.display = 'block';
        }
    });

    calculateBtn.addEventListener('click', function(e) {
        e.preventDefault();
        if (validateCalculator()) {
            calculatorStep.style.display = 'none';
            resultsStep.style.display = 'block';
            showQuoteResult();

            // Prepare form data for submission
            const formData = {
                name: quoteFullName.value.trim(),
                email: quoteEmail.value.trim(),
                phone: quotePhone.value.trim(),
                address: quoteAddress.value.trim(),
                linearFeet: linearFeet.value,
                gutterSize: gutterSize.value,
                stories: stories.value,
                guards: guards.value,
                total: calculateTotal()
            };

            // Send to HubSpot if available
            if (typeof sendToHubSpot === 'function') {
                sendToHubSpot(formData);
            }

            // Send email via FormSubmit
            submitFormToFormSubmit(formData);
        }
    });
});

function submitFormToFormSubmit(formData) {
    const emailTemplate = `
        New Quote Request from Website

        Customer Information:
        Name: ${formData.name}
        Email: ${formData.email}
        Phone: ${formData.phone}
        Address: ${formData.address}

        Quote Details:
        Linear Feet: ${formData.linearFeet}
        Gutter Size: ${formData.gutterSize === '5inch' ? '5-inch' : '6-inch'}
        Stories: ${formData.stories}
        Guards: ${formData.guards === 'none' ? 'No Guards' : 
                formData.guards === 'standard' ? 'Standard Guards' : 'Premium Guards'}
        Total: $${formData.total.toFixed(2)}
    `;

    // Create a hidden form for FormSubmit
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = 'https://formsubmit.co/mocitygutters@gmail.com';

    // Add email content
    const emailInput = document.createElement('input');
    emailInput.type = 'hidden';
    emailInput.name = 'email';
    emailInput.value = formData.email;
    form.appendChild(emailInput);

    // Add message content
    const messageInput = document.createElement('input');
    messageInput.type = 'hidden';
    messageInput.name = 'message';
    messageInput.value = emailTemplate;
    form.appendChild(messageInput);

    // Add name
    const nameInput = document.createElement('input');
    nameInput.type = 'hidden';
    nameInput.name = 'name';
    nameInput.value = formData.name;
    form.appendChild(nameInput);

    // Add to document, submit, and remove
    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);

    return new Promise(resolve => {
        // FormSubmit will handle the redirect, but we'll resolve the promise
        // immediately since we can't actually track the submission
        resolve();
    });
}
