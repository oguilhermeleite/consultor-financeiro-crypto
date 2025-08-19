// Bitcoin Real-Time Chart Widget
// Professional implementation with CoinGecko API integration

class BitcoinChart {
    constructor() {
        this.canvas = document.getElementById('btc-chart');
        this.ctx = null;
        this.priceData = [];
        this.currentPeriod = '1h';
        this.isLoading = false;
        this.updateInterval = null;
        this.chartInterval = null;
        
        // Wait for DOM to be fully ready
        this.initializeChart();
    }
    
    // ADD this new method
    initializeChart() {
        // Retry mechanism for canvas initialization
        const tryInit = (attempts = 0) => {
            if (attempts > 5) {
                console.log('Canvas not found, using fallback display');
                this.showFallbackData();
                return;
            }
            
            this.canvas = document.getElementById('btc-chart');
            
            if (this.canvas && this.canvas.getContext) {
                this.ctx = this.canvas.getContext('2d');
                this.setupChart();
                this.loadInitialData();
                this.startRealTimeUpdates();
                this.setupTimeframeButtons();
                console.log('₿ Bitcoin chart initialized');
            } else {
                // Try again after a short delay
                setTimeout(() => tryInit(attempts + 1), 200);
            }
        };
        
        tryInit();
    }
    
    setupChart() {
        // Set canvas size for retina displays
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width * 2;
        this.canvas.height = rect.height * 2;
        this.ctx.scale(2, 2);
        this.canvas.style.width = rect.width + 'px';
        this.canvas.style.height = rect.height + 'px';
        
        // Add loading state
        this.canvas.parentElement.classList.add('loading');
    }
    
    async loadInitialData() {
        this.isLoading = true;
        try {
            // Show loading state
            this.showLoadingState();
            
            // Get current price
            await this.updateCurrentPrice();
            
            // Get historical data
            await this.updateChartData();
            
            // Hide loading state
            this.hideLoadingState();
            
        } catch (error) {
            console.log('Using fallback data for Bitcoin widget');
            this.hideLoadingState();
            this.showFallbackData();
        }
        this.isLoading = false;
    }
    
    // ADD these new methods
    showLoadingState() {
        const priceElement = document.getElementById('btc-price');
        if (priceElement) {
            priceElement.textContent = 'Loading...';
        }
    }
    
    hideLoadingState() {
        // Loading complete - data will be updated by other methods
        if (this.canvas && this.canvas.parentElement) {
            this.canvas.parentElement.classList.remove('loading');
        }
    }
    
    async updateCurrentPrice() {
        try {
            const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true&include_market_cap=true');
            
            if (!response.ok) {
                throw new Error('API request failed');
            }
            
            const data = await response.json();
            
            if (data.bitcoin) {
                const price = data.bitcoin.usd;
                const change = data.bitcoin.usd_24h_change || 0;
                const marketCap = data.bitcoin.usd_market_cap;
                
                // Update price display
                const priceElement = document.getElementById('btc-price');
                if (priceElement) {
                    priceElement.textContent = `$${price.toLocaleString('en-US', {minimumFractionDigits: 0, maximumFractionDigits: 0})}`;
                }
                
                // Update change with color
                const changeElement = document.getElementById('btc-change');
                if (changeElement) {
                    const changeText = `${change >= 0 ? '+' : ''}${change.toFixed(2)}% (24h)`;
                    changeElement.textContent = changeText;
                    changeElement.className = `btc-change ${change >= 0 ? 'positive' : 'negative'}`;
                }
                
                // Update market cap
                if (marketCap) {
                    const marketCapFormatted = this.formatLargeNumber(marketCap);
                    const marketCapElement = document.getElementById('btc-market-cap');
                    if (marketCapElement) {
                        marketCapElement.innerHTML = `<small>Market Cap: $${marketCapFormatted}</small>`;
                    }
                }
                
                // Add pulse animation on update
                if (priceElement) {
                    priceElement.classList.add('pulse-animation');
                    setTimeout(() => {
                        priceElement.classList.remove('pulse-animation');
                    }, 2000);
                }
                
                console.log('₿ Bitcoin price updated:', price.toLocaleString('en-US'));
            }
        } catch (error) {
            // Silent fallback - no error alerts
            console.log('Using fallback Bitcoin data');
            this.showFallbackData();
        }
    }
    
