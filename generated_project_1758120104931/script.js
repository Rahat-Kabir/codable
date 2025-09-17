// Calculator script
// Declare constants for DOM elements
const display = document.getElementById('display');
const digitButtons = document.querySelectorAll('button[data-type="digit"]');
const operatorButtons = document.querySelectorAll('button[data-type="operator"]');
const equalsButton = document.querySelector('button[data-type="equals"]');
const clearButton = document.querySelector('button[data-type="clear"]');

// State variables
let currentInput = '';
let previousValue = null;
let pendingOperator = null;

// Helper functions
function updateDisplay(value) {
  display.textContent = value;
}

function handleDigit(event) {
  const digit = event.target.dataset.value || event.target.textContent.trim();
  // Use dataset value if provided, otherwise fallback to button text
  currentInput += digit;
  updateDisplay(currentInput);
}

function calculateResult() {
  if (pendingOperator && currentInput !== '') {
    const operand = parseFloat(currentInput);
    let result;
    switch (pendingOperator) {
      case '+':
        result = previousValue + operand;
        break;
      case '-':
        result = previousValue - operand;
        break;
      case '*':
        result = previousValue * operand;
        break;
      case '/':
        result = operand !== 0 ? previousValue / operand : 'Error';
        break;
      default:
        result = 'Error';
    }
    // Update state based on result
    previousValue = typeof result === 'number' ? result : null;
    pendingOperator = null;
    currentInput = '';
    updateDisplay(result);
  }
}

function handleOperator(event) {
  const op = event.target.dataset.value || event.target.textContent.trim();
  if (currentInput === '' && previousValue === null) return;
  if (previousValue === null) {
    previousValue = parseFloat(currentInput);
  } else if (currentInput !== '') {
    // If there's already a pending operation, compute it first
    calculateResult();
    // After calculation, previousValue holds the result
  }
  pendingOperator = op;
  currentInput = '';
}

function handleEquals() {
  calculateResult();
}

function clearDisplay() {
  currentInput = '';
  previousValue = null;
  pendingOperator = null;
  updateDisplay('0');
}

// Attach event listeners
digitButtons.forEach(btn => btn.addEventListener('click', handleDigit));
operatorButtons.forEach(btn => btn.addEventListener('click', handleOperator));
if (equalsButton) equalsButton.addEventListener('click', handleEquals);
if (clearButton) clearButton.addEventListener('click', clearDisplay);

// Export utility functions for potential extensions
window.calculateResult = calculateResult;
