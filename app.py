from flask import Flask, render_template, request
from pymongo import MongoClient
import requests
import json
import re  # For cleaning OpenRouter response

app = Flask(__name__)

# ---------------- MongoDB Connection ----------------
def get_db():
    try:
        client = MongoClient(
            "mongodb+srv://xyz:Shashank0708@cluster0.ze9rz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
        )
        return client.agriguide
    except Exception as e:
        print(f"Error connecting to MongoDB Atlas: {e}")
        return None

db = get_db()

# ---------------- Weather API ----------------
WEATHER_API_KEY = "671ffb0444754181aea165917251709"
WEATHER_BASE_URL = "http://api.weatherapi.com/v1/current.json"

# ---------------- OpenRouter API ----------------
OPENROUTER_API_KEY = "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"

def ask_openrouter(prompt):
    url = "https://openrouter.ai/api/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json"
    }
    data = {
        "model": "mistralai/mistral-7b-instruct",
        "messages": [{"role": "user", "content": prompt}]
    }
    try:
        response = requests.post(url, headers=headers, json=data)
        if response.status_code == 200:
            return response.json()["choices"][0]["message"]["content"]
        else:
            return f"Error {response.status_code}: {response.text}"
    except Exception as e:
        print(f"OpenRouter API Error: {e}")
        return "Sorry, I could not fetch guidance right now."

# ---------------- Commodity Price API ----------------
COMMODITY_API_KEY = "5f055537-dc42-4757-bbcc-7e7c7bf7fcbf"
COMMODITY_BASE_URL = "https://api.commoditypriceapi.com/v2/rates/latest"

def get_commodity_price(symbol):
    try:
        params = {
            "symbols": symbol,
            "quote": "INR",
            "apiKey": COMMODITY_API_KEY
        }
        response = requests.get(COMMODITY_BASE_URL, params=params)
        response.raise_for_status()
        data = response.json()
        
        if "rates" in data and symbol in data["rates"]:
            price_per_cwt = data["rates"][symbol]
            price_per_kg = price_per_cwt / 45.36
            return {
                "price_per_cwt": round(price_per_cwt, 2),
                "price_per_kg": round(price_per_kg, 2),
                "unit": "Cwt",
                "symbol": symbol
            }
        return {"error": "Price data not available for symbol."}
    except Exception as e:
        print(f"Error fetching commodity price: {e}")
        return {"error": str(e)}

# ---------------- Routes ----------------
@app.route('/')
def index():
    return render_template('index.html')

# ---- Weather ----
@app.route('/weather', methods=['GET', 'POST'])
def weather():
    weather_data = None
    guidance = []
    if request.method == 'POST':
        location = request.form.get('location')
        weather_data = get_weather_data(location)
        condition = weather_data['weather'][0]['main'] if 'weather' in weather_data else "Unknown"

        # Generate actionable guidance including crop suggestions using OpenRouter
        prompt = (
            f"Provide 3 crops suitable for {condition} weather in India. "
            "For each crop, give a short actionable tip for farming it. "
            "Format each point as 'Crop Name: tip' without any markdown (**)."
        )
        raw_guidance = ask_openrouter(prompt)

        # Clean unwanted tags like <s>, [B_INST], [/B_INST]
        clean_guidance = re.sub(r'(<s>|\[B_INST\]|\[/B_INST\])', '', raw_guidance)

        # Split into bullet points, remove '**', and keep first 13 points
        all_points = [line.strip().replace("**", "") for line in clean_guidance.replace('. ', '.\n').split('\n') if line.strip()]
        guidance = all_points[0:13]

    return render_template('weather.html', weather=weather_data, guidance=guidance)

