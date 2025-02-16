// Function to get CSRF token
async function getCsrfToken() {
    const response = await fetch('/api/csrf-token');
    const data = await response.json();
    return data.csrfToken;
}

// Function to submit quote to the server
async function submitQuote(quoteData) {
    try {
        const csrfToken = await getCsrfToken();
        const response = await fetch('/api/quotes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'CSRF-Token': csrfToken
            },
            body: JSON.stringify(quoteData),
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error('Failed to submit quote');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error submitting quote:', error);
        throw error;
    }
}

// Function to handle HubSpot form submission
window.addEventListener('message', async event => {
    if (event.data.type === 'hsFormCallback' && event.data.eventName === 'onFormSubmitted') {
        try {
            console.log('Form submission data:', event.data);
            const formData = event.data.data;
            
            if (!formData) {
                throw new Error('Invalid form data received');
            }

            // Extract data from HubSpot form fields
            const getFieldValue = (name) => {
                try {
                    return formData[name] || '';
                } catch (error) {
                    console.error(`Error getting field ${name}:`, error);
                    return '';
                }
            };

            const firstName = getFieldValue('firstname');
            const lastName = getFieldValue('lastname');
            const name = `${firstName} ${lastName}`.trim();
            const email = getFieldValue('email');
            const phone = getFieldValue('phone');
            const address = getFieldValue('address');

            console.log('Extracted form data:', { firstName, lastName, email, phone, address });
        
            // Get the estimate details from the page
            const gutterTypeElement = document.querySelector('input[name="gutterType"]:checked');
            const linearFeetElement = document.getElementById('linearFeet');
            const storiesElement = document.querySelector('input[name="stories"]:checked');
            const standardGuardsElement = document.getElementById('standardGuards');
            const premiumGuardsElement = document.getElementById('premiumGuards');
            const cleaningElement = document.getElementById('cleaning');

            // Check if all required elements exist
            if (!gutterTypeElement || !linearFeetElement || !storiesElement) {
                throw new Error('Please complete the estimate form first');
            }

            const gutterType = gutterTypeElement.value;
            const linearFeet = parseFloat(linearFeetElement.value);
            const stories = parseInt(storiesElement.value);
            const standardGuards = standardGuardsElement?.checked || false;
            const premiumGuards = premiumGuardsElement?.checked || false;
            const cleaning = cleaningElement?.checked || false;

            // Validate required fields
            if (!name || !email || !phone || !address) {
                throw new Error('Please fill in all contact information');
            }

            // Create quote data combining HubSpot form data and estimate details
            const quoteData = {
                name: name,
                email: email,
                phone: phone,
                address: address,
                homeLength: linearFeet,
                gutterType: gutterType === 'premium' ? 'premium' : 'standard',
                additionalServices: [
                    ...(standardGuards ? ['gutterGuards'] : []),
                    ...(premiumGuards ? ['premiumGutterGuards'] : []),
                    ...(cleaning ? ['cleaningService'] : [])
                ],
                estimateAmount: calculateTotal(gutterType, linearFeet, stories, standardGuards, premiumGuards, cleaning)
            };

            console.log('Submitting quote data:', quoteData);

            const quote = await submitQuote(quoteData);
            
            // Show success message
            const estimateResult = document.getElementById('estimateResult');
            const estimateAmount = estimateResult.querySelector('.estimate-amount');
            estimateAmount.innerHTML = `
                <div class="alert alert-success">
                    <h4>Quote Generated Successfully!</h4>
                    <p>Total Estimate: $${quote.estimateAmount.toFixed(2)}</p>
                    <p>Quote ID: ${quote._id}</p>
                    <p>Valid until: ${new Date(quote.validUntil).toLocaleDateString()}</p>
                    <p>We'll send a confirmation email to ${email}</p>
                </div>
            `;
            estimateResult.style.display = 'block';
            
            // Clear form
            document.getElementById('estimateForm').reset();
            
        } catch (error) {
            console.error('Error submitting quote:', error);
            
            // Show error message
            const estimateResult = document.getElementById('estimateResult');
            const estimateAmount = estimateResult.querySelector('.estimate-amount');
            estimateAmount.innerHTML = `
                <div class="alert alert-danger">
                    <h4>Error</h4>
                    <p>${error.message || 'There was an error generating your quote. Please try again or contact us directly.'}</p>
                </div>
            `;
            estimateResult.style.display = 'block';
        } catch (error) {
            console.error('Error processing form submission:', error);
            
            // Show error message
            const estimateResult = document.getElementById('estimateResult');
            const estimateAmount = estimateResult.querySelector('.estimate-amount');
            estimateAmount.innerHTML = `
                <div class="alert alert-danger">
                    <h4>Error</h4>
                    <p>${error.message || 'There was an error processing your quote. Please try again.'}</p>
                </div>
            `;
            estimateResult.style.display = 'block';
        }
    }
});

