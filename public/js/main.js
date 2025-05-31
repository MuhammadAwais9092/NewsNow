// Main JavaScript functionality for all pages

// Mobile Navigation
function setupMobileNav() {
  const openButton = document.getElementById('open-sidebar-button');
  const navbar = document.getElementById('navbar');
  const media = window.matchMedia("(max-width: 768px)");

  // Only set up event listener if the element exists
  if (media) {
    media.addEventListener('change', (e) => updateNavbar(e));
    // Initial call to set the correct state
    updateNavbar(media);
  }

  function updateNavbar(e) {
    if (!navbar) return;
    
    const isMobile = e.matches;
    if (isMobile) {
      navbar.setAttribute('inert', '');
    } else {
      navbar.removeAttribute('inert');
    }
  }
}

function openSidebar() {
  const navbar = document.getElementById('navbar');
  const openButton = document.getElementById('open-sidebar-button');
  
  if (!navbar || !openButton) return;
  
  navbar.classList.add('show');
  openButton.setAttribute('aria-expanded', 'true');
  navbar.removeAttribute('inert');
  document.body.style.overflow = 'hidden';
}

function closeSidebar() {
  const navbar = document.getElementById('navbar');
  const openButton = document.getElementById('open-sidebar-button');
  
  if (!navbar || !openButton) return;
  
  navbar.classList.remove('show');
  openButton.setAttribute('aria-expanded', 'false');
  navbar.setAttribute('inert', '');
  document.body.style.overflow = '';
}

// Dark Mode Toggle with localStorage persistence
function setupDarkMode() {
  const toggleBtn = document.getElementById("darkModeToggle");
  if (!toggleBtn) return;

  // Initialize dark mode from localStorage or system preference
  const initDarkMode = () => {
    const savedMode = localStorage.getItem("darkMode");
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    const isDark = savedMode !== null ? savedMode === "true" : systemPrefersDark;
    
    document.body.classList.toggle("light-mode", !isDark);
    toggleBtn.textContent = isDark ? "☀️" : "🌙";
    
    // Save initial preference if not already set
    if (savedMode === null) {
      localStorage.setItem("darkMode", isDark);
    }
  };

  const toggleDarkMode = () => {
    const isDark = !document.body.classList.contains("light-mode");
    document.body.classList.toggle("light-mode");
    toggleBtn.textContent = isDark ? "🌙" : "☀️";
    localStorage.setItem("darkMode", isDark);
  };

  // Listen for system color scheme changes
  const colorSchemeMedia = window.matchMedia('(prefers-color-scheme: dark)');
  colorSchemeMedia.addEventListener('change', (e) => {
    if (localStorage.getItem("darkMode") === null) {
      const isDark = e.matches;
      document.body.classList.toggle("light-mode", !isDark);
      toggleBtn.textContent = isDark ? "☀️" : "🌙";
    }
  });

  // Event listener for the toggle button
  toggleBtn.addEventListener("click", toggleDarkMode);
  
  // Initialize dark mode
  initDarkMode();
}

// Search functionality
function setupSearch() {
  const searchForm = document.getElementById('search-form');
  const searchInput = document.getElementById('search-input');
  
  if (!searchForm || !searchInput) return;
  
  searchForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const query = searchInput.value.trim();
    
    if (query === '') return;
    
    // Determine which search function to call based on the current page
    const currentPage = window.location.pathname;
    
    if (currentPage.includes('books') || currentPage.endsWith('books.html')) {
      // If on books page
      if (typeof searchBooks === 'function') {
        searchBooks(query);
      }
    } else {
      // Default to news search
      if (typeof searchNews === 'function') {
        searchNews(query);
      }
    }
  });
}

// Check authentication status and update UI
async function updateAuthUI() {
  try {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const nav = document.querySelector('nav ul');
    if (!nav) return;

    // Find or create auth link
    let authLink = nav.querySelector('.auth-link');
    if (!authLink) {
      authLink = document.createElement('li');
      authLink.className = 'auth-link';
      nav.appendChild(authLink);
    }

    // Update auth link based on login status
    if (isLoggedIn) {
      authLink.innerHTML = '<a href="#" class="accent-link" onclick="handleLogout(event)">Logout</a>';
    } else {
      authLink.innerHTML = '<a href="pages/login.html" class="accent-link">Login</a>';
    }

    // Redirect from protected pages if not logged in
    const protectedPages = ['/pages/books.html'];
    if (!isLoggedIn && protectedPages.some(page => window.location.pathname.endsWith(page))) {
      window.location.href = '/pages/login.html';
    }
  } catch (error) {
    console.error('Error checking auth status:', error);
  }
}

// Handle logout
async function handleLogout(event) {
  event.preventDefault();
  try {
    const response = await fetch('/logout');
    if (response.ok) {
      localStorage.removeItem('isLoggedIn');
      window.location.href = '/';
    }
  } catch (error) {
    console.error('Error during logout:', error);
  }
}

// Initialize all functionality when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  setupMobileNav();
  setupDarkMode();
  setupSearch();
  updateAuthUI();
});
