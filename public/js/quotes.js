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
        console.log('Submitting quote data:', quoteData);
        const csrfToken = await getCsrfToken();
        const response = await fetch('/api/estimate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'CSRF-Token': csrfToken
            },
            body: JSON.stringify(quoteData),
            credentials: 'include'
        });

        const responseData = await response.json();
        console.log('Server response:', responseData);

        if (!response.ok) {
            throw new Error(`Failed to submit quote: ${responseData.message || 'Unknown error'}`);
        }

        return responseData;
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

            // Get quote details from hidden fields
            const getHiddenField = (name) => {
                const field = formData.fields[name];
                return field ? field.value : null;
            };

            // Get contact information
            const firstName = getFieldValue('firstname');
            const lastName = getFieldValue('lastname');
            const name = `${firstName} ${lastName}`.trim();
            const email = getFieldValue('email');
            const phone = getFieldValue('phone');
            const address = getFieldValue('address');

            // Get quote details from hidden fields
            const gutterType = getHiddenField('gutter_type');
            const homeLength = parseFloat(getHiddenField('linear_feet'));
            const stories = parseInt(getHiddenField('number_of_stories'));
            const standardGuards = getHiddenField('standard_guards') === 'Yes';
            const premiumGuards = getHiddenField('premium_guards') === 'Yes';
            const cleaning = getHiddenField('cleaning_service') === 'Yes';
            const estimateAmount = parseFloat(getHiddenField('quote_amount'));

            // Validate contact info
            if (!firstName) throw new Error('First name is required');
            if (!lastName) throw new Error('Last name is required');
            if (!email) throw new Error('Email is required');
            if (!phone) throw new Error('Phone number is required');
            if (!address) throw new Error('Property address is required');

            console.log('Contact info:', { name, email, phone, address });

            // Create quote data using hidden fields
            const quoteData = {
                name,
                email,
                phone,
                address,
                homeLength,
                gutterType,
                additionalServices: [
                    ...(standardGuards ? ['gutterGuards'] : []),
                    ...(premiumGuards ? ['premiumGutterGuards'] : []),
                    ...(cleaning ? ['cleaningService'] : [])
                ],
                estimateAmount,
                stories
            };

            console.log('Submitting quote:', quoteData);

            // Submit quote
            console.log('Submitting quote data:', quoteData);
            const quote = await submitQuote(quoteData);
            console.log('Quote submission response:', quote);
            
            // Show success message
            const estimateResult = document.getElementById('estimateResult');
            if (!estimateResult) throw new Error('Could not find result container');

            const amountContainer = estimateResult.querySelector('.estimate-amount');
            if (!amountContainer) throw new Error('Could not find amount container');

            amountContainer.innerHTML = `
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
            console.error('Error details:', {
                message: error.message,
                stack: error.stack,
                name: error.name
            });
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

    // Ensure linearFeet is a positive number
    linearFeet = Math.abs(parseFloat(linearFeet));
    if (isNaN(linearFeet)) {
        throw new Error('Invalid linear feet value');
    }

    // Base prices
    const standardGutterPrice = 9.50;
    const premiumGutterPrice = 12.00;
    const standardGuardsPrice = 8.00;
    const premiumGuardsPrice = 14.50;
    const cleaningPrice = 2.00;
    const minimumCharge = 350.00; // Minimum charge for any service

    // Calculate base gutter cost
    let total = linearFeet * (gutterType === 'premium' ? premiumGutterPrice : standardGutterPrice);

    // Add guards cost if selected
    if (standardGuards) {
        total += linearFeet * standardGuardsPrice;
    }
    if (premiumGuards) {
        total += linearFeet * premiumGuardsPrice;
    }

    // Add cleaning cost if selected
    if (cleaning) {
        total += linearFeet * cleaningPrice;
    }

    // Apply story multiplier to total cost
    if (stories === 2) {
        total *= 1.3; // 30% increase for 2 stories
    } else if (stories === 3) {
        total *= 1.6; // 60% increase for 3 stories
    }

    // Apply minimum charge to final total
    total = Math.max(minimumCharge, total);

    // Round to 2 decimal places
    return Math.round(total * 100) / 100;
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
        const gutterType = document.getElementById('gutterType')?.value;
        const linearFeet = document.getElementById('linearFeet')?.value;
        const stories = document.getElementById('stories')?.value;

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