// app.js
import { getCartCount } from './cart.js';
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut, sendPasswordResetEmail, updateProfile, sendEmailVerification } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyARtCtTno1l7p6LsfaqliTShI8idmfQ0Js",
    authDomain: "elitescienceinstitutes.firebaseapp.com",
    projectId: "elitescienceinstitutes",
    storageBucket: "elitescienceinstitutes.appspot.com",
    messagingSenderId: "66488336069",
    appId: "1:66488336069:web:0ee8c4af4d9b1a3c803aac"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const storage = getStorage(app);

let currentUser = null;

// --- DOM Elements ---
const mobileMenuButton = document.getElementById('mobile-menu-button');
const mobileMenu = document.getElementById('mobile-menu');
const loginBtn = document.getElementById('login-btn');
const mobileLoginBtn = document.getElementById('mobile-login-btn');
const logoutBtn = document.getElementById('logout-btn');
const userProfile = document.getElementById('user-profile');
const userProfileTrigger = document.getElementById('user-profile-trigger');
const profileDropdown = document.getElementById('profile-dropdown');
const userDisplayName = document.getElementById('user-display-name');
const userAvatar = document.getElementById('user-avatar');
const userIcon = document.getElementById('user-icon');
const avatarSpinner = document.getElementById('avatar-spinner');
const avatarUploadInput = document.getElementById('avatar-upload');
const verificationStatus = document.getElementById('verification-status');
const resendVerificationBtn = document.getElementById('resend-verification-btn');

// Modal elements
const authModal = document.getElementById('auth-modal');
const closeModalBtn = document.getElementById('close-modal-btn');
const authTitle = document.getElementById('auth-title');
const authFullNameInput = document.getElementById('auth-full-name');
const authEmailInput = document.getElementById('auth-email');
const authMobileInput = document.getElementById('auth-mobile');
const authPasswordInput = document.getElementById('auth-password');
const authActionBtn = document.getElementById('auth-action-btn');
const authActionText = document.getElementById('auth-action-text');
const authSpinner = document.getElementById('auth-spinner');
const authToggleText = document.getElementById('auth-toggle-text');
const authMessage = document.getElementById('auth-message');
const fullNameContainer = document.getElementById('full-name-container');
const mobileContainer = document.getElementById('mobile-container');
const passwordField = document.getElementById('password-container-div');
const forgotPasswordContainer = document.getElementById('forgot-password-container');
const forgotPasswordLink = document.getElementById('forgot-password-link');
const backToLoginContainer = document.getElementById('back-to-login-container');
const backToLoginLink = document.getElementById('back-to-login-link');

// Toast Notification Elements
const toast = document.getElementById('toast-notification');
const toastMessage = document.getElementById('toast-message');

// Tab Elements
const phdTabButtons = document.querySelectorAll('.phd-tab-button');
if (phdTabButtons.length > 0) {
    const phdTabContents = document.querySelectorAll('.phd-tab-content');
    setupTabs(phdTabButtons, phdTabContents);
}

const newsTabButtons = document.querySelectorAll('.news-tab-button');
if (newsTabButtons.length > 0) {
    const newsTabContents = document.querySelectorAll('.news-tab-content');
    setupTabs(newsTabButtons, newsTabContents);
}

let authView = 'login'; // Can be 'login', 'signup', or 'reset'

// --- UI Logic ---
if (mobileMenuButton) {
    mobileMenuButton.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
    });
}

const openModal = () => {
    resetModalUI();
    authModal.classList.remove('opacity-0', 'pointer-events-none');
    authModal.querySelector('.modal-content').classList.remove('scale-95');
};

const closeModal = () => {
    authModal.classList.add('opacity-0', 'pointer-events-none');
    authModal.querySelector('.modal-content').classList.add('scale-95');
};

if (loginBtn) loginBtn.addEventListener('click', openModal);
if (mobileLoginBtn) mobileLoginBtn.addEventListener('click', openModal);
if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
if (authModal) {
    authModal.addEventListener('click', (e) => {
        if (e.target === authModal) {
            closeModal();
        }
    });
}

