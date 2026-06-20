// API Base URL - automatically detects deployment environment
// For local development: http://localhost:8080/api
// For Render deployment: update this to your Render backend URL
const API_BASE = window.location.hostname === 'localhost'
    ? 'http://localhost:8080/api'
    : 'https://realestate-api.onrender.com/api';  // <-- Replace with your actual Render backend URL

function getToken() {
    return localStorage.getItem('token');
}

function getUser() {
    return JSON.parse(localStorage.getItem('user') || 'null');
}

function isLoggedIn() {
    return !!getToken();
}

function isAgent() {
    const u = getUser();
    return u && (u.role === 'AGENT' || u.role === 'ADMIN');
}

function isAdmin() {
    const u = getUser();
    return u && u.role === 'ADMIN';
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('compareList');
    window.location.href = getBasePath() + '/index.html';
}

function getBasePath() {
    const path = window.location.pathname;
    if (path.includes('/pages/')) {
        return '..';
    }
    return '.';
}

function getHeaders(includeAuth = true) {
    const headers = { 'Content-Type': 'application/json' };
    const token = getToken();
    if (includeAuth && token) {
        headers['Authorization'] = 'Bearer ' + token;
    }
    return headers;
}

async function apiGet(endpoint, params = {}) {
    const url = new URL(API_BASE + endpoint);
    Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
            url.searchParams.append(key, params[key]);
        }
    });
    const response = await fetch(url.toString(), {
        method: 'GET',
        headers: getHeaders()
    });
    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Request failed' }));
        throw new Error(error.message || `HTTP ${response.status}`);
    }
    return response.json();
}

async function apiPost(endpoint, body) {
    const response = await fetch(API_BASE + endpoint, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(body)
    });
    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Request failed' }));
        throw new Error(error.message || `HTTP ${response.status}`);
    }
    return response.json();
}

async function apiPut(endpoint, body) {
    const options = {
        method: 'PUT',
        headers: getHeaders()
    };
    if (body) {
        options.body = JSON.stringify(body);
    }
    const response = await fetch(API_BASE + endpoint, options);
    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Request failed' }));
        throw new Error(error.message || `HTTP ${response.status}`);
    }
    const text = await response.text();
    return text ? JSON.parse(text) : {};
}

async function apiDelete(endpoint) {
    const response = await fetch(API_BASE + endpoint, {
        method: 'DELETE',
        headers: getHeaders()
    });
    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Request failed' }));
        throw new Error(error.message || `HTTP ${response.status}`);
    }
    const text = await response.text();
    return text ? JSON.parse(text) : {};
}

async function apiPostFormData(endpoint, formData) {
    const headers = {};
    const token = getToken();
    if (token) {
        headers['Authorization'] = 'Bearer ' + token;
    }
    const response = await fetch(API_BASE + endpoint, {
        method: 'POST',
        headers: headers,
        body: formData
    });
    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Request failed' }));
        throw new Error(error.message || `HTTP ${response.status}`);
    }
    return response.json();
}

// Compare list management
function getCompareList() {
    return JSON.parse(localStorage.getItem('compareList') || '[]');
}

function addToCompare(id) {
    const list = getCompareList();
    if (!list.includes(id) && list.length < 4) {
        list.push(id);
        localStorage.setItem('compareList', JSON.stringify(list));
        return true;
    }
    return false;
}

function removeFromCompare(id) {
    let list = getCompareList();
    list = list.filter(item => item !== id);
    localStorage.setItem('compareList', JSON.stringify(list));
}

function clearCompare() {
    localStorage.setItem('compareList', JSON.stringify([]));
}

function isInCompare(id) {
    return getCompareList().includes(id);
}

