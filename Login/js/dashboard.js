/* ============================================================
   THE GRAND REGIS JAKARTA - DASHBOARD & CRUD LOGIC
   Full reservation lifecycle: Create, Read, Update, Delete,
   Fast Check-in with Keycard, Fast Check-out with Folio Invoice
   ============================================================ */

let currentFilter = 'ALL';
let activeReservationForAction = null;

document.addEventListener('DOMContentLoaded', () => {
  // 1. Check Authentication Guard
  const currentUser = checkAuthSession();
  if (!currentUser) return;

  // 2. Setup User Interface
  setupUserProfile(currentUser);
  startLiveClock();

  // 3. Initialize Dashboard State
  renderDashboardMetrics();
  renderRoomsShowcase();
  renderReservationsTable();

  // 4. Setup Event Listeners
  setupEventListeners();
});

// Setup Logged In User Info
function setupUserProfile(user) {
  const userNameEl = document.getElementById('topbarUserName');
  const userRoleEl = document.getElementById('topbarUserRole');
  const userAvatarEl = document.getElementById('topbarAvatar');
  const sideUserNameEl = document.getElementById('sidebarUserName');
  const sideUserRoleEl = document.getElementById('sidebarUserRole');
  const sideAvatarEl = document.getElementById('sidebarAvatar');

  const initials = user.name ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'SR';

  if (userNameEl) userNameEl.textContent = user.name;
  if (userRoleEl) userRoleEl.textContent = user.role;
  if (userAvatarEl) userAvatarEl.textContent = initials;

  if (sideUserNameEl) sideUserNameEl.textContent = user.name;
  if (sideUserRoleEl) sideUserRoleEl.textContent = user.role;
  if (sideAvatarEl) sideAvatarEl.textContent = initials;
}

// Live Real-Time Clock (WIB - Jakarta Time)
function startLiveClock() {
  const clockEl = document.getElementById('liveClock');
  if (!clockEl) return;

  function update() {
    const now = new Date();
    const options = {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
      timeZone: 'Asia/Jakarta'
    };
    clockEl.textContent = now.toLocaleString('id-ID', options) + ' WIB';
  }

  update();
  setInterval(update, 1000);
}

// Render 4 Executive Metric Cards
function renderDashboardMetrics() {
  const reservations = getStoredReservations();
  const rooms = getStoredRooms();

  // Metric 1: In-House Guests (Checked-In)
  const inHouseCount = reservations.filter(r => r.status === 'Checked-In').length;
  const inHouseEl = document.getElementById('metricInHouse');
  if (inHouseEl) inHouseEl.textContent = inHouseCount;

  // Metric 2: Upcoming Check-Ins Today (Reserved)
  const reservedCount = reservations.filter(r => r.status === 'Reserved').length;
  const reservedEl = document.getElementById('metricReserved');
  if (reservedEl) reservedEl.textContent = reservedCount;

  // Metric 3: Checked-Out Guests
  const checkedOutCount = reservations.filter(r => r.status === 'Checked-Out').length;
  const checkedOutEl = document.getElementById('metricCheckedOut');
  if (checkedOutEl) checkedOutEl.textContent = checkedOutCount;

  // Metric 4: Room Occupancy Rate
  const totalRooms = rooms.length;
  const occupiedRooms = rooms.filter(r => r.status === 'occupied').length;
  const occupancyPercent = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;
  const occupancyEl = document.getElementById('metricOccupancy');
  if (occupancyEl) occupancyEl.textContent = `${occupancyPercent}%`;
}

