// A/B Testing Framework for Portfolio Allocation and UI Variants
// Advanced experimentation platform with statistical analysis

class ABTesting {
  constructor(analytics) {
    this.analytics = analytics;
    this.experiments = new Map();
    this.userAssignments = new Map();
    this.results = new Map();
    this.storageKey = 'crypto-consultor-ab-tests';
    
    this.loadExperiments();
    this.loadUserAssignments();
    
    console.log('🧪 A/B Testing framework initialized');
  }
  
  /**
   * Create a new experiment
   * @param {string} experimentId - Unique experiment identifier
   * @param {Object} config - Experiment configuration
   */
  createExperiment(experimentId, config) {
    const experiment = {
      id: experimentId,
      name: config.name || experimentId,
      description: config.description || '',
      variants: config.variants || ['A', 'B'],
      traffic: config.traffic || 1.0, // Percentage of users to include
      weights: config.weights || null, // Custom variant weights
      startDate: config.startDate || Date.now(),
      endDate: config.endDate || null,
      isActive: config.isActive !== false,
      goals: config.goals || [], // Conversion goals to track
      metadata: config.metadata || {},
      createdAt: Date.now()
    };
    
    // Validate experiment
    if (!this.validateExperiment(experiment)) {
      throw new Error(`Invalid experiment configuration: ${experimentId}`);
    }
    
    this.experiments.set(experimentId, experiment);
    this.saveExperiments();
    
    console.log('🧪 Experiment created:', experimentId, experiment);
    return experiment;
  }
  
  /**
   * Get variant assignment for a user
   * @param {string} experimentId - Experiment identifier
   * @param {string} userId - User identifier (optional, uses current user)
   * @returns {string|null} Assigned variant or null if not in experiment
   */
  getVariant(experimentId, userId = null) {
    const experiment = this.experiments.get(experimentId);
    if (!experiment) {
      console.warn(`🧪 Experiment not found: ${experimentId}`);
      return null;
    }
    
    // Check if experiment is active and within date range
    if (!this.isExperimentActive(experiment)) {
      return null;
    }
    
    const user = userId || this.getUserId();
    const assignmentKey = `${experimentId}_${user}`;
    
    // Return existing assignment if available
    if (this.userAssignments.has(assignmentKey)) {
      const assignment = this.userAssignments.get(assignmentKey);
      console.log(`🧪 Existing assignment for ${experimentId}: ${assignment.variant}`);
      return assignment.variant;
    }
    
    // Check if user should be included in experiment
    if (!this.shouldIncludeUser(experiment, user)) {
      return null;
    }
    
    // Assign variant
    const variant = this.assignVariant(experiment, user);
    const assignment = {
      experimentId: experimentId,
      userId: user,
      variant: variant,
      assignedAt: Date.now(),
      metadata: {}
    };
    
    this.userAssignments.set(assignmentKey, assignment);
    this.saveUserAssignments();
    
    // Track assignment
    if (this.analytics) {
      this.analytics.trackABTest(experimentId, variant, {
        assignedAt: assignment.assignedAt,
        isNewAssignment: true
      });
    }
    
    console.log(`🧪 New assignment for ${experimentId}: ${variant}`);
    return variant;
  }
  
  /**
   * Track conversion for an experiment
   * @param {string} experimentId - Experiment identifier
   * @param {string} goal - Conversion goal
   * @param {Object} data - Additional conversion data
   */
  trackConversion(experimentId, goal, data = {}) {
    const user = this.getUserId();
    const assignmentKey = `${experimentId}_${user}`;
    const assignment = this.userAssignments.get(assignmentKey);
    
    if (!assignment) {
      console.warn(`🧪 No assignment found for conversion tracking: ${experimentId}`);
      return;
    }
    
    const conversionKey = `${experimentId}_${assignment.variant}_${goal}`;
    
    // Update results
    if (!this.results.has(conversionKey)) {
      this.results.set(conversionKey, {
        experimentId: experimentId,
        variant: assignment.variant,
        goal: goal,
        conversions: 0,
        value: 0,
        lastConversion: null
      });
    }
    
    const result = this.results.get(conversionKey);
    result.conversions++;
    result.value += data.value || 1;
    result.lastConversion = Date.now();
    
    this.saveResults();
    
    // Track in analytics
    if (this.analytics) {
      this.analytics.trackConversion(`ab_${experimentId}_${goal}`, {
        experiment: experimentId,
        variant: assignment.variant,
        goal: goal,
        value: data.value || 1,
        ...data
      });
    }
    
    console.log(`🎯 Conversion tracked: ${experimentId} / ${assignment.variant} / ${goal}`);
  }
  
