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
    const showCalculatorBtn = document.getElementById('showCalculator');
    const calculatorWrapper = document.getElementById('calculatorWrapper');

    // Show/Hide Calculator
    if (showCalculatorBtn && calculatorWrapper) {
        showCalculatorBtn.addEventListener('click', function() {
            calculatorWrapper.style.display = 'block';
            calculatorWrapper.classList.add('show');
            showCalculatorBtn.style.display = 'none';
        });
    }

    if (calculator) {
        calculator.addEventListener('submit', function(e) {
            e.preventDefault();
            calculateEstimate();
        });
    }

    function calculateEstimate() {
        const length = parseFloat(document.getElementById('homeLength').value);
        const gutterType = document.getElementById('gutterType').value;
        const stories = parseInt(document.getElementById('stories').value);
        const downspouts = parseInt(document.getElementById('downspouts').value);
        const additionalServices = Array.from(document.querySelectorAll('input[name="additionalServices"]:checked')).map(cb => cb.value);

        let total = 0;

        // Calculate base gutter cost
        const gutterCost = length * PRICING.gutterTypes[gutterType];
        total += gutterCost;

        // Add downspout costs
        const downspoutCost = downspouts * PRICING.downspout[stories];
        total += downspoutCost;

        // Add gutter guards if selected
        if (additionalServices.includes('guards')) {
            const guardCost = length * PRICING.guards[gutterType];
            total += guardCost;
        }

        // Add cleaning if selected
        if (additionalServices.includes('cleaning')) {
            const cleaningCost = length * PRICING.additionalServices.cleaning;
            total += cleaningCost;
        }

        // Apply minimum quote if total is below minimum
        total = Math.max(total, PRICING.minimumQuote);

        // Display result
        resultDiv.style.display = 'block';
        document.getElementById('totalCost').textContent = formatCurrency(total);
    }

    function formatCurrency(amount) {
        return '$' + amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
    }
});
