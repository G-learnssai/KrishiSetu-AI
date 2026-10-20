// Main Application Logic for KrishiSetu AI

document.addEventListener('DOMContentLoaded', () => {
  initLanguage();
  initCropListings();
  initMachineryMarketplace(); // Enhanced Agricultural Machinery Rental Marketplace
  initProfitCalculator(); // Enhanced profit calculator & buyer offer comparison
  initDefaultDate();
  initMarketplace(); // Initialize the Sell Crops & Find Buyers Marketplace
});

// ----------------------------------------------------
// 1. Language Translation Handling
// ----------------------------------------------------
let currentLanguage = localStorage.getItem('krishi_lang') || 'en';

function initLanguage() {
  const langSelect = document.getElementById('langSelect');
  if (langSelect) {
    langSelect.value = currentLanguage;
    langSelect.addEventListener('change', (e) => {
      setLanguage(e.target.value);
    });
  }
  applyTranslations(currentLanguage);
}

function setLanguage(lang) {
  if (!translations[lang]) return;
  currentLanguage = lang;
  localStorage.setItem('krishi_lang', lang);
  applyTranslations(lang);

  if (window.krishiVoice) {
    window.krishiVoice.setLanguage(lang);
  }

  showToast(
    lang === 'kn' ? 'ಭಾಷೆಯನ್ನು ಕನ್ನಡಕ್ಕೆ ಬದಲಾಯಿಸಲಾಗಿದೆ' :
    lang === 'hi' ? 'भाषा बदलकर हिंदी कर दी गई है' :
    'Language switched to English',
    '🌐'
  );
}

function applyTranslations(lang) {
  const dict = translations[lang] || translations.en;
  const elements = document.querySelectorAll('[data-i18n]');

  elements.forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (dict[key]) {
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        el.placeholder = dict[key];
      } else {
        el.innerText = dict[key];
      }
    }
  });

  // Update greeting in voice assistant if present
  const greetingEl = document.getElementById('assistantInitialGreeting');
  if (greetingEl) {
    if (lang === 'kn') {
      greetingEl.innerText = "ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ ಕೃಷಿಸೇತು AI ಧ್ವನಿ ಸಹಾಯಕ. ಮೈಕ್ ಒತ್ತಿ ಮಾತನಾಡಿ, ಅಥವಾ ಕೆಳಗಿನ ಪ್ರಶ್ನೆಗಳಿಂದ ಆಯ್ಕೆ ಮಾಡಿ.";
    } else if (lang === 'hi') {
      greetingEl.innerText = "नमस्ते! मैं आपका कृषिसेतु AI आवाज़ सहायक हूँ। माइक दबाकर बोलें, या नीचे दिए गए प्रश्नों में से चुनें।";
    } else {
      greetingEl.innerText = "Namaste! I am your KrishiSetu AI companion. Tap the microphone and speak your query, or pick a sample question below.";
    }
  }
}

// ----------------------------------------------------
// 2. Modal Management
// ----------------------------------------------------
function updateBottomNav(modalId) {
  const navItems = document.querySelectorAll('.bottom-nav-item');
  navItems.forEach(item => item.classList.remove('active'));

  if (!modalId) {
    if (navItems[0]) navItems[0].classList.add('active'); // Home
    return;
  }

  if (modalId === 'machineryModal' && navItems[1]) navItems[1].classList.add('active');
  else if (modalId === 'sellCropModal' && navItems[2]) navItems[2].classList.add('active');
  else if (modalId === 'calculatorModal' && navItems[3]) navItems[3].classList.add('active');
  else if (modalId === 'voiceModal' && navItems[4]) navItems[4].classList.add('active');
  else if (navItems[0]) navItems[0].classList.add('active');
}

function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return;
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';

  updateBottomNav(modalId);

  // If opening Voice Modal, set language and ready state
  if (modalId === 'voiceModal' && window.krishiVoice) {
    window.krishiVoice.setLanguage(currentLanguage);
    window.krishiVoice.setAssistantStatus('ready');
  }

  // If opening Calculator Modal, ensure inputs and import dropdowns are fresh
  if (modalId === 'calculatorModal') {
    initProfitCalculator();
  }

  // If opening Machinery Modal, refresh machinery catalog and bookings
  if (modalId === 'machineryModal') {
    initMachineryMarketplace();
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return;
  modal.classList.remove('active');
  document.body.style.overflow = '';

  updateBottomNav(null);

  // If closing voice modal and mic is active, stop it
  if (modalId === 'voiceModal' && window.krishiVoice && window.krishiVoice.isListening) {
    window.krishiVoice.toggleListening();
  }
}

function closeModalOnBackdrop(event, modalId) {
  if (event.target.id === modalId) {
    closeModal(modalId);
  }
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-overlay.active').forEach(modal => {
      closeModal(modal.id);
    });
  }
});

// ----------------------------------------------------
// 3. Agricultural Machinery Rental Marketplace Engine
// ----------------------------------------------------

const initialDemoMachineryListings = [
  {
    id: "mach_demo_1",
    name: "Mahindra 575 DI (45 HP Tractor with Tiller)",
    type: "tractor",
    ownerName: "Sri Basaveshwara Agro Rentals",
    ownerPhone: "9845012345",
    village: "Maddur",
    district: "Mandya",
    rate: 850,
    unit: "hour",
    condition: "Excellent",
    status: "available",
    driverIncluded: "Yes",
    specs: "45 HP 4-cylinder diesel engine. Includes 9-tyne cultivator & heavy duty rotavator. Experienced driver provided. Ideal for wet paddy & dry tilling.",
    imageUrl: "",
    availableDate: "2026-10-21",
    isDemo: true,
    isOwner: true, // Tagged so user can test owner management immediately
    createdAt: "2026-10-18T10:00:00Z"
  },
  {
    id: "mach_demo_2",
    name: "CLAAS Crop Tiger 30 Combine Harvester",
    type: "harvester",
    ownerName: "Kaveri Mechanized Harvesting Services",
    ownerPhone: "9448011223",
    village: "Bhadravati",
    district: "Shimoga",
    rate: 2400,
    unit: "hour",
    condition: "Very Good",
    status: "available",
    driverIncluded: "Yes",
    specs: "Multi-crop combine harvester for Paddy, Wheat, and Soyabean. Straw walker tech minimizes grain damage. Clean grain tank 1.2 tonnes.",
    imageUrl: "",
    availableDate: "2026-10-22",
    isDemo: true,
    isOwner: false,
    createdAt: "2026-10-17T14:30:00Z"
  },
  {
    id: "mach_demo_3",
    name: "Shaktiman 7-Feet Semi-Champion Rotavator",
    type: "rotavator",
    ownerName: "Chennappa Farm Equipments",
    ownerPhone: "9900122334",
    village: "Harihar",
    district: "Davanagere",
    rate: 650,
    unit: "hour",
    condition: "Good",
    status: "available",
    driverIncluded: "No",
    specs: "Heavy multi-speed gearbox, Boron steel L-blades. Requires 45-60 HP tractor hitch. Heavy PTO shaft included.",
    imageUrl: "",
    availableDate: "2026-10-21",
    isDemo: true,
    isOwner: false,
    createdAt: "2026-10-18T16:00:00Z"
  },
  {
    id: "mach_demo_4",
    name: "Automatic Tractor-Mounted Seed & Fertilizer Drill",
    type: "seed_drill",
    ownerName: "Annapurna Precision Agro",
    ownerPhone: "9740088776",
    village: "Malur",
    district: "Kolar",
    rate: 1100,
    unit: "acre",
    condition: "Excellent",
    status: "available",
    driverIncluded: "Yes",
    specs: "9-row adjustable metering with simultaneous fertilizer placement. Ideal for Ragi, Groundnut, Maize, and Pulses.",
    imageUrl: "",
    availableDate: "2026-10-23",
    isDemo: true,
    isOwner: false,
    createdAt: "2026-10-19T09:00:00Z"
  },
  {
    id: "mach_demo_5",
    name: "John Deere 9-Tyne Spring Loaded Cultivator",
    type: "cultivator",
    ownerName: "Bhoomi Seva Machinery Pool",
    ownerPhone: "9632054321",
    village: "Chikodi",
    district: "Belagavi",
    rate: 1800,
    unit: "day",
    condition: "Very Good",
    status: "available",
    driverIncluded: "No",
    specs: "Heavy channel frame with forged spring steel tynes. Aerates hard soils without bending under stone obstacles.",
    imageUrl: "",
    availableDate: "2026-10-21",
    isDemo: true,
    isOwner: false,
    createdAt: "2026-10-16T11:00:00Z"
  },
  {
    id: "mach_demo_6",
    name: "HTP Tractor PTO Orchard & Field Sprayer (500L)",
    type: "sprayer",
    ownerName: "Kolar Horticulture Equipment Hub",
    ownerPhone: "9988776655",
    village: "Srinivaspur",
    district: "Kolar",
    rate: 750,
    unit: "acre",
    condition: "Excellent",
    status: "available",
    driverIncluded: "Yes",
    specs: "500-liter chemical tank, triple-piston brass pump with 100-meter delivery hose and turbo spray gun. Ideal for Mango, Tomato & vegetables.",
    imageUrl: "",
    availableDate: "2026-10-21",
    isDemo: true,
    isOwner: false,
    createdAt: "2026-10-18T13:00:00Z"
  }
];

const initialDemoMachineryBookings = [
  {
    id: "book_demo_101",
    equipmentId: "mach_demo_1",
    equipmentName: "Mahindra 575 DI (45 HP Tractor with Tiller)",
    renterName: "Gowramma Siddappa",
    renterPhone: "9880011223",
    renterVillage: "Kestur, Maddur",
    startDate: "2026-10-24",
    endDate: "2026-10-25",
    unit: "hour",
    unitQuantity: 8,
    rate: 850,
    estimatedCost: 6800,
    status: "accepted", // Accepted booking establishes booked window Oct 24 - Oct 25
    message: "Need tilling for 2 acres of wet paddy land before transplantation.",
    ownerPhone: "9845012345",
    ownerName: "Sri Basaveshwara Agro Rentals",
    isDemo: true,
    isOutgoing: false, // Incoming request for owner
    createdAt: "2026-10-19T08:30:00Z"
  },
  {
    id: "book_demo_102",
    equipmentId: "mach_demo_2",
    equipmentName: "CLAAS Crop Tiger 30 Combine Harvester",
    renterName: "Chandrashekar Patil",
    renterPhone: "9449088776",
    renterVillage: "Holenarasipura, Hassan",
    startDate: "2026-10-27",
    endDate: "2026-10-27",
    unit: "hour",
    unitQuantity: 5,
    rate: 2400,
    estimatedCost: 12000,
    status: "pending",
    message: "Harvesting ripe paddy field. Farm road is dry and clear for harvester entry.",
    ownerPhone: "9448011223",
    ownerName: "Kaveri Mechanized Harvesting Services",
    isDemo: true,
    isOutgoing: true, // Made by the current user
    createdAt: "2026-10-20T09:15:00Z"
  }
];

const machFilterState = {
  search: "",
  type: "all",
  district: "all",
  unit: "all"
};

let activeBookingSubtab = "outgoing";
let uploadedMachineryPhotoBase64 = "";

function initMachineryMarketplace() {
  // Seed listings if empty
  const savedListings = localStorage.getItem('krishi_machinery_listings');
  if (!savedListings) {
    localStorage.setItem('krishi_machinery_listings', JSON.stringify(initialDemoMachineryListings));
  }

  // Seed bookings if empty
  const savedBookings = localStorage.getItem('krishi_machinery_bookings');
  if (!savedBookings) {
    localStorage.setItem('krishi_machinery_bookings', JSON.stringify(initialDemoMachineryBookings));
  }

  // Set default dates
  initDefaultBookingDates();

  // Initial renders
  renderMachineryCatalog();
  renderMachineryBookings();
  renderMyEquipmentListings();
  updateMachineryBadges();
}

function getMachineryListings() {
  try {
    return JSON.parse(localStorage.getItem('krishi_machinery_listings') || '[]');
  } catch (e) {
    return [];
  }
}

function saveMachineryListings(listings) {
  localStorage.setItem('krishi_machinery_listings', JSON.stringify(listings));
}

function getMachineryBookings() {
  try {
    return JSON.parse(localStorage.getItem('krishi_machinery_bookings') || '[]');
  } catch (e) {
    return [];
  }
}

function saveMachineryBookings(bookings) {
  localStorage.setItem('krishi_machinery_bookings', JSON.stringify(bookings));
}

function initDefaultBookingDates() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const startInput = document.getElementById('bookingStartDate');
  const endInput = document.getElementById('bookingEndDate');
  const availDateInput = document.getElementById('machNewAvailableDate');

  if (startInput && !startInput.value) startInput.value = tomorrowStr;
  if (endInput && !endInput.value) endInput.value = tomorrowStr;
  if (availDateInput && !availDateInput.value) availDateInput.value = tomorrowStr;
}

// ----------------------------------------------------
// Tab Switching inside Machinery Modal
// ----------------------------------------------------
function switchMachineryTab(tabName) {
  const tabs = ['browse', 'list', 'bookings', 'owner'];
  tabs.forEach(t => {
    const btn = document.getElementById(`machTab${capitalize(t)}Btn`);
    const pane = document.getElementById(`machTab${capitalize(t)}`);
    if (btn) btn.classList.toggle('active', t === tabName);
    if (pane) pane.style.display = (t === tabName) ? 'block' : 'none';
  });

  if (tabName === 'browse') {
    renderMachineryCatalog();
  } else if (tabName === 'list') {
    if (typeof currentUser !== 'undefined' && currentUser) {
      const oName = document.getElementById('machNewOwnerName');
      const oPhone = document.getElementById('machNewOwnerPhone');
      const oVillage = document.getElementById('machNewVillage');
      const oDistrict = document.getElementById('machNewDistrict');
      if (oName && !oName.value) oName.value = currentUser.fullName || '';
      if (oPhone && !oPhone.value) oPhone.value = currentUser.phone || '';
      if (oVillage && !oVillage.value) oVillage.value = currentUser.village || '';
      if (oDistrict && currentUser.district) oDistrict.value = currentUser.district;
    }
  } else if (tabName === 'bookings') {
    renderMachineryBookings();
  } else if (tabName === 'owner') {
    renderMyEquipmentListings();
  }
}

// ----------------------------------------------------
// Machinery Catalog & Filter Engine
// ----------------------------------------------------
function handleMachineryFilterChange() {
  const searchInput = document.getElementById('machSearchInput');
  const typeFilter = document.getElementById('machTypeFilter');
  const districtFilter = document.getElementById('machDistrictFilter');
  const unitFilter = document.getElementById('machUnitFilter');

  if (searchInput) machFilterState.search = searchInput.value.trim().toLowerCase();
  if (typeFilter) machFilterState.type = typeFilter.value;
  if (districtFilter) machFilterState.district = districtFilter.value;
  if (unitFilter) machFilterState.unit = unitFilter.value;

  renderMachineryCatalog();
}

function getMachineryTypeIcon(type) {
  const icons = {
    tractor: '🚜',
    harvester: '🌾',
    rotavator: '⚙️',
    seed_drill: '🌱',
    cultivator: '⛏️',
    sprayer: '💧',
    other: '🚜'
  };
  return icons[type] || '🚜';
}

