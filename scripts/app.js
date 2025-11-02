// Main Application Logic - Debug Version

// DOM Elements
// Add to DOM Elements section
const hotspotsPage = document.getElementById('hotspots-page');
const pages = document.querySelectorAll('.page');
const landingPage = document.getElementById('landing-page');
const authPage = document.getElementById('auth-page');
const dashboardPage = document.getElementById('dashboard-page');
const reportFoundPage = document.getElementById('report-found-page');
const searchPage = document.getElementById('search-page');
const imageSearchPage = document.getElementById('image-search-page');
const chatHelpPage = document.getElementById('chat-help-page');
const itemDetailPage = document.getElementById('item-detail-page');
const mainNav = document.getElementById('main-nav');

// Navigation Functions
function showPage(page) {
    console.log('Showing page:', page.id);
    
    pages.forEach(p => {
        p.classList.remove('active');
    });
    
    page.classList.add('active');
    
    // Update active nav link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    // Find and activate the corresponding nav link
    const activeNavLink = document.querySelector(`[data-page="${page.id}"]`);
    if (activeNavLink) {
        activeNavLink.classList.add('active');
    }
}

// Simple Get Started Button Fix
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded - setting up event listeners');
    
    // Direct event listener for Get Started button
    const getStartedBtn = document.getElementById('get-started-btn');
    console.log('Get Started button found:', getStartedBtn);
    
    if (getStartedBtn) {
        getStartedBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Get Started button clicked!');
            showPage(authPage);
        });
        
        // Also add onclick attribute as backup
        getStartedBtn.setAttribute('onclick', "showPage(document.getElementById('auth-page'))");
        
        console.log('Event listener attached to Get Started button');
    } else {
        console.error('Get Started button not found!');
    }
    
    // Initialize other components
    initializeEventListeners();
    initializeCloudinaryWidgets();
    initializeChatTopics();
});

// Rest of your existing functions...
function initializeEventListeners() {
    console.log('Initializing other event listeners...');

    // Navigation links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const pageId = link.getAttribute('data-page');
            const page = document.getElementById(pageId);
            if (page) {
                if (pageId === 'image-search-page') {
                    clearImageSearch();
                }
                showPage(page);
            }
        });
    });

    // Dashboard options
    document.getElementById('report-found-option').addEventListener('click', () => {
        showPage(reportFoundPage);
    });
    document.getElementById('search-items-option').addEventListener('click', () => {
        showPage(searchPage);
    });
    document.getElementById('image-search-option').addEventListener('click', () => {
        showPage(imageSearchPage);
    });
    
    // Import data option
    const importDataOption = document.getElementById('import-data-option');
    if (importDataOption) {
        importDataOption.addEventListener('click', () => {
            if (dataImporter && typeof dataImporter.manualImport === 'function') {
                dataImporter.manualImport();
            } else {
                alert("Data importer is not available. Please check if data-importer.js is loaded correctly.");
            }
        });
    }
    
    // Chat help option
    const chatHelpOption = document.getElementById('chat-help-option');
    if (chatHelpOption) {
        chatHelpOption.addEventListener('click', () => {
            showPage(chatHelpPage);
        });
    }
    // Add to initializeEventListeners() function
    document.getElementById('hotspots-option').addEventListener('click', () => {
    showPage(document.getElementById('hotspots-page'));
   });

    // Authentication
    const authBtn = document.getElementById('auth-btn');
    const toggleAuth = document.getElementById('toggle-auth');
    
    if (authBtn) {
        authBtn.addEventListener('click', handleAuth);
    }
    if (toggleAuth) {
        toggleAuth.addEventListener('click', toggleAuthMode);
    }
    
    // Logout button
    const logoutBtn = document.getElementById('logout-btn-nav');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }

    // Report submission
    const reportSubmitBtn = document.getElementById('report-found-btn-submit');
    if (reportSubmitBtn) {
        reportSubmitBtn.addEventListener('click', () => submitReport(false));
    }

    // Search
    const searchBtn = document.getElementById('search-btn');
    const imageSearchBtn = document.getElementById('image-search-btn');
    
    if (searchBtn) {
        searchBtn.addEventListener('click', performTextSearch);
    }
    
    if (imageSearchBtn) {
        imageSearchBtn.addEventListener('click', performImageSearch);
    }
}

// Authentication Functions
function toggleAuthMode(e) {
    e.preventDefault();
    const authTitle = document.getElementById("auth-title");
    const authText = document.getElementById("auth-text");
    const authBtn = document.getElementById("auth-btn");
    const toggleAuth = document.getElementById("toggle-auth");
    
    let isLogin = authTitle.textContent === "Login";
    isLogin = !isLogin;
    
    authTitle.textContent = isLogin ? "Login" : "Sign Up";
    authText.textContent = isLogin
        ? "Welcome back! Please log in to continue."
        : "Create your account to report or search items!";
    authBtn.textContent = isLogin ? "Login" : "Sign Up";
    toggleAuth.innerHTML = isLogin ? "Sign Up" : "Login";
}

