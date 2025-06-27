// Global variables
let map;
let currentUser = null;
let schools = [];
let markers = [];

// API base URL
const API_BASE = '/api';

// DEMO MODE: Dummy user and data
const DEMO_USER = {
  name: 'Demo User',
  email: 'demo@schoolzy.com',
  profile_picture: 'https://via.placeholder.com/32x32/667eea/ffffff?text=D',
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    const userInfo = document.getElementById('user-info');
    const dropdown = document.getElementById('profile-dropdown');

    userInfo.addEventListener('click', function(e) {
        e.stopPropagation();
        dropdown.classList.toggle('hidden');
    });

    document.addEventListener('click', function() {
        dropdown.classList.add('hidden');
    });

    // Dropdown option handlers (navigate to pages)
    document.getElementById('profile-edit-btn').addEventListener('click', function(e) {
        e.stopPropagation();
        window.location.href = 'edit-profile.html';
    });
    document.getElementById('profile-verify-btn').addEventListener('click', function(e) {
        e.stopPropagation();
        window.location.href = 'email-verification.html';
    });
    document.getElementById('logout-btn').addEventListener('click', function(e) {
        e.stopPropagation();
        window.location.href = 'logout.html';
    });
    document.getElementById('cancel-logout-btn').addEventListener('click', function() {
        hideModal('logout-modal');
    });
    document.getElementById('confirm-logout-btn').addEventListener('click', function() {
        hideModal('logout-modal');
        logout();
    });
    // Email verification button (placeholder)
    const sendVerificationBtn = document.getElementById('send-verification-btn');
    if (sendVerificationBtn) {
        sendVerificationBtn.addEventListener('click', function() {
            alert('Verification email feature coming soon!');
            hideModal('email-verification-modal');
        });
    }
});

async function initializeApp() {
    await checkAuthStatus();
    loadSchools();
    initializeMap();
    setupEventListeners();
}

// Authentication functions
async function checkAuthStatus() {
    const token = localStorage.getItem('token');
    if (token) {
        try {
            // Fetch user info from backend
            const res = await fetch(`${API_BASE}/auth/me`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const user = await res.json();
                currentUser = user;
                localStorage.setItem('user', JSON.stringify(user));
                updateUIForAuthenticatedUser();
                return;
            } else {
                // Token invalid/expired
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            }
        } catch (err) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }
    }
    updateUIForUnauthenticatedUser();
    showDemoLoginModal();
}

function updateUIForAuthenticatedUser() {
    document.getElementById('auth-buttons').classList.add('hidden');
    document.getElementById('user-info').classList.remove('hidden');
    currentUser = currentUser || {};
    const userName = document.getElementById('user-name');
    const userAvatar = document.getElementById('user-avatar');
    userName.textContent = currentUser.name;
    if (currentUser.profile_picture) {
        userAvatar.src = currentUser.profile_picture;
    } else {
        userAvatar.src = 'https://via.placeholder.com/32x32/667eea/ffffff?text=' + currentUser.name.charAt(0);
    }
    // Attach avatar click event for dropdown
    userAvatar.onclick = toggleProfileDropdown;
    // Show map section, hide schools and prompt until location is entered
    document.getElementById('map').classList.remove('hidden');
    document.getElementById('schools').classList.add('hidden');
    document.getElementById('prompt-section').classList.add('hidden');
}

function updateUIForUnauthenticatedUser() {
    document.getElementById('auth-buttons').classList.remove('hidden');
    document.getElementById('user-info').classList.add('hidden');
    currentUser = null;
    // Hide schools/map, show prompt
    document.getElementById('schools').classList.add('hidden');
    document.getElementById('map').classList.add('hidden');
    document.getElementById('prompt-section').classList.remove('hidden');
    document.getElementById('prompt-message').textContent = 'Please log in and enter your location to find schools near you.';
}

// Modal functions
function showModal(modalId) {
    document.getElementById(modalId).classList.remove('hidden');
}

function hideModal(modalId) {
    document.getElementById(modalId).classList.add('hidden');
}

function hideAllModals() {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => modal.classList.add('hidden'));
}

