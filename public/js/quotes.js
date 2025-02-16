// Function to get CSRF token
async function getCsrfToken() {
    try {
        const response = await fetch('/api/csrf-token');
        const data = await response.json();
        return data.csrfToken;
    } catch (error) {
        console.error('Error getting CSRF token:', error);
        throw new Error('Failed to get security token');
    }
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

        return await response.json();
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
            
            if (!formData?.fields) {
                throw new Error('Invalid form data received');
            }

            // Extract data from form fields
            const getFieldValue = (name) => {
                const field = formData.fields[name];
                if (!field) {
                    console.warn(`Field ${name} not found in form data`);
                    return '';
                }
                return field.value || '';
            };

            // Get contact information
            const firstName = getFieldValue('firstname');
            const lastName = getFieldValue('lastname');
            const name = `${firstName} ${lastName}`.trim();
            const email = getFieldValue('email');
            const phone = getFieldValue('phone');
            const address = getFieldValue('address');

            // Validate contact info
            if (!firstName) throw new Error('First name is required');
            if (!lastName) throw new Error('Last name is required');
            if (!email) throw new Error('Email is required');
            if (!phone) throw new Error('Phone number is required');
            if (!address) throw new Error('Property address is required');

            console.log('Contact info:', { name, email, phone, address });

            // Get estimate details
            const gutterTypeElement = document.querySelector('input[name="gutterType"]:checked');
            const linearFeetElement = document.getElementById('linearFeet');
            const storiesElement = document.querySelector('input[name="stories"]:checked');
            const standardGuardsElement = document.getElementById('standardGuards');
            const premiumGuardsElement = document.getElementById('premiumGuards');
            const cleaningElement = document.getElementById('cleaning');

            // Validate estimate details
            if (!gutterTypeElement) throw new Error('Please select a gutter type');
            if (!linearFeetElement?.value) throw new Error('Please enter the linear feet');
            if (!storiesElement) throw new Error('Please select the number of stories');

            const gutterType = gutterTypeElement.value;
            const linearFeet = parseFloat(linearFeetElement.value);
            const stories = parseInt(storiesElement.value);
            const standardGuards = standardGuardsElement?.checked || false;
            const premiumGuards = premiumGuardsElement?.checked || false;
            const cleaning = cleaningElement?.checked || false;

            // Create quote data
            const quoteData = {
                name,
                email,
                phone,
                address,
                homeLength: linearFeet,
                gutterType: gutterType === 'premium' ? 'premium' : 'standard',
                additionalServices: [
                    ...(standardGuards ? ['gutterGuards'] : []),
                    ...(premiumGuards ? ['premiumGutterGuards'] : []),
                    ...(cleaning ? ['cleaningService'] : [])
                ],
                estimateAmount: calculateTotal(gutterType, linearFeet, stories, standardGuards, premiumGuards, cleaning)
            };

            console.log('Submitting quote:', quoteData);

            // Submit quote
            const quote = await submitQuote(quoteData);
            
            // Show success message
            const estimateResult = document.getElementById('estimateResult');
            if (!estimateResult) throw new Error('Could not find result container');

            const estimateAmount = estimateResult.querySelector('.estimate-amount');
            if (!estimateAmount) throw new Error('Could not find amount container');

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
            window.scrollTo(0, estimateResult.offsetTop);

        } catch (error) {
            console.error('Error processing form submission:', error);
            const errorElement = document.getElementById('hubspotFormError') || document.createElement('div');
            errorElement.id = 'hubspotFormError';
            errorElement.className = 'mt-3';
            errorElement.innerHTML = `
                <div class="alert alert-danger">
                    <h4>Error</h4>
                    <p>${error.message || 'There was an error processing your quote. Please try again.'}</p>
                </div>
            `;
            document.getElementById('step2').appendChild(errorElement);
            window.scrollTo(0, errorElement.offsetTop);
        }
    }
});

// Helper function to calculate total
function calculateTotal(gutterType, linearFeet, stories, standardGuards, premiumGuards, cleaning) {
    if (!gutterType || !linearFeet || !stories) {
        throw new Error('Missing required estimate parameters');
    }

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

// Function to validate and calculate estimate
function validateAndCalculate() {
    try {
        // Hide any previous error messages
        const estimateResult = document.getElementById('estimateResult');
        if (estimateResult) {
            estimateResult.style.display = 'none';
        }

        // Get and validate form values
        const gutterType = document.querySelector('input[name="gutterType"]:checked')?.value;
        const linearFeet = document.getElementById('linearFeet')?.value;
        const stories = document.querySelector('input[name="stories"]:checked')?.value;

        if (!gutterType) throw new Error('Please select a gutter type');
        if (!linearFeet) throw new Error('Please enter the linear feet');
        if (!stories) throw new Error('Please select the number of stories');

        // Calculate estimate
        const standardGuards = document.getElementById('standardGuards')?.checked || false;
        const premiumGuards = document.getElementById('premiumGuards')?.checked || false;
        const cleaning = document.getElementById('cleaning')?.checked || false;

        const estimate = calculateTotal(
            gutterType,
            parseFloat(linearFeet),
            parseInt(stories),
            standardGuards,
            premiumGuards,
            cleaning
        );

        // Store estimate
        const calculatedEstimateElement = document.getElementById('calculatedEstimate');
        if (calculatedEstimateElement) {
            calculatedEstimateElement.value = estimate.toFixed(2);
        }

        // Show estimate preview
        if (estimateResult) {
            const estimateAmount = estimateResult.querySelector('.estimate-amount');
            if (estimateAmount) {
                estimateAmount.innerHTML = `
                    <div class="alert alert-info">
                        <h4>Your Estimate</h4>
                        <p>Total Estimate: $${estimate.toFixed(2)}</p>
                        <p>Please fill out the form below to receive your detailed quote.</p>
                    </div>
                `;
                estimateResult.style.display = 'block';
            }
        }

        // Show HubSpot form
        const step1 = document.getElementById('step1');
        const step2 = document.getElementById('step2');
        if (step1 && step2) {
            step1.classList.remove('active');
            step2.classList.add('active');
        }

        // Initialize HubSpot form
        if (window.initHubSpotForm) {
            setTimeout(async () => {
                try {
                    await window.initHubSpotForm();
                } catch (error) {
                    console.error('Error initializing HubSpot form:', error);
                    throw new Error('Could not initialize contact form');
                }
            }, 100);
        } else {
            throw new Error('Contact form not available');
        }

    } catch (error) {
        console.error('Error in estimate calculation:', error);
        alert(error.message);
    }
}

// Helper function to go back
function goBack() {
    const step2 = document.getElementById('step2');
    const step1 = document.getElementById('step1');
    if (step2 && step1) {
        step2.classList.remove('active');
        step1.classList.add('active');
    }
}