// Render Room Live Status Showcase
function renderRoomsShowcase() {
  const roomsContainer = document.getElementById('roomsShowcaseContainer');
  if (!roomsContainer) return;

  const rooms = getStoredRooms();
  roomsContainer.innerHTML = '';

  rooms.forEach(room => {
    let statusLabel = 'Tersedia';
    let statusClass = 'status-available';
    let badgeClass = 'badge-reserved';

    if (room.status === 'occupied') {
      statusLabel = 'Terisi (Occupied)';
      statusClass = 'status-occupied';
      badgeClass = 'badge-checkedin';
    } else if (room.status === 'cleaning') {
      statusLabel = 'Pembersihan (Cleaning)';
      statusClass = 'status-cleaning';
      badgeClass = 'badge-cleaning';
    } else {
      statusLabel = 'Tersedia (Ready)';
      statusClass = 'status-available';
      badgeClass = 'badge-reserved';
    }

    const card = document.createElement('div');
    card.className = `room-card-item ${statusClass}`;
    card.innerHTML = `
      <div class="room-card-top">
        <span class="room-number">Suite ${room.number}</span>
        <span class="badge-status ${badgeClass}" style="font-size: 0.65rem; padding: 0.2rem 0.5rem;">${statusLabel}</span>
      </div>
      <div class="room-type">${room.name}</div>
      <div class="room-rate">${formatRupiah(room.rate)} / malam</div>
      <div class="room-guest-current">
        <i class="fas fa-user-circle"></i>
        <span>${room.currentGuest ? room.currentGuest : 'Siap Ditempati'}</span>
      </div>
    `;
    roomsContainer.appendChild(card);
  });
}