  /**
   * Get portfolio allocation with A/B testing
   * @param {string} baseProfile - Base profile type
   * @param {string} objective - Investment objective
   * @param {string} risk - Risk tolerance
   * @returns {Object} Portfolio allocation
   */
  getPortfolioAllocation(baseProfile, objective, risk) {
    const variant = this.getVariant('portfolio_allocation_v1');
    
    // Base allocations
    const baseAllocations = {
      conservador: { BTC: 70, ETH: 13, XRP: 7, PENDLE: 5, BNB: 3, SOL: 2 },
      moderado: { BTC: 50, ETH: 20, BNB: 10, SOL: 8, XRP: 7, PENDLE: 5 },
      arrojado: { ETH: 35, SPX6900: 20, BNB: 15, SOL: 15, XRP: 8, PENDLE: 7 }
    };
    
    let allocation = { ...baseAllocations[baseProfile] } || baseAllocations.moderado;
    
    // Apply variant modifications
    switch (variant) {
      case 'conservative':
        allocation = this.makeMoreConservative(allocation);
        break;
      case 'aggressive':
        allocation = this.makeMoreAggressive(allocation);
        break;
      case 'diversified':
        allocation = this.makeMoreDiversified(allocation);
        break;
      case 'control':
      default:
        // Use base allocation
        break;
    }
    
    // Track the allocation variant used
    if (this.analytics) {
      this.analytics.trackEvent('portfolio_allocation_variant', {
        experiment: 'portfolio_allocation_v1',
        variant: variant || 'control',
        baseProfile: baseProfile,
        objective: objective,
        risk: risk,
        allocation: allocation
      });
    }
    
    return allocation;
  }
  
  /**
   * Get UI variant for interface elements
   * @param {string} elementType - Type of UI element
   * @returns {string} Variant identifier
   */
  getUIVariant(elementType) {
    const experimentMap = {
      'cta_button': 'cta_button_v1',
      'result_layout': 'result_layout_v1',
      'color_scheme': 'color_scheme_v1',
      'form_flow': 'form_flow_v1'
    };
    
    const experimentId = experimentMap[elementType];
    if (!experimentId) {
      return 'default';
    }
    
    return this.getVariant(experimentId) || 'default';
  }
  
  /**
   * Make allocation more conservative
   * @param {Object} allocation - Base allocation
   * @returns {Object} Modified allocation
   */
  makeMoreConservative(allocation) {
    const modified = { ...allocation };
    
    // Increase BTC if present, reduce altcoins
    if (modified.BTC) {
      const increase = 10;
      modified.BTC += increase;
      
      // Reduce other assets proportionally
      const otherAssets = Object.keys(modified).filter(asset => asset !== 'BTC');
      const reductionPer = increase / otherAssets.length;
      
      otherAssets.forEach(asset => {
        modified[asset] = Math.max(0, modified[asset] - reductionPer);
      });
    }
    
    return this.normalizeAllocation(modified);
  }
  
  /**
   * Make allocation more aggressive
   * @param {Object} allocation - Base allocation
   * @returns {Object} Modified allocation
   */
  makeMoreAggressive(allocation) {
    const modified = { ...allocation };
    
    // Increase altcoins, reduce stable assets
    if (modified.BTC) {
      const reduction = 10;
      modified.BTC = Math.max(0, modified.BTC - reduction);
      
      // Distribute to altcoins
      const altcoins = ['ETH', 'SOL', 'BNB'].filter(coin => coin in modified);
      const increasePer = reduction / altcoins.length;
      
      altcoins.forEach(coin => {
        modified[coin] += increasePer;
      });
    }
    
    return this.normalizeAllocation(modified);
  }
  
  /**
   * Make allocation more diversified
   * @param {Object} allocation - Base allocation
   * @returns {Object} Modified allocation
   */
  makeMoreDiversified(allocation) {
    const modified = { ...allocation };
    const assets = Object.keys(modified);
    const targetPercentage = 100 / assets.length;
    
    // Move towards equal distribution
    Object.keys(modified).forEach(asset => {
      const current = modified[asset];
      const target = targetPercentage;
      modified[asset] = (current + target) / 2; // Average current and target
    });
    
    return this.normalizeAllocation(modified);
  }
  
  /**
   * Normalize allocation to sum to 100%
   * @param {Object} allocation - Allocation to normalize
   * @returns {Object} Normalized allocation
   */
  normalizeAllocation(allocation) {
    const total = Object.values(allocation).reduce((sum, val) => sum + val, 0);
    if (total === 0) return allocation;
    
    const normalized = {};
    Object.keys(allocation).forEach(asset => {
      normalized[asset] = Math.round((allocation[asset] / total) * 100 * 10) / 10;
    });
    
    return normalized;
  }
  
  /**
   * Check if experiment is currently active
   * @param {Object} experiment - Experiment configuration
   * @returns {boolean} Is active
   */
  isExperimentActive(experiment) {
    const now = Date.now();
    
    if (!experiment.isActive) {
      return false;
    }
    
    if (experiment.startDate && now < experiment.startDate) {
      return false;
    }
    
    if (experiment.endDate && now > experiment.endDate) {
      return false;
    }
    
    return true;
  }
  
