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

    let currentStep = 1;
    const totalSteps = 3;
    
    // Form elements
    const calculatorForm = document.getElementById('calculator-form');
    const measurementSection = document.getElementById('measurement-section');
    const contactSection = document.getElementById('contact-section');
    const summarySection = document.getElementById('summary-section');
    const nextButton = document.getElementById('next-btn');
    const backButton = document.getElementById('back-btn');
    const submitButton = document.getElementById('submit-btn');

    // Navigation functions
    function showStep(step) {
        // Hide all sections
        measurementSection.style.display = 'none';
        contactSection.style.display = 'none';
        summarySection.style.display = 'none';

        // Show appropriate section
        switch(step) {
            case 1:
                measurementSection.style.display = 'block';
                backButton.style.display = 'none';
                nextButton.style.display = 'block';
                submitButton.style.display = 'none';
                break;
            case 2:
                contactSection.style.display = 'block';
                backButton.style.display = 'block';
                nextButton.style.display = 'block';
                submitButton.style.display = 'none';
                break;
            case 3:
                summarySection.style.display = 'block';
                backButton.style.display = 'block';
                nextButton.style.display = 'none';
                submitButton.style.display = 'block';
                updateSummary();
                break;
        }
        currentStep = step;
    }

    function validateMeasurements() {
        const linearFeet = document.getElementById('linear-feet').value;
        const gutterSize = document.querySelector('input[name="gutter-size"]:checked')?.value;
        const stories = document.querySelector('input[name="stories"]:checked')?.value;
        const guards = document.querySelector('input[name="guards"]:checked')?.value;

        if (!linearFeet || !gutterSize || !stories || !guards) {
            alert('Please fill in all measurement fields');
            return false;
        }

        if (isNaN(linearFeet) || linearFeet <= 0) {
            alert('Please enter a valid number of linear feet');
            return false;
        }

        return true;
    }

    function validateContact() {
        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const address = document.getElementById('address').value.trim();
        const preferredDate = document.getElementById('preferred-date').value;
        const preferredTime = document.getElementById('preferred-time').value;

        if (!name || !email || !phone || !address || !preferredDate || !preferredTime) {
            alert('Please fill in all contact fields');
            return false;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert('Please enter a valid email address');
            return false;
        }

        // Phone validation (accept various formats)
        const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4}$/;
        if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
            alert('Please enter a valid phone number');
            return false;
        }

        return true;
    }

    function calculateTotal() {
        const linearFeet = parseFloat(document.getElementById('linear-feet').value);
        const gutterSize = document.querySelector('input[name="gutter-size"]:checked').value;
        const stories = document.querySelector('input[name="stories"]:checked').value;
        const guards = document.querySelector('input[name="guards"]:checked').value;

        const basePrice = PRICE_PER_LINEAR_FOOT[gutterSize] * linearFeet;
        const storyAdjusted = basePrice * STORY_MULTIPLIER[stories];
        const guardPrice = GUARD_PRICES[guards] * linearFeet;
        
        return Math.round((storyAdjusted + guardPrice) * 100) / 100;
    }

    function updateSummary() {
        const linearFeet = document.getElementById('linear-feet').value;
        const gutterSize = document.querySelector('input[name="gutter-size"]:checked').value;
        const stories = document.querySelector('input[name="stories"]:checked').value;
        const guards = document.querySelector('input[name="guards"]:checked').value;
        const total = calculateTotal();

        document.getElementById('summary-linear-feet').textContent = linearFeet;
        document.getElementById('summary-gutter-size').textContent = gutterSize === '5inch' ? '5-inch' : '6-inch';
        document.getElementById('summary-stories').textContent = stories;
        document.getElementById('summary-guards').textContent = 
            guards === 'none' ? 'No Guards' : 
            guards === 'standard' ? 'Standard Guards' : 'Premium Guards';
        document.getElementById('summary-total').textContent = `$${total.toFixed(2)}`;
    }

    // Event Listeners
    nextButton.addEventListener('click', function(e) {
        e.preventDefault();
        
        if (currentStep === 1 && !validateMeasurements()) {
            return;
        }
        
        if (currentStep === 2 && !validateContact()) {
            return;
        }

        if (currentStep < totalSteps) {
            showStep(currentStep + 1);
        }
    });

    backButton.addEventListener('click', function(e) {
        e.preventDefault();
        if (currentStep > 1) {
            showStep(currentStep - 1);
        }
    });

    calculatorForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        if (!validateMeasurements() || !validateContact()) {
            return;
        }

        const formData = {
            linearFeet: document.getElementById('linear-feet').value,
            gutterSize: document.querySelector('input[name="gutter-size"]:checked').value,
            stories: document.querySelector('input[name="stories"]:checked').value,
            guards: document.querySelector('input[name="guards"]:checked').value,
            total: calculateTotal(),
            name: document.getElementById('name').value.trim(),
            email: document.getElementById('email').value.trim(),
            phone: document.getElementById('phone').value.trim(),
            address: document.getElementById('address').value.trim(),
            preferredDate: document.getElementById('preferred-date').value,
            preferredTime: document.getElementById('preferred-time').value,
            additionalNotes: document.getElementById('additional-notes').value.trim()
        };

        // Disable submit button and show loading state
        submitButton.disabled = true;
        submitButton.textContent = 'Sending...';

        try {
            // Send to HubSpot if config exists
            if (typeof sendToHubSpot === 'function') {
                await sendToHubSpot(formData);
            }

            // Send email via FormSubmit
            await submitFormToFormSubmit(formData);

            // Show success message
            alert('Thank you! Your quote request has been submitted successfully. We will contact you shortly.');
            calculatorForm.reset();
            showStep(1);
        } catch (error) {
            console.error('Error submitting form:', error);
            alert('There was an error submitting your quote request. Please try again or contact us directly.');
        } finally {
            // Re-enable submit button
            submitButton.disabled = false;
            submitButton.textContent = 'Submit Quote Request';
        }
    });

    // Initialize form
    showStep(1);
});

function submitFormToFormSubmit(formData) {
    const emailTemplate = `
        New Quote Request from Website

        Customer Information:
        Name: ${formData.name}
        Email: ${formData.email}
        Phone: ${formData.phone}
        Address: ${formData.address}
        Preferred Date: ${formData.preferredDate}
        Preferred Time: ${formData.preferredTime}

        Quote Details:
        Linear Feet: ${formData.linearFeet}
        Gutter Size: ${formData.gutterSize === '5inch' ? '5-inch' : '6-inch'}
        Stories: ${formData.stories}
        Guards: ${formData.guards === 'none' ? 'No Guards' : 
                formData.guards === 'standard' ? 'Standard Guards' : 'Premium Guards'}
        Total: $${formData.total.toFixed(2)}

        Additional Notes:
        ${formData.additionalNotes || 'None provided'}
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