// School functions
async function loadSchools(filters = {}) {
    const loading = document.getElementById('loading');
    const schoolsGrid = document.getElementById('schools-grid');
    
    loading.classList.remove('hidden');
    schoolsGrid.innerHTML = '';
    
    try {
        const queryParams = new URLSearchParams(filters).toString();
        const response = await fetch(`${API_BASE}/schools?${queryParams}`);
        schools = await response.json();
        
        displaySchools(schools);
    } catch (error) {
        console.error('Error loading schools:', error);
        schoolsGrid.innerHTML = '<p class="error">Error loading schools. Please try again.</p>';
    } finally {
        loading.classList.add('hidden');
    }
}

function displaySchools(schoolsToDisplay) {
    const schoolsGrid = document.getElementById('schools-grid');
    
    if (schoolsToDisplay.length === 0) {
        schoolsGrid.innerHTML = '<p class="no-results">No schools found matching your criteria.</p>';
        return;
    }
    
    schoolsGrid.innerHTML = schoolsToDisplay.map(school => `
        <div class="school-card" onclick="window.location.href='school.html?id=${school.id}'">
            <div class="school-image">
                <i class="fas fa-school"></i>
            </div>
            <div class="school-content">
                <h3 class="school-name">${school.name}</h3>
                <p class="school-location">
                    <i class="fas fa-map-marker-alt"></i>
                    ${school.location}
                </p>
                <div class="school-rating">
                    <span class="stars">${'★'.repeat(Math.round(school.averageRating || 0))}${'☆'.repeat(5 - Math.round(school.averageRating || 0))}</span>
                    <span>${(school.averageRating || 0).toFixed(1)} (${school.reviewCount || 0} reviews)</span>
                </div>
                <span class="school-category">${school.category || 'School'}</span>
            </div>
        </div>
    `).join('');
}

async function showSchoolDetails(schoolId) {
    try {
        const response = await fetch(`${API_BASE}/schools/${schoolId}`);
        const school = await response.json();
        
        const reviewsResponse = await fetch(`${API_BASE}/reviews/school/${schoolId}`);
        const reviews = await reviewsResponse.json();
        
        const modal = document.getElementById('school-modal');
        const details = document.getElementById('school-details');
        
        details.innerHTML = `
            <h2>${school.name}</h2>
            <div class="school-detail-info">
                <p><i class="fas fa-map-marker-alt"></i> ${school.location}</p>
                <p><i class="fas fa-star"></i> ${(school.averageRating || 0).toFixed(1)} (${school.reviewCount || 0} reviews)</p>
                <p><i class="fas fa-tag"></i> ${school.category || 'School'}</p>
                ${school.phone ? `<p><i class="fas fa-phone"></i> ${school.phone}</p>` : ''}
                ${school.website ? `<p><i class="fas fa-globe"></i> <a href="${school.website}" target="_blank">${school.website}</a></p>` : ''}
            </div>
            ${school.description ? `<p class="school-description">${school.description}</p>` : ''}
            
            <div class="reviews-section">
                <h3>Reviews (${reviews.length})</h3>
                ${currentUser ? `
                    <button class="btn btn-primary" onclick="showAddReviewForm('${schoolId}')">
                        <i class="fas fa-plus"></i> Add Review
                    </button>
                ` : '<p>Login to add a review</p>'}
                
                <div class="reviews-list">
                    ${reviews.map(review => `
                        <div class="review-item">
                            <div class="review-header">
                                <span class="stars">${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}</span>
                                <span class="review-author">
                                    ${review.user_profile_picture ? `<img src="${review.user_profile_picture}" alt="avatar" class="review-avatar">` : ''}
                                    ${review.user_name || ''}
                                </span>
                                <span class="review-date">${review.createdAt ? new Date(review.createdAt).toLocaleDateString() : ''}</span>
                            </div>
                            <p class="review-text">${review.review_text}</p>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        
        showModal('school-modal');
    } catch (error) {
        console.error('Error loading school details:', error);
        alert('Error loading school details');
    }
}

