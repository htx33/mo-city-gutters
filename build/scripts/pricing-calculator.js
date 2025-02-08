// Pricing configuration
const PRICING = {
    gutterTypes: {
        standard: 9.12,    // Price per linear foot for 5-inch K-Style
        premium: 12.00     // Price per linear foot for 6-inch K-Style
    },
    downspout: {
        1: 85.00,         // Price per downspout for single story
        2: 125.00         // Price per downspout for two story
    },
    guards: {
        standard: 10.00,   // Price per linear foot for 5-inch guards
        premium: 15.00     // Price per linear foot for 6-inch guards
    },
    additionalServices: {
        cleaning: 2.00     // Price per linear foot for cleaning
    },
    minimumQuote: 300.00  // Minimum quote amount
};

document.addEventListener('DOMContentLoaded', function() {
    const calculator = document.getElementById('gutterCalculator');
    const resultDiv = document.getElementById('estimateResult');

    if (calculator) {
        calculator.addEventListener('submit', function(e) {
            e.preventDefault();
            calculateEstimate();
        });
    }

    function calculateEstimate() {
        // Get form values
        const length = parseFloat(document.getElementById('homeLength').value);
        const gutterType = document.getElementById('gutterType').value;
        const stories = parseInt(document.getElementById('stories').value);
        const downspoutsCount = parseInt(document.getElementById('downspouts').value);
        const additionalServices = Array.from(document.querySelectorAll('input[name="additionalServices"]:checked'))
            .map(checkbox => checkbox.value);

        // Calculate gutter cost
        const baseRate = PRICING.gutterTypes[gutterType];
        const gutterCost = length * baseRate;

        // Calculate downspouts cost
        const downspoutRate = PRICING.downspout[stories];
        const downspoutsCost = downspoutsCount * downspoutRate;

        // Calculate additional services cost
        let additionalCost = 0;
        
        // Calculate gutter guards cost if selected
        if (additionalServices.includes('guards')) {
            const guardRate = PRICING.guards[gutterType];
            additionalCost += length * guardRate;
        }
        
        // Calculate cleaning cost if selected
        if (additionalServices.includes('cleaning')) {
            additionalCost += length * PRICING.additionalServices.cleaning;
        }

        // Calculate total and apply minimum quote
        let totalCost = gutterCost + downspoutsCost + additionalCost;
        totalCost = Math.max(totalCost, PRICING.minimumQuote);

        // Generate detailed breakdown
        const breakdown = generateBreakdown(length, gutterType, stories, downspoutsCount, additionalServices, {
            gutterCost,
            downspoutsCost,
            additionalCost,
            totalCost
        });

        // Display results
        resultDiv.innerHTML = breakdown;
        resultDiv.style.display = 'block';

        // Smooth scroll to results
        resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    function generateBreakdown(length, gutterType, stories, downspoutsCount, additionalServices, costs) {
        const gutterTypeLabel = gutterType === 'standard' ? '5-inch K-Style' : '6-inch K-Style';
        
        return `
            <div class="estimate-breakdown">
                <h3>Your Estimate Breakdown</h3>
                <div class="total-cost">
                    <h4>Total Estimate: ${formatCurrency(costs.totalCost)}</h4>
                    ${costs.totalCost === PRICING.minimumQuote ? 
                        '<p class="minimum-note">*Minimum service charge applied</p>' : ''}
                </div>
                <div class="cost-details">
                    <div class="cost-item">
                        <span class="item-label">${gutterTypeLabel} Gutters (${length} ft)</span>
                        <span class="item-cost">${formatCurrency(costs.gutterCost)}</span>
                    </div>
                    <div class="cost-item">
                        <span class="item-label">Downspouts (${downspoutsCount} × ${formatCurrency(PRICING.downspout[stories])})</span>
                        <span class="item-cost">${formatCurrency(costs.downspoutsCost)}</span>
                    </div>
                    ${additionalServices.includes('guards') ? `
                        <div class="cost-item">
                            <span class="item-label">Gutter Guards (${length} ft)</span>
                            <span class="item-cost">${formatCurrency(length * PRICING.guards[gutterType])}</span>
                        </div>
                    ` : ''}
                    ${additionalServices.includes('cleaning') ? `
                        <div class="cost-item">
                            <span class="item-label">Gutter Cleaning (${length} ft)</span>
                            <span class="item-cost">${formatCurrency(length * PRICING.additionalServices.cleaning)}</span>
                        </div>
                    ` : ''}
                </div>
                <div class="estimate-notes">
                    <p>This estimate includes:</p>
                    <ul>
                        <li>Professional installation</li>
                        <li>Quality materials</li>
                        <li>Labor costs</li>
                        <li>Clean up and disposal</li>
                    </ul>
                    <p class="disclaimer">Note: This is an estimate. Final pricing may vary based on specific requirements and on-site inspection.</p>
                </div>
            </div>
        `;
    }

    function formatCurrency(amount) {
        return '$' + amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }
});
