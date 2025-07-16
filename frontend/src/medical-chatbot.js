let currentState = {
  conversation: [],
  awaitingResponse: false
};

function setStatus(msg) {
  const statusElement = document.getElementById('status');
  if (statusElement) {
    statusElement.textContent = msg;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initializeChatbot();
  
  // Add event listeners
  const submitBtn = document.getElementById('submitBtn');
  const symptomInput = document.getElementById('symptomInput');
  
  if (submitBtn) {
    submitBtn.addEventListener('click', submitSymptom);
  }
  
  if (symptomInput) {
    symptomInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        submitSymptom();
      }
    });
  }
});

function initializeChatbot() {
  setStatus('Medical Assistant Ready');
  currentState = { conversation: [], awaitingResponse: false };
  
  // Add welcome message
  addMessageToChat("Hello! I'm your medical assistant. Please describe your symptoms and I'll provide helpful suggestions. Remember, this is general advice and not a substitute for professional medical consultation.", 'ai');
}

function quickSymptom(symptom) {
  const input = document.getElementById('symptomInput');
  if (input) {
    input.value = symptom;
    submitSymptom();
  }
}

async function submitSymptom() {
  const input = document.getElementById('symptomInput');
  const submitBtn = document.getElementById('submitBtn');
  
  if (!input || !submitBtn) {
    console.error('Required elements not found');
    return;
  }
  
  const inputValue = input.value.trim();
  if (!inputValue || currentState.awaitingResponse) return;
  
  if (inputValue.length < 3) {
    alert("Please provide more details about your symptoms.");
    return;
  }
  
  currentState.awaitingResponse = true;
  setStatus("Analyzing symptoms...");
  
  // Add user message to chat
  addMessageToChat(inputValue, 'user');
  
  // Clear input and disable button
  input.value = '';
  submitBtn.disabled = true;
  submitBtn.textContent = 'Analyzing...';
  
  // Show typing indicator
  showTypingIndicator();
  
  const prompt = `You are a medical assistant helping people in India. Provide helpful cure suggestions for the following symptoms: ${inputValue}

Please structure your response with these sections:
1. CONDITION: Brief assessment of the likely condition
2. HOME REMEDIES: 3-4 simple home remedies using ingredients commonly available in Indian households
3. MEDICATIONS: Over-the-counter medicines available in India (mention specific brands if helpful)
4. LIFESTYLE TIPS: Diet, rest, and lifestyle recommendations
5. WHEN TO SEE DOCTOR: Clear signs when medical consultation is necessary
6. PREVENTION: How to prevent this condition in future

Keep suggestions practical for Indian families. Use simple language and avoid complex medical terms. Always emphasize that this is general advice and not a substitute for professional medical consultation.`;

  try {
    // First, let's test if the server is running
    console.log('Attempting to connect to server...');
    
    const res = await fetch("http://localhost:3001/api/openai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, maxTokens: 600 })
    });

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data = await res.json();
    console.log('Server response:', data);
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error("Invalid response format from server");
    }
    
    const content = data.choices[0].message.content.trim();
    
    // Remove typing indicator
    removeTypingIndicator();
    
    // Add AI response to chat
    addAIResponseToChat(content);
    
    // Store in conversation history
    currentState.conversation.push({
      user: inputValue,
      ai: content,
      timestamp: new Date()
    });
    
    setStatus("Suggestion provided");
    
  } catch (err) {
    console.error('Error details:', err);
    removeTypingIndicator();
    
    // Provide more specific error messages
    let errorMessage = "Sorry, I'm having trouble connecting to the medical assistant. ";
    
    if (err.message.includes('Failed to fetch')) {
      errorMessage += "Please make sure the server is running on http://localhost:3001";
    } else if (err.message.includes('HTTP error')) {
      errorMessage += "Server error: " + err.message;
    } else {
      errorMessage += "Please try again or consult a doctor if this is urgent.";
    }
    
    addMessageToChat(errorMessage, 'ai');
    setStatus("Connection error - Please try again");
  } finally {
    currentState.awaitingResponse = false;
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send';
    }
  }
}

