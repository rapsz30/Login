/* ============================================================
   THE GRAND REGIS — LUXURY PREMIERE HOTEL
   Supabase Database Configuration & Client Helper
   ============================================================ */

// 1. MASUKKAN KREDENSIAL SUPABASE ANDA DI SINI (DARI DASHBOARD SUPABASE -> SETTINGS -> API)
const SUPABASE_URL = 'https://YOUR_PROJECT_ID.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_PUBLIC_KEY';

// 2. Inisialisasi Supabase Client
let supabaseClient = null;

if (typeof window.supabase !== 'undefined' && SUPABASE_URL !== 'https://YOUR_PROJECT_ID.supabase.co') {
  try {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('✅ Supabase Client Connected to:', SUPABASE_URL);
  } catch (err) {
    console.warn('⚠️ Supabase connection warning, fallback to LocalStorage:', err);
  }
} else {
  console.info('ℹ️ Mode Prototipe Cepat: Menggunakan LocalStorage internal. Untuk menyambungkan ke Supabase langsung, isi SUPABASE_URL dan SUPABASE_ANON_KEY di js/supabase-config.js');
}

// ------------------------------------------------------------
// SUPABASE GOOGLE OAUTH TRIGGER
// ------------------------------------------------------------
async function signInWithSupabaseGoogle() {
  if (supabaseClient) {
    const { data, error } = await supabaseClient.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/guest-dashboard.html'
      }
    });
    if (error) {
      showLuxuryToast('Google Auth Gagal', error.message, 'error');
    }
  } else {
    // Mode demo instan
    openGoogleModal();
  }
}

// ------------------------------------------------------------
// SUPABASE CRUD REPOSITORIES (Sinkronisasi Otomatis)
// ------------------------------------------------------------

// A. Fetch Reservations (Mendukung Supabase + LocalStorage Fallback)
async function fetchAllReservations() {
  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient
        .from('reservations')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (!error && data && data.length > 0) {
        // Map database fields to frontend format
        const mapped = data.map(r => ({
          id: r.id,
          guestName: r.guest_name,
          guestIdentity: r.guest_identity,
          guestEmail: r.guest_email,
          guestPhone: r.guest_phone,
          vipTier: r.vip_tier,
          roomNumber: r.room_number,
          roomType: r.room_type,
          checkInDate: r.check_in_date,
          checkOutDate: r.check_out_date,
          nights: r.nights,
          ratePerNight: parseFloat(r.rate_per_night),
          depositPaid: parseFloat(r.deposit_paid),
          totalFolio: parseFloat(r.total_folio),
          specialRequests: r.special_requests,
          status: r.status,
          roomKeyIssued: r.room_key_issued,
          checkInTime: r.check_in_time,
          checkOutTime: r.check_out_time
        }));
        // Simpan cache ke local storage
        saveReservations(mapped);
        return mapped;
      }
    } catch (e) {
      console.warn('Supabase fetch error, using local data:', e);
    }
  }
  return getStoredReservations();
}

// B. Insert Reservation ke Supabase
async function createSupabaseReservation(rsv) {
  if (supabaseClient) {
    try {
      const dbPayload = {
        id: rsv.id,
        guest_name: rsv.guestName,
        guest_identity: rsv.guestIdentity,
        guest_email: rsv.guestEmail,
        guest_phone: rsv.guestPhone,
        vip_tier: rsv.vipTier,
        room_number: rsv.roomNumber,
        room_type: rsv.roomType,
        check_in_date: rsv.checkInDate,
        check_out_date: rsv.checkOutDate,
        nights: rsv.nights,
        rate_per_night: rsv.ratePerNight,
        deposit_paid: rsv.depositPaid,
        total_folio: rsv.totalFolio,
        special_requests: rsv.specialRequests,
        status: rsv.status,
        room_key_issued: rsv.roomKeyIssued,
        check_in_time: rsv.checkInTime ? new Date().toISOString() : null
      };

      const { data, error } = await supabaseClient
        .from('reservations')
        .insert([dbPayload]);

      if (error) console.error('Supabase insert error:', error);
      else console.log('✅ Berhasil disimpan ke Supabase PostgreSQL!');
    } catch (err) {
      console.error('Supabase execution error:', err);
    }
  }
}

// C. Update Status Reservasi di Supabase (Check-In & Check-Out)
async function updateSupabaseReservation(id, updates) {
  if (supabaseClient) {
    try {
      const dbUpdates = {};
      if (updates.status) dbUpdates.status = updates.status;
      if (updates.roomKeyIssued) dbUpdates.room_key_issued = updates.roomKeyIssued;
      if (updates.checkInTime) dbUpdates.check_in_time = new Date().toISOString();
      if (updates.checkOutTime) dbUpdates.check_out_time = new Date().toISOString();

      await supabaseClient
        .from('reservations')
        .update(dbUpdates)
        .eq('id', id);
    } catch (err) {
      console.error('Supabase update error:', err);
    }
  }
}

// D. Delete Reservasi di Supabase
async function deleteSupabaseReservation(id) {
  if (supabaseClient) {
    try {
      await supabaseClient
        .from('reservations')
        .delete()
        .eq('id', id);
    } catch (err) {
      console.error('Supabase delete error:', err);
    }
  }
}
