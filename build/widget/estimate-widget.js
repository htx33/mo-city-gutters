// Pricing configuration
const PRICING = {
    gutterTypes: {
        standard: { base: 8.50, name: "Standard 5\" K-Style" },
        premium: { base: 12.00, name: "Premium 6\" K-Style" },
        custom: { base: 18.00, name: "Custom Box Gutters" }
    },
    storyMultiplier: {
        "1": 1.0,
        "2": 1.3,
        "3": 1.6
    },
    additionalServices: {
        cleaningService: { base: 150, name: "Professional Gutter Cleaning" },
        gutterGuards: { base: 8.00, name: "Gutter Guard Installation" }, // per linear foot
        repairService: { base: 300, name: "Fascia/Soffit Repair" }
    }
};

// Form navigation functions
function nextStep(currentStep) {
    if (validateStep(currentStep)) {
        document.getElementById(`step${currentStep}`).classList.remove('active');
        document.getElementById(`step${currentStep + 1}`).classList.add('active');
        updateProgressBar(currentStep + 1);
    }
}

function previousStep(currentStep) {
    document.getElementById(`step${currentStep}`).classList.remove('active');
    document.getElementById(`step${currentStep - 1}`).classList.add('active');
    updateProgressBar(currentStep - 1);
}

function updateProgressBar(step) {
    const progressBar = document.querySelector('.progress-bar');
    const progress = (step / 3) * 100;
    progressBar.style.width = `${progress}%`;
    progressBar.setAttribute('aria-valuenow', progress);
    progressBar.textContent = `Step ${step} of 3`;
}

// Input validation functions
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function isValidPhone(phone) {
    // Allow formats: (123) 456-7890, 123-456-7890, 1234567890
    const phoneRegex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
    return phoneRegex.test(phone);
}

// Form validation
function validateStep(step) {
    let form;
    if (step === 1) {
        const name = document.getElementById('name').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const email = document.getElementById('email').value.trim();
        const address = document.getElementById('address').value.trim();
        const city = document.getElementById('city').value.trim();
        const state = document.getElementById('state').value.trim();
        const zipCode = document.getElementById('zipCode').value.trim();

        if (!name || !phone || !email || !address || !city || !state || !zipCode) {
            alert('Please fill in all contact information fields.');
            return false;
        }

        if (!isValidEmail(email)) {
            alert('Please enter a valid email address.');
            return false;
        }

        if (!isValidPhone(phone)) {
            alert('Please enter a valid phone number.');
            return false;
        }

        // Store contact info in localStorage
        const contactInfo = { name, phone, email, address, city, state, zipCode };
        localStorage.setItem('gutterContactInfo', JSON.stringify(contactInfo));

        // Redirect to estimate.html
        window.top.location.href = '/estimate.html';
        return false; // Prevent further execution
    } else if (step === 2) {
        form = document.getElementById('propertyForm');
    }

    if (!form) return true;

    if (!form.checkValidity()) {
        Array.from(form.elements).forEach(input => {
            if (!input.validity.valid) {
                input.classList.add('is-invalid');
            }
        });
        return false;
    }
    return true;
}

// Estimate calculation
function calculateEstimate() {
    if (!validateStep(2)) return;

    const length = parseFloat(document.getElementById('homeLength').value);
    const stories = document.getElementById('stories').value;
    const gutterType = document.getElementById('gutterType').value;
    const additionalServices = Array.from(document.querySelectorAll('input[name="additionalServices"]:checked'))
        .map(checkbox => checkbox.value);

    // Calculate base cost
    let totalCost = length * PRICING.gutterTypes[gutterType].base;
    
    // Apply story multiplier
    totalCost *= PRICING.storyMultiplier[stories];

    // Add additional services
    additionalServices.forEach(service => {
        if (service === 'gutterGuards') {
            totalCost += length * PRICING.additionalServices[service].base;
        } else {
            totalCost += PRICING.additionalServices[service].base;
        }
    });

    // Display results
    document.getElementById('estimateAmount').textContent = `$${totalCost.toFixed(2)}`;
    displaySummary();
    
    // Move to next step
    nextStep(2);
}

function displaySummary() {
    // Customer details
    const customerDetails = document.getElementById('customerDetails');
    customerDetails.innerHTML = `
        <p><strong>Name:</strong> ${document.getElementById('name').value}</p>
        <p><strong>Phone:</strong> ${document.getElementById('phone').value}</p>
        <p><strong>Email:</strong> ${document.getElementById('email').value}</p>
        <p><strong>Address:</strong> ${document.getElementById('address').value}, 
            ${document.getElementById('city').value}, 
            ${document.getElementById('state').value} 
            ${document.getElementById('zipCode').value}</p>
    `;

    // Project details
    const projectDetails = document.getElementById('projectDetails');
    const selectedServices = Array.from(document.querySelectorAll('input[name="additionalServices"]:checked'))
        .map(checkbox => PRICING.additionalServices[checkbox.value].name)
        .join('<br>');

    projectDetails.innerHTML = `
        <p><strong>Gutter Length:</strong> ${document.getElementById('homeLength').value} feet</p>
        <p><strong>Stories:</strong> ${document.getElementById('stories').value}</p>
        <p><strong>Gutter Type:</strong> ${PRICING.gutterTypes[document.getElementById('gutterType').value].name}</p>
        ${selectedServices ? `<p><strong>Additional Services:</strong><br>${selectedServices}</p>` : ''}
    `;
}

function startOver() {
    document.getElementById('step3').classList.remove('active');
    document.getElementById('step1').classList.add('active');
    updateProgressBar(1);
    
    // Reset forms
    document.getElementById('customerForm').reset();
    document.getElementById('propertyForm').reset();
}

function submitEstimate() {
    const estimateData = {
        customer: {
            name: document.getElementById('name').value,
            phone: document.getElementById('phone').value,
            email: document.getElementById('email').value,
            address: document.getElementById('address').value,
            city: document.getElementById('city').value,
            state: document.getElementById('state').value,
            zipCode: document.getElementById('zipCode').value
        },
        project: {
            length: document.getElementById('homeLength').value,
            stories: document.getElementById('stories').value,
            gutterType: document.getElementById('gutterType').value,
            additionalServices: Array.from(document.querySelectorAll('input[name="additionalServices"]:checked'))
                .map(checkbox => checkbox.value)
        },
        estimatedCost: document.getElementById('estimateAmount').textContent
    };

    // Send message to parent window
    window.parent.postMessage({
        type: 'ESTIMATE_SUBMITTED',
        data: estimateData
    }, '*');
}

// Add input validation listeners
document.addEventListener('DOMContentLoaded', function() {
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        const inputs = form.querySelectorAll('input, select');
        inputs.forEach(input => {
            input.addEventListener('input', function() {
                // Remove invalid class when user starts typing
                this.classList.remove('is-invalid');
                // Remove any existing feedback messages
                const feedback = this.nextElementSibling;
                if (feedback && feedback.classList.contains('invalid-feedback')) {
                    feedback.remove();
                }
            });
        });
    });
});
