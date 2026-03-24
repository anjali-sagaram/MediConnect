/**
 * AgriGuide Translation Module
 * Handles language translation and text-to-speech functionality
 */

// Available languages with their codes and names
const availableLanguages = {
    'en': 'English',
    'hi': 'Hindi',
    'te': 'Telugu',
    'ta': 'Tamil',
    'kn': 'Kannada',
    'ml': 'Malayalam',
    'mr': 'Marathi',
    'bn': 'Bengali',
    'gu': 'Gujarati',
    'pa': 'Punjabi'
};

// Initialize language selector and translation features when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    setupLanguageSelector();
    setupVoiceReadout();
    
    // Apply saved language preference if exists
    const savedLang = localStorage.getItem('preferredLanguage');
    if (savedLang && savedLang !== 'en') {
        translatePage(savedLang);
    }
});

// Setup language selector dropdown
function setupLanguageSelector() {
    const languageItems = document.querySelectorAll('.dropdown-item[data-lang]');
    
    languageItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const lang = this.getAttribute('data-lang');
            translatePage(lang);
        });
    });
}

// Translate page content using LibreTranslate API
function translatePage(targetLang) {
    // Save selected language to localStorage
    localStorage.setItem('preferredLanguage', targetLang);
    
    // If target language is English, reload the page to get original content
    if (targetLang === 'en') {
        location.reload();
        return;
    }
    
    // Mark all translatable elements if not already marked
    markAllTranslatableElements();
    
    // Use LibreTranslate API for text content
    const translateElements = document.querySelectorAll('.translate');
    
    translateElements.forEach(element => {
        // Handle different element types differently
        if (element.tagName === 'INPUT') {
            // Handle input elements
            if (element.placeholder) {
                const originalPlaceholder = element.getAttribute('data-original-placeholder') || element.placeholder;
                
                // Store original placeholder if not already stored
                if (!element.getAttribute('data-original-placeholder')) {
                    element.setAttribute('data-original-placeholder', originalPlaceholder);
                }
                
                // Translate placeholder
                translateWithLibreTranslate(originalPlaceholder, targetLang)
                    .then(translatedText => {
                        element.placeholder = translatedText;
                    })
                    .catch(error => {
                        console.error('Translation error:', error);
                    });
            }
            
            // For buttons and submit inputs, translate value
            if ((element.type === 'button' || element.type === 'submit') && element.value) {
                const originalValue = element.getAttribute('data-original-value') || element.value;
                
                // Store original value if not already stored
                if (!element.getAttribute('data-original-value')) {
                    element.setAttribute('data-original-value', originalValue);
                }
                
                // Translate value
                translateWithLibreTranslate(originalValue, targetLang)
                    .then(translatedText => {
                        element.value = translatedText;
                    })
                    .catch(error => {
                        console.error('Translation error:', error);
                    });
            }
        } else {
            // Handle regular text elements
            const originalText = element.getAttribute('data-original-text') || element.textContent;
            
            // Skip empty text or text with only whitespace
            if (!originalText || originalText.trim() === '') {
                return;
            }
            
            // Store original text if not already stored
            if (!element.getAttribute('data-original-text')) {
                element.setAttribute('data-original-text', originalText);
            }
            
            // Call LibreTranslate API
            translateWithLibreTranslate(originalText, targetLang)
                .then(translatedText => {
                    element.textContent = translatedText;
                })
                .catch(error => {
                    console.error('Translation error:', error);
                });
        }
    });
    
    // Update UI to show active language
    updateLanguageUI(targetLang);
}