// Navigation updater
function updateNav() {
    const navAuth = document.getElementById('nav-auth');
    if (!navAuth) return;

    if (isLoggedIn()) {
        const user = getUser();
        let dashboardLink = '';
        if (isAdmin()) {
            dashboardLink = `<a href="${getBasePath()}/pages/admin.html" class="nav-link">Admin</a>`;
        } else if (isAgent()) {
            dashboardLink = `<a href="${getBasePath()}/pages/agent-dashboard.html" class="nav-link">Dashboard</a>`;
        }
        navAuth.innerHTML = `
            ${dashboardLink}
            <span class="nav-user">Hi, ${user.firstName}</span>
            <button onclick="logout()" class="btn btn-outline btn-sm">Logout</button>
        `;
    } else {
        navAuth.innerHTML = `
            <a href="${getBasePath()}/pages/login.html" class="btn btn-outline btn-sm">Login</a>
            <a href="${getBasePath()}/pages/register.html" class="btn btn-primary btn-sm">Register</a>
        `;
    }
}

// Format currency
function formatPrice(price) {
    return new Intl.NumberFormat('en-ZA', {
        style: 'currency',
        currency: 'ZAR',
        maximumFractionDigits: 0
    }).format(price);
}

// Property card HTML generator
function createPropertyCard(property) {
    const images = property.images || [];
    const primaryImage = images.find(img => img.isPrimary) || images[0];
    const imageUrl = primaryImage ? primaryImage.imageUrl : null;

    const imageHtml = imageUrl
        ? `<img src="${imageUrl}" alt="${property.title}" class="property-card-image">`
        : `<div class="property-card-image placeholder-image"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 21h18M3 7v14m18-14v14M6 11h.01M6 15h.01M6 19h.01M10 11h.01M10 15h.01M10 19h.01M14 11h.01M14 15h.01M14 19h.01M18 11h.01M18 15h.01M18 19h.01M3 7l9-4 9 4"/></svg></div>`;

    const compareChecked = isInCompare(property.id) ? 'checked' : '';

    return `
        <div class="property-card">
            <a href="${getBasePath()}/pages/property-detail.html?id=${property.id}" class="property-card-link">
                <div class="property-card-image-wrapper">
                    ${imageHtml}
                    <span class="property-status-badge badge-${(property.status || 'active').toLowerCase()}">${property.status || 'ACTIVE'}</span>
                    ${property.featured ? '<span class="featured-badge">Featured</span>' : ''}
                </div>
                <div class="property-card-body">
                    <h3 class="property-card-title">${property.title}</h3>
                    <p class="property-card-price">${formatPrice(property.price)}</p>
                    <p class="property-card-location"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg> ${property.city}, ${property.state}</p>
                    <div class="property-card-features">
                        <span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M3 7v11a2 2 0 002 2h14a2 2 0 002-2V7"/><path d="M21 7H3l2-4h14l2 4z"/><path d="M7 11h4v4H7z"/></svg> ${property.bedrooms} Beds</span>
                        <span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M4 12h16a1 1 0 011 1v3a2 2 0 01-2 2H5a2 2 0 01-2-2v-3a1 1 0 011-1z"/><path d="M6 12V5a2 2 0 012-2h1a2 2 0 012 2v7"/></svg> ${property.bathrooms} Baths</span>
                        <span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M4 4h16v16H4z"/><path d="M4 12h16M12 4v16"/></svg> ${property.area || 'N/A'} sqft</span>
                    </div>
                </div>
            </a>
            <div class="property-card-footer">
                <label class="compare-checkbox">
                    <input type="checkbox" ${compareChecked} onchange="toggleCompare(${property.id}, this)">
                    <span>Compare</span>
                </label>
            </div>
        </div>
    `;
}

function toggleCompare(id, checkbox) {
    if (checkbox.checked) {
        if (!addToCompare(id)) {
            checkbox.checked = false;
            showToast('Maximum 4 properties can be compared', 'warning');
        }
    } else {
        removeFromCompare(id);
    }
    updateCompareCount();
}

function updateCompareCount() {
    const badge = document.getElementById('compare-count');
    if (badge) {
        const count = getCompareList().length;
        badge.textContent = count;
        badge.style.display = count > 0 ? 'inline-flex' : 'none';
    }
}

// Toast notification
function showToast(message, type = 'info') {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Initialize nav on page load
document.addEventListener('DOMContentLoaded', () => {
    updateNav();
    updateCompareCount();
});
