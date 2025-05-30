// Profile page functionality
document.addEventListener('DOMContentLoaded', () => {
  // Check if user is logged in
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  if (!isLoggedIn) {
    window.location.href = 'login.html';
    return;
  }

  const profileForm = document.getElementById('profileForm');
  const photoInput = document.getElementById('photoInput');
  const profilePhoto = document.getElementById('profilePhoto');

  // Handle photo upload
  if (photoInput) {
    photoInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        profilePhoto.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  }

  // Handle form submission
  if (profileForm) {
    profileForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const formData = new FormData();
      formData.append('name', document.getElementById('name').value);
      formData.append('age', document.getElementById('age').value);
      
      // Get selected categories
      const selectedCategories = Array.from(document.querySelectorAll('input[name="categories"]:checked'))
        .map(checkbox => checkbox.value);
      formData.append('categories', JSON.stringify(selectedCategories));

      // Add photo if changed
      if (photoInput && photoInput.files[0]) {
        formData.append('photo', photoInput.files[0]);
      }

      try {
        const response = await fetch('/users/profile', {
          method: 'POST',
          body: formData,
          credentials: 'include' // Include cookies for session
        });

        if (response.ok) {
          alert('Profile updated successfully!');
          window.location.href = '../index.html';
        } else {
          const error = await response.json();
          throw new Error(error.message || 'Failed to update profile');
        }
      } catch (error) {
        console.error('Error updating profile:', error);
        alert(error.message || 'Failed to update profile. Please try again.');
      }
    });
  }

  // Load user data
  const loadUserData = async () => {
    try {
      const response = await fetch('/users/profile', {
        credentials: 'include' // Include cookies for session
      });
      
      if (response.ok) {
        const userData = await response.json();
        
        // Populate form fields
        if (document.getElementById('name')) {
          document.getElementById('name').value = userData.name || '';
        }
        if (document.getElementById('age')) {
          document.getElementById('age').value = userData.age || '';
        }
        
        // Set profile photo if exists
        if (profilePhoto && userData.photoUrl) {
          profilePhoto.src = userData.photoUrl;
        }
        
        // Check categories
        if (userData.categories) {
          userData.categories.forEach(category => {
            const checkbox = document.querySelector(`input[value="${category}"]`);
            if (checkbox) checkbox.checked = true;
          });
        }
      } else {
        throw new Error('Failed to load user data');
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      alert('Failed to load user data. Please try again.');
    }
  };

  // Load user data when page loads
  loadUserData();

  // Handle logout
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      localStorage.removeItem('isLoggedIn');
      window.location.href = '../index.html';
    });
  }
});