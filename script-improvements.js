// Improvements for the script.js

// Better validation function
function validateInput(input) {
    if (!input || typeof input !== 'string') {
        throw new Error('Invalid input.');
    }
    return input.trim();
}

// Modal for editing instead of prompt
function openEditModal(currentValue, callback) {
    const modal = document.createElement('div');
    modal.innerHTML = `<div><input type='text' value='${currentValue}' /><button id='save'>Save</button></div>`;
    document.body.appendChild(modal);
    modal.querySelector('#save').onclick = () => {
        callback(validateInput(modal.querySelector('input').value));
        document.body.removeChild(modal);
    };
}

// Try-catch error handling
function executeWithErrorHandling(fn) {
    try {
        fn();
    } catch (error) {
        console.error('Error executing function:', error);
    }
}

// Debounce function
function debounce(func, delay) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), delay);
    };
}

// Theme-aware chart colors
function getChartColors(theme) {
    const colors = theme === 'dark' ? ['#fff', '#1f1f1f'] : ['#000', '#f0f0f0'];
    return colors;
}

// Toast notifications
function showToast(message, duration = 3000) {
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.position = 'fixed';
    toast.style.bottom = '10px';
    toast.style.right = '10px';
    toast.style.backgroundColor = '#333';
    toast.style.color = '#fff';
    toast.style.padding = '10px';
    document.body.appendChild(toast);
    setTimeout(() => document.body.removeChild(toast), duration);
}

// LocalStorage cleanup
function clearLocalStorage() {
    localStorage.clear();
    showToast('Local storage cleared!');
}

// Exporting improvements
export { validateInput, openEditModal, executeWithErrorHandling, debounce, getChartColors, showToast, clearLocalStorage };