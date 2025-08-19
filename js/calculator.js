// Portfolio Calculator with Real-Time Price Data
// Advanced portfolio calculations with live crypto prices

class PortfolioCalculator {
  constructor() {
    this.priceAPI = new CryptoPriceAPI();
    this.portfolioCache = new Map();
    this.updateInterval = null;
    this.lastCalculation = null;
  }
  
  /**
   * Calculate portfolio value with real-time prices
   * @param {Object} allocation - Percentage allocation per crypto
   * @param {number} investmentAmount - Total investment amount in BRL
   * @returns {Promise<Object>} Complete portfolio calculation
   */
  async calculatePortfolioValue(allocation, investmentAmount) {
    try {
      console.log('💼 Calculating portfolio value...', { allocation, investmentAmount });
      
      // Get current prices for all crypto assets
      const cryptoIds = this.getAllocationCryptoIds(allocation);
      const prices = await this.priceAPI.getPrices(cryptoIds);
      
      if (!prices) {
        throw new Error('Failed to fetch price data');
      }
      
      let portfolioData = {};
      let totalValue = 0;
      let totalChange24h = 0;
      let totalMarketCap = 0;
      
      // Calculate value for each cryptocurrency
      for (const [cryptoSymbol, percentage] of Object.entries(allocation)) {
        if (percentage <= 0) continue;
        
        const cryptoId = this.priceAPI.symbolToId(cryptoSymbol);
        const priceData = prices[cryptoId];
        
        if (!priceData) {
          console.warn(`⚠️ No price data for ${cryptoSymbol} (${cryptoId})`);
          continue;
        }
        
        const allocationValue = (investmentAmount * percentage) / 100;
        const cryptoPrice = priceData.brl || 0;
        const quantity = cryptoPrice > 0 ? allocationValue / cryptoPrice : 0;
        const change24h = priceData.usd_24h_change || 0;
        const marketCap = priceData.usd_market_cap || 0;
        
        portfolioData[cryptoSymbol] = {
          symbol: cryptoSymbol,
          id: cryptoId,
          percentage: percentage,
          value: allocationValue,
          quantity: quantity,
          price: {
            brl: cryptoPrice,
            usd: priceData.usd || 0
          },
          change24h: change24h,
          changeValue24h: (allocationValue * change24h) / 100,
          marketCap: marketCap,
          lastUpdated: priceData.last_updated_at ? new Date(priceData.last_updated_at * 1000) : new Date()
        };
        
        totalValue += allocationValue;
        totalChange24h += (allocationValue * change24h) / 100;
        totalMarketCap += (marketCap * percentage) / 100; // Weighted market cap
      }
      
      // Calculate portfolio metrics
      const portfolioMetrics = this.calculatePortfolioMetrics(portfolioData, totalValue);
      
      const result = {
        portfolioData,
        summary: {
          totalValue,
          totalChange24h,
          totalChangePercent24h: totalValue > 0 ? (totalChange24h / totalValue) * 100 : 0,
          weightedMarketCap: totalMarketCap,
          lastUpdated: new Date().toISOString(),
          currency: 'BRL'
        },
        metrics: portfolioMetrics,
        allocation: allocation,
        investmentAmount: investmentAmount
      };
      
      // Cache the result
      this.lastCalculation = result;
      this.portfolioCache.set('latest', {
        data: result,
        timestamp: Date.now()
      });
      
      console.log('✅ Portfolio calculation completed', result.summary);
      return result;
      
    } catch (error) {
      console.error('❌ Error calculating portfolio value:', error);
      
      // Try to return cached data
      const cached = this.portfolioCache.get('latest');
      if (cached && Date.now() - cached.timestamp < 300000) { // 5 minutes
        console.log('📦 Returning cached portfolio calculation');
        return cached.data;
      }
      
      // Return basic calculation without real prices
      return this.calculateBasicPortfolio(allocation, investmentAmount);
    }
  }
  
  /**
   * Extract crypto IDs from allocation object
   * @param {Object} allocation - Portfolio allocation
   * @returns {Array} Array of CoinGecko IDs
   */
  getAllocationCryptoIds(allocation) {
    return Object.keys(allocation)
      .filter(symbol => allocation[symbol] > 0)
      .map(symbol => this.priceAPI.symbolToId(symbol));
  }
  
