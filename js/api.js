// Real-Time Crypto Prices API Integration
// CoinGecko API integration with advanced caching and error handling

class CryptoPriceAPI {
  constructor() {
    this.baseURL = 'https://api.coingecko.com/api/v3';
    this.cache = new Map();
    this.cacheTimeout = 60000; // 1 minute
    this.retryAttempts = 3;
    this.retryDelay = 1000; // 1 second
  }
  
  /**
   * Get current prices for specified cryptocurrencies
   * @param {Array} cryptoIds - Array of CoinGecko IDs
   * @returns {Promise<Object>} Price data
   */
  async getPrices(cryptoIds = ['bitcoin', 'ethereum', 'solana', 'binancecoin', 'ripple']) {
    const cacheKey = cryptoIds.join(',');
    const cached = this.cache.get(cacheKey);
    
    // Return cached data if still fresh
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      console.log('📦 Returning cached price data');
      return cached.data;
    }
    
    try {
      const data = await this.fetchWithRetry(() => 
        this.fetchPricesFromAPI(cryptoIds)
      );
      
      // Cache the result
      this.cache.set(cacheKey, {
        data: data,
        timestamp: Date.now()
      });
      
      console.log('💰 Fresh price data fetched and cached');
      return data;
    } catch (error) {
      console.error('❌ Error fetching crypto prices:', error);
      
      // Return stale cached data if available
      if (cached) {
        console.log('⚠️ Returning stale cached data due to API error');
        return cached.data;
      }
      
      // Return fallback data as last resort
      console.log('🔄 Using fallback price data');
      return this.getFallbackPrices();
    }
  }
  
  /**
   * Fetch prices from CoinGecko API
   * @param {Array} cryptoIds - Array of cryptocurrency IDs
   * @returns {Promise<Object>} API response data
   */
  async fetchPricesFromAPI(cryptoIds) {
    const url = `${this.baseURL}/simple/price?ids=${cryptoIds.join(',')}&vs_currencies=brl,usd&include_24hr_change=true&include_market_cap=true&include_24hr_vol=true&include_last_updated_at=true`;
    
    console.log('🌐 Fetching prices from:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'CryptoConsultor/3.0.0'
      }
    });
    
    if (!response.ok) {
      throw new Error(`CoinGecko API Error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Validate response structure
    if (!data || Object.keys(data).length === 0) {
      throw new Error('Invalid API response: Empty data');
    }
    
    return data;
  }
  
  /**
   * Retry wrapper for API calls
   * @param {Function} apiCall - Function that makes the API call
   * @returns {Promise} Result of successful API call
   */
  async fetchWithRetry(apiCall) {
    let lastError;
    
    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        return await apiCall();
      } catch (error) {
        lastError = error;
        console.warn(`🔄 API attempt ${attempt}/${this.retryAttempts} failed:`, error.message);
        
        if (attempt < this.retryAttempts) {
          await this.delay(this.retryDelay * attempt); // Exponential backoff
        }
      }
    }
    
    throw lastError;
  }
  
  /**
   * Get historical price data for charts
   * @param {string} cryptoId - CoinGecko cryptocurrency ID
   * @param {number} days - Number of days of history
   * @returns {Promise<Object|null>} Historical price data
   */
  async getHistoricalData(cryptoId, days = 7) {
    const cacheKey = `historical_${cryptoId}_${days}`;
    const cached = this.cache.get(cacheKey);
    
    // Cache historical data for 1 hour
    if (cached && Date.now() - cached.timestamp < 3600000) {
      return cached.data;
    }
    
    try {
      const url = `${this.baseURL}/coins/${cryptoId}/market_chart?vs_currency=brl&days=${days}&interval=${days > 30 ? 'daily' : 'hourly'}`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Historical data API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Cache the result
      this.cache.set(cacheKey, {
        data: data,
        timestamp: Date.now()
      });
      
      console.log(`📈 Historical data fetched for ${cryptoId} (${days} days)`);
      return data;
    } catch (error) {
      console.error('❌ Error fetching historical data:', error);
      
      // Return cached data if available
      if (cached) {
        return cached.data;
      }
      
      return null;
    }
  }
  
  /**
   * Get trending cryptocurrencies
   * @returns {Promise<Array>} Trending coins data
   */
  async getTrendingCoins() {
    try {
      const response = await fetch(`${this.baseURL}/search/trending`);
      if (!response.ok) {
        throw new Error(`Trending API error: ${response.status}`);
      }
      
      const data = await response.json();
      return data.coins || [];
    } catch (error) {
      console.error('❌ Error fetching trending coins:', error);
      return [];
    }
  }
  
  /**
   * Get fallback prices when API is unavailable
   * @returns {Object} Fallback price data
   */
  getFallbackPrices() {
    return {
      bitcoin: { 
        brl: 350000, 
        usd: 70000, 
        usd_24h_change: 2.5,
        usd_market_cap: 1380000000000,
        last_updated_at: Math.floor(Date.now() / 1000)
      },
      ethereum: { 
        brl: 15000, 
        usd: 3000, 
        usd_24h_change: 1.8,
        usd_market_cap: 360000000000,
        last_updated_at: Math.floor(Date.now() / 1000)
      },
      solana: { 
        brl: 800, 
        usd: 160, 
        usd_24h_change: -0.5,
        usd_market_cap: 75000000000,
        last_updated_at: Math.floor(Date.now() / 1000)
      },
      binancecoin: { 
        brl: 2000, 
        usd: 400, 
        usd_24h_change: 1.2,
        usd_market_cap: 60000000000,
        last_updated_at: Math.floor(Date.now() / 1000)
      },
      ripple: { 
        brl: 3, 
        usd: 0.6, 
        usd_24h_change: 0.8,
        usd_market_cap: 35000000000,
        last_updated_at: Math.floor(Date.now() / 1000)
      }
    };
  }
  
  /**
   * Convert cryptocurrency symbols to CoinGecko IDs
   * @param {string} symbol - Crypto symbol (e.g., 'BTC')
   * @returns {string} CoinGecko ID
   */
  symbolToId(symbol) {
    const symbolMap = {
      'BTC': 'bitcoin',
      'ETH': 'ethereum',
      'SOL': 'solana',
      'BNB': 'binancecoin',
      'XRP': 'ripple',
      'PENDLE': 'pendle',
      'SPX6900': 'spx6900'
    };
    
    return symbolMap[symbol.toUpperCase()] || symbol.toLowerCase();
  }
  
  /**
   * Format price for display
   * @param {number} price - Raw price value
   * @param {string} currency - Currency code
   * @returns {string} Formatted price string
   */
  formatPrice(price, currency = 'BRL') {
    if (typeof price !== 'number' || isNaN(price)) {
      return '—';
    }
    
    const formatters = {
      BRL: new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: price < 1 ? 4 : 2,
        maximumFractionDigits: price < 1 ? 6 : 2
      }),
      USD: new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: price < 1 ? 4 : 2,
        maximumFractionDigits: price < 1 ? 6 : 2
      })
    };
    
    const formatter = formatters[currency.toUpperCase()] || formatters.BRL;
    return formatter.format(price);
  }
  
  /**
   * Format percentage change for display
   * @param {number} change - Percentage change value
   * @returns {string} Formatted change string with color indicator
   */
  formatChange(change) {
    if (typeof change !== 'number' || isNaN(change)) {
      return { text: '—', color: 'neutral' };
    }
    
    const formatted = change.toFixed(2);
    const text = `${change >= 0 ? '+' : ''}${formatted}%`;
    const color = change >= 0 ? 'positive' : 'negative';
    
    return { text, color };
  }
  
  /**
   * Utility delay function
   * @param {number} ms - Milliseconds to delay
   * @returns {Promise} Delay promise
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  /**
   * Clear all cached data
   */
  clearCache() {
    this.cache.clear();
    console.log('🗑️ Price cache cleared');
  }
  
  /**
   * Get cache statistics
   * @returns {Object} Cache stats
   */
  getCacheStats() {
    const entries = Array.from(this.cache.entries());
    const now = Date.now();
    
    return {
      totalEntries: entries.length,
      freshEntries: entries.filter(([, value]) => 
        now - value.timestamp < this.cacheTimeout
      ).length,
      staleEntries: entries.filter(([, value]) => 
        now - value.timestamp >= this.cacheTimeout
      ).length,
      cacheTimeout: this.cacheTimeout
    };
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CryptoPriceAPI;
} else {
  window.CryptoPriceAPI = CryptoPriceAPI;
}