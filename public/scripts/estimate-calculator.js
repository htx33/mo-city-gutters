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

        // Display only the final total
        document.getElementById('totalCost').textContent = formatCurrency(totalCost);

        // Show results
        resultDiv.style.display = 'block';

        // Smooth scroll to results
        resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    function formatCurrency(amount) {
        return '$' + amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }
});
