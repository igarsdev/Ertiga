# AutoLog / ServisKu - PWA Installation & Setup Guide

## 📱 Responsive & Progressive Web App Features

AutoLog is fully responsive and can be installed as a Progressive Web App (PWA) on mobile devices and desktops.

### ✨ Features

- ✅ **Fully Responsive** - Optimized for all screen sizes (mobile, tablet, desktop)
- ✅ **Installable as App** - Install directly on home screen without app store
- ✅ **Offline Support** - Works offline with cached data
- ✅ **Push Notifications** - Maintenance reminders and alerts
- ✅ **Fast Loading** - Service Worker caching for instant load times
- ✅ **Native Feel** - Full-screen experience without browser UI
- ✅ **Adaptive UI** - Adjusts layout for notches and safe areas

---

## 📲 Installation on Mobile Devices

### **iOS (iPhone/iPad)**

1. Open AutoLog in Safari
2. Tap the **Share** button at the bottom
3. Select **"Add to Home Screen"**
4. Enter a name (e.g., "AutoLog")
5. Tap **"Add"**
6. App will appear on your home screen

**Note:** iOS PWA features are limited compared to Android. You'll still see Safari features.

### **Android (Chrome/Edge)**

**Method 1: Install Prompt (Automatic)**

1. Open AutoLog in Chrome or Edge
2. A banner should appear asking to "Install app"
3. Tap **"Install"** to add to home screen
4. Confirm the installation

**Method 2: Manual Installation**

1. Open AutoLog in your browser
2. Tap the **Menu icon** (⋮) at top right
3. Select **"Install app"**
4. Confirm installation
5. App will be installed like a native app

**Method 3: From App Settings**

1. Open AutoLog in your browser
2. Tap **Menu** (⋮) → **"Settings"**
3. Look for **"Install App"** option
4. Tap and confirm

---

## 🖥️ Installation on Desktop

### **Windows 10/11 (Chrome/Edge/Opera)**

1. Open AutoLog in your browser
2. Click the **Install icon** (house icon) in the address bar
3. Or: Menu (⋯) → **"Install AutoLog"**
4. Click **"Install"**
5. App opens in its own window on your desktop

### **Mac (Chrome/Edge)**

1. Open AutoLog in your browser
2. Click the **Install icon** in the address bar
3. Or: Menu → **"Install app..."**
4. Click **"Install"**
5. App will appear in Applications folder

### **Linux (Chrome/Edge)**

1. Open AutoLog in your browser
2. Click the **Install icon** in the address bar
3. Or: Menu (⋯) → **"Install app"**
4. Click **"Install"**
5. App launches in its own window

---

## 🔧 Features & How to Use

### **1. Offline Access**

- All your data is cached locally
- Service Worker keeps recent pages in cache
- You can view past maintenance logs even without internet
- Changes sync to Firebase when connection returns

### **2. Notifications**

- Tap the **Bell icon** in header to enable notifications
- Get alerts when maintenance is due (within 14 days)
- Notifications work even when app is closed
- Set your own notification frequency

### **3. Bottom Navigation (Mobile)**

- **Home**: Dashboard with summary cards
- **Logs**: Full maintenance history
- **Notif**: Notification settings
- **Menu**: Additional options & install button

### **4. Install App Button**

Located in the Menu (⚙️ icon) on mobile:

- Tap **Menu** → **"Install App"** to add to home screen
- Option only appears if PWA is installable

### **5. Maintenance Reminders**

- Set maintenance due dates (Tanggal Kembali)
- Automatic warnings for dates within 14 days
- WhatsApp integration to share reminders
- Color-coded categories (P1/P2/P3)

---

## 🌐 Browser Requirements

### **Recommended Browsers**

- ✅ Google Chrome 90+
- ✅ Microsoft Edge 90+
- ✅ Opera 76+
- ✅ Brave 1.23+
- ✅ Firefox (limited PWA support)
- ✅ Safari 15+ (iOS, limited features)

### **Minimum Requirements**

- Service Worker support
- Cache API support
- Manifest.json support
- HTTPS connection (required for PWA)

---

## 📊 Responsive Breakpoints

**Mobile Layout** (< 768px)

- Single column dashboard
- Collapsible navigation
- Touch-optimized buttons
- Floating action button

**Tablet Layout** (768px - 1024px)

- Two column dashboard
- Optimized spacing
- Medium text sizes

**Desktop Layout** (> 1024px)

- Three column dashboard
- Full navigation bar
- Desktop Add button
- Expanded views

---

## 🔐 Data & Privacy

- **Local Storage**: Vehicle name stored locally
- **Firebase Cloud**: Maintenance logs stored securely
- **Offline Access**: All data cached in browser
- **No Tracking**: Privacy-first approach
- **Notifications**: Only sent with your permission

---

## 🚀 Performance Optimization

### **Loading Speed**

- Service Worker caching: ~100ms first load
- Optimized images and assets
- Minimal JavaScript bundle
- Fast Firebase queries

### **Offline First**

- Static files cached immediately
- Network requests fail gracefully
- Fallback UI for offline state
- Data syncs automatically when online

### **Battery & Data**

- Efficient caching strategy
- Minimal network requests
- Low memory footprint
- Optimized for 3G networks

---

## 🐛 Troubleshooting

### **App Won't Install**

- Ensure you're using HTTPS (production)
- Browser must support PWA (Chrome, Edge, Opera)
- Manifest.json must be valid
- Clear browser cache and try again

### **Notifications Not Working**

- Check if notifications are enabled in browser settings
- Tap the Bell icon to request permission
- Some browsers may block notifications
- Check browser notification settings

### **Offline Features Not Working**

- Service Worker must be registered
- Check browser DevTools > Application > Service Workers
- Clear cache and reload app
- Ensure app has been installed first

### **Slow Loading**

- Clear browser cache
- Check internet connection speed
- Verify Firebase connection
- Check for browser extensions that block scripts

---

## 📋 System Requirements

**Minimum:**

- 50 MB free storage
- Latest browser version
- Active internet connection (for features)

**Recommended:**

- 100 MB free storage
- Latest Chrome/Edge browser
- Stable internet connection
- Push notifications enabled

---

## 📞 Support

For issues or questions:

1. Check troubleshooting section above
2. Clear cache and reinstall app
3. Try different browser
4. Check Firebase connection status

---

## 🎯 Quick Start

1. **First Time?**
   - Visit AutoLog in your browser
   - Add to home screen or install app
   - Allow notifications (optional)
   - Start tracking maintenance!

2. **Add Maintenance Record**
   - Tap floating + button (mobile) or "New Record" (desktop)
   - Fill in service date, category, KM, notes
   - Set next service date
   - Save to cloud

3. **View History**
   - Tap "Logs" in bottom nav (mobile)
   - Filter by category or search
   - Sort by date or KM
   - Click WhatsApp icon to share

4. **Get Reminders**
   - Enable notifications in settings
   - Get alert when maintenance is due
   - Tap notification to view details
   - Take action immediately

---

**Version**: 1.0.2  
**Last Updated**: May 2026  
**PWA Status**: Ready for Installation ✅