// Map functions
function initializeMap() {
    const mapContainer = document.getElementById('map-container');
    
    if (!mapContainer) return;
    
    // Center map on Bhubaneswar
    map = L.map('map-container').setView([20.2961, 85.8245], 13); // Bhubaneswar
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);
    
    // Demo markers
    const demoMarkers = [
        { lat: 20.2961, lng: 85.8245, name: 'Bhubaneswar Public School' },
        { lat: 20.3000, lng: 85.8200, name: 'DAV School' },
        { lat: 20.3100, lng: 85.8300, name: 'KIIT International School' },
    ];
    demoMarkers.forEach(school => {
        L.marker([school.lat, school.lng]).addTo(map).bindPopup(`<b>${school.name}</b>`);
    });
}

async function loadSchoolsOnMap() {
    try {
        const response = await fetch(`${API_BASE}/schools`);
        const schoolsData = await response.json();
        
        // Clear existing markers
        markers.forEach(marker => map.removeLayer(marker));
        markers = [];
        
        const bounds = [];
        // Add markers for each school
        schoolsData.forEach(school => {
            if (school.latitude && school.longitude) {
                const marker = L.marker([school.latitude, school.longitude])
                    .bindPopup(`
                        <div class="map-popup">
                            <h3>${school.name}</h3>
                            <p>${school.location}</p>
                            <img src="${school.image_url || ''}" alt="School Image" style="max-width:150px;max-height:80px;" />
                            <p>Rating: ${(school.rating || 0).toFixed(1)} ⭐</p>
                            <button onclick="showSchoolDetails(${school.id})" class="btn btn-primary btn-sm">View Details</button>
                        </div>
                    `);
                marker.addTo(map);
                markers.push(marker);
                bounds.push([school.latitude, school.longitude]);
            }
        });
        // Fit map to markers if any
        if (bounds.length > 0) {
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    } catch (error) {
        console.error('Error loading schools on map:', error);
    }
}

function findNearbySchools(lat, lng, radius = 10) {
    // DEMO: Always show demo schools and markers
    // Clear existing markers
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];
    const demoSchools = [
        { id: 1, name: 'Bhubaneswar Public School', location: 'Bhubaneswar', latitude: 20.2961, longitude: 85.8245, distance: 1.2, rating: 4.5 },
        { id: 2, name: 'DAV School', location: 'Bhubaneswar', latitude: 20.3000, longitude: 85.8200, distance: 2.1, rating: 4.2 },
        { id: 3, name: 'KIIT International School', location: 'Bhubaneswar', latitude: 20.3100, longitude: 85.8300, distance: 3.5, rating: 4.8 },
    ];
    demoSchools.forEach(school => {
        if (school.latitude && school.longitude) {
            const marker = L.marker([school.latitude, school.longitude])
                .bindPopup(`
                    <div class="map-popup">
                        <h3>${school.name}</h3>
                        <p>${school.location}</p>
                        <p>Distance: ${school.distance.toFixed(1)} km</p>
                        <p>Rating: ${(school.rating || 0).toFixed(1)} ⭐</p>
                        <button onclick="showSchoolDetails(${school.id})" class="btn btn-primary btn-sm">
                            View Details
                        </button>
                    </div>
                `);
            marker.addTo(map);
            markers.push(marker);
        }
    });
    // Center map on user location
    map.setView([lat, lng], 12);
    // Add user location marker
    const userMarker = L.marker([lat, lng], {
        icon: L.divIcon({
            className: 'user-location-marker',
            html: '<i class="fas fa-user" style="color: #667eea; font-size: 20px;"></i>',
            iconSize: [20, 20]
        })
    }).addTo(map);
    markers.push(userMarker);
}

function handleCitySearch() {
    if (!currentUser) {
        alert('Please log in to search for schools.');
        return;
    }
    const city = document.getElementById('city-search').value.trim();
    const radius = document.getElementById('radius-input').value || 10;
    if (!city) {
        alert('Please enter a city or location.');
        return;
    }
    // DEMO: Use dummy coordinates for any city
    const lat = 20.2961;
    const lng = 85.8245;
    map.setView([lat, lng], 13);
    findNearbySchools(lat, lng, radius);
    document.getElementById('schools').classList.remove('hidden');
}