function addMessageToChat(message, sender) {
  const chatMessages = document.getElementById('chatMessages');
  if (!chatMessages) {
    console.error('Chat messages container not found');
    return;
  }
  
  const messageDiv = document.createElement('div');
  
  if (sender === 'user') {
    messageDiv.className = 'flex justify-end mb-4';
    messageDiv.innerHTML = `
      <div class="bg-green-500 text-white px-4 py-2 rounded-lg max-w-xs break-words">
        <p>${escapeHtml(message)}</p>
      </div>
    `;
  } else {
    messageDiv.className = 'flex justify-start mb-4';
    messageDiv.innerHTML = `
      <div class="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg max-w-md break-words">
        <p>${escapeHtml(message)}</p>
      </div>
    `;
  }
  
  chatMessages.appendChild(messageDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function addAIResponseToChat(content) {
  const chatMessages = document.getElementById('chatMessages');
  if (!chatMessages) {
    console.error('Chat messages container not found');
    return;
  }
  
  const responseDiv = document.createElement('div');
  responseDiv.className = 'flex justify-start mb-4';
  
  // Parse the content into sections
  const sections = parseResponse(content);
  
  let responseHTML = '<div class="bg-white border border-gray-200 rounded-lg p-4 max-w-full shadow-sm">';
  
  if (sections.condition) {
    responseHTML += `
      <div class="mb-4">
        <h4 class="font-semibold text-blue-600 mb-2 flex items-center">
          <span class="mr-2">📋</span> Condition Assessment
        </h4>
        <p class="text-gray-700 text-sm">${escapeHtml(sections.condition)}</p>
      </div>
    `;
  }
  
  if (sections.homeRemedies) {
    responseHTML += `
      <div class="mb-4">
        <h4 class="font-semibold text-green-600 mb-2 flex items-center">
          <span class="mr-2">🏠</span> Home Remedies
        </h4>
        <div class="text-gray-700 text-sm">${formatList(sections.homeRemedies)}</div>
      </div>
    `;
  }
  
  if (sections.medications) {
    responseHTML += `
      <div class="mb-4">
        <h4 class="font-semibold text-purple-600 mb-2 flex items-center">
          <span class="mr-2">💊</span> Medications
        </h4>
        <div class="text-gray-700 text-sm">${formatList(sections.medications)}</div>
      </div>
    `;
  }
  
  if (sections.lifestyle) {
    responseHTML += `
      <div class="mb-4">
        <h4 class="font-semibold text-orange-600 mb-2 flex items-center">
          <span class="mr-2">🍎</span> Lifestyle Tips
        </h4>
        <div class="text-gray-700 text-sm">${formatList(sections.lifestyle)}</div>
      </div>
    `;
  }
  
  if (sections.doctor) {
    responseHTML += `
      <div class="mb-4">
        <h4 class="font-semibold text-red-600 mb-2 flex items-center">
          <span class="mr-2">👨‍⚕️</span> When to See a Doctor
        </h4>
        <div class="text-gray-700 text-sm bg-red-50 p-3 rounded border-l-4 border-red-400">
          ${formatList(sections.doctor)}
        </div>
      </div>
    `;
  }
  
  if (sections.prevention) {
    responseHTML += `
      <div class="mb-4">
        <h4 class="font-semibold text-indigo-600 mb-2 flex items-center">
          <span class="mr-2">🛡️</span> Prevention
        </h4>
        <div class="text-gray-700 text-sm">${formatList(sections.prevention)}</div>
      </div>
    `;
  }
  
  responseHTML += `
    <div class="mt-4 pt-3 border-t border-gray-200">
      <div class="flex space-x-2">
        <button onclick="askFollowUp()" class="bg-blue-100 text-blue-600 px-3 py-1 rounded text-xs hover:bg-blue-200 transition-colors">
          Ask Follow-up
        </button>
        <button onclick="newConsultation()" class="bg-gray-100 text-gray-600 px-3 py-1 rounded text-xs hover:bg-gray-200 transition-colors">
          New Symptoms
        </button>
      </div>
      <p class="text-xs text-gray-500 mt-2">⚠️ This is general advice. Consult a doctor for proper diagnosis.</p>
    </div>
  </div>`;
  
  responseDiv.innerHTML = responseHTML;
  chatMessages.appendChild(responseDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function parseResponse(content) {
  const sections = {};
  
  // Try to extract sections based on numbered format or keywords
  const lines = content.split('\n');
  let currentSection = '';
  let currentContent = '';
  
  for (let line of lines) {
    line = line.trim();
    
    if (line.match(/^\d+\.\s*CONDITION/i) || line.match(/CONDITION:/i)) {
      if (currentSection) sections[currentSection] = currentContent.trim();
      currentSection = 'condition';
      currentContent = line.replace(/^\d+\.\s*CONDITION:?/i, '').trim();
    } else if (line.match(/^\d+\.\s*HOME.REMEDIES/i) || line.match(/HOME.REMEDIES:/i)) {
      if (currentSection) sections[currentSection] = currentContent.trim();
      currentSection = 'homeRemedies';
      currentContent = line.replace(/^\d+\.\s*HOME.REMEDIES:?/i, '').trim();
    } else if (line.match(/^\d+\.\s*MEDICATIONS/i) || line.match(/MEDICATIONS:/i)) {
      if (currentSection) sections[currentSection] = currentContent.trim();
      currentSection = 'medications';
      currentContent = line.replace(/^\d+\.\s*MEDICATIONS:?/i, '').trim();
    } else if (line.match(/^\d+\.\s*LIFESTYLE/i) || line.match(/LIFESTYLE:/i)) {
      if (currentSection) sections[currentSection] = currentContent.trim();
      currentSection = 'lifestyle';
      currentContent = line.replace(/^\d+\.\s*LIFESTYLE:?/i, '').trim();
    } else if (line.match(/^\d+\.\s*WHEN.TO.SEE.DOCTOR/i) || line.match(/WHEN.TO.SEE.DOCTOR:/i)) {
      if (currentSection) sections[currentSection] = currentContent.trim();
      currentSection = 'doctor';
      currentContent = line.replace(/^\d+\.\s*WHEN.TO.SEE.DOCTOR:?/i, '').trim();
    } else if (line.match(/^\d+\.\s*PREVENTION/i) || line.match(/PREVENTION:/i)) {
      if (currentSection) sections[currentSection] = currentContent.trim();
      currentSection = 'prevention';
      currentContent = line.replace(/^\d+\.\s*PREVENTION:?/i, '').trim();
    } else if (line && currentSection) {
      currentContent += '\n' + line;
    }
  }
  
  // Don't forget the last section
  if (currentSection) sections[currentSection] = currentContent.trim();
  
  // If no sections found, treat entire content as general advice
  if (Object.keys(sections).length === 0) {
    sections.condition = content;
  }
  
  return sections;
}

function formatList(text) {
  if (!text) return '';
  
  // Convert line breaks to HTML and format lists
  return escapeHtml(text)
    .replace(/\n\s*[-•*]\s*/g, '<br>• ')
    .replace(/\n\s*\d+\.\s*/g, '<br>• ')
    .replace(/\n/g, '<br>')
    .replace(/^[-•*]\s*/, '• ');
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function showTypingIndicator() {
  const chatMessages = document.getElementById('chatMessages');
  if (!chatMessages) return;
  
  const typingDiv = document.createElement('div');
  typingDiv.id = 'typingIndicator';
  typingDiv.className = 'flex justify-start mb-4';
  typingDiv.innerHTML = `
    <div class="bg-gray-200 text-gray-500 px-4 py-2 rounded-lg">
      <div class="flex space-x-1">
        <div class="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
        <div class="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style="animation-delay: 0.1s"></div>
        <div class="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style="animation-delay: 0.2s"></div>
      </div>
    </div>
  `;
  
  chatMessages.appendChild(typingDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function removeTypingIndicator() {
  const typingIndicator = document.getElementById('typingIndicator');
  if (typingIndicator) {
    typingIndicator.remove();
  }
}

function askFollowUp() {
  const input = document.getElementById('symptomInput');
  if (input) {
    input.placeholder = "Ask a follow-up question about your symptoms or treatment...";
    input.focus();
  }
}

function newConsultation() {
  const input = document.getElementById('symptomInput');
  if (input) {
    input.placeholder = "Describe your symptoms in detail...";
    input.focus();
  }
}

// Add some debugging
console.log('Medical chatbot script loaded');

// Test function to check if elements exist
function debugElements() {
  console.log('Submit button:', document.getElementById('submitBtn'));
  console.log('Symptom input:', document.getElementById('symptomInput'));
  console.log('Chat messages:', document.getElementById('chatMessages'));
  console.log('Status element:', document.getElementById('status'));
}

// Call debug function after DOM loads
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(debugElements, 100);
});