/* ============================================================
   THE GRAND REGIS JAKARTA - SEED DATA & UTILITIES
   Initial room inventory, mock reservations, and helper tools
   ============================================================ */

const STORAGE_KEYS = {
  USERS: 'grand_regis_users',
  CURRENT_USER: 'grand_regis_session',
  ROOMS: 'grand_regis_rooms',
  RESERVATIONS: 'grand_regis_reservations'
};

// Initial Room Master Data (The St. Regis Jakarta Suite Collection)
const INITIAL_ROOMS = [
  {
    id: 'R801',
    number: '801',
    name: 'The Presidential Suite',
    type: 'Presidential Suite',
    rate: 38000000,
    floor: 8,
    features: ['370 sqm', 'Private Butler 24h', 'Skyline Terrace', 'Grand Piano'],
    status: 'occupied', // occupied | available | cleaning
    currentGuest: 'Bambang Soedirman'
  },
  {
    id: 'R602',
    number: '602',
    name: 'Caroline Astor Suite',
    type: 'Caroline Astor Suite',
    rate: 22500000,
    floor: 6,
    features: ['190 sqm', 'Signature Butler', 'Marble Soaking Tub', 'Panoramic City'],
    status: 'available',
    currentGuest: null
  },
  {
    id: 'R505',
    number: '505',
    name: 'The Astor Suite',
    type: 'Astor Suite',
    rate: 15000000,
    floor: 5,
    features: ['140 sqm', 'Separate Living Room', 'Walk-in Wardrobe', 'Champagne Bar'],
    status: 'cleaning',
    currentGuest: null
  },
  {
    id: 'R402',
    number: '402',
    name: 'The St. Regis Suite',
    type: 'St. Regis Suite',
    rate: 9800000,
    floor: 4,
    features: ['95 sqm', 'King Luxury Bed', 'Regis Butler Service', 'Executive Desk'],
    status: 'occupied',
    currentGuest: 'Alexander Wright'
  },
  {
    id: 'R304',
    number: '304',
    name: 'Grand Deluxe Room',
    type: 'Grand Deluxe',
    rate: 6200000,
    floor: 3,
    features: ['65 sqm', 'High Ceiling', 'City View', 'Spa Rainshower'],
    status: 'available',
    currentGuest: null
  },
  {
    id: 'R308',
    number: '308',
    name: 'Deluxe King Sanctuary',
    type: 'Deluxe King',
    rate: 4900000,
    floor: 3,
    features: ['55 sqm', 'Signature Bedding', 'Espresso Lounge', 'Smart Automation'],
    status: 'available',
    currentGuest: null
  }
];

// Initial Mock Reservations
const INITIAL_RESERVATIONS = [
  {
    id: 'RSV-8821',
    guestName: 'Bambang Soedirman',
    guestIdentity: '3171051203800001',
    guestEmail: 'bambang.soedirman@corp.id',
    guestPhone: '+62 811 8892 110',
    vipTier: 'Marriott Ambassador Elite',
    roomNumber: '801',
    roomType: 'Presidential Suite',
    checkInDate: '2026-09-04',
    checkOutDate: '2026-09-07',
    nights: 3,
    ratePerNight: 38000000,
    depositPaid: 50000000,
    totalFolio: 114000000,
    specialRequests: 'High security protocol, evening St. Regis Champagne Sabrage, VIP airport transfer',
    status: 'Checked-In', // 'Reserved' | 'Checked-In' | 'Checked-Out' | 'Cancelled'
    roomKeyIssued: 'KEY-801-AMB',
    checkInTime: '2026-09-04 14:15',
    checkOutTime: null
  },
  {
    id: 'RSV-8822',
    guestName: 'Clarissa Tanudjaja',
    guestIdentity: '3174094508920002',
    guestEmail: 'clarissa.t@horizon.com',
    guestPhone: '+62 812 9901 4432',
    vipTier: 'Titanium Elite',
    roomNumber: '602',
    roomType: 'Caroline Astor Suite',
    checkInDate: '2026-09-05',
    checkOutDate: '2026-09-08',
    nights: 3,
    ratePerNight: 22500000,
    depositPaid: 20000000,
    totalFolio: 67500000,
    specialRequests: 'Allergic to feather pillows, prefer lavender aromatherapy turn-down',
    status: 'Reserved',
    roomKeyIssued: null,
    checkInTime: null,
    checkOutTime: null
  },
  {
    id: 'RSV-8823',
    guestName: 'Alexander Wright',
    guestIdentity: 'P-GBR-9920148',
    guestEmail: 'a.wright@diplomat.co.uk',
    guestPhone: '+44 7911 123456',
    vipTier: 'Platinum Elite',
    roomNumber: '402',
    roomType: 'St. Regis Suite',
    checkInDate: '2026-09-03',
    checkOutDate: '2026-09-06',
    nights: 3,
    ratePerNight: 9800000,
    depositPaid: 15000000,
    totalFolio: 29400000,
    specialRequests: 'Late checkout requested at 15:00 WIB, British newspaper in room',
    status: 'Checked-In',
    roomKeyIssued: 'KEY-402-EXP',
    checkInTime: '2026-09-03 15:30',
    checkOutTime: null
  },
  {
    id: 'RSV-8824',
    guestName: 'Dr. Raden Mas Arya',
    guestIdentity: '3172081907750003',
    guestEmail: 'dr.arya@medika.org',
    guestPhone: '+62 813 4455 6677',
    vipTier: 'Gold Member',
    roomNumber: '304',
    roomType: 'Grand Deluxe',
    checkInDate: '2026-09-05',
    checkOutDate: '2026-09-06',
    nights: 1,
    ratePerNight: 6200000,
    depositPaid: 6200000,
    totalFolio: 6200000,
    specialRequests: 'Quiet room away from elevator, extra bath towels',
    status: 'Reserved',
    roomKeyIssued: null,
    checkInTime: null,
    checkOutTime: null
  },
  {
    id: 'RSV-8820',
    guestName: 'Madame Sophie Laurent',
    guestIdentity: 'P-FRA-8823901',
    guestEmail: 'sophie.l@luxurybrands.fr',
    guestPhone: '+33 612 345678',
    vipTier: 'VIP Guest',
    roomNumber: '505',
    roomType: 'Astor Suite',
    checkInDate: '2026-09-01',
    checkOutDate: '2026-09-04',
    nights: 3,
    ratePerNight: 15000000,
    depositPaid: 45000000,
    totalFolio: 45000000,
    specialRequests: 'Checked out with compliments to Butler Team',
    status: 'Checked-Out',
    roomKeyIssued: 'KEY-505-RET',
    checkInTime: '2026-09-01 14:00',
    checkOutTime: '2026-09-04 11:45'
  }
];

