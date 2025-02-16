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

// Function to handle quote form submission
document.getElementById('estimateForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    
    try {
        // Validate form first
        const form = event.target;
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        // Get contact information
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;
        const address = document.getElementById('address').value;

        // Validate contact info
        if (!name || !email || !phone || !address) {
            throw new Error('Please fill in all contact information');
        }
        
        // Get the estimate details from the page
        const gutterTypeElement = document.querySelector('input[name="gutterType"]:checked');
        const linearFeetElement = document.getElementById('linearFeet');
        const storiesElement = document.querySelector('input[name="stories"]:checked');
        const standardGuardsElement = document.getElementById('standardGuards');
        const premiumGuardsElement = document.getElementById('premiumGuards');
        const cleaningElement = document.getElementById('cleaning');

        // Check if all required elements exist
        if (!gutterTypeElement || !linearFeetElement || !storiesElement) {
            console.error('Missing required form elements');
            throw new Error('Missing required form elements');
        }

        const gutterType = gutterTypeElement.value;
        const linearFeet = parseFloat(linearFeetElement.value);
        const stories = parseInt(storiesElement.value);
        const standardGuards = standardGuardsElement?.checked || false;
        const premiumGuards = premiumGuardsElement?.checked || false;
        const cleaning = cleaningElement?.checked || false;

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

        try {
            // Validate required fields
            if (!name || !email || !phone || !address) {
                throw new Error('Please fill in all contact information');
            }

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
        }
    }
});

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