// Render Reservations CRUD Table
function renderReservationsTable(filterQuery = '') {
  const tableBody = document.getElementById('reservationsTableBody');
  if (!tableBody) return;

  let reservations = getStoredReservations();
  const searchQuery = filterQuery || (document.getElementById('tableSearchInput')?.value || '').toLowerCase();

  // Apply Status Filter
  if (currentFilter !== 'ALL') {
    reservations = reservations.filter(r => r.status.toUpperCase() === currentFilter);
  }

  // Apply Search Query
  if (searchQuery.trim() !== '') {
    reservations = reservations.filter(r => 
      r.guestName.toLowerCase().includes(searchQuery) ||
      r.id.toLowerCase().includes(searchQuery) ||
      r.roomNumber.toLowerCase().includes(searchQuery) ||
      (r.vipTier && r.vipTier.toLowerCase().includes(searchQuery))
    );
  }

  tableBody.innerHTML = '';

  if (reservations.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; padding: 3rem 1rem; color: var(--text-muted);">
          <i class="fas fa-inbox" style="font-size: 2rem; margin-bottom: 0.75rem; display: block; color: var(--gold-primary);"></i>
          <p>Tidak ada data reservasi yang sesuai dengan kriteria.</p>
        </td>
      </tr>
    `;
    return;
  }

  reservations.forEach(res => {
    const row = document.createElement('tr');

    // Status Badge Setup
    let badgeHtml = '';
    if (res.status === 'Reserved') {
      badgeHtml = `<span class="badge-status badge-reserved"><i class="fas fa-clock"></i> Reserved</span>`;
    } else if (res.status === 'Checked-In') {
      badgeHtml = `<span class="badge-status badge-checkedin"><i class="fas fa-key"></i> In-House</span>`;
    } else if (res.status === 'Checked-Out') {
      badgeHtml = `<span class="badge-status badge-checkedout"><i class="fas fa-check"></i> Departed</span>`;
    } else {
      badgeHtml = `<span class="badge-status badge-reserved">${res.status}</span>`;
    }

    // Smart Action Buttons per status
    let actionButtons = '';
    if (res.status === 'Reserved') {
      actionButtons = `
        <button class="btn-table-action btn-action-checkin" onclick="openFastCheckIn('${res.id}')" title="Proses Check-In Tamu">
          <i class="fas fa-key"></i> Check-In
        </button>
        <button class="btn-table-action" onclick="openReservationModal('${res.id}')" title="Ubah Data Reservasi">
          <i class="fas fa-edit"></i>
        </button>
        <button class="btn-table-action btn-action-delete" onclick="confirmDeleteReservation('${res.id}')" title="Batalkan Reservasi">
          <i class="fas fa-trash-alt"></i>
        </button>
      `;
    } else if (res.status === 'Checked-In') {
      actionButtons = `
        <button class="btn-table-action btn-action-checkout" onclick="openFastCheckOut('${res.id}')" title="Proses Check-Out & Billing">
          <i class="fas fa-receipt"></i> Check-Out
        </button>
        <button class="btn-table-action" onclick="openReservationModal('${res.id}')" title="Ubah Data">
          <i class="fas fa-edit"></i>
        </button>
      `;
    } else if (res.status === 'Checked-Out') {
      actionButtons = `
        <button class="btn-table-action btn-outline-gold" onclick="viewFolioInvoice('${res.id}')" title="Lihat & Cetak Bukti Billing">
          <i class="fas fa-print"></i> Folio
        </button>
        <button class="btn-table-action btn-action-delete" onclick="confirmDeleteReservation('${res.id}')" title="Hapus Arsip">
          <i class="fas fa-trash-alt"></i>
        </button>
      `;
    } else {
      actionButtons = `
        <button class="btn-table-action btn-action-delete" onclick="confirmDeleteReservation('${res.id}')" title="Hapus">
          <i class="fas fa-trash-alt"></i>
        </button>
      `;
    }

    const guestInitials = res.guestName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

    row.innerHTML = `
      <td>
        <span class="booking-code">#${res.id}</span>
      </td>
      <td>
        <div class="guest-info-cell">
          <div class="guest-avatar-small">${guestInitials}</div>
          <div>
            <div class="guest-details-name">${res.guestName}</div>
            <div class="guest-details-vip">${res.vipTier || 'VIP Guest'}</div>
          </div>
        </div>
      </td>
      <td>
        <strong>Suite ${res.roomNumber}</strong><br>
        <small style="color: var(--text-secondary);">${res.roomType}</small>
      </td>
      <td>
        <div><i class="fas fa-sign-in-alt" style="color: #48d38a; font-size: 0.75rem;"></i> ${formatDateDisplay(res.checkInDate)}</div>
        <div><i class="fas fa-sign-out-alt" style="color: #e6b94d; font-size: 0.75rem;"></i> ${formatDateDisplay(res.checkOutDate)}</div>
        <small style="color: var(--text-muted); font-style: italic;">(${res.nights} Malam)</small>
      </td>
      <td>
        <strong style="color: var(--gold-light);">${formatRupiah(res.totalFolio)}</strong><br>
        <small style="color: var(--text-secondary);">Dep: ${formatRupiah(res.depositPaid || 0)}</small>
      </td>
      <td>${badgeHtml}</td>
      <td>
        <div class="action-buttons-cell">
          ${actionButtons}
        </div>
      </td>
    `;

    tableBody.appendChild(row);
  });
}

// ------------------------------------------------------------
// MODAL & CRUD LOGIC
// ------------------------------------------------------------

// Open Add or Edit Reservation Modal
function openReservationModal(reservationId = null) {
  const modal = document.getElementById('reservationModal');
  const title = document.getElementById('reservationModalTitle');
  const form = document.getElementById('reservationForm');
  const roomSelect = document.getElementById('formRoomNumber');

  // Populate available rooms dropdown
  const rooms = getStoredRooms();
  roomSelect.innerHTML = '';
  rooms.forEach(room => {
    const opt = document.createElement('option');
    opt.value = room.number;
    opt.dataset.rate = room.rate;
    opt.dataset.type = room.type;
    opt.dataset.name = room.name;
    opt.textContent = `Suite ${room.number} - ${room.name} (${formatRupiah(room.rate)}/mlm)`;
    roomSelect.appendChild(opt);
  });

  form.reset();

  if (reservationId) {
    // EDIT MODE
    title.innerHTML = '<i class="fas fa-edit"></i> Edit Reservasi Tamu';
    const reservations = getStoredReservations();
    const res = reservations.find(r => r.id === reservationId);
    if (!res) return;

    document.getElementById('editReservationId').value = res.id;
    document.getElementById('formGuestName').value = res.guestName;
    document.getElementById('formGuestIdentity').value = res.guestIdentity || '';
    document.getElementById('formGuestEmail').value = res.guestEmail || '';
    document.getElementById('formGuestPhone').value = res.guestPhone || '';
    document.getElementById('formVipTier').value = res.vipTier || 'VIP Member';
    document.getElementById('formRoomNumber').value = res.roomNumber;
    document.getElementById('formCheckInDate').value = res.checkInDate;
    document.getElementById('formCheckOutDate').value = res.checkOutDate;
    document.getElementById('formDeposit').value = res.depositPaid || 0;
    document.getElementById('formSpecialRequests').value = res.specialRequests || '';
    document.getElementById('formStatus').value = res.status;
  } else {
    // CREATE MODE
    title.innerHTML = '<i class="fas fa-calendar-plus"></i> Reservasi Kamar Baru';
    document.getElementById('editReservationId').value = '';
    
    // Set default dates: Today to Tomorrow
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    document.getElementById('formCheckInDate').value = today;
    document.getElementById('formCheckOutDate').value = tomorrow;
    document.getElementById('formStatus').value = 'Reserved';
  }

  recalculateFormEstimates();
  modal.classList.add('active');
}

function closeReservationModal() {
  document.getElementById('reservationModal').classList.remove('active');
}

// Recalculate Estimates when dates or room changes in form
function recalculateFormEstimates() {
  const roomSelect = document.getElementById('formRoomNumber');
  const checkIn = document.getElementById('formCheckInDate').value;
  const checkOut = document.getElementById('formCheckOutDate').value;
  const estimateNightsEl = document.getElementById('formEstimateNights');
  const estimateTotalEl = document.getElementById('formEstimateTotal');

  if (!roomSelect || !checkIn || !checkOut) return;

  const selectedOption = roomSelect.selectedOptions[0];
  const rate = selectedOption ? parseInt(selectedOption.dataset.rate || '0') : 0;
  const nights = calculateNights(checkIn, checkOut);
  const total = rate * nights;

  if (estimateNightsEl) estimateNightsEl.textContent = `${nights} Malam`;
  if (estimateTotalEl) estimateTotalEl.textContent = formatRupiah(total);
}

// Handle Reservation Form Submit (Create & Update)
function handleReservationSubmit(e) {
  e.preventDefault();

  const editId = document.getElementById('editReservationId').value;
  const guestName = document.getElementById('formGuestName').value.trim();
  const guestIdentity = document.getElementById('formGuestIdentity').value.trim();
  const guestEmail = document.getElementById('formGuestEmail').value.trim();
  const guestPhone = document.getElementById('formGuestPhone').value.trim();
  const vipTier = document.getElementById('formVipTier').value;
  const roomSelect = document.getElementById('formRoomNumber');
  const selectedRoomOption = roomSelect.selectedOptions[0];
  const roomNumber = selectedRoomOption.value;
  const roomType = selectedRoomOption.dataset.type || selectedRoomOption.dataset.name;
  const ratePerNight = parseInt(selectedRoomOption.dataset.rate || '0');
  const checkInDate = document.getElementById('formCheckInDate').value;
  const checkOutDate = document.getElementById('formCheckOutDate').value;
  const depositPaid = parseInt(document.getElementById('formDeposit').value) || 0;
  const specialRequests = document.getElementById('formSpecialRequests').value.trim();
  const status = document.getElementById('formStatus').value;

  if (!guestName || !checkInDate || !checkOutDate) {
    showLuxuryToast('Validasi Gagal', 'Harap isi nama tamu dan tanggal reservasi.', 'error');
    return;
  }

  const nights = calculateNights(checkInDate, checkOutDate);
  const totalFolio = ratePerNight * nights;

  let reservations = getStoredReservations();
  let rooms = getStoredRooms();

  if (editId) {
    // UPDATE
    const index = reservations.findIndex(r => r.id === editId);
    if (index !== -1) {
      reservations[index] = {
        ...reservations[index],
        guestName,
        guestIdentity,
        guestEmail,
        guestPhone,
        vipTier,
        roomNumber,
        roomType,
        checkInDate,
        checkOutDate,
        nights,
        ratePerNight,
        depositPaid,
        totalFolio,
        specialRequests,
        status
      };

      // Sync Room status if Checked-In
      const targetRoom = rooms.find(rm => rm.number === roomNumber);
      if (targetRoom) {
        if (status === 'Checked-In') {
          targetRoom.status = 'occupied';
          targetRoom.currentGuest = guestName;
        } else if (status === 'Checked-Out') {
          targetRoom.status = 'cleaning';
          targetRoom.currentGuest = null;
        } else {
          targetRoom.status = 'available';
          targetRoom.currentGuest = null;
        }
        saveRooms(rooms);
      }

      saveReservations(reservations);
      if (typeof updateSupabaseReservation === 'function') {
        updateSupabaseReservation(editId, reservations[index]);
      }
      showLuxuryToast('Reservasi Diperbarui', `Data reservasi #${editId} atas nama ${guestName} berhasil disimpan.`);
    }
  } else {
    // CREATE
    const newId = 'RSV-' + Math.floor(1000 + Math.random() * 9000);
    const newReservation = {
      id: newId,
      guestName,
      guestIdentity,
      guestEmail,
      guestPhone,
      vipTier,
      roomNumber,
      roomType,
      checkInDate,
      checkOutDate,
      nights,
      ratePerNight,
      depositPaid,
      totalFolio,
      specialRequests,
      status: status || 'Reserved',
      roomKeyIssued: status === 'Checked-In' ? `KEY-${roomNumber}-GEN` : null,
      checkInTime: status === 'Checked-In' ? new Date().toLocaleString('id-ID') : null,
      checkOutTime: null
    };

    reservations.unshift(newReservation);

    // If created directly as Checked-In, occupy the room
    if (status === 'Checked-In') {
      const targetRoom = rooms.find(rm => rm.number === roomNumber);
      if (targetRoom) {
        targetRoom.status = 'occupied';
        targetRoom.currentGuest = guestName;
        saveRooms(rooms);
      }
    }

    saveReservations(reservations);
    if (typeof createSupabaseReservation === 'function') {
      createSupabaseReservation(newReservation);
    }
    showLuxuryToast('Reservasi Dibuat', `Reservasi baru #${newId} untuk ${guestName} berhasil terdaftar.`);
  }

  closeReservationModal();
  renderDashboardMetrics();
  renderRoomsShowcase();
  renderReservationsTable();
}

