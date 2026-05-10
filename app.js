import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBC56I3l9qKHzvP6EhBvwnwl7qAKXaaL6g",
  authDomain: "ertiga-2c823.firebaseapp.com",
  projectId: "ertiga-2c823",
  storageBucket: "ertiga-2c823.firebasestorage.app",
  messagingSenderId: "499478581885",
  appId: "1:499478581885:web:34e4174c369d2da1f19714",
  measurementId: "G-J3KWSJLXEY",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Data State
let records = [];
let currentFilter = "all";
let currentSearch = "";
let currentSort = { column: "tanggal", order: "desc" };

// DOM Elements
const elements = {
  vehicleInfo: document.getElementById("vehicleInfo"),
  summaryTotalKm: document.getElementById("summaryTotalKm"),
  summaryLastService: document.getElementById("summaryLastService"),
  summaryUpcomingService: document.getElementById("summaryUpcomingService"),
  upcomingCard: document.getElementById("upcomingCard"),
  tableBody: document.getElementById("tableBody"),
  emptyState: document.getElementById("emptyState"),
  logTable: document.getElementById("logTable"),
  searchInput: document.getElementById("searchInput"),
  filterBtns: document.querySelectorAll(".filter-btn"),
  sortableHeaders: document.querySelectorAll("th.sortable"),
  desktopAddBtn: document.getElementById("desktopAddBtn"),
  mobileAddBtn: document.getElementById("mobileAddBtn"),
  notifToggle: document.getElementById("notifToggle"),
  recordModal: document.getElementById("recordModal"),
  closeModalBtn: document.getElementById("closeModalBtn"),
  cancelBtn: document.getElementById("cancelBtn"),
  recordForm: document.getElementById("recordForm"),
  modalTitle: document.getElementById("modalTitle"),
  navItems: document.querySelectorAll(".nav-item"),
  // Form Inputs
  recordId: document.getElementById("recordId"),
  tanggal: document.getElementById("tanggal"),
  tanggalKembali: document.getElementById("tanggalKembali"),
  perawatan: document.getElementById("perawatan"),
  km: document.getElementById("km"),
  keterangan: document.getElementById("keterangan"),
  sections: {
    dashboard: document.querySelector(".dashboard-overview"),
    logs: document.querySelector(".log-section"),
  },
};

let deferredPrompt;

// PWA Install Handler
function setupInstallPrompt() {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;
    console.log("Install prompt ready");
    // Show install button in header when prompt is ready
    const installBtn = document.getElementById("installAppHeaderBtn");
    if (installBtn) {
      installBtn.style.display = "flex";
    }
  });
}

// Responsive Handler - Detect screen size changes
function setupResponsiveHandlers() {
  // Handle window resize
  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      handleResponsiveLayout();
    }, 250);
  });

  // Handle orientation change
  window.addEventListener("orientationchange", () => {
    setTimeout(() => {
      handleResponsiveLayout();
      renderTable(); // Re-render table on orientation change
    }, 100);
  });

  // Initial responsive check
  handleResponsiveLayout();
}

// Handle responsive layout adjustments
function handleResponsiveLayout() {
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;
  const isMobile = screenWidth < 768;
  const isTablet = screenWidth >= 768 && screenWidth < 1024;
  const isLandscape = screenHeight < screenWidth;

  // Store in data attribute for CSS access if needed
  document.documentElement.setAttribute(
    "data-device",
    isMobile ? "mobile" : isTablet ? "tablet" : "desktop",
  );
  document.documentElement.setAttribute(
    "data-orientation",
    isLandscape ? "landscape" : "portrait",
  );

  // Log for debugging
  console.log(
    `Device: ${isMobile ? "mobile" : isTablet ? "tablet" : "desktop"} (${screenWidth}x${screenHeight})`,
  );
}

