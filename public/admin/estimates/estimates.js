// Pricing Configuration
const PRICING_CONFIG = {
    baseRate: {
        standard: 12,    // Price per linear foot for standard gutters
        premium: 15,     // Price per linear foot for premium gutters
        custom: 20       // Price per linear foot for custom box gutters
    },
    storyMultiplier: {
        1: 1,           // No additional cost for single story
        2: 1.3,         // 30% more for two stories
        3: 1.5          // 50% more for three or more stories
    },
    additionalServices: {
        cleaningService: 150,
        gutterGuards: 500,
        repairService: 250
    }
};

let currentStep = 1;
let formData = {
    // Customer Information
    name: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: 'TX',
    zipCode: '',
    
    // Property Details
    homeLength: '',
    stories: '',
    gutterType: '',
    additionalServices: []
};

// Update progress bar
function updateProgress(step) {
    const progressBar = document.querySelector('.progress-bar');
    const progress = step === 1 ? 33 : step === 2 ? 66 : 100;
    progressBar.style.width = `${progress}%`;
    progressBar.setAttribute('aria-valuenow', progress);
    progressBar.textContent = `Step ${step} of 3`;
}

// Form Validation
function validateForm(step) {
    const form = step === 1 ? document.getElementById('customerForm') : document.getElementById('propertyForm');
    if (!form.checkValidity()) {
        form.classList.add('was-validated');
        return false;
    }
    return true;
}

// Navigation Functions
function nextStep(currentStepNum) {
    if (!validateForm(currentStepNum)) return;
    
    // Save form data
    if (currentStepNum === 1) {
        formData.name = document.getElementById('name').value;
        formData.phone = document.getElementById('phone').value;
        formData.email = document.getElementById('email').value;
        formData.address = document.getElementById('address').value;
        formData.city = document.getElementById('city').value;
        formData.state = document.getElementById('state').value;
        formData.zipCode = document.getElementById('zipCode').value;
    }

    document.getElementById(`step${currentStepNum}`).style.display = 'none';
    document.getElementById(`step${currentStepNum + 1}`).style.display = 'block';
    currentStep = currentStepNum + 1;
    updateProgress(currentStep);
}

function previousStep(currentStepNum) {
    document.getElementById(`step${currentStepNum}`).style.display = 'none';
    document.getElementById(`step${currentStepNum - 1}`).style.display = 'block';
    currentStep = currentStepNum - 1;
    updateProgress(currentStep);
}

// Calculate Estimate
function calculateEstimate() {
    if (!validateForm(2)) return;

    // Get form values
    formData.homeLength = parseFloat(document.getElementById('homeLength').value);
    formData.stories = document.getElementById('stories').value;
    formData.gutterType = document.getElementById('gutterType').value;
    formData.additionalServices = Array.from(document.querySelectorAll('input[name="additionalServices"]:checked'))
        .map(checkbox => checkbox.value);

    // Calculate base cost
    const baseRate = PRICING_CONFIG.baseRate[formData.gutterType];
    const storyMultiplier = PRICING_CONFIG.storyMultiplier[formData.stories];
    const baseEstimate = baseRate * formData.homeLength * storyMultiplier;

    // Calculate additional services cost
    const additionalServicesCost = formData.additionalServices.reduce(
        (total, service) => total + PRICING_CONFIG.additionalServices[service],
        0
    );

    // Calculate total
    const totalEstimate = baseEstimate + additionalServicesCost;

    // Display result
    document.getElementById('estimateAmount').textContent = `$${totalEstimate.toFixed(2)}`;
    
    // Display customer details
    const customerDetails = document.getElementById('customerDetails').querySelector('.card-body');
    customerDetails.innerHTML = `
        <p><strong>Name:</strong> ${formData.name}</p>
        <p><strong>Phone:</strong> ${formData.phone}</p>
        <p><strong>Email:</strong> ${formData.email}</p>
        <p><strong>Address:</strong> ${formData.address}</p>
        <p><strong>Location:</strong> ${formData.city}, ${formData.state} ${formData.zipCode}</p>
    `;

    // Display project details
    const projectDetails = document.getElementById('projectDetails').querySelector('.card-body');
    const gutterTypeDisplay = {
        standard: 'Standard 5" K-Style',
        premium: 'Premium 6" K-Style',
        custom: 'Custom Box Gutters'
    };
    
    projectDetails.innerHTML = `
        <p><strong>Gutter Length:</strong> ${formData.homeLength} feet</p>
        <p><strong>Stories:</strong> ${formData.stories}</p>
        <p><strong>Gutter Type:</strong> ${gutterTypeDisplay[formData.gutterType]}</p>
    `;

    if (formData.additionalServices.length > 0) {
        projectDetails.innerHTML += '<p><strong>Additional Services:</strong></p><ul>';
        formData.additionalServices.forEach(service => {
            const serviceName = {
                cleaningService: 'Professional Gutter Cleaning',
                gutterGuards: 'Gutter Guard Installation',
                repairService: 'Fascia/Soffit Repair'
            }[service];
            projectDetails.innerHTML += `<li>${serviceName}</li>`;
        });
        projectDetails.innerHTML += '</ul>';
    }

    // Show result step
    document.getElementById('step2').style.display = 'none';
    document.getElementById('step3').style.display = 'block';
    currentStep = 3;
    updateProgress(3);
}

// Save estimate to database
async function saveEstimate() {
    try {
        const response = await fetch('/api/estimates', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ...formData,
                estimateAmount: parseFloat(document.getElementById('estimateAmount').textContent.replace('$', '')),
                date: new Date().toISOString()
            })
        });

        if (response.ok) {
            showAlert('success', 'Estimate saved successfully!');
        } else {
            throw new Error('Failed to save estimate');
        }
    } catch (error) {
        console.error('Error saving estimate:', error);
        showAlert('danger', 'Failed to save estimate. Please try again.');
    }
}

// Print estimate
function printEstimate() {
    window.print();
}

// Show alert message
function showAlert(type, message) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    document.querySelector('.container').insertBefore(alertDiv, document.querySelector('.progress'));
    
    // Auto dismiss after 5 seconds
    setTimeout(() => {
        alertDiv.remove();
    }, 5000);
}

// Reset form
function startOver() {
    // Reset form data
    formData = {
        name: '',
        phone: '',
        email: '',
        address: '',
        city: '',
        state: 'TX',
        zipCode: '',
        homeLength: '',
        stories: '',
        gutterType: '',
        additionalServices: []
    };

    // Reset form fields
    document.getElementById('customerForm').reset();
    document.getElementById('propertyForm').reset();
    
    // Remove validation classes
    document.getElementById('customerForm').classList.remove('was-validated');
    document.getElementById('propertyForm').classList.remove('was-validated');

    // Show first step
    document.getElementById('step1').style.display = 'block';
    document.getElementById('step2').style.display = 'none';
    document.getElementById('step3').style.display = 'none';
    currentStep = 1;
    updateProgress(1);
}
