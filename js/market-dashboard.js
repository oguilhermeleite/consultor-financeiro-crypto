/**
 * Market Dashboard Controller
 * 
 * Integrates market data with the existing crypto advisor interface
 * Handles UI updates, user interactions, and dashboard state management
 * DOES NOT MODIFY existing functionality - only adds new features
 */

// Dashboard state management
let dashboardState = {
    isVisible: false,
    isMarketDataLoaded: false,
    profileData: null,
    refreshCountdown: 120, // 2 minutes
    countdownInterval: null
};

// Exactly 6 cryptocurrencies as specified
const DASHBOARD_COINS = [
    { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin' },
    { id: 'ethereum', symbol: 'ETH', name: 'Ethereum' },
    { id: 'solana', symbol: 'SOL', name: 'Solana' },
    { id: 'binancecoin', symbol: 'BNB', name: 'BNB' },
    { id: 'ripple', symbol: 'XRP', name: 'XRP' },
    { id: 'pendle', symbol: 'PENDLE', name: 'Pendle' }
];

/**
 * Dashboard Navigation Functions
 */

/**
 * Show dashboard after profile completion
 * @param {Object} profileData - User profile data from quiz
 */
function showDashboard(profileData = null) {
    console.log('📊 Showing dashboard after profile completion');
    
    // Store profile data
    dashboardState.profileData = profileData;
    
    // Hide results section
    const resultsSection = document.getElementById('results');
    if (resultsSection) {
        resultsSection.style.display = 'none';
    }
    
    // Show dashboard section
    const dashboardSection = document.getElementById('dashboard');
    if (dashboardSection) {
        dashboardSection.style.display = 'block';
        dashboardState.isVisible = true;
        
        // Smooth scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        console.log('✅ Dashboard shown successfully');
    } else {
        console.error('❌ Dashboard section not found');
    }
}

/**
 * Handle "Entrar como Visitante" button click
 */
function enterAsGuest() {
    console.log('👤 User entering as guest');
    
    // Show market section
    const marketSection = document.getElementById('marketSection');
    if (marketSection) {
        marketSection.style.display = 'block';
        
        // Initialize market data
        initializeMarketData();
        
        // Start refresh countdown
        startRefreshCountdown();
        
        console.log('✅ Guest mode activated, market data loading...');
    } else {
        console.error('❌ Market section not found');
    }
}

/**
 * Handle "Voltar ao Teste de Perfil" button click
 */
function backToProfile() {
    console.log('🔄 User returning to profile test');
    
    // Hide dashboard
    const dashboardSection = document.getElementById('dashboard');
    if (dashboardSection) {
        dashboardSection.style.display = 'none';
        dashboardState.isVisible = false;
    }
    
    // Stop refresh countdown
    stopRefreshCountdown();
    
    // Clear market data
    if (window.MarketDataAPI) {
        window.MarketDataAPI.stopAutoRefresh();
    }
    
    // Show questionnaire section
    const questionnaireSection = document.getElementById('questionnaire-section');
    if (questionnaireSection) {
        questionnaireSection.style.display = 'block';
        questionnaireSection.classList.remove('hidden');
        
        // Reset form if possible
        if (window.cryptoAdvisor && typeof window.cryptoAdvisor.restartAnalysis === 'function') {
            window.cryptoAdvisor.restartAnalysis();
        }
        
        // Smooth scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        console.log('✅ Returned to profile test');
    } else {
        console.error('❌ Questionnaire section not found');
    }
}

/**
 * Market Data Integration Functions
 */

/**
 * Initialize market data display
 */
async function initializeMarketData() {
    console.log('🚀 Initializing market data display...');
    
    try {
        // Show loading state
        showLoadingState();
        
        // Initialize the market data API
        if (window.MarketDataAPI) {
            window.MarketDataAPI.initialize();
        }
        
        // Fetch and display market data
        await loadAndDisplayMarketData();
        
        dashboardState.isMarketDataLoaded = true;
        console.log('✅ Market data initialized successfully');
        
    } catch (error) {
        console.error('❌ Failed to initialize market data:', error);
        showErrorState(error.message);
    }
}

/**
 * Load and display market data
 */
async function loadAndDisplayMarketData() {
    try {
        // Fetch market data for exactly 6 coins
        const coinIds = DASHBOARD_COINS.map(coin => coin.id);
        const marketData = await window.MarketDataAPI.fetchMarketSnapshot(coinIds);
        
        if (marketData && !marketData.error) {
            // Update market overview
            updateMarketOverview(marketData);
            
            // Generate crypto cards
            generateCryptoCards(marketData);
            
            // Hide loading state
            hideLoadingState();
            
            console.log('📊 Market data displayed for', marketData.length, 'coins');
        } else {
            throw new Error(marketData?.message || 'Failed to fetch market data');
        }
        
    } catch (error) {
        console.error('❌ Error loading market data:', error);
        showErrorState(error.message);
    }
}

/**
 * Update market overview statistics
 * @param {Array} marketData - Array of coin data
 */
function updateMarketOverview(marketData) {
    try {
        // Calculate Bitcoin dominance
        const btcDominance = window.MarketDataAPI.calculateBitcoinDominance(marketData);
        const btcDominanceElement = document.getElementById('btcDominance');
        if (btcDominanceElement) {
            btcDominanceElement.textContent = `${btcDominance}%`;
        }
        
        // Calculate total market cap
        const totalMarketCap = marketData.reduce((sum, coin) => sum + (coin.market_cap || 0), 0);
        const totalMarketCapElement = document.getElementById('totalMarketCap');
        if (totalMarketCapElement) {
            totalMarketCapElement.textContent = window.MarketDataAPI.formatMarketCap(totalMarketCap);
        }
        
        // Update last update time
        const lastUpdateElement = document.getElementById('lastUpdate');
        if (lastUpdateElement) {
            const now = new Date();
            lastUpdateElement.textContent = now.toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit'
            });
        }
        
        console.log('📈 Market overview updated');
        
    } catch (error) {
        console.error('❌ Error updating market overview:', error);
    }
}