  /**
   * Determine if user should be included in experiment
   * @param {Object} experiment - Experiment configuration
   * @param {string} userId - User identifier
   * @returns {boolean} Should include
   */
  shouldIncludeUser(experiment, userId) {
    // Check traffic percentage
    const userHash = this.hashCode(userId + experiment.id);
    const bucket = Math.abs(userHash) % 100;
    
    return bucket < (experiment.traffic * 100);
  }
  
  /**
   * Assign variant to user
   * @param {Object} experiment - Experiment configuration
   * @param {string} userId - User identifier
   * @returns {string} Assigned variant
   */
  assignVariant(experiment, userId) {
    const hash = this.hashCode(userId + experiment.id + 'variant');
    
    // Use custom weights if provided
    if (experiment.weights) {
      return this.weightedVariantSelection(experiment.variants, experiment.weights, hash);
    }
    
    // Equal distribution
    const variantIndex = Math.abs(hash) % experiment.variants.length;
    return experiment.variants[variantIndex];
  }
  
  /**
   * Select variant using weighted distribution
   * @param {Array} variants - Available variants
   * @param {Array} weights - Weights for each variant
   * @param {number} hash - User hash for deterministic selection
   * @returns {string} Selected variant
   */
  weightedVariantSelection(variants, weights, hash) {
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
    const normalizedHash = Math.abs(hash) % totalWeight;
    
    let currentWeight = 0;
    for (let i = 0; i < variants.length; i++) {
      currentWeight += weights[i];
      if (normalizedHash < currentWeight) {
        return variants[i];
      }
    }
    
    return variants[0]; // Fallback
  }
  
  /**
   * Validate experiment configuration
   * @param {Object} experiment - Experiment to validate
   * @returns {boolean} Is valid
   */
  validateExperiment(experiment) {
    if (!experiment.id || !experiment.variants || experiment.variants.length < 2) {
      return false;
    }
    
    if (experiment.traffic < 0 || experiment.traffic > 1) {
      return false;
    }
    
    if (experiment.weights && experiment.weights.length !== experiment.variants.length) {
      return false;
    }
    
    return true;
  }
  
  /**
   * Get experiment results and statistics
   * @param {string} experimentId - Experiment identifier
   * @returns {Object} Experiment results
   */
  getExperimentResults(experimentId) {
    const experiment = this.experiments.get(experimentId);
    if (!experiment) {
      return null;
    }
    
    const results = {};
    const assignments = this.getExperimentAssignments(experimentId);
    
    // Calculate basic metrics for each variant
    experiment.variants.forEach(variant => {
      const variantAssignments = assignments.filter(a => a.variant === variant);
      const variantResults = Array.from(this.results.values())
        .filter(r => r.experimentId === experimentId && r.variant === variant);
      
      results[variant] = {
        assignments: variantAssignments.length,
        conversions: variantResults.reduce((sum, r) => sum + r.conversions, 0),
        conversionRate: variantAssignments.length > 0 ? 
          (variantResults.reduce((sum, r) => sum + r.conversions, 0) / variantAssignments.length) * 100 : 0,
        totalValue: variantResults.reduce((sum, r) => sum + r.value, 0)
      };
    });
    
    return {
      experiment: experiment,
      results: results,
      totalAssignments: assignments.length,
      isSignificant: this.calculateSignificance(results),
      confidence: this.calculateConfidence(results)
    };
  }
  
  /**
   * Calculate statistical significance (simplified)
   * @param {Object} results - Variant results
   * @returns {boolean} Is statistically significant
   */
  calculateSignificance(results) {
    const variants = Object.keys(results);
    if (variants.length < 2) return false;
    
    const [variantA, variantB] = variants;
    const a = results[variantA];
    const b = results[variantB];
    
    // Need sufficient sample size
    if (a.assignments < 30 || b.assignments < 30) {
      return false;
    }
    
    // Simplified z-test for conversion rates
    const pA = a.conversions / a.assignments;
    const pB = b.conversions / b.assignments;
    const pPool = (a.conversions + b.conversions) / (a.assignments + b.assignments);
    
    const se = Math.sqrt(pPool * (1 - pPool) * (1/a.assignments + 1/b.assignments));
    const z = Math.abs(pA - pB) / se;
    
    // z > 1.96 for 95% confidence
    return z > 1.96;
  }
  
