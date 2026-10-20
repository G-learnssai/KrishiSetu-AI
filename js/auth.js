// ==============================================================================
// KrishiSetu AI - Authentication & Authorization Engine
// Supports both Supabase Cloud Backend and Local Cryptographic Mode (SHA-256)
// ==============================================================================

// Pre-hashed passwords for default demo accounts (Password + 'krishi_salt_v1' via SHA-256)
// farmer123 -> a5f7b033... (computed below on init)
const initialDemoUsers = [
  {
    id: "user_farmer_demo",
    email: "farmer@krishisetu.ai",
    fullName: "Ramesh Gowda",
    role: "farmer",
    secondaryRole: "owner", // Also owns a tractor
    phone: "9845012345",
    state: "Karnataka",
    district: "Mandya",
    village: "Maddur",
    passwordHash: "8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918", // 'farmer123'
    createdAt: "2026-10-18T10:00:00Z"
  },
  {
    id: "user_owner_demo",
    email: "owner@krishisetu.ai",
    fullName: "Sri Basaveshwara Rentals",
    role: "owner",
    secondaryRole: null,
    phone: "9448011223",
    state: "Karnataka",
    district: "Mandya",
    village: "Pandavapura",
    passwordHash: "389f417534c03ba846fc45422ab8eefdcc8eefc8c114ad116743477119ff31b8", // 'owner123'
    createdAt: "2026-10-17T14:30:00Z"
  },
  {
    id: "user_buyer_demo",
    email: "buyer@krishisetu.ai",
    fullName: "Kaveri Grain Aggregators",
    role: "buyer",
    secondaryRole: null,
    phone: "9900154321",
    state: "Karnataka",
    district: "Shimoga",
    village: "Bhadravati",
    passwordHash: "14868f0a066a3d93bf3a44d82f7d37785ee6674a7f0e6ce733ab49a37701e828", // 'buyer123'
    createdAt: "2026-10-16T11:00:00Z"
  }
];

let currentUser = null;
let pendingAuthAction = null;

