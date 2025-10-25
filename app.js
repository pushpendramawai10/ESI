<script type="module">
        // Import Firebase modules
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
        const buyNowButtons = document.querySelectorAll('.buy-now-btn');
        
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
        mobileMenuButton.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });

        const openModal = () => {
            resetModalUI();
            authModal.classList.remove('opacity-0', 'pointer-events-none');
            authModal.querySelector('.modal-content').classList.remove('scale-95');
        };
        
        const closeModal = () => {
            authModal.classList.add('opacity-0', 'pointer-events-none');
            authModal.querySelector('.modal-content').classList.add('scale-95');
        };

        loginBtn.addEventListener('click', openModal);
        mobileLoginBtn.addEventListener('click', openModal);
        closeModalBtn.addEventListener('click', closeModal);
        authModal.addEventListener('click', (e) => {
            if (e.target === authModal) {
                closeModal();
            }
        });

        // Profile Dropdown Logic
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

        window.addEventListener('click', () => {
            if (!profileDropdown.classList.contains('hidden')) {
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
        
        document.getElementById('auth-toggle-link').addEventListener('click', () => {
             authView = 'signup';
             updateAuthView();
        });

        forgotPasswordLink.addEventListener('click', () => {
            authView = 'reset';
            updateAuthView();
        });

        backToLoginLink.addEventListener('click', () => {
            authView = 'login';
            updateAuthView();
        });

        const updateUIForLogin = (user) => {
            currentUser = user;
            if (user) {
                loginBtn.classList.add('hidden');
                mobileLoginBtn.textContent = 'Logged In';
                mobileLoginBtn.disabled = true;
                userProfile.classList.remove('hidden');
                userProfile.classList.add('relative'); // Ensure it's a positioning context
                userDisplayName.textContent = user.displayName || user.email;

                if (user.photoURL) {
                    userAvatar.src = user.photoURL;
                    userAvatar.classList.remove('hidden');
                    userIcon.classList.add('hidden');
                } else {
                    userAvatar.classList.add('hidden');
                    userIcon.classList.remove('hidden');
                }

                if (!user.emailVerified) {
                    verificationStatus.classList.remove('hidden');
                } else {
                    verificationStatus.classList.add('hidden');
                }

            } else {
                loginBtn.classList.remove('hidden');
                mobileLoginBtn.textContent = 'Login / Sign Up';
                mobileLoginBtn.disabled = false;
                userProfile.classList.add('hidden');
                userProfile.classList.remove('relative');
                userDisplayName.textContent = '';
                sessionStorage.removeItem('verificationToastShown');
            }
        };

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

        setupTabs(phdTabButtons, phdTabContents);
        setupTabs(newsTabButtons, newsTabContents);

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

        logoutBtn.addEventListener('click', () => {
            signOut(auth).catch((error) => {
                console.error('Logout Error:', error);
                showMessage('Failed to logout. Please try again.', 'error');
            });
        });

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
                        if(!userCredential.user.emailVerified) {
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

        // --- Profile Picture Upload ---
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
        
        
        // --- Payment Logic ---
        buyNowButtons.forEach(button => {
            button.addEventListener('click', () => {
                if (!currentUser) {
                    openModal();
                    showMessage('Please log in to purchase a course.', 'info');
                    return;
                }
                 if (!currentUser.emailVerified) {
                    showToast('Please verify your email before making a purchase.', 'error');
                    return;
                }
                
                const courseName = button.dataset.course;
                const amount = button.dataset.amount;
                initiatePayment(courseName, amount);
            });
        });
        
        function initiatePayment(courseName, amount) {
            const options = {
                key: "YOUR_KEY_ID_HERE", 
                amount: amount * 100,
                currency: "INR",
                name: "Elite Science Institute",
                description: `Payment for ${courseName}`,
                image: "data:image/png;base64,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",
                handler: function (response) {
                    console.log(response);
                    showToast(`Payment successful! Payment ID: ${response.razorpay_payment_id}`, 'success');
                },
                prefill: {
                    name: currentUser ? currentUser.displayName : "Customer Name",
                    email: currentUser ? currentUser.email : "",
                    contact: ""
                },
                notes: {
                    address: "Elite Science Institute Corporate Office"
                },
                theme: {
                    color: "#1d4ed8" // A nice blue
                }
            };
            const rzp1 = new Razorpay(options);
            rzp1.on('payment.failed', function (response){
                console.log(response);
                showToast(`Payment failed: ${response.error.description}`, 'error');
            });
            rzp1.open();
        }

        // --- Helper Functions ---
        function showMessage(msg, type = 'info') {
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
        
        function showToast(message, type = 'success') {
            toastMessage.textContent = message;
            toast.className = 'toast-notification fixed bottom-5 right-5 text-white py-3 px-6 rounded-lg shadow-lg transform translate-y-24 opacity-0 pointer-events-none z-50';
            
            if (type === 'success') {
                toast.classList.add('bg-green-600');
            } else if(type === 'info') {
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

    </script>
</body>
</html>