// ------------------------------------------------------------
// FAST CHECK-IN PROCESS
// ------------------------------------------------------------
function openFastCheckIn(reservationId) {
  const reservations = getStoredReservations();
  const res = reservations.find(r => r.id === reservationId);
  if (!res) return;

  activeReservationForAction = res;

  document.getElementById('checkInGuestName').textContent = res.guestName;
  document.getElementById('checkInRoom').textContent = `Suite ${res.roomNumber} - ${res.roomType}`;
  document.getElementById('checkInDates').textContent = `${formatDateDisplay(res.checkInDate)} s/d ${formatDateDisplay(res.checkOutDate)} (${res.nights} Malam)`;
  document.getElementById('checkInDeposit').textContent = formatRupiah(res.depositPaid || 0);

  // Suggested Keycard Code
  document.getElementById('checkInKeyInput').value = `KEY-${res.roomNumber}-${res.guestName.split(' ')[0].toUpperCase()}`;

  document.getElementById('checkInModal').classList.add('active');
}

function closeCheckInModal() {
  document.getElementById('checkInModal').classList.remove('active');
  activeReservationForAction = null;
}

function executeCheckIn() {
  if (!activeReservationForAction) return;

  const keycode = document.getElementById('checkInKeyInput').value.trim() || `KEY-${activeReservationForAction.roomNumber}-A`;
  const reservations = getStoredReservations();
  const rooms = getStoredRooms();

  const resIndex = reservations.findIndex(r => r.id === activeReservationForAction.id);
  if (resIndex !== -1) {
    const now = new Date();
    reservations[resIndex].status = 'Checked-In';
    reservations[resIndex].roomKeyIssued = keycode;
    reservations[resIndex].checkInTime = now.toLocaleString('id-ID');

    // Update Room status to occupied
    const targetRoom = rooms.find(rm => rm.number === activeReservationForAction.roomNumber);
    if (targetRoom) {
      targetRoom.status = 'occupied';
      targetRoom.currentGuest = activeReservationForAction.guestName;
      saveRooms(rooms);
    }

    saveReservations(reservations);
    if (typeof updateSupabaseReservation === 'function') {
      updateSupabaseReservation(activeReservationForAction.id, {
        status: 'Checked-In',
        roomKeyIssued: keycode,
        checkInTime: new Date().toISOString()
      });
    }
    showLuxuryToast('Check-In Sukses', `Tamu ${activeReservationForAction.guestName} berhasil check-in ke Suite ${activeReservationForAction.roomNumber}. Kunci: ${keycode}`);
  }

  closeCheckInModal();
  renderDashboardMetrics();
  renderRoomsShowcase();
  renderReservationsTable();
}

