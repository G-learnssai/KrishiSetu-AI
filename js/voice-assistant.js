// Voice Assistant Engine for KrishiSetu AI
// Uses Web Speech API for real Speech Recognition & Speech Synthesis in supported browsers (Chrome, Edge, Safari)
// Provides clear status feedback and honest capability disclaimers.

class KrishiVoiceAssistant {
  constructor() {
    this.recognition = null;
    this.isListening = false;
    this.synth = window.speechSynthesis || null;
    this.currentLanguage = 'en';

    this.langCodes = {
      en: 'en-IN',
      kn: 'kn-IN',
      hi: 'hi-IN'
    };

    this.initSpeechRecognition();
  }

  initSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;

      this.recognition.onstart = () => {
        this.isListening = true;
        this.updateMicUI(true);
        this.setAssistantStatus('listening');
      };

      this.recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        const inputField = document.getElementById('voiceInputText');
        if (inputField) {
          inputField.value = transcript;
        }
        this.processQuery(transcript);
      };

      this.recognition.onerror = (event) => {
        console.warn('Speech recognition error:', event.error);
        this.isListening = false;
        this.updateMicUI(false);
        this.setAssistantStatus('error', event.error);
      };

      this.recognition.onend = () => {
        this.isListening = false;
        this.updateMicUI(false);
      };
    } else {
      console.log('Web Speech Recognition API is not supported in this browser. Fallback text input is active.');
    }
  }

  setLanguage(lang) {
    this.currentLanguage = lang;
    if (this.recognition) {
      this.recognition.lang = this.langCodes[lang] || 'en-IN';
    }
  }

  toggleListening() {
    if (!this.recognition) {
      alert("Voice recognition isn't supported in this browser. Please use Google Chrome or Microsoft Edge, or type your question below!");
      return;
    }

    if (this.isListening) {
      this.recognition.stop();
      this.isListening = false;
      this.updateMicUI(false);
      this.setAssistantStatus('ready');
    } else {
      try {
        this.recognition.lang = this.langCodes[this.currentLanguage] || 'en-IN';
        this.recognition.start();
      } catch (err) {
        console.error('Failed to start speech recognition:', err);
      }
    }
  }

  updateMicUI(active) {
    const micBtns = document.querySelectorAll('.mic-trigger-btn');
    micBtns.forEach(btn => {
      if (active) {
        btn.classList.add('mic-active');
      } else {
        btn.classList.remove('mic-active');
      }
    });

    const waveAnim = document.getElementById('voiceWaveAnim');
    if (waveAnim) {
      waveAnim.style.display = active ? 'flex' : 'none';
    }
  }

  setAssistantStatus(state, errorMsg = '') {
    const statusText = document.getElementById('assistantStatusText');
    if (!statusText) return;

    if (state === 'listening') {
      const texts = {
        en: 'Listening to you... Please speak clearly.',
        kn: 'ನಿಮ್ಮ ಧ್ವನಿಯನ್ನು ಆಲಿಸಲಾಗುತ್ತಿದೆ... ಮಾತನಾಡಿ.',
        hi: 'आपकी आवाज़ सुनी जा रही है... कृपया बोलिए।'
      };
      statusText.innerText = texts[this.currentLanguage] || texts.en;
      statusText.className = 'status-tag status-listening';
    } else if (state === 'thinking') {
      const texts = {
        en: 'Analyzing agricultural query...',
        kn: 'ಕೃಷಿ ಪ್ರಶ್ನೆಯನ್ನು ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ...',
        hi: 'कृषि प्रश्न का विश्लेषण किया जा रहा है...'
      };
      statusText.innerText = texts[this.currentLanguage] || texts.en;
      statusText.className = 'status-tag status-thinking';
    } else if (state === 'error') {
      statusText.innerText = `Mic alert (${errorMsg || 'Permission needed'}). You can type below!`;
      statusText.className = 'status-tag status-error';
    } else {
      const texts = {
        en: 'Ready to listen. Tap the microphone.',
        kn: 'ಆಲಿಸಲು ಸಿದ್ಧವಾಗಿದೆ. ಮೈಕ್ ಒತ್ತಿ.',
        hi: 'सुनने के लिए तैयार। माइक पर टैप करें।'
      };
      statusText.innerText = texts[this.currentLanguage] || texts.en;
      statusText.className = 'status-tag status-ready';
    }
  }

  speakResponse(text) {
    if (!this.synth) return;
    try {
      this.synth.cancel(); // stop any ongoing speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = this.langCodes[this.currentLanguage] || 'en-IN';
      utterance.rate = 0.95; // slightly slower for farmer clarity
      utterance.pitch = 1.0;
      this.synth.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis warning:', e);
    }
  }

  processQuery(query) {
    if (!query || !query.trim()) return;

    this.setAssistantStatus('thinking');
    const normalized = query.toLowerCase();

    // Append user message to chat UI
    this.addChatMessage('user', query);

    setTimeout(() => {
      const response = this.generateResponse(normalized);
      this.addChatMessage('assistant', response.text);
      this.speakResponse(response.speechText || response.text);
      this.setAssistantStatus('ready');
    }, 600);
  }

  generateResponse(query) {
    const lang = this.currentLanguage;

    // Tomato / Vegetable prices
    if (query.includes('tomato') || query.includes('ಟೊಮೆಟೊ') || query.includes('टमाटर') || query.includes('price') || query.includes('ಬೆಲೆ') || query.includes('भाव')) {
      if (lang === 'kn') {
        return {
          text: "ಇಂದಿನ ಕೋಲಾರ ಮತ್ತು ಬೆಂಗಳೂರು APMC ಮಾರುಕಟ್ಟೆಯಲ್ಲಿ ಉತ್ತಮ ದರ್ಜೆಯ ಟೊಮೆಟೊ 15 ಕೆಜಿ ಬಾಕ್ಸ್ ₹320 ರಿಂದ ₹380 ರಷ್ಟಿದೆ (ಪ್ರತಿ ಕೆಜಿಗೆ ಸುಮಾರು ₹22 - ₹25). 'ಬೆಳೆ ಮಾರಾಟ' ವಿಭಾಗದಲ್ಲಿ ನಿಮ್ಮ ಬೆಳೆಯನ್ನು ನೇರವಾಗಿ ನಮೂದಿಸಿ ಉತ್ತಮ ದರ ಪಡೆಯಬಹುದು.",
          speechText: "ಇಂದಿನ ಮಾರುಕಟ್ಟೆಯಲ್ಲಿ ಟೊಮೆಟೊ ಪ್ರತಿ ಕೆಜಿಗೆ 22 ರಿಂದ 25 ರೂಪಾಯಿ ಇದೆ."
        };
      } else if (lang === 'hi') {
        return {
          text: "आज की प्रमुख मंडियों में बढ़िया ग्रेड टमाटर का भाव ₹2,200 से ₹2,500 प्रति क्विंटल (लगभग ₹22 से ₹25 प्रति किलो) चल रहा है। बेहतर मुनाफे के लिए 'फसल बेचें' सेक्शन में सीधे खरीदारों से जुड़ें।",
          speechText: "आज टमाटर का भाव लगभग बाइस से पच्चीस रुपये प्रति किलो है।"
        };
      } else {
        return {
          text: "Today's modal mandi price for Grade-A Tomato across major APMCs is ₹2,200 - ₹2,500 per quintal (~₹22 - ₹25/kg). You can list your stock directly in the 'Sell Crops' section to reach bulk buyers.",
          speechText: "Today's tomato price is approximately 22 to 25 rupees per kilogram."
        };
      }
    }

    // Machinery rental
    if (query.includes('tractor') || query.includes('rent') || query.includes('machinery') || query.includes('ಟ್ರಾಕ್ಟರ್') || query.includes('ಬಾಡಿಗೆ') || query.includes('किराया')) {
      if (lang === 'kn') {
        return {
          text: "ಕೃಷಿಸೇತು ಮೂಲಕ ನೀವು 45 HP ಟ್ರಾಕ್ಟರ್ ಅನ್ನು ಗಂಟೆಗೆ ₹850 ಕ್ಕೆ ಮತ್ತು ಕಂಬೈನ್ ಹಾರ್ವೆಸ್ಟರ್ ಅನ್ನು ಗಂಟೆಗೆ ₹2,200 ಕ್ಕೆ ಬುಕ್ ಮಾಡಬಹುದು. ಮುಖಪುಟದಲ್ಲಿರುವ 'ಯಂತ್ರ ಬಾಡಿಗೆ' ಕಾರ್ಡ್ ಒತ್ತಿ ಸ್ಥಳೀಯ ಮಾಲೀಕರೊಂದಿಗೆ ನೇರ ಸಂಪರ್ಕ ಸಾಧಿಸಿ.",
          speechText: "ನೀವು 45 ಎಚ್‌ಪಿ ಟ್ರಾಕ್ಟರ್ ಅನ್ನು ಗಂಟೆಗೆ 850 ರೂಪಾಯಿಗೆ ಬಾಡಿಗೆಗೆ ಪಡೆಯಬಹುದು. ಯಂತ್ರ ಬಾಡಿಗೆ ಕಾರ್ಡ್ ಒತ್ತಿರಿ."
        };
      } else if (lang === 'hi') {
        return {
          text: "कृषिसेतु के माध्यम से आप 45 एचपी ट्रैक्टर ₹850 प्रति घंटे और कंबाइन हार्वेस्टर ₹2,200 प्रति घंटे पर बुक कर सकते हैं। अधिक जानकारी के लिए 'मशीनरी किराया' कार्ड खोलें।",
          speechText: "आप 45 एचपी ट्रैक्टर आठ सौ पचास रुपये प्रति घंटे में किराए पर ले सकते हैं।"
        };
      } else {
        return {
          text: "You can rent 45 HP Tractors starting from ₹850/hr and Combine Harvesters from ₹2,200/hr directly from verified local owners. Tap the 'Rent Machinery' card to request a booking.",
          speechText: "45 HP Tractors are available for rent starting at 850 rupees per hour."
        };
      }
    }

    // Profit Calculator
    if (query.includes('profit') || query.includes('calculate') || query.includes('cost') || query.includes('ಲಾಭ') || query.includes('ಲೆಕ್ಕ') || query.includes('मुनाफ़ा')) {
      if (lang === 'kn') {
        return {
          text: "ನಿಮ್ಮ ಬೆಳೆಯ ನಿವ್ವಳ ಲಾಭ ತಿಳಿಯಲು 'ಲಾಭ ಲೆಕ್ಕಾಚಾರ' ಟೂಲ್ ಬಳಸಿ. ನಿಮ್ಮ ಎಕರೆ ವಿಸ್ತೀರ್ಣ, ಬೀಜ-ಗೊಬ್ಬರದ ವೆಚ್ಚ ಮತ್ತು ನಿರೀಕ್ಷಿತ ಇಳುವರಿಯನ್ನು ನಮೂದಿಸಿದರೆ, ಅದು ನಿಮ್ಮ ಹೂಡಿಕೆಯ ಮೇಲಿನ ಆದಾಯವನ್ನು (ROI) ತಕ್ಷಣ ಲೆಕ್ಕಹಾಕುತ್ತದೆ.",
          speechText: "ಲಾಭ ಲೆಕ್ಕಾಚಾರ ಮಾಡಲು ಮುಖಪುಟದ ಕ್ಯಾಲ್ಕುಲೇಟರ್ ಕಾರ್ಡ್ ಒತ್ತಿರಿ."
        };
      } else if (lang === 'hi') {
        return {
          text: "फसल के शुद्ध मुनाफ़े के लिए 'मुनाफ़ा कैलकुलेटर' खोलें। अपनी ज़मीन, बीज-खाद की लागत और अपेक्षित उपज दर्ज करें — कैलकुलेटर तुरंत आपको शुद्ध लाभ और ROI बता देगा।",
          speechText: "मुनाफ़ा निकालने के लिए हमारे मुनाफ़ा कैलकुलेटर कार्ड का उपयोग करें।"
        };
      } else {
        return {
          text: "To know your net farm earnings, open the 'Calculate Profit' tool. Enter your land acreage, input costs, and estimated yield to get instant revenue, net margin, and ROI metrics.",
          speechText: "Please open the Calculate Profit tool on the homepage to estimate your net earnings."
        };
      }
    }

    // Buyers
    if (query.includes('buyer') || query.includes('fpo') || query.includes('ಖರೀದಿದಾರ') || query.includes('खरीदार')) {
      if (lang === 'kn') {
        return {
          text: "ನಮ್ಮ ಬಳಿ 40ಕ್ಕೂ ಹೆಚ್ಚು ನೋಂದಾಯಿತ ಎಫ್‌ಪಿಒಗಳು ಮತ್ತು ದ್ವಿದಳ ಧಾನ್ಯ, ತರಕಾರಿ, ರಾಗಿ ಖರೀದಿದಾರರಿದ್ದಾರೆ. 'ಖರೀದಿದಾರರನ್ನು ಹುಡುಕಿ' ವಿಭಾಗದಲ್ಲಿ ನೀವು ಅವರನ್ನು ನೇರವಾಗಿ ಫೋನ್ ಮೂಲಕ ಸಂಪರ್ಕಿಸಬಹುದು.",
          speechText: "ಅಧಿಕೃತ ಖರೀದಿದಾರರನ್ನು ಸಂಪರ್ಕಿಸಲು ಖರೀದಿದಾರರನ್ನು ಹುಡುಕಿ ಕಾರ್ಡ್ ತೆರೆಯಿರಿ."
        };
      } else if (lang === 'hi') {
        return {
          text: "हमारे पास 40 से अधिक सत्यापित एफपीओ और अनाज, दाल एवं सब्जियों के व्यापारी उपलब्ध हैं। 'खरीदार खोजें' सेक्शन में जाकर आप सीधे फोन पर बात कर सकते हैं।",
          speechText: "सत्यापित खरीदारों की सूची देखने के लिए खरीदार खोजें विकल्प चुनें।"
        };
      } else {
        return {
          text: "We have over 40+ verified Farmer Producer Organizations (FPOs) and certified buyers for grains, pulses, and vegetables. Tap 'Find Buyers' to view phone numbers and locations.",
          speechText: "Over 40 verified buyers and FPOs are available in the Find Buyers directory."
        };
      }
    }

    // Default polite response
    if (lang === 'kn') {
      return {
        text: `ಧನ್ಯವಾದಗಳು! ನಿಮ್ಮ ಪ್ರಶ್ನೆಗೆ: "${query}". ಕೃಷಿಸೇತು AI ಮಾದರಿಯಲ್ಲಿ ಈ ಮಾಹಿತಿ ಸಂಗ್ರಹವಾಗಿದೆ. ನೀವು ಟ್ರಾಕ್ಟರ್ ಬಾಡಿಗೆ, ಟೊಮೆಟೊ ಮಾರುಕಟ್ಟೆ ದರ ಅಥವಾ ಲಾಭ ಲೆಕ್ಕಾಚಾರದ ಬಗ್ಗೆ ಕೇಳಬಹುದು!`,
        speechText: "ಧನ್ಯವಾದಗಳು. ನೀವು ಯಂತ್ರ ಬಾಡಿಗೆ, ಬೆಳೆ ದರ ಅಥವಾ ಲಾಭ ಲೆಕ್ಕಾಚಾರದ ಬಗ್ಗೆ ಕೇಳಬಹುದು."
      };
    } else if (lang === 'hi') {
      return {
        text: `धन्यवाद! आपके प्रश्न: "${query}" को नोट कर लिया गया है। इस प्रोटोटाइप में आप मंडी भाव, ट्रैक्टर किराया, फसल बिक्री या मुनाफ़ा कैलकुलेटर के बारे में पूछ सकते हैं!`,
        speechText: "धन्यवाद। आप मंडी भाव, ट्रैक्टर किराया या मुनाफ़े के बारे में पूछ सकते हैं।"
      };
    } else {
      return {
        text: `Thank you! I processed your query: "${query}". In this hackathon prototype, you can ask about today's mandi prices, tractor rental rates, crop listing, or farm profit calculations.`,
        speechText: "Thank you. You can ask me about mandi rates, machinery rental, or profit calculation."
      };
    }
  }

  addChatMessage(sender, text) {
    const chatContainer = document.getElementById('voiceChatHistory');
    if (!chatContainer) return;

    const msgDiv = document.createElement('div');
    msgDiv.className = `chat-bubble chat-${sender}`;

    const icon = sender === 'user' ? '👤' : '🌾';
    const senderName = sender === 'user' ? (this.currentLanguage === 'kn' ? 'ನೀವು' : this.currentLanguage === 'hi' ? 'आप' : 'You') : 'KrishiSetu AI';

    msgDiv.innerHTML = `
      <div class="bubble-header">
        <span class="bubble-avatar">${icon}</span>
        <strong>${senderName}</strong>
      </div>
      <div class="bubble-content">${text}</div>
    `;

    chatContainer.appendChild(msgDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
  }
}

// Global instance
window.krishiVoice = new KrishiVoiceAssistant();
