/* ============================================================
   THE GRAND REGIS - LUXURY PREMIERE HOTEL
   Authentication System: Staff & Honored Guest Portals + Google OAuth Simulation
   ============================================================ */

let currentAuthRole = 'staff'; // 'staff' | 'guest'

// Check Active Session with Role Guard
function checkAuthSession(allowedType = null) {
  const session = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  if (!session) {
    window.location.href = 'login.html';
    return null;
  }
  
  const user = JSON.parse(session);
  if (allowedType && user.userType && user.userType !== allowedType) {
    // Redirect to correct dashboard
    if (user.userType === 'guest') {
      window.location.href = 'guest-dashboard.html';
    } else {
      window.location.href = 'dashboard.html';
    }
    return null;
  }
  return user;
}

// Check If Already Logged In
function redirectIfLoggedIn() {
  const session = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  if (session) {
    const user = JSON.parse(session);
    if (user.userType === 'guest') {
      window.location.href = 'guest-dashboard.html';
    } else {
      window.location.href = 'dashboard.html';
    }
  }
}

// Log Out Handler
function handleLogout() {
  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  showLuxuryToast('Sampai Jumpa', 'Sesi Anda telah diakhiri dengan aman.');
  setTimeout(() => {
    window.location.href = 'login.html';
  }, 600);
}

// ------------------------------------------------------------
// INITIALIZE LOGIN FORM
// ------------------------------------------------------------
function initLoginForm() {
  redirectIfLoggedIn();

  const loginForm = document.getElementById('loginForm');
  const roleStaffTab = document.getElementById('roleStaffTab');
  const roleGuestTab = document.getElementById('roleGuestTab');

  // Role Tab Switching
  if (roleStaffTab && roleGuestTab) {
    roleStaffTab.addEventListener('click', () => switchAuthRole('staff'));
    roleGuestTab.addEventListener('click', () => switchAuthRole('guest'));
  }

  // Handle Standard Form Submit
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;

      if (!email || !password) {
        showLuxuryToast('Validasi Gagal', 'Mohon lengkapi email dan kata sandi Anda.', 'error');
        return;
      }

      const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
      const matchedUser = users.find(u => 
        u.email.toLowerCase() === email.toLowerCase() && 
        u.password === password
      );

      if (matchedUser) {
        // Store Active Session
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(matchedUser));
        
        if (matchedUser.userType === 'guest') {
          showLuxuryToast('Selamat Datang', `Selamat datang kembali, Tamu Kehormatan ${matchedUser.name}`, 'success');
          setTimeout(() => {
            window.location.href = 'guest-dashboard.html';
          }, 800);
        } else {
          showLuxuryToast('Akses Diberikan', `Selamat bertugas, ${matchedUser.name} (${matchedUser.role})`, 'success');
          setTimeout(() => {
            window.location.href = 'dashboard.html';
          }, 800);
        }
      } else {
        showLuxuryToast('Akses Ditolak', 'Kredensial email atau kata sandi tidak cocok.', 'error');
      }
    });
  }

  // Quick Demo Buttons
  setupQuickDemoButtons();

  // Setup Google Login
  initGoogleAuth();
}

