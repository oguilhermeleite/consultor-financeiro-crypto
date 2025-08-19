// User Analysis History Manager
// Comprehensive system for tracking and analyzing user's portfolio analysis history

class UserHistoryManager {
  constructor() {
    this.analyses = this.loadAnalyses();
    this.maxHistorySize = 50; // Keep last 50 analyses
    this.priceAPI = null;
    
    this.initializeHistoryManager();
  }
  
  /**
   * Initialize the history manager
   */
  async initializeHistoryManager() {
    // Wait for price API to be available
    await this.waitForPriceAPI();
    
    // Clean old analyses
    this.cleanOldAnalyses();
    
    // Setup event listeners
    this.setupEventListeners();
    
    console.log('📚 History Manager initialized with', this.analyses.length, 'analyses');
  }
  
  /**
   * Wait for price API to be available
   */
  async waitForPriceAPI() {
    let attempts = 0;
    const maxAttempts = 10;
    
    while (attempts < maxAttempts) {
      if (window.cryptoFeatures?.priceAPI) {
        this.priceAPI = window.cryptoFeatures.priceAPI;
        return;
      }
      
      await new Promise(resolve => setTimeout(resolve, 500));
      attempts++;
    }
  }
  
  /**
   * Setup event listeners for automatic history tracking
   */
  setupEventListeners() {
    // Listen for profile calculations
    document.addEventListener('profileCalculated', (event) => {
      this.saveAnalysis(event.detail);
    });
    
    // Listen for manual save requests
    document.addEventListener('saveAnalysisToHistory', (event) => {
      this.saveAnalysis(event.detail);
    });
  }
  
  /**
   * Save a new analysis to history
   * @param {Object} analysisData - Analysis data to save
   * @returns {string} Analysis ID
   */
  async saveAnalysis(analysisData) {
    // Get current market data if available
    const marketConditions = await this.getCurrentMarketConditions();
    
    const analysis = {
      id: this.generateAnalysisId(),
      timestamp: Date.now(),
      date: new Date().toLocaleDateString('pt-BR'),
      time: new Date().toLocaleTimeString('pt-BR'),
      profile: analysisData.profile || analysisData.type,
      objective: analysisData.objective,
      risk: analysisData.risk,
      amount: analysisData.amount,
      experience: analysisData.experience,
      allocation: analysisData.allocation,
      tips: analysisData.tips,
      formData: analysisData.formData || {},
      marketConditions: marketConditions,
      metadata: {
        userAgent: navigator.userAgent,
        sessionId: this.getSessionId(),
        version: '3.0.0'
      }
    };
    
    // Add to beginning of array (most recent first)
    this.analyses.unshift(analysis);
    
    // Keep only last N analyses
    if (this.analyses.length > this.maxHistorySize) {
      this.analyses = this.analyses.slice(0, this.maxHistorySize);
    }
    
    this.saveToStorage();
    
    // Track analytics
    if (window.cryptoFeatures?.analytics) {
      window.cryptoFeatures.analytics.trackEvent('analysis_saved_to_history', {
        profile: analysis.profile,
        totalAnalyses: this.analyses.length,
        isReturningUser: this.analyses.length > 1,
        daysSinceLastAnalysis: this.getDaysSinceLastAnalysis()
      });
    }
    
    // Dispatch event for UI updates
    document.dispatchEvent(new CustomEvent('analysisHistoryUpdated', {
      detail: { newAnalysis: analysis, totalCount: this.analyses.length }
    }));
    
    console.log('📝 Analysis saved to history:', analysis.id);
    return analysis.id;
  }
  
