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

// Function to handle quote creation after HubSpot form submission
window.addEventListener('message', async event => {
    if (event.data.type === 'hsFormCallback' && event.data.eventName === 'onFormSubmitted') {
        const formData = event.data.data;
        
        // Get the estimate details from the page
        const gutterType = document.querySelector('input[name="gutterType"]:checked').value;
        const linearFeet = parseFloat(document.getElementById('linearFeet').value);
        const stories = parseInt(document.querySelector('input[name="stories"]:checked').value);
        const standardGuards = document.getElementById('standardGuards').checked;
        const premiumGuards = document.getElementById('premiumGuards').checked;
        const cleaning = document.getElementById('cleaning').checked;

        // Create quote data combining HubSpot form data and estimate details
        const quoteData = {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            address: formData.address,
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
                </div>
            `;
            estimateResult.style.display = 'block';
        } catch (error) {
            // Show error message
            const estimateResult = document.getElementById('estimateResult');
            const estimateAmount = estimateResult.querySelector('.estimate-amount');
            estimateAmount.innerHTML = `
                <div class="alert alert-danger">
                    <h4>Error</h4>
                    <p>There was an error generating your quote. Please try again or contact us directly.</p>
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
