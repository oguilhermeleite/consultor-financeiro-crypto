/**
 * Market Data Integration - CoinGecko API Module
 * 
 * Comprehensive market data module for crypto financial advisor
 * Handles real-time data for exactly 6 cryptocurrencies with caching and error handling
 * 
 * CoinGecko API Documentation: https://www.coingecko.com/en/api/documentation
 * Free tier: 50 calls/minute, 10,000 calls/month
 */

// Configuration
const MARKET_CONFIG = {
    // Exactly 6 cryptocurrencies as specified
    COINS: ['bitcoin', 'ethereum', 'solana', 'binancecoin', 'ripple', 'pendle'],
    API_BASE: 'https://api.coingecko.com/api/v3',
    CACHE_TTL: 60000, // 60 seconds
    UPDATE_INTERVAL: 120000, // 2 minutes auto-refresh
    MAX_RETRIES: 3,
    RETRY_DELAY: 1000 // Start with 1 second, exponential backoff
};

// Global cache for market data
let marketCache = new Map();
let lastUpdateTime = null;
let autoRefreshInterval = null;
let retryCount = 0;

/**
 * Core API Functions
 */

/**
 * Fetch market snapshot for specified cryptocurrencies
 * @param {Array} ids - Array of coin IDs (defaults to configured 6 coins)
 * @returns {Promise<Object>} Market data response
 */
async function fetchMarketSnapshot(ids = MARKET_CONFIG.COINS) {
    const cacheKey = `market_${ids.join('_')}`;
    
    // Check cache first
    const cached = getCachedData(cacheKey);
    if (cached) {
        console.log('📦 Using cached market data');
        return cached;
    }
    
    try {
        // Primary endpoint with comprehensive data
        const primaryUrl = `${MARKET_CONFIG.API_BASE}/coins/markets?vs_currency=usd&ids=${ids.join(',')}&order=market_cap_desc&per_page=6&page=1&sparkline=true&price_change_percentage=7d`;
        
        const response = await fetch(primaryUrl);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // Validate data structure
        if (!Array.isArray(data) || data.length === 0) {
            throw new Error('Invalid data format received from API');
        }
        
        // Cache the successful response
        setCachedData(cacheKey, data);
        lastUpdateTime = new Date();
        retryCount = 0; // Reset retry count on success
        
        console.log('✅ Market data fetched successfully:', data.length, 'coins');
        return data;
        
    } catch (error) {
        console.error('❌ Primary API failed, trying backup:', error.message);
        return await fetchBackupData(ids);
    }
}

/**
 * Backup API endpoint for basic price data
 * @param {Array} ids - Array of coin IDs
 * @returns {Promise<Object>} Simplified market data
 */
async function fetchBackupData(ids) {
    try {
        const backupUrl = `${MARKET_CONFIG.API_BASE}/simple/price?ids=${ids.join(',')}&vs_currencies=usd&include_24hr_change=true&include_market_cap=true&include_24hr_vol=true`;
        
        const response = await fetch(backupUrl);
        
        if (!response.ok) {
            throw new Error(`Backup API failed: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Transform backup data to match primary format
        const transformedData = ids.map(id => {
            const coinData = data[id];
            if (!coinData) return null;
            
            return {
                id: id,
                symbol: getSymbolFromId(id),
                name: getNameFromId(id),
                current_price: coinData.usd,
                price_change_percentage_24h: coinData.usd_24h_change || 0,
                market_cap: coinData.usd_market_cap || 0,
                total_volume: coinData.usd_24h_vol || 0,
                image: `https://assets.coingecko.com/coins/images/${getCoinImageId(id)}/small/${id}.png`,
                sparkline_in_7d: { price: [] } // Empty sparkline for backup
            };
        }).filter(Boolean);
        
        console.log('⚠️ Using backup data:', transformedData.length, 'coins');
        return transformedData;
        
    } catch (backupError) {
        console.error('❌ Both primary and backup APIs failed');
        return handleApiError(backupError);
    }
}

/**
 * Formatting Functions - All USD only
 */

/**
 * Format price in USD with proper thousands separators
 * @param {number} price - Price value
 * @returns {string} Formatted price: $45,231.50
 */
function formatPrice(price) {
    if (price === null || price === undefined || isNaN(price)) {
        return '$0.00';
    }
    
    const options = {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: price >= 1 ? 2 : 6
    };
    
    return new Intl.NumberFormat('en-US', options).format(price);
}

/**
 * Format market cap in readable format
 * @param {number} marketCap - Market cap value
 * @returns {string} Formatted market cap: $847.2B
 */