// Profile Dropdown Logic
if (userProfileTrigger) {
    userProfileTrigger.addEventListener('click', (e) => {
        e.stopPropagation();
        const isHidden = profileDropdown.classList.contains('hidden');
        if (isHidden) {
            profileDropdown.classList.remove('hidden');
            setTimeout(() => {
                profileDropdown.classList.remove('opacity-0', 'scale-95');
            }, 10);
        } else {
            profileDropdown.classList.add('opacity-0', 'scale-95');
            setTimeout(() => {
                profileDropdown.classList.add('hidden');
            }, 200);
        }
    });
}

window.addEventListener('click', () => {
    if (profileDropdown && !profileDropdown.classList.contains('hidden')) {
        profileDropdown.classList.add('opacity-0', 'scale-95');
        setTimeout(() => {
            profileDropdown.classList.add('hidden');
        }, 200);
    }
});

const updateAuthView = () => {
    showMessage('');
    fullNameContainer.classList.add('hidden');
    mobileContainer.classList.add('hidden');
    passwordField.classList.remove('hidden');
    authToggleText.classList.remove('hidden');
    forgotPasswordContainer.classList.add('hidden');
    backToLoginContainer.classList.add('hidden');

    if (authView === 'login') {
        authTitle.textContent = 'Login';
        authActionText.textContent = 'Login';
        forgotPasswordContainer.classList.remove('hidden');
        authToggleText.innerHTML = `Don't have an account? <button id="auth-toggle-link" class="font-medium text-blue-600 hover:text-blue-500">Sign Up</button>`;
        document.getElementById('auth-toggle-link').addEventListener('click', () => { authView = 'signup'; updateAuthView(); });
    } else if (authView === 'signup') {
        authTitle.textContent = 'Create Account';
        authActionText.textContent = 'Sign Up';
        fullNameContainer.classList.remove('hidden');
        mobileContainer.classList.remove('hidden');
        authToggleText.innerHTML = `Already have an account? <button id="auth-toggle-link" class="font-medium text-blue-600 hover:text-blue-500">Login</button>`;
        document.getElementById('auth-toggle-link').addEventListener('click', () => { authView = 'login'; updateAuthView(); });
    } else if (authView === 'reset') {
        authTitle.textContent = 'Reset Password';
        authActionText.textContent = 'Send Reset Link';
        passwordField.classList.add('hidden');
        authToggleText.classList.add('hidden');
        backToLoginContainer.classList.remove('hidden');
        showMessage('Enter your email to receive a password reset link.');
    }
};

if (document.getElementById('auth-toggle-link')) {
    document.getElementById('auth-toggle-link').addEventListener('click', () => {
        authView = 'signup';
        updateAuthView();
    });
}

if (forgotPasswordLink) {
    forgotPasswordLink.addEventListener('click', () => {
        authView = 'reset';
        updateAuthView();
    });
}

if (backToLoginLink) {
    backToLoginLink.addEventListener('click', () => {
        authView = 'login';
        updateAuthView();
    });
}

const updateUIForLogin = (user) => {
    currentUser = user;
    if (user) {
        if (loginBtn) loginBtn.classList.add('hidden');
        if (mobileLoginBtn) {
            mobileLoginBtn.textContent = 'Logged In';
            mobileLoginBtn.disabled = true;
        }
        if (userProfile) {
            userProfile.classList.remove('hidden');
            userProfile.classList.add('relative');
        }
        if (userDisplayName) userDisplayName.textContent = user.displayName || user.email;

        if (user.photoURL) {
            if (userAvatar) {
                userAvatar.src = user.photoURL;
                userAvatar.classList.remove('hidden');
            }
            if (userIcon) userIcon.classList.add('hidden');
        } else {
            if (userAvatar) userAvatar.classList.add('hidden');
            if (userIcon) userIcon.classList.remove('hidden');
        }

        if (!user.emailVerified) {
            if (verificationStatus) verificationStatus.classList.remove('hidden');
        } else {
            if (verificationStatus) verificationStatus.classList.add('hidden');
        }

    } else {
        if (loginBtn) loginBtn.classList.remove('hidden');
        if (mobileLoginBtn) {
            mobileLoginBtn.textContent = 'Login / Sign Up';
            mobileLoginBtn.disabled = false;
        }
        if (userProfile) {
            userProfile.classList.add('hidden');
            userProfile.classList.remove('relative');
        }
        if (userDisplayName) userDisplayName.textContent = '';
        sessionStorage.removeItem('verificationToastShown');
    }
};