# ---- Farming Methods ----
# ---- Farming Methods ----
@app.route('/farming-methods')
def farming_methods():
    methods = []
    
    # Fetch from MongoDB if available
    if db is not None:
        methods = list(db.farming_methods.find())
    
    # If no methods in DB, fallback to OpenRouter
    if not methods:
        # Prompt OpenRouter to return JSON for multiple crops
        prompt = """
        Generate a JSON array of 8 farming methods in India.
        Each method must include:
        - name: string (name of the method)
        - crop: string
        - type: "conventional" or "modern/organic"
        - description: short description
        - steps: array of 4-6 actionable steps
        - benefits: array of 3-5 benefits
        - resources: optional array of 2-4 resources (websites or articles)
        Output JSON only.
        """
        raw_methods = ask_openrouter(prompt)
        
        # Clean OpenRouter response (remove unwanted tags)
        import re, json
        cleaned = re.sub(r'(<[^>]+>|\[B_INST\]|\[/B_INST\])', '', raw_methods)
        
        try:
            methods = json.loads(cleaned)
        except Exception as e:
            print("Error parsing OpenRouter JSON:", e)
            methods = []

    # Optional: separate methods by type for tabs in HTML
    conventional_methods = [m for m in methods if m.get("type","").lower() == "conventional"]
    modern_methods = [m for m in methods if m.get("type","").lower() == "modern/organic"]

    return render_template(
        'farming_methods.html', 
        methods=methods,
        conventional_methods=conventional_methods,
        modern_methods=modern_methods
    )


# ---- Disease Treatments ----
@app.route('/disease-treatments', methods=['GET', 'POST'])
def disease_treatments():
    if request.method == "POST":
        crop = request.form.get("crop")
        disease = request.form.get("disease")
        prompt = f"Suggest organic disease treatments for {crop} affected by {disease} in Indian agriculture."
        treatments = ask_openrouter(prompt)
        return render_template("disease_treatments.html", treatments=treatments, crop=crop, disease=disease)

    if db is None:
        treatments = []
    else:
        treatments = list(db.disease_treatments.find())
    return render_template('disease_treatments.html', treatments=treatments)

# ---- Market Prices ----
@app.route('/market-prices', methods=['GET', 'POST'])
def market_prices():
    prices = []
    if request.method == "POST":
        symbol = request.form.get("symbol")
        prices.append(get_commodity_price(symbol))
    else:
        if db is not None:
            prices = list(db.market_prices.find().sort('date', -1))
    return render_template('market_prices.html', prices=prices)

# ---- Commodity Price ----
@app.route('/commodity-price', methods=['GET', 'POST'])
def commodity_price():
    price_data = None
    if request.method == "POST":
        symbol = request.form.get("symbol")
        price_data = get_commodity_price(symbol)
    return render_template('commodity_price.html', price_data=price_data)

# ---- Eco Practices ----
@app.route('/eco-practices', methods=['GET', 'POST'])
def eco_practices():
    if request.method == "POST":
        query = request.form.get("query")
        prompt = f"Suggest eco-friendly sustainable agricultural practices for: {query}."
        practices = ask_openrouter(prompt)
        return render_template('eco_practices.html', practices=practices, query=query)

    if db is None:
        practices = []
    else:
        practices = list(db.eco_practices.find())
    return render_template('eco_practices.html', practices=practices)

# ---------------- Helper Functions ----------------
def get_weather_data(location):
    try:
        params = {"key": WEATHER_API_KEY, "q": location}
        response = requests.get(WEATHER_BASE_URL, params=params)
        if response.status_code == 200:
            data = response.json()
            return {
                "name": data["location"]["name"],
                "sys": {"country": data["location"]["country"]},
                "main": {"temp": data["current"]["temp_c"], "pressure": data["current"].get("pressure_mb", 0)},
                "weather": [{"main": data["current"]["condition"]["text"], "description": data["current"]["condition"]["text"]}],
                "wind": {"speed": data["current"]["wind_kph"]},
                "humidity": data["current"]["humidity"]
            }
        else:
            return {
                "name": location,
                "sys": {"country": ""},
                "main": {"temp": 0, "pressure": 0},
                "weather": [{"main": "Unknown", "description": "No data"}],
                "wind": {"speed": 0},
                "humidity": 0
            }
    except Exception as e:
        print(f"Error fetching weather data: {e}")
        return {
            "name": location,
            "sys": {"country": ""},
            "main": {"temp": 0, "pressure": 0},
            "weather": [{"main": "Unknown", "description": "No data"}],
            "wind": {"speed": 0},
            "humidity": 0
        }

def get_weather_guidance(weather_condition):
    if db is not None:
        guidance = db.weather_guidance.find_one({"weather": weather_condition})
        if guidance:
            return guidance.get("advice", "No advice available.")
    return "No specific guidance available for current weather conditions."

# ---------------- Main ----------------
if __name__ == '__main__':
    app.run(debug=True)
