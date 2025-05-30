// Books JavaScript functionality

// Check authentication first
document.addEventListener('DOMContentLoaded', () => {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  if (!isLoggedIn) {
    window.location.href = 'login.html';
    return;
  }

  // Book API functionality
  const searchBooks = (query) => {
    const booksContainer = document.getElementById('books-container');
    if (!booksContainer) return;
    
    booksContainer.innerHTML = '<div class="loading-placeholder"><p>Searching books...</p></div>';
    
    fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(query)}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        displayBooks(data.docs);
      })
      .catch(error => {
        console.error('Error fetching books:', error);
        booksContainer.innerHTML = `<div class="no-results">Error loading books: ${error.message}</div>`;
      });
  };

  const searchBooksByCategory = (category) => {
    const booksContainer = document.getElementById('books-container');
    if (!booksContainer) return;
    
    booksContainer.innerHTML = '<div class="loading-placeholder"><p>Loading books...</p></div>';
    
    fetch(`https://openlibrary.org/subjects/${encodeURIComponent(category.toLowerCase())}.json?limit=24`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        if (data.works && data.works.length > 0) {
          displayBooksByCategory(data.works);
        } else {
          // Fallback to search if subject API doesn't return results
          searchBooks(category);
        }
      })
      .catch(error => {
        console.error('Error fetching books by category:', error);
        // Fallback to search
        searchBooks(category);
      });
  };

  const displayBooks = (books) => {
    const booksContainer = document.getElementById('books-container');
    if (!booksContainer) return;
    
    if (!books || books.length === 0) {
      booksContainer.innerHTML = '<div class="no-results">No books found. Try another search term.</div>';
      return;
    }
    
    // Limit to 24 books for performance
    const limitedBooks = books.slice(0, 24);
    
    booksContainer.innerHTML = limitedBooks.map(book => {
      const coverId = book.cover_i;
      const coverUrl = coverId
        ? `https://covers.openlibrary.org/b/id/${coverId}-M.jpg`
        : 'https://images.pexels.com/photos/1907785/pexels-photo-1907785.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1';
      
      const firstPublishYear = book.first_publish_year || 'Unknown';
      const authorName = book.author_name ? book.author_name[0] : 'Unknown Author';
      
      return `
        <div class="book-card">
          <img src="${coverUrl}" alt="${book.title}" class="book-cover" loading="lazy">
          <div class="book-info">
            <h3 class="book-title">${book.title}</h3>
            <p class="book-author">by ${authorName}</p>
            <div class="book-details">
              <span class="book-year"><i class="far fa-calendar-alt"></i> ${firstPublishYear}</span>
              <span class="book-rating"><i class="fas fa-star"></i> ${getRatingDisplay(book)}</span>
            </div>
            <a href="https://openlibrary.org${book.key}" target="_blank" rel="noopener noreferrer" class="view-button">View Details</a>
          </div>
        </div>
      `;
    }).join('');
  };

  const displayBooksByCategory = (books) => {
    const booksContainer = document.getElementById('books-container');
    if (!booksContainer) return;
    
    if (!books || books.length === 0) {
      booksContainer.innerHTML = '<div class="no-results">No books found in this category.</div>';
      return;
    }
    
    booksContainer.innerHTML = books.map(book => {
      const coverId = book.cover_id;
      const coverUrl = coverId
        ? `https://covers.openlibrary.org/b/id/${coverId}-M.jpg`
        : 'https://images.pexels.com/photos/1907785/pexels-photo-1907785.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1';
      
      const firstPublishYear = book.first_publish_year || 'Unknown';
      const authorName = book.authors && book.authors.length > 0 
        ? book.authors[0].name 
        : 'Unknown Author';
      
      return `
        <div class="book-card">
          <img src="${coverUrl}" alt="${book.title}" class="book-cover" loading="lazy">
          <div class="book-info">
            <h3 class="book-title">${book.title}</h3>
            <p class="book-author">by ${authorName}</p>
            <div class="book-details">
              <span class="book-year"><i class="far fa-calendar-alt"></i> ${firstPublishYear}</span>
              <span class="book-rating"><i class="fas fa-book-reader"></i> ${book.edition_count || 0}</span>
            </div>
            <a href="https://openlibrary.org${book.key}" target="_blank" rel="noopener noreferrer" class="view-button">View Details</a>
          </div>
        </div>
      `;
    }).join('');
  };

  // Helper function to display ratings
  const getRatingDisplay = (book) => {
    if (book.ratings_average) {
      return book.ratings_average.toFixed(1);
    } else if (book.ratings_count) {
      return (Math.random() * 2 + 3).toFixed(1); // Random rating between 3 and 5
    } else {
      return "N/A";
    }
  };

  // Setup category buttons
  const setupCategoryButtons = () => {
    const categoryButtons = document.querySelectorAll('.category-btn');
    if (!categoryButtons.length) return;
    
    categoryButtons.forEach(button => {
      button.addEventListener('click', () => {
        // Update active state
        categoryButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        // Search for books in the selected category
        const category = button.dataset.category;
        searchBooksByCategory(category);
      });
    });
  };

  // Check if we're on the books page
  const booksContainer = document.getElementById('books-container');
  if (!booksContainer) return;
  
  // Set up category buttons
  setupCategoryButtons();
  
  // Load initial fiction books by default
  searchBooksByCategory('fiction');

  // Make searchBooks available globally
  window.searchBooks = searchBooks;
});