// SHA-256 Cryptographic Hash Helper
async function hashPassword(password) {
  const enc = new TextEncoder();
  const data = enc.encode(password + "_krishi_salt_v1");
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

// ----------------------------------------------------
// Core Auth State & Initialization
// ----------------------------------------------------
async function initAuth() {
  // Seed demo users if empty
  if (!localStorage.getItem("krishi_registered_users")) {
    // Generate authentic hashes for initial accounts
    initialDemoUsers[0].passwordHash = await hashPassword("farmer123");
    initialDemoUsers[1].passwordHash = await hashPassword("owner123");
    initialDemoUsers[2].passwordHash = await hashPassword("buyer123");
    localStorage.setItem("krishi_registered_users", JSON.stringify(initialDemoUsers));
  }

  // Check Supabase Cloud Auth first if configured
  if (window.SupabaseConfig && window.SupabaseConfig.isConfigured() && window.krishiSupabase) {
    try {
      const { data: { session } } = await window.krishiSupabase.auth.getSession();
      if (session && session.user) {
        currentUser = formatSupabaseUser(session.user);
        updateNavAuthUI();
        return;
      }
    } catch (e) {
      console.warn("Supabase session check error:", e);
    }
  }

  // Restore local session if present
  const savedSession = localStorage.getItem("krishi_auth_session");
  if (savedSession) {
    try {
      const sessionObj = JSON.parse(savedSession);
      if (sessionObj.expiresAt && sessionObj.expiresAt > Date.now()) {
        currentUser = sessionObj.user;
      } else {
        localStorage.removeItem("krishi_auth_session");
        currentUser = null;
      }
    } catch (e) {
      currentUser = null;
    }
  }

  updateNavAuthUI();
  updateCloudStatusUI();
}

function formatSupabaseUser(sbUser) {
  const meta = sbUser.user_metadata || {};
  return {
    id: sbUser.id,
    email: sbUser.email,
    fullName: meta.full_name || sbUser.email.split("@")[0],
    role: meta.role || "farmer",
    secondaryRole: meta.secondary_role || null,
    phone: meta.phone || "",
    state: meta.state || "Karnataka",
    district: meta.district || "Mandya",
    village: meta.village || "",
    isCloud: true
  };
}

function getCurrentUser() {
  return currentUser;
}

function isAuthenticated() {
  return Boolean(currentUser);
}

// ----------------------------------------------------
// Registration (Sign Up)
// ----------------------------------------------------
async function handleUserRegistration(event) {
  event.preventDefault();

  const name = document.getElementById("regFullName")?.value.trim();
  const email = document.getElementById("regEmail")?.value.trim().toLowerCase();
  const password = document.getElementById("regPassword")?.value;
  const confirmPassword = document.getElementById("regConfirmPassword")?.value;
  const role = document.querySelector('input[name="regRole"]:checked')?.value || "farmer";
  const alsoOwnsMachinery = document.getElementById("regAlsoOwnsMachinery")?.checked || false;
  const phone = document.getElementById("regPhone")?.value.trim() || "";
  const state = document.getElementById("regState")?.value || "Karnataka";
  const district = document.getElementById("regDistrict")?.value || "Mandya";
  const village = document.getElementById("regVillage")?.value.trim() || "";

  const alertBox = document.getElementById("authAlertBox");

  // Input Validation
  if (!name || !email || !password) {
    showAuthError("Please fill in all required fields.");
    return;
  }

  if (password.length < 6) {
    showAuthError("Password must be at least 6 characters long.");
    return;
  }

  if (password !== confirmPassword) {
    showAuthError("Passwords do not match. Please re-enter.");
    return;
  }

  if (phone && phone.replace(/\D/g, "").length < 10) {
    showAuthError("Please enter a valid 10-digit mobile number.");
    return;
  }

  // 1. If Supabase Cloud is configured, register with Supabase Auth
  if (window.SupabaseConfig && window.SupabaseConfig.isConfigured() && window.krishiSupabase) {
    try {
      const { data, error } = await window.krishiSupabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            role,
            secondary_role: alsoOwnsMachinery ? "owner" : null,
            phone: phone.replace(/\D/g, ""),
            state,
            district,
            village
          }
        }
      });

      if (error) {
        showAuthError(`Registration error: ${error.message}`);
        return;
      }

      if (data.session) {
        currentUser = formatSupabaseUser(data.session.user);
      } else {
        // Confirmation email required by Supabase project settings
        showToast("Registration successful! Check your email to confirm your account.", "✉️");
        switchAuthTab("login");
        return;
      }
    } catch (err) {
      showAuthError(`Supabase error: ${err.message}`);
      return;
    }
  } else {
    // 2. Local Cryptographic Registration (SHA-256)
    const users = JSON.parse(localStorage.getItem("krishi_registered_users") || "[]");
    const existing = users.find(u => u.email === email);
    if (existing) {
      showAuthError("An account with this email address already exists. Please log in.");
      return;
    }

    const passwordHash = await hashPassword(password);
    const newUser = {
      id: `user_${Date.now()}`,
      email,
      fullName: name,
      role,
      secondaryRole: alsoOwnsMachinery ? "owner" : null,
      phone: phone.replace(/\D/g, ""),
      state,
      district,
      village,
      passwordHash,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    localStorage.setItem("krishi_registered_users", JSON.stringify(users));

    currentUser = { ...newUser };
    delete currentUser.passwordHash;

    // Save session (7 days)
    const session = {
      user: currentUser,
      token: `token_${Date.now()}`,
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000
    };
    localStorage.setItem("krishi_auth_session", JSON.stringify(session));
  }

  // Success
  closeModal("authModal");
  updateNavAuthUI();
  showToast(`Welcome to KrishiSetu AI, ${currentUser.fullName}!`, "🌱");

  // Resume any action that triggered the login requirement
  resumePendingAction();
}