  /**
   * Calculate advanced portfolio metrics
   * @param {Object} portfolioData - Portfolio data with prices
   * @param {number} totalValue - Total portfolio value
   * @returns {Object} Portfolio metrics
   */
  calculatePortfolioMetrics(portfolioData, totalValue) {
    const assets = Object.values(portfolioData);
    
    if (assets.length === 0) {
      return {
        diversificationScore: 0,
        riskScore: 'N/A',
        largestHolding: 'N/A',
        smallestHolding: 'N/A',
        volatilityIndicator: 'N/A'
      };
    }
    
    // Sort assets by value
    const sortedAssets = assets.sort((a, b) => b.value - a.value);
    
    // Calculate diversification score (Herfindahl-Hirschman Index)
    const hhi = assets.reduce((sum, asset) => {
      const weight = (asset.value / totalValue) * 100;
      return sum + Math.pow(weight, 2);
    }, 0);
    
    // Diversification score (inverted HHI, normalized)
    const diversificationScore = Math.max(0, Math.min(100, 
      100 - ((hhi - 1000) / 9000) * 100
    ));
    
    // Risk score based on 24h changes
    const avgVolatility = assets.reduce((sum, asset) => 
      sum + Math.abs(asset.change24h), 0
    ) / assets.length;
    
    let riskScore = 'Baixo';
    if (avgVolatility > 10) riskScore = 'Alto';
    else if (avgVolatility > 5) riskScore = 'Médio';
    
    // Volatility indicator
    const maxChange = Math.max(...assets.map(a => Math.abs(a.change24h)));
    let volatilityIndicator = 'Estável';
    if (maxChange > 15) volatilityIndicator = 'Alta Volatilidade';
    else if (maxChange > 8) volatilityIndicator = 'Volatilidade Moderada';
    
    return {
      diversificationScore: Math.round(diversificationScore),
      riskScore,
      largestHolding: sortedAssets[0]?.symbol || 'N/A',
      smallestHolding: sortedAssets[sortedAssets.length - 1]?.symbol || 'N/A',
      volatilityIndicator,
      averageChange24h: assets.reduce((sum, asset) => sum + asset.change24h, 0) / assets.length,
      assetsCount: assets.length
    };
  }
  
  /**
   * Calculate basic portfolio without real prices (fallback)
   * @param {Object} allocation - Portfolio allocation
   * @param {number} investmentAmount - Investment amount
   * @returns {Object} Basic portfolio calculation
   */
  calculateBasicPortfolio(allocation, investmentAmount) {
    console.log('🔄 Using basic portfolio calculation (no live prices)');
    
    const portfolioData = {};
    let totalValue = 0;
    
    for (const [cryptoSymbol, percentage] of Object.entries(allocation)) {
      if (percentage <= 0) continue;
      
      const allocationValue = (investmentAmount * percentage) / 100;
      
      portfolioData[cryptoSymbol] = {
        symbol: cryptoSymbol,
        percentage: percentage,
        value: allocationValue,
        quantity: 0, // Can't calculate without price
        price: { brl: 0, usd: 0 },
        change24h: 0,
        changeValue24h: 0,
        marketCap: 0,
        lastUpdated: new Date()
      };
      
      totalValue += allocationValue;
    }
    
    return {
      portfolioData,
      summary: {
        totalValue,
        totalChange24h: 0,
        totalChangePercent24h: 0,
        weightedMarketCap: 0,
        lastUpdated: new Date().toISOString(),
        currency: 'BRL'
      },
      metrics: {
        diversificationScore: 0,
        riskScore: 'N/A',
        largestHolding: 'N/A',
        smallestHolding: 'N/A',
        volatilityIndicator: 'Dados indisponíveis'
      },
      allocation: allocation,
      investmentAmount: investmentAmount,
      isBasicCalculation: true
    };
  }
  
  /**
   * Start automatic portfolio updates
   * @param {Object} allocation - Portfolio allocation
   * @param {number} investmentAmount - Investment amount
   * @param {Function} callback - Update callback function
   * @param {number} intervalMs - Update interval in milliseconds
   */
  startAutoUpdate(allocation, investmentAmount, callback, intervalMs = 60000) {
    this.stopAutoUpdate(); // Clear any existing interval
    
    console.log(`🔄 Starting auto-update every ${intervalMs/1000}s`);
    
    this.updateInterval = setInterval(async () => {
      try {
        const updated = await this.calculatePortfolioValue(allocation, investmentAmount);
        if (callback && typeof callback === 'function') {
          callback(updated);
        }
      } catch (error) {
        console.error('❌ Auto-update error:', error);
      }
    }, intervalMs);
  }
  
