document.addEventListener('DOMContentLoaded', () => {
    loadComparison();
});

async function loadComparison() {
    const container = document.getElementById('compare-content');
    const ids = getCompareList();

    if (ids.length < 2) {
        container.innerHTML = `
            <div class="compare-empty">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"/>
                </svg>
                <h2>Select Properties to Compare</h2>
                <p>Add at least 2 properties to compare. You can add properties from the <a href="properties.html" style="color:var(--accent)">listings page</a>.</p>
                <p style="margin-top:8px;font-size:0.9rem;color:var(--gray-400)">${ids.length} of 4 properties selected</p>
            </div>
        `;
        return;
    }

    try {
        const data = await apiGet('/properties/compare', { ids: ids.join(',') });
        const properties = Array.isArray(data) ? data : (data.content || []);

        if (properties.length < 2) {
            container.innerHTML = '<div class="compare-empty"><h2>Not enough properties found</h2><p>Some selected properties may have been removed.</p></div>';
            return;
        }

        renderComparisonTable(properties);
    } catch (e) {
        // Fallback: load individually
        try {
            const properties = await Promise.all(ids.map(id => apiGet(`/properties/${id}`)));
            renderComparisonTable(properties);
        } catch (err) {
            container.innerHTML = '<div class="compare-empty"><h2>Error loading properties</h2><p>' + err.message + '</p></div>';
        }
    }
}

function renderComparisonTable(properties) {
    const baseUrl = API_BASE.replace('/api', '');
    const container = document.getElementById('compare-content');

    const rows = [
        {
            label: 'Image',
            render: (p) => {
                const images = p.images || [];
                const primaryImage = images.find(img => img.isPrimary) || images[0];
                if (primaryImage) {
                    return `<img src="${primaryImage.imageUrl}" class="compare-image" alt="${p.title}">`;
                }
                return `<div class="compare-placeholder"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="40" height="40"><path d="M3 21h18M3 7v14m18-14v14M6 11h.01M6 15h.01M10 11h.01M10 15h.01M14 11h.01M14 15h.01M18 11h.01M18 15h.01M3 7l9-4 9 4"/></svg></div>`;
            }
        },
        { label: 'Title', render: (p) => `<a href="property-detail.html?id=${p.id}" style="color:var(--primary);font-weight:600">${p.title}</a>` },
        { label: 'Price', render: (p) => `<strong style="color:var(--accent-dark);font-size:1.1rem">${formatPrice(p.price)}</strong>` },
        { label: 'Type', render: (p) => p.propertyType || 'N/A' },
        { label: 'Location', render: (p) => `${p.city}, ${p.state}` },
        { label: 'Bedrooms', render: (p) => p.bedrooms },
        { label: 'Bathrooms', render: (p) => p.bathrooms },
        { label: 'Area', render: (p) => p.area ? `${p.area} sqft` : 'N/A' },
        { label: 'Year Built', render: (p) => p.yearBuilt || 'N/A' },
        { label: 'Parking', render: (p) => p.parkingSpaces || 0 },
        { label: 'Status', render: (p) => `<span class="badge badge-${(p.status || 'active').toLowerCase() === 'active' ? 'green' : 'red'}">${p.status}</span>` },
        { label: 'Amenities', render: (p) => (p.amenities || []).join(', ') || 'None listed' }
    ];

    let html = '<div class="table-container"><table class="compare-table">';

    rows.forEach(row => {
        html += '<tr>';
        html += `<th>${row.label}</th>`;
        properties.forEach(p => {
            html += `<td>${row.render(p)}</td>`;
        });
        html += '</tr>';
    });

    // Remove button row
    html += '<tr><th>Actions</th>';
    properties.forEach(p => {
        html += `<td><button class="btn btn-sm btn-outline" onclick="removeAndReload(${p.id})">Remove</button></td>`;
    });
    html += '</tr>';

    html += '</table></div>';
    container.innerHTML = html;
}

function removeAndReload(id) {
    removeFromCompare(id);
    updateCompareCount();
    loadComparison();
}

function clearAllCompare() {
    clearCompare();
    updateCompareCount();
    loadComparison();
}
