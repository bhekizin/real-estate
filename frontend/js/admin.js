document.addEventListener('DOMContentLoaded', () => {
    if (!isAdmin()) {
        window.location.href = 'login.html';
        return;
    }
    loadDashboardStats();
    loadUsers();
    loadAdminProperties();
});

function switchAdminTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('tab-' + tabName).classList.add('active');
    event.target.classList.add('active');
}

async function loadDashboardStats() {
    try {
        const stats = await apiGet('/admin/dashboard');
        document.getElementById('stat-users').textContent = stats.totalUsers || 0;
        document.getElementById('stat-properties').textContent = stats.totalProperties || 0;
        document.getElementById('stat-agents').textContent = stats.totalAgents || 0;
        document.getElementById('stat-total-inquiries').textContent = stats.totalInquiries || 0;
    } catch (e) {
        console.log('Could not load admin stats');
    }
}

async function loadUsers() {
    try {
        const users = await apiGet('/admin/users');
        const list = Array.isArray(users) ? users : (users.content || []);
        renderUsersTable(list);
    } catch (e) {
        document.getElementById('users-tbody').innerHTML = '<tr><td colspan="5" style="text-align:center">Error loading users</td></tr>';
    }
}

function renderUsersTable(users) {
    const tbody = document.getElementById('users-tbody');
    if (users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:40px">No users found</td></tr>';
        return;
    }

    tbody.innerHTML = users.map(u => `
        <tr>
            <td>${u.firstName} ${u.lastName}</td>
            <td>${u.email}</td>
            <td><span class="badge badge-blue">${u.role}</span></td>
            <td><span class="badge ${u.active !== false ? 'badge-green' : 'badge-red'}">${u.active !== false ? 'Active' : 'Inactive'}</span></td>
            <td class="actions">
                <button onclick="toggleUser(${u.id})" class="btn btn-sm ${u.active !== false ? 'btn-outline' : 'btn-success'}">${u.active !== false ? 'Deactivate' : 'Activate'}</button>
                <button onclick="deleteUser(${u.id})" class="btn btn-sm btn-danger">Delete</button>
            </td>
        </tr>
    `).join('');
}

async function toggleUser(id) {
    try {
        await apiPut(`/admin/users/${id}/toggle`);
        showToast('User status updated', 'success');
        loadUsers();
    } catch (e) {
        showToast('Error: ' + e.message, 'error');
    }
}

async function deleteUser(id) {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
        await apiDelete(`/admin/users/${id}`);
        showToast('User deleted', 'success');
        loadUsers();
    } catch (e) {
        showToast('Error: ' + e.message, 'error');
    }
}

async function loadAdminProperties() {
    try {
        const data = await apiGet('/properties', { page: 0, size: 100 });
        const properties = data.content || [];
        renderAdminPropertiesTable(properties);
    } catch (e) {
        document.getElementById('admin-properties-tbody').innerHTML = '<tr><td colspan="6" style="text-align:center">Error loading properties</td></tr>';
    }
}

function renderAdminPropertiesTable(properties) {
    const tbody = document.getElementById('admin-properties-tbody');
    if (properties.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:40px">No properties found</td></tr>';
        return;
    }

    tbody.innerHTML = properties.map(p => `
        <tr>
            <td><a href="property-detail.html?id=${p.id}" style="color:var(--primary);font-weight:500">${p.title}</a></td>
            <td>${p.agentName || 'N/A'}</td>
            <td>${formatPrice(p.price)}</td>
            <td><span class="badge badge-${p.status === 'ACTIVE' ? 'green' : p.status === 'SOLD' ? 'red' : 'yellow'}">${p.status}</span></td>
            <td>
                <button onclick="toggleFeatured(${p.id})" class="btn btn-sm ${p.featured ? 'btn-primary' : 'btn-outline'}">
                    ${p.featured ? 'Featured' : 'Feature'}
                </button>
            </td>
            <td class="actions">
                <button onclick="adminDeleteProperty(${p.id})" class="btn btn-sm btn-danger">Delete</button>
            </td>
        </tr>
    `).join('');
}

async function toggleFeatured(id) {
    try {
        await apiPut(`/admin/properties/${id}/featured`);
        showToast('Featured status updated', 'success');
        loadAdminProperties();
    } catch (e) {
        showToast('Error: ' + e.message, 'error');
    }
}

async function adminDeleteProperty(id) {
    if (!confirm('Are you sure you want to delete this property?')) return;
    try {
        await apiDelete(`/admin/properties/${id}`);
        showToast('Property deleted', 'success');
        loadAdminProperties();
    } catch (e) {
        showToast('Error: ' + e.message, 'error');
    }
}
