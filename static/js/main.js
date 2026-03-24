// AgriGuide Main JavaScript File

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Weather icons and guidance
    setupWeatherIcons();
    
    // Market price trends
    setupPriceTrends();
});

// Voice readout and language translation functionality has been moved to translation.js

// Weather Icons and Guidance
function setupWeatherIcons() {
    // Map weather conditions to appropriate icons and guidance
    const weatherIcons = {
        'Clear': 'fa-sun',
        'Clouds': 'fa-cloud',
        'Rain': 'fa-cloud-rain',
        'Drizzle': 'fa-cloud-rain',
        'Thunderstorm': 'fa-bolt',
        'Snow': 'fa-snowflake',
        'Mist': 'fa-smog',
        'Smoke': 'fa-smog',
        'Haze': 'fa-smog',
        'Dust': 'fa-smog',
        'Fog': 'fa-smog',
        'Sand': 'fa-wind',
        'Ash': 'fa-wind',
        'Squall': 'fa-wind',
        'Tornado': 'fa-wind'
    };
    
    // Apply icons if on the weather page
    const weatherCondition = document.getElementById('weather-condition');
    if (weatherCondition) {
        const condition = weatherCondition.textContent.trim();
        const iconClass = weatherIcons[condition] || 'fa-cloud';
        
        const iconElement = document.createElement('i');
        iconElement.className = `fas ${iconClass} weather-icon`;
        weatherCondition.parentNode.insertBefore(iconElement, weatherCondition);
    }
}

// Market Price Trends
function setupPriceTrends() {
    const priceElements = document.querySelectorAll('.price-change');
    
    priceElements.forEach(element => {
        const change = parseFloat(element.getAttribute('data-change'));
        
        if (change > 0) {
            element.innerHTML = `<i class="fas fa-arrow-up price-up"></i> ${change.toFixed(2)}`;
            element.classList.add('price-up');
        } else if (change < 0) {
            element.innerHTML = `<i class="fas fa-arrow-down price-down"></i> ${Math.abs(change).toFixed(2)}`;
            element.classList.add('price-down');
        } else {
            element.innerHTML = `<i class="fas fa-equals price-same"></i> 0.00`;
            element.classList.add('price-same');
        }
    });
}

// Function to handle search functionality
function searchFunction(inputId, itemsClass) {
    const input = document.getElementById(inputId);
    if (input) {
        input.addEventListener('keyup', function() {
            const filter = this.value.toUpperCase();
            const items = document.getElementsByClassName(itemsClass);
            
            for (let i = 0; i < items.length; i++) {
                const txtValue = items[i].textContent || items[i].innerText;
                if (txtValue.toUpperCase().indexOf(filter) > -1) {
                    items[i].style.display = "";
                } else {
                    items[i].style.display = "none";
                }
            }
        });
    }
}