// Initialize App
function init() {
  // Load Vehicle Name
  const savedVehicle = localStorage.getItem("autolog_vehicle");
  if (savedVehicle) {
    elements.vehicleInfo.textContent = savedVehicle;
  }

  elements.vehicleInfo.addEventListener("blur", () => {
    localStorage.setItem("autolog_vehicle", elements.vehicleInfo.textContent);
  });

  // Prevent line breaks in contenteditable
  elements.vehicleInfo.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      elements.vehicleInfo.blur();
    }
  });

  // Event Listeners
  elements.desktopAddBtn.addEventListener("click", () => openModal());
  elements.mobileAddBtn.addEventListener("click", () => openModal());
  document
    .getElementById("headerAddBtn")
    .addEventListener("click", () => openModal());
  elements.notifToggle.addEventListener("click", requestNotificationPermission);
  elements.closeModalBtn.addEventListener("click", closeModal);
  elements.cancelBtn.addEventListener("click", closeModal);
  elements.recordModal.addEventListener("click", (e) => {
    if (e.target === elements.recordModal) closeModal();
  });

  elements.recordForm.addEventListener("submit", handleFormSubmit);

  elements.km.addEventListener("input", formatKmInput);

  elements.searchInput.addEventListener("input", (e) => {
    currentSearch = e.target.value.toLowerCase();
    renderTable();
  });

  elements.filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      elements.filterBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      currentFilter = btn.dataset.filter;
      renderTable();
    });
  });

  elements.sortableHeaders.forEach((header) => {
    header.addEventListener("click", () => {
      const column = header.dataset.sort;
      if (currentSort.column === column) {
        currentSort.order = currentSort.order === "asc" ? "desc" : "asc";
      } else {
        currentSort.column = column;
        currentSort.order = "desc"; // Default to desc when changing column
      }
      updateSortHeaders();
      renderTable();
    });
  });

  // Bottom Nav Navigation
  elements.navItems.forEach((item) => {
    item.addEventListener("click", (e) => {
      e.preventDefault();
      const target = item.dataset.nav;

      elements.navItems.forEach((i) => i.classList.remove("active"));
      item.classList.add("active");

      if (target === "dashboard") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else if (target === "logs") {
        elements.sections.logs.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      } else if (target === "notifications") {
        requestNotificationPermission();
      }
    });
  });

  // Capture PWA Install Prompt
  setupInstallPrompt();
  setupResponsiveHandlers();

  // Install button in header
  const installAppHeaderBtn = document.getElementById("installAppHeaderBtn");
  if (installAppHeaderBtn) {
    installAppHeaderBtn.addEventListener("click", installApp);
  }

  document.getElementById("settingsBtn").addEventListener("click", () => {
    Swal.fire({
      title: "AutoLog Menu",
      html: `
        <div style="text-align: left; display: flex; flex-direction: column; gap: 10px;">
          <button onclick="window.scrollTo(0,0); Swal.close();" style="padding: 10px; border: 1px solid #ddd; border-radius: 8px; background: white; cursor: pointer;">Dashboard</button>
          <button onclick="document.querySelector('.log-section').scrollIntoView(); Swal.close();" style="padding: 10px; border: 1px solid #ddd; border-radius: 8px; background: white; cursor: pointer;">Maintenance Logs</button>
          <button id="exportCsvBtn" onclick="Swal.close(); exportRecordsToCsv();" style="padding: 10px; border: 1px solid #ddd; border-radius: 8px; background: white; cursor: pointer;">Export CSV</button>
          <button id="importJsonBtn" onclick="Swal.close(); importRecordsFromJson();" style="padding: 10px; border: 1px solid #ddd; border-radius: 8px; background: white; cursor: pointer;">Import JSON</button>
          <button id="setCurrentKmBtn" onclick="Swal.close(); setCurrentKmPrompt();" style="padding: 10px; border: 1px solid #ddd; border-radius: 8px; background: white; cursor: pointer;">Set Current KM</button>
          <button id="setKmIntervalBtn" onclick="Swal.close(); setKmIntervalPrompt();" style="padding: 10px; border: 1px solid #ddd; border-radius: 8px; background: white; cursor: pointer;">Set KM Interval</button>
          <button id="installAppBtn" onclick="installApp();" style="padding: 10px; border: 1px solid #ddd; border-radius: 8px; background: white; cursor: pointer; display: none;">Install App</button>
          <button onclick="location.reload()" style="padding: 10px; border: 1px solid #ddd; border-radius: 8px; background: white; cursor: pointer;">Refresh App</button>
          <div style="font-size: 0.8rem; color: #666; margin-top: 10px; text-align: center;">Version 1.0.2 • Build 2026</div>
        </div>
      `,
      showConfirmButton: false,
      showCloseButton: true,
      didOpen: () => {
        if (deferredPrompt) {
          document.getElementById("installAppBtn").style.display = "block";
        }
      },
    });
  });

  // Initial Render
  fetchRecords();
}

