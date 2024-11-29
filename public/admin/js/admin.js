// Admin Dashboard JavaScript

let estimatesTable;
let contactsTable;
let currentUser = null;

// Check authentication status
async function checkAuth() {
    try {
        const response = await fetch('/api/auth/status');
        if (!response.ok) {
            window.location.href = '/admin/login.html';
            return;
        }
        const data = await response.json();
        currentUser = data.user;
    } catch (error) {
        console.error('Auth check failed:', error);
        window.location.href = '/admin/login.html';
    }
}

// Initialize DataTables
function initTables() {
    estimatesTable = new simpleDatatables.DataTable("#estimatesTable", {
        searchable: true,
        fixedHeight: true,
        perPage: 10
    });

    contactsTable = new simpleDatatables.DataTable("#contactsTable", {
        searchable: true,
        fixedHeight: true,
        perPage: 10
    });
}

// Load Estimates
async function loadEstimates() {
    try {
        const response = await fetch('/api/estimates');
        const estimates = await response.json();
        
        const tableData = estimates.map(estimate => [
            new Date(estimate.createdAt).toLocaleDateString(),
            estimate.name,
            estimate.email,
            estimate.phone,
            estimate.address,
            `$${estimate.estimatedCost.toFixed(2)}`,
            `<span class="status-badge status-${estimate.status.toLowerCase()}">${estimate.status}</span>`,
            `<button class="btn btn-sm btn-primary action-btn view-estimate" data-id="${estimate._id}">View</button>`
        ]);

        estimatesTable.destroy();
        estimatesTable = new simpleDatatables.DataTable("#estimatesTable", {
            data: {
                headings: ["Date", "Name", "Email", "Phone", "Address", "Est. Cost", "Status", "Actions"],
                data: tableData
            }
        });
    } catch (error) {
        console.error('Error loading estimates:', error);
        alert('Error loading estimates. Please try again.');
    }
}

// Load Contacts
async function loadContacts() {
    try {
        const response = await fetch('/api/contacts');
        const contacts = await response.json();
        
        const tableData = contacts.map(contact => [
            new Date(contact.createdAt).toLocaleDateString(),
            contact.name,
            contact.email,
            contact.phone || 'N/A',
            contact.message,
            `<span class="status-badge status-${contact.status.toLowerCase()}">${contact.status}</span>`,
            `<button class="btn btn-sm btn-primary action-btn view-contact" data-id="${contact._id}">View</button>`
        ]);

        contactsTable.destroy();
        contactsTable = new simpleDatatables.DataTable("#contactsTable", {
            data: {
                headings: ["Date", "Name", "Email", "Phone", "Message", "Status", "Actions"],
                data: tableData
            }
        });
    } catch (error) {
        console.error('Error loading contacts:', error);
        alert('Error loading contacts. Please try again.');
    }
}

// View Estimate Details
async function viewEstimate(id) {
    try {
        const response = await fetch(`/api/estimates/${id}`);
        const estimate = await response.json();
        
        const modalBody = document.querySelector('#estimateModal .modal-body');
        modalBody.innerHTML = `
            <div class="container-fluid">
                <div class="row detail-row">
                    <div class="col-md-4 detail-label">Name:</div>
                    <div class="col-md-8">${estimate.name}</div>
                </div>
                <div class="row detail-row">
                    <div class="col-md-4 detail-label">Contact:</div>
                    <div class="col-md-8">
                        Email: ${estimate.email}<br>
                        Phone: ${estimate.phone}
                    </div>
                </div>
                <div class="row detail-row">
                    <div class="col-md-4 detail-label">Address:</div>
                    <div class="col-md-8">${estimate.address}</div>
                </div>
                <div class="row detail-row">
                    <div class="col-md-4 detail-label">Project Details:</div>
                    <div class="col-md-8">
                        Linear Feet: ${estimate.linearFeet}<br>
                        Stories: ${estimate.stories}<br>
                        Gutter Type: ${estimate.gutterType}<br>
                        Gutter Guard: ${estimate.gutterGuard ? 'Yes' : 'No'}
                    </div>
                </div>
                <div class="row detail-row">
                    <div class="col-md-4 detail-label">Estimated Cost:</div>
                    <div class="col-md-8">$${estimate.estimatedCost.toFixed(2)}</div>
                </div>
                <div class="row detail-row">
                    <div class="col-md-4 detail-label">Status:</div>
                    <div class="col-md-8">
                        <select class="form-select" id="estimateStatus">
                            <option value="pending" ${estimate.status === 'pending' ? 'selected' : ''}>Pending</option>
                            <option value="contacted" ${estimate.status === 'contacted' ? 'selected' : ''}>Contacted</option>
                            <option value="scheduled" ${estimate.status === 'scheduled' ? 'selected' : ''}>Scheduled</option>
                            <option value="completed" ${estimate.status === 'completed' ? 'selected' : ''}>Completed</option>
                            <option value="cancelled" ${estimate.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                        </select>
                    </div>
                </div>
                <div class="row detail-row">
                    <div class="col-md-4 detail-label">Notes:</div>
                    <div class="col-md-8">
                        <textarea class="form-control" id="estimateNotes">${estimate.notes || ''}</textarea>
                    </div>
                </div>
            </div>
        `;
        
        const modal = new bootstrap.Modal(document.getElementById('estimateModal'));
        modal.show();
        
        // Store the current estimate ID for the update button
        document.getElementById('updateEstimateStatus').dataset.estimateId = id;
    } catch (error) {
        console.error('Error viewing estimate:', error);
        alert('Error loading estimate details. Please try again.');
    }
}

// Update Estimate Status
async function updateEstimateStatus(id) {
    const status = document.getElementById('estimateStatus').value;
    const notes = document.getElementById('estimateNotes').value;
    
    try {
        const response = await fetch(`/api/estimates/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status, notes })
        });
        
        if (!response.ok) {
            throw new Error('Failed to update estimate');
        }
        
        // Close modal and reload estimates
        bootstrap.Modal.getInstance(document.getElementById('estimateModal')).hide();
        loadEstimates();
    } catch (error) {
        console.error('Error updating estimate:', error);
        alert('Error updating estimate. Please try again.');
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', async () => {
    await checkAuth();
    initTables();
    loadEstimates();
    loadContacts();
    
    // Navigation
    document.querySelectorAll('[data-page]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = e.target.dataset.page;
            document.querySelectorAll('.page-content').forEach(content => {
                content.classList.add('d-none');
            });
            document.getElementById(`${page}Page`).classList.remove('d-none');
        });
    });
    
    // View Estimate
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('view-estimate')) {
            viewEstimate(e.target.dataset.id);
        }
    });
    
    // Update Estimate Status
    document.getElementById('updateEstimateStatus').addEventListener('click', (e) => {
        updateEstimateStatus(e.target.dataset.estimateId);
    });
    
    // Logout
    document.getElementById('logoutBtn').addEventListener('click', async (e) => {
        e.preventDefault();
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            window.location.href = '/admin/login.html';
        } catch (error) {
            console.error('Logout failed:', error);
        }
    });
});
