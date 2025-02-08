require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const port = process.env.PORT || 3000;

// Enable CORS for your website domain
app.use(cors({
    origin: 'http://localhost:8080'
}));

// Endpoint to fetch Google Reviews
app.get('/api/reviews', async (req, res) => {
    try {
        const placeId = process.env.GOOGLE_PLACE_ID;
        const apiKey = process.env.GOOGLE_API_KEY;
        
        // First, get the place details
        const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=reviews&key=${apiKey}`;
        
        const response = await fetch(detailsUrl);
        const data = await response.json();
        
        if (data.result && data.result.reviews) {
            // Format the reviews
            const reviews = data.result.reviews.map(review => ({
                author_name: review.author_name,
                rating: review.rating,
                relative_time_description: review.relative_time_description,
                text: review.text,
                profile_photo_url: review.profile_photo_url
            }));
            
            res.json({ success: true, reviews });
        } else {
            throw new Error('No reviews found');
        }
    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Error fetching reviews' 
        });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