// ------------------------------------------------------------
// FAST CHECK-OUT & LUXURY FOLIO INVOICE
// ------------------------------------------------------------
function openFastCheckOut(reservationId) {
  const reservations = getStoredReservations();
  const res = reservations.find(r => r.id === reservationId);
  if (!res) return;

  activeReservationForAction = res;
  populateFolioInvoice(res);

  // Show checkout confirmation button in modal
  document.getElementById('btnConfirmCheckOutAction').style.display = 'inline-flex';
  document.getElementById('folioModal').classList.add('active');
}

function viewFolioInvoice(reservationId) {
  const reservations = getStoredReservations();
  const res = reservations.find(r => r.id === reservationId);
  if (!res) return;

  activeReservationForAction = res;
  populateFolioInvoice(res);

  // Hide checkout confirmation button if already departed, only allow print
  document.getElementById('btnConfirmCheckOutAction').style.display = 'none';
  document.getElementById('folioModal').classList.add('active');
}

function closeFolioModal() {
  document.getElementById('folioModal').classList.remove('active');
  activeReservationForAction = null;
}

function populateFolioInvoice(res) {
  document.getElementById('folioNumber').textContent = `INV-${res.id}`;
  document.getElementById('folioDate').textContent = new Date().toLocaleDateString('id-ID');
  document.getElementById('folioGuestName').textContent = res.guestName;
  document.getElementById('folioGuestPhone').textContent = res.guestPhone || '-';
  document.getElementById('folioRoomNumber').textContent = `Suite ${res.roomNumber} (${res.roomType})`;
  document.getElementById('folioStayDuration').textContent = `${res.nights} Malam (${formatDateDisplay(res.checkInDate)} - ${formatDateDisplay(res.checkOutDate)})`;

  // Itemized calculations
  const roomCharge = res.ratePerNight * res.nights;
  const serviceCharge = Math.round(roomCharge * 0.10); // 10% Service
  const tax = Math.round((roomCharge + serviceCharge) * 0.11); // 11% Tax
  const grandTotal = roomCharge + serviceCharge + tax;
  const deposit = res.depositPaid || 0;
  const balanceDue = grandTotal - deposit;

  // Render Folio Item Rows
  const itemsContainer = document.getElementById('folioItemsBody');
  itemsContainer.innerHTML = `
    <tr>
      <td>Akomodasi Suite: ${res.roomType} (${res.nights} malam @ ${formatRupiah(res.ratePerNight)})</td>
      <td style="text-align: right;">${formatRupiah(roomCharge)}</td>
    </tr>
    <tr>
      <td>St. Regis Signature Butler Service & Hospitality Charge (10%)</td>
      <td style="text-align: right;">${formatRupiah(serviceCharge)}</td>
    </tr>
    <tr>
      <td>Pajak Pemerintah Daerah (PB1 / Hotel Tax 11%)</td>
      <td style="text-align: right;">${formatRupiah(tax)}</td>
    </tr>
  `;

  document.getElementById('folioSubtotal').textContent = formatRupiah(roomCharge);
  document.getElementById('folioService').textContent = formatRupiah(serviceCharge);
  document.getElementById('folioTax').textContent = formatRupiah(tax);
  document.getElementById('folioGrandTotal').textContent = formatRupiah(grandTotal);
  document.getElementById('folioDeposit').textContent = `-${formatRupiah(deposit)}`;
  document.getElementById('folioBalanceDue').textContent = formatRupiah(balanceDue > 0 ? balanceDue : 0);

  document.getElementById('folioSignGuest').textContent = res.guestName;
}