  /**
   * Get current market conditions
   * @returns {Promise<Object>} Market conditions
   */
  async getCurrentMarketConditions() {
    if (!this.priceAPI) {
      return {
        btcPrice: null,
        ethPrice: null,
        marketTrend: 'unknown',
        timestamp: Date.now()
      };
    }
    
    try {
      const prices = await this.priceAPI.getPrices(['bitcoin', 'ethereum']);
      const btcData = prices.bitcoin;
      const ethData = prices.ethereum;
      
      // Determine market trend based on BTC and ETH 24h changes
      const btcChange = btcData?.usd_24h_change || 0;
      const ethChange = ethData?.usd_24h_change || 0;
      const avgChange = (btcChange + ethChange) / 2;
      
      let marketTrend = 'neutral';
      if (avgChange > 3) marketTrend = 'bullish';
      else if (avgChange < -3) marketTrend = 'bearish';
      
      return {
        btcPrice: btcData?.brl || null,
        ethPrice: ethData?.brl || null,
        btcChange24h: btcChange,
        ethChange24h: ethChange,
        marketTrend: marketTrend,
        timestamp: Date.now()
      };
    } catch (error) {
      console.error('Error getting market conditions:', error);
      return {
        btcPrice: null,
        ethPrice: null,
        marketTrend: 'unknown',
        timestamp: Date.now()
      };
    }
  }
  
  /**
   * Get analysis history
   * @returns {Array} All analyses
   */
  getAnalysisHistory() {
    return this.analyses;
  }
  
  /**
   * Get analysis by ID
   * @param {string} id - Analysis ID
   * @returns {Object|null} Analysis data
   */
  getAnalysisById(id) {
    return this.analyses.find(analysis => analysis.id === id);
  }
  
  /**
   * Get recent analyses
   * @param {number} limit - Number of analyses to return
   * @returns {Array} Recent analyses
   */
  getRecentAnalyses(limit = 10) {
    return this.analyses.slice(0, limit);
  }
  
  /**
   * Delete an analysis
   * @param {string} id - Analysis ID to delete
   * @returns {boolean} Success status
   */
  deleteAnalysis(id) {
    const initialLength = this.analyses.length;
    this.analyses = this.analyses.filter(analysis => analysis.id !== id);
    
    if (this.analyses.length < initialLength) {
      this.saveToStorage();
      console.log('🗑️ Analysis deleted:', id);
      return true;
    }
    
    return false;
  }
  
  /**
   * Get profile evolution over time
   * @returns {Object} Profile evolution data
   */
  getProfileEvolution() {
    const profileCounts = {};
    const evolution = [];
    const profileChanges = [];
    
    // Process in chronological order (oldest first)
    const sortedAnalyses = [...this.analyses].reverse();
    
    let previousProfile = null;
    
    sortedAnalyses.forEach((analysis, index) => {
      profileCounts[analysis.profile] = (profileCounts[analysis.profile] || 0) + 1;
      
      evolution.push({
        date: analysis.date,
        profile: analysis.profile,
        totalAnalyses: index + 1,
        timestamp: analysis.timestamp
      });
      
      // Track profile changes
      if (previousProfile && previousProfile !== analysis.profile) {
        profileChanges.push({
          from: previousProfile,
          to: analysis.profile,
          date: analysis.date,
          timestamp: analysis.timestamp,
          direction: this.getProfileDirection(previousProfile, analysis.profile)
        });
      }
      
      previousProfile = analysis.profile;
    });
    
    // Find most common profile
    const mostCommonProfile = Object.keys(profileCounts).reduce((a, b) => 
      profileCounts[a] > profileCounts[b] ? a : b, 'moderado'
    );
    
    return {
      evolution,
      profileDistribution: profileCounts,
      mostCommonProfile,
      profileChanges,
      consistency: this.calculateProfileConsistency(),
      trends: this.identifyProfileTrends(evolution)
    };
  }
  
