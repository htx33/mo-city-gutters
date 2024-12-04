document.addEventListener('DOMContentLoaded', function() {
    // Get pricing constants from config
    const PRICE_PER_LINEAR_FOOT = CONFIG.pricing.gutterSizes;
    const STORY_MULTIPLIER = CONFIG.pricing.storyMultipliers;
    const GUARD_PRICES = CONFIG.pricing.guardPrices;

    // Show/Hide Calculator
    const showCalculatorBtn = document.getElementById('showCalculator');
    const estimateTool = document.getElementById('estimateTool');
    
    if (showCalculatorBtn) {
        showCalculatorBtn.addEventListener('click', function() {
            console.log('Show calculator clicked');
            if (estimateTool) {
                estimateTool.style.display = 'block';
                showCalculatorBtn.style.display = 'none';
            }
        });
    }

    // Form elements
    const calculatorForm = document.getElementById('calculator-form');
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

    // Debug element presence
    console.log('Elements found:', {
        calculatorForm: !!calculatorForm,
        contactStep: !!contactStep,
        calculatorStep: !!calculatorStep,
        resultsStep: !!resultsStep,
        contactNextBtn: !!contactNextBtn,
        calculateBtn: !!calculateBtn
    });

    function validateContact() {
        if (!quoteFullName || !quoteEmail || !quotePhone || !quoteAddress) {
            console.error('Contact form elements not found');
            return false;
        }

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
        if (!linearFeet || !gutterSize || !stories || !guards) {
            console.error('Calculator form elements not found');
            return false;
        }

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
        
        if (!quoteDetails) {
            console.error('Quote details element not found');
            return;
        }

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

    // Prevent form submission
    if (calculatorForm) {
        calculatorForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('Form submission prevented');
        });
    }

    // Event Listeners
    if (contactNextBtn) {
        contactNextBtn.addEventListener('click', function() {
            console.log('Next button clicked');
            if (validateContact()) {
                console.log('Contact validation passed');
                if (contactStep && calculatorStep) {
                    contactStep.style.display = 'none';
                    calculatorStep.style.display = 'block';
                } else {
                    console.error('Step elements not found');
                }
            }
        });
    }

    if (calculateBtn) {
        calculateBtn.addEventListener('click', function() {
            console.log('Calculate button clicked');
            if (validateCalculator()) {
                console.log('Calculator validation passed');
                if (calculatorStep && resultsStep) {
                    calculatorStep.style.display = 'none';
                    resultsStep.style.display = 'block';
                    showQuoteResult();
                } else {
                    console.error('Step elements not found');
                }

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

                // Send to HubSpot if enabled
                if (CONFIG.hubspot.enabled && typeof sendToHubSpot === 'function') {
                    sendToHubSpot(formData);
                }

                // Send email via FormSubmit
                submitFormToFormSubmit(formData);
            }
        });
    }
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
    form.action = CONFIG.email.formSubmitEndpoint;

    // Add email content
    const emailInput = document.createElement('input');
    emailInput.type = 'hidden';
    emailInput.name = 'email';
    emailInput.value = formData.email;
    form.appendChild(emailInput);

    const messageInput = document.createElement('input');
    messageInput.type = 'hidden';
    messageInput.name = 'message';
    messageInput.value = emailTemplate;
    form.appendChild(messageInput);

    // Submit the form
    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
}
