// Global variables
let map;
let currentUser = null;
let schools = [];
let markers = [];

// API base URL - use Vite env if available
const API_BASE = typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL + '/api'
  : (window.SCHOOLZY_CONFIG ? window.SCHOOLZY_CONFIG.API_BASE_URL : '/api');
console.log('API_BASE:', API_BASE);

// Loading state management
let isLoading = false;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing Schoolzy app...');
    console.log('API Base URL:', API_BASE);
    
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

    // Find Schools
    const findSchoolsBtn = document.getElementById('findSchoolsBtn');
    if (findSchoolsBtn) {
        findSchoolsBtn.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = 'schools.html';
        });
    } else {
        console.warn('Find Schools button (#findSchoolsBtn) not found');
    }

    // View Map
    const viewMapBtn = document.getElementById('viewMapBtn');
    if (viewMapBtn) {
        viewMapBtn.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = 'map.html';
        });
    } else {
        console.warn('View Map button (#viewMapBtn) not found');
    }

    // Login
    const loginBtn = document.getElementById('login-btn');
    if (loginBtn) {
        loginBtn.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = 'login.html';
        });
    } else {
        console.warn('Login button (#login-btn) not found');
    }

    // Register
    const registerBtn = document.getElementById('register-btn');
    if (registerBtn) {
        registerBtn.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = 'register.html';
        });
    } else {
        console.warn('Register button (#register-btn) not found');
    }
});

// Connectivity test function
async function testBackendConnectivity() {
    try {
        console.log('Testing backend connectivity...');
        const testUrl = `${API_BASE.replace('/api', '')}/api/test`;
        console.log('Test URL:', testUrl);
        
        const response = await fetch(testUrl);
        console.log('Test response status:', response.status);
        
        if (response.ok) {
            const data = await response.json();
            console.log('Backend connectivity test successful:', data);
            return true;
        } else {
            console.error('Backend connectivity test failed:', response.status);
            return false;
        }
    } catch (error) {
        console.error('Backend connectivity test error:', error);
        return false;
    }
}

// Health check function
async function checkBackendHealth() {
    try {
        console.log('Checking backend health...');
        const healthUrl = `${API_BASE.replace('/api', '')}/api/health`;
        console.log('Health URL:', healthUrl);
        
        const response = await fetch(healthUrl);
        console.log('Health response status:', response.status);
        
        if (response.ok) {
            const data = await response.json();
            console.log('Backend health check successful:', data);
            return data;
        } else {
            console.error('Backend health check failed:', response.status);
            return null;
        }
    } catch (error) {
        console.error('Backend health check error:', error);
        return null;
    }
}

async function initializeApp() {
    try {
        showLoadingMessage('Initializing app...');
        
        // Test backend connectivity first
        const isConnected = await testBackendConnectivity();
        if (!isConnected) {
            showErrorMessage('Cannot connect to backend server. Please check your internet connection.');
            hideLoadingMessage();
            return;
        }
        
        // Check backend health
        const health = await checkBackendHealth();
        if (health) {
            console.log('Backend environment:', health.environment);
            console.log('Firebase configured:', health.firebase.configured);
        }
        
        await checkAuthStatus();
        await loadSchools();
        initializeMap();
        
        // Load schools on map if user is authenticated
        if (currentUser) {
            await loadSchoolsOnMap();
        }
        
        setupEventListeners();
        hideLoadingMessage();
    } catch (error) {
        console.error('App initialization error:', error);
        showErrorMessage('Failed to initialize app. Please refresh the page.');
        hideLoadingMessage();
    }
}

// Loading and error message functions
function showLoadingMessage(message) {
    const loadingDiv = document.getElementById('loading-message') || createLoadingElement();
    loadingDiv.textContent = message;
    loadingDiv.style.display = 'block';
}

function hideLoadingMessage() {
    const loadingDiv = document.getElementById('loading-message');
    if (loadingDiv) {
        loadingDiv.style.display = 'none';
    }
}

function showErrorMessage(message) {
    const errorDiv = document.getElementById('error-message') || createErrorElement();
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, 5000);
}