  /**
   * Calculate profile consistency score
   * @returns {Object} Consistency metrics
   */
  calculateProfileConsistency() {
    if (this.analyses.length < 2) {
      return { score: 100, description: 'Primeira análise' };
    }
    
    const profiles = this.analyses.map(a => a.profile);
    const uniqueProfiles = new Set(profiles);
    
    // Calculate consistency score (0-100)
    let score = 100;
    if (uniqueProfiles.size > 1) {
      score = Math.max(0, 100 - (uniqueProfiles.size - 1) * 20);
    }
    
    let description;
    if (score >= 80) description = 'Muito consistente';
    else if (score >= 60) description = 'Moderadamente consistente';
    else if (score >= 40) description = 'Pouco consistente';
    else description = 'Muito variável';
    
    return { score, description, uniqueProfiles: uniqueProfiles.size };
  }
  
  /**
   * Identify profile trends
   * @param {Array} evolution - Profile evolution data
   * @returns {Object} Trend analysis
   */
  identifyProfileTrends(evolution) {
    if (evolution.length < 3) {
      return { trend: 'insufficient_data', description: 'Dados insuficientes' };
    }
    
    const recent = evolution.slice(-5); // Last 5 analyses
    const profiles = recent.map(e => e.profile);
    
    // Check for trending direction
    const conservativeCount = profiles.filter(p => p === 'conservador').length;
    const moderateCount = profiles.filter(p => p === 'moderado').length;
    const aggressiveCount = profiles.filter(p => p === 'arrojado').length;
    
    let trend = 'stable';
    let description = 'Perfil estável';
    
    if (aggressiveCount > conservativeCount + moderateCount) {
      trend = 'more_aggressive';
      description = 'Tendência mais agressiva';
    } else if (conservativeCount > aggressiveCount + moderateCount) {
      trend = 'more_conservative';
      description = 'Tendência mais conservadora';
    } else if (moderateCount > 3) {
      trend = 'stabilizing';
      description = 'Estabilizando no moderado';
    }
    
    return { trend, description, recentProfiles: profiles };
  }
  
  /**
   * Compare two analyses
   * @param {string} id1 - First analysis ID
   * @param {string} id2 - Second analysis ID
   * @returns {Object|null} Comparison results
   */
  compareAnalyses(id1, id2) {
    const analysis1 = this.getAnalysisById(id1);
    const analysis2 = this.getAnalysisById(id2);
    
    if (!analysis1 || !analysis2) return null;
    
    const timeSpan = Math.abs(analysis2.timestamp - analysis1.timestamp);
    const daysDifference = Math.floor(timeSpan / (1000 * 60 * 60 * 24));
    
    return {
      timeSpan: timeSpan,
      daysDifference: daysDifference,
      profileChange: {
        changed: analysis1.profile !== analysis2.profile,
        from: analysis1.profile,
        to: analysis2.profile,
        direction: this.getProfileDirection(analysis1.profile, analysis2.profile)
      },
      riskChange: {
        changed: analysis1.risk !== analysis2.risk,
        from: analysis1.risk,
        to: analysis2.risk
      },
      objectiveChange: {
        changed: analysis1.objective !== analysis2.objective,
        from: analysis1.objective,
        to: analysis2.objective
      },
      allocationDifferences: this.calculateAllocationDifferences(
        analysis1.allocation, 
        analysis2.allocation
      ),
      marketConditionComparison: this.compareMarketConditions(
        analysis1.marketConditions,
        analysis2.marketConditions
      ),
      insights: this.generateComparisonInsights(analysis1, analysis2)
    };
  }
  
  /**
   * Calculate allocation differences between two analyses
   * @param {Object} allocation1 - First allocation
   * @param {Object} allocation2 - Second allocation
   * @returns {Object} Allocation differences
   */
  calculateAllocationDifferences(allocation1, allocation2) {
    const differences = {};
    const allCryptos = new Set([...Object.keys(allocation1), ...Object.keys(allocation2)]);
    
    allCryptos.forEach(crypto => {
      const percent1 = allocation1[crypto] || 0;
      const percent2 = allocation2[crypto] || 0;
      const difference = percent2 - percent1;
      
      if (Math.abs(difference) > 0.1) { // Only significant changes
        differences[crypto] = {
          from: percent1,
          to: percent2,
          change: difference,
          changeType: difference > 0 ? 'increase' : 'decrease',
          significant: Math.abs(difference) > 5
        };
      }
    });
    
    return differences;
  }
  
