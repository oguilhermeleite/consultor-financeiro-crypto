// Newsletter Manager for Email Capture and Subscriber Management
// Advanced email capture system with user behavior tracking

class NewsletterManager {
  constructor() {
    this.subscribers = this.loadSubscribers();
    this.isInitialized = false;
    this.modalShownThisSession = false;
    
    this.initializeNewsletter();
  }
  
  /**
   * Initialize newsletter system
   */
  async initializeNewsletter() {
    await this.setupEmailCapture();
    this.setupEventListeners();
    this.isInitialized = true;
    
    console.log('📧 Newsletter Manager initialized with', this.subscribers.length, 'subscribers');
  }
  
  /**
   * Setup email capture triggers and logic
   */
  async setupEmailCapture() {
    // Show email capture modal after user completes analysis
    document.addEventListener('profileCalculated', () => {
      setTimeout(() => {
        this.showEmailCaptureModal('post_analysis');
      }, 3000); // Show 3 seconds after results
    });
    
    // Show email capture for returning users without email
    if (this.isReturningUser() && !this.hasUserEmail()) {
      setTimeout(() => {
        this.showEmailCaptureModal('returning_user');
      }, 8000); // Show after 8 seconds for returning users
    }
    
    // Show email capture on exit intent
    this.setupExitIntentCapture();
  }
  
  /**
   * Setup additional event listeners
   */
  setupEventListeners() {
    // Listen for engagement milestones
    document.addEventListener('engagementMilestone', (event) => {
      this.handleEngagementMilestone(event.detail);
    });
    
    // Listen for alert triggers (high engagement moment)
    document.addEventListener('alertTriggered', () => {
      setTimeout(() => {
        if (!this.hasUserEmail() && !this.modalShownThisSession) {
          this.showEmailCaptureModal('alert_triggered');
        }
      }, 2000);
    });
  }
  
  /**
   * Setup exit intent detection
   */
  setupExitIntentCapture() {
    let exitIntentShown = false;
    
    document.addEventListener('mouseleave', (e) => {
      if (e.clientY <= 0 && !exitIntentShown && !this.hasUserEmail() && !this.modalShownThisSession) {
        exitIntentShown = true;
        this.showEmailCaptureModal('exit_intent');
      }
    });
  }
  
