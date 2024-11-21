let map;
let marker;
let socket;

// Initialize the map and socket connection
function initializeTracking(deliveryId) {
    // Initialize socket connection
    socket = io();
    
    // Initialize Google Maps
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 15,
        center: { lat: 0, lng: 0 }
    });
    
    marker = new google.maps.Marker({
        map: map,
        icon: '/images/delivery-icon.png'
    });

    // Load initial delivery details
    fetchDeliveryDetails(deliveryId);
    
    // Socket event listeners
    socket.emit('track-delivery', deliveryId);
    
    socket.on('location-update', handleLocationUpdate);
    socket.on('status-update', handleStatusUpdate);
    socket.on('connect_error', handleConnectionError);
    socket.on('reconnect', () => {
        console.log('Reconnected to server');
        socket.emit('track-delivery', deliveryId);
    });
}

// Fetch initial delivery details
async function fetchDeliveryDetails(deliveryId) {
    try {
        const response = await fetch(`/api/deliveries/${deliveryId}`);
        if (!response.ok) throw new Error('Failed to fetch delivery details');
        
        const data = await response.json();
        updateDeliveryInfo(data);
    } catch (error) {
        console.error('Error fetching delivery details:', error);
        showError('Failed to load delivery details');
    }
}

// Handle location updates from socket
function handleLocationUpdate(data) {
    const { location, estimatedArrival } = data;
    const position = {
        lat: location.coordinates[1],
        lng: location.coordinates[0]
    };
    
    // Update marker position
    marker.setPosition(position);
    map.panTo(position);
    
    // Update UI
    document.getElementById('current-location').textContent = 
        `${position.lat.toFixed(4)}, ${position.lng.toFixed(4)}`;
    document.getElementById('estimated-arrival').textContent = 
        new Date(estimatedArrival).toLocaleTimeString();
}

// Handle status updates from socket
function handleStatusUpdate(data) {
    const { status, agentName } = data;
    document.getElementById('status-text').textContent = status;
    document.getElementById('agent-name').textContent = agentName;
    
    // Update status indicator
    updateStatusIndicator(status);
}

// Handle connection errors
function handleConnectionError() {
    console.error('Connection to server lost');
    showError('Connection lost. Attempting to reconnect...');
}

// Update status indicator
function updateStatusIndicator(status) {
    const statusElement = document.getElementById('delivery-status');
    statusElement.className = `status-container status-${status.toLowerCase()}`;
}

// Show error message
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'alert alert-danger';
    errorDiv.textContent = message;
    
    const container = document.querySelector('.tracking-container');
    container.insertBefore(errorDiv, container.firstChild);
    
    setTimeout(() => errorDiv.remove(), 5000);
}

// Update delivery information
function updateDeliveryInfo(data) {
    document.getElementById('delivery-id').textContent = data.deliveryId;
    document.getElementById('agent-name').textContent = data.agentName;
    document.getElementById('status-text').textContent = data.status;
    updateStatusIndicator(data.status);
    
    if (data.location) {
        handleLocationUpdate({
            location: data.location,
            estimatedArrival: data.estimatedArrival
        });
    }
}
