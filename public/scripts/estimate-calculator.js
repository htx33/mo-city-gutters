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

// Function to show calculator form
function showCalculatorForm() {
    const calculatorForm = document.createElement('div');
    calculatorForm.className = 'calculator-form';
    calculatorForm.innerHTML = `
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
        <button type="button" class="calculate-button">Calculate Quote</button>
    `;

    const container = document.getElementById('calculator-hubspot-form');
    container.innerHTML = '';
    container.appendChild(calculatorForm);

    // Add event listeners to form fields
    const inputs = calculatorForm.querySelectorAll('input, select');
    const calculateButton = calculatorForm.querySelector('.calculate-button');

    calculateButton.addEventListener('click', function() {
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
                showQuoteSummary({
                    linearFeet: fields.linearFeet,
                    gutterSize: fields.gutterSize,
                    stories: fields.stories,
                    guards: fields.guards,
                    total: currentQuote.total
                });
            }
        } else {
            alert('Please fill in all fields to calculate your quote.');
        }
    });
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
        <button type="button" class="recalculate-button">Calculate Another Quote</button>
    `;

    // Replace the form with the summary
    calculatorForm.innerHTML = '';
    calculatorForm.appendChild(summaryDiv);

    // Add event listener to recalculate button
    const recalculateButton = summaryDiv.querySelector('.recalculate-button');
    recalculateButton.addEventListener('click', showCalculatorForm);
}

document.addEventListener('DOMContentLoaded', function() {
    // Initialize HubSpot form
    const contactForm = document.querySelector('#contact-form');
    const calculatorForm = document.querySelector('#calculator-form');
    const startCalculatorButton = document.querySelector('#start-calculator-button');
    const calculateButton = document.querySelector('#calculate-button');
    const recalculateButton = document.querySelector('#recalculate-button');
    const quoteResults = document.querySelector('#quote-results');

    // Hide calculator form and results initially
    if (calculatorForm) calculatorForm.style.display = 'none';
    if (quoteResults) quoteResults.style.display = 'none';
    if (startCalculatorButton) startCalculatorButton.style.display = 'none';

    // Handle contact form submission
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Validate contact form fields
            const name = document.querySelector('#name').value;
            const email = document.querySelector('#email').value;
            const phone = document.querySelector('#phone').value;

            if (!name || !email || !phone) {
                alert('Please fill in all contact information fields.');
                return;
            }

            // Store contact information
            localStorage.setItem('contactInfo', JSON.stringify({
                name: name,
                email: email,
                phone: phone
            }));

            // Show the start calculator button
            if (startCalculatorButton) {
                startCalculatorButton.style.display = 'block';
                contactForm.style.display = 'none';
            }
        });
    }

    // Handle starting the calculator
    if (startCalculatorButton) {
        startCalculatorButton.addEventListener('click', function() {
            startCalculatorButton.style.display = 'none';
            if (calculatorForm) calculatorForm.style.display = 'block';
        });
    }

    // Handle calculator form submission
    if (calculateButton) {
        calculateButton.addEventListener('click', function(e) {
            e.preventDefault();

            // Get calculator inputs
            const gutterLength = parseFloat(document.querySelector('#gutter-length').value);
            const gutterSize = document.querySelector('#gutter-size').value;
            const stories = parseInt(document.querySelector('#stories').value);
            const gutterGuards = document.querySelector('#gutter-guards').value === 'yes';
            const guardType = document.querySelector('#guard-type').value;

            // Validate calculator inputs
            if (isNaN(gutterLength) || !gutterSize || isNaN(stories)) {
                alert('Please fill in all calculator fields with valid values.');
                return;
            }

            // Calculate quote
            let baseRate = gutterSize === '6-inch' ? 11.50 : 9.20;  // Updated rates for 6-inch and 5-inch gutters
            if (stories === 2) {
                baseRate *= 1.25;
            }
            let totalCost = gutterLength * baseRate;
            if (gutterGuards) {
                const guardRate = guardType === 'premium' ? 14.00 : 9.00;
                totalCost += gutterLength * guardRate;
            }
            const quote = Math.round(totalCost * 100) / 100;

            // Display quote results
            displayQuoteResults(quote, gutterSize, stories, gutterLength, gutterGuards, guardType);

            // Store calculator information
            localStorage.setItem('calculatorInfo', JSON.stringify({
                gutterLength: gutterLength,
                gutterSize: gutterSize,
                stories: stories,
                gutterGuards: gutterGuards,
                guardType: guardType,
                quote: quote
            }));

            // Hide calculator form and show results
            calculatorForm.style.display = 'none';
            quoteResults.style.display = 'block';
        });
    }

    // Handle recalculate button
    if (recalculateButton) {
        recalculateButton.addEventListener('click', function() {
            // Clear stored calculator info
            localStorage.removeItem('calculatorInfo');
            
            // Hide results and show calculator form
            quoteResults.style.display = 'none';
            calculatorForm.style.display = 'block';
        });
    }

    // Display quote results function
    function displayQuoteResults(quote, gutterSize, stories, length, guards, guardType) {
        let breakdown = `
            <h3>Your Estimated Quote</h3>
            <p class="total-estimate">Total Estimate: $${quote.toFixed(2)}</p>
            <div class="quote-breakdown">
                <h4>Quote Breakdown:</h4>
                <ul>
                    <li>${gutterSize} Gutters (${length} ft): $${(length * (gutterSize === '6-inch' ? 11.50 : 9.20)).toFixed(2)}</li>
                    ${stories === 2 ? `<li>Two-Story Home Additional Cost: 25% premium</li>` : ''}
                    ${guards ? `<li>Gutter Guards (${guardType}): $${(length * (guardType === 'premium' ? 14.00 : 9.00)).toFixed(2)}</li>` : ''}
                </ul>
            </div>
            <p>This estimate includes:</p>
            <ul>
                <li>Professional installation</li>
                <li>Quality materials</li>
                <li>Labor costs</li>
                <li>Clean up and disposal</li>
            </ul>
            <p class="estimate-note">Note: This is an estimate. Final pricing may vary based on specific requirements and on-site inspection.</p>
        `;
        
        if (quoteResults) {
            quoteResults.innerHTML = breakdown;
        }
    }
});
