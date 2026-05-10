import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBC56I3l9qKHzvP6EhBvwnwl7qAKXaaL6g",
  authDomain: "ertiga-2c823.firebaseapp.com",
  projectId: "ertiga-2c823",
  storageBucket: "ertiga-2c823.firebasestorage.app",
  messagingSenderId: "499478581885",
  appId: "1:499478581885:web:34e4174c369d2da1f19714",
  measurementId: "G-J3KWSJLXEY"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Data State
let records = [];
let currentFilter = 'all';
let currentSearch = '';
let currentSort = { column: 'tanggal', order: 'desc' };

// DOM Elements
const elements = {
    vehicleInfo: document.getElementById('vehicleInfo'),
    summaryTotalKm: document.getElementById('summaryTotalKm'),
    summaryLastService: document.getElementById('summaryLastService'),
    summaryUpcomingService: document.getElementById('summaryUpcomingService'),
    upcomingCard: document.getElementById('upcomingCard'),
    tableBody: document.getElementById('tableBody'),
    emptyState: document.getElementById('emptyState'),
    logTable: document.getElementById('logTable'),
    searchInput: document.getElementById('searchInput'),
    filterBtns: document.querySelectorAll('.filter-btn'),
    sortableHeaders: document.querySelectorAll('th.sortable'),
    desktopAddBtn: document.getElementById('desktopAddBtn'),
    mobileAddBtn: document.getElementById('mobileAddBtn'),
    notifToggle: document.getElementById('notifToggle'),
    recordModal: document.getElementById('recordModal'),
    closeModalBtn: document.getElementById('closeModalBtn'),
    cancelBtn: document.getElementById('cancelBtn'),
    recordForm: document.getElementById('recordForm'),
    modalTitle: document.getElementById('modalTitle'),
    navItems: document.querySelectorAll('.nav-item'),
    sections: {
        dashboard: document.querySelector('.dashboard-overview'),
        logs: document.querySelector('.log-section')
    }
};

let deferredPrompt;
    
    // Form Inputs
    recordId: document.getElementById('recordId'),
    tanggal: document.getElementById('tanggal'),
    tanggalKembali: document.getElementById('tanggalKembali'),
    perawatan: document.getElementById('perawatan'),
    km: document.getElementById('km'),
    keterangan: document.getElementById('keterangan')
};

// Initialize App
function init() {
    // Load Vehicle Name
    const savedVehicle = localStorage.getItem('autolog_vehicle');
    if (savedVehicle) {
        elements.vehicleInfo.textContent = savedVehicle;
    }

    elements.vehicleInfo.addEventListener('blur', () => {
        localStorage.setItem('autolog_vehicle', elements.vehicleInfo.textContent);
    });
    
    // Prevent line breaks in contenteditable
    elements.vehicleInfo.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            elements.vehicleInfo.blur();
        }
    });

    // Event Listeners
    elements.desktopAddBtn.addEventListener('click', () => openModal());
    elements.mobileAddBtn.addEventListener('click', () => openModal());
    elements.notifToggle.addEventListener('click', requestNotificationPermission);
    elements.closeModalBtn.addEventListener('click', closeModal);
    elements.cancelBtn.addEventListener('click', closeModal);
    elements.recordModal.addEventListener('click', (e) => {
        if (e.target === elements.recordModal) closeModal();
    });

    elements.recordForm.addEventListener('submit', handleFormSubmit);
    
    elements.km.addEventListener('input', formatKmInput);

    elements.searchInput.addEventListener('input', (e) => {
        currentSearch = e.target.value.toLowerCase();
        renderTable();
    });

    elements.filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            elements.filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            renderTable();
        });
    });

    elements.sortableHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const column = header.dataset.sort;
            if (currentSort.column === column) {
                currentSort.order = currentSort.order === 'asc' ? 'desc' : 'asc';
            } else {
                currentSort.column = column;
                currentSort.order = 'desc'; // Default to desc when changing column
            }
            updateSortHeaders();
            renderTable();
        });
    });

    // Bottom Nav Navigation
    elements.navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const target = item.dataset.nav;
            
            elements.navItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');

            if (target === 'dashboard') {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else if (target === 'logs') {
                elements.sections.logs.scrollIntoView({ behavior: 'smooth', block: 'start' });
            } else if (target === 'notifications') {
                requestNotificationPermission();
            } else if (target === 'settings') {
                Swal.fire({
                    title: 'AutoLog Menu',
                    html: `
                        <div style="text-align: left; display: flex; flex-direction: column; gap: 10px;">
                            <button onclick="window.scrollTo(0,0); Swal.close();" style="padding: 10px; border: 1px solid #ddd; border-radius: 8px; background: white; cursor: pointer;">Dashboard</button>
                            <button onclick="document.querySelector('.log-section').scrollIntoView(); Swal.close();" style="padding: 10px; border: 1px solid #ddd; border-radius: 8px; background: white; cursor: pointer;">Maintenance Logs</button>
                            <button onclick="location.reload()" style="padding: 10px; border: 1px solid #ddd; border-radius: 8px; background: white; cursor: pointer;">Refresh App</button>
                            <div style="font-size: 0.8rem; color: #666; margin-top: 10px; text-align: center;">Version 1.0.2 • Build 2026</div>
                        </div>
                    `,
                    showConfirmButton: false,
                    showCloseButton: true
                });
            }
        });
    });

    // Capture PWA Install Prompt
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        console.log('Capture beforeinstallprompt');
        
        // Optionally show an install button in settings or header
    });

    // Initial Render
    fetchRecords();
}

