// State management
const state = {
    currentTemp: 22,
    targetTemp: 22,
    mode: 'heat',
    fanOn: false,
    connected: true
};

// DOM elements
const elements = {
    currentTemp: document.getElementById('currentTemp'),
    targetTemp: document.getElementById('targetTemp'),
    tempSlider: document.getElementById('tempSlider'),
    decreaseBtn: document.getElementById('decreaseBtn'),
    increaseBtn: document.getElementById('increaseBtn'),
    heatBtn: document.getElementById('heatBtn'),
    coolBtn: document.getElementById('coolBtn'),
    autoBtn: document.getElementById('autoBtn'),
    offBtn: document.getElementById('offBtn'),
    fanToggle: document.getElementById('fanToggle'),
    fanStatus: document.getElementById('fanStatus'),
    statusDot: document.getElementById('statusDot'),
    statusText: document.getElementById('statusText'),
    energyFill: document.getElementById('energyFill'),
    energyText: document.getElementById('energyText')
};

// Initialize
function init() {
    updateDisplay();
    setupEventListeners();
    simulateTemperature();
    updateEnergyEfficiency();
}

// Event listeners
function setupEventListeners() {
    // Temperature controls
    elements.decreaseBtn.addEventListener('click', () => adjustTemperature(-1));
    elements.increaseBtn.addEventListener('click', () => adjustTemperature(1));
    elements.tempSlider.addEventListener('input', (e) => {
        state.targetTemp = parseInt(e.target.value);
        updateDisplay();
        updateEnergyEfficiency();
    });

    // Mode buttons
    [elements.heatBtn, elements.coolBtn, elements.autoBtn, elements.offBtn].forEach(btn => {
        btn.addEventListener('click', () => {
            state.mode = btn.dataset.mode;
            updateModeButtons();
            updateEnergyEfficiency();
        });
    });

    // Fan toggle
    elements.fanToggle.addEventListener('change', (e) => {
        state.fanOn = e.target.checked;
        elements.fanStatus.textContent = state.fanOn ? 'On' : 'Auto';
        updateEnergyEfficiency();
    });
}

// Temperature adjustment
function adjustTemperature(change) {
    state.targetTemp = Math.max(16, Math.min(29, state.targetTemp + change));
    elements.tempSlider.value = state.targetTemp;
    updateDisplay();
    updateEnergyEfficiency();
    
    // Visual feedback
    elements.targetTemp.style.transform = 'scale(1.1)';
    setTimeout(() => {
        elements.targetTemp.style.transform = 'scale(1)';
    }, 200);
}

// Update display
function updateDisplay() {
    elements.currentTemp.textContent = state.currentTemp;
    elements.targetTemp.textContent = state.targetTemp;
    elements.tempSlider.value = state.targetTemp;
}

// Update mode buttons
function updateModeButtons() {
    [elements.heatBtn, elements.coolBtn, elements.autoBtn, elements.offBtn].forEach(btn => {
        btn.classList.toggle('active', btn.dataset.mode === state.mode);
    });
}

// Simulate temperature changes
function simulateTemperature() {
    setInterval(() => {
        if (state.mode === 'off') {
            // Temperature drifts when off
            const drift = (Math.random() - 0.5) * 0.1;
            state.currentTemp = Math.max(18, Math.min(27, state.currentTemp + drift));
        } else {
            // Temperature moves toward target
            const diff = state.targetTemp - state.currentTemp;
            const change = Math.sign(diff) * Math.min(Math.abs(diff), 0.2);
            state.currentTemp += change;
        }
        
        // Update display with animation
        elements.currentTemp.textContent = Math.round(state.currentTemp);
        elements.currentTemp.classList.add('updating');
        setTimeout(() => {
            elements.currentTemp.classList.remove('updating');
        }, 300);
    }, 2000);
}

// Update energy efficiency
function updateEnergyEfficiency() {
    let efficiency = 100;
    
    // Mode impact
    if (state.mode === 'off') efficiency = 100;
    else if (state.mode === 'auto') efficiency -= 10;
    else if (state.mode === 'heat' || state.mode === 'cool') efficiency -= 15;
    
    // Temperature difference impact
    const tempDiff = Math.abs(state.targetTemp - 22);
    efficiency -= tempDiff * 2;
    
    // Fan impact
    if (state.fanOn) efficiency -= 5;
    
    efficiency = Math.max(0, Math.min(100, efficiency));
    
    // Update display
    elements.energyFill.style.width = `${efficiency}%`;
    
    // Update text
    if (efficiency >= 80) {
        elements.energyText.textContent = 'Excellent';
        elements.energyFill.style.background = 'linear-gradient(90deg, #4caf50, #8bc34a)';
    } else if (efficiency >= 60) {
        elements.energyText.textContent = 'Good';
        elements.energyFill.style.background = 'linear-gradient(90deg, #8bc34a, #ffeb3b)';
    } else if (efficiency >= 40) {
        elements.energyText.textContent = 'Fair';
        elements.energyFill.style.background = 'linear-gradient(90deg, #ffeb3b, #ff9800)';
    } else {
        elements.energyText.textContent = 'Poor';
        elements.energyFill.style.background = 'linear-gradient(90deg, #ff9800, #f44336)';
    }
}

// Connection status simulation
function simulateConnection() {
    setInterval(() => {
        if (Math.random() > 0.95) {
            state.connected = !state.connected;
            elements.statusDot.classList.toggle('disconnected', !state.connected);
            elements.statusText.textContent = state.connected ? 'Connected' : 'Disconnected';
        }
    }, 5000);
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    init();
    simulateConnection();
});