// --- Cart Badge Update Logic ---
const cartCountBadge = document.getElementById('cart-count-badge');

function updateCartBadge() {
    if (cartCountBadge) {
        const count = getCartCount();
        cartCountBadge.textContent = count;
        if (count > 0) {
            cartCountBadge.classList.remove('hidden');
        } else {
            cartCountBadge.classList.add('hidden'); // Hide if cart is empty
        }
    }
}

// Update badge on initial page load
document.addEventListener('DOMContentLoaded', updateCartBadge);

// Update badge whenever the cart changes
window.addEventListener('cartUpdated', updateCartBadge);

// Tab switching logic
function setupTabs(buttons, contents) {
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            buttons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            const tab = button.dataset.tab;
            contents.forEach(content => {
                if (content.id.endsWith(tab)) {
                    content.classList.remove('hidden');
                } else {
                    content.classList.add('hidden');
                }
            });
        });
    });
}

// --- Firebase Auth Logic ---
onAuthStateChanged(auth, (user) => {
    // Reload user to get latest emailVerified state
    if (user) {
        user.reload().then(() => {
            updateUIForLogin(auth.currentUser);
        });
    } else {
        updateUIForLogin(null);
    }
});

if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        signOut(auth).catch((error) => {
            console.error('Logout Error:', error);
            showMessage('Failed to logout. Please try again.', 'error');
        });
    });
}

if (resendVerificationBtn) {
    resendVerificationBtn.addEventListener('click', () => {
        if (currentUser) {
            sendEmailVerification(currentUser)
                .then(() => {
                    showToast('Verification link sent again. Please check your inbox.', 'info');
                })
                .catch(error => {
                    showToast('Error sending verification link.', 'error');
                });
        }
    });
}

if (authActionBtn) {
    authActionBtn.addEventListener('click', async () => {
        const fullName = authFullNameInput.value.trim();
        const email = authEmailInput.value.trim();
        const password = authPasswordInput.value;

        if (!email) {
            showMessage('Please enter your email address.', 'error');
            return;
        }

        if (authView !== 'reset' && !password) {
            showMessage('Please enter your password.', 'error');
            return;
        }
        if (authView === 'signup' && !fullName) {
            showMessage('Please enter your full name.', 'error');
            return;
        }

        setLoading(authActionBtn, authActionText, authSpinner, true);

        if (authView === 'login') {
            signInWithEmailAndPassword(auth, email, password)
                .then((userCredential) => {
                    if (!userCredential.user.emailVerified) {
                        // The onAuthStateChanged will handle showing the verification status in the dropdown
                    }
                    showMessage('Login successful!', 'success');
                    setTimeout(closeModal, 1500);
                })
                .catch((error) => showMessage(getFriendlyErrorMessage(error.code), 'error'))
                .finally(() => setLoading(authActionBtn, authActionText, authSpinner, false));
        } else if (authView === 'signup') {
            try {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                await updateProfile(userCredential.user, { displayName: fullName });
                await sendEmailVerification(userCredential.user);

                updateUIForLogin(auth.currentUser);

                showMessage('Account created! A verification link has been sent to your email.', 'success');
                setTimeout(closeModal, 1500);
            } catch (error) {
                showMessage(getFriendlyErrorMessage(error.code), 'error');
            } finally {
                setLoading(authActionBtn, authActionText, authSpinner, false);
            }
        } else if (authView === 'reset') {
            sendPasswordResetEmail(auth, email)
                .then(() => showMessage('Password reset link sent! Please check your email.', 'success'))
                .catch((error) => showMessage(getFriendlyErrorMessage(error.code), 'error'))
                .finally(() => setLoading(authActionBtn, authActionText, authSpinner, false));
        }
    });
}