// Translate text using LibreTranslate API
function translateWithLibreTranslate(text, targetLang) {
    return new Promise((resolve, reject) => {
        // Skip empty text
        if (!text || text.trim() === '') {
            resolve(text);
            return;
        }
        
        // LibreTranslate API endpoint (using a public instance)
        const apiUrl = 'https://libretranslate.de/translate';
        
        // Using a free public instance that doesn't require API key
        // If this instance doesn't work, you can get your own API key from https://portal.libretranslate.com/
        const apiKey = ''; // Leave empty to use fallback demo translations
        
        // Prepare the request data
        const requestData = {
            q: text,
            source: 'en',  // Source language is English
            target: targetLang,
            format: 'text'
        };
        
        // Make the API request
        fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(apiKey ? {'Authorization': `Bearer ${apiKey}`} : {})
            },
            body: JSON.stringify(requestData)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Translation API request failed');
            }
            return response.json();
        })
        .then(data => {
            if (data.translatedText) {
                resolve(data.translatedText);
            } else {
                throw new Error('No translated text returned');
            }
        })
        .catch(error => {
            console.error('Translation error:', error);
            
            // Display a user-friendly notification about the translation error
            if (!document.getElementById('translation-error-notification')) {
                const notification = document.createElement('div');
                notification.id = 'translation-error-notification';
                notification.style.cssText = 'position: fixed; top: 10px; right: 10px; background-color: #f8d7da; color: #721c24; padding: 10px; border-radius: 5px; z-index: 9999; max-width: 300px;';
                notification.innerHTML = `<strong>Translation Error</strong><br>Using offline translations instead. <button onclick="this.parentNode.remove()" style="background: none; border: none; color: #721c24; float: right; cursor: pointer;">×</button>`;
                document.body.appendChild(notification);
                
                // Auto-remove after 5 seconds
                setTimeout(() => {
                    if (document.getElementById('translation-error-notification')) {
                        document.getElementById('translation-error-notification').remove();
                    }
                }, 5000);
            }
            
            // Check if error is related to API key or connectivity
            if (error.message.includes('API key') || error.message.includes('Authorization')) {
                console.warn('LibreTranslate requires an API key. Using fallback translations.');
            } else if (error.message.includes('failed') || error instanceof TypeError) {
                console.warn('Translation API connection failed. Using fallback translations.');
            }
            
            // Fallback to demo translations if API fails
            const demoTranslations = {
                'hi': {
                    'Weather': 'मौसम',
                    'Farming Methods': 'खेती के तरीके',
                    'Disease Treatments': 'रोग उपचार',
                    'Market Prices': 'बाजार मूल्य',
                    'Eco-Friendly Practices': 'पर्यावरण अनुकूल प्रथाएँ',
                    'Home': 'होम',
                    'Search': 'खोज',
                    'Submit': 'जमा करें',
                    'Welcome to AgriGuide': 'एग्रीगाइड में आपका स्वागत है',
                    'Empowering farmers with knowledge': 'किसानों को ज्ञान के साथ सशक्त बनाना',
                    'Read Aloud': 'जोर से पढ़ें',
                    'Enter your location': 'अपना स्थान दर्ज करें',
                    'Get Guidance': 'मार्गदर्शन प्राप्त करें',
                    'Weather Guidance': 'मौसम मार्गदर्शन',
                    'Explore': 'अन्वेषण करें',
                    'Language': 'भाषा',
                    'Start Listening': 'सुनना शुरू करें',
                    'AgriGuide - Empowering Farmers with Knowledge': 'एग्रीगाइड - किसानों को ज्ञान के साथ सशक्त बनाना'
                },
                'te': {
                    'Weather': 'వాతావరణం',
                    'Farming Methods': 'వ్యవసాయ పద్ధతులు',
                    'Disease Treatments': 'వ్యాధి చికిత్సలు',
                    'Market Prices': 'మార్కెట్ ధరలు',
                    'Eco-Friendly Practices': 'పర్యావరణ అనుకూల పద్ధతులు',
                    'Home': 'హోమ్',
                    'Search': 'శోధన',
                    'Submit': 'సమర్పించండి',
                    'Welcome to AgriGuide': 'అగ్రిగైడ్‌కి స్వాగతం',
                    'Empowering farmers with knowledge': 'రైతులకు జ్ఞానంతో శక్తినిస్తుంది',
                    'Read Aloud': 'బిగ్గరగా చదవండి',
                    'Enter your location': 'మీ స్థానాన్ని నమోదు చేయండి',
                    'Get Guidance': 'మార్గదర్శకత్వం పొందండి',
                    'Weather Guidance': 'వాతావరణ మార్గదర్శకత్వం',
                    'Explore': 'అన్వేషించండి',
                    'Language': 'భాష',
                    'Start Listening': 'వినడం ప్రారంభించండి',
                    'AgriGuide - Empowering Farmers with Knowledge': 'అగ్రిగైడ్ - రైతులకు జ్ఞానంతో శక్తినిస్తుంది'
                },
                'ta': {
                    'Weather': 'வானிலை',
                    'Farming Methods': 'விவசாய முறைகள்',
                    'Disease Treatments': 'நோய் சிகிச்சைகள்',
                    'Market Prices': 'சந்தை விலைகள்',
                    'Home': 'முகப்பு',
                    'Welcome to AgriGuide': 'அக்ரிகைடுக்கு வரவேற்கிறோம்',
                    'Empowering farmers with knowledge': 'விவசாயிகளுக்கு அறிவுடன் அதிகாரம் அளித்தல்',
                    'Read Aloud': 'சத்தமாக படி',
                    'Language': 'மொழி',
                    'Explore': 'ஆராய்',
                    'Start Listening': 'கேட்க தொடங்கு'
                },
                'kn': {
                    'Weather': 'ಹವಾಮಾನ',
                    'Farming Methods': 'ಕೃಷಿ ವಿಧಾನಗಳು',
                    'Disease Treatments': 'ರೋಗ ಚಿಕಿತ್ಸೆಗಳು',
                    'Market Prices': 'ಮಾರುಕಟ್ಟೆ ಬೆಲೆಗಳು',
                    'Home': 'ಮುಖಪುಟ',
                    'Welcome to AgriGuide': 'ಅಗ್ರಿಗೈಡ್‌ಗೆ ಸುಸ್ವಾಗತ',
                    'Empowering farmers with knowledge': 'ರೈತರಿಗೆ ಜ್ಞಾನದೊಂದಿಗೆ ಸಬಲೀಕರಣ',
                    'Read Aloud': 'ಜೋರಾಗಿ ಓದಿ',
                    'Language': 'ಭಾಷೆ',
                    'Explore': 'ಅನ್ವೇಷಿಸಿ',
                    'Start Listening': 'ಆಲಿಸಲು ಪ್ರಾರಂಭಿಸಿ'
                }
            };
            
            // If we have a demo translation for this language and text
            if (demoTranslations[targetLang] && demoTranslations[targetLang][text]) {
                resolve(demoTranslations[targetLang][text]);
            } else {
                // For words we don't have translations for, just return original
                resolve(text);
            }
        });
    });
}