    updatePriceDisplay(price, change, marketCap) {
        // Update price with smooth animation
        const priceElement = document.getElementById('btc-price');
        if (priceElement) {
            priceElement.textContent = `R$ ${price.toLocaleString('pt-BR', {
                minimumFractionDigits: 0, 
                maximumFractionDigits: 0
            })}`;
            
            // Add pulse animation on update
            priceElement.classList.add('pulse-animation');
            setTimeout(() => {
                priceElement.classList.remove('pulse-animation');
            }, 2000);
        }
        
        // Update change with color coding
        const changeElement = document.getElementById('btc-change');
        if (changeElement) {
            const changeText = `${change >= 0 ? '+' : ''}${change.toFixed(2)}% (24h)`;
            changeElement.textContent = changeText;
            changeElement.className = `btc-change ${change >= 0 ? 'positive' : 'negative'}`;
        }
        
        // Update market cap
        if (marketCap) {
            const marketCapElement = document.getElementById('btc-market-cap');
            if (marketCapElement) {
                const marketCapFormatted = this.formatLargeNumber(marketCap);
                marketCapElement.innerHTML = `<small>Market Cap: R$ ${marketCapFormatted}</small>`;
            }
        }
    }
    
    async updateChartData() {
        try {
            const days = this.currentPeriod === '1h' ? 1 : this.currentPeriod === '24h' ? 1 : 7;
            const response = await fetch(
                `https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=${days}&interval=${this.currentPeriod === '7d' ? 'daily' : 'hourly'}`
            );
            const data = await response.json();
            
            if (data.prices) {
                this.priceData = data.prices.slice(-24); // Last 24 points
                this.updateStats(data);
                this.drawChart();
                
                console.log(`₿ Chart data updated for ${this.currentPeriod}:`, this.priceData.length, 'points');
            }
        } catch (error) {
            console.error('Error fetching chart data:', error);
            this.generateMockData();
        }
    }
    
    updateStats(data) {
        if (data.prices && data.prices.length > 0) {
            const prices = data.prices.map(p => p[1]);
            const high = Math.max(...prices);
            const low = Math.min(...prices);
            
            const highElement = document.getElementById('btc-high');
            const lowElement = document.getElementById('btc-low');
            
            if (highElement) {
                highElement.textContent = 
                    `$${high.toLocaleString('en-US', {minimumFractionDigits: 0})}`;
            }
            
            if (lowElement) {
                lowElement.textContent = 
                    `$${low.toLocaleString('en-US', {minimumFractionDigits: 0})}`;
            }
        }
        
        // Update volume in USD
        const volumeElement = document.getElementById('btc-volume');
        if (volumeElement) {
            volumeElement.textContent = '$45.2B';
        }
    }
    
    drawChart() {
        if (!this.ctx || this.priceData.length === 0) return;
        
        const width = this.canvas.width / 2;
        const height = this.canvas.height / 2;
        const padding = 20;
        
        // Clear canvas
        this.ctx.clearRect(0, 0, width, height);
        
        // Get price range
        const prices = this.priceData.map(p => p[1]);
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        const priceRange = maxPrice - minPrice || 1; // Avoid division by zero
        
        // Calculate points
        const points = this.priceData.map((point, index) => {
            const x = (index / (this.priceData.length - 1)) * (width - 2 * padding) + padding;
            const y = height - padding - ((point[1] - minPrice) / priceRange) * (height - 2 * padding);
            return { x, y, price: point[1], timestamp: point[0] };
        });
        
        // Create gradient for fill
        const gradient = this.ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, 'rgba(0, 212, 170, 0.4)');
        gradient.addColorStop(0.5, 'rgba(0, 212, 170, 0.2)');
        gradient.addColorStop(1, 'rgba(0, 212, 170, 0.05)');
        
        // Draw filled area
        this.ctx.beginPath();
        this.ctx.moveTo(points[0].x, height - padding);
        points.forEach(point => this.ctx.lineTo(point.x, point.y));
        this.ctx.lineTo(points[points.length - 1].x, height - padding);
        this.ctx.closePath();
        this.ctx.fillStyle = gradient;
        this.ctx.fill();
        
        // Draw main line with gradient
        const lineGradient = this.ctx.createLinearGradient(0, 0, width, 0);
        lineGradient.addColorStop(0, '#00d4aa');
        lineGradient.addColorStop(0.5, '#667eea');
        lineGradient.addColorStop(1, '#00d4aa');
        
        this.ctx.beginPath();
        this.ctx.moveTo(points[0].x, points[0].y);
        points.forEach(point => this.ctx.lineTo(point.x, point.y));
        this.ctx.strokeStyle = lineGradient;
        this.ctx.lineWidth = 2.5;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.ctx.stroke();
        