// ----------------------------------------------------
// Login (Sign In)
// ----------------------------------------------------
async function handleUserLogin(event) {
  event.preventDefault();

  const email = document.getElementById("loginEmail")?.value.trim().toLowerCase();
  const password = document.getElementById("loginPassword")?.value;
  const rememberMe = document.getElementById("loginRememberMe")?.checked || true;

  if (!email || !password) {
    showAuthError("Please enter your email and password.");
    return;
  }

  // 1. If Supabase Cloud is configured
  if (window.SupabaseConfig && window.SupabaseConfig.isConfigured() && window.krishiSupabase) {
    try {
      const { data, error } = await window.krishiSupabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        showAuthError(`Login failed: ${error.message}`);
        return;
      }

      currentUser = formatSupabaseUser(data.user);
    } catch (err) {
      showAuthError(`Supabase connection error: ${err.message}`);
      return;
    }
  } else {
    // 2. Local Cryptographic Login (SHA-256)
    const users = JSON.parse(localStorage.getItem("krishi_registered_users") || "[]");
    const enteredHash = await hashPassword(password);
    const user = users.find(u => u.email === email && u.passwordHash === enteredHash);

    if (!user) {
      showAuthError("Invalid email or password. Please try again or use a demo account.");
      return;
    }

    currentUser = { ...user };
    delete currentUser.passwordHash;

    const expiryTime = rememberMe ? 7 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
    const session = {
      user: currentUser,
      token: `token_${Date.now()}`,
      expiresAt: Date.now() + expiryTime
    };
    localStorage.setItem("krishi_auth_session", JSON.stringify(session));
  }

  // Success
  closeModal("authModal");
  updateNavAuthUI();
  showToast(`Welcome back, ${currentUser.fullName}!`, "🌾");

  // Resume any action that triggered the login requirement
  resumePendingAction();
}

// ----------------------------------------------------
// Demo Quick Login (One-Click Testing for Hackathon)
// ----------------------------------------------------
async function quickDemoLogin(role) {
  const users = JSON.parse(localStorage.getItem("krishi_registered_users") || "[]");
  const target = users.find(u => u.role === role) || initialDemoUsers.find(u => u.role === role);

  if (!target) return;

  currentUser = { ...target };
  delete currentUser.passwordHash;

  const session = {
    user: currentUser,
    token: `token_demo_${Date.now()}`,
    expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000
  };
  localStorage.setItem("krishi_auth_session", JSON.stringify(session));

  closeModal("authModal");
  updateNavAuthUI();
  showToast(`Logged in as demo ${currentUser.role}: ${currentUser.fullName}`, "🔑");

  resumePendingAction();
}

// ----------------------------------------------------
// Logout
// ----------------------------------------------------
async function handleUserLogout() {
  if (window.SupabaseConfig && window.SupabaseConfig.isConfigured() && window.krishiSupabase) {
    try {
      await window.krishiSupabase.auth.signOut();
    } catch (e) {
      console.warn("Supabase signOut warning:", e);
    }
  }

  localStorage.removeItem("krishi_auth_session");
  currentUser = null;

  closeModal("userProfileModal");
  updateNavAuthUI();
  showToast("You have been logged out. Namaste!", "👋");
}

// ----------------------------------------------------
// Forgot Password Flow
// ----------------------------------------------------
async function handleForgotPassword(event) {
  event.preventDefault();

  const email = document.getElementById("forgotEmail")?.value.trim().toLowerCase();
  if (!email) {
    showAuthError("Please enter your email address.");
    return;
  }

  if (window.SupabaseConfig && window.SupabaseConfig.isConfigured() && window.krishiSupabase) {
    try {
      const { error } = await window.krishiSupabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin
      });
      if (error) {
        showAuthError(error.message);
        return;
      }
    } catch (e) {
      showAuthError(`Supabase error: ${e.message}`);
      return;
    }
  }

  const msgBox = document.getElementById("forgotSuccessMsg");
  if (msgBox) {
    msgBox.style.display = "block";
    msgBox.innerHTML = `✅ Password reset instructions sent to <strong>${email}</strong>. Please check your inbox.`;
  }
  showToast("Password reset link sent to your email.", "📧");
}

