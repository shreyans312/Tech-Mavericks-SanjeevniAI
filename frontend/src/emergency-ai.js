let metronomeInterval = null;
let audioCtx = null;
let isMetronomePlaying = false;
let currentState = {
  intent: null,
  steps: [],
  questions: [],
  followUpIndex: 0
};
let ambulanceRequested = false;
let mobileNumber = '';

function setStatus(msg) {
  document.getElementById('status').textContent = msg;
}

document.addEventListener('DOMContentLoaded', () => {
  initializeEmergencyUI();
});

function initializeEmergencyUI() {
  stopMetronome();
  setStatus('Ready to help');
  currentState = { intent: null, steps: [], questions: [], followUpIndex: 0 };
  document.getElementById('emergencyStep').innerHTML = `
    <div class="text-center">
      <p class="text-lg font-semibold mb-6">Do you need an ambulance?</p>
      <div class="flex justify-center space-x-4">
        <button id="yesAmbulance" class="bg-red-500 text-white px-6 py-3 rounded-lg">Yes</button>
        <button id="noAmbulance" class="bg-blue-500 text-white px-6 py-3 rounded-lg">No</button>
      </div>
    </div>
  `;
  document.getElementById('yesAmbulance').onclick = () => askPhoneNumber();
  document.getElementById('noAmbulance').onclick = () => requestAmbulance(false);
}

function askPhoneNumber() {
  setStatus("Please enter your phone number");
  document.getElementById('emergencyStep').innerHTML = `
    <div class="text-center space-y-4">
      <p class="text-lg">Enter your mobile number for emergency assistance:</p>
      <input id="mobileInput" type="tel" placeholder="+91XXXXXXXXXX" class="w-full p-3 border rounded-lg" />
      <button id="submitPhone" class="bg-red-600 text-white px-6 py-3 rounded-lg w-full">Submit & Continue</button>
    </div>
  `;
  document.getElementById('submitPhone').onclick = () => {
    const input = document.getElementById('mobileInput').value.trim();
    if (/^\+?\d{10,14}$/.test(input)) {
      mobileNumber = input;
      requestAmbulance(true);
    } else {
      alert('Please enter a valid mobile number');
    }
  };
}

function requestAmbulance(needAmbulance) {
  ambulanceRequested = needAmbulance;
  if (needAmbulance) {
    setStatus("Calling emergency helpline 108...");
    setTimeout(() => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(pos => {
          const lat = pos.coords.latitude.toFixed(4);
          const lon = pos.coords.longitude.toFixed(4);
          setStatus(`Help requested via 108. Location sent: ${lat}, ${lon}`);
        }, () => setStatus("Location access denied. Please call 108 manually."));
      } else {
        setStatus("Geolocation not supported. Please call 108 manually.");
      }
    }, 2000);
  }
  startEmergencyAssessment();
}

function startEmergencyAssessment() {
  setStatus("Describe the emergency");
  document.getElementById('emergencyStep').innerHTML = `
    <div class="space-y-4 text-center">
      <p class="text-lg font-semibold">What happened?</p>
      <textarea id="emergencyInput" class="w-full p-3 border rounded-lg h-24 resize-none" placeholder="e.g., person fell, not moving"></textarea>
      <button id="submitEmergency" class="bg-blue-500 text-white px-6 py-3 rounded-lg w-full">Submit</button>
    </div>
  `;
  document.getElementById('submitEmergency').onclick = processEmergency;
}

async function processEmergency() {
  const input = document.getElementById('emergencyInput').value.trim();
  if (!input) return alert("Please describe the emergency.");
  setStatus("Analyzing emergency...");

  const prompt = `
Emergency: ${input}
Create simple steps (max 200 chars each) for people with no medical training, especially poor or middle-class in India. Include basic CPR steps (e.g., 'Press chest with both hands, like pumping water, twice per second') with easy explanations only if no breathing or pulse is implied. Use common items (e.g., cloth for wounds). Embed instructions/questions if obvious. Add separate yes/no or simple questions only if needed. Include India helplines (108, 102) where relevant. Avoid complex terms.

Format:
---
EMERGENCY_TYPE: <type>
STEPS:
1. <step with simple explanation and embedded question if applicable>
2. ...
QUESTIONS:
1. <question if needed and relevant>
2. ...
---`;

  try {
    const res = await fetch("http://localhost:3001/api/openai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, maxTokens: 400 })
    });

    const data = await res.json();
    const content = data.choices[0].message.content.trim();
    const match = content.match(/EMERGENCY_TYPE:(.*)\nSTEPS:(.*)\nQUESTIONS:(.*)/is);

    if (!match) throw new Error("Invalid AI format");

    currentState.intent = match[1].trim();
    currentState.steps = match[2].trim().split(/\n\d+\.\s+/).filter(Boolean);
    currentState.questions = match[3].trim().split(/\n\d+\.\s+/).filter(Boolean);
    currentState.followUpIndex = 0;

    displayCurrentStep();
  } catch (err) {
    console.error(err);
    setStatus("AI not responding. Try again or call 108.");
  }
}

