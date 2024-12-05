// Pricing configuration
const CONFIG = {
    pricing: {
        gutterSizes: {
            '5': 8.50,  // 5-inch gutters price per linear foot
            '6': 9.50   // 6-inch gutters price per linear foot
        },
        storyMultipliers: {
            '1': 1.0,   // Single story multiplier
            '2': 1.3    // Two story multiplier
        },
        guardPrices: {
            'none': 0,
            'standard': 4.50,  // Standard guards price per linear foot
            'premium': 6.50    // Premium guards price per linear foot
        }
    }
};

// Store quote calculation results
let currentQuote = null;

// Calculate quote function
function calculateQuote(linearFeet, gutterSize, stories, guards) {
    console.log('Calculating quote with:', { linearFeet, gutterSize, stories, guards });
    try {
        // Get base price per foot based on gutter size
        const basePrice = CONFIG.pricing.gutterSizes[gutterSize] || CONFIG.pricing.gutterSizes['5'];
        
        // Get story multiplier
        const storyMultiplier = CONFIG.pricing.storyMultipliers[stories] || CONFIG.pricing.storyMultipliers['1'];
        
        // Get guard price per foot
        const guardPrice = CONFIG.pricing.guardPrices[guards] || 0;
        
        // Calculate total
        const subtotal = linearFeet * (basePrice + guardPrice) * storyMultiplier;
        
        const result = {
            subtotal: subtotal,
            total: Math.ceil(subtotal), // Round up to nearest dollar
            breakdown: {
                basePrice: basePrice,
                guardPrice: guardPrice,
                storyMultiplier: storyMultiplier,
                linearFeet: linearFeet
            }
        };
        console.log('Quote calculation result:', result);
        return result;
    } catch (error) {
        console.error('Error calculating quote:', error);
        return null;
    }
}

// Function to show quote summary
function showQuoteSummary(quoteData) {
    if (!quoteData) return;

    const calculatorForm = document.getElementById('calculator-hubspot-form');
    if (!calculatorForm) return;

    // Create and show the quote summary
    const summaryDiv = document.createElement('div');
    summaryDiv.className = 'quote-summary';
    summaryDiv.innerHTML = `
        <h3>Your Quote Summary</h3>
        <div class="quote-details">
            <p><strong>Linear Feet:</strong> ${quoteData.linearFeet}</p>
            <p><strong>Gutter Size:</strong> ${quoteData.gutterSize} inches</p>
            <p><strong>Stories:</strong> ${quoteData.stories}</p>
            <p><strong>Gutter Guards:</strong> ${quoteData.guards}</p>
            <p class="quote-total"><strong>Estimated Total:</strong> $${quoteData.total}</p>
        </div>
        <p class="quote-note">Thank you for your interest! We'll contact you shortly to discuss your project in detail.</p>
    `;

    // Replace the form with the summary
    calculatorForm.innerHTML = '';
    calculatorForm.appendChild(summaryDiv);
    calculatorForm.style.display = 'block';
}

