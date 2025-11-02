// Simple Hotspots Analyzer with OpenStreetMap
class HotspotsAnalyzer {
    constructor() {
        this.map = null;
        this.markers = [];
        this.hotspots = [];
        this.init();
    }

    init() {
        this.loadLeaflet();
        this.initializeEventListeners();
    }

    loadLeaflet() {
        // Load Leaflet CSS
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.css';
        link.integrity = 'sha512-xodZBNTC5n17Xt2atTPuE1HxjVMSvLVW9ocqUKLsCC5CXdbqCmblAshOMAS6/keqq/sMZMZ19scR4PsZChSR7A==';
        link.crossOrigin = '';
        document.head.appendChild(link);

        // Load Leaflet JS
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.js';
        script.integrity = 'sha512-XQoYMqMTK8LvdxXYG3nZ448hOEQiglfqkJs1NOQV44cWnUrBc8PkAOcXy20w0vlaXaVUearIOBhiXZ5V3ynxwA==';
        script.crossOrigin = '';
        script.onload = () => {
            console.log('Leaflet loaded successfully');
            this.initializeMap();
        };
        script.onerror = (error) => {
            console.error('Failed to load Leaflet:', error);
            this.showError('Failed to load map. Please check your internet connection.');
        };
        document.head.appendChild(script);
    }

    initializeMap() {
        const mapContainer = document.getElementById('hotspots-map');
        if (!mapContainer) {
            console.error('Map container not found');
            return;
        }

        try {
            // Default center (New York)
            const defaultCenter = [40.7128, -74.0060];

            this.map = L.map('hotspots-map').setView(defaultCenter, 12);
            
            // Add OpenStreetMap tiles
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors',
                maxZoom: 18
            }).addTo(this.map);

            console.log('Map initialized successfully');
            