  /**
   * Stop automatic portfolio updates
   */
  stopAutoUpdate() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
      console.log('⏹️ Auto-update stopped');
    }
  }
  
  /**
   * Compare two portfolio calculations
   * @param {Object} portfolio1 - First portfolio
   * @param {Object} portfolio2 - Second portfolio  
   * @returns {Object} Comparison results
   */
  comparePortfolios(portfolio1, portfolio2) {
    return {
      valueDifference: portfolio2.summary.totalValue - portfolio1.summary.totalValue,
      changePercentDifference: portfolio2.summary.totalChangePercent24h - portfolio1.summary.totalChangePercent24h,
      diversificationDifference: portfolio2.metrics.diversificationScore - portfolio1.metrics.diversificationScore,
      timeSpan: new Date(portfolio2.summary.lastUpdated) - new Date(portfolio1.summary.lastUpdated)
    };
  }
  
  /**
   * Generate portfolio performance report
   * @param {Object} portfolio - Portfolio data
   * @returns {Object} Performance report
   */
  generatePerformanceReport(portfolio) {
    const { summary, metrics, portfolioData } = portfolio;
    
    const topPerformers = Object.values(portfolioData)
      .sort((a, b) => b.change24h - a.change24h)
      .slice(0, 3);
    
    const underPerformers = Object.values(portfolioData)
      .sort((a, b) => a.change24h - b.change24h)
      .slice(0, 3);
    
    return {
      overview: {
        totalValue: this.priceAPI.formatPrice(summary.totalValue),
        change24h: this.priceAPI.formatChange(summary.totalChangePercent24h),
        diversificationScore: `${metrics.diversificationScore}/100`,
        riskLevel: metrics.riskScore,
        lastUpdated: summary.lastUpdated
      },
      topPerformers: topPerformers.map(asset => ({
        symbol: asset.symbol,
        change: this.priceAPI.formatChange(asset.change24h),
        value: this.priceAPI.formatPrice(asset.value)
      })),
      underPerformers: underPerformers.map(asset => ({
        symbol: asset.symbol,
        change: this.priceAPI.formatChange(asset.change24h),
        value: this.priceAPI.formatPrice(asset.value)
      })),
      recommendations: this.generateRecommendations(portfolio)
    };
  }
  
  /**
   * Generate portfolio recommendations
   * @param {Object} portfolio - Portfolio data
   * @returns {Array} Array of recommendations
   */
  generateRecommendations(portfolio) {
    const recommendations = [];
    const { metrics, portfolioData } = portfolio;
    
    // Diversification recommendations
    if (metrics.diversificationScore < 50) {
      recommendations.push({
        type: 'diversification',
        message: 'Considere diversificar mais sua carteira para reduzir riscos',
        priority: 'high'
      });
    }
    
    // Risk recommendations
    if (metrics.riskScore === 'Alto') {
      recommendations.push({
        type: 'risk',
        message: 'Portfolio com alta volatilidade. Monitore posições frequentemente',
        priority: 'medium'
      });
    }
    
    // Concentration recommendations
    const assets = Object.values(portfolioData);
    const maxAllocation = Math.max(...assets.map(a => a.percentage));
    if (maxAllocation > 60) {
      recommendations.push({
        type: 'concentration',
        message: 'Alta concentração em um ativo. Considere rebalanceamento',
        priority: 'medium'
      });
    }
    
    return recommendations;
  }
  
  /**
   * Export portfolio data for external use
   * @param {Object} portfolio - Portfolio data
   * @param {string} format - Export format ('json', 'csv')
   * @returns {string} Exported data
   */
  exportPortfolio(portfolio, format = 'json') {
    if (format === 'csv') {
      const headers = ['Symbol', 'Percentage', 'Value (BRL)', 'Quantity', 'Price (BRL)', 'Change 24h'];
      const rows = Object.values(portfolio.portfolioData).map(asset => [
        asset.symbol,
        `${asset.percentage}%`,
        asset.value.toFixed(2),
        asset.quantity.toFixed(8),
        asset.price.brl.toFixed(2),
        `${asset.change24h.toFixed(2)}%`
      ]);
      
      return [headers, ...rows].map(row => row.join(',')).join('\n');
    }
    
    return JSON.stringify(portfolio, null, 2);
  }
  
  /**
   * Clear all cached data
   */
  clearCache() {
    this.portfolioCache.clear();
    this.priceAPI.clearCache();
    console.log('🗑️ Portfolio calculator cache cleared');
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PortfolioCalculator;
} else {
  window.PortfolioCalculator = PortfolioCalculator;
}