// Event listeners
function setupEventListeners() {
    // Navigation
    document.getElementById('login-btn').addEventListener('click', () => showModal('login-modal'));
    document.getElementById('register-btn').addEventListener('click', () => showModal('register-modal'));
    document.getElementById('logout-btn').addEventListener('click', logout);
    
    // Google OAuth
    document.getElementById('google-login').addEventListener('click', () => {
        window.location.href = `${API_BASE}/auth/google`;
    });
    document.getElementById('google-register').addEventListener('click', () => {
        window.location.href = `${API_BASE}/auth/google`;
    });
    
    // Forms
    document.getElementById('login-form').addEventListener('submit', handleLogin);
    document.getElementById('register-form').addEventListener('submit', handleRegister);
    
    // Search
    document.getElementById('search-btn').addEventListener('click', handleSearch);
    
    // Map controls
    document.getElementById('locate-btn').addEventListener('click', handleLocation);
    
    // Modals
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', () => {
            hideAllModals();
        });
    });
    
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                hideAllModals();
            }
        });
    });
    
    // Search on Enter key
    document.getElementById('school-search').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    });
    
    // City/location search
    document.getElementById('city-search-btn').addEventListener('click', handleCitySearch);
    document.getElementById('city-search').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleCitySearch();
        }
    });
    
    // Edit Profile
    document.getElementById('edit-profile-btn').addEventListener('click', openEditProfileModal);
    document.getElementById('edit-profile-form').addEventListener('submit', handleEditProfileSubmit);
    document.getElementById('edit-profile-picture').addEventListener('change', handleProfilePicPreview);
    
    // Profile dropdown toggle
    const userInfo = document.getElementById('user-info');
    const dropdown = document.getElementById('profile-dropdown');

    userInfo.addEventListener('click', function(e) {
        e.stopPropagation(); // Prevent document click from firing
        dropdown.classList.toggle('hidden');
    });

    document.addEventListener('click', function(e) {
        if (!dropdown.classList.contains('hidden')) {
            dropdown.classList.add('hidden');
        }
    });
    
    // Profile menu options
    document.getElementById('profile-edit-btn').addEventListener('click', () => {
        openEditProfileModal();
        document.getElementById('profile-dropdown').classList.add('hidden');
    });
    document.getElementById('profile-verify-btn').addEventListener('click', () => {
        alert('Email verification feature coming soon!');
        document.getElementById('profile-dropdown').classList.add('hidden');
    });
    document.getElementById('theme-toggle-btn').addEventListener('click', toggleTheme);
}

// Form handlers
async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    try {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await response.json();
        if (response.ok) {
            localStorage.setItem('token', data.token);
            // Fetch user info after login
            const userRes = await fetch(`${API_BASE}/auth/me`, {
                headers: { 'Authorization': `Bearer ${data.token}` }
            });
            const user = await userRes.json();
            currentUser = user;
            localStorage.setItem('user', JSON.stringify(user));
            updateUIForAuthenticatedUser();
            hideModal('login-modal');
            document.getElementById('login-form').reset();
        } else {
            alert(data.message || 'Login failed');
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('Login failed. Please try again.');
    }
}