// Update UI to reflect active language
function updateLanguageUI(langCode) {
    const languageName = availableLanguages[langCode] || 'English';
    const indicator = document.getElementById('currentLanguage');
    if (indicator) {
        indicator.textContent = languageName;
    }
}

// Setup voice readout buttons
function setupVoiceReadout() {
    const voiceButtons = document.querySelectorAll('.voice-readout-btn');
    if (voiceButtons.length > 0) {
        voiceButtons.forEach(button => {
            button.addEventListener('click', function() {
                // Get the content to read (either specified or nearest content container)
                const targetId = this.getAttribute('data-target');
                let contentToRead;
                
                if (targetId) {
                    // Read specific content if target is specified
                    contentToRead = document.getElementById(targetId);
                } else {
                    // Otherwise read the nearest content container
                    contentToRead = this.closest('.container').querySelector('.content-section');
                }
                
                if (contentToRead) {
                    // Get the preferred language
                    const lang = localStorage.getItem('preferredLanguage') || 'en';
                    speakText(contentToRead.textContent.trim(), lang);
                }
            });
        });
    }
}

// Text-to-speech functionality
function speakText(text, lang = 'en') {
    if (!('speechSynthesis' in window)) {
        alert('Sorry, your browser does not support text-to-speech!');
        return;
    }
    
    // Stop any ongoing speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.9; // Slightly slower for better comprehension
    
    window.speechSynthesis.speak(utterance);
}

// Read aloud the main content of the page
function readPageContent() {
    const mainContent = document.querySelector('main');
    if (!mainContent) return;
    
    // Get all text content from main elements, excluding scripts and hidden elements
    let textToRead = '';
    const contentElements = mainContent.querySelectorAll('h1, h2, h3, h4, h5, p, li, td, th');
    
    contentElements.forEach(element => {
        if (element.offsetParent !== null) { // Check if element is visible
            textToRead += element.textContent + '. ';
        }
    });
    
    // Get current language
    const currentLang = document.getElementById('languageSelector')?.value || 'en';
    
    // Read the text
    speakText(textToRead, currentLang);
}

// Initialize voice readout buttons
function initVoiceReadout() {
    const readButtons = document.querySelectorAll('.read-aloud');
    
    readButtons.forEach(button => {
        button.addEventListener('click', function() {
            // If the button has a data-target attribute, read that specific element
            const targetSelector = this.getAttribute('data-target');
            if (targetSelector) {
                const targetElement = document.querySelector(targetSelector);
                if (targetElement) {
                    const currentLang = document.getElementById('languageSelector')?.value || 'en';
                    speakText(targetElement.textContent, currentLang);
                }
            } else {
                // Otherwise read the whole page
                readPageContent();
            }
        });
    });
}

// Load saved language preference
function loadLanguagePreference() {
    const savedLanguage = localStorage.getItem('preferredLanguage');
    if (savedLanguage) {
        const languageSelector = document.getElementById('languageSelector');
        if (languageSelector) {
            languageSelector.value = savedLanguage;
            translatePage(savedLanguage);
        }
    }
}

// Function to mark all translatable elements
function markAllTranslatableElements() {
    // Select all potential text-containing elements
    const textElements = document.querySelectorAll(
        'h1, h2, h3, h4, h5, h6, p, li, button, a, label, th, td, span, div, input[type="submit"], input[type="button"], input[placeholder], option, small, strong, em, b, i, figcaption, blockquote, cite, caption, summary, details'
    );
    
    textElements.forEach(element => {
        // Skip elements that are part of scripts, styles, or already marked
        if (!element.closest('script') && !element.closest('style') && !element.classList.contains('translate')) {
            // Only add translate class if element has text content
            if (element.textContent && element.textContent.trim() !== '') {
                element.classList.add('translate');
            }
            
            // For input elements, handle placeholder text
            if (element.tagName === 'INPUT' && element.placeholder) {
                element.classList.add('translate');
                if (!element.getAttribute('data-original-placeholder')) {
                    element.setAttribute('data-original-placeholder', element.placeholder);
                }
            }
        }
    });
}

// Initialize translation features when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Mark all translatable elements
    markAllTranslatableElements();
    
    // Initialize language selector
    setupLanguageSelector();
    
    // Initialize voice readout
    setupVoiceReadout();
    
    // Load saved language preference
    loadLanguagePreference();
});

// Stop speech when navigating away
window.addEventListener('beforeunload', function() {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
    }
});