function createLoadingElement() {
    const div = document.createElement('div');
    div.id = 'loading-message';
    div.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #667eea;
        color: white;
        padding: 10px 20px;
        border-radius: 5px;
        z-index: 10000;
        display: none;
    `;
    document.body.appendChild(div);
    return div;
}

function createErrorElement() {
    const div = document.createElement('div');
    div.id = 'error-message';
    div.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #e53e3e;
        color: white;
        padding: 10px 20px;
        border-radius: 5px;
        z-index: 10000;
        display: none;
    `;
    document.body.appendChild(div);
    return div;
}

// Authentication functions
async function checkAuthStatus() {
    const token = localStorage.getItem('token');
    if (token) {
        try {
            console.log('Checking auth status...');
            // Fetch user info from backend
            const res = await fetch(`${API_BASE}/auth/me`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const user = await res.json();
                currentUser = user;
                localStorage.setItem('user', JSON.stringify(user));
                updateUIForAuthenticatedUser();
                console.log('User authenticated:', user.name);
                return;
            } else {
                console.log('Token invalid, removing from storage');
                // Token invalid/expired
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            }
        } catch (err) {
            console.error('Auth check error:', err);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }
    }
    updateUIForUnauthenticatedUser();
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
    userAvatar.onclick = toggleProfileDropdown;
    // Show admin dashboard link if user is admin
    const dropdown = document.getElementById('profile-dropdown');
    let adminLink = document.getElementById('admin-dashboard-btn');
    if (currentUser.role === 'admin') {
        if (!adminLink) {
            adminLink = document.createElement('button');
            adminLink.id = 'admin-dashboard-btn';
            adminLink.className = 'dropdown-item';
            adminLink.textContent = 'Admin Dashboard';
            adminLink.onclick = function(e) {
                e.stopPropagation();
                window.location.href = '/admin-dashboard.html';
            };
            dropdown.insertBefore(adminLink, dropdown.firstChild);
        } else {
            adminLink.classList.remove('hidden');
        }
    } else if (adminLink) {
        adminLink.classList.add('hidden');
    }
    document.getElementById('map').classList.remove('hidden');
    document.getElementById('schools').classList.add('hidden');
    document.getElementById('prompt-section').classList.add('hidden');
    
    // Load schools on map after authentication
    loadSchoolsOnMap();
}

function updateUIForUnauthenticatedUser() {
    document.getElementById('auth-buttons').classList.remove('hidden');
    document.getElementById('user-info').classList.add('hidden');
    currentUser = null;
    // Hide admin dashboard link if present
    const adminLink = document.getElementById('admin-dashboard-btn');
    if (adminLink) adminLink.classList.add('hidden');
    document.getElementById('schools').classList.add('hidden');
    document.getElementById('map').classList.add('hidden');
    document.getElementById('prompt-section').classList.remove('hidden');
    document.getElementById('prompt-message').textContent = 'Please log in and enter your location to find schools near you.';
}

// Modal functions
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('hidden');
        console.log(`Opened modal: ${modalId}`);
    } else {
        console.warn(`Modal not found: ${modalId}`);
    }
}

function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('hidden');
        console.log(`Closed modal: ${modalId}`);
    } else {
        console.warn(`Modal not found: ${modalId}`);
    }
}

function hideAllModals() {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => modal.classList.add('hidden'));
}

