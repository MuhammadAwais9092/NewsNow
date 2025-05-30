// Profile page functionality
document.addEventListener('DOMContentLoaded', async () => {
  // Check if user is logged in
  const checkAuth = async () => {
    try {
      const res = await fetch('/users/profile', { credentials: 'include' });
      if (res.status === 401) {
        window.location.href = 'login.html';
        return false;
      }
      return true;
    } catch {
      window.location.href = 'login.html';
      return false;
    }
  };

  const authenticated = await checkAuth();
  if (!authenticated) return;

  const profileForm = document.getElementById('profileForm');
  const photoInput = document.getElementById('photoInput');
  const profilePhoto = document.getElementById('profilePhoto');

  // Handle photo upload
  if (photoInput) {
    photoInput.addEventListener('change', (e) => {
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

      const selectedCategories = Array.from(
        document.querySelectorAll('input[name="categories"]:checked')
      ).map(checkbox => checkbox.value);
      formData.append('categories', JSON.stringify(selectedCategories));

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

        if (document.getElementById('name')) {
          document.getElementById('name').value = userData.name || '';
        }
        if (document.getElementById('age')) {
          document.getElementById('age').value = userData.age || '';
        }
        if (profilePhoto && userData.photoUrl) {
          profilePhoto.src = userData.photoUrl;
        }
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

  // Load user data after confirming authentication
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