  /**
   * Compare market conditions between analyses
   * @param {Object} market1 - First market conditions
   * @param {Object} market2 - Second market conditions
   * @returns {Object} Market comparison
   */
  compareMarketConditions(market1, market2) {
    if (!market1 || !market2) {
      return { available: false };
    }
    
    const btcChange = market2.btcPrice && market1.btcPrice ? 
      ((market2.btcPrice - market1.btcPrice) / market1.btcPrice) * 100 : null;
    
    const ethChange = market2.ethPrice && market1.ethPrice ? 
      ((market2.ethPrice - market1.ethPrice) / market1.ethPrice) * 100 : null;
    
    return {
      available: true,
      trendChange: {
        from: market1.marketTrend,
        to: market2.marketTrend,
        changed: market1.marketTrend !== market2.marketTrend
      },
      priceChanges: {
        btc: btcChange,
        eth: ethChange
      },
      timeSpan: market2.timestamp - market1.timestamp
    };
  }
  
  /**
   * Generate insights from comparison
   * @param {Object} oldAnalysis - Older analysis
   * @param {Object} newAnalysis - Newer analysis
   * @returns {Array} Array of insights
   */
  generateComparisonInsights(oldAnalysis, newAnalysis) {
    const insights = [];
    
    // Profile change insight
    if (oldAnalysis.profile !== newAnalysis.profile) {
      const direction = this.getProfileDirection(oldAnalysis.profile, newAnalysis.profile);
      insights.push({
        type: 'profile_change',
        priority: 'high',
        message: `Seu perfil mudou de ${oldAnalysis.profile} para ${newAnalysis.profile} (${direction})`,
        suggestion: this.getProfileChangeAdvice(oldAnalysis.profile, newAnalysis.profile),
        impact: 'high'
      });
    }
    
    // Risk tolerance change
    if (oldAnalysis.risk !== newAnalysis.risk) {
      insights.push({
        type: 'risk_change',
        priority: 'medium',
        message: `Sua tolerância a risco mudou de ${oldAnalysis.risk} para ${newAnalysis.risk}`,
        suggestion: 'Considere se essa mudança reflete sua situação atual',
        impact: 'medium'
      });
    }
    
    // Time period analysis
    const daysDifference = Math.floor((newAnalysis.timestamp - oldAnalysis.timestamp) / (1000 * 60 * 60 * 24));
    if (daysDifference < 7 && this.analyses.length > 5) {
      insights.push({
        type: 'frequent_analysis',
        priority: 'low',
        message: `Você fez ${this.analyses.length} análises recentemente`,
        suggestion: 'Considere manter consistência na estratégia por mais tempo',
        impact: 'low'
      });
    }
    
    // Market condition insight
    if (oldAnalysis.marketConditions && newAnalysis.marketConditions) {
      const marketChanged = oldAnalysis.marketConditions.marketTrend !== newAnalysis.marketConditions.marketTrend;
      if (marketChanged) {
        insights.push({
          type: 'market_change',
          priority: 'medium',
          message: `Condições de mercado mudaram: ${oldAnalysis.marketConditions.marketTrend} → ${newAnalysis.marketConditions.marketTrend}`,
          suggestion: 'Sua mudança de perfil pode estar alinhada com as condições de mercado',
          impact: 'medium'
        });
      }
    }
    
    return insights;
  }
  
  /**
   * Get advice for profile changes
   * @param {string} fromProfile - Previous profile
   * @param {string} toProfile - New profile
   * @returns {string} Advice text
   */
  getProfileChangeAdvice(fromProfile, toProfile) {
    const profileLevels = { conservador: 1, moderado: 2, arrojado: 3 };
    const fromLevel = profileLevels[fromProfile];
    const toLevel = profileLevels[toProfile];
    
    if (toLevel > fromLevel) {
      return 'Certifique-se de que tem experiência e capital para maior risco';
    } else if (toLevel < fromLevel) {
      return 'Mudança prudente - foque na preservação de capital';
    } else {
      return 'Perfil mantido - continue monitorando sua estratégia';
    }
  }
  