function executeCheckOut() {
  if (!activeReservationForAction) return;

  const reservations = getStoredReservations();
  const rooms = getStoredRooms();

  const resIndex = reservations.findIndex(r => r.id === activeReservationForAction.id);
  if (resIndex !== -1) {
    const now = new Date();
    reservations[resIndex].status = 'Checked-Out';
    reservations[resIndex].checkOutTime = now.toLocaleString('id-ID');

    // Update Room status to Cleaning
    const targetRoom = rooms.find(rm => rm.number === activeReservationForAction.roomNumber);
    if (targetRoom) {
      targetRoom.status = 'cleaning';
      targetRoom.currentGuest = null;
      saveRooms(rooms);
    }

    saveReservations(reservations);
    if (typeof updateSupabaseReservation === 'function') {
      updateSupabaseReservation(activeReservationForAction.id, {
        status: 'Checked-Out',
        checkOutTime: new Date().toISOString()
      });
    }
    showLuxuryToast('Check-Out Selesai', `Tamu ${activeReservationForAction.guestName} telah check-out. Kamar ${activeReservationForAction.roomNumber} dialihkan ke status pembersihan.`);
  }

  closeFolioModal();
  renderDashboardMetrics();
  renderRoomsShowcase();
  renderReservationsTable();
}