async function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    try {
        const response = await fetch(`${API_BASE}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });
        const data = await response.json();
        if (response.ok) {
            localStorage.setItem('token', data.token);
            // Fetch user info after register
            const userRes = await fetch(`${API_BASE}/auth/me`, {
                headers: { 'Authorization': `Bearer ${data.token}` }
            });
            const user = await userRes.json();
            currentUser = user;
            localStorage.setItem('user', JSON.stringify(user));
            updateUIForAuthenticatedUser();
            hideModal('register-modal');
            document.getElementById('register-form').reset();
        } else {
            alert(data.message || 'Registration failed');
        }
    } catch (error) {
        console.error('Registration error:', error);
        alert('Registration failed. Please try again.');
    }
}

async function logout() {
    try {
        await fetch(`${API_BASE}/auth/logout`);
    } catch (error) {
        console.error('Logout error:', error);
    } finally {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        currentUser = null;
        updateUIForUnauthenticatedUser();
    }
}

// Search and filter functions
function handleSearch() {
    const searchTerm = document.getElementById('school-search').value;
    const category = document.getElementById('category-filter').value;
    const minRating = document.getElementById('rating-filter').value;
    
    const filters = {};
    if (searchTerm) filters.search = searchTerm;
    if (category) filters.category = category;
    if (minRating) filters.minRating = minRating;
    
    loadSchools(filters);
}

function handleLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                const radius = document.getElementById('radius-input').value || 10;
                
                findNearbySchools(lat, lng, radius);
            },
            (error) => {
                console.error('Geolocation error:', error);
                alert('Unable to get your location. Please check your browser settings.');
            }
        );
    } else {
        alert('Geolocation is not supported by this browser.');
    }
}

// Utility functions
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
    }
}

// Add review function
function showAddReviewForm(schoolId) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'flex';
    modal.innerHTML = `
        <div class="modal-content">
            <h2>Add Review</h2>
            <form id="demo-review-form">
                <label>Rating:</label>
                <select id="demo-rating">
                    <option value="5">5</option>
                    <option value="4">4</option>
                    <option value="3">3</option>
                    <option value="2">2</option>
                    <option value="1">1</option>
                </select>
                <label>Review:</label>
                <textarea id="demo-review-text" required></textarea>
                <button type="submit" class="btn btn-primary">Submit</button>
            </form>
        </div>
    `;
    document.body.appendChild(modal);
    document.getElementById('demo-review-form').onsubmit = function(e) {
        e.preventDefault();
        modal.querySelector('.modal-content').innerHTML = '<h2>Thank you for your review!</h2>';
        setTimeout(() => modal.remove(), 1200);
    };
}

async function addReview(schoolId, rating, reviewText) {
    try {
        const response = await fetch(`${API_BASE}/reviews/school/${schoolId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ rating, review_text: reviewText })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            alert('Review added successfully!');
            // Refresh school details
            showSchoolDetails(schoolId);
        } else {
            alert(data.message || 'Failed to add review');
        }
    } catch (error) {
        console.error('Error adding review:', error);
        alert('Failed to add review. Please try again.');
    }
}

// Add some CSS for map popups
const style = document.createElement('style');
style.textContent = `
    .map-popup {
        text-align: center;
        min-width: 200px;
    }
    .map-popup h3 {
        margin: 0 0 10px 0;
        color: #333;
    }
    .map-popup p {
        margin: 5px 0;
        color: #666;
    }
    .btn-sm {
        padding: 0.5rem 1rem;
        font-size: 0.9rem;
    }
    .user-location-marker {
        background: none;
        border: none;
    }
    .review-item {
        border-bottom: 1px solid #eee;
        padding: 1rem 0;
    }
    .review-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.5rem;
    }
    .review-author {
        font-weight: bold;
        color: #667eea;
    }
    .review-date {
        color: #999;
        font-size: 0.9rem;
    }
    .school-detail-info p {
        margin: 0.5rem 0;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    .school-description {
        margin: 1rem 0;
        padding: 1rem;
        background: #f8f9fa;
        border-radius: 8px;
    }
    .reviews-section {
        margin-top: 2rem;
        padding-top: 2rem;
        border-top: 1px solid #eee;
    }
    .reviews-list {
        margin-top: 1rem;
    }
    .error {
        color: #dc3545;
        text-align: center;
        padding: 2rem;
    }
    .no-results {
        text-align: center;
        padding: 2rem;
        color: #666;
    }
    .review-avatar {
        width: 24px;
        height: 24px;
        border-radius: 50%;
        object-fit: cover;
        margin-right: 0.5rem;
        vertical-align: middle;
    }
`;
document.head.appendChild(style);

