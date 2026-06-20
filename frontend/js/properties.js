let currentPage = 0;
const pageSize = 9;

document.addEventListener('DOMContentLoaded', () => {
    loadCities();
    applyUrlParams();
    loadProperties();

    document.getElementById('filter-form').addEventListener('submit', (e) => {
        e.preventDefault();
        currentPage = 0;
        loadProperties();
    });

    document.getElementById('sort-select').addEventListener('change', () => {
        currentPage = 0;
        loadProperties();
    });
});

function applyUrlParams() {
    const params = new URLSearchParams(window.location.search);
    if (params.get('keyword')) document.getElementById('filter-keyword').value = params.get('keyword');
    if (params.get('city')) document.getElementById('filter-city').value = params.get('city');
    if (params.get('type')) document.getElementById('filter-type').value = params.get('type');
    if (params.get('minPrice')) document.getElementById('filter-min-price').value = params.get('minPrice');
    if (params.get('maxPrice')) document.getElementById('filter-max-price').value = params.get('maxPrice');
    if (params.get('beds')) document.getElementById('filter-beds').value = params.get('beds');
    if (params.get('baths')) document.getElementById('filter-baths').value = params.get('baths');
}

async function loadCities() {
    try {
        const cities = await apiGet('/properties/cities');
        const select = document.getElementById('filter-city');
        cities.forEach(city => {
            const opt = document.createElement('option');
            opt.value = city;
            opt.textContent = city;
            select.appendChild(opt);
        });
        // Re-apply URL param after cities loaded
        const params = new URLSearchParams(window.location.search);
        if (params.get('city')) select.value = params.get('city');
    } catch (e) {
        console.log('Could not load cities');
    }
}

async function loadProperties() {
    const grid = document.getElementById('property-grid');
    grid.innerHTML = '<div class="loading"><div class="spinner"></div></div>';

    const keyword = document.getElementById('filter-keyword').value;
    const city = document.getElementById('filter-city').value;
    const propertyType = document.getElementById('filter-type').value;
    const minPrice = document.getElementById('filter-min-price').value;
    const maxPrice = document.getElementById('filter-max-price').value;
    const bedrooms = document.getElementById('filter-beds').value;
    const bathrooms = document.getElementById('filter-baths').value;
    const sortValue = document.getElementById('sort-select').value;
    const [sortBy, direction] = sortValue.split(',');

    const hasFilters = keyword || city || propertyType || minPrice || maxPrice || bedrooms || bathrooms;

    try {
        let data;
        if (hasFilters) {
            data = await apiGet('/properties/search', {
                keyword, city, propertyType, minPrice, maxPrice, bedrooms, bathrooms,
                page: currentPage, size: pageSize, sortBy, direction
            });
        } else {
            data = await apiGet('/properties', {
                page: currentPage, size: pageSize, sortBy, direction
            });
        }

        const properties = data.content || [];
        const totalElements = data.totalElements || 0;
        const totalPages = data.totalPages || 1;

        document.getElementById('results-count').textContent = `${totalElements} Properties Found`;

        if (properties.length === 0) {
            grid.innerHTML = '<div class="empty-state"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/></svg><h3>No properties found</h3><p>Try adjusting your filters.</p></div>';
        } else {
            grid.innerHTML = properties.map(p => createPropertyCard(p)).join('');
        }

        renderPagination(totalPages);
    } catch (e) {
        grid.innerHTML = '<div class="empty-state"><h3>Error loading properties</h3><p>' + e.message + '</p></div>';
    }
}

function renderPagination(totalPages) {
    const container = document.getElementById('pagination');
    if (totalPages <= 1) {
        container.innerHTML = '';
        return;
    }

    let html = '';
    html += `<button ${currentPage === 0 ? 'disabled' : ''} onclick="goToPage(${currentPage - 1})">Prev</button>`;

    for (let i = 0; i < totalPages; i++) {
        if (totalPages > 7 && i > 1 && i < totalPages - 2 && Math.abs(i - currentPage) > 1) {
            if (i === 2 || i === totalPages - 3) html += '<button disabled>...</button>';
            continue;
        }
        html += `<button class="${i === currentPage ? 'active' : ''}" onclick="goToPage(${i})">${i + 1}</button>`;
    }

    html += `<button ${currentPage === totalPages - 1 ? 'disabled' : ''} onclick="goToPage(${currentPage + 1})">Next</button>`;
    container.innerHTML = html;
}

function goToPage(page) {
    currentPage = page;
    loadProperties();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function clearFilters() {
    document.getElementById('filter-keyword').value = '';
    document.getElementById('filter-city').value = '';
    document.getElementById('filter-type').value = '';
    document.getElementById('filter-min-price').value = '';
    document.getElementById('filter-max-price').value = '';
    document.getElementById('filter-beds').value = '';
    document.getElementById('filter-baths').value = '';
    currentPage = 0;
    loadProperties();
}