// Install App Function
async function installApp() {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);
    deferredPrompt = null;

    // Hide install button after installation
    const headerBtn = document.getElementById("installAppHeaderBtn");
    if (headerBtn) {
      headerBtn.style.display = "none";
    }
    const settingsBtn = document.getElementById("installAppBtn");
    if (settingsBtn) {
      settingsBtn.style.display = "none";
    }

    if (outcome === "accepted") {
      Swal.fire(
        "Berhasil!",
        "Aplikasi berhasil diinstall. Anda sekarang bisa membuka AutoLog seperti aplikasi biasa.",
        "success",
      );
    }
  }
}

function escapeCsvValue(value) {
  const text = String(value ?? "");
  return `"${text.replace(/"/g, '""')}"`;
}

function exportRecordsToCsv() {
  if (records.length === 0) {
    Swal.fire({
      icon: "info",
      title: "Belum ada data",
      text: "Tambahkan minimal satu riwayat servis sebelum mengekspor CSV.",
    });
    return;
  }

  const headers = [
    "Tanggal Service",
    "Tanggal Kembali",
    "Kategori Perawatan",
    "KM",
    "Keterangan",
  ];

  const rows = records.map((record) => [
    record.tanggal,
    record.tanggalKembali,
    getPerawatanLabel(record.perawatan),
    record.km,
    record.keterangan,
  ]);

  const csvContent = [headers, ...rows]
    .map((row) => row.map(escapeCsvValue).join(","))
    .join("\n");

  const blob = new Blob(["\uFEFF" + csvContent], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const vehicleName = elements.vehicleInfo.textContent
    .trim()
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "");

  link.href = url;
  link.download = `autolog-${vehicleName || "backup"}-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);

  Swal.fire({
    icon: "success",
    title: "CSV diekspor",
    text: "File backup data servis sudah diunduh.",
    timer: 1800,
    showConfirmButton: false,
    toast: true,
    position: "top-end",
  });
}

// Fetch from Firebase
async function fetchRecords() {
  try {
    const querySnapshot = await getDocs(collection(db, "maintenance_logs"));
    records = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    updateSortHeaders();
    renderTable();
    initNotifications();
  } catch (error) {
    console.error("Error fetching records: ", error);
    Swal.fire("Error", "Gagal memuat data dari database.", "error");
  }
}

// Notification Logic
function initNotifications() {
  if (!("Notification" in window)) {
    elements.notifToggle.style.display = "none";
    return;
  }

  if (Notification.permission === "granted") {
    updateNotifIcon(true);
    checkUpcomingForNotif();
    checkUpcomingForKmNotif();
  } else {
    updateNotifIcon(false);
  }
}

function updateNotifIcon(granted) {
  const icon = elements.notifToggle.querySelector("i");
  if (granted) {
    icon.className = "ph ph-bell";
    elements.notifToggle.classList.add("active");
    elements.notifToggle.title = "Notifikasi Aktif";
  } else {
    icon.className = "ph ph-bell-slash";
    elements.notifToggle.classList.remove("active");
    elements.notifToggle.title = "Aktifkan Notifikasi";
  }
}

function requestNotificationPermission() {
  if (!("Notification" in window)) {
    Swal.fire("Error", "Browser Anda tidak mendukung notifikasi.", "error");
    return;
  }

  Notification.requestPermission().then((permission) => {
    if (permission === "granted") {
      updateNotifIcon(true);
      Swal.fire({
        icon: "success",
        title: "Notifikasi Aktif",
        text: "Anda akan menerima pemberitahuan saat jadwal servis tiba.",
        timer: 2000,
        showConfirmButton: false,
      });
      checkUpcomingForNotif();
      checkUpcomingForKmNotif();
    } else {
      updateNotifIcon(false);
    }
  });
}

// KM-based notifications
const DEFAULT_KM_INTERVAL = 5000; // default km between services
const KM_WARNING_MARGIN = 200; // notify when within this km to next service

function setCurrentKmPrompt() {
  Swal.fire({
    title: "Set Current Odometer (KM)",
    input: "number",
    inputLabel: "Masukkan nilai odometer saat ini:",
    inputAttributes: { min: 0, step: 1 },
    inputValue: localStorage.getItem("autolog_current_km") || "",
    showCancelButton: true,
  }).then((res) => {
    if (res.isConfirmed) {
      const v = parseInt(res.value, 10) || 0;
      localStorage.setItem("autolog_current_km", String(v));
      Swal.fire({
        icon: "success",
        title: "Tersimpan",
        text: `Current KM disimpan: ${v}`,
      });
      renderTable();
      checkUpcomingForKmNotif();
    }
  });
}

function setKmIntervalPrompt() {
  Swal.fire({
    title: "Set Default KM Interval",
    input: "number",
    inputLabel: "Masukkan interval KM untuk reminder (mis. 5000):",
    inputAttributes: { min: 100, step: 50 },
    inputValue:
      localStorage.getItem("autolog_km_interval") ||
      String(DEFAULT_KM_INTERVAL),
    showCancelButton: true,
  }).then((res) => {
    if (res.isConfirmed) {
      const v = parseInt(res.value, 10) || DEFAULT_KM_INTERVAL;
      localStorage.setItem("autolog_km_interval", String(v));
      Swal.fire({
        icon: "success",
        title: "Tersimpan",
        text: `KM interval disimpan: ${v}`,
      });
      checkUpcomingForKmNotif();
    }
  });
}

function checkUpcomingForKmNotif() {
  if (Notification.permission !== "granted") return;
  const currentKm = parseInt(localStorage.getItem("autolog_current_km"), 10);
  if (isNaN(currentKm)) return;
  const kmInterval =
    parseInt(localStorage.getItem("autolog_km_interval"), 10) ||
    DEFAULT_KM_INTERVAL;
  const todayStr = new Date().toDateString();

  records.forEach((record) => {
    const nextKm = (parseInt(record.km, 10) || 0) + kmInterval;
    const diff = nextKm - currentKm;
    if (diff <= KM_WARNING_MARGIN) {
      const key = `notif_km_sent_${record.id}`;
      const lastSent = localStorage.getItem(key);
      if (lastSent !== todayStr) {
        showKmNotification(record, nextKm, diff);
        localStorage.setItem(key, todayStr);
      }
    }
  });
}

function showKmNotification(record, nextKm, diff) {
  const title = `Peringatan KM: ${getPerawatanLabel(record.perawatan)}`;
  const body = `Next service at ${nextKm.toLocaleString()} KM (${diff <= 0 ? "due" : diff + " KM left"}). Last recorded: ${record.km.toLocaleString()} KM.`;
  new Notification(title, {
    body,
    icon: "https://cdn-icons-png.flaticon.com/512/2991/2991148.png",
  });
}

function checkUpcomingForNotif() {
  if (Notification.permission !== "granted") return;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  records.forEach((record) => {
    const targetDate = new Date(record.tanggalKembali);
    targetDate.setHours(0, 0, 0, 0);

    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Notify if today or overdue (and not notified today yet)
    if (diffDays <= 0) {
      const lastNotifKey = `notif_sent_${record.id}`;
      const lastSent = localStorage.getItem(lastNotifKey);
      const todayStr = today.toDateString();

      if (lastSent !== todayStr) {
        showSystemNotification(record);
        localStorage.setItem(lastNotifKey, todayStr);
      }
    }
  });
}

function showSystemNotification(record) {
  const title = `Peringatan Servis: ${getPerawatanLabel(record.perawatan)}`;
  const options = {
    body: `Servis jatuh tempo pada ${formatDate(record.tanggalKembali)}. Segera lakukan pengecekan!`,
    icon: "https://cdn-icons-png.flaticon.com/512/2991/2991148.png", // Generic car icon
  };

  new Notification(title, options);
}

// Calendar helpers: open Google Calendar or download .ics
function formatDateToYYYYMMDD(dateString) {
  const d = new Date(dateString);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}${m}${day}`;
}