function displayCurrentStep() {
  const idx = currentState.followUpIndex;
  if (idx >= currentState.steps.length) {
    return endEmergencyFlow();
  }

  const step = currentState.steps[idx];
  const question = currentState.questions[idx] || "";
  const total = currentState.steps.length;

  const isYesNo = question.trim().toLowerCase().startsWith("is") || question.toLowerCase().includes("yes or no");

  const isCPRRequired = currentState.intent.toLowerCase().includes("cpr") ||
                        currentState.intent.toLowerCase().includes("cardiac") ||
                        currentState.intent.toLowerCase().includes("resuscitation") ||
                        step.toLowerCase().includes("cpr") ||
                        step.toLowerCase().includes("cardiac") ||
                        step.toLowerCase().includes("resuscitation");

  const metronomeButton = isCPRRequired ? `
    <button id="metronomeBtn" class="bg-yellow-400 px-4 py-2 rounded-lg">
      ${isMetronomePlaying ? "Stop" : "Start"} CPR Metronome
    </button>
  ` : '';

  document.getElementById('emergencyStep').innerHTML = `
    <div class="space-y-4 text-center">
      <p class="text-lg font-semibold">Emergency Response AI</p>
      <p class="text-sm text-gray-500">Immediate first aid assistance</p>
      <p class="text-sm font-semibold">Step ${idx + 1} of ${total}</p>
      <div class="bg-blue-50 p-3 rounded-lg text-base">${step}</div>
      ${metronomeButton}
      ${question ? `<p class="mt-4 font-semibold">${question}</p>` : ''}
      <div id="responseControls" class="space-y-2"></div>
      <button id="nextStepBtn" class="bg-blue-600 text-white px-6 py-3 rounded-lg w-full mt-4">Next Step</button>
    </div>
  `;

  if (isCPRRequired) {
    document.getElementById('metronomeBtn').onclick = toggleMetronome;
  }

  const responseControls = document.getElementById('responseControls');
  if (question && isYesNo) {
    responseControls.innerHTML = `
      <div class="flex justify-center space-x-4">
        <button id="yesBtn" class="bg-green-500 px-4 py-2 text-white rounded-lg">Yes</button>
        <button id="noBtn" class="bg-red-500 px-4 py-2 text-white rounded-lg">No</button>
      </div>
    `;
    document.getElementById('yesBtn').onclick = () => handleUserFeedback('yes');
    document.getElementById('noBtn').onclick = () => handleUserFeedback('no');
  } else if (question) {
    responseControls.innerHTML = `
      <input id="textResponse" type="text" class="border rounded p-2 w-full" placeholder="Type your answer here..." />
      <button id="submitAnswer" class="bg-blue-600 text-white px-4 py-2 rounded-lg w-full">Submit Answer</button>
    `;
    document.getElementById('submitAnswer').onclick = handleTextInput;
  }

  document.getElementById('nextStepBtn').onclick = proceedToNextStep;
}

function handleUserFeedback(answer) {
  processFeedbackAndUpdate(answer);
}

function handleTextInput() {
  const response = document.getElementById('textResponse').value.trim();
  if (!response) return alert("Please enter a response.");
  processFeedbackAndUpdate(response);
}

async function processFeedbackAndUpdate(userAnswer) {
  const step = currentState.steps[currentState.followUpIndex];
  const question = currentState.questions[currentState.followUpIndex];
  const context = `Step: ${step}\nQuestion: ${question || ''}\nUser Response: ${userAnswer}`;

  setStatus("Processing...");
  stopMetronome();

  currentState.followUpIndex++;

  if (currentState.followUpIndex < currentState.steps.length) {
    displayCurrentStep();
    return;
  }

  try {
    const res = await fetch("http://localhost:3001/api/openai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: `Based on this:\n${context}\nGive the next 1 short first-aid step (max 200 chars) for people with no medical training in India. Include basic CPR steps (e.g., 'Press chest with both hands, like pumping water, twice per second') with easy explanations only if no breathing or pulse is implied by response. Use common items (e.g., cloth for wounds). Embed instructions/questions if obvious. Add separate yes/no or simple questions only if needed. Include India helplines (108, 102) where relevant. Avoid complex terms.\nFormat:\nSTEP: <step with layman explanation and embedded question if applicable>\nQUESTION: <question if needed and relevant>`,
        maxTokens: 150
      })
    });

    const data = await res.json();
    const content = data.choices[0].message.content.trim();
    const match = content.match(/STEP:\s*(.*)\nQUESTION:\s*(.*)/i);

    if (!match) {
      return endEmergencyFlow();
    }

    currentState.steps.push(match[1].trim());
    currentState.questions.push(match[2].trim() || "");
    displayCurrentStep();
  } catch (err) {
    console.error(err);
    endEmergencyFlow();
  }
}

function proceedToNextStep() {
  currentState.followUpIndex++;
  if (currentState.followUpIndex < currentState.steps.length) {
    displayCurrentStep();
  } else if (currentState.followUpIndex === currentState.steps.length) {
    processFeedbackAndUpdate(""); // Trigger next step generation if at the end of current steps
  } else {
    endEmergencyFlow();
  }
}

function endEmergencyFlow() {
  stopMetronome();
  setStatus("Emergency session ended. Call 108 if needed.");
  document.getElementById('emergencyStep').innerHTML = `
    <div class="text-center space-y-4">
      <h3 class="text-xl font-semibold text-green-600">Protocol Completed!</h3>
      <p>Keep watching them until help arrives. Call 108 if worse.</p>
      <button id="restartBtn" class="bg-blue-600 px-6 py-3 text-white rounded-lg">
        Start New Emergency
      </button>
    </div>
  `;
  document.getElementById('restartBtn').onclick = initializeEmergencyUI;
}

function toggleMetronome() {
  isMetronomePlaying ? stopMetronome() : startMetronome();
  displayCurrentStep();
}

function startMetronome() {
  const bpm = 110;
  const interval = 60000 / bpm;

  stopMetronome();
  isMetronomePlaying = true;

  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  audioCtx.resume();

  metronomeInterval = setInterval(() => {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.frequency.value = 1000;
    gain.gain.value = 0.2;
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.05);
  }, interval);
}

function stopMetronome() {
  clearInterval(metronomeInterval);
  isMetronomePlaying = false;
}