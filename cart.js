// cart.js
// This module manages the shopping cart using localStorage.

const CART_KEY = 'esi_cart';

// Helper function to get the cart from localStorage
function getCart() {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
}

// Helper function to save the cart to localStorage
function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    // Dispatch a custom event so the header can update its count
    window.dispatchEvent(new CustomEvent('cartUpdated'));
}

/**
 * Adds an item to the cart.
 * @param {object} item - The item to add (e.g., { id, name, price, quantity, image })
 */
export function addToCart(item) {
    const cart = getCart();
    const existingItemIndex = cart.findIndex(i => i.id === item.id);

    if (existingItemIndex > -1) {
        // Item already in cart, update quantity
        cart[existingItemIndex].quantity += item.quantity;
    } else {
        // New item
        cart.push(item);
    }
    saveCart(cart);
}

/**
 * Removes an item from the cart by its ID.
 * @param {string} itemId - The ID of the item to remove.
 */
export function removeFromCart(itemId) {
    let cart = getCart();
    cart = cart.filter(item => item.id !== itemId);
    saveCart(cart);
}

/**
 * Updates the quantity of an item in the cart.
 * @param {string} itemId - The ID of the item.
 * @param {number} quantity - The new quantity.
 */
export function updateQuantity(itemId, quantity) {
    const cart = getCart();
    const itemIndex = cart.findIndex(i => i.id === itemId);

    if (itemIndex > -1) {
        if (quantity <= 0) {
            // Remove item if quantity is 0 or less
            cart.splice(itemIndex, 1);
        } else {
            cart[itemIndex].quantity = quantity;
        }
        saveCart(cart);
    }
}

/**
 * @returns {array} The array of items in the cart.
 */
export function getCartItems() {
    return getCart();
}

/**
 * @returns {number} The total number of items (not unique) in the cart.
 */
export function getCartCount() {
    const cart = getCart();
    return cart.reduce((total, item) => total + item.quantity, 0);
}

/**
 * @returns {number} The total price of all items in the cart.
 */
export function getCartTotal() {
    const cart = getCart();
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

/**
 * Clears all items from the cart.
 */
export function clearCart() {
    saveCart([]);
}
