// Task 3.2: Web Storage Implementation for Book Haven Bookstore
// Note: localStorage and sessionStorage APIs required for this assignment

// Global variables for storage management
let cart = [];
let customerOrders = [];

// Initialize storage when page loads
document.addEventListener('DOMContentLoaded', function() {
    initializeWebStorage();
    initializeEventListeners();
    loadCartFromStorage();
    updateCartDisplay();
});

// Initialize web storage functionality
function initializeWebStorage() {
    // Check if web storage is supported
    if (typeof(Storage) !== "undefined") {
        console.log("Web Storage is supported");
        
        // Initialize sessionStorage for cart if not exists
        if (!sessionStorage.getItem('bookHavenCart')) {
            sessionStorage.setItem('bookHavenCart', JSON.stringify([]));
        }
        
        // Initialize localStorage for customer orders if not exists
        if (!localStorage.getItem('bookHavenCustomerData')) {
            localStorage.setItem('bookHavenCustomerData', JSON.stringify([]));
        }
    } else {
        console.log("Web Storage not supported");
        alert("Your browser does not support Web Storage. Some features may not work properly.");
    }
}

// Load cart data from sessionStorage
function loadCartFromStorage() {
    try {
        const storedCart = sessionStorage.getItem('bookHavenCart');
        if (storedCart) {
            cart = JSON.parse(storedCart);
            console.log("Cart loaded from sessionStorage:", cart);
        }
    } catch (error) {
        console.error("Error loading cart from storage:", error);
        cart = []; // Fallback to empty cart
    }
}

// Save cart data to sessionStorage
function saveCartToStorage() {
    try {
        sessionStorage.setItem('bookHavenCart', JSON.stringify(cart));
        console.log("Cart saved to sessionStorage");
    } catch (error) {
        console.error("Error saving cart to storage:", error);
    }
}

// Load customer data from localStorage
function loadCustomerDataFromStorage() {
    try {
        const storedCustomerData = localStorage.getItem('bookHavenCustomerData');
        if (storedCustomerData) {
            customerOrders = JSON.parse(storedCustomerData);
            console.log("Customer data loaded from localStorage:", customerOrders);
            return customerOrders;
        }
        return [];
    } catch (error) {
        console.error("Error loading customer data from storage:", error);
        return [];
    }
}

// Save customer data to localStorage
function saveCustomerDataToStorage(customerData) {
    try {
        let existingData = loadCustomerDataFromStorage();
        existingData.push(customerData);
        localStorage.setItem('bookHavenCustomerData', JSON.stringify(existingData));
        console.log("Customer data saved to localStorage");
        return true;
    } catch (error) {
        console.error("Error saving customer data to storage:", error);
        return false;
    }
}

// Enhanced Add to Cart with sessionStorage
function handleAddToCart(event) {
    event.preventDefault();
    
    const bookItem = event.target.closest('.book-item');
    if (!bookItem) return;
    
    // Extract book information
    const title = bookItem.querySelector('.book-title')?.textContent || 'Unknown Book';
    const price = bookItem.querySelector('.book-price')?.textContent || '$0.00';
    const author = bookItem.querySelector('.book-author')?.textContent || 'Unknown Author';
    
    // Create cart item object with timestamp
    const cartItem = {
        id: Date.now(),
        title: title,
        author: author,
        price: price,
        quantity: 1,
        dateAdded: new Date().toISOString()
    };
    
    // Check if item already exists in cart
    const existingItemIndex = cart.findIndex(item => item.title === title);
    if (existingItemIndex > -1) {
        cart[existingItemIndex].quantity += 1;
    } else {
        cart.push(cartItem);
    }
    
    // Save updated cart to sessionStorage
    saveCartToStorage();
    
    // Update display
    updateCartDisplay();
    
    // Show success message
    alert('Item added to cart');
}