function formatMarketCap(marketCap) {
    if (!marketCap || marketCap === 0) return '$0';
    
    const trillion = 1000000000000;
    const billion = 1000000000;
    const million = 1000000;
    
    if (marketCap >= trillion) {
        return `$${(marketCap / trillion).toFixed(1)}T`;
    } else if (marketCap >= billion) {
        return `$${(marketCap / billion).toFixed(1)}B`;
    } else if (marketCap >= million) {
        return `$${(marketCap / million).toFixed(1)}M`;
    } else {
        return formatPrice(marketCap);
    }
}

/**
 * Format percentage with proper sign and color
 * @param {number} percentage - Percentage value
 * @returns {string} Formatted percentage: +5.67% or -2.34%
 */
function formatPercentage(percentage) {
    if (percentage === null || percentage === undefined || isNaN(percentage)) {
        return '0.00%';
    }
    
    const sign = percentage >= 0 ? '+' : '';
    return `${sign}${percentage.toFixed(2)}%`;
}

/**
 * Calculate Bitcoin dominance percentage
 * @param {Array} data - Market data array
 * @returns {number} Bitcoin dominance percentage
 */
function calculateBitcoinDominance(data) {
    const bitcoin = data.find(coin => coin.id === 'bitcoin');
    if (!bitcoin || !bitcoin.market_cap) return 0;
    
    const totalMarketCap = data.reduce((sum, coin) => sum + (coin.market_cap || 0), 0);
    if (totalMarketCap === 0) return 0;
    
    return ((bitcoin.market_cap / totalMarketCap) * 100).toFixed(1);
}

/**
 * Caching Functions
 */

/**
 * Get cached data if still valid
 * @param {string} key - Cache key
 * @returns {Object|null} Cached data or null if expired
 */
function getCachedData(key) {
    const cached = marketCache.get(key);
    if (!cached) return null;
    
    const now = Date.now();
    if (now - cached.timestamp > MARKET_CONFIG.CACHE_TTL) {
        marketCache.delete(key);
        return null;
    }
    
    return cached.data;
}

/**
 * Set data in cache with TTL
 * @param {string} key - Cache key
 * @param {Object} data - Data to cache
 * @param {number} ttl - Time to live in milliseconds
 */
function setCachedData(key, data, ttl = MARKET_CONFIG.CACHE_TTL) {
    marketCache.set(key, {
        data: data,
        timestamp: Date.now()
    });
    
    // Auto-cleanup expired entries
    setTimeout(() => {
        if (marketCache.has(key)) {
            const cached = marketCache.get(key);
            if (Date.now() - cached.timestamp > ttl) {
                marketCache.delete(key);
            }
        }
    }, ttl + 1000);
}

/**
 * Error Handling Functions
 */

/**
 * Handle API errors gracefully
 * @param {Error} error - Error object
 * @returns {Array} Empty array or cached fallback
 */
function handleApiError(error) {
    console.error('🚨 Market API Error:', error.message);
    
    // Try to return cached data even if expired
    const expiredCache = [...marketCache.values()]
        .find(cache => cache.data && Array.isArray(cache.data));
    
    if (expiredCache) {
        console.log('📦 Using expired cache as fallback');
        return expiredCache.data;
    }
    
    // Return empty state with error info
    return {
        error: true,
        message: 'Falha ao carregar dados do mercado',
        details: error.message,
        timestamp: new Date().toISOString()
    };
}

/**
 * Retry mechanism with exponential backoff
 * @param {Function} requestFunction - Function to retry
 * @param {number} maxRetries - Maximum number of retries
 * @returns {Promise} Request result
 */
async function retryRequest(requestFunction, maxRetries = MARKET_CONFIG.MAX_RETRIES) {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            const result = await requestFunction();
            return result;
        } catch (error) {
            if (attempt === maxRetries) {
                throw error;
            }
            
            const delay = MARKET_CONFIG.RETRY_DELAY * Math.pow(2, attempt);
            console.log(`⏳ Retry attempt ${attempt + 1}/${maxRetries} in ${delay}ms`);
            
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
}

/**
 * Helper Functions
 */

/**
 * Get symbol from coin ID
 * @param {string} id - Coin ID
 * @returns {string} Symbol
 */
function getSymbolFromId(id) {
    const symbols = {
        'bitcoin': 'BTC',
        'ethereum': 'ETH',
        'solana': 'SOL',
        'binancecoin': 'BNB',
        'ripple': 'XRP',
        'pendle': 'PENDLE'
    };
    return symbols[id] || id.toUpperCase();
}

