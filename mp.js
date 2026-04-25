// mp.js

function showLoginForm() {
  document.getElementById('registerForm').classList.add('hidden');
  document.getElementById('loginForm').classList.remove('hidden');
}

function showRegisterForm() {
  document.getElementById('loginForm').classList.add('hidden');
  document.getElementById('registerForm').classList.remove('hidden');
}

// Popup Functions
function showPopup(title, message, isSuccess) {
  const popup = document.getElementById('popup');
  const icon = document.getElementById('popupIcon');
  const titleEl = document.getElementById('popupTitle');
  const msgEl = document.getElementById('popupMessage');

  titleEl.textContent = title;
  msgEl.textContent = message;

  if (isSuccess) {
    icon.className = 'fas fa-check-circle';
    icon.style.color = '#22d3ee';
  } else {
    icon.className = 'fas fa-exclamation-circle';
    icon.style.color = '#ef4444';
  }

  popup.classList.remove('hidden');
}

function closePopup() {
  document.getElementById('popup').classList.add('hidden');
}

// Register Form (same as before)
document.getElementById('registerFormElement').addEventListener('submit', async function(e) {
  e.preventDefault();
  const formData = new FormData(this);
  const btn = document.getElementById('registerBtn');
  const originalText = btn.innerHTML;

  btn.innerHTML = 'Creating Account...';
  btn.disabled = true;

  try {
    const response = await fetch('/register', { method: 'POST', body: formData });
    const result = await response.json();

    if (result.success) {
      showPopup('Success!', result.message || 'Registration successful!', true);
      this.reset();
    } else {
      showPopup('Error', result.message || 'Something went wrong', false);
    }
  } catch (error) {
    showPopup('Error', 'Server error. Please try again.', false);
  } finally {
    btn.innerHTML = originalText;
    btn.disabled = false;
  }
});

document.getElementById('loginFormElement').addEventListener('submit', async function(e) {
  e.preventDefault();

  const emailOrContact = this.emailOrContact.value;
  const password = this.password.value;

  try {
    const response = await fetch('/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ emailOrContact, password })
    });

    const result = await response.json();

    if (result.success) {
      const userRole = result.user.role.toLowerCase();

      localStorage.setItem('currentUser', JSON.stringify(result.user));

      let redirectPage = '';

      switch(userRole) {
        case 'admin': redirectPage = 'admin.html'; break;
        case 'tme': redirectPage = 'tme.html'; break;
        case 'me': redirectPage = 'me.html'; break;
        case 'dev': redirectPage = 'dev.html'; break;
        default: redirectPage = 'index.html';
      }

      showPopup('Welcome!', `Login successful as ${userRole.toUpperCase()}`, true);

      setTimeout(() => {
        window.location.href = redirectPage;
      }, 1500);

    } else {
      showPopup('Login Failed', result.message, false);
    }

  } catch (error) {
    showPopup('Error', 'Server error', false);
  }
});