  /**
   * Calculate confidence level (simplified)
   * @param {Object} results - Variant results
   * @returns {number} Confidence percentage
   */
  calculateConfidence(results) {
    const variants = Object.keys(results);
    if (variants.length < 2) return 0;
    
    const [variantA, variantB] = variants;
    const a = results[variantA];
    const b = results[variantB];
    
    if (a.assignments < 10 || b.assignments < 10) {
      return 0;
    }
    
    // Simplified confidence calculation
    const diff = Math.abs(a.conversionRate - b.conversionRate);
    const avgSample = (a.assignments + b.assignments) / 2;
    
    return Math.min(95, diff * Math.sqrt(avgSample) * 2);
  }
  
  /**
   * Get all assignments for an experiment
   * @param {string} experimentId - Experiment identifier
   * @returns {Array} Assignment records
   */
  getExperimentAssignments(experimentId) {
    return Array.from(this.userAssignments.values())
      .filter(assignment => assignment.experimentId === experimentId);
  }
  
  /**
   * Hash function for deterministic user bucketing
   * @param {string} str - String to hash
   * @returns {number} Hash value
   */
  hashCode(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
  }
  
  /**
   * Get current user ID
   * @returns {string} User identifier
   */
  getUserId() {
    return this.analytics?.userId || localStorage.getItem('crypto-consultor-user-id') || 'anonymous';
  }
  
  /**
   * Initialize default experiments
   */
  initializeDefaultExperiments() {
    // Portfolio allocation experiment
    this.createExperiment('portfolio_allocation_v1', {
      name: 'Portfolio Allocation Strategy',
      description: 'Test different portfolio allocation strategies',
      variants: ['control', 'conservative', 'aggressive', 'diversified'],
      traffic: 1.0,
      weights: [0.25, 0.25, 0.25, 0.25],
      goals: ['portfolio_created', 'portfolio_shared']
    });
    
    // UI experiments
    this.createExperiment('cta_button_v1', {
      name: 'CTA Button Text',
      description: 'Test different call-to-action button texts',
      variants: ['Descobrir Perfil', 'Calcular Carteira', 'Começar Análise'],
      traffic: 1.0,
      goals: ['questionnaire_started']
    });
    
    this.createExperiment('result_layout_v1', {
      name: 'Results Layout',
      description: 'Test different result presentation layouts',
      variants: ['cards', 'tabs', 'accordion'],
      traffic: 0.8,
      goals: ['results_viewed', 'portfolio_shared']
    });
  }
  
  /**
   * Storage methods
   */
  saveExperiments() {
    const data = Array.from(this.experiments.values());
    localStorage.setItem(`${this.storageKey}-experiments`, JSON.stringify(data));
  }
  
  loadExperiments() {
    try {
      const stored = localStorage.getItem(`${this.storageKey}-experiments`);
      if (stored) {
        const data = JSON.parse(stored);
        data.forEach(exp => this.experiments.set(exp.id, exp));
      } else {
        this.initializeDefaultExperiments();
      }
    } catch (error) {
      console.error('❌ Error loading experiments:', error);
      this.initializeDefaultExperiments();
    }
  }
  
  saveUserAssignments() {
    const data = Array.from(this.userAssignments.values());
    localStorage.setItem(`${this.storageKey}-assignments`, JSON.stringify(data));
  }
  
  loadUserAssignments() {
    try {
      const stored = localStorage.getItem(`${this.storageKey}-assignments`);
      if (stored) {
        const data = JSON.parse(stored);
        data.forEach(assignment => {
          const key = `${assignment.experimentId}_${assignment.userId}`;
          this.userAssignments.set(key, assignment);
        });
      }
    } catch (error) {
      console.error('❌ Error loading user assignments:', error);
    }
  }
  
  saveResults() {
    const data = Array.from(this.results.values());
    localStorage.setItem(`${this.storageKey}-results`, JSON.stringify(data));
  }
  
  loadResults() {
    try {
      const stored = localStorage.getItem(`${this.storageKey}-results`);
      if (stored) {
        const data = JSON.parse(stored);
        data.forEach(result => {
          const key = `${result.experimentId}_${result.variant}_${result.goal}`;
          this.results.set(key, result);
        });
      }
    } catch (error) {
      console.error('❌ Error loading results:', error);
    }
  }
  
  /**
   * Export all A/B testing data
   * @returns {Object} Complete A/B testing data
   */
  exportData() {
    return {
      experiments: Array.from(this.experiments.values()),
      assignments: Array.from(this.userAssignments.values()),
      results: Array.from(this.results.values()),
      timestamp: Date.now()
    };
  }
  
  /**
   * Clear all A/B testing data
   */
  clearAll() {
    this.experiments.clear();
    this.userAssignments.clear();
    this.results.clear();
    
    localStorage.removeItem(`${this.storageKey}-experiments`);
    localStorage.removeItem(`${this.storageKey}-assignments`);
    localStorage.removeItem(`${this.storageKey}-results`);
    
    console.log('🗑️ All A/B testing data cleared');
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ABTesting;
} else {
  window.ABTesting = ABTesting;
}