  /**
   * Get profile direction
   * @param {string} fromProfile - Previous profile
   * @param {string} toProfile - New profile
   * @returns {string} Direction description
   */
  getProfileDirection(fromProfile, toProfile) {
    const profiles = ['conservador', 'moderado', 'arrojado'];
    const fromIndex = profiles.indexOf(fromProfile);
    const toIndex = profiles.indexOf(toProfile);
    
    if (toIndex > fromIndex) return 'mais agressivo';
    if (toIndex < fromIndex) return 'mais conservador';
    return 'sem mudança';
  }
  
  /**
   * Get days since last analysis
   * @returns {number} Days since last analysis
   */
  getDaysSinceLastAnalysis() {
    if (this.analyses.length < 2) return 0;
    
    const lastAnalysis = this.analyses[1]; // Second most recent (first is current)
    return Math.floor((Date.now() - lastAnalysis.timestamp) / (1000 * 60 * 60 * 24));
  }
  
  /**
   * Get session ID
   * @returns {string} Session ID
   */
  getSessionId() {
    return window.cryptoFeatures?.analytics?.sessionId || 'unknown';
  }
  
  /**
   * Clean old analyses beyond retention period
   */
  cleanOldAnalyses() {
    const maxAge = 365 * 24 * 60 * 60 * 1000; // 1 year
    const cutoffTime = Date.now() - maxAge;
    
    const initialLength = this.analyses.length;
    this.analyses = this.analyses.filter(analysis => analysis.timestamp > cutoffTime);
    
    if (this.analyses.length < initialLength) {
      this.saveToStorage();
      console.log('🧹 Cleaned', initialLength - this.analyses.length, 'old analyses');
    }
  }
  
  /**
   * Generate comprehensive user profile report
   * @returns {Object} User profile report
   */
  generateUserProfileReport() {
    if (this.analyses.length === 0) {
      return {
        status: 'no_data',
        message: 'Nenhuma análise disponível'
      };
    }
    
    const evolution = this.getProfileEvolution();
    const recent = this.getRecentAnalyses(5);
    const firstAnalysis = this.analyses[this.analyses.length - 1];
    const latestAnalysis = this.analyses[0];
    
    return {
      status: 'available',
      summary: {
        totalAnalyses: this.analyses.length,
        timespan: {
          first: firstAnalysis.date,
          latest: latestAnalysis.date,
          daysBetween: Math.floor((latestAnalysis.timestamp - firstAnalysis.timestamp) / (1000 * 60 * 60 * 24))
        },
        currentProfile: latestAnalysis.profile,
        mostCommonProfile: evolution.mostCommonProfile,
        consistency: evolution.consistency
      },
      evolution: evolution,
      recentTrends: {
        profiles: recent.map(a => a.profile),
        risks: recent.map(a => a.risk),
        objectives: recent.map(a => a.objective)
      },
      insights: this.generateUserInsights(),
      recommendations: this.generateUserRecommendations()
    };
  }
  
  /**
   * Generate user insights
   * @returns {Array} User insights
   */
  generateUserInsights() {
    const insights = [];
    const evolution = this.getProfileEvolution();
    
    // Consistency insight
    if (evolution.consistency.score >= 80) {
      insights.push({
        type: 'consistency',
        message: 'Você tem sido muito consistente em suas preferências',
        positive: true
      });
    } else if (evolution.consistency.score < 40) {
      insights.push({
        type: 'variability',
        message: 'Suas preferências têm variado bastante - considere definir uma estratégia mais clara',
        positive: false
      });
    }
    
    // Growth insight
    if (this.analyses.length >= 10) {
      insights.push({
        type: 'experience',
        message: `Você já fez ${this.analyses.length} análises - está se tornando um usuário experiente!`,
        positive: true
      });
    }
    
    // Profile trend insight
    const recent = this.getRecentAnalyses(3);
    const recentProfiles = recent.map(a => a.profile);
    if (new Set(recentProfiles).size === 1) {
      insights.push({
        type: 'stabilization',
        message: `Suas últimas análises convergem para o perfil ${recentProfiles[0]}`,
        positive: true
      });
    }
    
    return insights;
  }
  