function addToCalendar(id) {
  const record = records.find((r) => r.id === id);
  if (!record) return;
  const title = `${getPerawatanLabel(record.perawatan)} - ${elements.vehicleInfo.textContent.trim()}`;
  const defaultTime = "09:00";
  Swal.fire({
    title: "Tambah ke Kalender",
    html: `
      <div style="text-align:left; display:flex; flex-direction:column; gap:8px;">
        <div>Event: <strong>${title}</strong></div>
        <div>Tanggal: <strong>${formatDate(record.tanggalKembali)}</strong></div>
        <label for="calendarTime">Pilih waktu event:</label>
        <input type="time" id="calendarTime" value="${defaultTime}" />
      </div>
    `,
    showCancelButton: true,
    showDenyButton: true,
    confirmButtonText: "Google Calendar",
    denyButtonText: "Download .ics",
    cancelButtonText: "Batal",
    didOpen: () => {
      const input = document.getElementById("calendarTime");
      if (input) input.focus();
    },
  }).then((res) => {
    const timeInput = document.getElementById("calendarTime");
    const time = timeInput && timeInput.value ? timeInput.value : defaultTime;
    if (res.isConfirmed) {
      openGoogleCalendarWithTime(title, record, time);
    } else if (res.isDenied) {
      downloadIcsWithTime(title, record, time);
    }
  });
}