// Initialize HubSpot form with calculator functionality
document.addEventListener('DOMContentLoaded', function() {
    if (window.hbspt) {
        console.log('Initializing HubSpot calculator form...');
        try {
            // Initialize contact info form first
            window.hbspt.forms.create({
                region: "na1",
                portalId: "48384794",
                formId: "7f60e194-301c-4b67-b9f5-2a25f16aae07",
                target: "#calculator-hubspot-form",
                onFormReady: function($form) {
                    console.log('Contact form ready');
                    
                    // Create a container for the calculator fields
                    const calculatorFields = document.createElement('div');
                    calculatorFields.id = 'calculator-fields';
                    calculatorFields.style.display = 'none';
                    calculatorFields.innerHTML = `
                        <div class="form-step">
                            <h3>Calculate Your Gutter Installation</h3>
                            <div class="form-field">
                                <label for="gutter_length">Linear Feet of Gutters Needed</label>
                                <input type="number" id="gutter_length" name="gutter_length" required>
                            </div>
                            <div class="form-field">
                                <label for="gutter_size">Gutter Size</label>
                                <select id="gutter_size" name="gutter_size" required>
                                    <option value="5">5-inch (Standard)</option>
                                    <option value="6">6-inch (Large)</option>
                                </select>
                            </div>
                            <div class="form-field">
                                <label for="home_stories">Home Stories</label>
                                <select id="home_stories" name="home_stories" required>
                                    <option value="1">Single Story</option>
                                    <option value="2">Two Story</option>
                                </select>
                            </div>
                            <div class="form-field">
                                <label for="gutter_guards">Gutter Guards</label>
                                <select id="gutter_guards" name="gutter_guards" required>
                                    <option value="none">No Guards</option>
                                    <option value="standard">Standard Guards</option>
                                    <option value="premium">Premium Guards</option>
                                </select>
                            </div>
                            <input type="hidden" name="quote_total" id="quote_total">
                            <button type="submit" class="submit-button">Get Quote</button>
                        </div>
                    `;
                    
                    // Add Next button after contact fields
                    const nextButton = document.createElement('button');
                    nextButton.type = 'button';
                    nextButton.className = 'next-button';
                    nextButton.textContent = 'Next';
                    nextButton.onclick = function() {
                        // Validate contact fields
                        const requiredFields = $form.querySelectorAll('input[required], select[required]');
                        let isValid = true;
                        requiredFields.forEach(field => {
                            if (!field.value) {
                                isValid = false;
                                field.style.borderColor = 'red';
                            } else {
                                field.style.borderColor = '';
                            }
                        });

                        if (isValid) {
                            // Hide contact fields and next button
                            const contactFields = $form.querySelectorAll('.hs-form-field, .hs-submit');
                            contactFields.forEach(field => field.style.display = 'none');
                            nextButton.style.display = 'none';
                            
                            // Show calculator fields
                            calculatorFields.style.display = 'block';
                            $form.appendChild(calculatorFields);

                            // Add calculation logic to calculator fields
                            const calcInputs = calculatorFields.querySelectorAll('input, select');
                            calcInputs.forEach(input => {
                                input.addEventListener('change', function() {
                                    const fields = {
                                        linearFeet: document.getElementById('gutter_length').value,
                                        gutterSize: document.getElementById('gutter_size').value,
                                        stories: document.getElementById('home_stories').value,
                                        guards: document.getElementById('gutter_guards').value
                                    };

                                    if (fields.linearFeet && fields.gutterSize && fields.stories && fields.guards) {
                                        currentQuote = calculateQuote(
                                            parseFloat(fields.linearFeet),
                                            fields.gutterSize,
                                            fields.stories,
                                            fields.guards
                                        );

                                        if (currentQuote) {
                                            document.getElementById('quote_total').value = currentQuote.total;
                                            
                                            // Store the current field values
                                            localStorage.setItem('quoteData', JSON.stringify({
                                                linearFeet: fields.linearFeet,
                                                gutterSize: fields.gutterSize,
                                                stories: fields.stories,
                                                guards: fields.guards,
                                                total: currentQuote.total
                                            }));
                                        }
                                    }
                                });
                            });
                        }
                    };
                    
                    // Add next button after HubSpot form fields
                    const submitButton = $form.querySelector('.hs-submit');
                    submitButton.parentNode.insertBefore(nextButton, submitButton);
                },
                onFormSubmit: function($form) {
                    console.log('Form submitted');
                    localStorage.setItem('formSubmitted', 'true');
                },
                onFormSubmitted: function($form) {
                    console.log('Form submission completed');
                    const quoteData = JSON.parse(localStorage.getItem('quoteData'));
                    showQuoteSummary(quoteData);
                }
            });
        } catch (error) {
            console.error('Error creating HubSpot calculator form:', error);
        }
    } else {
        console.error('HubSpot forms script not loaded');
    }

    // Check if we should show the quote summary
    if (localStorage.getItem('formSubmitted') === 'true') {
        const quoteData = JSON.parse(localStorage.getItem('quoteData'));
        showQuoteSummary(quoteData);
    }
});