/**
 * Generate crypto cards for the 6 specified cryptocurrencies
 * @param {Array} marketData - Array of coin data
 */
function generateCryptoCards(marketData) {
    const cryptoGrid = document.getElementById('cryptoGrid');
    if (!cryptoGrid) {
        console.error('❌ Crypto grid element not found');
        return;
    }
    
    // Clear existing content
    cryptoGrid.innerHTML = '';
    
    // Generate cards for exactly 6 coins in specified order
    DASHBOARD_COINS.forEach(coinConfig => {
        const coinData = marketData.find(data => data.id === coinConfig.id);
        if (coinData) {
            const cardHtml = generateCryptoCard(coinData, coinConfig);
            cryptoGrid.insertAdjacentHTML('beforeend', cardHtml);
        } else {
            // Generate placeholder card if data not available
            const placeholderHtml = generatePlaceholderCard(coinConfig);
            cryptoGrid.insertAdjacentHTML('beforeend', placeholderHtml);
        }
    });
    
    // Initialize sparkline charts
    setTimeout(() => {
        initializeSparklineCharts(marketData);
    }, 100);
    
    console.log('🎴 Generated', DASHBOARD_COINS.length, 'crypto cards');
}

/**
 * Generate HTML for a single crypto card
 * @param {Object} coinData - Coin market data
 * @param {Object} coinConfig - Coin configuration
 * @returns {string} HTML string
 */
