// Scenario Comparator for Portfolio Analysis
// Advanced system for comparing different portfolio scenarios and market conditions

class ScenarioComparator {
  constructor() {
    this.calculator = null;
    this.priceAPI = null;
    this.scenarios = [];
    this.currentComparison = null;
    
    this.initializeComparator();
  }
  
  /**
   * Initialize the scenario comparator
   */
  async initializeComparator() {
    // Wait for dependencies
    await this.waitForDependencies();
    
    // Setup event listeners
    this.setupEventListeners();
    
    console.log('📊 Scenario Comparator initialized');
  }
  
  /**
   * Wait for required dependencies
   */
  async waitForDependencies() {
    let attempts = 0;
    const maxAttempts = 10;
    
    while (attempts < maxAttempts) {
      if (window.cryptoFeatures?.portfolioCalculator && window.cryptoFeatures?.priceAPI) {
        this.calculator = window.cryptoFeatures.portfolioCalculator;
        this.priceAPI = window.cryptoFeatures.priceAPI;
        return;
      }
      
      await new Promise(resolve => setTimeout(resolve, 500));
      attempts++;
    }
    
    console.warn('⚠️ Scenario comparator dependencies not fully available');
  }
  
  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Listen for scenario comparison requests
    document.addEventListener('compareScenarios', (event) => {
      this.handleComparisonRequest(event.detail);
    });
    
