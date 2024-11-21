let map;
let markers = {};
let socket;
let activeDeliveries = new Map();

// Initialize the dashboard
function initializeDashboard() {
    // Initialize socket connection
    socket = io();
    
    // Initialize Google Maps
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 12,
        center: { lat: 0, lng: 0 }
    });
    
    // Connect to admin dashboard
    socket.emit('admin-connect');
    
    // Socket event listeners
    socket.on('active-deliveries', handleActiveDeliveries);
    socket.on('delivery-update', handleDeliveryUpdate);
    socket.on('delivery-completed', handleDeliveryCompleted);
    socket.on('connect_error', handleConnectionError);
    
    // Initialize refresh button
    document.getElementById('refresh-btn')?.addEventListener('click', refreshDashboard);
    
    // Initial data load
    fetchDashboardData();
}

// Fetch initial dashboard data
async function fetchDashboardData() {
    try {
        const response = await fetch('/api/admin/dashboard');
        if (!response.ok) throw new Error('Failed to fetch dashboard data');
        
        const data = await response.json();
        updateDashboardStats(data);
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        showError('Failed to load dashboard data');
    }
}

// Handle active deliveries update
function handleActiveDeliveries(deliveries) {
    activeDeliveries.clear();
    clearDeliveryMarkers();
    
    deliveries.forEach(delivery => {
        activeDeliveries.set(delivery.deliveryId, delivery);
        addDeliveryMarker(delivery);
        addDeliveryToList(delivery);
    });
    
    updateDeliveryCount();
}

// Handle individual delivery update
function handleDeliveryUpdate(data) {
    const { deliveryId, location, status, estimatedArrival } = data;
    
    if (activeDeliveries.has(deliveryId)) {
        const delivery = activeDeliveries.get(deliveryId);
        delivery.location = location;
        delivery.status = status;
        delivery.estimatedArrival = estimatedArrival;
        
        updateDeliveryMarker(deliveryId, location);
        updateDeliveryListItem(delivery);
    }
}

// Add marker for delivery
function addDeliveryMarker(delivery) {
    const position = {
        lat: delivery.location.coordinates[1],
        lng: delivery.location.coordinates[0]
    };
    
    const marker = new google.maps.Marker({
        position: position,
        map: map,
        title: `Delivery ${delivery.deliveryId}`,
        icon: getMarkerIcon(delivery.status)
    });
    
    markers[delivery.deliveryId] = marker;
    
    // Add click listener
    marker.addListener('click', () => showDeliveryInfo(delivery));
}

// Update marker position
function updateDeliveryMarker(deliveryId, location) {
    const marker = markers[deliveryId];
    if (marker) {
        marker.setPosition({
            lat: location.coordinates[1],
            lng: location.coordinates[0]
        });
    }
}

// Clear all delivery markers
function clearDeliveryMarkers() {
    Object.values(markers).forEach(marker => marker.setMap(null));
    markers = {};
}

// Add delivery to list
function addDeliveryToList(delivery) {
    const listItem = createDeliveryListItem(delivery);
    document.getElementById('active-deliveries-list').appendChild(listItem);
}

// Create delivery list item
function createDeliveryListItem(delivery) {
    const item = document.createElement('a');
    item.className = `list-group-item list-group-item-action delivery-${delivery.status.toLowerCase()}`;
    item.id = `delivery-${delivery.deliveryId}`;
    item.innerHTML = `
        <div class="d-flex justify-content-between align-items-center">
            <h6 class="mb-1">Delivery ${delivery.deliveryId}</h6>
            <small>${delivery.status}</small>
        </div>
        <p class="mb-1">Agent: ${delivery.agentName}</p>
        <small>ETA: ${new Date(delivery.estimatedArrival).toLocaleTimeString()}</small>
    `;
    
    item.addEventListener('click', () => showDeliveryInfo(delivery));
    return item;
}

// Show delivery information
function showDeliveryInfo(delivery) {
    // Create info window content
    const content = `
        <div class="delivery-info-window">
            <h5>Delivery ${delivery.deliveryId}</h5>
            <p>Status: ${delivery.status}</p>
            <p>Agent: ${delivery.agentName}</p>
            <p>ETA: ${new Date(delivery.estimatedArrival).toLocaleTimeString()}</p>
        </div>
    `;
    
    // Show info window
    const infoWindow = new google.maps.InfoWindow({
        content: content
    });
    
    infoWindow.open(map, markers[delivery.deliveryId]);
}

// Update dashboard statistics
function updateDashboardStats(data) {
    document.getElementById('active-count').textContent = data.activeCount;
    document.getElementById('completed-count').textContent = data.completedToday;
    document.getElementById('delayed-count').textContent = data.delayedCount;
}

// Handle connection error
function handleConnectionError() {
    console.error('Connection to server lost');
    showError('Connection lost. Attempting to reconnect...');
}

// Show error message
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'alert alert-danger';
    errorDiv.textContent = message;
    
    const container = document.querySelector('.main-content');
    container.insertBefore(errorDiv, container.firstChild);
    
    setTimeout(() => errorDiv.remove(), 5000);
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeDashboard);