// Enhanced View Cart with sessionStorage data
function showCartContents() {
    // Load current cart from sessionStorage
    loadCartFromStorage();
    
    if (cart.length === 0) {
        alert('Your cart is empty');
        return;
    }
    
    let cartContents = 'Shopping Cart Contents:\n\n';
    let totalItems = 0;
    let totalPrice = 0;
    
    cart.forEach(item => {
        const itemPrice = parseFloat(item.price.replace('$', '')) || 0;
        const itemTotal = itemPrice * item.quantity;
        totalItems += item.quantity;
        totalPrice += itemTotal;
        
        cartContents += `${item.title}\n`;
        cartContents += `${item.author}\n`;
        cartContents += `${item.price} x ${item.quantity} = $${itemTotal.toFixed(2)}\n`;
        cartContents += `Added: ${new Date(item.dateAdded).toLocaleDateString()}\n\n`;
    });
    
    cartContents += `Total Items: ${totalItems}\n`;
    cartContents += `Total Price: $${totalPrice.toFixed(2)}`;
    
    alert(cartContents);
}

// Enhanced Clear Cart with sessionStorage clearing
function handleClearCart(event) {
    event.preventDefault();
    
    if (cart.length === 0) {
        alert('No items to clear');
        return;
    }
    
    const confirmClear = confirm('Are you sure you want to clear all items from your cart?');
    if (confirmClear) {
        // Clear cart array
        cart = [];
        
        // Clear sessionStorage
        try {
            sessionStorage.removeItem('bookHavenCart');
            sessionStorage.setItem('bookHavenCart', JSON.stringify([]));
            console.log("Cart cleared from sessionStorage");
        } catch (error) {
            console.error("Error clearing cart from storage:", error);
        }
        
        // Update display
        updateCartDisplay();
        alert('Cart cleared');
    }
}

// Enhanced Process Order with sessionStorage clearing
function handleProcessOrder(event) {
    event.preventDefault();
    
    // Load current cart from sessionStorage
    loadCartFromStorage();
    
    if (cart.length === 0) {
        alert('Cart is empty');
        return;
    }
    
    // Calculate order details
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = calculateCartTotal();
    
    const confirmOrder = confirm(`Process order for ${totalItems} item(s)? Total: $${totalPrice}`);
    if (confirmOrder) {
        // Create order record
        const orderData = {
            orderId: 'ORDER-' + Date.now(),
            items: [...cart],
            totalItems: totalItems,
            totalPrice: totalPrice,
            orderDate: new Date().toISOString(),
            status: 'Processed'
        };
        
        // Save order to localStorage (customer order history)
        try {
            let orderHistory = JSON.parse(localStorage.getItem('bookHavenOrderHistory') || '[]');
            orderHistory.push(orderData);
            localStorage.setItem('bookHavenOrderHistory', JSON.stringify(orderHistory));
            console.log("Order saved to localStorage:", orderData);
        } catch (error) {
            console.error("Error saving order to localStorage:", error);
        }
        
        // Clear cart after successful order
        cart = [];
        
        // Clear sessionStorage cart
        try {
            sessionStorage.removeItem('bookHavenCart');
            sessionStorage.setItem('bookHavenCart', JSON.stringify([]));
        } catch (error) {
            console.error("Error clearing cart after order:", error);
        }
        
        updateCartDisplay();
        alert('Thank you for your order');
    }
}

// Enhanced Contact Form with localStorage
function handleFormSubmission(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const customerData = {
        id: Date.now(),
        name: formData.get('name')?.trim(),
        email: formData.get('email')?.trim(),
        phone: formData.get('phone')?.trim() || '',
        message: formData.get('message')?.trim(),
        submissionDate: new Date().toISOString(),
        type: 'contact_form'
    };
    
    // Validate required fields
    if (!customerData.name || !customerData.email || !customerData.message) {
        alert('Please fill in all required fields.');
        return;
    }
    
    if (!isValidEmail(customerData.email)) {
        alert('Please enter a valid email address.');
        return;
    }
    
    // Save customer data to localStorage
    const saved = saveCustomerDataToStorage(customerData);
    
    if (saved) {
        alert('Thank you for your message');
        event.target.reset();
        console.log("Customer data saved:", customerData);
    } else {
        alert('There was an error saving your message. Please try again.');
    }
}

