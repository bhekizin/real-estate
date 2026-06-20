document.addEventListener('DOMContentLoaded', () => {
    if (!isAgent()) {
        window.location.href = 'login.html';
        return;
    }
    loadAgentListings();
    loadInquiries();

    document.getElementById('add-property-form').addEventListener('submit', submitProperty);
});

function switchTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('tab-' + tabName).classList.add('active');
    event.target.classList.add('active');
}

let agentProperties = [];

async function loadAgentListings() {
    try {
        const data = await apiGet('/properties', { page: 0, size: 100 });
        const user = getUser();
        // Filter by current agent (show all for agent's own listings)
        agentProperties = (data.content || []).filter(p => p.agentId === user.userId || p.agentEmail === user.email);

        const total = agentProperties.length;
        const active = agentProperties.filter(p => p.status === 'ACTIVE').length;
        const sold = agentProperties.filter(p => p.status === 'SOLD').length;

        document.getElementById('stat-total').textContent = total;
        document.getElementById('stat-active').textContent = active;
        document.getElementById('stat-sold').textContent = sold;

        renderListingsTable();
    } catch (e) {
        // If filtering doesn't work server-side, just show all
        try {
            const data = await apiGet('/properties', { page: 0, size: 50 });
            agentProperties = data.content || [];
            renderListingsTable();
        } catch (err) {
            document.getElementById('listings-tbody').innerHTML = '<tr><td colspan="6">Error loading listings</td></tr>';
        }
    }
}

function renderListingsTable() {
    const tbody = document.getElementById('listings-tbody');
    if (agentProperties.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:40px;color:var(--gray-500)">No listings yet. Add your first property!</td></tr>';
        return;
    }

    tbody.innerHTML = agentProperties.map(p => `
        <tr>
            <td><a href="property-detail.html?id=${p.id}" style="color:var(--primary);font-weight:500">${p.title}</a></td>
            <td>${formatPrice(p.price)}</td>
            <td>${p.city}</td>
            <td>${p.propertyType}</td>
            <td><span class="badge badge-${p.status === 'ACTIVE' ? 'green' : p.status === 'SOLD' ? 'red' : 'yellow'}">${p.status}</span></td>
            <td class="actions">
                <button onclick="changeStatus(${p.id}, 'ACTIVE')" class="btn btn-sm btn-success" ${p.status === 'ACTIVE' ? 'disabled' : ''}>Active</button>
                <button onclick="changeStatus(${p.id}, 'SOLD')" class="btn btn-sm btn-danger" ${p.status === 'SOLD' ? 'disabled' : ''}>Sold</button>
                <button onclick="deleteProperty(${p.id})" class="btn btn-sm btn-outline">Delete</button>
            </td>
        </tr>
    `).join('');
}

async function changeStatus(id, status) {
    try {
        await apiPut(`/properties/${id}/status?status=${status}`);
        showToast('Status updated', 'success');
        loadAgentListings();
    } catch (e) {
        showToast('Error: ' + e.message, 'error');
    }
}

async function deleteProperty(id) {
    if (!confirm('Are you sure you want to delete this property?')) return;
    try {
        await apiDelete(`/properties/${id}`);
        showToast('Property deleted', 'success');
        loadAgentListings();
    } catch (e) {
        showToast('Error: ' + e.message, 'error');
    }
}

async function submitProperty(e) {
    e.preventDefault();
    const errorEl = document.getElementById('property-error');
    const successEl = document.getElementById('property-success');
    const btn = document.getElementById('submit-property-btn');

    errorEl.classList.remove('show');
    successEl.classList.remove('show');
    btn.disabled = true;
    btn.textContent = 'Publishing...';

    const amenities = [];
    document.querySelectorAll('#amenities-grid input:checked').forEach(cb => {
        amenities.push(cb.value);
    });

    const body = {
        title: document.getElementById('prop-title').value,
        description: document.getElementById('prop-description').value,
        price: parseFloat(document.getElementById('prop-price').value),
        propertyType: document.getElementById('prop-type').value,
        address: document.getElementById('prop-address').value,
        city: document.getElementById('prop-city').value,
        state: document.getElementById('prop-state').value,
        zipCode: document.getElementById('prop-zip').value,
        bedrooms: parseInt(document.getElementById('prop-beds').value),
        bathrooms: parseInt(document.getElementById('prop-baths').value),
        area: parseFloat(document.getElementById('prop-area').value) || null,
        yearBuilt: parseInt(document.getElementById('prop-year').value) || null,
        parkingSpaces: parseInt(document.getElementById('prop-parking').value) || 0,
        amenities: amenities
    };

    try {
        await apiPost('/properties', body);
        successEl.textContent = 'Property published successfully!';
        successEl.classList.add('show');
        document.getElementById('add-property-form').reset();
        loadAgentListings();
    } catch (err) {
        errorEl.textContent = err.message || 'Failed to create property';
        errorEl.classList.add('show');
    } finally {
        btn.disabled = false;
        btn.textContent = 'Publish Property';
    }
}

async function loadInquiries() {
    try {
        const inquiries = await apiGet('/inquiries/agent');
        const list = Array.isArray(inquiries) ? inquiries : (inquiries.content || []);
        document.getElementById('stat-inquiries').textContent = list.length;
        renderInquiries(list);
    } catch (e) {
        document.getElementById('inquiries-list').innerHTML = '<div class="empty-state"><p>Unable to load inquiries.</p></div>';
    }
}

function renderInquiries(inquiries) {
    const container = document.getElementById('inquiries-list');
    if (inquiries.length === 0) {
        container.innerHTML = '<div class="empty-state"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z"/></svg><h3>No inquiries yet</h3><p>Inquiries from potential buyers will appear here.</p></div>';
        return;
    }

    container.innerHTML = inquiries.map(inq => `
        <div class="inquiry-card">
            <div class="inquiry-header">
                <span class="inquiry-sender">${inq.senderName}</span>
                <span class="badge ${inq.status === 'READ' ? 'badge-green' : 'badge-yellow'}">${inq.status || 'NEW'}</span>
            </div>
            <div class="inquiry-property">Re: ${inq.propertyTitle || 'Property #' + inq.propertyId}</div>
            <div class="inquiry-message">${inq.message}</div>
            <div class="inquiry-contact">${inq.senderEmail} ${inq.senderPhone ? '| ' + inq.senderPhone : ''}</div>
            ${inq.status !== 'READ' ? `<button class="btn btn-sm btn-outline" style="margin-top:8px" onclick="markRead(${inq.id})">Mark as Read</button>` : ''}
        </div>
    `).join('');
}

async function markRead(id) {
    try {
        await apiPut(`/inquiries/${id}/status?status=READ`);
        showToast('Marked as read', 'success');
        loadInquiries();
    } catch (e) {
        showToast('Error: ' + e.message, 'error');
    }
}
