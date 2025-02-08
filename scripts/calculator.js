document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('gutterCalculator');
    const calculator = document.getElementById('calculator');
    const estimateResult = document.getElementById('estimateResult');
    
    // Show calculator after contact info is filled
    const contactFields = ['name', 'phone', 'email', 'address'];
    contactFields.forEach(field => {
        document.getElementById(field).addEventListener('input', function() {
            const allFilled = contactFields.every(f => 
                document.getElementById(f).value.trim() !== ''
            );
            calculator.style.display = allFilled ? 'block' : 'none';
        });
    });

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Simple calculation logic
        const length = parseFloat(document.getElementById('homeLength').value);
        const type = document.getElementById('gutterType').value;
        const stories = parseInt(document.getElementById('stories').value);
        
        let price = type === 'standard' ? 8.50 : 12.00;
        price *= length;
        price *= stories === 1 ? 1 : 1.3;
        
        document.getElementById('totalCost').textContent = price.toFixed(2);
        estimateResult.style.display = 'block';
    });
});