// Fetch from Firebase
async function fetchRecords() {
    try {
        const querySnapshot = await getDocs(collection(db, "maintenance_logs"));
        records = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        updateSortHeaders();
        renderTable();
        initNotifications();
    } catch (error) {
        console.error("Error fetching records: ", error);
        Swal.fire('Error', 'Gagal memuat data dari database.', 'error');
    }
}

// Notification Logic
function initNotifications() {
    if (!("Notification" in window)) {
        elements.notifToggle.style.display = 'none';
        return;
    }

    if (Notification.permission === "granted") {
        updateNotifIcon(true);
        checkUpcomingForNotif();
    } else {
        updateNotifIcon(false);
    }
}

function updateNotifIcon(granted) {
    const icon = elements.notifToggle.querySelector('i');
    if (granted) {
        icon.className = 'ph ph-bell';
        elements.notifToggle.classList.add('active');
        elements.notifToggle.title = 'Notifikasi Aktif';
    } else {
        icon.className = 'ph ph-bell-slash';
        elements.notifToggle.classList.remove('active');
        elements.notifToggle.title = 'Aktifkan Notifikasi';
    }
}

function requestNotificationPermission() {
    if (!("Notification" in window)) {
        Swal.fire('Error', 'Browser Anda tidak mendukung notifikasi.', 'error');
        return;
    }

    Notification.requestPermission().then(permission => {
        if (permission === "granted") {
            updateNotifIcon(true);
            Swal.fire({
                icon: 'success',
                title: 'Notifikasi Aktif',
                text: 'Anda akan menerima pemberitahuan saat jadwal servis tiba.',
                timer: 2000,
                showConfirmButton: false
            });
            checkUpcomingForNotif();
        } else {
            updateNotifIcon(false);
        }
    });
}