function openGoogleCalendar(title, record) {
  // fallback all-day event if no time provided
  console.warn(
    "openGoogleCalendar called without time - this should be called with time",
  );
}

function openGoogleCalendarWithTime(title, record, time) {
  // create local start and end Date objects
  const localStart = new Date(`${record.tanggalKembali}T${time}:00`);
  const localEnd = new Date(localStart.getTime() + 60 * 60 * 1000); // 1 hour

  const startUtc =
    localStart.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const endUtc =
    localEnd.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const dates = `${startUtc}/${endUtc}`;
  const details = record.keterangan || "";
  const url = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${dates}&details=${encodeURIComponent(details)}`;
  window.open(url, "_blank");
}

function downloadIcsWithTime(title, record, time) {
  const id = record.id;
  const uid = `autolog-${id}@autolog.local`;
  const dtstamp =
    new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

  const localStart = new Date(`${record.tanggalKembali}T${time}:00`);
  const localEnd = new Date(localStart.getTime() + 60 * 60 * 1000);

  const startUtc =
    localStart.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const endUtc =
    localEnd.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

  const description = (record.keterangan || "").replace(/\r?\n/g, "\\n");

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//AutoLog//EN",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${dtstamp}`,
    `DTSTART:${startUtc}`,
    `DTEND:${endUtc}`,
    `SUMMARY:${title}`,
    `DESCRIPTION:${description}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `autolog-event-${record.tanggalKembali}.ics`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// WhatsApp Integration
function sendToWhatsApp(id) {
  const record = records.find((r) => r.id === id);
  if (!record) return;

  const vehicle = elements.vehicleInfo.textContent;
  const message =
    `*PENGINGAT SERVIS ${vehicle}*%0A%0A` +
    `*Kategori:* ${getPerawatanLabel(record.perawatan)}%0A` +
    `*Jadwal Servis:* ${formatDate(record.tanggalKembali)}%0A` +
    `*KM Terakhir:* ${record.km.toLocaleString("en-US")}%0A` +
    `*Keterangan:* ${record.keterangan}%0A%0A` +
    `_Dikirim melalui AutoLog / ServisKu_`;

  window.open(`https://wa.me/?text=${message}`, "_blank");
}

// Format KM Input with Thousands Separator
function formatKmInput(e) {
  let value = e.target.value.replace(/\D/g, ""); // Remove non-digits
  if (value) {
    value = parseInt(value, 10).toLocaleString("en-US");
  }
  e.target.value = value;
}

// Modal Functions
function openModal(editId = null) {
  if (editId) {
    const record = records.find((r) => r.id === editId);
    if (record) {
      elements.modalTitle.textContent = "Edit Record";
      elements.recordId.value = record.id;
      elements.tanggal.value = record.tanggal;
      elements.tanggalKembali.value = record.tanggalKembali;
      elements.perawatan.value = record.perawatan;
      elements.km.value = record.km.toLocaleString("en-US");
      elements.keterangan.value = record.keterangan;
    }
  } else {
    elements.modalTitle.textContent = "Add New Record";
    elements.recordForm.reset();
    elements.recordId.value = "";

    // Default dates
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    elements.tanggal.value = `${year}-${month}-${day}`;

    // Default next service (+3 months)
    const nextService = new Date(today);
    nextService.setMonth(nextService.getMonth() + 3);
    const nextYear = nextService.getFullYear();
    const nextMonth = String(nextService.getMonth() + 1).padStart(2, "0");
    const nextDay = String(nextService.getDate()).padStart(2, "0");
    elements.tanggalKembali.value = `${nextYear}-${nextMonth}-${nextDay}`;
  }

  elements.recordModal.classList.add("active");
}