    // Listen for profile calculations to auto-generate scenarios
    document.addEventListener('profileCalculated', (event) => {
      this.autoGenerateScenarios(event.detail);
    });
  }
  
  /**
   * Generate comprehensive scenarios for a user profile
   * @param {string} baseProfile - User's calculated profile
   * @param {Object} userData - User form data
   * @returns {Promise<Array>} Generated scenarios
   */
  async generateScenarios(baseProfile, userData) {
    this.scenarios = [];
    
    try {
      console.log('🎬 Generating scenarios for profile:', baseProfile);
      
      // 1. Current scenario (user's calculated profile)
      const currentScenario = await this.createScenario('current', baseProfile, userData, {
        title: `Seu Perfil: ${this.capitalizeProfile(baseProfile)}`,
        description: 'Baseado nas suas respostas no questionário',
        isRecommended: true
      });
      this.scenarios.push(currentScenario);
      
      // 2. Alternative profile scenarios
      const allProfiles = ['conservador', 'moderado', 'arrojado'];
      for (const profile of allProfiles) {
        if (profile !== baseProfile) {
          const scenario = await this.createScenario('alternative', profile, userData, {
            title: `Alternativa: ${this.capitalizeProfile(profile)}`,
            description: `Como seria com perfil ${profile}`,
            isRecommended: false
          });
          this.scenarios.push(scenario);
        }
      }
      
      // 3. Market condition scenarios (only if user has investment amount)
      const investmentAmount = this.parseAmount(userData.amount);
      if (investmentAmount > 0) {
        const bearScenario = await this.createMarketScenario('bear', baseProfile, userData, {
          title: 'Cenário Mercado Baixista',
          description: 'Portfolio ajustado para proteção em bear market',
          marketCondition: 'bear'
        });
        
        const bullScenario = await this.createMarketScenario('bull', baseProfile, userData, {
          title: 'Cenário Mercado Altista',
          description: 'Portfolio otimizado para bull market',
          marketCondition: 'bull'
        });
        
        this.scenarios.push(bearScenario, bullScenario);
      }
      
      // 4. Custom optimization scenarios
      const highGrowthScenario = await this.createOptimizationScenario('high_growth', baseProfile, userData, {
        title: 'Foco Alto Crescimento',
        description: 'Maximiza potencial de ganhos (maior risco)',
        optimization: 'growth'
      });
      
      const lowVolatilityScenario = await this.createOptimizationScenario('low_volatility', baseProfile, userData, {
        title: 'Baixa Volatilidade',
        description: 'Minimiza flutuações de preço',
        optimization: 'stability'
      });
      
      this.scenarios.push(highGrowthScenario, lowVolatilityScenario);
      
      console.log('✅ Generated', this.scenarios.length, 'scenarios');
      return this.scenarios;
      
    } catch (error) {
      console.error('❌ Error generating scenarios:', error);
      return [];
    }
  }
  
  /**
   * Create a standard profile scenario
   * @param {string} type - Scenario type
   * @param {string} profile - Profile type
   * @param {Object} userData - User data
   * @param {Object} metadata - Additional metadata
   * @returns {Promise<Object>} Scenario object
   */
  async createScenario(type, profile, userData, metadata = {}) {
    const allocation = this.getProfileAllocation(profile);
    const investmentAmount = this.parseAmount(userData.amount);
    
    let portfolioData = null;
    if (this.calculator && investmentAmount > 0) {
      portfolioData = await this.calculator.calculatePortfolioValue(allocation, investmentAmount);
    }
    
    return {
      id: `scenario_${type}_${profile}_${Date.now()}`,
      type: type,
      profile: profile,
      allocation: allocation,
      portfolioData: portfolioData,
      investmentAmount: investmentAmount,
      expectedReturns: this.calculateExpectedReturns(profile),
      riskMetrics: this.calculateRiskMetrics(profile, allocation),
      timeHorizon: this.getTimeHorizon(profile),
      pros: this.getScenarioPros(profile),
      cons: this.getScenarioCons(profile),
      score: this.calculateScenarioScore(profile, userData),
      metadata: {
        createdAt: Date.now(),
        ...metadata
      }
    };
  }
  
  /**
   * Create market condition adjusted scenario
   * @param {string} marketCondition - 'bull' or 'bear'
   * @param {string} baseProfile - Base profile
   * @param {Object} userData - User data
   * @param {Object} metadata - Additional metadata
   * @returns {Promise<Object>} Market scenario
   */
  async createMarketScenario(marketCondition, baseProfile, userData, metadata = {}) {
    const baseAllocation = this.getProfileAllocation(baseProfile);
    const adjustedAllocation = this.adjustForMarketCondition(baseAllocation, marketCondition);
    const investmentAmount = this.parseAmount(userData.amount);
    
    let portfolioData = null;
    if (this.calculator && investmentAmount > 0) {
      portfolioData = await this.calculator.calculatePortfolioValue(adjustedAllocation, investmentAmount);
    }
    
    return {
      id: `scenario_${marketCondition}_${baseProfile}_${Date.now()}`,
      type: 'market_condition',
      profile: baseProfile,
      marketCondition: marketCondition,
      allocation: adjustedAllocation,
      portfolioData: portfolioData,
      investmentAmount: investmentAmount,
      expectedReturns: this.calculateMarketAdjustedReturns(baseProfile, marketCondition),
      riskMetrics: this.calculateRiskMetrics(baseProfile, adjustedAllocation),
      timeHorizon: this.getTimeHorizon(baseProfile),
      pros: this.getMarketScenarioPros(marketCondition),
      cons: this.getMarketScenarioCons(marketCondition),
      score: this.calculateMarketScenarioScore(baseProfile, marketCondition, userData),
      metadata: {
        createdAt: Date.now(),
        ...metadata
      }
    };
  }
  
  /**
   * Create optimization-focused scenario
   * @param {string} optimization - Optimization type
   * @param {string} baseProfile - Base profile
   * @param {Object} userData - User data
   * @param {Object} metadata - Additional metadata
   * @returns {Promise<Object>} Optimization scenario
   */
  async createOptimizationScenario(optimization, baseProfile, userData, metadata = {}) {
    const baseAllocation = this.getProfileAllocation(baseProfile);
    const optimizedAllocation = this.optimizeAllocation(baseAllocation, optimization);
    const investmentAmount = this.parseAmount(userData.amount);
    
    let portfolioData = null;
    if (this.calculator && investmentAmount > 0) {
      portfolioData = await this.calculator.calculatePortfolioValue(optimizedAllocation, investmentAmount);
    }
    
    return {
      id: `scenario_${optimization}_${baseProfile}_${Date.now()}`,
      type: 'optimization',
      profile: baseProfile,
      optimization: optimization,
      allocation: optimizedAllocation,
      portfolioData: portfolioData,
      investmentAmount: investmentAmount,
      expectedReturns: this.calculateOptimizedReturns(baseProfile, optimization),
      riskMetrics: this.calculateRiskMetrics(baseProfile, optimizedAllocation),
      timeHorizon: this.getTimeHorizon(baseProfile),
      pros: this.getOptimizationPros(optimization),
      cons: this.getOptimizationCons(optimization),
      score: this.calculateOptimizationScore(baseProfile, optimization, userData),
      metadata: {
        createdAt: Date.now(),
        ...metadata
      }
    };
  }
  
  /**
   * Adjust allocation for market conditions
   * @param {Object} baseAllocation - Base allocation
   * @param {string} condition - Market condition
   * @returns {Object} Adjusted allocation
   */
  adjustForMarketCondition(baseAllocation, condition) {
    const adjusted = { ...baseAllocation };
    
    if (condition === 'bear') {
      // Bear market: Increase BTC allocation, reduce altcoins
      if (adjusted.BTC) {
        const btcIncrease = 15;
        adjusted.BTC += btcIncrease;
        
        // Distribute reduction across altcoins
        const altcoins = Object.keys(adjusted).filter(crypto => crypto !== 'BTC');
        const reductionPer = btcIncrease / altcoins.length;
        
        altcoins.forEach(crypto => {
          adjusted[crypto] = Math.max(0, adjusted[crypto] - reductionPer);
        });
      } else {
        // If no BTC, add it and reduce others
        adjusted.BTC = 20;
        const reduction = 20 / Object.keys(adjusted).length;
        Object.keys(adjusted).forEach(crypto => {
          if (crypto !== 'BTC') {
            adjusted[crypto] = Math.max(0, adjusted[crypto] - reduction);
          }
        });
      }
    } else if (condition === 'bull') {
      // Bull market: Increase altcoin allocation, especially ETH and smaller caps
      if (adjusted.ETH) {
        adjusted.ETH += 8;
      }
      if (adjusted.SOL) {
        adjusted.SOL += 5;
      }
      if (adjusted.PENDLE) {
        adjusted.PENDLE += 3;
      }
      
      // Reduce BTC if present
      if (adjusted.BTC) {
        adjusted.BTC = Math.max(0, adjusted.BTC - 16);
      }
    }
    
    return this.normalizeAllocation(adjusted);
  }
  
  /**
   * Optimize allocation based on strategy
   * @param {Object} baseAllocation - Base allocation
   * @param {string} optimization - Optimization strategy
   * @returns {Object} Optimized allocation
   */
  optimizeAllocation(baseAllocation, optimization) {
    const optimized = { ...baseAllocation };
    
    if (optimization === 'growth') {
      // High growth: Focus on high-potential altcoins
      if (optimized.ETH) optimized.ETH += 10;
      if (optimized.SOL) optimized.SOL += 8;
      if (optimized.PENDLE) optimized.PENDLE += 5;
      if (optimized.SPX6900) optimized.SPX6900 += 7;
      
      // Reduce stable assets
      if (optimized.BTC) optimized.BTC = Math.max(0, optimized.BTC - 15);
      if (optimized.XRP) optimized.XRP = Math.max(0, optimized.XRP - 15);
      
    } else if (optimization === 'stability') {
      // Low volatility: Focus on established coins
      if (optimized.BTC) {
        optimized.BTC += 20;
      } else {
        optimized.BTC = 25;
      }
      
      if (optimized.ETH) optimized.ETH += 10;
      
      // Reduce volatile assets
      if (optimized.SOL) optimized.SOL = Math.max(0, optimized.SOL - 10);
      if (optimized.PENDLE) optimized.PENDLE = Math.max(0, optimized.PENDLE - 10);
      if (optimized.SPX6900) optimized.SPX6900 = 0; // Remove memecoins
      
      const reduction = 30;
      const stableAssets = ['BTC', 'ETH'];
      const volatileAssets = Object.keys(optimized).filter(crypto => !stableAssets.includes(crypto));
      const reductionPer = reduction / volatileAssets.length;
      
      volatileAssets.forEach(crypto => {
        optimized[crypto] = Math.max(0, optimized[crypto] - reductionPer);
      });
    }
    
    return this.normalizeAllocation(optimized);
  }
  
  /**
   * Calculate expected returns for profile
   * @param {string} profile - Profile type
   * @returns {Object} Expected returns
   */
  calculateExpectedReturns(profile) {
    const returns = {
      conservador: { 
        min: 8, max: 25, average: 15,
        quarterly: 3, yearly: 15,
        description: 'Retornos estáveis e previsíveis'
      },
      moderado: { 
        min: 15, max: 45, average: 28,
        quarterly: 7, yearly: 28,
        description: 'Bom equilíbrio risco-retorno'
      },
      arrojado: { 
        min: 25, max: 80, average: 45,
        quarterly: 12, yearly: 45,
        description: 'Alto potencial com volatilidade'
      }
    };
    
    return returns[profile] || returns.moderado;
  }
  
  /**
   * Calculate market-adjusted returns
   * @param {string} profile - Profile type
   * @param {string} marketCondition - Market condition
   * @returns {Object} Adjusted returns
   */
  calculateMarketAdjustedReturns(profile, marketCondition) {
    const baseReturns = this.calculateExpectedReturns(profile);
    
    if (marketCondition === 'bear') {
      return {
        min: Math.max(0, baseReturns.min - 15),
        max: Math.max(0, baseReturns.max - 30),
        average: Math.max(0, baseReturns.average - 20),
        quarterly: Math.max(0, baseReturns.quarterly - 5),
        yearly: Math.max(0, baseReturns.yearly - 20),
        description: 'Proteção em mercado baixista'
      };
    } else if (marketCondition === 'bull') {
      return {
        min: baseReturns.min + 20,
        max: baseReturns.max + 50,
        average: baseReturns.average + 35,
        quarterly: baseReturns.quarterly + 8,
        yearly: baseReturns.yearly + 35,
        description: 'Otimizado para mercado altista'
      };
    }
    
    return baseReturns;
  }
  
  /**
   * Calculate optimization-based returns
   * @param {string} profile - Profile type
   * @param {string} optimization - Optimization strategy
   * @returns {Object} Optimized returns
   */
  calculateOptimizedReturns(profile, optimization) {
    const baseReturns = this.calculateExpectedReturns(profile);
    
    if (optimization === 'growth') {
      return {
        min: baseReturns.min + 10,
        max: baseReturns.max + 40,
        average: baseReturns.average + 25,
        quarterly: baseReturns.quarterly + 6,
        yearly: baseReturns.yearly + 25,
        description: 'Maximiza potencial de crescimento'
      };
    } else if (optimization === 'stability') {
      return {
        min: Math.max(baseReturns.min - 5, 5),
        max: baseReturns.max - 15,
        average: baseReturns.average - 8,
        quarterly: Math.max(baseReturns.quarterly - 2, 2),
        yearly: baseReturns.yearly - 8,
        description: 'Prioriza estabilidade'
      };
    }
    
    return baseReturns;
  }
  
  /**
   * Calculate risk metrics
   * @param {string} profile - Profile type
   * @param {Object} allocation - Portfolio allocation
   * @returns {Object} Risk metrics
   */
  calculateRiskMetrics(profile, allocation) {
    const riskLevels = {
      conservador: { volatility: 'Baixa', maxDrawdown: '15-25%', riskScore: 3 },
      moderado: { volatility: 'Média', maxDrawdown: '25-40%', riskScore: 6 },
      arrojado: { volatility: 'Alta', maxDrawdown: '40-60%', riskScore: 9 }
    };
    
    const baseRisk = riskLevels[profile] || riskLevels.moderado;
    let adjustedScore = baseRisk.riskScore;
    
    // Adjust based on allocation
    if (allocation.SPX6900 && allocation.SPX6900 > 15) {
      adjustedScore += 2; // Memecoins significantly increase risk
    }
    
    if (allocation.BTC && allocation.BTC > 60) {
      adjustedScore -= 1; // High BTC allocation reduces risk
    }
    
    if (allocation.PENDLE && allocation.PENDLE > 10) {
      adjustedScore += 1; // DeFi tokens add risk
    }
    
    // Calculate diversification score
    const assetsCount = Object.keys(allocation).filter(crypto => allocation[crypto] > 0).length;
    const diversificationScore = Math.min(10, assetsCount * 2);
    
    return {
      ...baseRisk,
      riskScore: Math.min(10, Math.max(1, adjustedScore)),
      diversificationScore,
      assetsCount,
      concentrationRisk: Math.max(...Object.values(allocation)) > 50 ? 'Alto' : 'Médio'
    };
  }
  
  /**
   * Calculate scenario score
   * @param {string} profile - Profile type
   * @param {Object} userData - User data
   * @returns {number} Score (0-100)
   */
  calculateScenarioScore(profile, userData) {
    let score = 70; // Base score
    
    // Alignment with user's stated risk tolerance
    if (userData.risk === 'baixo' && profile === 'conservador') score += 15;
    else if (userData.risk === 'medio' && profile === 'moderado') score += 15;
    else if (userData.risk === 'alto' && profile === 'arrojado') score += 15;
    else score -= 10;
    
    // Alignment with objective
    if (userData.objective === 'longo' && profile === 'conservador') score += 10;
    else if (userData.objective === 'moderado' && profile === 'moderado') score += 10;
    else if (userData.objective === 'curtissimo' && profile === 'arrojado') score += 10;
    
    // Experience factor
    if (userData.experience === 'iniciante' && profile === 'conservador') score += 5;
    else if (userData.experience === 'avancado' && profile === 'arrojado') score += 5;
    
    return Math.min(100, Math.max(0, score));
  }
  
  /**
   * Calculate market scenario score
   * @param {string} profile - Profile type
   * @param {string} marketCondition - Market condition
   * @param {Object} userData - User data
   * @returns {number} Score
   */
  calculateMarketScenarioScore(profile, marketCondition, userData) {
    const baseScore = this.calculateScenarioScore(profile, userData);
    
    // Market scenarios are alternative strategies
    return Math.max(0, baseScore - 10);
  }
  
  /**
   * Calculate optimization scenario score
   * @param {string} profile - Profile type
   * @param {string} optimization - Optimization type
   * @param {Object} userData - User data
   * @returns {number} Score
   */
  calculateOptimizationScore(profile, optimization, userData) {
    const baseScore = this.calculateScenarioScore(profile, userData);
    
    // Optimization scenarios are specialized
    if (optimization === 'growth' && userData.objective === 'curtissimo') {
      return baseScore + 5;
    } else if (optimization === 'stability' && userData.risk === 'baixo') {
      return baseScore + 5;
    }
    
    return Math.max(0, baseScore - 5);
  }
  
  /**
   * Compare multiple scenarios
   * @param {Array} scenarioIds - Scenario IDs to compare
   * @returns {Object} Comparison results
   */
  compareScenarios(scenarioIds) {
    if (scenarioIds.length < 2) {
      throw new Error('At least 2 scenarios required for comparison');
    }
    
    const scenarios = scenarioIds.map(id => 
      this.scenarios.find(s => s.id === id)
    ).filter(Boolean);
    
    if (scenarios.length < 2) {
      throw new Error('Invalid scenario IDs provided');
    }
    
    const comparison = {
      scenarios: scenarios,
      summary: this.generateComparisonSummary(scenarios),
      metrics: this.compareMetrics(scenarios),
      recommendations: this.generateComparisonRecommendations(scenarios),
      riskAnalysis: this.compareRisks(scenarios),
      returnAnalysis: this.compareReturns(scenarios),
      allocationAnalysis: this.compareAllocations(scenarios)
    };
    
    this.currentComparison = comparison;
    return comparison;
  }
  
  /**
   * Generate comparison summary
   * @param {Array} scenarios - Scenarios to compare
   * @returns {Object} Summary
   */
  generateComparisonSummary(scenarios) {
    const highestReturn = scenarios.reduce((max, scenario) => 
      scenario.expectedReturns.average > max.expectedReturns.average ? scenario : max
    );
    
    const lowestRisk = scenarios.reduce((min, scenario) => 
      scenario.riskMetrics.riskScore < min.riskMetrics.riskScore ? scenario : min
    );
    
    const bestScore = scenarios.reduce((max, scenario) => 
      scenario.score > max.score ? scenario : max
    );
    
    return {
      totalScenarios: scenarios.length,
      highestReturn: {
        scenario: highestReturn.metadata.title,
        return: highestReturn.expectedReturns.average
      },
      lowestRisk: {
        scenario: lowestRisk.metadata.title,
        riskScore: lowestRisk.riskMetrics.riskScore
      },
      recommended: {
        scenario: bestScore.metadata.title,
        score: bestScore.score
      }
    };
  }
  
  /**
   * Compare scenario metrics
   * @param {Array} scenarios - Scenarios to compare
   * @returns {Object} Metrics comparison
   */
  compareMetrics(scenarios) {
    return scenarios.map(scenario => ({
      id: scenario.id,
      title: scenario.metadata.title,
      expectedReturn: scenario.expectedReturns.average,
      riskScore: scenario.riskMetrics.riskScore,
      diversification: scenario.riskMetrics.diversificationScore,
      score: scenario.score,
      timeHorizon: scenario.timeHorizon
    }));
  }
  
  /**
   * Generate comparison recommendations
   * @param {Array} scenarios - Scenarios to compare
   * @returns {Array} Recommendations
   */
  generateComparisonRecommendations(scenarios) {
    const recommendations = [];
    
    // Find best balanced scenario
    const balanced = scenarios.find(s => s.profile === 'moderado');
    if (balanced) {
      recommendations.push({
        type: 'balanced',
        scenario: balanced.metadata.title,
        reason: 'Melhor equilíbrio entre risco e retorno'
      });
    }
    
    // Find conservative option
    const conservative = scenarios.find(s => s.riskMetrics.riskScore <= 4);
    if (conservative) {
      recommendations.push({
        type: 'conservative',
        scenario: conservative.metadata.title,
        reason: 'Opção mais segura para iniciantes'
      });
    }
    
    // Find aggressive option
    const aggressive = scenarios.find(s => s.expectedReturns.average > 40);
    if (aggressive) {
      recommendations.push({
        type: 'aggressive',
        scenario: aggressive.metadata.title,
        reason: 'Maior potencial de retorno para experientes'
      });
    }
    
    return recommendations;
  }
  
  /**
   * Compare risks between scenarios
   * @param {Array} scenarios - Scenarios to compare
   * @returns {Object} Risk comparison
   */
  compareRisks(scenarios) {
    return {
      byRiskScore: scenarios.sort((a, b) => a.riskMetrics.riskScore - b.riskMetrics.riskScore),
      riskRange: {
        lowest: Math.min(...scenarios.map(s => s.riskMetrics.riskScore)),
        highest: Math.max(...scenarios.map(s => s.riskMetrics.riskScore))
      },
      diversificationComparison: scenarios.map(s => ({
        title: s.metadata.title,
        assetsCount: s.riskMetrics.assetsCount,
        diversificationScore: s.riskMetrics.diversificationScore
      }))
    };
  }
  
  /**
   * Compare returns between scenarios
   * @param {Array} scenarios - Scenarios to compare
   * @returns {Object} Return comparison
   */
  compareReturns(scenarios) {
    return {
      byExpectedReturn: scenarios.sort((a, b) => b.expectedReturns.average - a.expectedReturns.average),
      returnRange: {
        lowest: Math.min(...scenarios.map(s => s.expectedReturns.average)),
        highest: Math.max(...scenarios.map(s => s.expectedReturns.average))
      },
      yearlyProjections: scenarios.map(s => ({
        title: s.metadata.title,
        yearly: s.expectedReturns.yearly,
        range: `${s.expectedReturns.min}% - ${s.expectedReturns.max}%`
      }))
    };
  }
  
  /**
   * Compare allocations between scenarios
   * @param {Array} scenarios - Scenarios to compare
   * @returns {Object} Allocation comparison
   */
  compareAllocations(scenarios) {
    const allCryptos = new Set();
    scenarios.forEach(scenario => {
      Object.keys(scenario.allocation).forEach(crypto => allCryptos.add(crypto));
    });
    
    const allocationDifferences = {};
    
    allCryptos.forEach(crypto => {
      allocationDifferences[crypto] = scenarios.map(scenario => ({
        title: scenario.metadata.title,
        allocation: scenario.allocation[crypto] || 0
      }));
    });
    
    return {
      cryptoBreakdown: allocationDifferences,
      concentrationAnalysis: scenarios.map(scenario => {
        const allocations = Object.values(scenario.allocation);
        return {
          title: scenario.metadata.title,
          maxConcentration: Math.max(...allocations),
          top3Concentration: allocations.sort((a, b) => b - a).slice(0, 3).reduce((sum, val) => sum + val, 0)
        };
      })
    };
  }
  
  /**
   * Auto-generate scenarios when profile is calculated
   * @param {Object} profileData - Calculated profile data
   */
  async autoGenerateScenarios(profileData) {
    try {
      await this.generateScenarios(profileData.type || profileData.profile, profileData.formData || {});
      
      // Dispatch event for UI updates
      document.dispatchEvent(new CustomEvent('scenariosGenerated', {
        detail: { scenarios: this.scenarios, profileData }
      }));
      
    } catch (error) {
      console.error('Error auto-generating scenarios:', error);
    }
  }
  
  /**
   * Handle comparison request from UI
   * @param {Object} requestData - Comparison request data
   */
  async handleComparisonRequest(requestData) {
    try {
      const comparison = this.compareScenarios(requestData.scenarioIds);
      
      // Dispatch comparison result
      document.dispatchEvent(new CustomEvent('scenarioComparisonReady', {
        detail: { comparison, requestData }
      }));
      
    } catch (error) {
      console.error('Error handling comparison request:', error);
    }
  }
  
  // Helper methods
  
  getProfileAllocation(profile) {
    const allocations = {
      conservador: { BTC: 70, ETH: 13, XRP: 7, PENDLE: 5, BNB: 3, SOL: 2 },
      moderado: { BTC: 50, ETH: 20, BNB: 10, SOL: 8, XRP: 7, PENDLE: 5 },
      arrojado: { ETH: 35, SPX6900: 20, BNB: 15, SOL: 15, XRP: 8, PENDLE: 7 }
    };
    
    return allocations[profile] || allocations.moderado;
  }
  
  getTimeHorizon(profile) {
    const horizons = {
      conservador: 'Longo prazo (1+ anos)',
      moderado: 'Médio prazo (3-12 meses)',
      arrojado: 'Curto prazo (dias a semanas)'
    };
    
    return horizons[profile] || horizons.moderado;
  }
  
  getScenarioPros(profile) {
    const pros = {
      conservador: [
        'Menor volatilidade e stress',
        'Proteção contra quedas bruscas',
        'Estratégia de longo prazo comprovada',
        'Ideal para iniciantes'
      ],
      moderado: [
        'Equilíbrio entre risco e retorno',
        'Diversificação adequada',
        'Flexibilidade para ajustes',
        'Bom para médio prazo'
      ],
      arrojado: [
        'Maior potencial de retorno',
        'Aproveita oportunidades de mercado',
        'Portfolio dinâmico',
        'Ideal para traders experientes'
      ]
    };
    
    return pros[profile] || pros.moderado;
  }
  
  getScenarioCons(profile) {
    const cons = {
      conservador: [
        'Menor potencial de retorno',
        'Pode perder oportunidades',
        'Crescimento mais lento',
        'Menos empolgante'
      ],
      moderado: [
        'Não otimizado para extremos',
        'Pode ser "meio termo" demais',
        'Requer rebalanceamento',
        'Complexidade média'
      ],
      arrojado: [
        'Alta volatilidade',
        'Risco de perdas significativas',
        'Requer experiência',
        'Stress psicológico alto'
      ]
    };
    
    return cons[profile] || cons.moderado;
  }
  
  getMarketScenarioPros(condition) {
    const pros = {
      bull: [
        'Otimizado para mercados em alta',
        'Máximo aproveitamento de rallies',
        'Posicionamento agressivo inteligente',
        'Exposição a ativos de crescimento'
      ],
      bear: [
        'Proteção durante quedas',
        'Preservação de capital',
        'Posicionamento defensivo',
        'Preparado para oportunidades'
      ]
    };
    
    return pros[condition] || [];
  }
  
  getMarketScenarioCons(condition) {
    const cons = {
      bull: [
        'Vulnerável a correções',
        'Timing de mercado requerido',
        'Pode perder proteção',
        'Risco de overexposure'
      ],
      bear: [
        'Pode perder rallies',
        'Retornos limitados',
        'Timing pessimista',
        'Oportunidades perdidas'
      ]
    };
    
    return cons[condition] || [];
  }
  
  getOptimizationPros(optimization) {
    const pros = {
      growth: [
        'Maximiza potencial de crescimento',
        'Exposição a ativos emergentes',
        'Retornos acelerados',
        'Portfolio inovador'
      ],
      stability: [
        'Reduz volatilidade',
        'Proteção de capital',
        'Stress reduzido',
        'Previsibilidade maior'
      ]
    };
    
    return pros[optimization] || [];
  }
  
  getOptimizationCons(optimization) {
    const cons = {
      growth: [
        'Risco elevado',
        'Volatilidade alta',
        'Requer monitoramento',
        'Não para iniciantes'
      ],
      stability: [
        'Crescimento limitado',
        'Oportunidades perdidas',
        'Retornos menores',
        'Pode ser conservador demais'
      ]
    };
    
    return cons[optimization] || [];
  }
  
  normalizeAllocation(allocation) {
    const total = Object.values(allocation).reduce((sum, val) => sum + val, 0);
    if (total === 0) return allocation;
    
    const normalized = {};
    const assets = Object.keys(allocation);
    let runningTotal = 0;
    
    // Normalize all but last asset
    for (let i = 0; i < assets.length - 1; i++) {
      const asset = assets[i];
      normalized[asset] = Math.round((allocation[asset] / total) * 100);
      runningTotal += normalized[asset];
    }
    
    // Last asset gets remainder to ensure exactly 100%
    const lastAsset = assets[assets.length - 1];
    normalized[lastAsset] = 100 - runningTotal;
    
    return normalized;
  }
  
  parseAmount(amountString) {
    if (!amountString || amountString === 'baixo') return 1000;
    if (amountString === 'medio-baixo') return 5000;
    if (amountString === 'medio-alto') return 25000;
    if (amountString === 'alto') return 75000;
    
    const numericAmount = parseFloat(amountString);
    return !isNaN(numericAmount) ? numericAmount : 10000;
  }
  
  capitalizeProfile(profile) {
    return profile.charAt(0).toUpperCase() + profile.slice(1);
  }
  
  /**
   * Get all scenarios
   * @returns {Array} All scenarios
   */
  getAllScenarios() {
    return this.scenarios;
  }
  
  /**
   * Get scenario by ID
   * @param {string} id - Scenario ID
   * @returns {Object|null} Scenario
   */
  getScenarioById(id) {
    return this.scenarios.find(scenario => scenario.id === id);
  }
  
  /**
   * Clear all scenarios
   */
  clearScenarios() {
    this.scenarios = [];
    this.currentComparison = null;
  }
  
  /**
   * Export scenarios data
   * @returns {Object} Export data
   */
  exportData() {
    return {
      scenarios: this.scenarios,
      currentComparison: this.currentComparison,
      exportDate: new Date().toISOString()
    };
  }
}

// Auto-initialize scenario comparator
if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    window.scenarioComparator = new ScenarioComparator();
  });
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ScenarioComparator;
} else if (typeof window !== 'undefined') {
  window.ScenarioComparator = ScenarioComparator;
}