function printFolioInvoice() {
  window.print();
}

// ------------------------------------------------------------
// DELETE / CANCEL RESERVATION
// ------------------------------------------------------------
function confirmDeleteReservation(reservationId) {
  const reservations = getStoredReservations();
  const res = reservations.find(r => r.id === reservationId);
  if (!res) return;

  activeReservationForAction = res;
  document.getElementById('deleteTargetInfo').textContent = `#${res.id} - ${res.guestName} (Suite ${res.roomNumber})`;
  document.getElementById('deleteConfirmModal').classList.add('active');
}

function closeDeleteModal() {
  document.getElementById('deleteConfirmModal').classList.remove('active');
  activeReservationForAction = null;
}

function executeDeleteReservation() {
  if (!activeReservationForAction) return;

  const targetId = activeReservationForAction.id;
  let reservations = getStoredReservations();
  let rooms = getStoredRooms();

  // If deleting an occupied reservation, free the room
  if (activeReservationForAction.status === 'Checked-In') {
    const targetRoom = rooms.find(rm => rm.number === activeReservationForAction.roomNumber);
    if (targetRoom) {
      targetRoom.status = 'available';
      targetRoom.currentGuest = null;
      saveRooms(rooms);
    }
  }

  reservations = reservations.filter(r => r.id !== targetId);
  saveReservations(reservations);

  if (typeof deleteSupabaseReservation === 'function') {
    deleteSupabaseReservation(targetId);
  }

  showLuxuryToast('Data Dihapus', `Reservasi #${targetId} berhasil dihapus.`);

  closeDeleteModal();
  renderDashboardMetrics();
  renderRoomsShowcase();
  renderReservationsTable();
}

// ------------------------------------------------------------
// SETUP EVENT LISTENERS & FILTER PILLS
// ------------------------------------------------------------
function setupEventListeners() {
  // Global Logout Button
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
  }

  // Quick Search Bar in Topbar
  const globalSearch = document.getElementById('globalSearchInput');
  if (globalSearch) {
    globalSearch.addEventListener('input', (e) => {
      renderReservationsTable(e.target.value.toLowerCase());
    });
  }

  // Search Bar inside Table Toolbar
  const tableSearch = document.getElementById('tableSearchInput');
  if (tableSearch) {
    tableSearch.addEventListener('input', (e) => {
      renderReservationsTable(e.target.value.toLowerCase());
    });
  }

  // Filter Pills (All, Reserved, Checked-In, Checked-Out)
  const filterBtns = document.querySelectorAll('.filter-pill-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.filter.toUpperCase();
      renderReservationsTable();
    });
  });

  // Modal Open Button: "+ Reservasi Baru"
  const newReservationBtn = document.getElementById('newReservationBtn');
  if (newReservationBtn) {
    newReservationBtn.addEventListener('click', () => openReservationModal());
  }

  // Reservation Form Recalculate on Change
  const roomSelect = document.getElementById('formRoomNumber');
  const checkInInput = document.getElementById('formCheckInDate');
  const checkOutInput = document.getElementById('formCheckOutDate');

  if (roomSelect) roomSelect.addEventListener('change', recalculateFormEstimates);
  if (checkInInput) checkInInput.addEventListener('change', recalculateFormEstimates);
  if (checkOutInput) checkOutInput.addEventListener('change', recalculateFormEstimates);

  // Reservation Form Submit
  const rsvForm = document.getElementById('reservationForm');
  if (rsvForm) {
    rsvForm.addEventListener('submit', handleReservationSubmit);
  }
}