function generateCryptoCard(coinData, coinConfig) {
    const price = window.MarketDataAPI.formatPrice(coinData.current_price);
    const change24h = coinData.price_change_percentage_24h || 0;
    const changeFormatted = window.MarketDataAPI.formatPercentage(change24h);
    const changeClass = change24h >= 0 ? 'positive' : 'negative';
    const trendArrow = change24h >= 0 ? '▲' : '▼';
    
    const marketCap = window.MarketDataAPI.formatMarketCap(coinData.market_cap);
    const volume24h = window.MarketDataAPI.formatMarketCap(coinData.total_volume);
    
    return `
        <div class="crypto-card" data-coin="${coinData.id}" aria-label="Dados de ${coinConfig.name}">
            <div class="crypto-header">
                <img class="crypto-logo" 
                     src="${coinData.image || `https://assets.coingecko.com/coins/images/1/small/${coinData.id}.png`}" 
                     alt="${coinConfig.name} logo"
                     onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjQiIGN5PSIyNCIgcj0iMjQiIGZpbGw9IiNGRkQ3MDAiLz4KPHRleHQgeD0iMjQiIHk9IjI4IiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9IiMwMDAiIHRleHQtYW5jaG9yPSJtaWRkbGUiPiQ8L3RleHQ+Cjwvc3ZnPgo='" />
                <div class="crypto-info">
                    <h3>
                        ${coinConfig.symbol} - ${coinConfig.name}
                    </h3>
                    <div class="crypto-symbol">${coinConfig.symbol}</div>
                </div>
            </div>
            
            <div class="crypto-price" aria-label="Preço atual ${price}">
                ${price}
            </div>
            
            <div class="crypto-change ${changeClass}" aria-label="Mudança de 24 horas ${changeFormatted}">
                <span class="trend-arrow">${trendArrow}</span>
                ${changeFormatted}
            </div>
            
            <div class="crypto-stats">
                <div class="stat-item">
                    <div class="stat-label">Market Cap</div>
                    <div class="stat-value">${marketCap}</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">Volume 24h</div>
                    <div class="stat-value">${volume24h}</div>
                </div>
            </div>
            
            <div class="crypto-chart">
                <canvas class="chart-canvas" id="chart-${coinData.id}" width="300" height="60" aria-label="Gráfico de 7 dias para ${coinConfig.name}"></canvas>
            </div>
        </div>
    `;
}

/**
 * Generate placeholder card for missing data
 * @param {Object} coinConfig - Coin configuration
 * @returns {string} HTML string
 */
function generatePlaceholderCard(coinConfig) {
    return `
        <div class="crypto-card" data-coin="${coinConfig.id}">
            <div class="crypto-header">
                <div class="crypto-logo skeleton-loader"></div>
                <div class="crypto-info">
                    <h3>${coinConfig.symbol} - ${coinConfig.name}</h3>
                    <div class="crypto-symbol">${coinConfig.symbol}</div>
                </div>
            </div>
            
            <div class="crypto-price">--</div>
            <div class="crypto-change">--</div>
            
            <div class="crypto-stats">
                <div class="stat-item">
                    <div class="stat-label">Market Cap</div>
                    <div class="stat-value">--</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">Volume 24h</div>
                    <div class="stat-value">--</div>
                </div>
            </div>
            
            <div class="crypto-chart">
                <div class="chart-placeholder">Dados indisponíveis</div>
            </div>
        </div>
    `;
}

/**
 * Initialize sparkline charts for crypto cards
 * @param {Array} marketData - Array of coin data
 */
function initializeSparklineCharts(marketData) {
    console.log('📈 Initializing sparkline charts...');
    
    marketData.forEach(coinData => {
        const canvas = document.getElementById(`chart-${coinData.id}`);
        if (canvas && coinData.sparkline_in_7d && coinData.sparkline_in_7d.price) {
            try {
                createSparklineChart(canvas, coinData.sparkline_in_7d.price, coinData.price_change_percentage_24h);
            } catch (error) {
                console.warn(`⚠️ Failed to create chart for ${coinData.id}:`, error);
            }
        }
    });
}

/**
 * Create sparkline chart using Chart.js
 * @param {HTMLCanvasElement} canvas - Canvas element
 * @param {Array} priceData - Array of price points
 * @param {number} change24h - 24h percentage change
 */
function createSparklineChart(canvas, priceData, change24h) {
    if (!canvas || !priceData || priceData.length === 0) return;
    
    const ctx = canvas.getContext('2d');
    const chartColor = change24h >= 0 ? '#4CAF50' : '#f44336';
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: priceData.map((_, index) => index),
            datasets: [{
                data: priceData,
                borderColor: chartColor,
                backgroundColor: `${chartColor}20`,
                borderWidth: 2,
                fill: true,
                pointRadius: 0,
                pointHoverRadius: 0,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                intersect: false
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    enabled: false
                }
            },
            scales: {
                x: {
                    display: false
                },
                y: {
                    display: false
                }
            },
            animation: {
                duration: 1000,
                easing: 'easeInOutQuart'
            }
        }
    });
}

/**
 * UI State Management Functions
 */

/**
 * Show loading state
 */
function showLoadingState() {
    const loadingElement = document.getElementById('marketLoading');
    const errorElement = document.getElementById('marketError');
    const gridElement = document.getElementById('cryptoGrid');
    
    if (loadingElement) loadingElement.style.display = 'block';
    if (errorElement) errorElement.style.display = 'none';
    if (gridElement) gridElement.style.display = 'none';
}

/**
 * Hide loading state
 */
function hideLoadingState() {
    const loadingElement = document.getElementById('marketLoading');
    const gridElement = document.getElementById('cryptoGrid');
    
    if (loadingElement) loadingElement.style.display = 'none';
    if (gridElement) gridElement.style.display = 'grid';
}

/**
 * Show error state
 * @param {string} message - Error message
 */
function showErrorState(message) {
    const loadingElement = document.getElementById('marketLoading');
    const errorElement = document.getElementById('marketError');
    const gridElement = document.getElementById('cryptoGrid');
    
    if (loadingElement) loadingElement.style.display = 'none';
    if (gridElement) gridElement.style.display = 'none';
    
    if (errorElement) {
        errorElement.style.display = 'block';
        const errorMessage = errorElement.querySelector('.error-message');
        if (errorMessage) {
            errorMessage.textContent = message || 'Falha ao carregar dados do mercado';
        }
    }
}

/**
 * Refresh countdown functionality
 */

/**
 * Start refresh countdown timer
 */
function startRefreshCountdown() {
    if (dashboardState.countdownInterval) {
        clearInterval(dashboardState.countdownInterval);
    }
    
    dashboardState.refreshCountdown = 120; // 2 minutes
    
    dashboardState.countdownInterval = setInterval(() => {
        dashboardState.refreshCountdown--;
        
        const countdownElement = document.getElementById('refreshCountdown');
        if (countdownElement) {
            const minutes = Math.floor(dashboardState.refreshCountdown / 60);
            const seconds = dashboardState.refreshCountdown % 60;
            countdownElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }
        
        if (dashboardState.refreshCountdown <= 0) {
            // Auto-refresh market data
            loadAndDisplayMarketData();
            dashboardState.refreshCountdown = 120; // Reset countdown
        }
    }, 1000);
}

/**
 * Stop refresh countdown timer
 */
function stopRefreshCountdown() {
    if (dashboardState.countdownInterval) {
        clearInterval(dashboardState.countdownInterval);
        dashboardState.countdownInterval = null;
    }
}

/**
 * Event Listeners Setup
 */

/**
 * Initialize dashboard event listeners
 */
function initializeDashboardEvents() {
    console.log('🎯 Setting up dashboard event listeners...');
    
    // "Entrar como Visitante" button
    const enterGuestBtn = document.getElementById('enterAsGuest');
    if (enterGuestBtn) {
        enterGuestBtn.addEventListener('click', enterAsGuest);
        console.log('✅ Guest entry button connected');
    }
    
    // "Voltar ao Teste de Perfil" button
    const backToProfileBtn = document.getElementById('backToProfile');
    if (backToProfileBtn) {
        backToProfileBtn.addEventListener('click', backToProfile);
        console.log('✅ Back to profile button connected');
    }
    
    // Manual refresh button
    const refreshBtn = document.getElementById('refreshMarket');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', async () => {
            console.log('🔄 Manual refresh triggered');
            refreshBtn.classList.add('loading');
            
            try {
                await loadAndDisplayMarketData();
            } catch (error) {
                console.error('Manual refresh failed:', error);
            } finally {
                refreshBtn.classList.remove('loading');
            }
        });
        console.log('✅ Manual refresh button connected');
    }
    
    console.log('✅ Dashboard event listeners initialized');
}

/**
 * Public API for integration with existing code
 */
window.MarketDashboard = {
    // Main functions
    showDashboard,
    enterAsGuest,
    backToProfile,
    
    // Market data functions
    initializeMarketData,
    loadAndDisplayMarketData,
    updateMarketOverview,
    
    // State management
    getState: () => ({ ...dashboardState }),
    isVisible: () => dashboardState.isVisible,
    isDataLoaded: () => dashboardState.isMarketDataLoaded,
    
    // Lifecycle
    initialize: initializeDashboardEvents,
    
    // Configuration
    coins: DASHBOARD_COINS
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('📊 Market Dashboard module loaded');
    initializeDashboardEvents();
});

console.log('📈 Market Dashboard Controller loaded successfully');