function checkUpcomingForNotif() {
    if (Notification.permission !== "granted") return;

    const today = new Date();
    today.setHours(0,0,0,0);
    
    records.forEach(record => {
        const targetDate = new Date(record.tanggalKembali);
        targetDate.setHours(0,0,0,0);
        
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
        icon: 'https://cdn-icons-png.flaticon.com/512/2991/2991148.png' // Generic car icon
    };
    
    new Notification(title, options);
}

// WhatsApp Integration
function sendToWhatsApp(id) {
    const record = records.find(r => r.id === id);
    if (!record) return;

    const vehicle = elements.vehicleInfo.textContent;
    const message = `*PENGINGAT SERVIS ${vehicle}*%0A%0A` +
                    `*Kategori:* ${getPerawatanLabel(record.perawatan)}%0A` +
                    `*Jadwal Servis:* ${formatDate(record.tanggalKembali)}%0A` +
                    `*KM Terakhir:* ${record.km.toLocaleString('en-US')}%0A` +
                    `*Keterangan:* ${record.keterangan}%0A%0A` +
                    `_Dikirim melalui AutoLog / ServisKu_`;
    
    window.open(`https://wa.me/?text=${message}`, '_blank');
}

// Format KM Input with Thousands Separator
function formatKmInput(e) {
    let value = e.target.value.replace(/\D/g, ''); // Remove non-digits
    if (value) {
        value = parseInt(value, 10).toLocaleString('en-US');
    }
    e.target.value = value;
}

// Modal Functions
function openModal(editId = null) {
    if (editId) {
        const record = records.find(r => r.id === editId);
        if (record) {
            elements.modalTitle.textContent = 'Edit Record';
            elements.recordId.value = record.id;
            elements.tanggal.value = record.tanggal;
            elements.tanggalKembali.value = record.tanggalKembali;
            elements.perawatan.value = record.perawatan;
            elements.km.value = record.km.toLocaleString('en-US');
            elements.keterangan.value = record.keterangan;
        }
    } else {
        elements.modalTitle.textContent = 'Add New Record';
        elements.recordForm.reset();
        elements.recordId.value = '';
        
        // Default dates
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        elements.tanggal.value = `${year}-${month}-${day}`;
        
        // Default next service (+3 months)
        const nextService = new Date(today);
        nextService.setMonth(nextService.getMonth() + 3);
        const nextYear = nextService.getFullYear();
        const nextMonth = String(nextService.getMonth() + 1).padStart(2, '0');
        const nextDay = String(nextService.getDate()).padStart(2, '0');
        elements.tanggalKembali.value = `${nextYear}-${nextMonth}-${nextDay}`;
    }
    
    elements.recordModal.classList.add('active');
}

function closeModal() {
    elements.recordModal.classList.remove('active');
}

// Form Submit Handler
async function handleFormSubmit(e) {
    e.preventDefault();
    
    const id = elements.recordId.value;
    const kmValue = parseInt(elements.km.value.replace(/\D/g, ''), 10) || 0;
    
    const recordData = {
        tanggal: elements.tanggal.value,
        tanggalKembali: elements.tanggalKembali.value,
        perawatan: elements.perawatan.value,
        km: kmValue,
        keterangan: elements.keterangan.value
    };

    try {
        // Show loading state
        Swal.fire({
            title: 'Menyimpan...',
            allowOutsideClick: false,
            didOpen: () => { Swal.showLoading() }
        });

        if (id) {
            // Edit
            const docRef = doc(db, "maintenance_logs", id);
            await updateDoc(docRef, recordData);
            const index = records.findIndex(r => r.id === id);
            if (index !== -1) {
                records[index] = { id, ...recordData };
            }
        } else {
            // Add
            const docRef = await addDoc(collection(db, "maintenance_logs"), recordData);
            records.push({ id: docRef.id, ...recordData });
        }

        renderTable();
        checkUpcomingForNotif();
        closeModal();
        
        Swal.fire({
            icon: 'success',
            title: 'Tersimpan!',
            text: 'Data perawatan berhasil disimpan ke Cloud.',
            timer: 1500,
            showConfirmButton: false,
            toast: true,
            position: 'top-end'
        });
    } catch (error) {
        console.error("Error saving record: ", error);
        Swal.fire('Error', 'Gagal menyimpan data.', 'error');
    }
}

// Delete Record
function deleteRecord(id) {
    Swal.fire({
        title: 'Hapus Data?',
        text: "Data yang dihapus tidak dapat dikembalikan!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#64748b',
        confirmButtonText: 'Ya, Hapus!',
        cancelButtonText: 'Batal'
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                Swal.fire({
                    title: 'Menghapus...',
                    allowOutsideClick: false,
                    didOpen: () => { Swal.showLoading() }
                });

                await deleteDoc(doc(db, "maintenance_logs", id));
                records = records.filter(r => r.id !== id);
                renderTable();

                Swal.fire({
                    icon: 'success',
                    title: 'Terhapus!',
                    text: 'Data telah dihapus dari Cloud.',
                    timer: 1500,
                    showConfirmButton: false,
                    toast: true,
                    position: 'top-end'
                });
            } catch (error) {
                console.error("Error deleting record: ", error);
                Swal.fire('Error', 'Gagal menghapus data.', 'error');
            }
        }
    });
}

// Helper: Check if date is within next 14 days
function isWithin14Days(dateString) {
    const today = new Date();
    today.setHours(0,0,0,0);
    const targetDate = new Date(dateString);
    targetDate.setHours(0,0,0,0);
    
    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // Valid warning: upcoming within 14 days OR overdue (negative days)
    return diffDays <= 14;
}

