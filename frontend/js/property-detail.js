let currentProperty = null;

document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (!id) {
        document.getElementById('property-detail').innerHTML = '<div class="empty-state"><h3>Property not found</h3><p><a href="properties.html">Back to listings</a></p></div>';
        return;
    }
    loadProperty(id);
});

async function loadProperty(id) {
    try {
        const property = await apiGet(`/properties/${id}`);
        currentProperty = property;
        document.title = `${property.title} - RealEstate`;
        renderProperty(property);
    } catch (e) {
        document.getElementById('property-detail').innerHTML = '<div class="empty-state"><h3>Error loading property</h3><p>' + e.message + '</p></div>';
    }
}

function renderProperty(p) {
    const imageObjects = p.images || [];
    const images = imageObjects.map(img => img.imageUrl);

    let galleryHtml = '';
    if (images.length > 0) {
        galleryHtml = `
            <div class="gallery">
                <div class="gallery-main">
                    <img src="${images[0]}" alt="${p.title}" id="main-image">
                </div>
                ${images.length > 1 ? `
                <div class="gallery-thumbs">
                    ${images.map((img, i) => `
                        <div class="gallery-thumb ${i === 0 ? 'active' : ''}" onclick="changeImage('${img}', this)">
                            <img src="${img}" alt="Thumbnail ${i + 1}">
                        </div>
                    `).join('')}
                </div>` : ''}
            </div>`;
    } else {
        galleryHtml = `
            <div class="gallery">
                <div class="gallery-main">
                    <div class="placeholder-image">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 21h18M3 7v14m18-14v14M6 11h.01M6 15h.01M6 19h.01M10 11h.01M10 15h.01M10 19h.01M14 11h.01M14 15h.01M14 19h.01M18 11h.01M18 15h.01M18 19h.01M3 7l9-4 9 4"/></svg>
                    </div>
                </div>
            </div>`;
    }

    const amenities = p.amenities || [];
    const statusClass = (p.status || 'active').toLowerCase();

    const html = `
        <div class="detail-grid">
            <div class="detail-main">
                ${galleryHtml}
                <div style="display:flex;align-items:center;gap:12px;margin-bottom:8px;">
                    <h1 class="detail-title" style="margin-bottom:0">${p.title}</h1>
                    <span class="property-status-badge badge-${statusClass}" style="position:static">${p.status}</span>
                </div>
                <p class="detail-price">${formatPrice(p.price)}</p>
                <p class="detail-location">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                    ${p.address}, ${p.city}, ${p.state} ${p.zipCode || ''}
                </p>
                <p class="detail-description">${p.description || 'No description available.'}</p>

                <h3 style="color:var(--primary);margin-bottom:16px;">Property Features</h3>
                <div class="detail-features">
                    <div class="detail-feature">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 7v11a2 2 0 002 2h14a2 2 0 002-2V7"/><path d="M21 7H3l2-4h14l2 4z"/><path d="M7 11h4v4H7z"/></svg>
                        <span>${p.bedrooms} Bedrooms</span>
                    </div>
                    <div class="detail-feature">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 12h16a1 1 0 011 1v3a2 2 0 01-2 2H5a2 2 0 01-2-2v-3a1 1 0 011-1z"/><path d="M6 12V5a2 2 0 012-2h1a2 2 0 012 2v7"/></svg>
                        <span>${p.bathrooms} Bathrooms</span>
                    </div>
                    <div class="detail-feature">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16v16H4z"/><path d="M4 12h16M12 4v16"/></svg>
                        <span>${p.area || 'N/A'} sqft</span>
                    </div>
                    <div class="detail-feature">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                        <span>Built ${p.yearBuilt || 'N/A'}</span>
                    </div>
                    <div class="detail-feature">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="3" width="22" height="18" rx="2"/><line x1="12" y1="3" x2="12" y2="21"/></svg>
                        <span>${p.parkingSpaces || 0} Parking</span>
                    </div>
                    <div class="detail-feature">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4M4 7l8 4M4 7v10l8 4m0-10v10"/></svg>
                        <span>${p.propertyType || 'N/A'}</span>
                    </div>
                </div>

                ${amenities.length > 0 ? `
                <h3 style="color:var(--primary);margin:24px 0 12px;">Amenities</h3>
                <div class="amenities-grid">
                    ${amenities.map(a => `<span class="badge badge-blue" style="margin:4px">${a}</span>`).join('')}
                </div>` : ''}

                <!-- Mortgage Calculator -->
                <div class="mortgage-calc" id="mortgage-section">
                    <h3>Mortgage Calculator</h3>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Loan Amount (R)</label>
                            <input type="number" class="form-control" id="loan-amount" value="${Math.round(p.price * 0.8)}">
                        </div>
                        <div class="form-group">
                            <label>Interest Rate (%)</label>
                            <input type="number" class="form-control" id="interest-rate" value="6.5" step="0.1">
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Loan Term (years)</label>
                            <select class="form-control" id="loan-term">
                                <option value="15">15 years</option>
                                <option value="20">20 years</option>
                                <option value="30" selected>30 years</option>
                            </select>
                        </div>
                        <div class="form-group" style="display:flex;align-items:flex-end;">
                            <button type="button" class="btn btn-primary" onclick="calculateMortgage()" style="width:100%">Calculate</button>
                        </div>
                    </div>
                    <div class="mortgage-result" id="mortgage-result" style="display:none">
                        <div class="label">Estimated Monthly Payment</div>
                        <div class="amount" id="monthly-payment">R0</div>
                    </div>
                </div>
            </div>

            <aside class="detail-sidebar">
                <!-- Agent Card -->
                <div class="sidebar-card">
                    <h3>Listed By</h3>
                    <div class="agent-info">
                        <div class="agent-avatar">${(p.agentName || 'A').charAt(0)}</div>
                        <div>
                            <div class="agent-name">${p.agentName || 'Agent'}</div>
                            <div class="agent-role">Real Estate Agent</div>
                        </div>
                    </div>
                </div>

                <!-- Inquiry Form -->
                <div class="sidebar-card">
                    <h3>Send Inquiry</h3>
                    <div class="alert alert-error" id="inquiry-error"></div>
                    <div class="alert alert-success" id="inquiry-success"></div>
                    <form id="inquiry-form" onsubmit="sendInquiry(event)">
                        <div class="form-group">
                            <label>Your Name</label>
                            <input type="text" class="form-control" id="inquiry-name" required>
                        </div>
                        <div class="form-group">
                            <label>Email</label>
                            <input type="email" class="form-control" id="inquiry-email" required>
                        </div>
                        <div class="form-group">
                            <label>Phone</label>
                            <input type="tel" class="form-control" id="inquiry-phone">
                        </div>
                        <div class="form-group">
                            <label>Message</label>
                            <textarea class="form-control" id="inquiry-message" rows="4" required>I'm interested in this property. Please contact me with more details.</textarea>
                        </div>
                        <button type="submit" class="btn btn-primary" style="width:100%" id="inquiry-btn">Send Inquiry</button>
                    </form>
                </div>
            </aside>
        </div>
    `;

    document.getElementById('property-detail').innerHTML = html;

    // Pre-fill user info if logged in
    const user = getUser();
    if (user) {
        document.getElementById('inquiry-name').value = user.firstName + ' ' + user.lastName;
        document.getElementById('inquiry-email').value = user.email;
    }
}

function changeImage(src, thumb) {
    document.getElementById('main-image').src = src;
    document.querySelectorAll('.gallery-thumb').forEach(t => t.classList.remove('active'));
    thumb.classList.add('active');
}

async function sendInquiry(e) {
    e.preventDefault();
    const errorEl = document.getElementById('inquiry-error');
    const successEl = document.getElementById('inquiry-success');
    const btn = document.getElementById('inquiry-btn');

    errorEl.classList.remove('show');
    successEl.classList.remove('show');
    btn.disabled = true;
    btn.textContent = 'Sending...';

    try {
        await apiPost('/inquiries', {
            propertyId: currentProperty.id,
            senderName: document.getElementById('inquiry-name').value,
            senderEmail: document.getElementById('inquiry-email').value,
            senderPhone: document.getElementById('inquiry-phone').value,
            message: document.getElementById('inquiry-message').value
        });
        successEl.textContent = 'Inquiry sent successfully! The agent will contact you soon.';
        successEl.classList.add('show');
        document.getElementById('inquiry-form').reset();
    } catch (err) {
        errorEl.textContent = err.message;
        errorEl.classList.add('show');
    } finally {
        btn.disabled = false;
        btn.textContent = 'Send Inquiry';
    }
}