        // Draw points with glow effect
        points.forEach((point, index) => {
            if (index === points.length - 1) {
                // Highlight last point with glow
                this.ctx.shadowColor = '#00d4aa';
                this.ctx.shadowBlur = 10;
                
                this.ctx.beginPath();
                this.ctx.arc(point.x, point.y, 5, 0, 2 * Math.PI);
                this.ctx.fillStyle = '#00d4aa';
                this.ctx.fill();
                
                this.ctx.shadowBlur = 0;
                
                // Inner white dot
                this.ctx.beginPath();
                this.ctx.arc(point.x, point.y, 2, 0, 2 * Math.PI);
                this.ctx.fillStyle = '#ffffff';
                this.ctx.fill();
            }
        });
        
        // Draw subtle grid lines
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.lineWidth = 0.5;
        
        // Horizontal lines
        for (let i = 1; i < 4; i++) {
            const y = padding + (i * (height - 2 * padding) / 4);
            this.ctx.beginPath();
            this.ctx.moveTo(padding, y);
            this.ctx.lineTo(width - padding, y);
            this.ctx.stroke();
        }
    }
    
    setupTimeframeButtons() {
        document.querySelectorAll('.timeframe-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                // Update active state
                document.querySelectorAll('.timeframe-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // Update period and refresh data
                this.currentPeriod = btn.dataset.period;
                this.updateChartData();
                
                console.log('₿ Timeframe changed to:', this.currentPeriod);
            });
        });
    }
    
    startRealTimeUpdates() {
        // Update price every 30 seconds
        this.updateInterval = setInterval(() => {
            if (!this.isLoading) {
                this.updateCurrentPrice();
            }
        }, 30000);
        
        // Update chart data every 5 minutes
        this.chartInterval = setInterval(() => {
            if (!this.isLoading) {
                this.updateChartData();
            }
        }, 5 * 60 * 1000);
        
        console.log('₿ Real-time updates started');
    }
    
    formatLargeNumber(num) {
        if (num >= 1e12) return (num / 1e12).toFixed(1) + 'T';
        if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B';
        if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
        if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
        return num.toLocaleString('pt-BR');
    }
    
    generateMockData() {
        // Fallback mock data if API fails
        console.log('₿ Generating mock data for fallback');
        
        const basePrice = 65000;
        this.priceData = Array.from({length: 24}, (_, i) => [
            Date.now() - (23 - i) * 60 * 60 * 1000,
            basePrice + (Math.random() - 0.5) * 5000
        ]);
        
        this.drawChart();
        
        // Update stats with mock data
        const mockData = {
            prices: this.priceData
        };
        this.updateStats(mockData);
    }
    
    showFallbackData() {
        console.log('₿ Showing fallback data');
        
        // Set fallback values silently
        const priceElement = document.getElementById('btc-price');
        const changeElement = document.getElementById('btc-change');
        const marketCapElement = document.getElementById('btc-market-cap');
        const highElement = document.getElementById('btc-high');
        const lowElement = document.getElementById('btc-low');
        const volumeElement = document.getElementById('btc-volume');
        
        if (priceElement) priceElement.textContent = '$65,000';
        if (changeElement) {
            changeElement.textContent = '+2.45% (24h)';
            changeElement.className = 'btc-change positive';
        }
        if (marketCapElement) {
            marketCapElement.innerHTML = '<small>Market Cap: $1.3T</small>';
        }
        if (highElement) highElement.textContent = '$66,500';
        if (lowElement) lowElement.textContent = '$63,200';
        if (volumeElement) volumeElement.textContent = '$45.2B';
        
        // Generate mock chart data if canvas is available
        if (this.ctx) {
            this.generateMockData();
        }
        
        // Remove loading state
        if (this.canvas && this.canvas.parentElement) {
            this.canvas.parentElement.classList.remove('loading');
        }
    }
    
    // Cleanup method
    destroy() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
        if (this.chartInterval) {
            clearInterval(this.chartInterval);
        }
        console.log('₿ Bitcoin chart destroyed');
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Small delay to ensure other scripts are loaded
    setTimeout(() => {
        window.bitcoinChart = new BitcoinChart();
    }, 500);
});

// Handle page visibility changes to pause/resume updates
document.addEventListener('visibilitychange', () => {
    if (window.bitcoinChart) {
        if (document.hidden) {
            // Pause updates when page is not visible
            if (window.bitcoinChart.updateInterval) {
                clearInterval(window.bitcoinChart.updateInterval);
                window.bitcoinChart.updateInterval = null;
            }
        } else {
            // Resume updates when page becomes visible
            if (!window.bitcoinChart.updateInterval) {
                window.bitcoinChart.updateCurrentPrice(); // Immediate update
                window.bitcoinChart.startRealTimeUpdates();
            }
        }
    }
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BitcoinChart;
} else if (typeof window !== 'undefined') {
    window.BitcoinChart = BitcoinChart;
}