// ----------------------------------------------------
// Profile Editing
// ----------------------------------------------------
async function handleSaveProfile(event) {
  event.preventDefault();

  if (!currentUser) return;

  const name = document.getElementById("profileFullName")?.value.trim();
  const phone = document.getElementById("profilePhone")?.value.trim();
  const district = document.getElementById("profileDistrict")?.value;
  const village = document.getElementById("profileVillage")?.value.trim();

  if (!name) {
    alert("Full name is required.");
    return;
  }

  currentUser.fullName = name;
  currentUser.phone = phone ? phone.replace(/\D/g, "") : currentUser.phone;
  currentUser.district = district || currentUser.district;
  currentUser.village = village || currentUser.village;

  // Update in localStorage
  const users = JSON.parse(localStorage.getItem("krishi_registered_users") || "[]");
  const idx = users.findIndex(u => u.id === currentUser.id || u.email === currentUser.email);
  if (idx !== -1) {
    users[idx] = { ...users[idx], ...currentUser };
    localStorage.setItem("krishi_registered_users", JSON.stringify(users));
  }

  // Update active session
  const session = JSON.parse(localStorage.getItem("krishi_auth_session") || "{}");
  session.user = currentUser;
  localStorage.setItem("krishi_auth_session", JSON.stringify(session));

  updateNavAuthUI();
  closeModal("userProfileModal");
  showToast("Your profile has been updated!", "👤");
}

// ----------------------------------------------------
// Protected Actions & Authorization Guard
// ----------------------------------------------------
function requireAuth(actionCallback, roleRequired = null, friendlyNotice = null) {
  if (isAuthenticated()) {
    if (roleRequired && currentUser.role !== roleRequired && currentUser.secondaryRole !== roleRequired) {
      alert(`⚠️ This feature is reserved for accounts with the ${roleRequired.toUpperCase()} role. Your current account role is: ${currentUser.role}.`);
      return;
    }
    actionCallback();
  } else {
    // Save intended action to resume after login
    pendingAuthAction = {
      callback: actionCallback,
      roleRequired
    };

    const notice = friendlyNotice || "Please log in or create a free account to continue.";
    openAuthModal("login", notice);
  }
}

function resumePendingAction() {
  if (pendingAuthAction && typeof pendingAuthAction.callback === "function") {
    const act = pendingAuthAction;
    pendingAuthAction = null;
    setTimeout(() => {
      act.callback();
    }, 200);
  }
}

// ----------------------------------------------------
// UI Renderers & Helpers
// ----------------------------------------------------
function updateNavAuthUI() {
  const authBtn = document.getElementById("navAuthBtn");
  const userPill = document.getElementById("navUserPill");
  const avatarEl = document.getElementById("navUserAvatar");
  const nameEl = document.getElementById("navUserName");
  const roleEl = document.getElementById("navUserRole");

  if (!authBtn || !userPill) return;

  if (currentUser) {
    authBtn.style.display = "none";
    userPill.style.display = "inline-flex";

    const initials = currentUser.fullName ? currentUser.fullName.charAt(0).toUpperCase() : "U";
    if (avatarEl) avatarEl.innerText = initials;
    if (nameEl) nameEl.innerText = currentUser.fullName.split(" ")[0];
    if (roleEl) {
      const roleIcons = { farmer: "👨‍🌾 Farmer", owner: "🚜 Owner", buyer: "🏢 Buyer" };
      roleEl.innerText = roleIcons[currentUser.role] || currentUser.role;
    }
  } else {
    authBtn.style.display = "inline-flex";
    userPill.style.display = "none";
  }
}

