// Advanced Analytics Manager with Event Tracking
// Comprehensive user behavior and app performance analytics

class AnalyticsManager {
  constructor() {
    this.sessionId = this.generateSessionId();
    this.userId = this.getUserId();
    this.events = [];
    this.isOnline = navigator.onLine;
    this.maxEventQueueSize = 100;
    this.batchSize = 20;
    this.flushInterval = 30000; // 30 seconds
    this.autoFlushTimer = null;
    
    this.setupEventListeners();
    this.startAutoFlush();
    
    console.log('📊 Analytics Manager initialized', {
      sessionId: this.sessionId,
      userId: this.userId
    });
  }
  
  /**
   * Generate unique session ID
   * @returns {string} Session ID
   */
  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 12)}`;
  }
  
  /**
   * Get or create user ID
   * @returns {string} User ID
   */
  getUserId() {
    let userId = localStorage.getItem('crypto-consultor-user-id');
    if (!userId) {
      userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 12)}`;
      localStorage.setItem('crypto-consultor-user-id', userId);
    }
    return userId;
  }
  
  /**
   * Setup global event listeners
   */
  setupEventListeners() {
    // Network status
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.trackEvent('network_status', { status: 'online' });
      this.sendQueuedEvents();
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.trackEvent('network_status', { status: 'offline' });
    });
    
    // Page visibility
    document.addEventListener('visibilitychange', () => {
      const isVisible = !document.hidden;
      this.trackEvent('page_visibility', { 
        visible: isVisible,
        timestamp: Date.now()
      });
    });
    
    // Page unload
    window.addEventListener('beforeunload', () => {
      this.trackEvent('page_unload', { timestamp: Date.now() });
      this.flush(); // Try to send events before leaving
    });
    
    // Error tracking
    window.addEventListener('error', (event) => {
      this.trackError('javascript_error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack
      });
    });
    
    // Promise rejection tracking
    window.addEventListener('unhandledrejection', (event) => {
      this.trackError('promise_rejection', {
        reason: event.reason?.toString(),
        stack: event.reason?.stack
      });
    });
    
    // Performance tracking
    if ('performance' in window) {
      window.addEventListener('load', () => {
        setTimeout(() => {
          this.trackPerformance();
        }, 1000);
      });
    }
  }
  
  /**
   * Track a custom event
   * @param {string} eventName - Event name
   * @param {Object} eventData - Event data
   * @param {boolean} immediate - Send immediately
   */
  trackEvent(eventName, eventData = {}, immediate = false) {
    const event = {
      id: this.generateEventId(),
      name: eventName,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      userId: this.userId,
      url: window.location.href,
      pathname: window.location.pathname,
      search: window.location.search,
      referrer: document.referrer,
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      screen: {
        width: screen.width,
        height: screen.height,
        colorDepth: screen.colorDepth
      },
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      data: eventData
    };
    
    // Add to queue
    this.events.push(event);
    
    // Manage queue size
    if (this.events.length > this.maxEventQueueSize) {
      this.events = this.events.slice(-this.maxEventQueueSize);
    }
    
    // Send immediately if requested or if online and small batch
    if (immediate || (this.isOnline && this.events.length >= this.batchSize)) {
      this.flush();
    } else {
      this.saveEventsToStorage();
    }
    
    console.log('📊 Event tracked:', eventName, eventData);
  }
  
  /**
   * Track error events
   * @param {string} errorType - Type of error
   * @param {Object} errorData - Error details
   */
  trackError(errorType, errorData) {
    this.trackEvent('error', {
      type: errorType,
      ...errorData
    }, true); // Send errors immediately
  }
  
  /**
   * Track page performance metrics
   */
  trackPerformance() {
    if (!('performance' in window) || !performance.timing) {
      return;
    }
    
    const timing = performance.timing;
    const navigationStart = timing.navigationStart;
    
    const metrics = {
      domContentLoaded: timing.domContentLoadedEventEnd - navigationStart,
      loadComplete: timing.loadEventEnd - navigationStart,
      domInteractive: timing.domInteractive - navigationStart,
      firstPaint: 0,
      firstContentfulPaint: 0
    };
    
    // Get paint timings if available
    if ('getEntriesByType' in performance) {
      const paintEntries = performance.getEntriesByType('paint');
      paintEntries.forEach(entry => {
        if (entry.name === 'first-paint') {
          metrics.firstPaint = entry.startTime;
        } else if (entry.name === 'first-contentful-paint') {
          metrics.firstContentfulPaint = entry.startTime;
        }
      });
    }
    
    this.trackEvent('performance', metrics);
  }
  
  /**
   * Track user interactions with forms
   * @param {string} step - Form step
   * @param {Object} stepData - Step-specific data
   */
  trackFormStep(step, stepData = {}) {
    this.trackEvent('form_step', {
      step: step,
      ...stepData
    });
  }
  
  /**
   * Track profile calculation
   * @param {Object} profileData - Profile calculation data
   */
  trackProfileCalculation(profileData) {
    this.trackEvent('profile_calculated', {
      profile: profileData.profile,
      objective: profileData.objective,
      risk: profileData.risk,
      amount: profileData.amount,
      experience: profileData.experience,
      allocation: profileData.allocation,
      calculationTime: Date.now()
    });
  }
  
  /**
   * Track portfolio interactions
   * @param {string} action - Action performed
   * @param {Object} data - Action data
   */
  trackPortfolioAction(action, data = {}) {
    this.trackEvent('portfolio_action', {
      action: action,
      ...data
    });
  }
  
  /**
   * Track notification interactions
   * @param {string} action - Notification action
   * @param {Object} data - Notification data
   */
  trackNotification(action, data = {}) {
    this.trackEvent('notification', {
      action: action,
      ...data
    });
  }
  
  /**
   * Track A/B test assignments and results
   * @param {string} testName - Test name
   * @param {string} variant - Assigned variant
   * @param {Object} data - Additional test data
   */
  trackABTest(testName, variant, data = {}) {
    this.trackEvent('ab_test', {
      testName: testName,
      variant: variant,
      ...data
    });
  }
  
  /**
   * Track feature usage
   * @param {string} feature - Feature name
   * @param {Object} data - Usage data
   */
  trackFeatureUsage(feature, data = {}) {
    this.trackEvent('feature_usage', {
      feature: feature,
      ...data
    });
  }
  
  /**
   * Track conversion events
   * @param {string} goal - Conversion goal
   * @param {Object} data - Conversion data
   */
  trackConversion(goal, data = {}) {
    this.trackEvent('conversion', {
      goal: goal,
      value: data.value || 1,
      ...data
    }, true); // Send conversions immediately
  }
  
  /**
   * Track time spent on activities
   * @param {string} activity - Activity name
   * @param {number} duration - Duration in milliseconds
   * @param {Object} data - Additional data
   */
  trackTiming(activity, duration, data = {}) {
    this.trackEvent('timing', {
      activity: activity,
      duration: duration,
      ...data
    });
  }
  
  /**
   * Start timing an activity
   * @param {string} activity - Activity name
   * @returns {Function} Stop function
   */
  startTiming(activity) {
    const startTime = performance.now();
    
    return (data = {}) => {
      const duration = performance.now() - startTime;
      this.trackTiming(activity, duration, data);
      return duration;
    };
  }
  
  /**
   * Flush events to server
   * @param {boolean} force - Force send even if offline
   */
  async flush(force = false) {
    if (this.events.length === 0) {
      return;
    }
    
    if (!this.isOnline && !force) {
      console.log('📊 Offline - queueing events for later');
      this.saveEventsToStorage();
      return;
    }
    
    const eventsToSend = [...this.events];
    this.events = []; // Clear current queue
    
    try {
      await this.sendEvents(eventsToSend);
      console.log(`📊 Sent ${eventsToSend.length} analytics events`);
    } catch (error) {
      console.error('❌ Failed to send analytics events:', error);
      
      // Re-queue events on failure
      this.events = [...eventsToSend, ...this.events];
      this.saveEventsToStorage();
    }
  }
  
  /**
   * Send events to analytics endpoint
   * @param {Array} events - Events to send
   */
  async sendEvents(events) {
    // In production, this would send to your analytics endpoint
    const payload = {
      events: events,
      metadata: {
        sdkVersion: '3.0.0',
        platform: 'web',
        timestamp: Date.now()
      }
    };
    
    // For now, we'll just log to console and store in IndexedDB
    console.log('📊 Analytics payload:', payload);
    
    // Store in IndexedDB for later analysis
    await this.storeInIndexedDB(payload);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  /**
   * Store analytics data in IndexedDB
   * @param {Object} payload - Analytics payload
   */
  async storeInIndexedDB(payload) {
    try {
      if (!('indexedDB' in window)) {
        console.warn('IndexedDB not supported');
        return;
      }
      
      const request = indexedDB.open('CryptoConsultorAnalytics', 1);
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('events')) {
          const store = db.createObjectStore('events', { 
            keyPath: 'id', 
            autoIncrement: true 
          });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          store.createIndex('sessionId', 'sessionId', { unique: false });
        }
      };
      
      request.onsuccess = (event) => {
        const db = event.target.result;
        const transaction = db.transaction(['events'], 'readwrite');
        const store = transaction.objectStore('events');
        
        store.add({
          ...payload,
          storedAt: Date.now()
        });
      };
    } catch (error) {
      console.error('❌ Error storing in IndexedDB:', error);
    }
  }
  
  /**
   * Send queued events when back online
   */
  async sendQueuedEvents() {
    const stored = await this.loadEventsFromStorage();
    if (stored.length > 0) {
      this.events = [...stored, ...this.events];
      this.clearStoredEvents();
      this.flush();
    }
  }
  
  /**
   * Save events to localStorage
   */
  saveEventsToStorage() {
    try {
      const data = {
        events: this.events,
        timestamp: Date.now()
      };
      localStorage.setItem('analytics-queue', JSON.stringify(data));
    } catch (error) {
      console.error('❌ Error saving events to storage:', error);
    }
  }
  
  /**
   * Load events from localStorage
   * @returns {Array} Stored events
   */
  async loadEventsFromStorage() {
    try {
      const stored = localStorage.getItem('analytics-queue');
      if (stored) {
        const data = JSON.parse(stored);
        
        // Don't load events older than 24 hours
        const dayAgo = Date.now() - (24 * 60 * 60 * 1000);
        if (data.timestamp > dayAgo) {
          return data.events || [];
        }
      }
    } catch (error) {
      console.error('❌ Error loading events from storage:', error);
    }
    return [];
  }
  
  /**
   * Clear stored events
   */
  clearStoredEvents() {
    localStorage.removeItem('analytics-queue');
  }
  
  /**
   * Start automatic event flushing
   */
  startAutoFlush() {
    if (this.autoFlushTimer) {
      clearInterval(this.autoFlushTimer);
    }
    
    this.autoFlushTimer = setInterval(() => {
      if (this.events.length > 0) {
        this.flush();
      }
    }, this.flushInterval);
  }
  
  /**
   * Stop automatic event flushing
   */
  stopAutoFlush() {
    if (this.autoFlushTimer) {
      clearInterval(this.autoFlushTimer);
      this.autoFlushTimer = null;
    }
  }
  
  /**
   * Generate unique event ID
   * @returns {string} Event ID
   */
  generateEventId() {
    return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  /**
   * Get analytics statistics
   * @returns {Object} Analytics stats
   */
  getStats() {
    return {
      sessionId: this.sessionId,
      userId: this.userId,
      queuedEvents: this.events.length,
      isOnline: this.isOnline,
      autoFlushEnabled: this.autoFlushTimer !== null,
      flushInterval: this.flushInterval
    };
  }
  
  /**
   * Clear all analytics data
   */
  clearAll() {
    this.events = [];
    this.clearStoredEvents();
    console.log('🗑️ All analytics data cleared');
  }
  
  /**
   * Export analytics data for debugging
   * @returns {Object} Exported data
   */
  exportData() {
    return {
      sessionId: this.sessionId,
      userId: this.userId,
      currentEvents: this.events,
      stats: this.getStats()
    };
  }
  
  // ===== ENGAGEMENT FEATURES ANALYTICS =====
  
  /**
   * Track alert system interactions
   * @param {string} action - Alert action (created, triggered, deleted, etc.)
   * @param {Object} alertData - Alert information
   */
  trackAlertInteraction(action, alertData = {}) {
    this.trackEvent('alert_interaction', {
      action: action,
      crypto: alertData.crypto,
      condition: alertData.condition,
      targetValue: alertData.targetValue,
      priority: alertData.priority,
      source: alertData.source,
      alertId: alertData.id,
      triggerTime: alertData.triggeredAt ? (alertData.triggeredAt - alertData.createdAt) : null
    });
  }
  
  /**
   * Track history manager usage
   * @param {string} action - History action (view, export, compare, etc.)
   * @param {Object} historyData - History information
   */
  trackHistoryInteraction(action, historyData = {}) {
    this.trackEvent('history_interaction', {
      action: action,
      totalAnalyses: historyData.totalAnalyses,
      analysisId: historyData.analysisId,
      comparisonIds: historyData.comparisonIds,
      profileEvolution: historyData.profileEvolution,
      consistencyScore: historyData.consistencyScore,
      timeSpan: historyData.timeSpan
    });
  }
  
  /**
   * Track scenario comparison usage
   * @param {string} action - Scenario action (generated, compared, selected, etc.)
   * @param {Object} scenarioData - Scenario information
   */
  trackScenarioInteraction(action, scenarioData = {}) {
    this.trackEvent('scenario_interaction', {
      action: action,
      scenarioCount: scenarioData.scenarioCount,
      selectedScenarios: scenarioData.selectedScenarios,
      comparisonType: scenarioData.comparisonType,
      baseProfile: scenarioData.baseProfile,
      scenarioTypes: scenarioData.scenarioTypes,
      bestScenario: scenarioData.bestScenario,
      userProfile: scenarioData.userProfile
    });
  }
  
  /**
   * Track engagement UI interactions
   * @param {string} action - UI action (panel_opened, button_clicked, etc.)
   * @param {Object} uiData - UI interaction data
   */
  trackEngagementUI(action, uiData = {}) {
    this.trackEvent('engagement_ui', {
      action: action,
      component: uiData.component,
      elementId: uiData.elementId,
      source: uiData.source,
      value: uiData.value,
      context: uiData.context,
      userProfile: uiData.userProfile
    });
  }
  
  /**
   * Track user engagement milestones
   * @param {string} milestone - Milestone achieved
   * @param {Object} milestoneData - Milestone data
   */
  trackEngagementMilestone(milestone, milestoneData = {}) {
    this.trackEvent('engagement_milestone', {
      milestone: milestone,
      value: milestoneData.value,
      userProfile: milestoneData.userProfile,
      timeToAchieve: milestoneData.timeToAchieve,
      previousMilestones: milestoneData.previousMilestones,
      totalInteractions: milestoneData.totalInteractions
    });
  }
  
  /**
   * Track notification interactions
   * @param {string} action - Notification action
   * @param {Object} notificationData - Notification data
   */
  trackNotificationInteraction(action, notificationData = {}) {
    this.trackEvent('notification_interaction', {
      action: action,
      type: notificationData.type,
      source: notificationData.source,
      crypto: notificationData.crypto,
      responseTime: notificationData.responseTime,
      userAction: notificationData.userAction
    });
  }
  
  /**
   * Track newsletter interactions
   * @param {string} action - Newsletter action
   * @param {Object} newsletterData - Newsletter data
   */
  trackNewsletterInteraction(action, newsletterData = {}) {
    this.trackEvent('newsletter_interaction', {
      action: action,
      trigger: newsletterData.trigger,
      emailDomain: newsletterData.emailDomain,
      userProfile: newsletterData.userProfile,
      analysisCount: newsletterData.analysisCount,
      conversionTime: newsletterData.conversionTime,
      dismissalReason: newsletterData.dismissalReason
    });
  }
  
  /**
   * Track feature adoption and usage patterns
   * @param {string} feature - Feature name
   * @param {Object} usageData - Usage data
   */
  trackFeatureUsage(feature, usageData = {}) {
    this.trackEvent('feature_usage', {
      feature: feature,
      firstUse: usageData.firstUse,
      frequency: usageData.frequency,
      duration: usageData.duration,
      completionRate: usageData.completionRate,
      userProfile: usageData.userProfile,
      successfulActions: usageData.successfulActions,
      errors: usageData.errors
    });
  }
  
  /**
   * Track portfolio monitoring and updates
   * @param {string} action - Monitoring action
   * @param {Object} portfolioData - Portfolio data
   */
  trackPortfolioMonitoring(action, portfolioData = {}) {
    this.trackEvent('portfolio_monitoring', {
      action: action,
      totalValue: portfolioData.totalValue,
      changePercent: portfolioData.changePercent,
      topPerformer: portfolioData.topPerformer,
      worstPerformer: portfolioData.worstPerformer,
      alertsTriggered: portfolioData.alertsTriggered,
      monitoringDuration: portfolioData.monitoringDuration
    });
  }
  
  /**
   * Generate engagement analytics report
   * @returns {Object} Engagement analytics summary
   */
  generateEngagementReport() {
    const engagementEvents = this.events.filter(event => 
      event.name.includes('alert') || 
      event.name.includes('history') || 
      event.name.includes('scenario') || 
      event.name.includes('engagement')
    );
    
    const alertEvents = engagementEvents.filter(e => e.name.includes('alert'));
    const historyEvents = engagementEvents.filter(e => e.name.includes('history'));
    const scenarioEvents = engagementEvents.filter(e => e.name.includes('scenario'));
    const newsletterEvents = engagementEvents.filter(e => e.name.includes('newsletter'));
    const uiEvents = engagementEvents.filter(e => e.name.includes('engagement_ui'));
    
    return {
      summary: {
        totalEngagementEvents: engagementEvents.length,
        alertInteractions: alertEvents.length,
        historyInteractions: historyEvents.length,
        scenarioInteractions: scenarioEvents.length,
        newsletterInteractions: newsletterEvents.length,
        uiInteractions: uiEvents.length
      },
      alerts: {
        created: alertEvents.filter(e => e.data.action === 'created').length,
        triggered: alertEvents.filter(e => e.data.action === 'triggered').length,
        deleted: alertEvents.filter(e => e.data.action === 'deleted').length,
        mostUsedCrypto: this.getMostFrequentValue(alertEvents, 'data.crypto'),
        averageTriggerTime: this.getAverageValue(alertEvents.filter(e => e.data.triggerTime), 'data.triggerTime')
      },
      history: {
        viewCount: historyEvents.filter(e => e.data.action === 'view').length,
        exportCount: historyEvents.filter(e => e.data.action === 'export').length,
        compareCount: historyEvents.filter(e => e.data.action === 'compare').length,
        averageAnalysesCount: this.getAverageValue(historyEvents, 'data.totalAnalyses')
      },
      scenarios: {
        generatedCount: scenarioEvents.filter(e => e.data.action === 'generated').length,
        comparedCount: scenarioEvents.filter(e => e.data.action === 'compared').length,
        selectedCount: scenarioEvents.filter(e => e.data.action === 'selected').length,
        averageScenarios: this.getAverageValue(scenarioEvents, 'data.scenarioCount')
      },
      newsletter: {
        signupCount: newsletterEvents.filter(e => e.data.action === 'email_captured').length,
        modalShownCount: newsletterEvents.filter(e => e.data.action === 'email_capture_shown').length,
        dismissalCount: newsletterEvents.filter(e => e.data.action === 'email_capture_dismissed').length,
        conversionRate: this.calculateNewsletterConversionRate(newsletterEvents),
        mostCommonTrigger: this.getMostFrequentValue(newsletterEvents, 'data.trigger')
      },
      engagement: {
        sessionDuration: this.getSessionDuration(),
        returnVisits: this.getReturnVisits(),
        featureAdoption: this.getFeatureAdoptionRate()
      }
    };
  }
  
  /**
   * Helper: Get most frequent value from events
   * @param {Array} events - Events array
   * @param {string} path - Property path
   * @returns {string} Most frequent value
   */
  getMostFrequentValue(events, path) {
    const values = events.map(event => this.getNestedProperty(event, path))
      .filter(value => value !== undefined);
    
    if (values.length === 0) return null;
    
    const frequency = {};
    values.forEach(value => {
      frequency[value] = (frequency[value] || 0) + 1;
    });
    
    return Object.keys(frequency).reduce((a, b) => 
      frequency[a] > frequency[b] ? a : b
    );
  }
  
  /**
   * Helper: Get average value from events
   * @param {Array} events - Events array
   * @param {string} path - Property path
   * @returns {number} Average value
   */
  getAverageValue(events, path) {
    const values = events.map(event => this.getNestedProperty(event, path))
      .filter(value => typeof value === 'number');
    
    if (values.length === 0) return 0;
    
    return values.reduce((sum, value) => sum + value, 0) / values.length;
  }
  
  /**
   * Helper: Get nested property value
   * @param {Object} obj - Object
   * @param {string} path - Property path (e.g., 'data.crypto')
   * @returns {*} Property value
   */
  getNestedProperty(obj, path) {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }
  
  /**
   * Helper: Get session duration
   * @returns {number} Session duration in milliseconds
   */
  getSessionDuration() {
    const sessionEvents = this.events.filter(e => e.sessionId === this.sessionId);
    if (sessionEvents.length === 0) return 0;
    
    const firstEvent = Math.min(...sessionEvents.map(e => e.timestamp));
    const lastEvent = Math.max(...sessionEvents.map(e => e.timestamp));
    
    return lastEvent - firstEvent;
  }
  
  /**
   * Helper: Get return visits count
   * @returns {number} Number of previous sessions
   */
  getReturnVisits() {
    const uniqueSessions = new Set(this.events.map(e => e.sessionId));
    return uniqueSessions.size - 1; // Exclude current session
  }
  
  /**
   * Helper: Calculate feature adoption rate
   * @returns {Object} Feature adoption metrics
   */
  getFeatureAdoptionRate() {
    const totalSessions = new Set(this.events.map(e => e.sessionId)).size;
    const engagementSessions = new Set(
      this.events.filter(e => 
        e.name.includes('alert') || 
        e.name.includes('history') || 
        e.name.includes('scenario')
      ).map(e => e.sessionId)
    ).size;
    
    return {
      adoptionRate: totalSessions > 0 ? (engagementSessions / totalSessions) * 100 : 0,
      totalSessions,
      engagementSessions
    };
  }
  
  /**
   * Helper: Calculate newsletter conversion rate
   * @param {Array} newsletterEvents - Newsletter events
   * @returns {number} Conversion rate percentage
   */
  calculateNewsletterConversionRate(newsletterEvents) {
    const modalsShown = newsletterEvents.filter(e => e.data.action === 'email_capture_shown').length;
    const signups = newsletterEvents.filter(e => e.data.action === 'email_captured').length;
    
    return modalsShown > 0 ? (signups / modalsShown) * 100 : 0;
  }
}

// Initialize analytics on page load
let analytics;

// Auto-initialize if in browser environment
if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    analytics = new AnalyticsManager();
    
    // Track page load
    analytics.trackEvent('page_load', {
      page: window.location.pathname,
      referrer: document.referrer,
      loadTime: Date.now()
    });
    
    // Make available globally
    window.analytics = analytics;
  });
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AnalyticsManager;
} else if (typeof window !== 'undefined') {
  window.AnalyticsManager = AnalyticsManager;
}