async function handleAuth() {
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const authBtn = document.getElementById("auth-btn");
    
    const email = emailInput ? emailInput.value.trim() : '';
    const password = passwordInput ? passwordInput.value.trim() : '';
    
    if (!email || !password) {
        alert("Please fill in both fields.");
        return;
    }

    if (!auth) {
        alert("Authentication service not available. Please refresh the page.");
        return;
    }

    authBtn.disabled = true;
    authBtn.innerHTML = '<div class="spinner" style="width:20px;height:20px;margin:0 auto;"></div>';

    try {
        let isLogin = document.getElementById("auth-title").textContent === "Login";
        
        if (isLogin) {
            // Firebase Login
            await auth.signInWithEmailAndPassword(email, password);
            alert("Login successful!");
        } else {
            // Firebase Sign Up
            const userCredential = await auth.createUserWithEmailAndPassword(email, password);
            const uid = userCredential.user.uid;
            if (db) {
                await db.collection('users').doc(uid).set({
                    email: email,
                    uid: uid,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
            }
            alert("Signup successful! You are now logged in.");
        }
    } catch (error) {
        let isLogin = document.getElementById("auth-title").textContent === "Login";
        alert(isLogin ? "Login Failed: " + error.message : "Signup Failed: " + error.message);
    } finally {
        authBtn.disabled = false;
        let isLogin = document.getElementById("auth-title").textContent === "Login";
        authBtn.textContent = isLogin ? "Login" : "Sign Up";
    }
}

async function handleLogout(e) {
    e.preventDefault();
    if (auth) {
        try {
            await auth.signOut();
            alert("You have been successfully logged out.");
        } catch (error) {
            alert("Logout Error: " + error.message);
        }
    }
}

// Simple versions of other essential functions
function clearImageSearch() {
    const searchInput = document.getElementById('image-search-input');
    const previewContainer = document.getElementById('image-search-preview-container');
    const imageSearchResultsDiv = document.getElementById('image-search-results');
    const noImageResultsDiv = document.getElementById('no-image-results');
    
    if (searchInput) {
        searchInput.removeAttribute('data-cloudinary-url');
        searchInput.removeAttribute('data-cloudinary-public-id');
    }
    
    if (previewContainer) {
        previewContainer.innerHTML = '';
    }
    
    if (imageSearchResultsDiv) {
        imageSearchResultsDiv.innerHTML = '';
    }
    
    if (noImageResultsDiv) {
        noImageResultsDiv.style.display = 'none';
    }
}

function removeImagePreview() {
    const foundItemImageInput = document.getElementById("found-item-image");
    const imagePreviewContainer = document.getElementById("image-preview-container");
    
    if (foundItemImageInput) {
        foundItemImageInput.removeAttribute('data-cloudinary-url');
        foundItemImageInput.removeAttribute('data-cloudinary-public-id');
        foundItemImageInput.removeAttribute('data-ml-analysis');
    }
    
    if (imagePreviewContainer) {
        imagePreviewContainer.innerHTML = '';
    }
}

function viewItemDetails(itemId) {
    alert("Item details feature would show here for item: " + itemId);
    showPage(searchPage);
}

// Make functions available globally
window.showPage = showPage;
window.removeImagePreview = removeImagePreview;
window.clearImageSearch = clearImageSearch;
window.viewItemDetails = viewItemDetails;

// Firebase Auth State Listener
if (typeof auth !== 'undefined') {
    auth.onAuthStateChanged((user) => {
        if (user && user.isAnonymous === false) {
            // User is signed in with email/password
            showPage(dashboardPage);
            mainNav.classList.remove("hidden");
            const getStartedBtn = document.getElementById('get-started-btn');
            if (getStartedBtn) {
                getStartedBtn.style.display = "none";
            }
        } else {
            // No user signed in
            showPage(landingPage);
            mainNav.classList.add("hidden");
            const getStartedBtn = document.getElementById('get-started-btn');
            if (getStartedBtn) {
                getStartedBtn.style.display = "block";
            }
        }
    });
}

// Initialize with today's date
window.addEventListener('load', function() {
    const today = new Date().toISOString().split('T')[0];
    const foundDateInput = document.getElementById('found-date');
    if (foundDateInput) {
        foundDateInput.value = today;
    }
});

// Backup event listener - runs after everything is loaded
window.addEventListener('load', function() {
    console.log('Window fully loaded - adding backup listeners');
    
    const getStartedBtn = document.getElementById('get-started-btn');
    if (getStartedBtn) {
        // Remove any existing listeners and add fresh one
        const newBtn = getStartedBtn.cloneNode(true);
        getStartedBtn.parentNode.replaceChild(newBtn, getStartedBtn);
        
        newBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Backup listener - Get Started clicked!');
            showPage(authPage);
        });
        
        console.log('Backup listener attached');
    }
});

// Placeholder functions for other components
function initializeCloudinaryWidgets() {
    console.log('Cloudinary widgets would initialize here');
}

function initializeChatTopics() {
    console.log('Chat topics would initialize here');
}

async function submitReport(isLost) {
    alert("Report submission would happen here");
    showPage(dashboardPage);
}

async function performTextSearch() {
    alert("Text search would happen here");
}

async function performImageSearch() {
    alert("Image search would happen here");
}