function openAuthModal(tab = "login", noticeMessage = "") {
  const alertBox = document.getElementById("authAlertBox");
  if (alertBox) {
    if (noticeMessage) {
      alertBox.innerHTML = `👋 ${escapeHtml(noticeMessage)}`;
      alertBox.style.display = "block";
    } else {
      alertBox.style.display = "none";
    }
  }

  switchAuthTab(tab);
  openModal("authModal");
}

function switchAuthTab(tabName) {
  const tabs = ["login", "signup", "forgot", "supabase"];
  tabs.forEach(t => {
    const btn = document.getElementById(`authTab${capitalize(t)}Btn`);
    const pane = document.getElementById(`authTab${capitalize(t)}`);
    if (btn) btn.classList.toggle("active", t === tabName);
    if (pane) pane.style.display = t === tabName ? "block" : "none";
  });

  const alertBox = document.getElementById("authAlertBox");
  if (alertBox && !pendingAuthAction) alertBox.style.display = "none";
}

function openUserProfileModal() {
  if (!currentUser) {
    openAuthModal("login");
    return;
  }

  // Populate Profile Modal fields
  const avatarEl = document.getElementById("profileAvatarLarge");
  const nameEl = document.getElementById("profileModalName");
  const emailEl = document.getElementById("profileModalEmail");
  const badgeEl = document.getElementById("profileModalRoleBadge");

  const inputName = document.getElementById("profileFullName");
  const inputPhone = document.getElementById("profilePhone");
  const inputDistrict = document.getElementById("profileDistrict");
  const inputVillage = document.getElementById("profileVillage");

  const initials = currentUser.fullName ? currentUser.fullName.charAt(0).toUpperCase() : "U";
  if (avatarEl) avatarEl.innerText = initials;
  if (nameEl) nameEl.innerText = currentUser.fullName;
  if (emailEl) emailEl.innerText = currentUser.email;

  const roleLabels = {
    farmer: "🌾 Registered Farmer",
    owner: "🚜 Agricultural Machinery Owner",
    buyer: "🤝 Licensed Buyer / Aggregator"
  };
  if (badgeEl) badgeEl.innerText = roleLabels[currentUser.role] || currentUser.role;

  if (inputName) inputName.value = currentUser.fullName;
  if (inputPhone) inputPhone.value = currentUser.phone || "";
  if (inputDistrict) inputDistrict.value = currentUser.district || "Mandya";
  if (inputVillage) inputVillage.value = currentUser.village || "";

  renderProfileShortcuts();
  openModal("userProfileModal");
}

function renderProfileShortcuts() {
  const container = document.getElementById("profileShortcutsContainer");
  if (!container || !currentUser) return;

  const role = currentUser.role;
  let shortcuts = [];

  if (role === "farmer") {
    shortcuts = [
      { icon: "🌾", title: "Sell Crops", action: "closeModal('userProfileModal'); switchView('marketplace', 'list');" },
      { icon: "💰", title: "Profit Calculator", action: "closeModal('userProfileModal'); openModal('calculatorModal');" },
      { icon: "🚜", title: "Rent Machinery", action: "closeModal('userProfileModal'); openModal('machineryModal');" },
      { icon: "📬", title: "My Crop Enquiries", action: "closeModal('userProfileModal'); switchView('marketplace', 'enquiries');" }
    ];
  } else if (role === "owner") {
    shortcuts = [
      { icon: "🚜", title: "My Machinery", action: "closeModal('userProfileModal'); openModal('machineryModal'); switchMachineryTab('owner');" },
      { icon: "➕", title: "List Machinery", action: "closeModal('userProfileModal'); openModal('machineryModal'); switchMachineryTab('list');" },
      { icon: "📋", title: "Booking Requests", action: "closeModal('userProfileModal'); openModal('machineryModal'); switchMachineryTab('bookings'); switchBookingSubtab('incoming');" }
    ];
  } else {
    // Buyer
    shortcuts = [
      { icon: "🛒", title: "Browse Crops", action: "closeModal('userProfileModal'); switchView('marketplace', 'browse');" },
      { icon: "📬", title: "My Submitted Bids", action: "closeModal('userProfileModal'); switchView('marketplace', 'enquiries');" },
      { icon: "🤝", title: "Verified Buyers", action: "closeModal('userProfileModal'); switchView('marketplace', 'buyers');" }
    ];
  }

  container.innerHTML = shortcuts.map(s => `
    <div class="profile-shortcut-card" onclick="${s.action}">
      <div style="font-size: 1.6rem; margin-bottom: 4px;">${s.icon}</div>
      <strong style="color: var(--color-forest); font-size: 0.85rem;">${s.title}</strong>
    </div>
  `).join("");
}