function closeModal() {
  elements.recordModal.classList.remove("active");
}

// Form Submit Handler
async function handleFormSubmit(e) {
  e.preventDefault();

  const id = elements.recordId.value;
  const kmValue = parseInt(elements.km.value.replace(/\D/g, ""), 10) || 0;

  const recordData = {
    tanggal: elements.tanggal.value,
    tanggalKembali: elements.tanggalKembali.value,
    perawatan: elements.perawatan.value,
    km: kmValue,
    keterangan: elements.keterangan.value,
  };

  try {
    // Show loading state
    Swal.fire({
      title: "Menyimpan...",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    if (id) {
      // Edit
      const docRef = doc(db, "maintenance_logs", id);
      await updateDoc(docRef, recordData);
      const index = records.findIndex((r) => r.id === id);
      if (index !== -1) {
        records[index] = { id, ...recordData };
      }
    } else {
      // Add
      const docRef = await addDoc(
        collection(db, "maintenance_logs"),
        recordData,
      );
      records.push({ id: docRef.id, ...recordData });
    }

    renderTable();
    checkUpcomingForNotif();
    closeModal();

    Swal.fire({
      icon: "success",
      title: "Tersimpan!",
      text: "Data perawatan berhasil disimpan ke Cloud.",
      timer: 1500,
      showConfirmButton: false,
      toast: true,
      position: "top-end",
    });
  } catch (error) {
    console.error("Error saving record: ", error);
    Swal.fire("Error", "Gagal menyimpan data.", "error");
  }
}

// Delete Record
function deleteRecord(id) {
  Swal.fire({
    title: "Hapus Data?",
    text: "Data yang dihapus tidak dapat dikembalikan!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#ef4444",
    cancelButtonColor: "#64748b",
    confirmButtonText: "Ya, Hapus!",
    cancelButtonText: "Batal",
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        Swal.fire({
          title: "Menghapus...",
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });

        await deleteDoc(doc(db, "maintenance_logs", id));
        records = records.filter((r) => r.id !== id);
        renderTable();

        Swal.fire({
          icon: "success",
          title: "Terhapus!",
          text: "Data telah dihapus dari Cloud.",
          timer: 1500,
          showConfirmButton: false,
          toast: true,
          position: "top-end",
        });
      } catch (error) {
        console.error("Error deleting record: ", error);
        Swal.fire("Error", "Gagal menghapus data.", "error");
      }
    }
  });
}

// Helper: Check if date is within next 14 days
function isWithin14Days(dateString) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const targetDate = new Date(dateString);
  targetDate.setHours(0, 0, 0, 0);

  const diffTime = targetDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  // Valid warning: upcoming within 14 days OR overdue (negative days)
  return diffDays <= 14;
}

// Helper: Format Date
function formatDate(dateString) {
  if (!dateString) return "-";
  const options = { day: "2-digit", month: "short", year: "numeric" };
  return new Date(dateString).toLocaleDateString("id-ID", options);
}

// Helper: Get Perawatan Label
function getPerawatanLabel(code) {
  const map = {
    P1: "P1: Aki",
    P2: "P2: Servis Rutin",
    P3: "P3: Lain-lain",
  };
  return map[code] || code;
}

// Update Sort Icons
function updateSortHeaders() {
  elements.sortableHeaders.forEach((header) => {
    header.classList.remove("active-sort", "asc", "desc");
    if (header.dataset.sort === currentSort.column) {
      header.classList.add("active-sort", currentSort.order);
    }
  });
}