  /**
   * Show email capture modal with context-specific content
   * @param {string} trigger - What triggered the modal
   */
  showEmailCaptureModal(trigger = 'general') {
    // Don't show if already dismissed recently
    const lastDismissed = localStorage.getItem('email-capture-dismissed');
    if (lastDismissed && Date.now() - parseInt(lastDismissed) < 24 * 60 * 60 * 1000) {
      return;
    }
    
    // Don't show if already shown this session
    if (this.modalShownThisSession) {
      return;
    }
    
    this.modalShownThisSession = true;
    
    const content = this.getModalContent(trigger);
    const modal = document.createElement('div');
    modal.className = 'email-capture-modal';
    modal.innerHTML = `
      <div class="email-capture-overlay" onclick="this.parentElement.remove()">
        <div class="email-capture-content" onclick="event.stopPropagation()">
          <button class="email-capture-close" onclick="window.newsletterManager.dismissModal(this)">×</button>
          
          <div class="email-capture-header">
            <h3>${content.title}</h3>
            <p>${content.subtitle}</p>
          </div>
          
          <div class="email-capture-benefits">
            ${content.benefits.map(benefit => `
              <div class="benefit-item">
                <span class="benefit-icon">${benefit.icon}</span>
                <span>${benefit.text}</span>
              </div>
            `).join('')}
          </div>
          
          <form class="email-capture-form" onsubmit="return window.newsletterManager.handleEmailSubmit(event)">
            <div class="form-group">
              <div class="input-group">
                <input 
                  type="email" 
                  id="newsletter-email" 
                  placeholder="seu@email.com" 
                  required
                  class="email-input"
                >
                <button type="submit" class="btn btn-primary email-submit">
                  ${content.buttonText}
                </button>
              </div>
            </div>
            
            <div class="form-group">
              <label class="checkbox-label">
                <input type="checkbox" id="newsletter-consent" required>
                <span class="checkmark"></span>
                Concordo em receber emails com dicas e análises sobre crypto
              </label>
            </div>
          </form>
          
          <div class="email-capture-footer">
            <small>✅ Sem spam • ✅ Cancelar quando quiser • ✅ Conteúdo exclusivo</small>
            <button class="link-button" onclick="window.newsletterManager.dismissModal(this)">
              ${content.dismissText}
            </button>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Focus on email input after animation
    setTimeout(() => {
      const emailInput = document.getElementById('newsletter-email');
      if (emailInput) {
        emailInput.focus();
      }
    }, 500);
    
    // Track modal shown
    if (window.cryptoFeatures?.analytics) {
      window.cryptoFeatures.analytics.trackEvent('email_capture_shown', {
        trigger: trigger,
        userType: this.isReturningUser() ? 'returning' : 'new',
        analysisCount: this.getAnalysisCount()
      });
    }
  }
  
  /**
   * Get context-specific modal content
   * @param {string} trigger - Modal trigger
   * @returns {Object} Modal content
   */
  getModalContent(trigger) {
    const contents = {
      post_analysis: {
        title: '🎯 Gostou da sua análise?',
        subtitle: 'Receba dicas personalizadas e alertas para maximizar seus investimentos em crypto',
        benefits: [
          { icon: '📊', text: 'Relatórios semanais exclusivos do mercado' },
          { icon: '🎯', text: 'Dicas baseadas no seu perfil específico' },
          { icon: '⚡', text: 'Alertas de oportunidades em tempo real' }
        ],
        buttonText: 'Quero Receber',
        dismissText: 'Talvez depois'
      },
      returning_user: {
        title: '👋 Que bom te ver de volta!',
        subtitle: 'Não perca nenhuma oportunidade no mercado crypto com nossas análises exclusivas',
        benefits: [
          { icon: '🔔', text: 'Alertas de mudanças importantes' },
          { icon: '📈', text: 'Análises técnicas semanais' },
          { icon: '💎', text: 'Dicas para seu perfil de investidor' }
        ],
        buttonText: 'Quero Ficar Por Dentro',
        dismissText: 'Não agora'
      },
      exit_intent: {
        title: '⏰ Antes de sair...',
        subtitle: 'Não perca as melhores oportunidades do mercado crypto!',
        benefits: [
          { icon: '🚀', text: 'Alertas de alta de preço' },
          { icon: '📉', text: 'Avisos de correções importantes' },
          { icon: '🎓', text: 'Guias educativos exclusivos' }
        ],
        buttonText: 'Garantir Acesso',
        dismissText: 'Continuar sem receber'
      },
      alert_triggered: {
        title: '🔥 Momento perfeito!',
        subtitle: 'Seus alertas estão funcionando! Quer receber mais insights como este?',
        benefits: [
          { icon: '🎯', text: 'Mais alertas personalizados' },
          { icon: '📊', text: 'Análises de tendências' },
          { icon: '💰', text: 'Oportunidades de investimento' }
        ],
        buttonText: 'Sim, Quero Mais',
        dismissText: 'Só os alertas mesmo'
      }
    };
    
    return contents[trigger] || contents.post_analysis;
  }
  
  /**
   * Handle email form submission
   * @param {Event} event - Form submit event
   * @returns {boolean} Always false to prevent default
   */
  handleEmailSubmit(event) {
    event.preventDefault();
    
    const email = document.getElementById('newsletter-email').value.trim();
    const consent = document.getElementById('newsletter-consent').checked;
    
    // Validation
    if (!email || !consent) {
      this.showValidationError('Por favor, preencha o email e aceite receber nossas comunicações.');
      return false;
    }
    
    if (!this.isValidEmail(email)) {
      this.showValidationError('Por favor, insira um email válido.');
      return false;
    }
    
    // Check if already subscribed
    if (this.isEmailSubscribed(email)) {
      this.showValidationError('Este email já está cadastrado!');
      return false;
    }
    
    // Disable form while processing
    this.setFormLoading(true);
    
    // Add subscriber
    this.addSubscriber(email);
    
    // Show success and cleanup
    this.showSuccessMessage();
    document.querySelector('.email-capture-modal')?.remove();
    
    // Track conversion
    if (window.cryptoFeatures?.analytics) {
      window.cryptoFeatures.analytics.trackEvent('email_captured', {
        email_domain: email.split('@')[1],
        conversion_method: 'modal',
        userProfile: this.getCurrentUserProfile(),
        analysisCount: this.getAnalysisCount()
      });
    }
    
    return false;
  }
  
  /**
   * Add new subscriber
   * @param {string} email - Subscriber email
   */
  addSubscriber(email) {
    const subscriber = {
      id: this.generateSubscriberId(),
      email: email,
      subscribedAt: Date.now(),
      source: 'crypto_consultor',
      userProfile: this.getCurrentUserProfile(),
      analysisCount: this.getAnalysisCount(),
      preferences: {
        weeklyReports: true,
        marketAlerts: true,
        personalizedTips: true,
        priceAlerts: true
      },
      metadata: {
        userAgent: navigator.userAgent,
        referrer: document.referrer,
        subscriptionPage: window.location.pathname
      }
    };
    
    this.subscribers.push(subscriber);
    this.saveSubscribers();
    
    // Store user email for future reference
    localStorage.setItem('user-email', email);
    localStorage.setItem('email-subscribed-at', Date.now().toString());
    
    console.log('📧 New subscriber added:', email);
  }
  
  /**
   * Show success message after subscription
   */
  showSuccessMessage() {
    const success = document.createElement('div');
    success.className = 'email-capture-success';
    success.innerHTML = `
      <div class="success-content">
        <div class="success-icon">🎉</div>
        <h4>Perfeito!</h4>
        <p>Bem-vindo à nossa comunidade crypto!</p>
        <small>Verifique sua caixa de entrada (e spam) nos próximos minutos para confirmar sua inscrição.</small>
      </div>
    `;
    
    document.body.appendChild(success);
    
    setTimeout(() => {
      if (success.parentElement) {
        success.style.animation = 'slideOutRight 0.3s ease-in';
        setTimeout(() => success.remove(), 300);
      }
    }, 5000);
  }
  
  /**
   * Show validation error
   * @param {string} message - Error message
   */
  showValidationError(message) {
    // Remove existing error
    const existingError = document.querySelector('.email-error');
    if (existingError) {
      existingError.remove();
    }
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'email-error';
    errorDiv.textContent = message;
    errorDiv.style.cssText = `
      color: #e74c3c;
      font-size: 14px;
      margin-top: 8px;
      padding: 8px 12px;
      background: rgba(231, 76, 60, 0.1);
      border-radius: 6px;
      border-left: 3px solid #e74c3c;
    `;
    
    const formGroup = document.querySelector('.email-capture-form .form-group');
    if (formGroup) {
      formGroup.appendChild(errorDiv);
    }
    
    // Remove after 5 seconds
    setTimeout(() => {
      errorDiv.remove();
    }, 5000);
  }
  
  /**
   * Set form loading state
   * @param {boolean} loading - Loading state
   */
  setFormLoading(loading) {
    const submitBtn = document.querySelector('.email-submit');
    const emailInput = document.getElementById('newsletter-email');
    
    if (submitBtn) {
      submitBtn.disabled = loading;
      submitBtn.textContent = loading ? '⏳ Cadastrando...' : 'Quero Receber';
    }
    
    if (emailInput) {
      emailInput.disabled = loading;
    }
  }
  
  /**
   * Dismiss modal and track
   * @param {HTMLElement} button - Dismiss button
   */
  dismissModal(button) {
    // Track dismissal
    if (window.cryptoFeatures?.analytics) {
      window.cryptoFeatures.analytics.trackEvent('email_capture_dismissed', {
        method: 'manual_close',
        userProfile: this.getCurrentUserProfile(),
        analysisCount: this.getAnalysisCount()
      });
    }
    
    // Store dismissal timestamp
    localStorage.setItem('email-capture-dismissed', Date.now().toString());
    
    // Remove modal
    const modal = button.closest('.email-capture-modal');
    if (modal) {
      modal.style.animation = 'fadeOut 0.3s ease';
      setTimeout(() => modal.remove(), 300);
    }
  }
  
  /**
   * Handle engagement milestones that might trigger email capture
   * @param {Object} milestone - Milestone data
   */
  handleEngagementMilestone(milestone) {
    // Show email capture on high engagement milestones
    if (!this.hasUserEmail() && !this.modalShownThisSession) {
      const highEngagementMilestones = ['5_analyses', 'first_alert', 'scenario_comparison'];
      
      if (highEngagementMilestones.includes(milestone.type)) {
        setTimeout(() => {
          this.showEmailCaptureModal('engagement_milestone');
        }, 1500);
      }
    }
  }
  
  // Utility Methods
  
  /**
   * Validate email format
   * @param {string} email - Email to validate
   * @returns {boolean} Is valid
   */
  isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }
  
  /**
   * Check if email is already subscribed
   * @param {string} email - Email to check
   * @returns {boolean} Is subscribed
   */
  isEmailSubscribed(email) {
    return this.subscribers.some(sub => sub.email.toLowerCase() === email.toLowerCase());
  }
  
  /**
   * Check if user is returning
   * @returns {boolean} Is returning user
   */
  isReturningUser() {
    const history = JSON.parse(localStorage.getItem('user-analysis-history') || '[]');
    return history.length > 1;
  }
  
  /**
   * Check if user has provided email
   * @returns {boolean} Has email
   */
  hasUserEmail() {
    return !!localStorage.getItem('user-email');
  }
  
  /**
   * Get current user profile
   * @returns {string} User profile
   */
  getCurrentUserProfile() {
    const lastResult = JSON.parse(localStorage.getItem('consultor-financeiro-resultado') || '{}');
    return lastResult.profile || 'unknown';
  }
  
  /**
   * Get user's analysis count
   * @returns {number} Analysis count
   */
  getAnalysisCount() {
    const history = JSON.parse(localStorage.getItem('user-analysis-history') || '[]');
    return history.length;
  }
  
  /**
   * Generate unique subscriber ID
   * @returns {string} Subscriber ID
   */
  generateSubscriberId() {
    return 'sub_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
  }
  
  /**
   * Load subscribers from storage
   * @returns {Array} Subscribers list
   */
  loadSubscribers() {
    try {
      return JSON.parse(localStorage.getItem('newsletter-subscribers') || '[]');
    } catch (error) {
      console.error('Error loading subscribers:', error);
      return [];
    }
  }
  
  /**
   * Save subscribers to storage
   */
  saveSubscribers() {
    try {
      localStorage.setItem('newsletter-subscribers', JSON.stringify(this.subscribers));
    } catch (error) {
      console.error('Error saving subscribers:', error);
    }
  }
  
  // Admin and Analytics Methods
  
  /**
   * Get subscriber statistics
   * @returns {Object} Subscriber stats
   */
  getSubscriberStats() {
    const stats = {
      total: this.subscribers.length,
      byProfile: {},
      bySource: {},
      recent: 0,
      domains: {},
      conversionRate: 0
    };
    
    const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    const totalVisitors = parseInt(localStorage.getItem('total-visitors') || '0');
    
    this.subscribers.forEach(subscriber => {
      // Count by profile
      const profile = subscriber.userProfile || 'unknown';
      stats.byProfile[profile] = (stats.byProfile[profile] || 0) + 1;
      
      // Count by source
      const source = subscriber.source || 'unknown';
      stats.bySource[source] = (stats.bySource[source] || 0) + 1;
      
      // Count recent
      if (subscriber.subscribedAt > weekAgo) {
        stats.recent++;
      }
      
      // Count domains
      const domain = subscriber.email.split('@')[1];
      stats.domains[domain] = (stats.domains[domain] || 0) + 1;
    });
    
    // Calculate conversion rate
    if (totalVisitors > 0) {
      stats.conversionRate = (this.subscribers.length / totalVisitors) * 100;
    }
    
    return stats;
  }
  
  /**
   * Export subscribers data
   */
  exportSubscribers() {
    const stats = this.getSubscriberStats();
    const data = {
      exportDate: new Date().toISOString(),
      totalSubscribers: this.subscribers.length,
      statistics: stats,
      subscribers: this.subscribers.map(sub => ({
        id: sub.id,
        email: sub.email,
        subscribedAt: new Date(sub.subscribedAt).toISOString(),
        userProfile: sub.userProfile,
        analysisCount: sub.analysisCount,
        source: sub.source,
        preferences: sub.preferences
      }))
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `newsletter-subscribers-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    URL.revokeObjectURL(url);
    
    console.log('📧 Subscribers data exported');
  }
  
  /**
   * Clear all subscriber data
   */
  clearAllSubscribers() {
    this.subscribers = [];
    this.saveSubscribers();
    localStorage.removeItem('user-email');
    localStorage.removeItem('email-subscribed-at');
    console.log('🗑️ All subscriber data cleared');
  }
  
  /**
   * Get newsletter manager status
   * @returns {Object} Status info
   */
  getStatus() {
    return {
      isInitialized: this.isInitialized,
      totalSubscribers: this.subscribers.length,
      userHasEmail: this.hasUserEmail(),
      isReturningUser: this.isReturningUser(),
      modalShownThisSession: this.modalShownThisSession
    };
  }
}

// Auto-initialize newsletter manager
if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    window.newsletterManager = new NewsletterManager();
  });
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = NewsletterManager;
} else if (typeof window !== 'undefined') {
  window.NewsletterManager = NewsletterManager;
}