// --- Profile Picture Upload ---
if (avatarUploadInput) {
    avatarUploadInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file || !currentUser) return;

        const storageRef = ref(storage, `profile_pictures/${currentUser.uid}`);

        userIcon.classList.add('hidden');
        userAvatar.classList.add('hidden');
        avatarSpinner.classList.remove('hidden');

        uploadBytes(storageRef, file).then(snapshot => {
            return getDownloadURL(snapshot.ref);
        }).then(downloadURL => {
            return updateProfile(currentUser, { photoURL: downloadURL });
        }).then(() => {
            userAvatar.src = currentUser.photoURL;
            avatarSpinner.classList.add('hidden');
            userAvatar.classList.remove('hidden');
            showToast('Profile picture updated!', 'success');
        }).catch(error => {
            console.error("Error uploading profile picture: ", error);
            showToast('Failed to update picture.', 'error');
            avatarSpinner.classList.add('hidden');
            if (currentUser.photoURL) {
                userAvatar.classList.remove('hidden');
            } else {
                userIcon.classList.remove('hidden');
            }
        });
    });
}

// --- Helper Functions ---
function showMessage(msg, type = 'info') {
    if (authMessage) {
        authMessage.textContent = msg;
        authMessage.className = 'mt-4 text-center text-sm'; // reset classes
        switch (type) {
            case 'success':
                authMessage.classList.add('text-green-600');
                break;
            case 'error':
                authMessage.classList.add('text-red-600');
                break;
            default:
                authMessage.classList.add('text-gray-600');
        }
    }
}

function showToast(message, type = 'success') {
    if (toast) {
        toastMessage.textContent = message;
        toast.className = 'toast-notification fixed bottom-5 right-5 text-white py-3 px-6 rounded-lg shadow-lg transform translate-y-24 opacity-0 pointer-events-none z-50';

        if (type === 'success') {
            toast.classList.add('bg-green-600');
        } else if (type === 'info') {
            toast.classList.add('bg-blue-600');
        }
        else {
            toast.classList.add('bg-red-600');
        }

        toast.classList.remove('translate-y-24', 'opacity-0', 'pointer-events-none');

        setTimeout(() => {
            toast.classList.add('translate-y-24', 'opacity-0');
            setTimeout(() => {
                toast.classList.add('pointer-events-none');
            }, 300);
        }, 5000); // Hide after 5 seconds
    }
}
// *** MAKE TOAST GLOBAL ***
window.showToast = showToast;


function setLoading(button, textEl, spinnerEl, isLoading) {
    if (isLoading) {
        button.disabled = true;
        textEl.style.opacity = '0';
        spinnerEl.classList.remove('hidden');
    } else {
        button.disabled = false;
        textEl.style.opacity = '1';
        spinnerEl.classList.add('hidden');
    }
}

function resetModalUI() {
    authView = 'login';
    updateAuthView();
    authFullNameInput.value = '';
    authEmailInput.value = '';
    authMobileInput.value = '';
    authPasswordInput.value = '';
    showMessage('');
}

function getFriendlyErrorMessage(errorCode) {
    switch (errorCode) {
        case 'auth/invalid-email':
            return 'Please enter a valid email address.';
        case 'auth/user-not-found':
            return 'No account found with this email address.';
        case 'auth/wrong-password':
            return 'Invalid email or password.';
        case 'auth/email-already-in-use':
            return 'An account with this email already exists.';
        case 'auth/weak-password':
            return 'Password should be at least 6 characters long.';
        default:
            return 'An unknown error occurred. Please try again.';
    }
}
