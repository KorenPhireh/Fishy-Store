// Admin Panel with WhatsApp-style Chat
let currentOrder = null;
let orders = [];
let chatInterval = null;

document.addEventListener('DOMContentLoaded', function() {
    loadOrders();
    setupChatFunctionality();
});

function setupChatFunctionality() {
    // Enter key to send message
    document.getElementById('message-input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
}

function loadOrders() {
    orders = JSON.parse(localStorage.getItem('brainrot_orders')) || [];
    updateOrderCounts();
    displayOrders(orders.filter(order => order.status === 'pending'));
}

function updateOrderCounts() {
    const pendingCount = orders.filter(order => order.status === 'pending').length;
    const completedCount = orders.filter(order => order.status === 'completed').length;
    
    document.getElementById('pending-count').textContent = pendingCount;
    document.getElementById('completed-count').textContent = completedCount;
}

function displayOrders(ordersToShow) {
    const ordersGrid = document.getElementById('orders-grid');
    const noOrders = document.getElementById('no-orders');
    
    if (ordersToShow.length === 0) {
        ordersGrid.innerHTML = '';
        ordersGrid.appendChild(noOrders);
        noOrders.style.display = 'block';
        return;
    }
    
    noOrders.style.display = 'none';
    ordersGrid.innerHTML = '';
    
    ordersToShow.forEach(order => {
        const orderCard = createOrderCard(order);
        ordersGrid.appendChild(orderCard);
    });
}

function createOrderCard(order) {
    const card = document.createElement('div');
    card.className = 'order-card';
    card.innerHTML = `
        <div class="order-header">
            <h3 class="order-title">${order.product}</h3>
            <span class="order-id">${order.id}</span>
        </div>
        <div class="order-details">
            <div class="order-detail">
                <span>Customer:</span>
                <span>${order.username}</span>
            </div>
            <div class="order-detail">
                <span>Price:</span>
                <span>$${order.price}</span>
            </div>
            <div class="order-detail">
                <span>Date:</span>
                <span>${new Date(order.timestamp).toLocaleDateString()}</span>
            </div>
        </div>
        <div class="order-status ${order.status}">${order.status.toUpperCase()}</div>
        <div class="order-actions">
            <button class="chat-btn" onclick="openChat('${order.id}')">
                💬 Open Chat
            </button>
            <button class="complete-btn" onclick="completeOrder('${order.id}')">
                ✅ Complete
            </button>
        </div>
    `;
    return card;
}

function openChat(orderId) {
    currentOrder = orders.find(order => order.id === orderId);
    if (!currentOrder) return;
    
    // Initialize chat messages if not exists
    if (!currentOrder.chatMessages) {
        currentOrder.chatMessages = [
            {
                sender: 'system',
                text: 'Chat started. You can now communicate with the customer.',
                timestamp: new Date().toISOString()
            }
        ];
    }
    
    document.getElementById('chat-interface').style.display = 'flex';
    document.getElementById('chat-customer-name').textContent = currentOrder.username;
    document.getElementById('chat-order-info').textContent = 
        `${currentOrder.id} • $${currentOrder.price}`;
    
    loadChatMessages();
    
    // Simulate customer responses (in real app, this would be WebSockets)
    startChatSimulation();
}

function closeChat() {
    document.getElementById('chat-interface').style.display = 'none';
    currentOrder = null;
    stopChatSimulation();
}

function loadChatMessages() {
    const messagesDiv = document.getElementById('chat-messages');
    messagesDiv.innerHTML = '';
    
    if (currentOrder.chatMessages) {
        currentOrder.chatMessages.forEach(msg => {
            const messageEl = document.createElement('div');
            messageEl.className = `message ${msg.sender}`;
            messageEl.innerHTML = `<p>${msg.text}</p>`;
            messagesDiv.appendChild(messageEl);
        });
    }
    
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function sendMessage() {
    const input = document.getElementById('message-input');
    const message = input.value.trim();
    
    if (message && currentOrder) {
        // Add admin message
        const newMessage = {
            sender: 'admin',
            text: message,
            timestamp: new Date().toISOString()
        };
        
        if (!currentOrder.chatMessages) currentOrder.chatMessages = [];
        currentOrder.chatMessages.push(newMessage);
        
        // Update localStorage
        updateOrderInStorage();
        
        // Update UI
        loadChatMessages();
        input.value = '';
        
        // Simulate customer response after delay
        setTimeout(simulateCustomerResponse, 2000);
    }
}

function simulateCustomerResponse() {
    if (!currentOrder) return;
    
    const responses = [
        "Thanks! When can I expect the item?",
        "Great! How do I receive it in Roblox?",
        "Okay, I'm ready. What's next?",
        "Can you send me a screenshot of the item?",
        "What's your Roblox username so I can add you?",
        "I'm online now. Ready when you are!",
        "Do you accept Robux instead?",
        "Can I get a discount if I buy multiple?",
        "What's the estimated delivery time?",
        "Thanks for the quick response!"
    ];
    
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    
    const customerMessage = {
        sender: 'customer',
        text: randomResponse,
        timestamp: new Date().toISOString()
    };
    
    currentOrder.chatMessages.push(customerMessage);
    updateOrderInStorage();
    loadChatMessages();
}

function startChatSimulation() {
    // Simulate occasional customer messages
    chatInterval = setInterval(() => {
        if (currentOrder && Math.random() > 0.7) {
            simulateCustomerResponse();
        }
    }, 10000); // Every 10 seconds
}

function stopChatSimulation() {
    if (chatInterval) {
        clearInterval(chatInterval);
        chatInterval = null;
    }
}

function completeCurrentOrder() {
    if (currentOrder) {
        completeOrder(currentOrder.id);
    }
}

function completeOrder(orderId) {
    if (confirm('Mark this order as completed? This will close the chat.')) {
        const orderIndex = orders.findIndex(order => order.id === orderId);
        if (orderIndex !== -1) {
            orders[orderIndex].status = 'completed';
            orders[orderIndex].completedAt = new Date().toISOString();
            localStorage.setItem('brainrot_orders', JSON.stringify(orders));
            
            loadOrders();
            closeChat();
            showNotification('Order marked as completed! 🎉');
        }
    }
}

function updateOrderInStorage() {
    const orderIndex = orders.findIndex(order => order.id === currentOrder.id);
    if (orderIndex !== -1) {
        orders[orderIndex] = currentOrder;
        localStorage.setItem('brainrot_orders', JSON.stringify(orders));
    }
}

function showNotification(message) {
    // Create a simple notification
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #00cc00;
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        z-index: 1001;
        font-weight: bold;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        document.body.removeChild(notification);
    }, 3000);
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        window.location.href = '../login.html';
    }
}

// Close chat when clicking outside (with escape key)
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && currentOrder) {
        closeChat();
    }
});