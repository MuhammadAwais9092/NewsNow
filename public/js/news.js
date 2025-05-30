// News Functionality
const NEWS_API_KEY = "pub_4466fa12104b4251b164457d018b8854";
const BASE_URL = "https://newsdata.io/api/1/news";
const DEFAULT_COUNTRY = "us";
const DEFAULT_CATEGORY = "top";

let requestURL;
let currentContentType = "news";
let currentQuery = "";

// Helper function to truncate text
const truncate = (str, maxLength = 150) => {
  if (!str) return '';
  return str.length > maxLength ? str.slice(0, maxLength) + '...' : str;
};

// Generate News UI
const generateNewsUI = (articles) => {
  const container = document.getElementById('news-container');
  if (!container) return;

  if (!articles || articles.length === 0) {
    container.innerHTML = "<p class='no-content'>No news available at the moment. Please try another category.</p>";
    return;
  }

  container.innerHTML = articles.map(item => {
    const image = item.image_url || 'https://images.pexels.com/photos/518543/pexels-photo-518543.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1';

    // Use truncate for description
    const description = truncate(item.description || item.content || 'No description available', 150);

    return `
      <div class="news-card">
        <div class="news-image-container">
          <img src="${image}" alt="${item.title || 'News image'}" loading="lazy" />
        </div>
        <div class="news-content">
          <div class="news-title">${item.title || 'No title available'}</div>
          <div class="news-description">${description}</div>
          <a href="${item.link}" target="_blank" rel="noopener noreferrer" class="view-button">Read More</a>
        </div>
      </div>
    `;
  }).join('');
};

// API Call
const getNews = async () => {
  const container = document.getElementById('news-container');
  if (!container) return;

  try {
    container.innerHTML = "<p class='loading'>Loading news...</p>";
    const response = await fetch(requestURL);
    if (!response.ok) throw new Error("Failed to fetch news");
    const data = await response.json();
    generateNewsUI(data.results);
  } catch (error) {
    console.error("Error fetching news:", error);
    container.innerHTML = `<p class='error'>News data unavailable. Error: ${error.message}</p>`;
  }
};

// Handle search form submit
document.getElementById("search-form").addEventListener("submit", function (e) {
  e.preventDefault();
  const query = document.getElementById("search-input").value.trim();
  if (query) {
    searchNews(query);
  }
});

// Category Selection
const selectCategory = (e, category) => {
  const optionButtons = document.querySelectorAll(".option");
  optionButtons.forEach(button => button.classList.remove("active"));
  e.target.classList.add("active");

  currentContentType = "news";
  if (currentQuery) {
    requestURL = `${BASE_URL}?apikey=${NEWS_API_KEY}&q=${currentQuery}&language=en`;
  } else {
    requestURL = `${BASE_URL}?apikey=${NEWS_API_KEY}&country=${DEFAULT_COUNTRY}&category=${category}&language=en`;
  }

  getNews();
};

// Search Functionality
const searchNews = (query) => {
  if (!query) return;

  currentQuery = query;
  requestURL = `${BASE_URL}?apikey=${NEWS_API_KEY}&q=${query}&language=en`;
  getNews();

  const optionButtons = document.querySelectorAll(".option");
  optionButtons.forEach(button => button.classList.remove("active"));
};

// Initialize on Page Load
document.addEventListener("DOMContentLoaded", () => {
  const newsContainer = document.getElementById('news-container');
  if (!newsContainer) return;

  const optionButtons = document.querySelectorAll(".option");
  optionButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      const category = button.textContent.trim().toLowerCase();
      selectCategory(e, category);
    });
  });

  requestURL = `${BASE_URL}?apikey=${NEWS_API_KEY}&country=${DEFAULT_COUNTRY}&category=${DEFAULT_CATEGORY}&language=en`;
  getNews();
});