// School functions
async function loadSchools(filters = {}) {
    const loading = document.getElementById('loading');
    const schoolsGrid = document.getElementById('schools-grid');
    
    if (isLoading) {
        console.log('Already loading schools, skipping...');
        return;
    }
    
    isLoading = true;
    loading.classList.remove('hidden');
    schoolsGrid.innerHTML = '';
    
    try {
        console.log('Loading schools with filters:', filters);
        const queryParams = new URLSearchParams(filters).toString();
        const url = `${API_BASE}/schools?${queryParams}`;
        console.log('Fetching from URL:', url);
        
        const response = await fetch(url);
        console.log('Response status:', response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Schools API response:', data);
        
        // Handle the correct API response structure
        const schoolsData = 
         data.schools || data || [];
        schools = schoolsData;
        
        console.log(`Loaded ${schools.length} schools`);
        displaySchools(schools);
    } catch (error) {
        console.error('Error loading schools:', error);
        const errorMessage = `Error loading schools: ${error.message}`;
        schoolsGrid.innerHTML = `<p class="error">${errorMessage}</p>`;
        showErrorMessage(errorMessage);
    } finally {
        isLoading = false;
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
                <p class="school-location">${school.location || 'Location not specified'}</p>
                <p class="school-rating">Rating: ${(school.averageRating || 0).toFixed(1)} ⭐ (${school.reviewCount || 0} reviews)</p>
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
    if (!mapContainer) {
        console.error('Map container not found!');
        return;
    }
    // Prevent double initialization
    if (window.map) {
        window.map.invalidateSize();
        return;
    }
    // Ensure container is visible and has height
    mapContainer.style.display = 'block';
    mapContainer.style.height = '500px';

    // Center map on Bhubaneswar
    window.map = L.map('map-container').setView([20.2961, 85.8245], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(window.map);
}

// Helper function to clear map error messages
function clearMapMessages() {
    const mapContainer = document.getElementById('map-container');
    if (mapContainer) {
        const existingMessages = mapContainer.querySelectorAll('.map-error, .map-no-schools');
        existingMessages.forEach(msg => msg.remove());
    }
}

async function loadSchoolsOnMap() {
    try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/schools`);
        if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
        const data = await res.json();
        console.log('Loaded schools data:', data);

        // Defensive: ensure schools is always an array
        const schools = Array.isArray(data.schools) ? data.schools : [];
        if (schools.length === 0) {
            showNoSchoolsFoundOnMap(); // Show a friendly message, not an error
            return;
        }

        // Clear existing markers if needed
        if (window.markers) {
            window.markers.forEach(marker => marker.remove());
        }
        window.markers = [];

        schools.forEach(school => {
            // Defensive: check for valid coordinates
            if (
                typeof school.latitude === 'number' &&
                typeof school.longitude === 'number' &&
                !isNaN(school.latitude) &&
                !isNaN(school.longitude)
            ) {
                const marker = L.marker([school.latitude, school.longitude])
                    .addTo(window.map)
                    .bindPopup(`<b>${school.name}</b><br>${school.location}`);
                window.markers.push(marker);
            } else {
                console.warn('Skipping school with invalid coordinates:', school);
            }
        });
        // Force map to resize in case container was hidden
        setTimeout(() => { window.map.invalidateSize(); }, 500);
    } catch (err) {
        console.error('Error loading map data:', err);
        showErrorToast('Error loading schools. Please try again.');
    }
}

function showNoSchoolsFoundOnMap() {
    // You can customize this to show a message on the map or in the UI
    alert('No schools found for this area.');
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
    const loginBtn = document.getElementById('login-btn');
    if (loginBtn) loginBtn.addEventListener('click', function() { window.location.href = 'login.html'; });
    const registerBtn = document.getElementById('register-btn');
    if (registerBtn) registerBtn.addEventListener('click', function() { window.location.href = 'register.html'; });
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) logoutBtn.addEventListener('click', logout);
    // Google OAuth
    const googleLogin = document.getElementById('google-login');
    if (googleLogin) googleLogin.addEventListener('click', function() { window.location.href = `${API_BASE}/auth/google`; });
    const googleRegister = document.getElementById('google-register');
    if (googleRegister) googleRegister.addEventListener('click', function() { window.location.href = `${API_BASE}/auth/google`; });
    // Forms
    const loginForm = document.getElementById('login-form');
    if (loginForm) loginForm.addEventListener('submit', handleLogin);
    const registerForm = document.getElementById('register-form');
    if (registerForm) registerForm.addEventListener('submit', handleRegister);
    // Search
    const searchBtn = document.getElementById('search-btn');
    if (searchBtn) searchBtn.addEventListener('click', handleSearch);
    // Map controls
    const locateBtn = document.getElementById('locate-btn');
    if (locateBtn) locateBtn.addEventListener('click', handleLocation);
    // Modals (remove modal code, use navigation instead)
    // Search on Enter key
    const schoolSearch = document.getElementById('school-search');
    if (schoolSearch) schoolSearch.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleSearch(); });
    // City/location search
    const citySearchBtn = document.getElementById('city-search-btn');
    if (citySearchBtn) citySearchBtn.addEventListener('click', handleCitySearch);
    const citySearch = document.getElementById('city-search');
    if (citySearch) citySearch.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleCitySearch(); });
    // Edit Profile
    const editProfileBtn = document.getElementById('edit-profile-btn');
    if (editProfileBtn) editProfileBtn.addEventListener('click', openEditProfileModal);
    const editProfileForm = document.getElementById('edit-profile-form');
    if (editProfileForm) editProfileForm.addEventListener('submit', handleEditProfileSubmit);
    const editProfilePicture = document.getElementById('edit-profile-picture');
    if (editProfilePicture) editProfilePicture.addEventListener('change', handleProfilePicPreview);
    // Profile dropdown toggle
    const userInfo = document.getElementById('user-info');
    const dropdown = document.getElementById('profile-dropdown');
    if (userInfo && dropdown) {
        userInfo.addEventListener('click', function(e) {
            e.stopPropagation();
            dropdown.classList.toggle('hidden');
        });
        document.addEventListener('click', function() {
            dropdown.classList.add('hidden');
        });
    }
}

// Form handlers
async function handleLogin(e) {
    e.preventDefault();
    
    if (isLoading) {
        console.log('Already processing login, skipping...');
        return;
    }
    
    isLoading = true;
    showLoadingMessage('Logging in...');
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    try {
        console.log('Attempting login for:', email);
        const url = `${API_BASE}/auth/login`;
        console.log('Login URL:', url);
        
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        console.log('Login response status:', response.status);
        const data = await response.json();
        console.log('Login response:', data);
        
        if (response.ok) {
            localStorage.setItem('token', data.token);
            console.log('Login successful, fetching user info...');
            
            // Fetch user info after login
            const userRes = await fetch(`${API_BASE}/auth/me`, {
                headers: { 'Authorization': `Bearer ${data.token}` }
            });
            
            if (userRes.ok) {
                const user = await userRes.json();
                currentUser = user;
                localStorage.setItem('user', JSON.stringify(user));
                updateUIForAuthenticatedUser();
                hideModal('login-modal');
                hideLoadingMessage();
                showLoadingMessage('Loading schools...');
                
                // Load schools on map after successful login
                await loadSchoolsOnMap();
                hideLoadingMessage();
            } else {
                throw new Error('Failed to fetch user profile after login');
            }
        } else {
            const errorMessage = data.message || 'Login failed';
            console.error('Login failed:', errorMessage);
            showErrorMessage(errorMessage);
        }
    } catch (error) {
        console.error('Login error:', error);
        const errorMessage = `Login failed: ${error.message}`;
        showErrorMessage(errorMessage);
    } finally {
        isLoading = false;
        hideLoadingMessage();
    }
}

async function handleRegister(e) {
    e.preventDefault();
    
    if (isLoading) {
        console.log('Already processing registration, skipping...');
        return;
    }
    
    isLoading = true;
    showLoadingMessage('Creating account...');
    
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    
    try {
        console.log('Attempting registration for:', email);
        const url = `${API_BASE}/auth/register`;
        console.log('Register URL:', url);
        
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });
        
        console.log('Register response status:', response.status);
        const data = await response.json();
        console.log('Register response:', data);
        
        if (response.ok) {
            localStorage.setItem('token', data.token);
            console.log('Registration successful, fetching user info...');
            
            // Fetch user info after register
            const userRes = await fetch(`${API_BASE}/auth/me`, {
                headers: { 'Authorization': `Bearer ${data.token}` }
            });
            
            if (userRes.ok) {
                const user = await userRes.json();
                currentUser = user;
                localStorage.setItem('user', JSON.stringify(user));
                updateUIForAuthenticatedUser();
                hideModal('register-modal');
                document.getElementById('register-form').reset();
                hideLoadingMessage();
                showLoadingMessage('Loading schools...');
                
                // Load schools on map after successful registration
                await loadSchoolsOnMap();
                hideLoadingMessage();
            } else {
                throw new Error('Failed to fetch user profile after registration');
            }
        } else {
            const errorMessage = data.message || 'Registration failed';
            console.error('Registration failed:', errorMessage);
            showErrorMessage(errorMessage);
        }
    } catch (error) {
        console.error('Registration error:', error);
        const errorMessage = `Registration failed: ${error.message}`;
        showErrorMessage(errorMessage);
    } finally {
        isLoading = false;
        hideLoadingMessage();
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
        console.log(`Scrolled to section: ${sectionId}`);
    } else {
        console.warn(`Section not found: ${sectionId}`);
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