// Switch UI State between Staff and Guest
function switchAuthRole(role) {
  currentAuthRole = role;

  const roleStaffTab = document.getElementById('roleStaffTab');
  const roleGuestTab = document.getElementById('roleGuestTab');
  const emailLabel = document.getElementById('authEmailLabel');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const portalTitle = document.getElementById('portalTitle');
  const portalSubtitle = document.getElementById('portalSubtitle');
  const demoBoxTitle = document.getElementById('demoBoxTitle');
  const demoButtonsContainer = document.getElementById('demoButtonsContainer');

  if (role === 'staff') {
    roleStaffTab.classList.add('active');
    roleGuestTab.classList.remove('active');

    if (portalTitle) portalTitle.textContent = 'PORTAL OPERASIONAL STAF';
    if (portalSubtitle) portalSubtitle.textContent = 'Akses khusus resepsionis, butler, dan manajemen hotel';
    if (emailLabel) emailLabel.innerHTML = '<i class="fas fa-envelope"></i> Email Kedinasan Staf';
    if (emailInput) {
      emailInput.placeholder = 'manager@stregis.com';
      emailInput.value = '';
    }
    if (passwordInput) passwordInput.value = '';

    if (demoBoxTitle) demoBoxTitle.innerHTML = '<i class="fas fa-bolt"></i> Demo Cepat Akun Staf';
    if (demoButtonsContainer) {
      demoButtonsContainer.innerHTML = `
        <button type="button" class="btn-demo-quick" id="demoStaff1">
          <i class="fas fa-user-shield"></i> Front Desk Manager
        </button>
        <button type="button" class="btn-demo-quick" id="demoStaff2">
          <i class="fas fa-concierge-bell"></i> Head Butler
        </button>
      `;
    }
  } else {
    roleGuestTab.classList.add('active');
    roleStaffTab.classList.remove('active');

    if (portalTitle) portalTitle.textContent = 'PORTAL TAMU KEHORMATAN';
    if (portalSubtitle) portalSubtitle.textContent = 'Masuk untuk melihat reservasi, kunci digital, dan layanan Butler';
    if (emailLabel) emailLabel.innerHTML = '<i class="fas fa-envelope"></i> Email Tamu / Anggota VIP';
    if (emailInput) {
      emailInput.placeholder = 'tamu@grandregis.com';
      emailInput.value = '';
    }
    if (passwordInput) passwordInput.value = '';

    if (demoBoxTitle) demoBoxTitle.innerHTML = '<i class="fas fa-bolt"></i> Demo Cepat Tamu Kehormatan';
    if (demoButtonsContainer) {
      demoButtonsContainer.innerHTML = `
        <button type="button" class="btn-demo-quick" id="demoGuest1">
          <i class="fas fa-crown"></i> Lord Sterling (VIP)
        </button>
        <button type="button" class="btn-demo-quick" id="demoGuest2">
          <i class="fas fa-gem"></i> Clarissa (Titanium)
        </button>
      `;
    }
  }

  setupQuickDemoButtons();
}

// Setup Quick Demo Click Handlers
function setupQuickDemoButtons() {
  const staff1 = document.getElementById('demoStaff1');
  const staff2 = document.getElementById('demoStaff2');
  const guest1 = document.getElementById('demoGuest1');
  const guest2 = document.getElementById('demoGuest2');

  if (staff1) {
    staff1.addEventListener('click', () => {
      document.getElementById('email').value = 'manager@stregis.com';
      document.getElementById('password').value = 'Password123';
      showLuxuryToast('Demo Staf', 'Kredensial Front Desk Manager terisi.');
    });
  }
  if (staff2) {
    staff2.addEventListener('click', () => {
      document.getElementById('email').value = 'concierge@stregis.com';
      document.getElementById('password').value = 'Password123';
      showLuxuryToast('Demo Staf', 'Kredensial Head Butler terisi.');
    });
  }
  if (guest1) {
    guest1.addEventListener('click', () => {
      document.getElementById('email').value = 'tamu@grandregis.com';
      document.getElementById('password').value = 'Guest123';
      showLuxuryToast('Demo Tamu', 'Kredensial Tamu Kehormatan (Lord Sterling) terisi.');
    });
  }
  if (guest2) {
    guest2.addEventListener('click', () => {
      document.getElementById('email').value = 'clarissa@guest.com';
      document.getElementById('password').value = 'Guest123';
      showLuxuryToast('Demo Tamu', 'Kredensial Tamu Titanium (Clarissa) terisi.');
    });
  }
}

// ------------------------------------------------------------
// GOOGLE AUTHENTICATION INTEGRATION
// ------------------------------------------------------------
function initGoogleAuth() {
  const googleBtn = document.getElementById('googleSignInBtn');
  if (googleBtn) {
    googleBtn.addEventListener('click', openGoogleModal);
  }
}

