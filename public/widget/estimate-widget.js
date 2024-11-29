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

function updateProgress(step) {
    const progressBar = document.querySelector('.progress-bar');
    const progress = step === 1 ? 33 : step === 2 ? 66 : 100;
    progressBar.style.width = `${progress}%`;
    progressBar.setAttribute('aria-valuenow', progress);
    progressBar.textContent = `Step ${step} of 3`;
}

function validateForm(step) {
    const form = step === 1 ? document.getElementById('customerForm') : document.getElementById('propertyForm');
    if (!form.checkValidity()) {
        form.classList.add('was-validated');
        return false;
    }
    return true;
}

function nextStep(currentStepNum) {
    if (!validateForm(currentStepNum)) return;
    
    if (currentStepNum === 1) {
        formData.name = document.getElementById('name').value;
        formData.phone = document.getElementById('phone').value;
        formData.email = document.getElementById('email').value;
        formData.address = document.getElementById('address').value;
        formData.city = document.getElementById('city').value;
        formData.state = document.getElementById('state').value;
        formData.zipCode = document.getElementById('zipCode').value;
    }

    document.getElementById(`step${currentStepNum}`).classList.remove('active');
    document.getElementById(`step${currentStepNum + 1}`).classList.add('active');
    currentStep = currentStepNum + 1;
    updateProgress(currentStep);
}

function previousStep(currentStepNum) {
    document.getElementById(`step${currentStepNum}`).classList.remove('active');
    document.getElementById(`step${currentStepNum - 1}`).classList.add('active');
    currentStep = currentStepNum - 1;
    updateProgress(currentStep);
}

function calculateEstimate() {
    if (!validateForm(2)) return;

    formData.homeLength = parseFloat(document.getElementById('homeLength').value);
    formData.stories = document.getElementById('stories').value;
    formData.gutterType = document.getElementById('gutterType').value;
    formData.additionalServices = Array.from(document.querySelectorAll('input[name="additionalServices"]:checked'))
        .map(checkbox => checkbox.value);

    const baseRate = PRICING_CONFIG.baseRate[formData.gutterType];
    const storyMultiplier = PRICING_CONFIG.storyMultiplier[formData.stories];
    const baseEstimate = baseRate * formData.homeLength * storyMultiplier;

    const additionalServicesCost = formData.additionalServices.reduce(
        (total, service) => total + PRICING_CONFIG.additionalServices[service],
        0
    );

    const totalEstimate = baseEstimate + additionalServicesCost;

    document.getElementById('estimateAmount').textContent = `$${totalEstimate.toFixed(2)}`;
    
    const customerDetails = document.getElementById('customerDetails');
    customerDetails.innerHTML = `
        <p><strong>Name:</strong> ${formData.name}</p>
        <p><strong>Phone:</strong> ${formData.phone}</p>
        <p><strong>Email:</strong> ${formData.email}</p>
        <p><strong>Address:</strong> ${formData.address}</p>
        <p><strong>Location:</strong> ${formData.city}, ${formData.state} ${formData.zipCode}</p>
    `;

    const projectDetails = document.getElementById('projectDetails');
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

    document.getElementById('step2').classList.remove('active');
    document.getElementById('step3').classList.add('active');
    currentStep = 3;
    updateProgress(3);
}

function submitEstimate() {
    // Send message to parent window
    window.parent.postMessage({
        type: 'ESTIMATE_SUBMITTED',
        data: {
            ...formData,
            estimateAmount: parseFloat(document.getElementById('estimateAmount').textContent.replace('$', '')),
            date: new Date().toISOString()
        }
    }, '*');
}

function startOver() {
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

    document.getElementById('customerForm').reset();
    document.getElementById('propertyForm').reset();
    
    document.getElementById('customerForm').classList.remove('was-validated');
    document.getElementById('propertyForm').classList.remove('was-validated');

    document.querySelectorAll('.form-step').forEach(step => step.classList.remove('active'));
    document.getElementById('step1').classList.add('active');
    currentStep = 1;
    updateProgress(1);
}