function renderMachineryCatalog() {
  const container = document.getElementById('machineryCatalogGrid');
  const countLabel = document.getElementById('machResultsCount');
  if (!container) return;

  const listings = getMachineryListings();

  // Filter listings
  const filtered = listings.filter(item => {
    // Keyword search across name, specs, owner, village, and district
    if (machFilterState.search) {
      const q = machFilterState.search;
      const combined = `${item.name} ${item.type} ${item.specs} ${item.ownerName} ${item.village} ${item.district}`.toLowerCase();
      if (!combined.includes(q)) return false;
    }

    // Type filter
    if (machFilterState.type !== 'all' && item.type !== machFilterState.type) {
      return false;
    }

    // District filter
    if (machFilterState.district !== 'all' && item.district !== machFilterState.district) {
      return false;
    }

    // Pricing unit filter
    if (machFilterState.unit !== 'all' && item.unit !== machFilterState.unit) {
      return false;
    }

    return true;
  });

  if (countLabel) {
    countLabel.innerText = `Showing ${filtered.length} equipment ${filtered.length === 1 ? 'option' : 'options'}`;
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="empty-state-box" style="grid-column: 1 / -1;">
        <div class="empty-state-icon">🚜</div>
        <h4 style="color: var(--color-forest); font-size: 1.1rem; font-weight: 800; margin-bottom: 6px;">No machinery matches your filters</h4>
        <p style="color: var(--color-text-muted); font-size: 0.88rem;">Try clearing your search keyword, changing the district, or choosing "All Equipment Types".</p>
        <button class="btn-primary" style="margin-top: 10px; font-size: 0.85rem;" onclick="resetMachineryFilters()">Reset Filters</button>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(item => {
    const typeIcon = getMachineryTypeIcon(item.type);
    const unitLabel = item.unit === 'hour' ? 'hour' : (item.unit === 'day' ? 'day' : 'acre');

    let availTagClass = 'tag-avail-available';
    let availLabel = '✓ Available Now';
    if (item.status === 'booked') {
      availTagClass = 'tag-avail-booked';
      availLabel = '⏳ Booked';
    } else if (item.status === 'maintenance') {
      availTagClass = 'tag-avail-maintenance';
      availLabel = '🔧 In Maintenance';
    }

    return `
      <div class="equipment-card-enhanced">
        <div class="equipment-card-image">
          ${item.imageUrl ? `<img src="${item.imageUrl}" alt="${escapeHtml(item.name)}">` : `<div class="equipment-card-image-fallback">${typeIcon}</div>`}
          <div style="position: absolute; top: 10px; right: 10px;">
            <span class="${availTagClass}">${availLabel}</span>
          </div>
          ${item.isDemo ? `<div style="position: absolute; bottom: 8px; left: 8px;"><span class="tag-demo">Sample Data</span></div>` : ''}
        </div>

        <div class="equipment-card-content">
          <div class="equipment-tags-row">
            <span class="tag-condition">⚙️ ${escapeHtml(item.condition)}</span>
            <span class="tag-condition">📍 ${escapeHtml(item.village)}, ${escapeHtml(item.district)}</span>
            ${item.driverIncluded === 'Yes' ? `<span class="tag-condition" style="background: #E8F8F5; color: #0E6251;">👨‍🌾 Driver Included</span>` : ''}
          </div>

          <h4 style="color: var(--color-forest); font-size: 1.1rem; font-weight: 800; margin: 4px 0 2px 0;">
            ${escapeHtml(item.name)}
          </h4>
          <div style="font-size: 0.82rem; color: var(--color-text-muted); margin-bottom: 8px;">
            Owner: <strong>${escapeHtml(item.ownerName)}</strong>
          </div>

          <div class="equipment-price-rate">
            ${formatINR(item.rate)} <small>/ ${unitLabel}</small>
          </div>

          <div class="equipment-specs-list">
            <div>ℹ️ ${escapeHtml(item.specs)}</div>
            <div>📅 Available from: <strong>${escapeHtml(item.availableDate || 'Today')}</strong></div>
          </div>

          <div style="margin-top: auto; display: flex; gap: 8px;">
            <button type="button" class="btn-primary" style="flex: 1; padding: 9px 12px; font-size: 0.88rem;" onclick="openBookingModal('${item.id}')">
              🚜 Book Equipment
            </button>
            <button type="button" class="btn-outline" style="padding: 9px 12px; font-size: 0.88rem;" onclick="inquireEquipmentDetails('${item.id}')">
              Details
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function resetMachineryFilters() {
  machFilterState.search = "";
  machFilterState.type = "all";
  machFilterState.district = "all";
  machFilterState.unit = "all";

  const searchInput = document.getElementById('machSearchInput');
  const typeFilter = document.getElementById('machTypeFilter');
  const districtFilter = document.getElementById('machDistrictFilter');
  const unitFilter = document.getElementById('machUnitFilter');

  if (searchInput) searchInput.value = "";
  if (typeFilter) typeFilter.value = "all";
  if (districtFilter) districtFilter.value = "all";
  if (unitFilter) unitFilter.value = "all";

  renderMachineryCatalog();
}

function inquireEquipmentDetails(machId) {
  const listings = getMachineryListings();
  const eq = listings.find(m => m.id === machId);
  if (!eq) return;

  alert(`🚜 ${eq.name}\n\n• Owner: ${eq.ownerName}\n• Location: ${eq.village}, ${eq.district}\n• Rental Rate: ₹${eq.rate} / ${eq.unit}\n• Condition: ${eq.condition}\n• Driver: ${eq.driverIncluded}\n• Specifications:\n${eq.specs}\n\nTo book this equipment, click "Book Equipment" to check dates and estimate charges.`);
}

// ----------------------------------------------------
// Booking Request Dialog & Cost Calculation
// ----------------------------------------------------
function openBookingModal(machId) {
  const listings = getMachineryListings();
  const eq = listings.find(m => m.id === machId);
  if (!eq) return;

  const hiddenId = document.getElementById('bookingEquipmentId');
  const banner = document.getElementById('bookingTargetEquipmentBanner');
  const hourlyGroup = document.getElementById('bookingHourlyInputGroup');
  const acreageGroup = document.getElementById('bookingAcreageInputGroup');

  if (hiddenId) hiddenId.value = eq.id;

  if (banner) {
    const typeIcon = getMachineryTypeIcon(eq.type);
    banner.innerHTML = `
      <div>
        <div style="font-size: 0.78rem; color: var(--color-text-muted);">Selected Machine:</div>
        <strong style="color: var(--color-forest); font-size: 1.05rem;">${typeIcon} ${escapeHtml(eq.name)}</strong>
        <div style="font-size: 0.82rem; margin-top: 2px;">
          📍 ${escapeHtml(eq.village)}, ${escapeHtml(eq.district)} • Owner: <strong>${escapeHtml(eq.ownerName)}</strong>
        </div>
      </div>
      <div style="text-align: right;">
        <span style="font-size: 1.15rem; font-weight: 800; color: var(--color-leaf);">${formatINR(eq.rate)}</span>
        <div style="font-size: 0.78rem; color: var(--color-text-muted);">per ${eq.unit}</div>
      </div>
    `;
  }

  // Unit-specific dynamic inputs
  if (hourlyGroup) hourlyGroup.style.display = (eq.unit === 'hour') ? 'block' : 'none';
  if (acreageGroup) acreageGroup.style.display = (eq.unit === 'acre') ? 'block' : 'none';

  if (typeof currentUser !== 'undefined' && currentUser) {
    const renterNameInput = document.getElementById('bookingRenterName');
    const renterPhoneInput = document.getElementById('bookingRenterPhone');
    const renterVillageInput = document.getElementById('bookingRenterVillage');
    if (renterNameInput && !renterNameInput.value) renterNameInput.value = currentUser.fullName || '';
    if (renterPhoneInput && !renterPhoneInput.value) renterPhoneInput.value = currentUser.phone || '';
    if (renterVillageInput && !renterVillageInput.value) renterVillageInput.value = currentUser.village || '';
  }

  initDefaultBookingDates();
  calculateBookingCostRealtime();

  openModal('machineryBookingModal');
}

// Overlapping Bookings Check Engine
function checkBookingOverlap(equipmentId, startDateStr, endDateStr, ignoreBookingId = null) {
  const bookings = getMachineryBookings();
  const reqStart = new Date(startDateStr).getTime();
  const reqEnd = new Date(endDateStr).getTime();

  for (const b of bookings) {
    // Only check accepted bookings on the same piece of equipment
    if (b.equipmentId === equipmentId && b.status === 'accepted') {
      if (ignoreBookingId && b.id === ignoreBookingId) continue;
      const bStart = new Date(b.startDate).getTime();
      const bEnd = new Date(b.endDate).getTime();

      // Interval overlap test: reqStart <= bEnd && bStart <= reqEnd
      if (reqStart <= bEnd && bStart <= reqEnd) {
        return {
          hasOverlap: true,
          conflictingBooking: b
        };
      }
    }
  }
  return { hasOverlap: false };
}

function calculateBookingCostRealtime() {
  const eqId = document.getElementById('bookingEquipmentId')?.value;
  const listings = getMachineryListings();
  const eq = listings.find(m => m.id === eqId);
  if (!eq) return;

  const startDateStr = document.getElementById('bookingStartDate')?.value;
  const endDateStr = document.getElementById('bookingEndDate')?.value;
  const rate = parseFloat(eq.rate) || 0;
  const unit = eq.unit || 'hour';

  let totalCost = 0;
  let durationDesc = "0";

  if (startDateStr && endDateStr) {
    const s = new Date(startDateStr);
    const e = new Date(endDateStr);

    if (e < s) {
      const alertBox = document.getElementById('bookingOverlapAlert');
      const submitBtn = document.getElementById('bookingSubmitBtn');
      if (alertBox) {
        alertBox.innerHTML = `⚠️ <strong>Invalid Dates:</strong> End date cannot be before start date.`;
        alertBox.style.display = 'block';
      }
      if (submitBtn) submitBtn.disabled = true;
      return;
    }

    if (unit === 'day') {
      const diffTime = e.getTime() - s.getTime();
      const days = Math.max(1, Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1);
      totalCost = days * rate;
      durationDesc = `${days} day${days > 1 ? 's' : ''}`;
    } else if (unit === 'hour') {
      const hours = parseFloat(document.getElementById('bookingHoursNeeded')?.value) || 0;
      totalCost = hours * rate;
      durationDesc = `${hours} operating hour${hours > 1 ? 's' : ''}`;
    } else if (unit === 'acre') {
      const acres = parseFloat(document.getElementById('bookingAcresNeeded')?.value) || 0;
      totalCost = acres * rate;
      durationDesc = `${acres} acre${acres > 1 ? 's' : ''}`;
    }

    // Check overlap with accepted bookings
    const overlapResult = checkBookingOverlap(eqId, startDateStr, endDateStr);
    const alertBox = document.getElementById('bookingOverlapAlert');
    const submitBtn = document.getElementById('bookingSubmitBtn');

    if (overlapResult.hasOverlap) {
      const conf = overlapResult.conflictingBooking;
      if (alertBox) {
        alertBox.innerHTML = `⚠️ <strong>Date Conflict:</strong> This equipment is already booked & confirmed from <strong>${conf.startDate}</strong> to <strong>${conf.endDate}</strong>. Please select alternate dates.`;
        alertBox.style.display = 'block';
      }
      if (submitBtn) submitBtn.disabled = true;
    } else {
      if (alertBox) alertBox.style.display = 'none';
      if (submitBtn) submitBtn.disabled = false;
    }
  }

  // Update UI Elements
  const rateEl = document.getElementById('costCalcRate');
  const durLabel = document.getElementById('costCalcDurationLabel');
  const durVal = document.getElementById('costCalcDurationValue');
  const totalEl = document.getElementById('costCalcTotal');

  if (rateEl) rateEl.innerText = `${formatINR(rate)} / ${unit}`;
  if (durLabel) durLabel.innerText = unit === 'day' ? 'Rental Days:' : (unit === 'hour' ? 'Operating Hours:' : 'Land Area:');
  if (durVal) durVal.innerText = durationDesc;
  if (totalEl) totalEl.innerText = formatINR(totalCost);
}

function handleConfirmBookingRequest(event) {
  event.preventDefault();

  const eqId = document.getElementById('bookingEquipmentId')?.value;
  const listings = getMachineryListings();
  const eq = listings.find(m => m.id === eqId);
  if (!eq) return;

  if (typeof currentUser !== 'undefined' && !currentUser) {
    closeModal('machineryBookingModal');
    requireAuth(() => {
      openBookingModal(eqId);
    }, null, "Please log in or create an account to submit a machinery rental booking request.");
    return;
  }

  const startDate = document.getElementById('bookingStartDate')?.value;
  const endDate = document.getElementById('bookingEndDate')?.value;
  const renterName = document.getElementById('bookingRenterName')?.value.trim();
  const renterPhone = document.getElementById('bookingRenterPhone')?.value.trim();
  const renterVillage = document.getElementById('bookingRenterVillage')?.value.trim();
  const renterMessage = document.getElementById('bookingRenterMessage')?.value.trim() || '';

  // Validation
  if (!startDate || !endDate) {
    alert("Please choose both start date and end date.");
    return;
  }

  const sDate = new Date(startDate);
  const eDate = new Date(endDate);
  if (eDate < sDate) {
    alert("End date cannot be earlier than start date.");
    return;
  }

  if (!renterName) {
    alert("Please enter your name.");
    return;
  }

  if (!renterPhone || renterPhone.replace(/\D/g, '').length < 10) {
    alert("Please enter a valid 10-digit mobile number.");
    return;
  }

  // Re-verify overlap before final submission
  const overlap = checkBookingOverlap(eqId, startDate, endDate);
  if (overlap.hasOverlap) {
    alert(`Conflict: This machinery was just confirmed by another farmer from ${overlap.conflictingBooking.startDate} to ${overlap.conflictingBooking.endDate}. Please choose different dates.`);
    return;
  }

  // Compute final estimated cost & quantity
  let unitQty = 1;
  let estimatedCost = 0;
  if (eq.unit === 'day') {
    const diff = eDate.getTime() - sDate.getTime();
    unitQty = Math.max(1, Math.round(diff / (1000 * 60 * 60 * 24)) + 1);
    estimatedCost = unitQty * eq.rate;
  } else if (eq.unit === 'hour') {
    unitQty = parseFloat(document.getElementById('bookingHoursNeeded')?.value) || 1;
    estimatedCost = unitQty * eq.rate;
  } else if (eq.unit === 'acre') {
    unitQty = parseFloat(document.getElementById('bookingAcresNeeded')?.value) || 1;
    estimatedCost = unitQty * eq.rate;
  }

  const newBooking = {
    id: `book_${Date.now()}`,
    equipmentId: eq.id,
    equipmentName: eq.name,
    equipmentType: eq.type,
    renterId: (typeof currentUser !== 'undefined' && currentUser) ? currentUser.id : null,
    renterName,
    renterPhone: renterPhone.replace(/\D/g, ''),
    renterVillage,
    startDate,
    endDate,
    unit: eq.unit,
    unitQuantity: unitQty,
    rate: eq.rate,
    estimatedCost,
    status: 'pending', // Starts as Pending
    message: renterMessage,
    ownerId: eq.ownerId || null,
    ownerPhone: eq.ownerPhone,
    ownerName: eq.ownerName,
    isDemo: false,
    isOutgoing: true, // Marked as farmer's outgoing request
    createdAt: new Date().toISOString()
  };

  const bookings = getMachineryBookings();
  bookings.unshift(newBooking);
  saveMachineryBookings(bookings);

  closeModal('machineryBookingModal');
  document.getElementById('machineryBookingDialogForm').reset();

  // Switch to Bookings tab and refresh
  switchMachineryTab('bookings');
  switchBookingSubtab('outgoing');
  updateMachineryBadges();

  showToast(`Rental request for ${eq.name} submitted! Status: Pending owner review.`, '🚜');
}

// ----------------------------------------------------
// Bookings Management & Status Transitions
// ----------------------------------------------------
function switchBookingSubtab(subtab) {
  activeBookingSubtab = subtab;
  const outBtn = document.getElementById('subtabFarmerBookingsBtn');
  const inBtn = document.getElementById('subtabOwnerBookingsBtn');

  if (outBtn) outBtn.className = (subtab === 'outgoing') ? 'btn-marketplace-primary' : 'btn-marketplace-secondary';
  if (inBtn) inBtn.className = (subtab === 'incoming') ? 'btn-marketplace-primary' : 'btn-marketplace-secondary';

  renderMachineryBookings();
}

function updateMachineryBadges() {
  const bookings = getMachineryBookings();
  const outgoingCount = bookings.filter(b => {
    if (typeof currentUser !== 'undefined' && currentUser) {
      return b.renterId === currentUser.id || b.isOutgoing;
    }
    return b.isOutgoing;
  }).length;
  const incomingCount = bookings.filter(b => {
    if (typeof currentUser !== 'undefined' && currentUser) {
      return b.ownerId === currentUser.id || (currentUser.phone && b.ownerPhone === currentUser.phone) || !b.isOutgoing;
    }
    return !b.isOutgoing;
  }).length;

  const mainBadge = document.getElementById('machBookingsBadge');
  const outBadge = document.getElementById('countOutgoingBookings');
  const inBadge = document.getElementById('countIncomingBookings');

  if (mainBadge) mainBadge.innerText = bookings.length;
  if (outBadge) outBadge.innerText = outgoingCount;
  if (inBadge) inBadge.innerText = incomingCount;
}

function renderMachineryBookings() {
  const container = document.getElementById('machineryBookingsListContainer');
  if (!container) return;

  const allBookings = getMachineryBookings();
  updateMachineryBadges();

  // Filter based on active subtab and logged-in user
  const bookings = allBookings.filter(b => {
    if (typeof currentUser !== 'undefined' && currentUser) {
      if (activeBookingSubtab === 'outgoing') {
        return b.renterId === currentUser.id || b.isOutgoing;
      } else {
        return b.ownerId === currentUser.id || (currentUser.phone && b.ownerPhone === currentUser.phone) || !b.isOutgoing;
      }
    }
    return activeBookingSubtab === 'outgoing' ? b.isOutgoing : !b.isOutgoing;
  });

  if (bookings.length === 0) {
    container.innerHTML = `
      <div class="empty-state-box">
        <div class="empty-state-icon">📋</div>
        <h4 style="color: var(--color-forest); font-size: 1.05rem; font-weight: 800; margin-bottom: 6px;">
          ${activeBookingSubtab === 'outgoing' ? 'No outgoing rental requests' : 'No incoming booking requests on your machinery'}
        </h4>
        <p style="color: var(--color-text-muted); font-size: 0.85rem;">
          ${activeBookingSubtab === 'outgoing'
            ? 'Browse machinery from the first tab and book equipment for your farm.'
            : 'When neighboring farmers request your listed equipment, their requests will appear here for you to accept or decline.'}
        </p>
      </div>
    `;
    return;
  }

  container.innerHTML = bookings.map(b => {
    let badgeClass = 'badge-pending';
    let statusLabel = '⏳ Pending Review';
    if (b.status === 'accepted') {
      badgeClass = 'badge-accepted';
      statusLabel = '✓ Accepted & Confirmed';
    } else if (b.status === 'declined') {
      badgeClass = 'badge-declined';
      statusLabel = '✕ Declined';
    } else if (b.status === 'cancelled') {
      badgeClass = 'badge-cancelled';
      statusLabel = '⊘ Cancelled';
    }

    const durationText = b.unit === 'day'
      ? `${b.unitQuantity} days (${b.startDate} to ${b.endDate})`
      : `${b.unitQuantity} ${b.unit}s (${b.startDate} to ${b.endDate})`;

    let actionButtonsHtml = '';
    let contactRevealHtml = '';

    if (activeBookingSubtab === 'incoming') {
      // Owner view
      if (b.status === 'pending') {
        actionButtonsHtml = `
          <div style="display: flex; gap: 8px; margin-top: 10px;">
            <button type="button" class="btn-primary" style="padding: 6px 14px; font-size: 0.82rem;" onclick="acceptMachineryBooking('${b.id}')">
              ✓ Accept Request
            </button>
            <button type="button" class="btn-remove-offer" style="padding: 6px 12px; font-size: 0.82rem;" onclick="declineMachineryBooking('${b.id}')">
              ✕ Decline
            </button>
          </div>
        `;
      } else if (b.status === 'accepted') {
        contactRevealHtml = `
          <div class="booking-contact-revealed">
            <strong>📞 Farmer Contact:</strong> ${b.renterPhone} • <strong>Farmer:</strong> ${escapeHtml(b.renterName)}<br>
            <small>✓ Call this farmer to confirm delivery time and plot directions.</small>
          </div>
        `;
      }
    } else {
      // Farmer view (Outgoing)
      if (b.status === 'pending') {
        actionButtonsHtml = `
          <div style="margin-top: 8px;">
            <button type="button" class="btn-remove-offer" onclick="cancelMachineryBooking('${b.id}')">
              ⊘ Cancel My Request
            </button>
          </div>
        `;
      } else if (b.status === 'accepted') {
        contactRevealHtml = `
          <div class="booking-contact-revealed">
            <strong>📞 Machinery Owner Contact:</strong> ${b.ownerPhone} • <strong>Owner:</strong> ${escapeHtml(b.ownerName)}<br>
            <small>✓ Booking confirmed! Call owner for operator dispatch and diesel/plot verification.</small>
          </div>
        `;
      }
    }

    return `
      <div class="booking-item-card">
        <div class="booking-item-header">
          <div>
            <strong style="color: var(--color-forest); font-size: 1.05rem;">🚜 ${escapeHtml(b.equipmentName)}</strong>
            <div style="font-size: 0.82rem; color: var(--color-text-muted); margin-top: 2px;">
              ${activeBookingSubtab === 'incoming' ? `Requester: <strong>${escapeHtml(b.renterName)}</strong> (📍 ${escapeHtml(b.renterVillage)})` : `Owner: <strong>${escapeHtml(b.ownerName)}</strong>`}
            </div>
          </div>
          <span class="booking-status-badge ${badgeClass}">${statusLabel}</span>
        </div>

        <div style="background: var(--color-ivory-light); padding: 10px 14px; border-radius: var(--radius-sm); font-size: 0.84rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
          <div>
            <div>📅 Schedule: <strong>${durationText}</strong></div>
            <div style="color: var(--color-text-muted); font-size: 0.78rem;">Rate: ${formatINR(b.rate)}/${b.unit}</div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 0.75rem; color: var(--color-text-muted);">Estimated Total:</div>
            <strong style="color: var(--color-leaf); font-size: 1.1rem;">${formatINR(b.estimatedCost)}</strong>
          </div>
        </div>

        ${b.message ? `<div style="font-size: 0.82rem; color: var(--color-forest); font-style: italic; background: #FFFDF8; padding: 6px 10px; border-radius: var(--radius-sm); border-left: 3px solid var(--color-gold);">"${escapeHtml(b.message)}"</div>` : ''}

        ${contactRevealHtml}
        ${actionButtonsHtml}
      </div>
    `;
  }).join('');
}

function acceptMachineryBooking(bookingId) {
  const bookings = getMachineryBookings();
  const booking = bookings.find(b => b.id === bookingId);
  if (!booking) return;

  // Re-check overlap before confirming acceptance
  const overlap = checkBookingOverlap(booking.equipmentId, booking.startDate, booking.endDate, booking.id);
  if (overlap.hasOverlap) {
    alert(`Cannot accept booking: This request conflicts with another accepted booking for ${booking.equipmentName} between ${overlap.conflictingBooking.startDate} and ${overlap.conflictingBooking.endDate}. Please decline or reschedule.`);
    return;
  }

  booking.status = 'accepted';
  saveMachineryBookings(bookings);

  renderMachineryBookings();
  showToast(`Booking for ${booking.equipmentName} accepted! Contact details shared.`, '🤝');
}

function declineMachineryBooking(bookingId) {
  const bookings = getMachineryBookings();
  const booking = bookings.find(b => b.id === bookingId);
  if (!booking) return;

  booking.status = 'declined';
  saveMachineryBookings(bookings);

  renderMachineryBookings();
  showToast("Booking request declined.", 'ℹ️');
}

function cancelMachineryBooking(bookingId) {
  const bookings = getMachineryBookings();
  const booking = bookings.find(b => b.id === bookingId);
  if (!booking) return;

  booking.status = 'cancelled';
  saveMachineryBookings(bookings);

  renderMachineryBookings();
  showToast("Your booking request has been cancelled.", 'ℹ️');
}

// ----------------------------------------------------
// Owner Equipment Management (Add, Edit, Toggle)
// ----------------------------------------------------
function handleMachineryPhotoUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    uploadedMachineryPhotoBase64 = e.target.result;
    const preview = document.getElementById('machPhotoPreview');
    const img = document.getElementById('machPhotoPreviewImg');
    if (preview && img) {
      img.src = uploadedMachineryPhotoBase64;
      preview.style.display = 'block';
    }
  };
  reader.readAsDataURL(file);
}

function handleNewMachineryListing(event) {
  event.preventDefault();

  if (typeof currentUser !== 'undefined' && !currentUser) {
    requireAuth(() => {
      switchMachineryTab('list');
      showToast("Signed in! You can now publish your machinery.", "🚜");
    }, 'owner', "Please log in with a Machinery Owner account to list agricultural equipment.");
    return;
  }

  if (typeof currentUser !== 'undefined' && currentUser && currentUser.role !== 'owner' && currentUser.secondaryRole !== 'owner') {
    alert("⚠️ Only registered Machinery Owners can publish equipment for rent. Please switch to an Owner account or add equipment owner permissions in your profile.");
    return;
  }

  const name = document.getElementById('machNewName')?.value.trim();
  const type = document.getElementById('machNewType')?.value;
  const rate = parseFloat(document.getElementById('machNewRate')?.value);
  const unit = document.getElementById('machNewUnit')?.value;
  const condition = document.getElementById('machNewCondition')?.value;
  const driverIncluded = document.getElementById('machNewDriver')?.value;
  const village = document.getElementById('machNewVillage')?.value.trim();
  const district = document.getElementById('machNewDistrict')?.value;
  const desc = document.getElementById('machNewDesc')?.value.trim();
  const availableDate = document.getElementById('machNewAvailableDate')?.value;
  const ownerName = document.getElementById('machNewOwnerName')?.value.trim();
  const ownerPhone = document.getElementById('machNewOwnerPhone')?.value.trim();

  if (!name || !village || !ownerName) {
    alert("Please fill in all required fields.");
    return;
  }
  if (isNaN(rate) || rate <= 0) {
    alert("Please enter a valid rental price greater than 0.");
    return;
  }
  if (!ownerPhone || ownerPhone.replace(/\D/g, '').length < 10) {
    alert("Please enter a valid 10-digit owner contact mobile number.");
    return;
  }

  const newEquip = {
    id: `mach_user_${Date.now()}`,
    ownerId: (typeof currentUser !== 'undefined' && currentUser) ? currentUser.id : null,
    name,
    type,
    rate,
    unit,
    condition,
    driverIncluded,
    village,
    district,
    specs: desc,
    availableDate,
    ownerName,
    ownerPhone: ownerPhone.replace(/\D/g, ''),
    imageUrl: uploadedMachineryPhotoBase64 || '',
    status: 'available',
    isDemo: false,
    isOwner: true,
    createdAt: new Date().toISOString()
  };

  const listings = getMachineryListings();
  listings.unshift(newEquip);
  saveMachineryListings(listings);

  // Reset form
  document.getElementById('listMachineryForm').reset();
  uploadedMachineryPhotoBase64 = '';
  const preview = document.getElementById('machPhotoPreview');
  if (preview) preview.style.display = 'none';

  switchMachineryTab('browse');
  showToast(`Your machinery "${name}" has been published for rent!`, '🚜');
}

function renderMyEquipmentListings() {
  const container = document.getElementById('myEquipmentListingsContainer');
  if (!container) return;

  const listings = getMachineryListings();
  // Filter user-owned machinery or machinery matching logged-in owner
  const myEquip = listings.filter(m => m.isOwner || (typeof currentUser !== 'undefined' && currentUser && m.ownerId === currentUser.id));

  if (myEquip.length === 0) {
    container.innerHTML = `
      <div class="empty-state-box">
        <div class="empty-state-icon">🚜</div>
        <h4 style="color: var(--color-forest); font-size: 1.05rem; font-weight: 800; margin-bottom: 6px;">No equipment listed yet</h4>
        <p style="color: var(--color-text-muted); font-size: 0.85rem;">Have a tractor, rotavator, or pump? Click "Add Equipment" above to list your machine and earn daily rental revenue.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = myEquip.map(eq => {
    let statusClass = 'tag-avail-available';
    let statusText = '✓ Available Now';
    if (eq.status === 'booked') {
      statusClass = 'tag-avail-booked';
      statusText = '⏳ Booked';
    } else if (eq.status === 'maintenance') {
      statusClass = 'tag-avail-maintenance';
      statusText = '🔧 In Maintenance';
    }

    return `
      <div style="background: #FFFFFF; border: 1.5px solid var(--color-border); border-radius: var(--radius-md); padding: 16px 18px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
        <div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <strong style="color: var(--color-forest); font-size: 1.05rem;">${escapeHtml(eq.name)}</strong>
            <span class="${statusClass}">${statusText}</span>
          </div>
          <div style="font-size: 0.82rem; color: var(--color-text-muted); margin-top: 3px;">
            Rate: <strong>${formatINR(eq.rate)} / ${eq.unit}</strong> • Location: ${escapeHtml(eq.village)}, ${escapeHtml(eq.district)} • Condition: ${escapeHtml(eq.condition)}
          </div>
        </div>

        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          <button type="button" class="btn-outline" style="padding: 6px 12px; font-size: 0.82rem;" onclick="toggleEquipmentAvailability('${eq.id}')">
            🔄 Toggle Availability
          </button>
          <button type="button" class="btn-primary" style="padding: 6px 12px; font-size: 0.82rem;" onclick="openEditMachineryModal('${eq.id}')">
            ✏️ Edit Listing
          </button>
          <button type="button" class="btn-remove-offer" onclick="deleteMachineryListing('${eq.id}')">
            🗑️ Delete
          </button>
        </div>
      </div>
    `;
  }).join('');
}

function toggleEquipmentAvailability(machId) {
  const listings = getMachineryListings();
  const eq = listings.find(m => m.id === machId);
  if (!eq) return;

  if (eq.status === 'available') {
    eq.status = 'booked';
  } else if (eq.status === 'booked') {
    eq.status = 'maintenance';
  } else {
    eq.status = 'available';
  }

  saveMachineryListings(listings);
  renderMyEquipmentListings();
  renderMachineryCatalog();
  showToast(`Status updated to "${eq.status}"`, '🔄');
}

function openEditMachineryModal(machId) {
  const listings = getMachineryListings();
  const eq = listings.find(m => m.id === machId);
  if (!eq) return;

  const idEl = document.getElementById('editMachId');
  const nameEl = document.getElementById('editMachName');
  const rateEl = document.getElementById('editMachRate');
  const unitEl = document.getElementById('editMachUnit');
  const statusEl = document.getElementById('editMachStatus');
  const condEl = document.getElementById('editMachCondition');
  const descEl = document.getElementById('editMachDesc');

  if (idEl) idEl.value = eq.id;
  if (nameEl) nameEl.value = eq.name;
  if (rateEl) rateEl.value = eq.rate;
  if (unitEl) unitEl.value = eq.unit;
  if (statusEl) statusEl.value = eq.status;
  if (condEl) condEl.value = eq.condition;
  if (descEl) descEl.value = eq.specs;

  openModal('editMachineryModal');
}

function handleSaveEditedMachinery(event) {
  event.preventDefault();

  const machId = document.getElementById('editMachId')?.value;
  const listings = getMachineryListings();
  const eq = listings.find(m => m.id === machId);
  if (!eq) return;

  eq.name = document.getElementById('editMachName')?.value.trim();
  eq.rate = parseFloat(document.getElementById('editMachRate')?.value);
  eq.unit = document.getElementById('editMachUnit')?.value;
  eq.status = document.getElementById('editMachStatus')?.value;
  eq.condition = document.getElementById('editMachCondition')?.value;
  eq.specs = document.getElementById('editMachDesc')?.value.trim();

  saveMachineryListings(listings);
  closeModal('editMachineryModal');

  renderMyEquipmentListings();
  renderMachineryCatalog();
  showToast("Equipment listing updated successfully!", '💾');
}

function deleteMachineryListing(machId) {
  if (confirm("Are you sure you want to delete this equipment listing?")) {
    let listings = getMachineryListings();
    listings = listings.filter(m => m.id !== machId);
    saveMachineryListings(listings);

    renderMyEquipmentListings();
    renderMachineryCatalog();
    showToast("Equipment listing removed.", '🗑️');
  }
}

// ----------------------------------------------------
// Backward Compatibility Handlers for Legacy Links
// ----------------------------------------------------
function initDefaultDate() {
  initDefaultBookingDates();
}

function requestBooking(equipmentName) {
  const listings = getMachineryListings();
  const matched = listings.find(m => m.name.toLowerCase().includes(equipmentName.toLowerCase()));
  if (matched) {
    openBookingModal(matched.id);
  } else if (listings.length > 0) {
    openBookingModal(listings[0].id);
  }
}

function handleMachineryBooking(event) {
  if (event) event.preventDefault();
  openModal('machineryModal');
}

function initMachineryBookings() {
  initMachineryMarketplace();
}

// ----------------------------------------------------
// 4. Crop Selling & Listings
// ----------------------------------------------------
const defaultCropListings = [
  { id: 1, name: "Tomato (ಹೈಬ್ರಿಡ್ ಟೊಮೆಟೊ)", variety: "Grade A", qty: "40 Quintals", price: "₹2,400/Qtl", location: "Kolar, Karnataka", phone: "9845012345" },
  { id: 2, name: "Ragi (ರಾಗಿ)", variety: "Organic Brown", qty: "25 Quintals", price: "₹3,600/Qtl", location: "Mandya, Karnataka", phone: "9448011223" },
  { id: 3, name: "Sona Masoori Paddy (ಭತ್ತ)", variety: "Raw Premium", qty: "100 Quintals", price: "₹2,850/Qtl", location: "Shimoga, Karnataka", phone: "9900122334" }
];

function initCropListings() {
  const saved = localStorage.getItem('krishi_crop_listings');
  if (!saved) {
    localStorage.setItem('krishi_crop_listings', JSON.stringify(defaultCropListings));
  }
  renderCropListings();
}

function renderCropListings() {
  const container = document.getElementById('cropListingsContainer');
  if (!container) return;

  const listings = JSON.parse(localStorage.getItem('krishi_crop_listings') || '[]');
  if (listings.length === 0) {
    container.innerHTML = `<p style="color: var(--color-text-muted); font-size: 0.9rem;">No active listings. Be the first to post your harvest!</p>`;
    return;
  }

  container.innerHTML = listings.map(item => `
    <div style="background: var(--color-ivory-light); border: 1px solid var(--color-border); border-radius: var(--radius-sm); padding: 12px 14px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
      <div>
        <strong style="color: var(--color-forest);">${item.name} (${item.variety})</strong>
        <div style="font-size: 0.82rem; color: var(--color-text-muted); margin-top: 2px;">
          📦 ${item.qty} • 📍 ${item.location} • 💰 <span style="color: var(--color-leaf); font-weight: 700;">${item.price}</span>
        </div>
      </div>
      <button class="btn-gold" style="font-size: 0.82rem; padding: 6px 12px;" onclick="contactBuyer('${item.name}', '${item.phone}')">
        📞 Contact Farmer
      </button>
    </div>
  `).join('');
}

function handleCropListing(event) {
  event.preventDefault();
  const name = document.getElementById('cropName').value.trim();
  const variety = document.getElementById('cropVariety').value.trim();
  const qty = document.getElementById('cropQuantity').value;
  const price = document.getElementById('cropPrice').value;
  const location = document.getElementById('cropLocation').value.trim();
  const phone = document.getElementById('cropPhone').value.trim();

  if (!phone || phone.length < 10) {
    alert("Please enter a valid 10-digit mobile number.");
    return;
  }

  const listings = JSON.parse(localStorage.getItem('krishi_crop_listings') || '[]');
  const newListing = {
    id: Date.now(),
    name,
    variety,
    qty: `${qty} Quintals`,
    price: `₹${Number(price).toLocaleString('en-IN')}/Qtl`,
    location,
    phone
  };

  listings.unshift(newListing);
  localStorage.setItem('krishi_crop_listings', JSON.stringify(listings));

  renderCropListings();
  document.getElementById('cropListingForm').reset();
  showToast(`Your listing for ${name} has been published!`, '🌾');
}

// ----------------------------------------------------
// 5. Profit Calculator & Buyer Offer Comparison Engine
// ----------------------------------------------------

const cropPresetsData = {
  paddy: {
    name: "Sona Masoori Paddy (ಭತ್ತ)",
    qty: 80,
    unit: "Quintal",
    price: 2850,
    seeds: 13000,
    fertilizer: 18000,
    labor: 24000,
    irrigation: 5000,
    machinery: 14000,
    transport: 4500,
    packaging: 2500,
    other: 3000
  },
  tomato: {
    name: "Hybrid Red Tomato (ಟೊಮೆಟೊ)",
    qty: 180,
    unit: "Quintal",
    price: 2200,
    seeds: 16000,
    fertilizer: 28000,
    labor: 35000,
    irrigation: 8000,
    machinery: 12000,
    transport: 9000,
    packaging: 7000,
    other: 4000
  },
  ragi: {
    name: "Organic Ragi / Finger Millet (ರಾಗಿ)",
    qty: 30,
    unit: "Quintal",
    price: 3600,
    seeds: 6000,
    fertilizer: 9000,
    labor: 16000,
    irrigation: 3000,
    machinery: 11000,
    transport: 2500,
    packaging: 1500,
    other: 2000
  },
  maize: {
    name: "Yellow Hybrid Maize (ಮೆಕ್ಕೆಜೋಳ)",
    qty: 150,
    unit: "Quintal",
    price: 2150,
    seeds: 12000,
    fertilizer: 20000,
    labor: 22000,
    irrigation: 6000,
    machinery: 18000,
    transport: 7500,
    packaging: 3500,
    other: 3000
  },
  sugarcane: {
    name: "Co-86032 Commercial Sugarcane (ಕಬ್ಬು)",
    qty: 75,
    unit: "Tonne",
    price: 3100,
    seeds: 25000,
    fertilizer: 36000,
    labor: 45000,
    irrigation: 15000,
    machinery: 28000,
    transport: 18000,
    packaging: 0,
    other: 5000
  }
};

// Initial realistic sample buyer offers
const initialSampleOffers = [
  {
    id: "offer_sample_1",
    buyerName: "Sri Lakshmi Modern Rice Mill",
    price: 2800,
    qty: 80,
    transportCost: 0, // Mill sends truck directly to farm
    otherCost: 500,   // Unloading & weighbridge verification slip
    note: "Mill provides free farm-gate truck pickup."
  },
  {
    id: "offer_sample_2",
    buyerName: "Apex Grain Exporters Ltd",
    price: 2950,
    qty: 80,
    transportCost: 8000, // Farmer pays freight to Davanagere rail siding
    otherCost: 2000,     // Transit insurance & bag tagging
    note: "Higher quoted rate but requires farmer transport."
  },
  {
    id: "offer_sample_3",
    buyerName: "Local Taluk Mandi Trader Agent",
    price: 2750,
    qty: 80,
    transportCost: 2500, // Transport to local taluk mandi yard
    otherCost: 4000,     // APMC market fee + hamali handling
    note: "Immediate cash settlement after mandi auction."
  }
];

// Helper: Format INR Currency
function formatINR(val) {
  if (val === null || val === undefined || isNaN(val)) return '₹0';
  const isNegative = val < 0;
  const absVal = Math.round(Math.abs(val));
  const formatted = absVal.toLocaleString('en-IN');
  return isNegative ? `-₹${formatted}` : `₹${formatted}`;
}

// ----------------------------------------------------
// Profit Calculator Initialization & Real-Time Math
// ----------------------------------------------------
function initProfitCalculator() {
  updateCalculatorImportDropdown();
  initBuyerOffersState();
  calculateProfitRealtime();
  renderSavedScenarios();
}

function updateCalculatorImportDropdown() {
  const select = document.getElementById('importFromListingSelect');
  if (!select) return;

  const listings = JSON.parse(localStorage.getItem('krishi_marketplace_listings') || '[]');
  const currentValue = select.value;

  select.innerHTML = `<option value="">-- Active Marketplace Crop --</option>` +
    listings.map(item => `
      <option value="${escapeHtml(item.id)}">${escapeHtml(item.name)} (${item.quantity} ${item.unit || 'Qtl'})</option>
    `).join('');

  if (currentValue) select.value = currentValue;
}

function importListingIntoCalculator(cropId) {
  if (!cropId) return;
  const listings = JSON.parse(localStorage.getItem('krishi_marketplace_listings') || '[]');
  const crop = listings.find(c => c.id === cropId);
  if (!crop) return;

  const nameEl = document.getElementById('calcCropName');
  const qtyEl = document.getElementById('calcHarvestedQty');
  const unitEl = document.getElementById('calcQuantityUnit');
  const priceEl = document.getElementById('calcSellingPrice');

  if (nameEl) nameEl.value = crop.name;
  if (qtyEl) qtyEl.value = crop.quantity || 50;
  if (unitEl) unitEl.value = crop.unit || 'Quintal';
  if (priceEl) priceEl.value = crop.price || 2000;

  calculateProfitRealtime();
  showToast(`Loaded ${crop.name} details into calculator!`, '🌾');
}

function applyCropPreset(presetKey) {
  const preset = cropPresetsData[presetKey] || cropPresetsData.paddy;

  const nameEl = document.getElementById('calcCropName');
  const qtyEl = document.getElementById('calcHarvestedQty');
  const unitEl = document.getElementById('calcQuantityUnit');
  const priceEl = document.getElementById('calcSellingPrice');

  const seedsEl = document.getElementById('calcCostSeeds');
  const fertEl = document.getElementById('calcCostFertilizer');
  const laborEl = document.getElementById('calcCostLabor');
  const irrigEl = document.getElementById('calcCostIrrigation');
  const machEl = document.getElementById('calcCostMachinery');
  const transEl = document.getElementById('calcCostTransport');
  const packEl = document.getElementById('calcCostPackaging');
  const otherEl = document.getElementById('calcCostOther');

  if (nameEl) nameEl.value = preset.name;
  if (qtyEl) qtyEl.value = preset.qty;
  if (unitEl) unitEl.value = preset.unit;
  if (priceEl) priceEl.value = preset.price;

  if (seedsEl) seedsEl.value = preset.seeds;
  if (fertEl) fertEl.value = preset.fertilizer;
  if (laborEl) laborEl.value = preset.labor;
  if (irrigEl) irrigEl.value = preset.irrigation;
  if (machEl) machEl.value = preset.machinery;
  if (transEl) transEl.value = preset.transport;
  if (packEl) packEl.value = preset.packaging;
  if (otherEl) otherEl.value = preset.other;

  calculateProfitRealtime();
  showToast(`Applied preset for ${preset.name}`, '🌱');
}

function calculateProfitRealtime() {
  const cropNameInput = document.getElementById('calcCropName');
  const qtyInput = document.getElementById('calcHarvestedQty');
  const unitSelect = document.getElementById('calcQuantityUnit');
  const priceInput = document.getElementById('calcSellingPrice');

  if (!cropNameInput || !qtyInput || !unitSelect || !priceInput) return;

  const cropName = cropNameInput.value.trim() || 'Produce';
  const qty = parseFloat(qtyInput.value);
  const unit = unitSelect.value || 'Quintal';
  const unitAbbr = unit === 'Quintal' ? 'Qtl' : (unit === 'Tonne' ? 'Tonne' : 'kg');
  const sellingPrice = parseFloat(priceInput.value);

  // 8 Expense categories
  const seedsCost = parseFloat(document.getElementById('calcCostSeeds')?.value) || 0;
  const fertCost = parseFloat(document.getElementById('calcCostFertilizer')?.value) || 0;
  const laborCost = parseFloat(document.getElementById('calcCostLabor')?.value) || 0;
  const irrigCost = parseFloat(document.getElementById('calcCostIrrigation')?.value) || 0;
  const machCost = parseFloat(document.getElementById('calcCostMachinery')?.value) || 0;
  const transCost = parseFloat(document.getElementById('calcCostTransport')?.value) || 0;
  const packCost = parseFloat(document.getElementById('calcCostPackaging')?.value) || 0;
  const otherCost = parseFloat(document.getElementById('calcCostOther')?.value) || 0;

  const alertBox = document.getElementById('calcValidationAlert');

  // Input Validation: non-negative numbers and positive quantity required
  if (isNaN(qty) || qty <= 0) {
    if (alertBox) {
      alertBox.innerText = "⚠️ Harvested quantity must be a valid positive number greater than 0.";
      alertBox.style.display = 'block';
    }
    return;
  }

  const allAmounts = [sellingPrice, seedsCost, fertCost, laborCost, irrigCost, machCost, transCost, packCost, otherCost];
  if (allAmounts.some(val => isNaN(val) || val < 0)) {
    if (alertBox) {
      alertBox.innerText = "⚠️ Price and expense amounts must be valid non-negative numbers (0 or higher).";
      alertBox.style.display = 'block';
    }
    return;
  }

  if (alertBox) alertBox.style.display = 'none';

  // Math computations
  const totalRevenue = qty * sellingPrice;
  const totalExpenses = seedsCost + fertCost + laborCost + irrigCost + machCost + transCost + packCost + otherCost;
  const netProfit = totalRevenue - totalExpenses;
  const profitPerUnit = qty > 0 ? (netProfit / qty) : 0;
  const profitMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100) : 0;
  const breakEvenPrice = qty > 0 ? (totalExpenses / qty) : 0;

  // Update Summary Badge
  const summaryBadge = document.getElementById('calcCropSummaryBadge');
  if (summaryBadge) {
    summaryBadge.innerText = `${qty} ${unit} • ${cropName}`;
  }

  // Update Result Metrics
  const grossRevEl = document.getElementById('resGrossRevenue');
  const totalCostEl = document.getElementById('resTotalCost');
  const netProfitEl = document.getElementById('resNetProfit');
  const profitUnitEl = document.getElementById('resProfitPerUnit');
  const marginEl = document.getElementById('resProfitMargin');
  const breakEvenEl = document.getElementById('resBreakEvenPrice');

  if (grossRevEl) grossRevEl.innerText = formatINR(totalRevenue);
  if (totalCostEl) totalCostEl.innerText = formatINR(totalExpenses);

  if (netProfitEl) {
    netProfitEl.innerText = formatINR(netProfit);
    netProfitEl.className = netProfit >= 0 ? 'metric-value positive' : 'metric-value loss';
  }

  if (profitUnitEl) {
    profitUnitEl.innerText = `${formatINR(profitPerUnit)}/${unitAbbr}`;
    profitUnitEl.className = profitPerUnit >= 0 ? 'metric-value positive' : 'metric-value loss';
  }

  if (marginEl) {
    marginEl.innerText = `${profitMargin.toFixed(1)}%`;
    marginEl.className = profitMargin >= 0 ? 'metric-value positive' : 'metric-value loss';
  }

  if (breakEvenEl) {
    breakEvenEl.innerText = `${formatINR(breakEvenPrice)}/${unitAbbr}`;
  }

  // Profit / Loss Visual Banner
  const profitBanner = document.getElementById('profitBanner');
  const bannerTitle = document.getElementById('profitBannerTitle');
  const bannerSub = document.getElementById('profitBannerSub');

  if (profitBanner && bannerTitle && bannerSub) {
    if (netProfit >= 0) {
      profitBanner.className = 'profit-summary-banner profit-banner-gain';
      bannerTitle.innerText = `🎉 Estimated Net Profit: ${formatINR(netProfit)}`;
      bannerSub.innerText = `You are earning approximately ${formatINR(profitPerUnit)} per ${unitAbbr} above total itemized cultivation expenses.`;
    } else {
      profitBanner.className = 'profit-summary-banner profit-banner-loss';
      bannerTitle.innerText = `⚠️ Estimated Net Loss: ${formatINR(Math.abs(netProfit))}`;
      bannerSub.innerText = `Total production expenses exceed revenue. You need at least ${formatINR(breakEvenPrice)} per ${unitAbbr} to cover expenses.`;
    }
  }

  // Farmer Advisory Note
  const adviceBox = document.getElementById('calcAdviceBox');
  if (adviceBox) {
    if (netProfit >= 0) {
      adviceBox.innerHTML = `💡 <strong>KrishiSetu Advisory:</strong> At the selling price of <strong>${formatINR(sellingPrice)}/${unitAbbr}</strong>, your estimated margin is <strong>${profitMargin.toFixed(1)}%</strong> with a break-even cost of <strong>${formatINR(breakEvenPrice)}/${unitAbbr}</strong>. Switch to the <em>Compare Buyer Offers</em> tab to see which buyer gives you the highest net payout after transport and mandi deductions!`;
    } else {
      adviceBox.innerHTML = `⚠️ <strong>KrishiSetu Advisory:</strong> At this price, total costs (${formatINR(totalExpenses)}) exceed revenue. Your minimum break-even price is <strong>${formatINR(breakEvenPrice)}/${unitAbbr}</strong>. Consider exploring direct bulk buyers or optimizing machinery rentals to reduce operational costs.`;
    }
  }

  // Update Baseline in Buyer Offer Comparison Tab
  const baselineCropEl = document.getElementById('offerBaselineCrop');
  const baselinePriceEl = document.getElementById('offerBaselinePrice');
  const baselineCostEl = document.getElementById('offerBaselineCost');

  if (baselineCropEl) baselineCropEl.innerText = `${cropName} (${qty} ${unit})`;
  if (baselinePriceEl) baselinePriceEl.innerText = `${formatINR(sellingPrice)} / ${unit}`;
  if (baselineCostEl) baselineCostEl.innerText = `${formatINR(breakEvenPrice)} / ${unit}`;

  // If Buyer Offers Tab is visible or offers exist, recalculate offer comparisons
  renderBuyerOffers();
}

// ----------------------------------------------------
// Tab Switching within Calculator Modal
// ----------------------------------------------------
function switchCalcTab(tabName) {
  const tabs = ['profit', 'offers', 'saved'];
  tabs.forEach(t => {
    const btn = document.getElementById(`calcTab${capitalize(t)}Btn`);
    const pane = document.getElementById(`calcTab${capitalize(t)}`);
    if (btn) btn.classList.toggle('active', t === tabName);
    if (pane) pane.style.display = (t === tabName) ? 'block' : 'none';
  });

  if (tabName === 'offers') {
    renderBuyerOffers();
  } else if (tabName === 'saved') {
    renderSavedScenarios();
  }
}

function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ----------------------------------------------------
// Buyer Offer Comparison State & Engine
// ----------------------------------------------------
function initBuyerOffersState() {
  const savedOffers = localStorage.getItem('krishi_buyer_offers');
  if (!savedOffers) {
    localStorage.setItem('krishi_buyer_offers', JSON.stringify(initialSampleOffers));
  }
}

function getBuyerOffers() {
  try {
    return JSON.parse(localStorage.getItem('krishi_buyer_offers') || '[]');
  } catch (e) {
    return [];
  }
}

function saveBuyerOffers(offers) {
  localStorage.setItem('krishi_buyer_offers', JSON.stringify(offers));
}

function renderBuyerOffers() {
  const container = document.getElementById('offersListContainer');
  const tableWrapper = document.getElementById('offersTableWrapper');
  const tableBody = document.getElementById('offersTableBody');
  const countBadge = document.getElementById('buyerOffersCountBadge');
  const countLabel = document.getElementById('offersCountLabel');

  if (!container) return;

  const offers = getBuyerOffers();

  if (countBadge) countBadge.innerText = offers.length;
  if (countLabel) countLabel.innerText = `Comparing ${offers.length} buyer ${offers.length === 1 ? 'offer' : 'offers'}`;

  if (offers.length === 0) {
    container.innerHTML = `
      <div class="empty-state-box">
        <div class="empty-state-icon">🤝</div>
        <h4 style="color: var(--color-forest); font-size: 1.05rem; font-weight: 800; margin-bottom: 6px;">No buyer offers added yet</h4>
        <p style="color: var(--color-text-muted); font-size: 0.85rem;">Use the form above to add an offer, or click "Import from Marketplace Enquiries" to automatically load incoming buyer bids.</p>
      </div>
    `;
    if (tableWrapper) tableWrapper.style.display = 'none';
    return;
  }

  // Calculate net proceeds for each offer
  const computedOffers = offers.map(o => {
    const grossValue = (parseFloat(o.price) || 0) * (parseFloat(o.qty) || 0);
    const transport = parseFloat(o.transportCost) || 0;
    const other = parseFloat(o.otherCost) || 0;
    const totalDeductions = transport + other;
    const netProceeds = grossValue - totalDeductions;
    const effectivePrice = o.qty > 0 ? (netProceeds / o.qty) : 0;
    return {
      ...o,
      grossValue,
      transport,
      other,
      totalDeductions,
      netProceeds,
      effectivePrice
    };
  });

  // Find highest net proceeds
  const maxNetProceeds = Math.max(...computedOffers.map(o => o.netProceeds));

  // Render cards
  container.innerHTML = computedOffers.map(offer => {
    const isBest = offer.netProceeds === maxNetProceeds && computedOffers.length > 1;

    return `
      <div class="offer-comparison-card ${isBest ? 'best-offer' : ''}">
        ${isBest ? `<div class="best-offer-ribbon">⭐ Highest Estimated Net Proceeds</div>` : ''}

        <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 8px;">
          <div>
            <h4 style="color: var(--color-forest); margin: 0; font-size: 1.1rem; font-weight: 800;">
              ${escapeHtml(offer.buyerName)}
            </h4>
            <div style="font-size: 0.82rem; color: var(--color-text-muted); margin-top: 3px;">
              Quoted: <strong style="color: var(--color-forest);">${formatINR(offer.price)} / unit</strong> • Quantity: <strong>${offer.qty} units</strong>
              ${offer.note ? ` • <em>${escapeHtml(offer.note)}</em>` : ''}
            </div>
          </div>
          <button type="button" class="btn-remove-offer" onclick="removeBuyerOffer('${offer.id}')">
            ✕ Remove
          </button>
        </div>

        <div class="offer-metrics-grid">
          <div>
            <div style="font-size: 0.72rem; color: var(--color-text-muted); text-transform: uppercase;">Gross Value</div>
            <strong style="color: var(--color-forest); font-size: 0.95rem;">${formatINR(offer.grossValue)}</strong>
          </div>
          <div>
            <div style="font-size: 0.72rem; color: var(--color-text-muted); text-transform: uppercase;">Transport Cost</div>
            <strong style="color: ${offer.transport > 0 ? '#C0392B' : 'var(--color-leaf)'}; font-size: 0.95rem;">
              ${offer.transport > 0 ? `-${formatINR(offer.transport)}` : '₹0 (Free Pickup)'}
            </strong>
          </div>
          <div>
            <div style="font-size: 0.72rem; color: var(--color-text-muted); text-transform: uppercase;">Other Deductions</div>
            <strong style="color: ${offer.other > 0 ? '#C0392B' : 'var(--color-text-muted)'}; font-size: 0.95rem;">
              ${offer.other > 0 ? `-${formatINR(offer.other)}` : '₹0'}
            </strong>
          </div>
          <div>
            <div style="font-size: 0.72rem; color: var(--color-text-muted); text-transform: uppercase;">Net Proceeds</div>
            <strong style="color: var(--color-leaf); font-size: 1.05rem; font-weight: 800;">${formatINR(offer.netProceeds)}</strong>
          </div>
          <div>
            <div style="font-size: 0.72rem; color: var(--color-text-muted); text-transform: uppercase;">Effective Rate</div>
            <strong style="color: var(--color-forest); font-size: 0.95rem;">${formatINR(offer.effectivePrice)}/unit</strong>
          </div>
        </div>
      </div>
    `;
  }).join('');

  // Render Table
  if (tableWrapper && tableBody) {
    tableWrapper.style.display = 'block';
    tableBody.innerHTML = computedOffers.map(offer => {
      const isBest = offer.netProceeds === maxNetProceeds && computedOffers.length > 1;
      return `
        <tr class="${isBest ? 'highlight-best' : ''}">
          <td>
            <strong>${escapeHtml(offer.buyerName)}</strong>
            ${isBest ? ' <span style="color: var(--color-leaf); font-size: 0.75rem;">(Top Net)</span>' : ''}
          </td>
          <td>${formatINR(offer.price)}</td>
          <td>${offer.qty}</td>
          <td>${formatINR(offer.grossValue)}</td>
          <td style="color: ${offer.totalDeductions > 0 ? '#C0392B' : 'var(--color-leaf)'};">
            ${offer.totalDeductions > 0 ? `-${formatINR(offer.totalDeductions)}` : '₹0'}
          </td>
          <td><strong style="color: var(--color-leaf);">${formatINR(offer.netProceeds)}</strong></td>
          <td><strong>${formatINR(offer.effectivePrice)}</strong></td>
          <td>
            <button type="button" class="btn-remove-offer" onclick="removeBuyerOffer('${offer.id}')">✕</button>
          </td>
        </tr>
      `;
    }).join('');
  }
}

function handleAddNewBuyerOffer(event) {
  event.preventDefault();

  const nameInput = document.getElementById('offerBuyerName');
  const priceInput = document.getElementById('offerPrice');
  const qtyInput = document.getElementById('offerQty');
  const transportInput = document.getElementById('offerTransport');
  const otherInput = document.getElementById('offerOtherCost');

  const buyerName = nameInput.value.trim();
  const price = parseFloat(priceInput.value);
  const qty = parseFloat(qtyInput.value);
  const transportCost = parseFloat(transportInput.value) || 0;
  const otherCost = parseFloat(otherInput.value) || 0;

  if (!buyerName) {
    alert("Please enter the buyer or business name.");
    return;
  }
  if (isNaN(price) || price < 0) {
    alert("Please enter a valid non-negative offered price.");
    return;
  }
  if (isNaN(qty) || qty <= 0) {
    alert("Please enter a valid quantity greater than 0.");
    return;
  }
  if (transportCost < 0 || otherCost < 0) {
    alert("Transport and other deduction costs cannot be negative.");
    return;
  }

  const offers = getBuyerOffers();
  const newOffer = {
    id: `offer_${Date.now()}`,
    buyerName,
    price,
    qty,
    transportCost,
    otherCost,
    note: "Farmer custom entry"
  };

  offers.unshift(newOffer);
  saveBuyerOffers(offers);

  // Reset form
  document.getElementById('addOfferForm').reset();
  if (transportInput) transportInput.value = '0';
  if (otherInput) otherInput.value = '0';

  renderBuyerOffers();
  showToast(`Added offer from ${buyerName} to comparison!`, '🤝');
}

function removeBuyerOffer(offerId) {
  let offers = getBuyerOffers();
  offers = offers.filter(o => o.id !== offerId);
  saveBuyerOffers(offers);
  renderBuyerOffers();
  showToast("Offer removed from comparison.", '🗑️');
}

function importOffersFromEnquiries() {
  const enquiries = JSON.parse(localStorage.getItem('krishi_marketplace_enquiries') || '[]');
  if (enquiries.length === 0) {
    showToast("No active marketplace enquiries found to import.", 'ℹ️');
    return;
  }

  const existingOffers = getBuyerOffers();
  let importedCount = 0;

  enquiries.forEach(enq => {
    // Avoid duplicate imports
    const alreadyExists = existingOffers.some(o => o.id === `offer_enq_${enq.id}`);
    if (!alreadyExists && enq.buyerName && enq.offeredPrice) {
      existingOffers.push({
        id: `offer_enq_${enq.id}`,
        buyerName: `${enq.buyerName} (${enq.cropName || 'Enquiry'})`,
        price: enq.offeredPrice,
        qty: enq.quantity || 50,
        transportCost: 0, // Default to 0, farmer can adjust
        otherCost: 0,
        note: `Imported from Marketplace Enquiry (${enq.status})`
      });
      importedCount++;
    }
  });

  saveBuyerOffers(existingOffers);
  renderBuyerOffers();

  if (importedCount > 0) {
    showToast(`Successfully imported ${importedCount} enquiries into comparison!`, '📥');
  } else {
    showToast("All marketplace enquiries are already in your comparison list.", 'ℹ️');
  }
}

// ----------------------------------------------------
// Saved Financial Scenarios (localStorage)
// ----------------------------------------------------
function saveCurrentScenario() {
  const cropName = document.getElementById('calcCropName')?.value.trim() || 'Produce';
  const qty = parseFloat(document.getElementById('calcHarvestedQty')?.value) || 0;
  const unit = document.getElementById('calcQuantityUnit')?.value || 'Quintal';
  const sellingPrice = parseFloat(document.getElementById('calcSellingPrice')?.value) || 0;

  const seedsCost = parseFloat(document.getElementById('calcCostSeeds')?.value) || 0;
  const fertCost = parseFloat(document.getElementById('calcCostFertilizer')?.value) || 0;
  const laborCost = parseFloat(document.getElementById('calcCostLabor')?.value) || 0;
  const irrigCost = parseFloat(document.getElementById('calcCostIrrigation')?.value) || 0;
  const machCost = parseFloat(document.getElementById('calcCostMachinery')?.value) || 0;
  const transCost = parseFloat(document.getElementById('calcCostTransport')?.value) || 0;
  const packCost = parseFloat(document.getElementById('calcCostPackaging')?.value) || 0;
  const otherCost = parseFloat(document.getElementById('calcCostOther')?.value) || 0;

  if (qty <= 0) {
    alert("Cannot save scenario with 0 quantity.");
    return;
  }

  const totalRevenue = qty * sellingPrice;
  const totalExpenses = seedsCost + fertCost + laborCost + irrigCost + machCost + transCost + packCost + otherCost;
  const netProfit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : '0';

  const scenarios = JSON.parse(localStorage.getItem('krishi_saved_calculations') || '[]');
  const newScenario = {
    id: `scenario_${Date.now()}`,
    timestamp: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
    cropName,
    qty,
    unit,
    sellingPrice,
    expenses: {
      seeds: seedsCost,
      fertilizer: fertCost,
      labor: laborCost,
      irrigation: irrigCost,
      machinery: machCost,
      transport: transCost,
      packaging: packCost,
      other: otherCost
    },
    totalRevenue,
    totalExpenses,
    netProfit,
    profitMargin
  };

  scenarios.unshift(newScenario);
  localStorage.setItem('krishi_saved_calculations', JSON.stringify(scenarios));

  showToast(`Scenario for "${cropName}" saved successfully!`, '💾');
  renderSavedScenarios();
}

function renderSavedScenarios() {
  const container = document.getElementById('savedScenariosContainer');
  if (!container) return;

  const scenarios = JSON.parse(localStorage.getItem('krishi_saved_calculations') || '[]');

  if (scenarios.length === 0) {
    container.innerHTML = `
      <div class="empty-state-box">
        <div class="empty-state-icon">📁</div>
        <h4 style="color: var(--color-forest); font-size: 1.05rem; font-weight: 800; margin-bottom: 6px;">No saved scenarios yet</h4>
        <p style="color: var(--color-text-muted); font-size: 0.85rem;">Adjust your crop quantities, selling price, and itemized expenses, then click "Save Scenario" to review anytime.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = scenarios.map(sc => `
    <div style="background: #FFFFFF; border: 1.5px solid var(--color-border); border-radius: var(--radius-md); padding: 14px 18px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
      <div>
        <div style="font-size: 0.78rem; color: var(--color-text-muted);">${sc.timestamp}</div>
        <strong style="color: var(--color-forest); font-size: 1.05rem;">${escapeHtml(sc.cropName)}</strong>
        <div style="font-size: 0.84rem; margin-top: 2px;">
          ${sc.qty} ${sc.unit} @ ${formatINR(sc.sellingPrice)}/${sc.unit === 'Quintal' ? 'Qtl' : sc.unit} •
          <span style="color: ${sc.netProfit >= 0 ? 'var(--color-leaf)' : '#C0392B'}; font-weight: 700;">
            Net: ${formatINR(sc.netProfit)} (${sc.profitMargin}%)
          </span>
        </div>
      </div>
      <div style="display: flex; gap: 8px;">
        <button type="button" class="btn-primary" style="padding: 6px 12px; font-size: 0.82rem;" onclick="loadSavedScenario('${sc.id}')">
          📂 Load into Calculator
        </button>
        <button type="button" class="btn-remove-offer" onclick="deleteSavedScenario('${sc.id}')">
          ✕ Delete
        </button>
      </div>
    </div>
  `).join('');
}

function loadSavedScenario(scenarioId) {
  const scenarios = JSON.parse(localStorage.getItem('krishi_saved_calculations') || '[]');
  const sc = scenarios.find(s => s.id === scenarioId);
  if (!sc) return;

  const nameEl = document.getElementById('calcCropName');
  const qtyEl = document.getElementById('calcHarvestedQty');
  const unitEl = document.getElementById('calcQuantityUnit');
  const priceEl = document.getElementById('calcSellingPrice');

  if (nameEl) nameEl.value = sc.cropName;
  if (qtyEl) qtyEl.value = sc.qty;
  if (unitEl) unitEl.value = sc.unit;
  if (priceEl) priceEl.value = sc.sellingPrice;

  if (sc.expenses) {
    if (document.getElementById('calcCostSeeds')) document.getElementById('calcCostSeeds').value = sc.expenses.seeds || 0;
    if (document.getElementById('calcCostFertilizer')) document.getElementById('calcCostFertilizer').value = sc.expenses.fertilizer || 0;
    if (document.getElementById('calcCostLabor')) document.getElementById('calcCostLabor').value = sc.expenses.labor || 0;
    if (document.getElementById('calcCostIrrigation')) document.getElementById('calcCostIrrigation').value = sc.expenses.irrigation || 0;
    if (document.getElementById('calcCostMachinery')) document.getElementById('calcCostMachinery').value = sc.expenses.machinery || 0;
    if (document.getElementById('calcCostTransport')) document.getElementById('calcCostTransport').value = sc.expenses.transport || 0;
    if (document.getElementById('calcCostPackaging')) document.getElementById('calcCostPackaging').value = sc.expenses.packaging || 0;
    if (document.getElementById('calcCostOther')) document.getElementById('calcCostOther').value = sc.expenses.other || 0;
  }

  switchCalcTab('profit');
  calculateProfitRealtime();
  showToast(`Loaded scenario: "${sc.cropName}"`, '📂');
}

function deleteSavedScenario(scenarioId) {
  let scenarios = JSON.parse(localStorage.getItem('krishi_saved_calculations') || '[]');
  scenarios = scenarios.filter(s => s.id !== scenarioId);
  localStorage.setItem('krishi_saved_calculations', JSON.stringify(scenarios));
  renderSavedScenarios();
  showToast("Scenario deleted.", '🗑️');
}

function clearAllSavedScenarios() {
  if (confirm("Clear all saved profit calculations?")) {
    localStorage.removeItem('krishi_saved_calculations');
    renderSavedScenarios();
    showToast("All saved scenarios cleared.", 'ℹ️');
  }
}

function resetCalculatorForm() {
  applyCropPreset('paddy');
  showToast("Calculator reset to default Paddy figures.", '↺');
}

// Backward-compatibility aliases for legacy triggers
function autoFillCropEstimates() {
  applyCropPreset('paddy');
}

function handleCalculateProfit(event) {
  if (event) event.preventDefault();
  calculateProfitRealtime();
}

// ----------------------------------------------------
// 6. Buyer Directory Interactions
// ----------------------------------------------------
function filterBuyers(category) {
  const cards = document.querySelectorAll('.buyer-card');
  cards.forEach(card => {
    if (category === 'all' || card.getAttribute('data-category') === category) {
      card.style.display = 'flex';
    } else {
      card.style.display = 'none';
    }
  });
}

function contactBuyer(name, phone) {
  const callAction = confirm(`Call ${name} at ${phone} now?`);
  if (callAction) {
    window.location.href = `tel:${phone.replace(/\s+/g, '')}`;
  }
}

// ----------------------------------------------------
// 7. Voice Assistant UI Handlers
// ----------------------------------------------------
function submitVoiceText() {
  const input = document.getElementById('voiceInputText');
  if (!input || !input.value.trim()) return;
  const text = input.value.trim();
  input.value = '';
  if (window.krishiVoice) {
    window.krishiVoice.processQuery(text);
  }
}

function handleVoiceEnter(event) {
  if (event.key === 'Enter') {
    submitVoiceText();
  }
}

function askQuickPrompt(btn) {
  const text = btn.innerText;
  if (window.krishiVoice) {
    window.krishiVoice.processQuery(text);
  }
}

// ----------------------------------------------------
// 8. Toast Notifications
// ----------------------------------------------------
function showToast(message, icon = '🌾') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// ====================================================
// 9. SELL CROPS & FIND BUYERS MARKETPLACE ENGINE
// ====================================================

// Realistic sample seed listings (clearly labeled with isDemo: true)
const initialDemoCropListings = [
  {
    id: "crop_demo_101",
    name: "Sona Masoori Paddy (ಭತ್ತ)",
    category: "grains",
    variety: "Raw Premium Grade-A",
    quantity: 100,
    unit: "Quintal",
    price: 2850,
    village: "Maddur",
    district: "Mandya",
    harvestDate: "2026-10-25",
    quality: "Sun-dried, moisture < 12%, organic certified. Packed in 50kg gunny bags.",
    farmerName: "Basavaraju M.",
    farmerPhone: "9845012345",
    status: "available",
    imageUrl: "",
    isDemo: true,
    createdAt: "2026-10-18T08:00:00Z"
  },
  {
    id: "crop_demo_102",
    name: "Hybrid Tomato (ಟೊಮೆಟೊ)",
    category: "vegetables",
    variety: "Himsona Grade A",
    quantity: 60,
    unit: "Quintal",
    price: 2400,
    village: "Srinivasapura",
    district: "Kolar",
    harvestDate: "2026-10-22",
    quality: "Firm red export quality fruit, sorted in 15kg plastic crates. Pest-free.",
    farmerName: "Manjunath Reddy",
    farmerPhone: "9448067890",
    status: "negotiation",
    imageUrl: "",
    isDemo: true,
    createdAt: "2026-10-19T09:30:00Z"
  },
  {
    id: "crop_demo_103",
    name: "Organic Brown Ragi (ರಾಗಿ)",
    category: "grains",
    variety: "Local Finger Millet",
    quantity: 40,
    unit: "Quintal",
    price: 3600,
    village: "Nelamangala",
    district: "Bangalore Rural",
    harvestDate: "2026-10-20",
    quality: "Double machine-cleaned, pesticide-free traditional variety. Ready for dispatch.",
    farmerName: "Shivalingaiah K.",
    farmerPhone: "9900122334",
    status: "available",
    imageUrl: "",
    isDemo: true,
    createdAt: "2026-10-19T11:00:00Z"
  },
  {
    id: "crop_demo_104",
    name: "Yellow Hybrid Maize (ಮೆಕ್ಕೆಜೋಳ)",
    category: "grains",
    variety: "Pioneer 3396",
    quantity: 150,
    unit: "Quintal",
    price: 2150,
    village: "Harihar",
    district: "Davanagere",
    harvestDate: "2026-10-24",
    quality: "High starch content > 68%, grain moisture 11.2%. Ideal for poultry & starch mills.",
    farmerName: "Veerabhadrappa",
    farmerPhone: "9740088776",
    status: "available",
    imageUrl: "",
    isDemo: true,
    createdAt: "2026-10-17T14:00:00Z"
  },
  {
    id: "crop_demo_105",
    name: "Gulbarga Toor Dal (ತೊಗರಿ ಬೇಳೆ)",
    category: "pulses",
    variety: "Maruti IPC-7",
    quantity: 35,
    unit: "Quintal",
    price: 7200,
    village: "Sedam",
    district: "Kalaburagi",
    harvestDate: "2026-10-26",
    quality: "Geographical Indication (GI) tagged, unpolished red gram dal. High protein.",
    farmerName: "Mallikarjun Patil",
    farmerPhone: "9632054321",
    status: "available",
    imageUrl: "",
    isDemo: true,
    createdAt: "2026-10-18T16:00:00Z"
  }
];

// Realistic sample seed enquiries (clearly labeled with isDemo: true)
const initialDemoEnquiries = [
  {
    id: "enq_demo_201",
    cropId: "crop_demo_101",
    cropName: "Sona Masoori Paddy (ಭತ್ತ)",
    cropUnit: "Quintal",
    askingPrice: 2850,
    buyerName: "Sri Lakshmi Modern Rice Mill",
    buyerPhone: "9900154321",
    quantity: 80,
    offeredPrice: 2800,
    message: "We can arrange direct farm truck pickup this Saturday. Immediate payment upon weighbridge slip verification.",
    date: "2026-10-19",
    status: "new",
    isDemo: true
  },
  {
    id: "enq_demo_202",
    cropId: "crop_demo_102",
    cropName: "Hybrid Tomato (ಟೊಮೆಟೊ)",
    cropUnit: "Quintal",
    askingPrice: 2400,
    buyerName: "GreenFresh Aggregators & Retail",
    buyerPhone: "9448067890",
    quantity: 50,
    offeredPrice: 2350,
    message: "Supplying to Bengaluru retail chains. Need fresh morning harvest crates delivered to Hoskote packhouse.",
    date: "2026-10-18",
    status: "accepted",
    isDemo: true
  }
];

// Active marketplace filter state
const marketplaceFilterState = {
  keyword: "",
  category: "all",
  district: "all",
  sortBy: "latest"
};

let uploadedCropImageBase64 = "";

function initMarketplace() {
  // Seed initial listings if empty
  const savedListings = localStorage.getItem('krishi_marketplace_listings');
  if (!savedListings) {
    localStorage.setItem('krishi_marketplace_listings', JSON.stringify(initialDemoCropListings));
  }

  // Seed initial enquiries if empty
  const savedEnquiries = localStorage.getItem('krishi_marketplace_enquiries');
  if (!savedEnquiries) {
    localStorage.setItem('krishi_marketplace_enquiries', JSON.stringify(initialDemoEnquiries));
  }

  // Default harvest date in form (3 days from now)
  const harvestDateInput = document.getElementById('mCropHarvestDate');
  if (harvestDateInput) {
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 3);
    harvestDateInput.value = defaultDate.toISOString().split('T')[0];
  }

  // Check URL hash on page load
  checkHashRoute();
  window.addEventListener('hashchange', checkHashRoute);

  // Initial renders
  renderMarketplaceCrops();
  renderMarketplaceEnquiries();
  renderMarketplaceBuyers();
  updateEnquiryBadges();
}

function checkHashRoute() {
  const hash = window.location.hash;
  if (hash === '#marketplace' || hash.startsWith('#marketplace/')) {
    const tab = hash.split('/')[1] || 'browse';
    switchView('marketplace', tab);
  } else if (hash === '#home' || hash === '') {
    switchView('home');
  }
}

// ----------------------------------------------------
// View & Tab Switching
// ----------------------------------------------------
function switchView(viewName, tab = 'browse') {
  const homeView = document.getElementById('homeView');
  const marketView = document.getElementById('marketplaceView');
  const navHome = document.getElementById('navHomeLink');
  const bNavHome = document.getElementById('bNavHome');
  const bNavMarket = document.getElementById('bNavMarket');

  if (viewName === 'marketplace') {
    if (homeView) homeView.style.display = 'none';
    if (marketView) marketView.style.display = 'block';

    if (navHome) navHome.classList.remove('active');
    if (bNavHome) bNavHome.classList.remove('active');
    if (bNavMarket) bNavMarket.classList.add('active');

    switchMarketplaceTab(tab);
    window.location.hash = `marketplace/${tab}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } else {
    // Show Home View
    if (homeView) homeView.style.display = 'block';
    if (marketView) marketView.style.display = 'none';

    if (navHome) navHome.classList.add('active');
    if (bNavHome) bNavHome.classList.add('active');
    if (bNavMarket) bNavMarket.classList.remove('active');

    window.location.hash = 'home';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

function switchMarketplaceTab(tabName) {
  // Tab buttons
  const tabs = ['browse', 'list', 'enquiries', 'buyers'];
  tabs.forEach(t => {
    const btn = document.getElementById(`tabBtn${t.charAt(0).toUpperCase() + t.slice(1)}`);
    const content = document.getElementById(`mTab${t.charAt(0).toUpperCase() + t.slice(1)}Content`);
    if (btn) {
      if (t === tabName) btn.classList.add('active');
      else btn.classList.remove('active');
    }
    if (content) {
      if (t === tabName) content.style.display = 'block';
      else content.style.display = 'none';
    }
  });

  if (tabName === 'browse') {
    renderMarketplaceCrops();
  } else if (tabName === 'list') {
    if (typeof currentUser !== 'undefined' && currentUser) {
      const fName = document.getElementById('mCropFarmerName');
      const fPhone = document.getElementById('mCropFarmerPhone');
      const fVillage = document.getElementById('mCropVillage');
      const fDistrict = document.getElementById('mCropDistrict');
      if (fName && !fName.value) fName.value = currentUser.fullName || '';
      if (fPhone && !fPhone.value) fPhone.value = currentUser.phone || '';
      if (fVillage && !fVillage.value) fVillage.value = currentUser.village || '';
      if (fDistrict && currentUser.district) fDistrict.value = currentUser.district;
    }
  } else if (tabName === 'enquiries') {
    renderMarketplaceEnquiries();
  } else if (tabName === 'buyers') {
    renderMarketplaceBuyers();
  }

  // Update hash without jumping
  if (window.location.hash.startsWith('#marketplace')) {
    history.replaceState(null, '', `#marketplace/${tabName}`);
  }
}

// ----------------------------------------------------
// Search & Filter Controllers
// ----------------------------------------------------
function handleMarketplaceSearch(keyword) {
  marketplaceFilterState.keyword = keyword.trim().toLowerCase();
  renderMarketplaceCrops();
}

function handleFilterCategory(category) {
  marketplaceFilterState.category = category;
  renderMarketplaceCrops();
}

function handleFilterDistrict(district) {
  marketplaceFilterState.district = district;
  renderMarketplaceCrops();
}

function handleFilterSort(sortValue) {
  marketplaceFilterState.sortBy = sortValue;
  renderMarketplaceCrops();
}

function resetMarketplaceFilters() {
  marketplaceFilterState.keyword = "";
  marketplaceFilterState.category = "all";
  marketplaceFilterState.district = "all";
  marketplaceFilterState.sortBy = "latest";

  const searchInput = document.getElementById('marketplaceSearchInput');
  const catSelect = document.getElementById('marketplaceCategorySelect');
  const distSelect = document.getElementById('marketplaceDistrictSelect');
  const sortSelect = document.getElementById('marketplaceSortSelect');

  if (searchInput) searchInput.value = "";
  if (catSelect) catSelect.value = "all";
  if (distSelect) distSelect.value = "all";
  if (sortSelect) sortSelect.value = "latest";

  renderMarketplaceCrops();
}

// Helper: Escape HTML to prevent accidental injection
function escapeHtml(str) {
  if (typeof str !== 'string') return str;
  return str.replace(/[&<>"']/g, function(m) {
    return {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    }[m];
  });
}

// Helper: Category Icons
function getCategoryIcon(cat) {
  const map = {
    grains: '🌾',
    vegetables: '🍅',
    fruits: '🥭',
    pulses: '🥜',
    commercial: '🌿'
  };
  return map[cat] || '🌱';
}

// ----------------------------------------------------
// Render Marketplace Crops
// ----------------------------------------------------
function renderMarketplaceCrops() {
  const container = document.getElementById('marketplaceCropsGrid');
  const countEl = document.getElementById('marketplaceResultsCount');
  if (!container) return;

  const allListings = JSON.parse(localStorage.getItem('krishi_marketplace_listings') || '[]');

  // Apply filters
  let filtered = allListings.filter(item => {
    // Keyword match across crop name, variety, village, and district
    if (marketplaceFilterState.keyword) {
      const q = marketplaceFilterState.keyword;
      const combined = `${item.name} ${item.variety} ${item.village} ${item.district} ${item.quality}`.toLowerCase();
      if (!combined.includes(q)) return false;
    }

    // Category match
    if (marketplaceFilterState.category !== 'all' && item.category !== marketplaceFilterState.category) {
      return false;
    }

    // District match
    if (marketplaceFilterState.district !== 'all' && item.district !== marketplaceFilterState.district) {
      return false;
    }

    return true;
  });

  // Apply sorting
  if (marketplaceFilterState.sortBy === 'price_asc') {
    filtered.sort((a, b) => a.price - b.price);
  } else if (marketplaceFilterState.sortBy === 'price_desc') {
    filtered.sort((a, b) => b.price - a.price);
  } else {
    // Latest first
    filtered.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }

  // Update counter
  if (countEl) {
    countEl.innerText = `Showing ${filtered.length} of ${allListings.length} crop listings`;
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="empty-state-box" style="grid-column: 1 / -1;">
        <div class="empty-state-icon">🌾</div>
        <h4 style="color: var(--color-forest); font-size: 1.2rem; font-weight: 800; margin-bottom: 6px;">No crop listings found</h4>
        <p style="color: var(--color-text-muted); font-size: 0.9rem; margin-bottom: 16px;">Try adjusting your search terms or clearing your district/category filters.</p>
        <button class="btn-primary" style="max-width: 220px; margin: 0 auto;" onclick="resetMarketplaceFilters()">
          Clear All Filters
        </button>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(crop => {
    const categoryIcon = getCategoryIcon(crop.category);
    const formattedPrice = Number(crop.price).toLocaleString('en-IN');
    const formattedQty = Number(crop.quantity).toLocaleString('en-IN');

    const statusBadgeClass = crop.status === 'sold' ? 'status-sold' : (crop.status === 'negotiation' ? 'status-negotiation' : 'status-available');
    const statusText = crop.status === 'sold' ? 'Sold Out' : (crop.status === 'negotiation' ? 'Negotiating' : 'Available');

    const demoBadgeHtml = crop.isDemo ? `<span class="card-demo-badge">[Demo Listing]</span>` : '';

    const imageHtml = crop.imageUrl
      ? `<img src="${crop.imageUrl}" alt="${escapeHtml(crop.name)}">`
      : `<span class="crop-card-placeholder-icon">${categoryIcon}</span>`;

    return `
      <div class="marketplace-crop-card" id="card_${crop.id}">
        <div class="crop-card-image-box">
          ${imageHtml}
          <span class="card-category-pill">${categoryIcon} ${escapeHtml(crop.category)}</span>
          <span class="card-status-pill ${statusBadgeClass}">${statusText}</span>
          ${demoBadgeHtml}
        </div>

        <div class="crop-card-body">
          <h4 class="crop-card-title">${escapeHtml(crop.name)}</h4>
          <p style="font-size: 0.85rem; color: var(--color-leaf); font-weight: 700; margin-bottom: 4px;">${escapeHtml(crop.variety)}</p>
          <div class="crop-card-location">
            <span>📍</span> <span>${escapeHtml(crop.village)}, ${escapeHtml(crop.district)}</span>
          </div>

          <div class="crop-card-details-grid">
            <div>
              <span class="crop-stat-label">Asking Price</span>
              <span class="crop-stat-value crop-stat-price">₹${formattedPrice} <small style="font-size: 0.72rem; color: var(--color-text-muted);">/ ${escapeHtml(crop.unit)}</small></span>
            </div>
            <div>
              <span class="crop-stat-label">Available Qty</span>
              <span class="crop-stat-value">📦 ${formattedQty} ${escapeHtml(crop.unit)}s</span>
            </div>
          </div>

          <div class="crop-card-quality">
            <strong>🗓️ Harvest:</strong> ${escapeHtml(crop.harvestDate)}<br>
            <strong>✨ Quality:</strong> ${escapeHtml(crop.quality)}
          </div>

          <div class="crop-card-actions">
            <button class="btn-card-details" onclick="openCropDetails('${crop.id}')">
              <span>🔍</span> Details
            </button>
            <button class="btn-card-enquire" onclick="openEnquiryModal('${crop.id}')">
              <span>💬</span> Enquire
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// ----------------------------------------------------
// Image Upload Handler
// ----------------------------------------------------
function handleMarketplaceImageUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  if (file.size > 3 * 1024 * 1024) {
    alert("Photo size exceeds 3MB. Please select a smaller image.");
    return;
  }

  const reader = new FileReader();
  reader.onload = function(e) {
    uploadedCropImageBase64 = e.target.result;
    const preview = document.getElementById('mCropPhotoPreview');
    if (preview) {
      preview.src = uploadedCropImageBase64;
      preview.style.display = 'inline-block';
    }
  };
  reader.readAsDataURL(file);
}

// ----------------------------------------------------
// New Crop Listing Creation
// ----------------------------------------------------
function handleNewCropListing(event) {
  event.preventDefault();

  if (typeof currentUser !== 'undefined' && !currentUser) {
    requireAuth(() => {
      switchMarketplaceTab('list');
      showToast("Signed in! You can now publish your crop listing.", "🌾");
    }, 'farmer', "Please log in with a Farmer account to list crops for sale.");
    return;
  }

  if (typeof currentUser !== 'undefined' && currentUser && currentUser.role !== 'farmer' && currentUser.secondaryRole !== 'farmer') {
    alert("⚠️ Only registered Farmers can list crops. Please switch to a Farmer account or enable the Farmer role in your profile.");
    return;
  }

  const name = document.getElementById('mCropName').value.trim();
  const category = document.getElementById('mCropCategory').value;
  const variety = document.getElementById('mCropVariety').value.trim();
  const status = document.getElementById('mCropStatus').value;
  const quantity = parseFloat(document.getElementById('mCropQuantity').value);
  const unit = document.getElementById('mCropUnit').value;
  const price = parseFloat(document.getElementById('mCropPrice').value);
  const harvestDate = document.getElementById('mCropHarvestDate').value;
  const village = document.getElementById('mCropVillage').value.trim();
  const district = document.getElementById('mCropDistrict').value;
  const quality = document.getElementById('mCropQuality').value.trim();
  const farmerName = document.getElementById('mCropFarmerName').value.trim();
  const farmerPhone = document.getElementById('mCropFarmerPhone').value.trim();

  const errorBanner = document.getElementById('listingErrorBanner');

  // Input Validation
  const errors = [];
  if (!name) errors.push("Please enter the crop name.");
  if (!variety) errors.push("Please specify the variety or grade.");
  if (isNaN(quantity) || quantity <= 0) errors.push("Total quantity must be a positive number.");
  if (isNaN(price) || price <= 0) errors.push("Asking price must be a positive number in INR.");
  if (!harvestDate) errors.push("Please select the harvest or availability date.");
  if (!village) errors.push("Please enter your village or town.");
  if (!quality) errors.push("Please describe the crop quality.");
  if (!farmerName) errors.push("Please provide the farmer/seller name.");
  if (!farmerPhone || !/^\d{10}$/.test(farmerPhone.replace(/\D/g, ''))) {
    errors.push("Please enter a valid 10-digit mobile number.");
  }

  if (errors.length > 0) {
    if (errorBanner) {
      errorBanner.innerHTML = `<strong>⚠️ Please fix the following:</strong><br>${errors.join('<br>')}`;
      errorBanner.style.display = 'block';
      errorBanner.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    return;
  }

  if (errorBanner) errorBanner.style.display = 'none';

  const newCrop = {
    id: `crop_user_${Date.now()}`,
    userId: (typeof currentUser !== 'undefined' && currentUser) ? currentUser.id : null,
    name,
    category,
    variety,
    quantity,
    unit,
    price,
    village,
    district,
    harvestDate,
    quality,
    farmerName,
    farmerPhone: farmerPhone.replace(/\D/g, ''),
    status,
    imageUrl: uploadedCropImageBase64 || "",
    isDemo: false,
    createdAt: new Date().toISOString()
  };

  const listings = JSON.parse(localStorage.getItem('krishi_marketplace_listings') || '[]');
  listings.unshift(newCrop);
  localStorage.setItem('krishi_marketplace_listings', JSON.stringify(listings));

  // Reset form and preview
  document.getElementById('marketplaceListingForm').reset();
  uploadedCropImageBase64 = "";
  const preview = document.getElementById('mCropPhotoPreview');
  if (preview) preview.style.display = 'none';

  showToast(`Your crop listing for "${name}" has been published!`, '🌾');

  // Switch to browse tab and highlight new card
  switchMarketplaceTab('browse');
}

// ----------------------------------------------------
// Crop Details Modal
// ----------------------------------------------------
function openCropDetails(cropId) {
  const listings = JSON.parse(localStorage.getItem('krishi_marketplace_listings') || '[]');
  const crop = listings.find(c => c.id === cropId);
  if (!crop) return;

  const titleEl = document.getElementById('detailCropTitle');
  const subEl = document.getElementById('detailCropSubtitle');
  const bodyEl = document.getElementById('detailModalBody');

  if (titleEl) titleEl.innerText = crop.name;
  if (subEl) subEl.innerText = `${crop.variety} • ${crop.village}, ${crop.district}`;

  const categoryIcon = getCategoryIcon(crop.category);
  const formattedPrice = Number(crop.price).toLocaleString('en-IN');
  const formattedQty = Number(crop.quantity).toLocaleString('en-IN');
  const demoNotice = crop.isDemo ? `<div style="background: rgba(0,0,0,0.06); padding: 6px 10px; border-radius: var(--radius-sm); font-size: 0.78rem; color: var(--color-text-muted); margin-bottom: 12px;"><strong>Note:</strong> This is a sample demo listing for testing and demonstrations.</div>` : '';

  if (bodyEl) {
    bodyEl.innerHTML = `
      ${demoNotice}
      <div style="display: flex; gap: 16px; align-items: center; margin-bottom: 18px; background: var(--color-ivory-light); padding: 14px; border-radius: var(--radius-md); border: 1px solid var(--color-border);">
        <div style="font-size: 3rem;">${categoryIcon}</div>
        <div>
          <h4 style="color: var(--color-forest); font-size: 1.25rem; font-weight: 800;">${escapeHtml(crop.name)} (${escapeHtml(crop.variety)})</h4>
          <p style="font-size: 0.9rem; color: var(--color-text-muted);">📍 ${escapeHtml(crop.village)}, ${escapeHtml(crop.district)}, Karnataka</p>
          <span class="badge-pill" style="margin-top: 4px; display: inline-block;">Category: ${escapeHtml(crop.category)}</span>
        </div>
      </div>

      <div class="calc-metric-grid" style="margin-bottom: 18px;">
        <div class="metric-card">
          <span class="metric-label">Asking Price</span>
          <div class="metric-value highlight">₹${formattedPrice} / ${escapeHtml(crop.unit)}</div>
        </div>
        <div class="metric-card">
          <span class="metric-label">Total Quantity</span>
          <div class="metric-value positive">📦 ${formattedQty} ${escapeHtml(crop.unit)}s</div>
        </div>
        <div class="metric-card">
          <span class="metric-label">Harvest / Availability</span>
          <div class="metric-value" style="font-size: 1.05rem;">🗓️ ${escapeHtml(crop.harvestDate)}</div>
        </div>
        <div class="metric-card">
          <span class="metric-label">Listing Status</span>
          <div class="metric-value" style="font-size: 1.05rem; text-transform: capitalize;">${escapeHtml(crop.status)}</div>
        </div>
      </div>

      <div style="background: #FFFFFF; border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: 16px; margin-bottom: 18px;">
        <h5 style="color: var(--color-forest); font-size: 0.95rem; font-weight: 700; margin-bottom: 6px;">Quality & Crop Specifications</h5>
        <p style="font-size: 0.9rem; color: var(--color-text); line-height: 1.5;">${escapeHtml(crop.quality)}</p>
      </div>

      <div style="background: var(--color-ivory); border-radius: var(--radius-md); padding: 14px 16px; margin-bottom: 20px; border-left: 4px solid var(--color-leaf);">
        <h5 style="color: var(--color-forest); font-size: 0.92rem; font-weight: 700; margin-bottom: 4px;">Farmer Contact Information</h5>
        <p style="font-size: 0.88rem; color: var(--color-text-muted);">
          Farmer: <strong>${escapeHtml(crop.farmerName)}</strong> • Location: ${escapeHtml(crop.village)}, ${escapeHtml(crop.district)}<br>
          <small style="color: var(--color-text-muted);">Direct phone is verified and provided once an enquiry or price offer is sent.</small>
        </p>
      </div>

      <div style="display: flex; gap: 12px;">
        <button class="btn-primary" style="flex: 2;" onclick="closeModal('cropDetailModal'); openEnquiryModal('${crop.id}')">
          <span>💬</span> Send Enquiry / Make Offer
        </button>
        <button class="btn-filter-reset" style="flex: 1;" onclick="closeModal('cropDetailModal')">
          Close
        </button>
      </div>
    `;
  }

  openModal('cropDetailModal');
}

// ----------------------------------------------------
// Buyer Enquiry Modal & Submission
// ----------------------------------------------------
function openEnquiryModal(cropId) {
  const listings = JSON.parse(localStorage.getItem('krishi_marketplace_listings') || '[]');
  const crop = listings.find(c => c.id === cropId);
  if (!crop) return;

  const idInput = document.getElementById('enquiryCropId');
  const summaryBox = document.getElementById('enquiryCropSummaryBox');
  const subEl = document.getElementById('enquiryCropHeaderSub');
  const qtyInput = document.getElementById('enquiryQuantity');
  const priceInput = document.getElementById('enquiryOfferedPrice');

  if (idInput) idInput.value = crop.id;
  if (subEl) subEl.innerText = `Making offer on ${crop.name} (${crop.village}, ${crop.district})`;

  if (summaryBox) {
    summaryBox.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
        <div>
          <strong style="color: var(--color-forest); font-size: 1.05rem;">${escapeHtml(crop.name)} (${escapeHtml(crop.variety)})</strong>
          <div style="font-size: 0.82rem; color: var(--color-text-muted);">
            Available: <strong>${crop.quantity} ${crop.unit}s</strong> • Location: ${crop.village}, ${crop.district}
          </div>
        </div>
        <div>
          <span style="font-size: 0.8rem; color: var(--color-text-muted); display: block;">Farmer's Asking Price</span>
          <span style="font-size: 1.15rem; font-weight: 800; color: var(--color-leaf);">₹${Number(crop.price).toLocaleString('en-IN')} / ${crop.unit}</span>
        </div>
      </div>
    `;
  }

  // Pre-fill suggested values
  if (qtyInput) qtyInput.value = crop.quantity;
  if (priceInput) priceInput.value = crop.price;

  if (typeof currentUser !== 'undefined' && currentUser) {
    const bNameInput = document.getElementById('enquiryBuyerName');
    const bPhoneInput = document.getElementById('enquiryBuyerPhone');
    if (bNameInput && !bNameInput.value) bNameInput.value = currentUser.fullName || '';
    if (bPhoneInput && !bPhoneInput.value) bPhoneInput.value = currentUser.phone || '';
  }

  const errBox = document.getElementById('enquiryErrorBanner');
  if (errBox) errBox.style.display = 'none';

  openModal('cropEnquiryModal');
}

function handleEnquiryFormSubmit(event) {
  event.preventDefault();

  const cropId = document.getElementById('enquiryCropId').value;

  if (typeof currentUser !== 'undefined' && !currentUser) {
    closeModal('cropEnquiryModal');
    requireAuth(() => {
      openEnquiryModal(cropId);
    }, 'buyer', "Please log in with a Buyer account to submit purchase offers.");
    return;
  }

  const buyerName = document.getElementById('enquiryBuyerName').value.trim();
  const buyerPhone = document.getElementById('enquiryBuyerPhone').value.trim();
  const quantity = parseFloat(document.getElementById('enquiryQuantity').value);
  const offeredPrice = parseFloat(document.getElementById('enquiryOfferedPrice').value);
  const message = document.getElementById('enquiryMessage').value.trim();

  const errBox = document.getElementById('enquiryErrorBanner');
  const errors = [];

  if (!buyerName) errors.push("Please enter your name or business name.");
  if (!buyerPhone || !/^\d{10}$/.test(buyerPhone.replace(/\D/g, ''))) {
    errors.push("Please enter a valid 10-digit mobile number for communication.");
  }
  if (isNaN(quantity) || quantity <= 0) errors.push("Quantity requested must be greater than 0.");
  if (isNaN(offeredPrice) || offeredPrice <= 0) errors.push("Offered price must be greater than 0 in INR.");

  if (errors.length > 0) {
    if (errBox) {
      errBox.innerHTML = `<strong>⚠️ Please fix:</strong><br>${errors.join('<br>')}`;
      errBox.style.display = 'block';
    }
    return;
  }

  if (errBox) errBox.style.display = 'none';

  // Find crop listing
  const listings = JSON.parse(localStorage.getItem('krishi_marketplace_listings') || '[]');
  const crop = listings.find(c => c.id === cropId);

  const newEnquiry = {
    id: `enq_${Date.now()}`,
    cropId,
    cropName: crop ? crop.name : "Agricultural Produce",
    cropUnit: crop ? crop.unit : "Quintal",
    askingPrice: crop ? crop.price : offeredPrice,
    buyerId: (typeof currentUser !== 'undefined' && currentUser) ? currentUser.id : null,
    buyerName,
    buyerPhone: buyerPhone.replace(/\D/g, ''),
    quantity,
    offeredPrice,
    message,
    date: new Date().toISOString().split('T')[0],
    status: "new",
    isDemo: false
  };

  const enquiries = JSON.parse(localStorage.getItem('krishi_marketplace_enquiries') || '[]');
  enquiries.unshift(newEnquiry);
  localStorage.setItem('krishi_marketplace_enquiries', JSON.stringify(enquiries));

  // Reset form and close
  document.getElementById('marketplaceEnquiryForm').reset();
  closeModal('cropEnquiryModal');

  updateEnquiryBadges();
  renderMarketplaceEnquiries();

  showToast(`Enquiry submitted! The farmer will review your offer of ₹${offeredPrice}/${newEnquiry.cropUnit}.`, '🤝');
}

// ----------------------------------------------------
// Enquiries Dashboard & Status Workflow
// ----------------------------------------------------
function updateEnquiryBadges() {
  const enquiries = JSON.parse(localStorage.getItem('krishi_marketplace_enquiries') || '[]');
  const newCount = enquiries.filter(e => e.status === 'new').length;

  const badge1 = document.getElementById('enquiriesCountBadge');
  const badge2 = document.getElementById('enquiriesCountBadgeTab');
  const summaryBadge = document.getElementById('enquiryStatusSummaryBadge');

  if (badge1) badge1.innerText = newCount;
  if (badge2) badge2.innerText = newCount;
  if (summaryBadge) summaryBadge.innerText = `${enquiries.length} Total Offers (${newCount} New)`;
}

function renderMarketplaceEnquiries() {
  const container = document.getElementById('marketplaceEnquiriesListContainer');
  if (!container) return;

  const enquiries = JSON.parse(localStorage.getItem('krishi_marketplace_enquiries') || '[]');
  updateEnquiryBadges();

  const isBuyerRole = (typeof currentUser !== 'undefined' && currentUser && currentUser.role === 'buyer');

  // Filter for logged-in buyer if applicable
  const displayList = enquiries.filter(item => {
    if (isBuyerRole) {
      return item.buyerId === currentUser.id || item.buyerPhone === currentUser.phone || item.isDemo;
    }
    return true;
  });

  if (displayList.length === 0) {
    container.innerHTML = `
      <div class="empty-state-box">
        <div class="empty-state-icon">${isBuyerRole ? '🤝' : '📬'}</div>
        <h4 style="color: var(--color-forest); font-size: 1.15rem; font-weight: 800; margin-bottom: 6px;">
          ${isBuyerRole ? 'No crop bids submitted yet' : 'No enquiries received yet'}
        </h4>
        <p style="color: var(--color-text-muted); font-size: 0.88rem;">
          ${isBuyerRole ? 'Browse available produce from the first tab and send your purchase bids directly to farmers.' : 'When buyers browse your produce and make a bid, their offers and messages will appear here.'}
        </p>
      </div>
    `;
    return;
  }

  container.innerHTML = displayList.map(item => {
    const statusClass = item.status === 'accepted' ? 'enq-status-accepted' : (item.status === 'declined' ? 'enq-status-declined' : 'enq-status-new');
    const statusLabel = item.status === 'accepted' ? '✓ Accepted' : (item.status === 'declined' ? '✕ Declined' : '⚡ New Offer');

    // Price comparison
    const priceDiff = item.offeredPrice - item.askingPrice;
    let priceComparisonHtml = '';
    if (priceDiff === 0) {
      priceComparisonHtml = `<span style="color: var(--color-leaf); font-weight: 700;">Matching Asking Price</span>`;
    } else if (priceDiff > 0) {
      priceComparisonHtml = `<span style="color: #27AE60; font-weight: 700;">+₹${priceDiff} above asking!</span>`;
    } else {
      priceComparisonHtml = `<span style="color: #E67E22; font-weight: 700;">₹${Math.abs(priceDiff)} below asking</span>`;
    }

    let actionsHtml = '';
    if (isBuyerRole) {
      if (item.status === 'new') {
        actionsHtml = `<span style="font-size: 0.85rem; color: var(--color-leaf); font-weight: 600;">⏳ Awaiting review by farmer.</span>`;
      } else if (item.status === 'accepted') {
        actionsHtml = `<span style="font-size: 0.85rem; color: #27AE60; font-weight: 700;">✓ Farmer accepted your offer! Direct coordination initiated.</span>`;
      } else {
        actionsHtml = `<span style="font-size: 0.85rem; color: #E74C3C; font-weight: 600;">Offer was not accepted. Try submitting a revised offer.</span>`;
      }
    } else {
      if (item.status === 'new') {
        actionsHtml = `
          <div class="enquiry-buttons-group">
            <button class="btn-enq-accept" onclick="acceptMarketplaceEnquiry('${item.id}')">
              ✓ Accept Offer
            </button>
            <button class="btn-enq-decline" onclick="declineMarketplaceEnquiry('${item.id}')">
              ✕ Decline
            </button>
          </div>
        `;
      } else if (item.status === 'accepted') {
        actionsHtml = `
          <div class="enquiry-private-contact">
            <strong>📞 Buyer Contact:</strong> ${item.buyerPhone} • <strong>Business:</strong> ${escapeHtml(item.buyerName)}<br>
            <small>✓ Call this buyer to schedule farm inspection and confirm payment terms before dispatch.</small>
          </div>
        `;
      } else {
        actionsHtml = `
          <span style="font-size: 0.85rem; color: var(--color-text-muted); font-style: italic;">
            This offer was declined.
          </span>
        `;
      }
    }

    const demoBadge = item.isDemo ? `<span class="card-demo-badge" style="position: static; display: inline-block; margin-right: 6px;">[Demo Offer]</span>` : '';

    return `
      <div class="enquiry-item-card" id="enq_card_${item.id}">
        <div class="enquiry-top-row">
          <div>
            ${demoBadge}
            <h4 class="enquiry-crop-title">${escapeHtml(item.cropName)}</h4>
            <div class="enquiry-buyer-name">From: <strong>${escapeHtml(item.buyerName)}</strong> • Date: ${escapeHtml(item.date)}</div>
          </div>
          <span class="status-badge-enquiry ${statusClass}">${statusLabel}</span>
        </div>

        <div class="enquiry-specs-grid">
          <div>
            <span class="crop-stat-label">Quantity Requested</span>
            <span class="crop-stat-value">📦 ${item.quantity} ${escapeHtml(item.cropUnit)}s</span>
          </div>
          <div>
            <span class="crop-stat-label">Offered Price</span>
            <span class="crop-stat-value crop-stat-price">₹${Number(item.offeredPrice).toLocaleString('en-IN')} / ${escapeHtml(item.cropUnit)}</span>
          </div>
          <div>
            <span class="crop-stat-label">Asking Price</span>
            <span class="crop-stat-value">₹${Number(item.askingPrice).toLocaleString('en-IN')}</span>
          </div>
          <div>
            <span class="crop-stat-label">Offer Margin</span>
            <span class="crop-stat-value">${priceComparisonHtml}</span>
          </div>
        </div>

        ${item.message ? `<div class="enquiry-message-bubble">"${escapeHtml(item.message)}"</div>` : ''}

        <div class="enquiry-actions-bar">
          <span style="font-size: 0.8rem; color: var(--color-text-muted);">
            ${item.status === 'new' ? 'Action required: Accept or decline this buyer offer.' : 'Offer finalized.'}
          </span>
          ${actionsHtml}
        </div>
      </div>
    `;
  }).join('');
}

function acceptMarketplaceEnquiry(enquiryId) {
  const enquiries = JSON.parse(localStorage.getItem('krishi_marketplace_enquiries') || '[]');
  const enq = enquiries.find(e => e.id === enquiryId);
  if (!enq) return;

  enq.status = 'accepted';
  localStorage.setItem('krishi_marketplace_enquiries', JSON.stringify(enquiries));

  // Update associated crop status to negotiation
  if (enq.cropId) {
    const listings = JSON.parse(localStorage.getItem('krishi_marketplace_listings') || '[]');
    const crop = listings.find(c => c.id === enq.cropId);
    if (crop && crop.status === 'available') {
      crop.status = 'negotiation';
      localStorage.setItem('krishi_marketplace_listings', JSON.stringify(listings));
      renderMarketplaceCrops();
    }
  }

  renderMarketplaceEnquiries();
  showToast(`Offer accepted! You can now contact ${enq.buyerName} directly.`, '🤝');
}

function declineMarketplaceEnquiry(enquiryId) {
  const enquiries = JSON.parse(localStorage.getItem('krishi_marketplace_enquiries') || '[]');
  const enq = enquiries.find(e => e.id === enquiryId);
  if (!enq) return;

  enq.status = 'declined';
  localStorage.setItem('krishi_marketplace_enquiries', JSON.stringify(enquiries));

  renderMarketplaceEnquiries();
  showToast("Offer declined.", 'ℹ️');
}

// ----------------------------------------------------
// Verified Buyers Directory (Inside Marketplace)
// ----------------------------------------------------
const verifiedMarketplaceBuyers = [
  {
    id: "buyer_1",
    name: "Kaveri Farmers Producer Co. (FPO)",
    location: "Mandya, Karnataka",
    distance: "~12 km",
    category: "grains",
    crops: ["Paddy", "Ragi", "Maize"],
    phone: "+91 98450 12345",
    type: "FPO Aggregator"
  },
  {
    id: "buyer_2",
    name: "GreenFresh Aggregators & Retail",
    location: "Kolar & Hoskote APMC",
    distance: "~24 km",
    category: "vegetables",
    crops: ["Tomato", "Chilli", "Beans", "Capsicum"],
    phone: "+91 94480 67890",
    type: "Bulk Retail Chain"
  },
  {
    id: "buyer_3",
    name: "Sri Lakshmi Modern Rice Mill",
    location: "Shimoga, Karnataka",
    distance: "Bulk Procurement",
    category: "grains",
    crops: ["Sona Masoori", "Jeera Rice", "Paddy"],
    phone: "+91 99001 54321",
    type: "Certified Miller"
  },
  {
    id: "buyer_4",
    name: "Sahyadri Organic Pulse Processors",
    location: "Hassan & Chikmagalur",
    distance: "Statewide Procurement",
    category: "pulses",
    crops: ["Toor Dal", "Urad Dal", "Soybean"],
    phone: "+91 97400 88776",
    type: "Certified Organic Buyer"
  }
];

let activeBuyerCategory = "all";

function filterBuyersDirectory(category) {
  activeBuyerCategory = category;
  renderMarketplaceBuyers();
}

function renderMarketplaceBuyers() {
  const container = document.getElementById('marketplaceBuyersListContainer');
  if (!container) return;

  const filtered = verifiedMarketplaceBuyers.filter(b => {
    if (activeBuyerCategory === 'all') return true;
    return b.category === activeBuyerCategory;
  });

  container.innerHTML = filtered.map(b => `
    <div class="buyer-card">
      <div class="buyer-info">
        <h4>${escapeHtml(b.name)}</h4>
        <p>📍 ${escapeHtml(b.location)} • ${escapeHtml(b.distance)} • <span style="color: var(--color-leaf); font-weight: 700;">${escapeHtml(b.type)}</span></p>
        <div class="buyer-tags">
          ${b.crops.map(c => `<span class="buyer-tag">${escapeHtml(c)}</span>`).join('')}
        </div>
      </div>
      <button class="btn-gold" onclick="contactBuyer('${b.name}', '${b.phone}')">
        📞 Call Buyer
      </button>
    </div>
  `).join('');
}