// Helper function to format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

// Function to validate and calculate estimate
function validateAndCalculate() {
    // Hide any previous error messages
    const estimateResult = document.getElementById('estimateResult');
    estimateResult.style.display = 'none';

    // Get form values
    const gutterType = document.querySelector('input[name="gutterType"]:checked')?.value;
    const linearFeet = parseFloat(document.getElementById('linearFeet').value);
    const stories = parseInt(document.querySelector('input[name="stories"]:checked')?.value);
    const standardGuards = document.getElementById('standardGuards').checked;
    const premiumGuards = document.getElementById('premiumGuards').checked;
    const cleaning = document.getElementById('cleaning').checked;

    // Validate required fields
    if (!gutterType || isNaN(linearFeet) || isNaN(stories)) {
        alert('Please fill in all required fields');
        return;
    }

    // Calculate estimate
    const estimate = calculateTotal(gutterType, linearFeet, stories, standardGuards, premiumGuards, cleaning);
    
    // Store estimate for form submission
    document.getElementById('calculatedEstimate').value = estimate.toFixed(2);

    // Show estimate preview
    const estimateAmount = estimateResult.querySelector('.estimate-amount');
    estimateAmount.innerHTML = `
        <div class="alert alert-info">
            <h4>Your Estimate</h4>
            <p>Total Estimate: $${estimate.toFixed(2)}</p>
            <p>Please fill out the form below to receive your detailed quote.</p>
        </div>
    `;
    estimateResult.style.display = 'block';

    // Show the HubSpot form
    document.getElementById('step1').classList.remove('active');
    document.getElementById('step2').classList.add('active');

    // Reinitialize HubSpot form
    try {
        if (window.initHubSpotForm) {
            // Wait a bit for the DOM to update before initializing the form
            setTimeout(async () => {
                await window.initHubSpotForm();
            }, 100);
        } else {
            console.error('HubSpot form initialization function not found');
        }
    } catch (error) {
        console.error('Error showing HubSpot form:', error);
    }
}

// Helper function to go back to estimate form
function goBack() {
    document.getElementById('step2').classList.remove('active');
    document.getElementById('step1').classList.add('active');
}

// Helper function to calculate total (should match your existing calculation logic)
function calculateTotal(gutterType, linearFeet, stories, standardGuards, premiumGuards, cleaning) {
    // Base prices
    const standardGutterPrice = 8.50;
    const premiumGutterPrice = 12.00;
    const standardGuardsPrice = 6.00;
    const premiumGuardsPrice = 8.50;
    const cleaningPrice = 2.00;

    // Calculate base cost
    let total = linearFeet * (gutterType === 'premium' ? premiumGutterPrice : standardGutterPrice);

    // Add story multiplier
    if (stories === 2) {
        total *= 1.3; // 30% increase for 2 stories
    } else if (stories === 3) {
        total *= 1.6; // 60% increase for 3 stories
    }

    // Add gutter guards if selected
    if (standardGuards) {
        total += linearFeet * standardGuardsPrice;
    }
    if (premiumGuards) {
        total += linearFeet * premiumGuardsPrice;
    }

    // Add cleaning if selected
    if (cleaning) {
        total += linearFeet * cleaningPrice;
    }

    return total;
}
