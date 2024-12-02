// Pricing configuration
const PRICING = {
    gutters: {
        '5inch': 9.2,  // $9.20 per foot
        '6inch': 11    // $11.00 per foot
    },
    guards: {
        'none': 0,
        'standard': 8,    // $8 per foot
        'premium': 14     // $14 per foot
    },
    storyMultiplier: {
        '1': 1,
        '2': 1.3,  // 30% increase
        '3': 1.6   // 60% increase
    },
    downspouts: {
        cost: 8.5,      // $8.50 per foot
        spacing: 30,    // One downspout every 30 feet
        length: {
            '1': 15,    // 15 feet for 1 story
            '2': 25,    // 25 feet for 2 story
            '3': 35     // 35 feet for 3 story
        }
    }
};

document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const showCalculatorBtn = document.getElementById('showCalculator');
    const estimateTool = document.getElementById('estimateTool');
    const calculatorStep = document.getElementById('calculatorStep');
    const contactStep = document.getElementById('contactStep');
    const resultsStep = document.getElementById('resultsStep');
    const calculateBtn = document.getElementById('calculateBtn');
    const backToCalculatorBtn = document.getElementById('backToCalculator');
    const submitQuoteBtn = document.getElementById('submitQuoteBtn');

    // Show calculator when "Get Quote" button is clicked
    showCalculatorBtn.addEventListener('click', function() {
        estimateTool.style.display = 'block';
        calculatorStep.style.display = 'block';
        contactStep.style.display = 'none';
        resultsStep.style.display = 'none';
        showCalculatorBtn.style.display = 'none';
    });

    // Calculate button click handler
    calculateBtn.addEventListener('click', function() {
        const linearFeet = document.getElementById('linearFeet').value;
        const gutterSize = document.getElementById('gutterSize').value;
        const stories = document.getElementById('stories').value;
        const guards = document.getElementById('guards').value;

        // Validate inputs
        if (!linearFeet || linearFeet <= 0) {
            alert('Please enter valid linear feet');
            return;
        }

        // Hide calculator, show contact form
        calculatorStep.style.display = 'none';
        contactStep.style.display = 'block';
    });

    // Back button click handler
    backToCalculatorBtn.addEventListener('click', function() {
        calculatorStep.style.display = 'block';
        contactStep.style.display = 'none';
    });

    // Submit quote button click handler
    submitQuoteBtn.addEventListener('click', function() {
        const fullName = document.getElementById('quoteFullName').value;
        const email = document.getElementById('quoteEmail').value;
        const phone = document.getElementById('quotePhone').value;
        const address = document.getElementById('quoteAddress').value;

        // Validate contact info
        if (!fullName || !email || !phone || !address) {
            alert('Please fill in all contact information');
            return;
        }

        // Calculate final quote
        calculateAndDisplayQuote();
    });

    function calculateAndDisplayQuote() {
        const linearFeet = parseFloat(document.getElementById('linearFeet').value);
        const gutterSize = document.getElementById('gutterSize').value;
        const stories = parseInt(document.getElementById('stories').value);
        const guards = document.getElementById('guards').value;

        // Calculate base price
        let pricePerFoot = gutterSize === '5inch' ? 9.20 : 11.00;
        let basePrice = linearFeet * pricePerFoot;

        // Calculate guards price
        let guardsPrice = 0;
        if (guards === 'standard') {
            guardsPrice = linearFeet * 8;
        } else if (guards === 'premium') {
            guardsPrice = linearFeet * 14;
        }

        // Calculate story multiplier
        let storyMultiplier = 1;
        if (stories === 2) {
            storyMultiplier = 1.3;
        } else if (stories === 3) {
            storyMultiplier = 1.6;
        }

        // Calculate downspouts
        const downspoutsNeeded = Math.ceil(linearFeet / 30);
        let downspoutLength;
        switch(stories) {
            case 1: downspoutLength = 15; break;
            case 2: downspoutLength = 25; break;
            case 3: downspoutLength = 35; break;
            default: downspoutLength = 15;
        }
        const downspoutPrice = downspoutsNeeded * downspoutLength * 8.50;

        // Calculate total
        const subtotal = (basePrice + guardsPrice) * storyMultiplier + downspoutPrice;
        const total = Math.round(subtotal);

        // Display quote details
        const quoteDetails = document.querySelector('.quote-details');
        quoteDetails.innerHTML = `
            <h4>Quote Details</h4>
            <ul>
                <li>Linear Feet: ${linearFeet} ft</li>
                <li>Gutter Size: ${gutterSize === '5inch' ? '5-inch' : '6-inch'}</li>
                <li>Stories: ${stories}</li>
                <li>Guards: ${guards === 'none' ? 'No' : guards === 'standard' ? 'Standard' : 'Premium'}</li>
                <li>Downspouts: ${downspoutsNeeded} (${downspoutLength} ft each)</li>
                <li><strong>Estimated Total: $${total.toLocaleString()}</strong></li>
            </ul>
        `;

        // Show results
        contactStep.style.display = 'none';
        resultsStep.style.display = 'block';

        // Send form data
        sendQuoteEmail();
    }

    function sendQuoteEmail() {
        const linearFeet = document.getElementById('linearFeet').value;
        const gutterSize = document.getElementById('gutterSize').value;
        const stories = document.getElementById('stories').value;
        const guards = document.getElementById('guards').value;
        const customerName = document.getElementById('quoteFullName').value;
        const customerEmail = document.getElementById('quoteEmail').value;
        
        // Get the quote details HTML for email
        const quoteDetailsHtml = document.querySelector('.quote-details').innerHTML;
        
        const formData = {
            name: customerName,
            email: customerEmail,
            phone: document.getElementById('quotePhone').value,
            address: document.getElementById('quoteAddress').value,
            linearFeet: linearFeet,
            gutterSize: gutterSize,
            stories: stories,
            guards: guards,
            _subject: `Gutter Installation Quote for ${customerName}`,
            _template: 'table',
            _cc: customerEmail, // Send a copy to the customer
            quote_details: quoteDetailsHtml,
            message: `Thank you for requesting a quote from Mo City Gutters!\n\n` +
                    `Here are your project details:\n` +
                    `• Linear Feet: ${linearFeet} ft\n` +
                    `• Gutter Size: ${gutterSize === '5inch' ? '5-inch' : '6-inch'}\n` +
                    `• Number of Stories: ${stories}\n` +
                    `• Gutter Guards: ${guards === 'none' ? 'No' : guards === 'standard' ? 'Standard' : 'Premium'}\n\n` +
                    `One of our representatives will contact you shortly to discuss your project and schedule a free inspection.\n\n` +
                    `If you have any questions, please don't hesitate to contact us:\n` +
                    `Phone: (281) 827-9457\n` +
                    `Email: mocitygutters@gmail.com\n\n` +
                    `Best regards,\n` +
                    `Mo City Gutters Team`
        };

        const form = document.createElement('form');
        form.method = 'POST';
        form.action = 'https://formsubmit.co/mocitygutters@gmail.com';

        // Add form fields
        Object.keys(formData).forEach(key => {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = key;
            input.value = formData[key];
            form.appendChild(input);
        });

        // Add success page redirect
        const successUrl = document.createElement('input');
        successUrl.type = 'hidden';
        successUrl.name = '_next';
        successUrl.value = window.location.href;
        form.appendChild(successUrl);

        // Submit form
        document.body.appendChild(form);
        form.submit();
    }
});