// Render Table
function renderTable() {
  // 1. Filter
  let filteredRecords = records.filter((r) => {
    const matchFilter =
      currentFilter === "all" || r.perawatan === currentFilter;
    const matchSearch = r.keterangan.toLowerCase().includes(currentSearch);
    return matchFilter && matchSearch;
  });

  // 2. Sort
  filteredRecords.sort((a, b) => {
    let valA = a[currentSort.column];
    let valB = b[currentSort.column];

    if (currentSort.column === "km") {
      valA = parseInt(valA, 10);
      valB = parseInt(valB, 10);
    } else if (
      currentSort.column === "tanggal" ||
      currentSort.column === "tanggalKembali"
    ) {
      valA = new Date(valA).getTime();
      valB = new Date(valB).getTime();
    }

    if (currentSort.order === "asc") {
      return valA > valB ? 1 : valA < valB ? -1 : 0;
    } else {
      return valA < valB ? 1 : valA > valB ? -1 : 0;
    }
  });

  // 3. Render
  elements.tableBody.innerHTML = "";

  if (filteredRecords.length === 0) {
    elements.emptyState.style.display = "block";
    elements.logTable.style.display = "none";
  } else {
    elements.emptyState.style.display = "none";
    elements.logTable.style.display = "table";

    filteredRecords.forEach((record, index) => {
      const tr = document.createElement("tr");

      const isWarning = isWithin14Days(record.tanggalKembali);
      if (isWarning) tr.classList.add("row-warning");

      tr.innerHTML = `
                <td data-label="No">${index + 1}</td>
                <td data-label="Tanggal">${formatDate(record.tanggal)}</td>
                <td data-label="Kembali">
                    ${formatDate(record.tanggalKembali)}
                    ${isWarning ? '<span class="warning-badge"><i class="ph-fill ph-warning-circle"></i> Segera</span>' : ""}
                </td>
                <td data-label="Perawatan"><span class="badge-category cat-${record.perawatan}">${getPerawatanLabel(record.perawatan)}</span></td>
                <td data-label="KM">${record.km.toLocaleString("en-US")}</td>
                <td data-label="Keterangan">${record.keterangan}</td>
                <td data-label="Aksi">
                    <div class="actions">
                        <button class="action-btn wa-btn" onclick="sendToWhatsApp('${record.id}')" title="Kirim ke WhatsApp"><i class="ph ph-whatsapp-logo"></i></button>
                        <button class="action-btn cal-btn" onclick="addToCalendar('${record.id}')" title="Add to Calendar"><i class="ph ph-calendar-plus"></i></button>
                        <button class="action-btn edit-btn" onclick="openModal('${record.id}')" title="Edit"><i class="ph ph-pencil-simple"></i></button>
                        <button class="action-btn delete-btn" onclick="deleteRecord('${record.id}')" title="Delete"><i class="ph ph-trash"></i></button>
                    </div>
                </td>
            `;
      elements.tableBody.appendChild(tr);
    });
  }

  updateDashboardStats();
}

