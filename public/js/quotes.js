// In public/js/quotes.js
window.addEventListener('message', async event => {
    if (event.data.type === 'hsFormCallback' && event.data.eventName === 'onFormSubmitted') {
        try {
            console.log('HubSpot form submission event:', event);
            
            // 1. Access HubSpot's native form data structure
            const formData = event.data.data;
            if (!formData || !formData.fields) {
                throw new Error('Invalid form data structure received from HubSpot');
            }

            // 2. Modern field extraction using Object.values()
            const getFieldValue = (name) => {
                const field = Object.values(formData.fields).find(f => f.name === name);
                return field?.value || '';
            };

            // 3. Extract and validate fields
            const contactInfo = {
                firstName: getFieldValue('firstname'),
                lastName: getFieldValue('lastname'),
                email: getFieldValue('email'),
                phone: getFieldValue('phone'),
                address: getFieldValue('address')
            };

            // 4. Validation with specific error messages
            if (!contactInfo.firstName) throw new Error('First name is required');
            if (!contactInfo.lastName) throw new Error('Last name is required');
            if (!contactInfo.email) throw new Error('Email is required');
            if (!contactInfo.phone) throw new Error('Phone number is required');
            if (!contactInfo.address) throw new Error('Property address is required');

            // 5. Log successful extraction
            console.log('Extracted contact info:', contactInfo);

            // 6. Existing quote submission logic (keep your calculation and server submission code)

        } catch (error) {
            console.error('Form submission failed:', error);
            const errorElement = document.getElementById('hubspotFormError');
            errorElement.innerHTML = `
                <div class="alert alert-danger mt-3">
                    ${error.message}<br>
                    Please check your information and try again
                </div>
            `;
            window.scrollTo(0, document.body.scrollHeight);
        }
    }
});