            // Show initial message
            this.showMessage('Click "Analyze Hotspots" to see lost and found hotspots in your area.');

        } catch (error) {
            console.error('Error initializing map:', error);
            this.showError('Failed to initialize map. Please refresh the page.');
        }
    }

    initializeEventListeners() {
        const analyzeBtn = document.getElementById('analyze-hotspots');
        const radiusSlider = document.getElementById('hotspot-radius');
        const radiusValue = document.getElementById('radius-value');

        if (analyzeBtn) {
            analyzeBtn.addEventListener('click', () => this.analyzeHotspots());
        }

        if (radiusSlider && radiusValue) {
            radiusSlider.addEventListener('input', (e) => {
                radiusValue.textContent = `${e.target.value}m`;
            });
        }
    }

    async analyzeHotspots() {
        try {
            this.showLoading();

            // Check if user is authenticated
            if (!auth.currentUser) {
                this.showError('Please log in to analyze hotspots.');
                return;
            }

            const snapshot = await db.collection('reports').get();
            const reports = [];

            snapshot.forEach(doc => {
                const report = doc.data();
                reports.push({
                    id: doc.id,
                    ...report
                });
            });

            console.log('Found reports:', reports.length);

            if (reports.length === 0) {
                this.showNoDataMessage();
                return;
            }

            // Create sample hotspots for demonstration
            this.hotspots = this.createSampleHotspots(reports);
            
            this.displayHotspots();
            this.displayHotspotStats();
            this.displayHotspotRanking();

        } catch (error) {
            console.error('Hotspot analysis error:', error);
            this.showError('Failed to analyze hotspots: ' + error.message);
        }
    }

    createSampleHotspots(reports) {
        // Group reports by location
        const locationGroups = {};
        
        reports.forEach(report => {
            if (!locationGroups[report.location]) {
                locationGroups[report.location] = [];
            }
            locationGroups[report.location].push(report);
        });

        // Convert to hotspots
        const hotspots = Object.entries(locationGroups)
            .filter(([location, items]) => items.length >= 2) // Only locations with 2+ items
            .map(([location, items], index) => {
                // Create coordinates around NYC area
                const baseLat = 40.7128;
                const baseLng = -74.0060;
                const lat = baseLat + (Math.random() - 0.5) * 0.1;
                const lng = baseLng + (Math.random() - 0.5) * 0.1;

                return {
                    center: { lat, lng },
                    locations: items,
                    count: items.length,
                    items: items.map(item => item.itemName),
                    area: location.split(',')[0] || location,
                    location: location
                };
            })
            .sort((a, b) => b.count - a.count);

        return hotspots;
    }

    displayHotspots() {
        // Clear existing markers
        this.clearMarkers();

        if (!this.map || this.hotspots.length === 0) {
            this.showMessage('No hotspots found with current criteria.');
            return;
        }

        const bounds = new L.LatLngBounds();

        this.hotspots.forEach((hotspot, index) => {
            const marker = L.circleMarker(
                [hotspot.center.lat, hotspot.center.lng],
                {
                    radius: 10 + (hotspot.count * 3),
                    fillColor: '#ff6b6b',
                    fillOpacity: 0.8,
                    color: '#ffffff',
                    weight: 2,
                    className: 'hotspot-marker'
                }
            ).addTo(this.map);

            // Create popup content
            const popupContent = `
                <div style="min-width: 200px;">
                    <h3 style="color: #ff6b6b; margin: 0 0 10px 0;">📍 ${hotspot.area}</h3>
                    <p><strong>📊 Total Items:</strong> ${hotspot.count}</p>
                    <p><strong>📍 Location:</strong> ${hotspot.location}</p>
                    <p><strong>🎯 Common Items:</strong> ${this.getTopItems(hotspot.items)}</p>
                </div>
            `;

            marker.bindPopup(popupContent);
            this.markers.push(marker);
            bounds.extend([hotspot.center.lat, hotspot.center.lng]);
        });

        // Fit map to show all markers
        this.map.fitBounds(bounds, { padding: [20, 20] });
    }

    getTopItems(items) {
        const countMap = {};
        items.forEach(item => {
            countMap[item] = (countMap[item] || 0) + 1;
        });

        const sorted = Object.entries(countMap)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3);

        return sorted.map(([item, count]) => `${item} (${count})`).join(', ');
    }

    displayHotspotStats() {
        const summaryContainer = document.getElementById('hotspots-summary');
        if (!summaryContainer) return;

        const totalHotspots = this.hotspots.length;
        const totalItems = this.hotspots.reduce((sum, hotspot) => sum + hotspot.count, 0);
        const avgItemsPerHotspot = totalHotspots > 0 ? (totalItems / totalHotspots).toFixed(1) : 0;
        const largestHotspot = this.hotspots[0]?.count || 0;

        summaryContainer.innerHTML = `
            <div class="stat-card-small">
                <div class="stat-number">${totalHotspots}</div>
                <div class="stat-label">Hotspots Found</div>
            </div>
            <div class="stat-card-small">
                <div class="stat-number">${totalItems}</div>
                <div class="stat-label">Total Items</div>
            </div>
            <div class="stat-card-small">
                <div class="stat-number">${avgItemsPerHotspot}</div>
                <div class="stat-label">Avg per Hotspot</div>
            </div>
            <div class="stat-card-small">
                <div class="stat-number">${largestHotspot}</div>
                <div class="stat-label">Largest Hotspot</div>
            </div>
        `;
    }

    displayHotspotRanking() {
        const rankingContainer = document.getElementById('hotspots-ranking');
        if (!rankingContainer) return;

        if (this.hotspots.length === 0) {
            rankingContainer.innerHTML = '<p>No hotspots found. Try reporting more items or adjust the criteria.</p>';
            return;
        }

        rankingContainer.innerHTML = this.hotspots.map((hotspot, index) => `
            <div class="hotspot-item">
                <div class="hotspot-header">
                    <span class="hotspot-name">#${index + 1} ${hotspot.area}</span>
                    <span class="hotspot-count">${hotspot.count} items</span>
                </div>
                <div class="hotspot-location">${hotspot.location}</div>
                <div class="hotspot-items">
                    <strong>Common items:</strong> ${this.getTopItems(hotspot.items)}
                </div>
            </div>
        `).join('');
    }

    clearMarkers() {
        this.markers.forEach(marker => {
            if (this.map) {
                this.map.removeLayer(marker);
            }
        });
        this.markers = [];
    }

    showLoading() {
        const mapContainer = document.getElementById('hotspots-map');
        if (mapContainer) {
            mapContainer.innerHTML = `
                <div class="loading-map">
                    <div class="spinner" style="width:30px;height:30px;"></div>
                    <div>Analyzing your lost and found data...</div>
                </div>
            `;
        }
    }

    showMessage(message) {
        const mapContainer = document.getElementById('hotspots-map');
        if (mapContainer) {
            mapContainer.innerHTML = `
                <div class="loading-map">
                    <i class="fas fa-map-marker-alt" style="font-size:2rem; margin-bottom:10px; color:#ff6b6b;"></i>
                    <div>${message}</div>
                </div>
            `;
        }
    }

    showNoDataMessage() {
        this.showMessage('No location data available for analysis. Try importing sample data or reporting found items with locations.');
    }

    showError(message) {
        const mapContainer = document.getElementById('hotspots-map');
        if (mapContainer) {
            mapContainer.innerHTML = `
                <div class="loading-map">
                    <i class="fas fa-exclamation-circle" style="font-size:2rem; margin-bottom:10px; color:#ff4757;"></i>
                    <div>${message}</div>
                </div>
            `;
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        window.hotspotsAnalyzer = new HotspotsAnalyzer();
    }, 1000);
});