// Update Dashboard Statistics
function updateDashboardStats() {
  if (records.length === 0) {
    elements.summaryTotalKm.textContent = "0";
    elements.summaryLastService.textContent = "-";
    elements.summaryUpcomingService.textContent = "-";
    elements.upcomingCard.classList.remove("warning-card");
    return;
  }

  // Total KM: prefer user-set current KM, fallback to max KM from records
  const storedCurrentKm = parseInt(
    localStorage.getItem("autolog_current_km"),
    10,
  );
  if (!isNaN(storedCurrentKm) && storedCurrentKm > 0) {
    elements.summaryTotalKm.textContent =
      storedCurrentKm.toLocaleString("en-US");
  } else {
    const maxKm = Math.max(...records.map((r) => r.km));
    elements.summaryTotalKm.textContent = maxKm.toLocaleString("en-US");
  }

  // Last Service Date (Max Tanggal)
  const sortedByDateDesc = [...records].sort(
    (a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime(),
  );
  elements.summaryLastService.textContent = formatDate(
    sortedByDateDesc[0].tanggal,
  );

  // Upcoming Alert (Nearest Tanggal Kembali)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Sort all records by tanggalKembali
  const upcomingRecords = [...records].sort(
    (a, b) =>
      new Date(a.tanggalKembali).getTime() -
      new Date(b.tanggalKembali).getTime(),
  );

  // Find the nearest one that is >= today
  let nearest = upcomingRecords.find(
    (r) => new Date(r.tanggalKembali).getTime() >= today.getTime(),
  );

  // If all are past, just take the most recent past one (which would be the last in the sorted array if we just look at past, but wait, if it's past, it's urgent)
  if (!nearest) {
    // All dates are in the past. Take the one with largest date (most recent past) or smallest date? Smallest date is most overdue.
    // Let's just take the first one (most overdue)
    nearest = upcomingRecords[0];
  }

  if (nearest) {
    if (isWithin14Days(nearest.tanggalKembali)) {
      elements.upcomingCard.classList.add("warning-card");
      elements.summaryUpcomingService.innerHTML = `${formatDate(nearest.tanggalKembali)} <span class="warning-badge" style="font-size: 0.8rem;"><i class="ph-fill ph-warning-circle"></i> Segera</span>`;
    } else {
      elements.upcomingCard.classList.remove("warning-card");
      elements.summaryUpcomingService.textContent = formatDate(
        nearest.tanggalKembali,
      );
    }
  }
}

// Make functions global for inline onclick
window.openModal = openModal;
window.deleteRecord = deleteRecord;
window.sendToWhatsApp = sendToWhatsApp;
window.installApp = installApp;
window.exportRecordsToCsv = exportRecordsToCsv;
window.importRecordsFromJson = importRecordsFromJson;

// Trigger file input click for JSON import
function importRecordsFromJson() {
  const input = document.getElementById("importJsonInput");
  if (!input) {
    Swal.fire("Error", "Elemen input untuk import tidak ditemukan.", "error");
    return;
  }
  input.value = null;
  input.click();
}

// Handle selected file
document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("importJsonInput");
  if (input) {
    input.addEventListener("change", handleImportFile);
  }
});

function handleImportFile(e) {
  const file = e.target.files && e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async (evt) => {
    try {
      const text = evt.target.result;
      const data = JSON.parse(text);

      // Accept either an array or object with records property
      const items = Array.isArray(data)
        ? data
        : data.records || data.items || null;
      if (!items || !Array.isArray(items) || items.length === 0) {
        Swal.fire(
          "Tidak valid",
          "File JSON tidak berisi data yang valid.",
          "error",
        );
        return;
      }

      // Basic validation and normalization
      const normalized = items
        .map((it) => {
          return {
            tanggal: it.tanggal || it.date || "",
            tanggalKembali:
              it.tanggalKembali || it.nextDate || it.tanggal_kembali || "",
            perawatan: it.perawatan || it.category || "P3",
            km: parseInt((it.km ?? it.kilometers ?? it.odometer) || 0, 10) || 0,
            keterangan: it.keterangan || it.notes || "",
          };
        })
        .filter((r) => r.tanggal && r.tanggalKembali);

      if (normalized.length === 0) {
        Swal.fire(
          "Tidak valid",
          "Tidak ada record yang memiliki tanggal service dan tanggal kembali.",
          "error",
        );
        return;
      }

      const proceed = await Swal.fire({
        title: "Konfirmasi Import",
        html: `Akan mengimpor <strong>${normalized.length}</strong> record ke Cloud. Lanjutkan?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Ya, impor",
        cancelButtonText: "Batal",
      });

      if (!proceed.isConfirmed) return;

      Swal.fire({
        title: "Mengimpor...",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      // Upload each record to Firestore
      const promises = normalized.map(async (rec) => {
        const docRef = await addDoc(collection(db, "maintenance_logs"), rec);
        records.push({ id: docRef.id, ...rec });
      });

      await Promise.all(promises);
      renderTable();

      Swal.fire({
        icon: "success",
        title: "Selesai",
        text: `${normalized.length} record berhasil diimpor.`,
        timer: 1800,
        showConfirmButton: false,
        toast: true,
        position: "top-end",
      });
    } catch (err) {
      console.error("Import error:", err);
      Swal.fire(
        "Error",
        "Gagal mengimpor file JSON. Periksa formatnya.",
        "error",
      );
    }
  };
  reader.readAsText(file, "utf-8");
}

// Run App
document.addEventListener("DOMContentLoaded", init);

// Register Service Worker for PWA
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("./sw.js")
      .then((registration) => {
        console.log(
          "ServiceWorker registration successful with scope: ",
          registration.scope,
        );
      })
      .catch((err) => {
        console.log("ServiceWorker registration failed: ", err);
      });
  });
}
