// News Functionality
const NEWS_API_KEY = "bcfec7e39aef4933bfb5ea572f824efe";
const DEFAULT_COUNTRY = "us";
const DEFAULT_CATEGORY = "general";

let requestURL;
let currentContentType = "news";
let currentQuery = "";

// Main functions for news display
const generateNewsUI = (articles) => {
  const container = document.getElementById('news-container');
  if (!container) return;
  
  if (!articles || articles.length === 0) {
    container.innerHTML = "<p class='no-content'>No news available at the moment. Please try another category.</p>";
    return;
  }

  container.innerHTML = articles.map(item => {
    const image = item.urlToImage || 'https://images.pexels.com/photos/518543/pexels-photo-518543.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1';
    
    return `
      <div class="news-card">
        <div class="news-image-container">
          <img src="${image}" alt="${item.title || 'News image'}" loading="lazy" />
        </div>
        <div class="news-content">
          <div class="news-title">${item.title || 'No title available'}</div>
          <div class="news-description">${item.description || item.content || 'No description available'}</div>
          <a href="${item.url}" target="_blank" rel="noopener noreferrer" class="view-button">Read More</a>
        </div>
      </div>
    `;
  }).join('');
};

// API Calls
const getNews = async () => {
  const container = document.getElementById('news-container');
  if (!container) return;
  
  try {
    container.innerHTML = "<p class='loading'>Loading news...</p>";
    const response = await fetch(requestURL);
    if (!response.ok) throw new Error("Failed to fetch news");
    const data = await response.json();
    generateNewsUI(data.articles);
  } catch (error) {
    console.error("Error fetching news:", error);
    container.innerHTML = `<p class='error'>News data unavailable. Error: ${error.message}</p>`;
  }
};

// Category Selection
const selectCategory = (e, category) => {
  const optionButtons = document.querySelectorAll(".option");
  optionButtons.forEach(button => button.classList.remove("active"));
  e.target.classList.add("active");

  currentContentType = "news";
  if (currentQuery) {
    requestURL = `https://newsapi.org/v2/everything?q=${currentQuery}&apiKey=${NEWS_API_KEY}`;
  } else {
    requestURL = `https://newsapi.org/v2/top-headlines?country=${DEFAULT_COUNTRY}&category=${category}&apiKey=${NEWS_API_KEY}`;
  }
  
  getNews();
};

// Search functionality
const searchNews = (query) => {
  if (!query) return;
  
  currentQuery = query;
  requestURL = `https://newsapi.org/v2/everything?q=${query}&apiKey=${NEWS_API_KEY}`;
  getNews();
  
  // Update category buttons
  const optionButtons = document.querySelectorAll(".option");
  optionButtons.forEach(button => button.classList.remove("active"));
};

// Initialize news functionality
document.addEventListener("DOMContentLoaded", () => {
  // Check if we're on the homepage/news page
  const newsContainer = document.getElementById('news-container');
  if (!newsContainer) return;
  
  // Set up category button event listeners
  const optionButtons = document.querySelectorAll(".option");
  optionButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      const category = button.textContent.trim().toLowerCase();
      selectCategory(e, category);
    });
  });
  
  // Load initial news
  requestURL = `https://newsapi.org/v2/top-headlines?country=${DEFAULT_COUNTRY}&category=${DEFAULT_CATEGORY}&apiKey=${NEWS_API_KEY}`;
  getNews();
}); 