function openGoogleModal() {
  let modal = document.getElementById('googleAuthModal');
  if (!modal) {
    createGoogleAuthModal();
    modal = document.getElementById('googleAuthModal');
  }
  modal.classList.add('active');
}

function closeGoogleModal() {
  const modal = document.getElementById('googleAuthModal');
  if (modal) modal.classList.remove('active');
}

function createGoogleAuthModal() {
  const modal = document.createElement('div');
  modal.className = 'modal-backdrop';
  modal.id = 'googleAuthModal';
  modal.innerHTML = `
    <div class="modal-dialog" style="max-width: 440px; background: #ffffff; color: #1f2937;">
      <div class="modal-header" style="border-bottom: 1px solid #e5e7eb; padding: 1.25rem 1.5rem;">
        <div style="display: flex; align-items: center; gap: 0.6rem;">
          <svg width="22" height="22" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          <span style="font-weight: 600; font-size: 1rem; color: #374151;">Login dengan Google</span>
        </div>
        <button class="modal-close-btn" style="color: #6b7280;" onclick="closeGoogleModal()"><i class="fas fa-times"></i></button>
      </div>

      <div class="modal-body" style="padding: 1.5rem; background: #fff;">
        <p style="font-size: 0.85rem; color: #4b5563; margin-bottom: 1.25rem;">
          Pilih akun Google Anda untuk melanjutkan reservasi ke <strong>The Grand Regis — Luxury Premiere Hotel</strong>:
        </p>

        <div class="google-account-list">
          <div class="google-account-item" style="background: #f9fafb; border: 1px solid #e5e7eb; color: #111;" onclick="loginWithGoogleAccount(0)">
            <div class="google-account-avatar" style="background: #1a73e8;">AS</div>
            <div>
              <div style="font-weight: 600; font-size: 0.88rem; color: #111827;">Alexander Sterling</div>
              <div style="font-size: 0.78rem; color: #6b7280;">alexander.sterling@gmail.com</div>
              <span style="font-size: 0.68rem; background: #e0f2fe; color: #0369a1; padding: 1px 6px; border-radius: 4px; font-weight: 600;">Google Verified VIP</span>
            </div>
          </div>

          <div class="google-account-item" style="background: #f9fafb; border: 1px solid #e5e7eb; color: #111;" onclick="loginWithGoogleAccount(1)">
            <div class="google-account-avatar" style="background: #e11d48;">ES</div>
            <div>
              <div style="font-weight: 600; font-size: 0.88rem; color: #111827;">Lady Evelyn Sinclair</div>
              <div style="font-size: 0.78rem; color: #6b7280;">evelyn.sinclair@gmail.com</div>
              <span style="font-size: 0.68rem; background: #fdf2f8; color: #be185d; padding: 1px 6px; border-radius: 4px; font-weight: 600;">Google Verified VIP</span>
            </div>
          </div>
        </div>

        <div style="margin-top: 1.25rem; padding-top: 1rem; border-top: 1px solid #f3f4f6; text-align: center;">
          <button type="button" style="background: none; border: none; color: #1a73e8; font-size: 0.82rem; font-weight: 600; cursor: pointer;" onclick="promptCustomGoogleEmail()">
            + Gunakan akun Google lain
          </button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

function loginWithGoogleAccount(index) {
  const account = GOOGLE_DEMO_ACCOUNTS[index] || GOOGLE_DEMO_ACCOUNTS[0];

  // Save active session as Guest
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(account));
  closeGoogleModal();

  showLuxuryToast('Otorisasi Google Sukses', `Selamat datang, ${account.name}! Menyiapkan suite Anda...`, 'success');

  setTimeout(() => {
    window.location.href = 'guest-dashboard.html';
  }, 900);
}

function promptCustomGoogleEmail() {
  const email = prompt('Masukkan alamat email Google Anda:', 'tamu.kehormatan@gmail.com');
  if (email && email.includes('@')) {
    const customUser = {
      id: 'GOOG-' + Math.floor(1000 + Math.random() * 9000),
      name: email.split('@')[0].replace('.', ' ').toUpperCase(),
      email: email,
      avatar: email[0].toUpperCase(),
      role: 'Honored Guest',
      userType: 'guest',
      vipTier: 'Google Member VIP',
      points: '50.000 PTS',
      isGoogleAuth: true
    };
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(customUser));
    closeGoogleModal();
    showLuxuryToast('Google Auth', `Terautentikasi sebagai ${customUser.email}`, 'success');
    setTimeout(() => {
      window.location.href = 'guest-dashboard.html';
    }, 800);
  }
}

// ------------------------------------------------------------
// INITIALIZE REGISTER FORM
// ------------------------------------------------------------
function initRegisterForm() {
  redirectIfLoggedIn();

  const registerForm = document.getElementById('registerForm');
  const roleStaffTab = document.getElementById('roleStaffTab');
  const roleGuestTab = document.getElementById('roleGuestTab');
  const staffRoleField = document.getElementById('staffRoleField');

  if (roleStaffTab && roleGuestTab) {
    roleStaffTab.addEventListener('click', () => {
      currentAuthRole = 'staff';
      roleStaffTab.classList.add('active');
      roleGuestTab.classList.remove('active');
      if (staffRoleField) staffRoleField.style.display = 'block';
    });

    roleGuestTab.addEventListener('click', () => {
      currentAuthRole = 'guest';
      roleGuestTab.classList.add('active');
      roleStaffTab.classList.remove('active');
      if (staffRoleField) staffRoleField.style.display = 'none';
    });
  }

  // Setup Google Login button in register page
  initGoogleAuth();

  if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const fullName = document.getElementById('fullName').value.trim();
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;
      const confirmPassword = document.getElementById('confirmPassword').value;
      const staffRoleSelect = document.getElementById('role');
      const role = currentAuthRole === 'staff' ? (staffRoleSelect ? staffRoleSelect.value : 'Front Desk Officer') : 'Honored Guest';

      if (!fullName || !email || !password || !confirmPassword) {
        showLuxuryToast('Validasi Gagal', 'Harap lengkapi semua data pendaftaran.', 'error');
        return;
      }

      if (password.length < 6) {
        showLuxuryToast('Sandi Terlalu Singkat', 'Kata sandi minimal 6 karakter.', 'error');
        return;
      }

      if (password !== confirmPassword) {
        showLuxuryToast('Sandi Tidak Cocok', 'Konfirmasi kata sandi tidak sama.', 'error');
        return;
      }

      const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
      const exists = users.some(u => u.email.toLowerCase() === email.toLowerCase());

      if (exists) {
        showLuxuryToast('Email Terdaftar', 'Email tersebut sudah terdaftar di sistem.', 'error');
        return;
      }

      const newUser = {
        id: (currentAuthRole === 'staff' ? 'USR-' : 'GST-') + Math.floor(1000 + Math.random() * 9000),
        name: fullName,
        email: email,
        password: password,
        role: role,
        userType: currentAuthRole,
        vipTier: currentAuthRole === 'guest' ? 'Silver Member' : null,
        badge: currentAuthRole === 'staff' ? 'REGIS-' + Math.floor(100 + Math.random() * 900) : null,
        points: currentAuthRole === 'guest' ? '25.000 PTS' : null
      };

      users.push(newUser);
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));

      // Auto login to target dashboard
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(newUser));
      showLuxuryToast('Pendaftaran Berhasil', `Selamat datang, ${fullName}! Mengalihkan ke portal Anda...`, 'success');

      setTimeout(() => {
        if (currentAuthRole === 'guest') {
          window.location.href = 'guest-dashboard.html';
        } else {
          window.location.href = 'dashboard.html';
        }
      }, 1100);
    });
  }
}

// Password Visibility Toggle
function togglePasswordVisibility(inputId, btnElement) {
  const input = document.getElementById(inputId);
  if (!input) return;

  if (input.type === 'password') {
    input.type = 'text';
    btnElement.innerHTML = '<i class="fas fa-eye-slash"></i>';
  } else {
    input.type = 'password';
    btnElement.innerHTML = '<i class="fas fa-eye"></i>';
  }
}
