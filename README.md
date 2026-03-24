# AgriGuide

AgriGuide is a web application designed to provide farmers with real-time weather-based guidance, modern and organic farming methods, crop disease treatments, market pricing updates, and environmentally friendly practices, all accessible in local languages.

## Purpose

To empower farmers to make informed decisions to increase yield, save resources, and adopt sustainable practices.

## Target Users

- Small and medium farmers
- Agricultural extension officers
- Agro-business advisors

## Features

1. **Weather-Based Guidance**
   - Real-time weather information with actionable farming tips
   - Visual icons for quick understanding
   - Specific recommendations based on weather conditions

2. **Farming Methods**
   - Conventional and modern farming techniques
   - Categorized by crop type and farming style
   - Visual cards with detailed information

3. **Organic Crop Disease Treatments**
   - Remedies and preventive measures for crop diseases
   - Searchable database of treatments
   - Visual icons for disease types

4. **Market Pricing Updates**
   - Daily crop prices from local/regional markets
   - Color-coded price changes
   - Graphical trends for popular crops

5. **Environmentally Friendly Practices**
   - Tips for eco-friendly farming
   - Categorized by practice type
   - Success stories and implementation guides

6. **Language Translation**
   - Multi-language support for content
   - Voice readout for accessibility

7. **Responsive and Farmer-Friendly UI**
   - Clean design with easy navigation
   - Visual icons and large buttons
   - Mobile-friendly interface

## Tech Stack

- **Frontend**: HTML, CSS (Bootstrap for responsiveness)
- **Backend**: Flask
- **Database**: MongoDB
- **APIs**: Weather API, optional market price API, translation API

## Setup Instructions

### Prerequisites

- Python 3.7 or higher
- MongoDB Atlas account
- OpenWeatherMap API key

### Installation

1. Clone the repository

2. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

3. Configure MongoDB connection:
   - Update the MongoDB connection string in `app.py` with your credentials

4. Configure OpenWeatherMap API:
   - Replace `your_openweathermap_api_key` in `app.py` with your actual API key

5. Run the application:
   ```
   python app.py
   ```

6. Access the application at `http://localhost:5000`

## Database Structure

The application uses MongoDB with the following collections:

1. **Users Collection**:
   ```json
   { "username": "farmer1", "role": "farmer", "language": "te" }
   ```

2. **Crops Collection**:
   ```json
   { "crop": "Tomato", "type": "Vegetable", "methods": ["organic", "modern"] }
   ```

3. **Weather Guidance Collection**:
   ```json
   { "weather": "Rain", "advice": "Delay irrigation; cover sensitive crops" }
   ```

4. **Disease Treatments Collection**:
   ```json
   { "crop": "Tomato", "disease": "Blight", "treatment": "Use neem extract weekly" }
   ```

5. **Market Prices Collection**:
   ```json
   { "crop": "Tomato", "region": "Andhra Pradesh", "price": 25, "date": "2025-09-17" }
   ```

6. **Farming Methods Collection**:
   ```json
   { "name": "Drip Irrigation", "type": "modern", "description": "Water-saving irrigation method", "suitable_crops": ["Tomato", "Cotton"] }
   ```

7. **Eco Practices Collection**:
   ```json
   { "name": "Composting", "category": "soil", "description": "Converting organic waste into fertilizer", "benefits": ["Improves soil health", "Reduces waste"], "suitable_crops": ["All"] }
   ```

## Color Palette

- Primary Background: #F5F5DC (Beige / Light Sand)
- Secondary Elements: #6B8E23 (Olive Green)
- Accent / CTA: #FF8C00 (Dark Orange)
- Complementary Colors:
  - #556B2F (Hover buttons or icons)
  - #8B4513 (Headers or icons)
  - #FFFFFF (Text on colored backgrounds)

## Future Enhancements

- Mobile application version
- Offline access to critical information
- Integration with IoT devices for automated data collection
- Community forum for farmers to share experiences
- Personalized recommendations based on user history

## Contributors

- [Your Name/Team]

## License

[Specify License]