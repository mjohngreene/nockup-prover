javascript
// API base URL
const API_BASE = '/api/v1';

// DOM elements
const submitForm = document.getElementById('submit-form');
const submitResult = document.getElementById('submit-result');
const snarkList = document.getElementById('snark-list');
const refreshBtn = document.getElementById('refresh-btn');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    loadSnarks();
    log('Prover UI loaded');
});

function setupEventListeners() {
    submitForm.addEventListener('submit', handleSubmit);
    refreshBtn.addEventListener('click', loadSnarks);
}

// Handle SNARK submission
async function handleSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(submitForm);
    const publicInputs = formData.get('public-inputs')
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);
    
    const submission = {
        proof: formData.get('proof-data'),
        public_inputs: publicInputs,
        verification_key: formData.get('verification-key'),
        proof_system: formData.get('proof-system'),
        submitter: formData.get('submitter'),
        notes: formData.get('notes') || null
    };

    // Validate Base64
    if (!isValidBase64(submission.proof)) {
        showResult('✗ Invalid Base64 encoding in proof data', 'error');
        return;
    }
    if (!isValidBase64(submission.verification_key)) {
        showResult('✗ Invalid Base64 encoding in verification key', 'error');
        return;
    }

    try {
        showResult('Submitting SNARK...', 'info');
        
        const response = await fetch(`${API_BASE}/snark`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(submission)
        });

        const result = await response.json();

        if (response.ok) {
            showResult(`✓ SNARK submitted successfully! ID: ${result.id || 'unknown'}`, 'success');
            submitForm.reset();
            setTimeout(loadSnarks, 500); // Refresh list
        } else {
            showResult(`✗ Error: ${result.error || 'Submission failed'}`, 'error');
        }
    } catch (error) {
        console.error('Submission error:', error);
        showResult('✗ Network error occurred', 'error');
    }
}

// Load and display SNARKs
async function loadSnarks() {
    try {
        const response = await fetch(`${API_BASE}/snarks`);
        const data = await response.json();

        if (data.snarks && data.snarks.length > 0) {
            displaySnarks(data.snarks);
        } else {
            snarkList.innerHTML = 'No SNARKs submitted yet.';
        }
    } catch (error) {
        console.error('Error loading SNARKs:', error);
        snarkList.innerHTML = 'Failed to load SNARKs';
    }
}

// Display SNARKs in the list
function displaySnarks(snarks) {
    snarkList.innerHTML = snarks.map(snark => `
        
            
                #${snark.id}
                ${snark.proof_system.toUpperCase()}
                ${snark.status}
            
            
                
                    Submitter:
                    ${escapeHtml(snark.submitter)}
                
                
                    Submitted:
                    ${formatDate(snark.submitted)}
                
                ${snark.notes ? `
                
                    Notes:
                    ${escapeHtml(snark.notes)}
                
                ` : ''}
                ${snark.error_message ? `
                
                    Error:
                    ${escapeHtml(snark.error_message)}
                
                ` : ''}
            
            
                View Details
                Delete
            
        
    `).join('');
}

// View SNARK details
async function viewDetails(id) {
    try {
        const response = await fetch(`${API_BASE}/snark/${id}`);
        const snark = await response.json();
        
        if (response.ok) {
            alert(`SNARK #${id}\nStatus: ${snark.status}\nProof System: ${snark.proof_system}\nSubmitter: ${snark.submitter}`);
        } else {
            alert(`Error: ${snark.error || 'Failed to load details'}`);
        }
    } catch (error) {
        console.error('Error fetching details:', error);
        alert('Network error occurred');
    }
}

// Delete SNARK
async function deleteSnark(id) {
    if (!confirm(`Are you sure you want to delete SNARK #${id}?`)) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/snark/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            log(`SNARK #${id} deleted`);
            loadSnarks(); // Refresh list
        } else {
            const data = await response.json();
            alert(`Failed to delete: ${data.error || 'Unknown error'}`);
        }
    } catch (error) {
        console.error('Error deleting SNARK:', error);
        alert('Network error occurred');
    }
}

// Show result message
function showResult(message, type) {
    submitResult.textContent = message;
    submitResult.className = `result-message ${type}`;
    submitResult.style.display = 'block';
    
    setTimeout(() => {
        submitResult.style.display = 'none';
    }, 5000);
}

// Utility: Format date
function formatDate(dateStr) {
    if (!dateStr) return 'Unknown';
    const date = new Date(dateStr);
    return date.toLocaleString();
}

// Utility: Validate Base64
function isValidBase64(str) {
    if (!str || str.length === 0) return false;
    try {
        return btoa(atob(str)) === str;
    } catch (err) {
        return false;
    }
}

// Utility: Escape HTML
function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&")
        .replace(//g, ">")
        .replace(/"/g, """)
        .replace(/'/g, "'");
}

// Utility: Log to console
function log(message) {
    console.log(`[Prover] ${message}`);
}