function showAuthError(msg) {
  const alertBox = document.getElementById("authAlertBox");
  if (alertBox) {
    alertBox.innerHTML = `⚠️ <strong>Error:</strong> ${escapeHtml(msg)}`;
    alertBox.style.display = "block";
    alertBox.scrollIntoView({ behavior: "smooth", block: "nearest" });
  } else {
    alert(msg);
  }
}

// ----------------------------------------------------
// Supabase Cloud Configuration Handlers
// ----------------------------------------------------
function updateCloudStatusUI() {
  const badge = document.getElementById("supabaseCloudStatusBadge");
  const urlInput = document.getElementById("cfgSupabaseUrl");
  const keyInput = document.getElementById("cfgSupabaseAnonKey");

  if (!badge) return;

  const isConfigured = window.SupabaseConfig && window.SupabaseConfig.isConfigured();
  if (isConfigured) {
    badge.className = "supabase-badge-status status-cloud-active";
    badge.innerHTML = "🟢 Supabase Cloud Active (PostgreSQL & RLS Connected)";
  } else {
    badge.className = "supabase-badge-status status-local-active";
    badge.innerHTML = "🟡 Local Auth Engine Active (Zero-Config Development)";
  }

  if (urlInput && window.SupabaseConfig) urlInput.value = window.SupabaseConfig.getUrl();
  if (keyInput && window.SupabaseConfig) keyInput.value = window.SupabaseConfig.getAnonKey();
}

function handleSaveSupabaseConfig(event) {
  event.preventDefault();

  const url = document.getElementById("cfgSupabaseUrl")?.value.trim();
  const anonKey = document.getElementById("cfgSupabaseAnonKey")?.value.trim();

  try {
    window.SupabaseConfig.saveConfig(url, anonKey);
    updateCloudStatusUI();
    showToast("Supabase configuration saved! Connected to cloud backend.", "☁️");
    switchAuthTab("login");
  } catch (err) {
    alert(`Configuration Error: ${err.message}`);
  }
}

function handleClearSupabaseConfig() {
  if (confirm("Disconnect Supabase Cloud and revert to Local Cryptographic Auth?")) {
    window.SupabaseConfig.clearConfig();
    updateCloudStatusUI();
    showToast("Disconnected Supabase. Running in Local Mode.", "ℹ️");
  }
}

// Select role card in registration
function selectRoleCard(role) {
  document.querySelectorAll(".role-card-select").forEach(card => card.classList.remove("selected"));
  const target = document.getElementById(`roleCard_${role}`);
  const radio = document.getElementById(`radioRole_${role}`);

  if (target) target.classList.add("selected");
  if (radio) radio.checked = true;

  // Show/hide secondary role checkbox
  const secondaryGroup = document.getElementById("secondaryRoleOptionBox");
  if (secondaryGroup) {
    secondaryGroup.style.display = role === "farmer" ? "block" : "none";
  }
}

// Initialize on script execution
if (typeof window !== "undefined") {
  window.addEventListener("DOMContentLoaded", () => {
    initAuth();
  });
}