  /**
   * Generate user recommendations
   * @returns {Array} Recommendations
   */
  generateUserRecommendations() {
    const recommendations = [];
    const latest = this.analyses[0];
    const evolution = this.getProfileEvolution();
    
    // Profile-specific recommendations
    if (latest.profile === 'conservador') {
      recommendations.push({
        type: 'strategy',
        message: 'Como conservador, considere DCA (Dollar Cost Average) para reduzir volatilidade',
        action: 'learn_dca'
      });
    } else if (latest.profile === 'arrojado') {
      recommendations.push({
        type: 'risk_management',
        message: 'Para perfil arrojado, sempre use stop-loss e take-profit',
        action: 'learn_risk_management'
      });
    }
    
    // Frequency recommendation
    const daysSinceFirst = Math.floor((Date.now() - this.analyses[this.analyses.length - 1].timestamp) / (1000 * 60 * 60 * 24));
    if (daysSinceFirst < 30 && this.analyses.length > 5) {
      recommendations.push({
        type: 'patience',
        message: 'Evite mudanças frequentes - dê tempo para sua estratégia funcionar',
        action: 'set_reminder'
      });
    }
    
    return recommendations;
  }
  
  /**
   * Export complete history
   * @returns {string} Download link
   */
  exportHistory() {
    const report = this.generateUserProfileReport();
    const data = {
      exportDate: new Date().toISOString(),
      userReport: report,
      allAnalyses: this.analyses,
      metadata: {
        totalAnalyses: this.analyses.length,
        exportVersion: '3.0.0'
      }
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `crypto-consultor-historico-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    URL.revokeObjectURL(url);
    
    // Track export
    if (window.cryptoFeatures?.analytics) {
      window.cryptoFeatures.analytics.trackEvent('history_exported', {
        totalAnalyses: this.analyses.length,
        timespan: report.summary?.timespan?.daysBetween || 0
      });
    }
    
    console.log('📊 History exported');
  }
  
  /**
   * Generate unique analysis ID
   * @returns {string} Unique ID
   */
  generateAnalysisId() {
    return 'analysis_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  }
  
  /**
   * Load analyses from storage
   * @returns {Array} Stored analyses
   */
  loadAnalyses() {
    try {
      return JSON.parse(localStorage.getItem('user-analysis-history') || '[]');
    } catch (error) {
      console.error('Error loading analysis history:', error);
      return [];
    }
  }
  
  /**
   * Save analyses to storage
   */
  saveToStorage() {
    try {
      localStorage.setItem('user-analysis-history', JSON.stringify(this.analyses));
    } catch (error) {
      console.error('Error saving analysis history:', error);
    }
  }
  
  /**
   * Clear all history
   */
  clearHistory() {
    this.analyses = [];
    this.saveToStorage();
    console.log('🗑️ Analysis history cleared');
  }
  
  /**
   * Get history statistics
   * @returns {Object} Statistics
   */
  getStats() {
    return {
      total: this.analyses.length,
      profileDistribution: this.getProfileEvolution().profileDistribution,
      consistency: this.getProfileEvolution().consistency,
      timespan: this.analyses.length > 0 ? {
        first: this.analyses[this.analyses.length - 1].date,
        latest: this.analyses[0].date
      } : null
    };
  }
}

// Auto-initialize history manager
if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    window.userHistoryManager = new UserHistoryManager();
  });
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = UserHistoryManager;
} else if (typeof window !== 'undefined') {
  window.UserHistoryManager = UserHistoryManager;
}