/**
 * Get full name from coin ID
 * @param {string} id - Coin ID
 * @returns {string} Full name
 */
function getNameFromId(id) {
    const names = {
        'bitcoin': 'Bitcoin',
        'ethereum': 'Ethereum',
        'solana': 'Solana',
        'binancecoin': 'BNB',
        'ripple': 'XRP',
        'pendle': 'Pendle'
    };
    return names[id] || id;
}

/**
 * Get CoinGecko image ID for backup scenarios
 * @param {string} id - Coin ID
 * @returns {string} Image ID
 */
function getCoinImageId(id) {
    const imageIds = {
        'bitcoin': '1',
        'ethereum': '279',
        'solana': '4128',
        'binancecoin': '825',
        'ripple': '44',
        'pendle': '15069'
    };
    return imageIds[id] || '1';
}

/**
 * Auto-refresh functionality
 */

/**
 * Start auto-refresh with visual countdown
 */
function startAutoRefresh() {
    if (autoRefreshInterval) {
        clearInterval(autoRefreshInterval);
    }
    
    autoRefreshInterval = setInterval(async () => {
        console.log('🔄 Auto-refreshing market data...');
        try {
            await refreshMarketData();
        } catch (error) {
            console.error('Auto-refresh failed:', error);
        }
    }, MARKET_CONFIG.UPDATE_INTERVAL);
    
    console.log('✅ Auto-refresh started (every 2 minutes)');
}

/**
 * Stop auto-refresh
 */
function stopAutoRefresh() {
    if (autoRefreshInterval) {
        clearInterval(autoRefreshInterval);
        autoRefreshInterval = null;
        console.log('⏹️ Auto-refresh stopped');
    }
}

/**
 * Manual refresh function
 */
async function refreshMarketData() {
    const loadingElement = document.getElementById('marketLoading');
    const errorElement = document.getElementById('marketError');
    
    try {
        // Show loading state
        if (loadingElement) {
            loadingElement.style.display = 'block';
        }
        if (errorElement) {
            errorElement.style.display = 'none';
        }
        
        // Clear cache to force fresh data
        marketCache.clear();
        
        // Fetch fresh data
        const data = await fetchMarketSnapshot();
        
        // Update UI
        if (typeof updateMarketDisplay === 'function') {
            updateMarketDisplay(data);
        }
        
        console.log('✅ Market data refreshed successfully');
        
    } catch (error) {
        console.error('❌ Manual refresh failed:', error);
        
        // Show error state
        if (errorElement) {
            errorElement.style.display = 'block';
            errorElement.textContent = 'Falha ao atualizar dados. Tentando novamente...';
        }
        
        // Auto-retry after delay
        setTimeout(() => refreshMarketData(), 30000);
        
    } finally {
        // Hide loading state
        if (loadingElement) {
            loadingElement.style.display = 'none';
        }
    }
}

/**
 * Initialize market data module
 */
function initializeMarketData() {
    console.log('🚀 Initializing Market Data Module...');
    console.log('📊 Tracking coins:', MARKET_CONFIG.COINS);
    
    // Start auto-refresh
    startAutoRefresh();
    
    // Add manual refresh button handler
    const refreshButton = document.getElementById('refreshMarket');
    if (refreshButton) {
        refreshButton.addEventListener('click', refreshMarketData);
        console.log('🔄 Manual refresh button connected');
    }
    
    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
        stopAutoRefresh();
        marketCache.clear();
    });
    
    console.log('✅ Market Data Module initialized successfully');
}

/**
 * Public API - Export functions for use in other modules
 */
window.MarketDataAPI = {
    // Core functions
    fetchMarketSnapshot,
    formatPrice,
    formatMarketCap,
    formatPercentage,
    calculateBitcoinDominance,
    
    // Cache management
    getCachedData,
    setCachedData,
    clearCache: () => marketCache.clear(),
    
    // Refresh controls
    refreshMarketData,
    startAutoRefresh,
    stopAutoRefresh,
    
    // Error handling
    handleApiError,
    retryRequest,
    
    // Initialization
    initialize: initializeMarketData,
    
    // Configuration
    config: MARKET_CONFIG,
    
    // Status
    getLastUpdateTime: () => lastUpdateTime,
    getCacheSize: () => marketCache.size,
    isAutoRefreshActive: () => !!autoRefreshInterval
};

console.log('📈 Market Data Module loaded successfully');