// Initialize all event listeners
function initializeEventListeners() {
    // Add to Cart buttons
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', handleAddToCart);
    });
    
    // Clear Cart buttons
    const clearCartButtons = document.querySelectorAll('.clear-btn, .cart-btn.clear-btn');
    clearCartButtons.forEach(button => {
        button.addEventListener('click', handleClearCart);
    });
    
    // Process Order buttons
    const processOrderButtons = document.querySelectorAll('.process-btn, .cart-btn.process-btn');
    processOrderButtons.forEach(button => {
        button.addEventListener('click', handleProcessOrder);
    });
    
    // View Cart buttons
    const viewCartButtons = document.querySelectorAll('.view-cart-btn');
    viewCartButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            showCartContents();
        });
    });
    
    // Contact form
    const contactForm = document.querySelector('.contact-form form');
    if (contactForm) {
        contactForm.addEventListener('submit', handleFormSubmission);
    }
    
    // Subscribe functionality (using localStorage for email preferences)
    const subscribeButtons = document.querySelectorAll('.subscribe-btn, .cta-button[href="#newsletter"]');
    subscribeButtons.forEach(button => {
        button.addEventListener('click', handleSubscribe);
    });
}

// Enhanced Subscribe with localStorage
function handleSubscribe(event) {
    event.preventDefault();
    
    const emailInput = document.querySelector('input[type="email"], .email-input, #newsletter-email');
    let email = '';
    
    if (emailInput) {
        email = emailInput.value.trim();
        if (email === '') {
            alert('Please enter your email address to subscribe.');
            return;
        }
        if (!isValidEmail(email)) {
            alert('Please enter a valid email address.');
            return;
        }
    }
    
    // Save subscription to localStorage
    try {
        let subscriptions = JSON.parse(localStorage.getItem('bookHavenSubscriptions') || '[]');
        
        // Check if email already exists
        const existingSubscription = subscriptions.find(sub => sub.email === email);
        if (existingSubscription) {
            alert('This email is already subscribed to our newsletter.');
            return;
        }
        
        // Add new subscription
        subscriptions.push({
            email: email,
            subscribeDate: new Date().toISOString(),
            status: 'active'
        });
        
        localStorage.setItem('bookHavenSubscriptions', JSON.stringify(subscriptions));
        console.log("Subscription saved to localStorage");
    } catch (error) {
        console.error("Error saving subscription:", error);
    }
    
    alert('Thank you for subscribing!');
    
    if (emailInput) {
        emailInput.value = '';
    }
}

// Update cart display with sessionStorage data
function updateCartDisplay() {
    // Load current cart from sessionStorage
    loadCartFromStorage();
    
    const cartElements = document.querySelectorAll('.cart');
    const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    cartElements.forEach(element => {
        if (element.textContent.includes('Cart')) {
            element.textContent = `Cart (${cartItemCount})`;
        }
    });
    
    // Update cart summary
    const cartSummary = document.querySelector('.cart-summary');
    if (cartSummary) {
        const total = calculateCartTotal();
        cartSummary.innerHTML = `<strong>Cart Summary:</strong> ${cartItemCount} items | Total: $${total}`;
    }
    
    // Update view cart buttons
    const viewCartButtons = document.querySelectorAll('.view-cart-btn');
    viewCartButtons.forEach(button => {
        button.textContent = `View Cart (${cartItemCount} items)`;
    });
}

// Calculate cart total from sessionStorage data
function calculateCartTotal() {
    return cart.reduce((total, item) => {
        const price = parseFloat(item.price.replace('$', '')) || 0;
        return total + (price * item.quantity);
    }, 0).toFixed(2);
}

// Email validation helper
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Utility function to view all stored data (for debugging)
function viewAllStorageData() {
    console.log("=== SessionStorage Data ===");
    console.log("Cart:", JSON.parse(sessionStorage.getItem('bookHavenCart') || '[]'));
    
    console.log("=== LocalStorage Data ===");
    console.log("Customer Data:", JSON.parse(localStorage.getItem('bookHavenCustomerData') || '[]'));
    console.log("Order History:", JSON.parse(localStorage.getItem('bookHavenOrderHistory') || '[]'));
    console.log("Subscriptions:", JSON.parse(localStorage.getItem('bookHavenSubscriptions') || '[]'));
}

// Clear all storage data (for testing purposes)
function clearAllStorageData() {
    if (confirm('Clear all stored data? This cannot be undone.')) {
        sessionStorage.clear();
        localStorage.removeItem('bookHavenCustomerData');
        localStorage.removeItem('bookHavenOrderHistory');
        localStorage.removeItem('bookHavenSubscriptions');
        
        cart = [];
        updateCartDisplay();
        
        console.log("All storage data cleared");
        alert('All stored data has been cleared');
    }
}