// Seed Users for Authentication (Staff & Honored Guests)
const INITIAL_USERS = [
  // Staff Roles
  {
    id: 'USR-01',
    name: 'Raynor Athaillah',
    email: 'manager@stregis.com',
    password: 'Password123',
    role: 'Front Desk Manager',
    userType: 'staff',
    badge: 'FDM-001'
  },
  {
    id: 'USR-02',
    name: 'Aulia Rahma',
    email: 'concierge@stregis.com',
    password: 'Password123',
    role: 'Head Butler & Concierge',
    userType: 'staff',
    badge: 'HBC-002'
  },
  // Honored Guests (Tamu Hotel)
  {
    id: 'GST-01',
    name: 'Lord Alexander Sterling',
    email: 'tamu@grandregis.com',
    password: 'Guest123',
    role: 'Honored Guest',
    userType: 'guest',
    vipTier: 'Marriott Ambassador Elite',
    phone: '+62 812 8899 7700',
    points: '125.400 PTS'
  },
  {
    id: 'GST-02',
    name: 'Clarissa Tanudjaja',
    email: 'clarissa@guest.com',
    password: 'Guest123',
    role: 'Honored Guest',
    userType: 'guest',
    vipTier: 'Titanium Elite',
    phone: '+62 812 9901 4432',
    points: '88.500 PTS'
  }
];

// Pre-seeded Google Accounts for Realistic Sign-in with Google Demo
const GOOGLE_DEMO_ACCOUNTS = [
  {
    id: 'GOOG-01',
    name: 'Alexander Sterling',
    email: 'alexander.sterling@gmail.com',
    avatar: 'AS',
    role: 'Honored Guest',
    userType: 'guest',
    vipTier: 'Marriott Ambassador Elite',
    points: '142.000 PTS',
    isGoogleAuth: true
  },
  {
    id: 'GOOG-02',
    name: 'Lady Evelyn Sinclair',
    email: 'evelyn.sinclair@gmail.com',
    avatar: 'ES',
    role: 'Honored Guest',
    userType: 'guest',
    vipTier: 'Titanium Elite',
    points: '96.200 PTS',
    isGoogleAuth: true
  }
];

// Initialize LocalStorage if empty or outdated
function initializeStorage() {
  const existingUsers = localStorage.getItem(STORAGE_KEYS.USERS);
  if (!existingUsers) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
  } else {
    // Ensure guest users exist in storage
    const parsed = JSON.parse(existingUsers);
    const hasGuest = parsed.some(u => u.userType === 'guest');
    if (!hasGuest) {
      const merged = [...parsed, ...INITIAL_USERS.filter(u => u.userType === 'guest')];
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(merged));
    }
  }

  if (!localStorage.getItem(STORAGE_KEYS.ROOMS)) {
    localStorage.setItem(STORAGE_KEYS.ROOMS, JSON.stringify(INITIAL_ROOMS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.RESERVATIONS)) {
    localStorage.setItem(STORAGE_KEYS.RESERVATIONS, JSON.stringify(INITIAL_RESERVATIONS));
  }
}

// Data Access Helpers
function getStoredReservations() {
  initializeStorage();
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.RESERVATIONS) || '[]');
}

function saveReservations(reservations) {
  localStorage.setItem(STORAGE_KEYS.RESERVATIONS, JSON.stringify(reservations));
}

function getStoredRooms() {
  initializeStorage();
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.ROOMS) || '[]');
}

function saveRooms(rooms) {
  localStorage.setItem(STORAGE_KEYS.ROOMS, JSON.stringify(rooms));
}

// Formatting Utilities
function formatRupiah(amount) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(amount);
}

function formatDateDisplay(dateStr) {
  if (!dateStr) return '-';
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('id-ID', options);
}

function calculateNights(checkIn, checkOut) {
  const d1 = new Date(checkIn);
  const d2 = new Date(checkOut);
  const diffTime = Math.abs(d2 - d1);
  const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return nights > 0 ? nights : 1;
}

// Toast notification helper
function showLuxuryToast(title, message, type = 'success') {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `luxury-toast ${type === 'success' ? 'toast-success' : 'toast-error'}`;

  const iconClass = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';
  const iconColor = type === 'success' ? '#48d38a' : '#f87171';

  toast.innerHTML = `
    <i class="fas ${iconClass}" style="color: ${iconColor}; font-size: 1.25rem; margin-top: 2px;"></i>
    <div class="toast-content">
      <h5>${title}</h5>
      <p>${message}</p>
    </div>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.transition = 'all 0.4s ease';
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => toast.remove(), 400);
  }, 4000);
}

// Run initializer
initializeStorage();
