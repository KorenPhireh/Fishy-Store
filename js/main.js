// Main JavaScript for Product Pages
document.addEventListener('DOMContentLoaded', function() {
    // Initialize auth system
    if (typeof auth !== 'undefined') {
        auth.updateUI();
    }

    const orderForm = document.getElementById('order-form');
    if (orderForm) {
        orderForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Check if user is logged in
            if (!auth || !auth.isLoggedIn()) {
                alert('Please log in to complete your purchase.');
                window.location.href = '../login.html';
                return;
            }
            
            // Get form data
            const formData = new FormData(this);
            const productName = document.querySelector('.detail-info h2').textContent;
            const productPrice = document.querySelector('.price').textContent.replace('$', '');
            const robloxUsername = formData.get('roblox-username');
            
            // Validate Roblox username
            if (!robloxUsername || robloxUsername.trim().length < 3) {
                alert('Please enter a valid Roblox username (at least 3 characters)');
                return;
            }
            
            // Create order object
            const order = {
                id: 'BR' + Date.now(),
                product: productName,
                price: parseFloat(productPrice),
                username: robloxUsername.trim(),
                email: auth.getCurrentUser().email,
                customerId: auth.getCurrentUser().id,
                customerUsername: auth.getCurrentUser().username,
                status: 'pending',
                timestamp: new Date().toISOString(),
                chatMessages: [
                    {
                        sender: 'system',
                        text: `Order placed for ${productName}. Customer: ${robloxUsername}`,
                        timestamp: new Date().toISOString()
                    }
                ]
            };
            
            // Save order to localStorage
            saveOrder(order);
            
            // Send receipt
            auth.sendReceipt(order);
            
            // Show success message
            showOrderConfirmation(order);
        });
    }
    
    // Setup logout button if it exists
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            if (auth) {
                auth.logout();
            }
        });
    }
});

function saveOrder(order) {
    let orders = JSON.parse(localStorage.getItem('brainrot_orders')) || [];
    orders.push(order);
    localStorage.setItem('brainrot_orders', JSON.stringify(orders));
    console.log('Order saved:', order);
}

function showOrderConfirmation(order) {
    const orderForm = document.getElementById('order-form');
    const orderStatus = document.getElementById('order-status');
    const orderIdDisplay = document.getElementById('order-id-display');
    
    if (orderForm) orderForm.style.display = 'none';
    if (orderStatus) orderStatus.style.display = 'block';
    if (orderIdDisplay) orderIdDisplay.textContent = order.id;
    
    // Show alert confirmation
    setTimeout(() => {
        alert(`🎉 Order #${order.id} Confirmed!\n\nProduct: ${order.product}\nPrice: $${order.price}\n\nAn admin will contact you shortly to arrange delivery.`);
    }, 500);
}

// Utility function to check if user can purchase
function canPurchase() {
    return auth && auth.isLoggedIn();
}

// Add to auth system for receipt sending
if (typeof AuthSystem !== 'undefined') {
    AuthSystem.prototype.sendReceipt = function(order) {
        if (this.currentUser && this.currentUser.email) {
            const receipt = {
                to: this.currentUser.email,
                subject: `Steal a Brainrot - Order Confirmation #${order.id}`,
                body: `
Thank you for your purchase!

Order Details:
- Product: ${order.product}
- Price: $${order.price}
- Order ID: ${order.id}
- Date: ${new Date(order.timestamp).toLocaleDateString()}
- Roblox Username: ${order.username}

An admin will contact you shortly to arrange delivery.

Thank you for choosing Steal a Brainrot!
                `.trim()
            };
            
            console.log('📧 Receipt sent:', receipt);
            // In a real application, you would send an actual email here
        }
    };
}