function openEditProfileModal() {
    // Fill form with current user info
    document.getElementById('edit-name').value = currentUser.name || '';
    document.getElementById('edit-email').value = currentUser.email || '';
    if (currentUser.profile_picture) {
        document.getElementById('edit-profile-preview').src = currentUser.profile_picture;
        document.getElementById('edit-profile-preview').classList.remove('hidden');
    } else {
        document.getElementById('edit-profile-preview').classList.add('hidden');
    }
    showModal('edit-profile-modal');
}

function handleProfilePicPreview(e) {
    const file = e.target.files[0];
    const preview = document.getElementById('edit-profile-preview');
    if (file) {
        const reader = new FileReader();
        reader.onload = function(evt) {
            preview.src = evt.target.result;
            preview.classList.remove('hidden');
        };
        reader.readAsDataURL(file);
    } else {
        preview.classList.add('hidden');
    }
}

async function handleEditProfileSubmit(e) {
    e.preventDefault();
    const name = document.getElementById('edit-name').value;
    const email = document.getElementById('edit-email').value;
    const fileInput = document.getElementById('edit-profile-picture');
    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    if (fileInput.files[0]) {
        formData.append('profile_picture', fileInput.files[0]);
    }
    try {
        const response = await fetch('/api/auth/profile', {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: formData
        });
        const data = await response.json();
        if (response.ok) {
            // Fetch updated user info
            const userRes = await fetch(`${API_BASE}/auth/me`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const user = await userRes.json();
            currentUser = user;
            localStorage.setItem('user', JSON.stringify(user));
            alert('Profile updated successfully!');
            document.getElementById('user-name').textContent = user.name;
            if (user.profile_picture) {
                document.getElementById('user-avatar').src = user.profile_picture;
            }
            hideModal('edit-profile-modal');
        } else {
            alert(data.message || 'Failed to update profile.');
        }
    } catch (error) {
        console.error('Profile update error:', error);
        alert('Failed to update profile.');
    }
}

function toggleProfileDropdown() {
    const dropdown = document.getElementById('profile-dropdown');
    dropdown.classList.toggle('hidden');
}

function toggleTheme() {
    const body = document.body;
    const btn = document.getElementById('theme-toggle-btn');
    body.classList.toggle('dark-mode');
    const isDark = body.classList.contains('dark-mode');
    btn.textContent = isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode';
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
}

// On load, set theme from localStorage
(function setInitialTheme() {
    const theme = localStorage.getItem('theme');
    if (theme === 'dark') {
        document.body.classList.add('dark-mode');
        const btn = document.getElementById('theme-toggle-btn');
        if (btn) btn.textContent = 'Switch to Light Mode';
    } else {
        document.body.classList.remove('dark-mode');
        const btn = document.getElementById('theme-toggle-btn');
        if (btn) btn.textContent = 'Switch to Dark Mode';
    }
})();

// Fallback: event delegation for avatar click
window.addEventListener('click', function(e) {
    if (e.target.classList && e.target.classList.contains('profile-avatar-btn')) {
        toggleProfileDropdown();
    }
});

function showDemoLoginModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'flex';
    modal.innerHTML = `
        <div class="modal-content">
            <h2>Demo Login</h2>
            <p>Click below to log in as a demo user.</p>
            <button id="demo-login-btn" class="btn btn-primary">Log In as Demo User</button>
        </div>
    `;
    document.body.appendChild(modal);
    document.getElementById('demo-login-btn').onclick = async function() {
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: 'demo@schoolzy.com', password: 'demopasswordnow' })
            });
            const data = await response.json();
            console.log('Demo login response:', data);
            if (response.ok && data.token) {
                localStorage.setItem('token', data.token);
                try {
                    const userRes = await fetch('/api/auth/me', {
                        headers: { 'Authorization': `Bearer ${data.token}` }
                    });
                    const user = await userRes.json();
                    console.log('Fetched user:', user);
                    localStorage.setItem('user', JSON.stringify(user));
                    modal.remove();
                    location.reload();
                } catch (err) {
                    console.error('Error fetching user info:', err);
                    alert('Failed to fetch user info.');
                }
            } else {
                alert(data.message || 'Demo login failed.');
            }
        } catch (err) {
            console.error('Demo login error:', err);
            alert('Demo login failed.');
        }
    };
} 