// Helper: Format Date
function formatDate(dateString) {
    if (!dateString) return '-';
    const options = { day: '2-digit', month: 'short', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
}

// Helper: Get Perawatan Label
function getPerawatanLabel(code) {
    const map = {
        'P1': 'P1: Aki',
        'P2': 'P2: Servis Rutin',
        'P3': 'P3: Lain-lain'
    };
    return map[code] || code;
}

// Update Sort Icons
function updateSortHeaders() {
    elements.sortableHeaders.forEach(header => {
        header.classList.remove('active-sort', 'asc', 'desc');
        if (header.dataset.sort === currentSort.column) {
            header.classList.add('active-sort', currentSort.order);
        }
    });
}

// Render Table
function renderTable() {
    // 1. Filter
    let filteredRecords = records.filter(r => {
        const matchFilter = currentFilter === 'all' || r.perawatan === currentFilter;
        const matchSearch = r.keterangan.toLowerCase().includes(currentSearch);
        return matchFilter && matchSearch;
    });

    // 2. Sort
    filteredRecords.sort((a, b) => {
        let valA = a[currentSort.column];
        let valB = b[currentSort.column];
        
        if (currentSort.column === 'km') {
            valA = parseInt(valA, 10);
            valB = parseInt(valB, 10);
        } else if (currentSort.column === 'tanggal' || currentSort.column === 'tanggalKembali') {
            valA = new Date(valA).getTime();
            valB = new Date(valB).getTime();
        }
        
        if (currentSort.order === 'asc') {
            return valA > valB ? 1 : (valA < valB ? -1 : 0);
        } else {
            return valA < valB ? 1 : (valA > valB ? -1 : 0);
        }
    });

    // 3. Render
    elements.tableBody.innerHTML = '';
    
    if (filteredRecords.length === 0) {
        elements.emptyState.style.display = 'block';
        elements.logTable.style.display = 'none';
    } else {
        elements.emptyState.style.display = 'none';
        elements.logTable.style.display = 'table';
        
        filteredRecords.forEach((record, index) => {
            const tr = document.createElement('tr');
            
            const isWarning = isWithin14Days(record.tanggalKembali);
            if (isWarning) tr.classList.add('row-warning');
            
            tr.innerHTML = `
                <td>${index + 1}</td>
                <td>${formatDate(record.tanggal)}</td>
                <td>
                    ${formatDate(record.tanggalKembali)}
                    ${isWarning ? '<span class="warning-badge"><i class="ph-fill ph-warning-circle"></i> Segera</span>' : ''}
                </td>
                <td><span class="badge-category cat-${record.perawatan}">${getPerawatanLabel(record.perawatan)}</span></td>
                <td>${record.km.toLocaleString('en-US')}</td>
                <td>${record.keterangan}</td>
                <td>
                    <div class="actions">
                        <button class="action-btn wa-btn" onclick="sendToWhatsApp('${record.id}')" title="Kirim ke WhatsApp"><i class="ph ph-whatsapp-logo"></i></button>
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
        elements.summaryTotalKm.textContent = '0';
        elements.summaryLastService.textContent = '-';
        elements.summaryUpcomingService.textContent = '-';
        elements.upcomingCard.classList.remove('warning-card');
        return;
    }

    // Total KM (Max KM)
    const maxKm = Math.max(...records.map(r => r.km));
    elements.summaryTotalKm.textContent = maxKm.toLocaleString('en-US');

    // Last Service Date (Max Tanggal)
    const sortedByDateDesc = [...records].sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime());
    elements.summaryLastService.textContent = formatDate(sortedByDateDesc[0].tanggal);

    // Upcoming Alert (Nearest Tanggal Kembali)
    const today = new Date();
    today.setHours(0,0,0,0);
    
    // Sort all records by tanggalKembali
    const upcomingRecords = [...records].sort((a, b) => new Date(a.tanggalKembali).getTime() - new Date(b.tanggalKembali).getTime());
    
    // Find the nearest one that is >= today
    let nearest = upcomingRecords.find(r => new Date(r.tanggalKembali).getTime() >= today.getTime());
    
    // If all are past, just take the most recent past one (which would be the last in the sorted array if we just look at past, but wait, if it's past, it's urgent)
    if (!nearest) {
        // All dates are in the past. Take the one with largest date (most recent past) or smallest date? Smallest date is most overdue.
        // Let's just take the first one (most overdue)
        nearest = upcomingRecords[0];
    }

    if (nearest) {
        if (isWithin14Days(nearest.tanggalKembali)) {
            elements.upcomingCard.classList.add('warning-card');
            elements.summaryUpcomingService.innerHTML = `${formatDate(nearest.tanggalKembali)} <span class="warning-badge" style="font-size: 0.8rem;"><i class="ph-fill ph-warning-circle"></i> Segera</span>`;
        } else {
            elements.upcomingCard.classList.remove('warning-card');
            elements.summaryUpcomingService.textContent = formatDate(nearest.tanggalKembali);
        }
    }
}

// Make functions global for inline onclick
window.openModal = openModal;
window.deleteRecord = deleteRecord;
window.sendToWhatsApp = sendToWhatsApp;

// Run App
document.addEventListener('DOMContentLoaded', init);

// Register Service Worker for PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(registration => {
                console.log('ServiceWorker registration successful with scope: ', registration.scope);
            })
            .catch(err => {
                console.log('ServiceWorker registration failed: ', err);
            });
    });
}
