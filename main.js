// Consultor Financeiro - Crypto Trading Specialist
// Main Application Logic with Enhanced Dropdown Support

// Global function for CTA button
function startAnalysis() {
    // Hide landing page
    const landingSection = document.querySelector('.hero-section') || document.querySelector('.landing-section');
    if (landingSection) {
        landingSection.classList.add('hidden');
    }
    
    // Show questionnaire
    const questionnaireSection = document.getElementById('questionnaire-section');
    if (questionnaireSection) {
        questionnaireSection.classList.remove('hidden');
        questionnaireSection.scrollIntoView({ behavior: 'smooth' });
    } else {
        // Fallback: show any form container
        const formContainer = document.querySelector('.questionnaire-container') || 
                             document.querySelector('.form-container') ||
                             document.querySelector('#questionario');
        
        if (formContainer) {
            formContainer.classList.remove('hidden');
            formContainer.scrollIntoView({ behavior: 'smooth' });
        } else {
            console.error('Form container not found');
            alert('Erro ao carregar formulário. Recarregue a página.');
        }
    }
    
    // Update progress
    updateProgress(20);
    console.log('🚀 Analysis started via global function');
}

// Helper function for progress updates
function updateProgress(percentage) {
    const progressFill = document.querySelector('.progress-fill') || document.getElementById('progress-fill');
    if (progressFill) {
        progressFill.style.width = percentage + '%';
    }
}

// Unified form handler
function setupUnifiedFormHandler() {
    const unifiedForm = document.getElementById('unified-form');
    
    if (unifiedForm) {
        unifiedForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            try {
                // Collect form data safely
                const formData = {
                    nome: document.getElementById('nome')?.value || 'Usuário',
                    objetivo: document.getElementById('objetivo')?.value || '',
                    tolerancia: document.querySelector('[name="tolerancia"]:checked')?.value || '',
                    valor: document.getElementById('valor')?.value || '',
                    experiencia: document.getElementById('experiencia')?.value || ''
                };
                
                // Validate required fields
                if (!formData.objetivo) {
                    alert('Por favor, selecione seu objetivo de investimento.');
                    return;
                }
                
                if (!formData.tolerancia) {
                    alert('Por favor, selecione sua tolerância a risco.');
                    return;
                }
                
                // Process analysis
                processAnalysis(formData);
                
            } catch (error) {
                console.error('Form submission error:', error);
                alert('Erro ao processar formulário. Tente novamente.');
            }
        });
        console.log('✅ Unified form handler setup complete');
    }
}

function processAnalysis(formData) {
    // Show loading
    showLoading();
    
    // Store in global app instance if available
    if (window.cryptoAdvisor) {
        window.cryptoAdvisor.formData = {
            name: formData.nome,
            objective: formData.objetivo,
            risk: formData.tolerancia,
            amount: formData.valor,
            experience: formData.experiencia
        };
        
        // Use existing handleUnifiedFormSubmission if available
        if (typeof window.cryptoAdvisor.handleUnifiedFormSubmission === 'function') {
            hideLoading();
            window.cryptoAdvisor.handleUnifiedFormSubmission();
            return;
        }
    }
    
    // Fallback processing
    setTimeout(() => {
        hideLoading();
        // Try to show review section
        const reviewSection = document.getElementById('review-section');
        if (reviewSection) {
            document.getElementById('questionnaire-section')?.classList.add('hidden');
            reviewSection.classList.remove('hidden');
            updateProgress(100);
        } else {
            alert('Análise processada! Por favor, recarregue a página para ver os resultados.');
        }
    }, 2000);
}

function showLoading() {
    // Remove existing loading if any
    const existingLoading = document.getElementById('loading-overlay');
    if (existingLoading) existingLoading.remove();
    
    // Create loading overlay
    const loading = document.createElement('div');
    loading.id = 'loading-overlay';
    loading.innerHTML = `
        <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
                    background: rgba(0,0,0,0.8); display: flex; align-items: center; 
                    justify-content: center; z-index: 9999; color: white;">
            <div style="text-align: center;">
                <div style="font-size: 2rem; margin-bottom: 1rem;">🔄</div>
                <div>Calculando seu perfil...</div>
            </div>
        </div>
    `;
    document.body.appendChild(loading);
}

function hideLoading() {
    const loading = document.getElementById('loading-overlay');
    if (loading) loading.remove();
}

class CryptoAdvisor {
    constructor() {
        this.currentSection = 'landing';
        this.currentStep = 1;
        this.totalSteps = 5;
        this.userProfile = null;
        this.formData = {};
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.setupStepNavigation();
        this.setupProgressTracking();
        this.setupEnhancedDropdowns();
        this.setupTooltips();
        this.loadSavedData();
        console.log('🚀 Consultor Financeiro initialized');
    }

    bindEvents() {
        // Landing page - now handled by global startAnalysis() function
        // Keep for backward compatibility if button still exists
        const startBtn = document.getElementById('start-questionnaire');
        if (startBtn) {
            startBtn.addEventListener('click', () => {
                this.showSection('questionnaire');
            });
        }

        // Unified form submission
        const unifiedForm = document.getElementById('unified-form');
        if (unifiedForm) {
            unifiedForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleUnifiedFormSubmission();
            });
        }

        // Legacy form submission (fallback)
        const cryptoForm = document.getElementById('crypto-form');
        if (cryptoForm) {
            cryptoForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleFormSubmission();
            });
        }

        // Review section navigation
        const backToFormBtn = document.getElementById('back-to-form');
        if (backToFormBtn) {
            backToFormBtn.addEventListener('click', () => {
                this.showUnifiedForm();
            });
        }

        const submitAnalysisBtn = document.getElementById('submit-analysis');
        if (submitAnalysisBtn) {
            submitAnalysisBtn.addEventListener('click', () => {
                this.handleFinalSubmission();
            });
        }

        // Action buttons
        const shareWhatsappBtn = document.getElementById('share-whatsapp');
        if (shareWhatsappBtn) {
            shareWhatsappBtn.addEventListener('click', () => {
                this.shareWhatsApp();
            });
        }

        const saveDeviceBtn = document.getElementById('save-device');
        if (saveDeviceBtn) {
            saveDeviceBtn.addEventListener('click', () => {
                this.saveToDevice();
            });
        }

        const restartAnalysisBtn = document.getElementById('restart-analysis');
        if (restartAnalysisBtn) {
            restartAnalysisBtn.addEventListener('click', () => {
                this.restartAnalysis();
            });
        }

        // Legacy step navigation (fallback)
        const continueBtn = document.getElementById('continue-button');
        if (continueBtn) {
            continueBtn.addEventListener('click', () => {
                this.nextStep();
            });
        }

        const backBtn = document.getElementById('back-button');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                this.previousStep();
            });
        }
    }

    // CRITICAL: Enhanced dropdown setup for cross-platform compatibility
    setupEnhancedDropdowns() {
        const selectElements = document.querySelectorAll('.select-wrapper select');
        
        selectElements.forEach(select => {
            // Ensure proper focus and click handling
            select.addEventListener('click', (e) => {
                e.stopPropagation();
                this.handleSelectClick(select);
            });

            // Touch event support for mobile
            select.addEventListener('touchstart', (e) => {
                e.stopPropagation();
                this.handleSelectClick(select);
            });

            // Change event for value updates
            select.addEventListener('change', (e) => {
                this.handleSelectChange(select, e.target.value);
                this.updateProgress();
            });

            // Focus handling
            select.addEventListener('focus', () => {
                this.handleSelectFocus(select);
            });

            select.addEventListener('blur', () => {
                this.handleSelectBlur(select);
            });

            // Keyboard navigation support
            select.addEventListener('keydown', (e) => {
                this.handleSelectKeydown(select, e);
            });
        });

        console.log('✅ Enhanced dropdowns initialized for', selectElements.length, 'select elements');
    }

    // Step Navigation System
    setupStepNavigation() {
        this.updateStepDisplay();
        this.updateButtonStates();
        
        // Listen for form changes to update validation
        document.getElementById('crypto-form').addEventListener('input', () => {
            this.saveFormData();
            this.updateButtonStates();
        });

        document.getElementById('crypto-form').addEventListener('change', () => {
            this.saveFormData();
            this.updateButtonStates();
            this.validateCurrentStep();
        });

        console.log('✅ Step navigation initialized');
    }

    nextStep() {
        if (this.currentStep < this.totalSteps) {
            if (this.validateCurrentStep()) {
                this.saveFormData();
                this.hideCurrentStep();
                this.currentStep++;
                this.showCurrentStep();
                this.updateStepDisplay();
                this.updateButtonStates();
                
                // Track form step advancement
                if (window.cryptoFeatures?.analytics) {
                    window.cryptoFeatures.analytics.trackFormStep(this.currentStep, {
                        direction: 'forward',
                        formData: this.getFormData()
                    });
                }
                
                // Special handling for review step
                if (this.currentStep === 5) {
                    this.populateReviewStep();
                }
                
                console.log(`📄 Advanced to step ${this.currentStep}`);
            }
        }
    }

    previousStep() {
        if (this.currentStep > 1) {
            this.saveFormData();
            this.hideCurrentStep();
            this.currentStep--;
            this.showCurrentStep();
            this.updateStepDisplay();
            this.updateButtonStates();
            
            console.log(`📄 Returned to step ${this.currentStep}`);
        }
    }

    hideCurrentStep() {
        const currentStepElement = document.querySelector(`[data-step="${this.currentStep}"]`);
        if (currentStepElement) {
            currentStepElement.classList.remove('active');
        }
    }

    showCurrentStep() {
        const currentStepElement = document.querySelector(`[data-step="${this.currentStep}"]`);
        if (currentStepElement) {
            currentStepElement.classList.add('active');
        }
    }

    updateStepDisplay() {
        const stepText = document.getElementById('step-text');
        const progressFill = document.getElementById('step-progress-fill');
        const backButton = document.getElementById('back-button');

        stepText.textContent = `Passo ${this.currentStep} de ${this.totalSteps}`;
        
        const progressPercent = (this.currentStep / this.totalSteps) * 100;
        progressFill.style.width = `${progressPercent}%`;

        // Show/hide back button
        if (this.currentStep > 1) {
            backButton.classList.remove('hidden');
        } else {
            backButton.classList.add('hidden');
        }
    }

    updateButtonStates() {
        const continueButton = document.getElementById('continue-button');
        const submitButton = document.getElementById('submit-button');

        if (this.currentStep < this.totalSteps) {
            // Continue button logic
            continueButton.classList.remove('hidden');
            submitButton.classList.add('hidden');
            
            if (this.isCurrentStepValid()) {
                continueButton.classList.remove('disabled');
            } else {
                continueButton.classList.add('disabled');
            }
        } else {
            // Submit button logic (step 5)
            continueButton.classList.add('hidden');
            submitButton.classList.remove('hidden');
        }
    }

    isCurrentStepValid() {
        switch (this.currentStep) {
            case 1:
                const objectiveElement = document.getElementById('objective');
                return objectiveElement && objectiveElement.value !== '';
            case 2:
                const riskElement = document.querySelector('input[name="risk"]:checked');
                return riskElement !== null;
            case 3:
            case 4:
                return true; // Optional steps
            case 5:
                return this.validateForm();
            default:
                return false;
        }
    }

    validateCurrentStep() {
        const isValid = this.isCurrentStepValid();
        const alertsContainer = document.getElementById('alerts-container');
        
        // Clear previous alerts
        alertsContainer.innerHTML = '';
        
        if (this.currentStep === 5) {
            // Show validation alerts for review step
            this.showValidationAlerts();
        }
        
        return isValid;
    }

    populateReviewStep() {
        const reviewContainer = document.getElementById('review-container');
        const formData = this.getFormData();
        
        const labels = {
            objective: {
                curtissimo: 'Curtíssimo prazo (1-7 dias)',
                moderado: 'Moderado (4-9 semanas)',
                longo: 'Longo prazo (1+ anos)'
            },
            risk: {
                baixo: 'Baixo - Prefiro segurança',
                medio: 'Médio - Aceito algum risco',
                alto: 'Alto - Busco máximo retorno'
            },
            amount: {
                baixo: 'Até R$ 1.000',
                'medio-baixo': 'R$ 1.000 - R$ 10.000',
                'medio-alto': 'R$ 10.000 - R$ 50.000',
                alto: 'Mais de R$ 50.000'
            },
            experience: {
                iniciante: 'Iniciante (menos de 6 meses)',
                intermediario: 'Intermediário (6 meses a 2 anos)',
                avancado: 'Avançado (mais de 2 anos)'
            }
        };

        const reviewItems = [
            { label: 'Objetivo de investimento', value: labels.objective[formData.objective], required: true },
            { label: 'Tolerância a risco', value: labels.risk[formData.risk], required: true }
        ];

        if (formData.name) {
            reviewItems.unshift({ label: 'Nome', value: formData.name, required: false });
        }

        if (formData.amount) {
            reviewItems.push({ label: 'Valor para investir', value: labels.amount[formData.amount], required: false });
        }

        if (formData.experience) {
            reviewItems.push({ label: 'Experiência com cripto', value: labels.experience[formData.experience], required: false });
        }

        reviewContainer.innerHTML = reviewItems.map(item => `
            <div class="review-item">
                <div class="review-label">
                    ${item.label}${item.required ? ' *' : ''}
                </div>
                <div class="review-value">${item.value}</div>
            </div>
        `).join('');
    }

    showValidationAlerts() {
        const alertsContainer = document.getElementById('alerts-container');
        const formData = this.getFormData();
        const alerts = [];

        // Consistency check: short-term + low risk
        if (formData.objective === 'curtissimo' && formData.risk === 'baixo') {
            alerts.push({
                type: 'warning',
                message: '⚠️ Trading de curto prazo com baixa tolerância a risco pode limitar oportunidades'
            });
        }

        // Experience vs risk alignment
        if (formData.experience === 'iniciante' && formData.risk === 'alto') {
            alerts.push({
                type: 'info',
                message: '💡 Como iniciante com perfil arrojado, considere começar com valores menores'
            });
        }

        // Amount vs experience check
        if (formData.amount === 'alto' && formData.experience === 'iniciante') {
            alerts.push({
                type: 'caution',
                message: '🔍 Valores altos + pouca experiência: recomendamos educação adicional'
            });
        }

        if (alerts.length === 0) {
            alerts.push({
                type: 'success',
                message: '✅ Perfil consistente - suas respostas estão bem alinhadas'
            });
        }

        alertsContainer.innerHTML = alerts.map(alert => `
            <div class="alert alert-${alert.type}">
                ${alert.message}
            </div>
        `).join('');
    }

    saveFormData() {
        this.formData = this.getFormData();
        localStorage.setItem('cryptoAdvisorFormData', JSON.stringify(this.formData));
    }

    getFormData() {
        // Get elements safely
        const nameElement = document.getElementById('name');
        const objectiveElement = document.getElementById('objective');
        const riskElement = document.querySelector('input[name="risk"]:checked');
        const amountElement = document.getElementById('amount');
        const experienceElement = document.querySelector('input[name="experience"]:checked');

        // Collect values safely with null checks
        return {
            name: nameElement?.value?.trim() || '',
            objective: objectiveElement?.value || '',
            risk: riskElement?.value || '',
            amount: amountElement?.value || '',
            experience: experienceElement?.value || '',
            timestamp: new Date().toISOString()
        };
    }

    restoreFormData() {
        try {
            const saved = localStorage.getItem('cryptoAdvisorFormData');
            if (saved) {
                const data = JSON.parse(saved);
                
                // Restore name safely
                const nameElement = document.getElementById('name');
                if (nameElement && data.name) {
                    nameElement.value = data.name;
                }
                
                // Restore objective safely
                const objectiveElement = document.getElementById('objective');
                if (objectiveElement && data.objective) {
                    objectiveElement.value = data.objective;
                }
                
                // Restore risk radio safely
                if (data.risk) {
                    const riskRadio = document.querySelector(`input[name="risk"][value="${data.risk}"]`);
                    if (riskRadio) {
                        riskRadio.checked = true;
                    }
                }
                
                // Restore amount safely
                const amountElement = document.getElementById('amount');
                if (amountElement && data.amount) {
                    amountElement.value = data.amount;
                }
                
                // Restore experience radio safely
                if (data.experience) {
                    const expRadio = document.querySelector(`input[name="experience"][value="${data.experience}"]`);
                    if (expRadio) {
                        expRadio.checked = true;
                    }
                }
                
                this.updateButtonStates();
                console.log('📂 Form data restored:', data);
            }
        } catch (error) {
            console.warn('⚠️ Error restoring form data:', error);
            localStorage.removeItem('cryptoAdvisorFormData'); // Clear corrupted data
        }
    }

    handleSelectClick(select) {
        // Ensure the select is properly focused and opens
        if (document.activeElement !== select) {
            select.focus();
        }
        
        // Add visual feedback
        const wrapper = select.closest('.select-wrapper');
        if (wrapper) {
            wrapper.classList.add('select-active');
        }
    }

    handleSelectChange(select, value) {
        console.log(`Select changed: ${select.name} = ${value}`);
        
        // Update visual state
        const wrapper = select.closest('.select-wrapper');
        if (wrapper) {
            if (value) {
                wrapper.classList.add('has-value');
            } else {
                wrapper.classList.remove('has-value');
            }
        }
    }

    handleSelectFocus(select) {
        const wrapper = select.closest('.select-wrapper');
        if (wrapper) {
            wrapper.classList.add('select-focused');
        }
    }

    handleSelectBlur(select) {
        const wrapper = select.closest('.select-wrapper');
        if (wrapper) {
            wrapper.classList.remove('select-focused', 'select-active');
        }
    }

    handleSelectKeydown(select, e) {
        // Enhanced keyboard navigation
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            this.handleSelectClick(select);
        }
    }

    // Tooltip System
    setupTooltips() {
        const tooltipTriggers = document.querySelectorAll('.tooltip');
        const tooltipContainer = document.getElementById('tooltip');
        const tooltipContent = document.getElementById('tooltip-content');

        tooltipTriggers.forEach(trigger => {
            trigger.addEventListener('mouseenter', (e) => {
                const text = e.target.getAttribute('data-tooltip');
                if (text) {
                    this.showTooltip(text, e.target);
                }
            });

            trigger.addEventListener('mouseleave', () => {
                this.hideTooltip();
            });

            // Touch support for mobile
            trigger.addEventListener('touchstart', (e) => {
                e.preventDefault();
                const text = e.target.getAttribute('data-tooltip');
                if (text) {
                    this.showTooltip(text, e.target);
                    
                    // Auto-hide after 3 seconds on mobile
                    setTimeout(() => {
                        this.hideTooltip();
                    }, 3000);
                }
            });
        });

        console.log('✅ Tooltip system initialized for', tooltipTriggers.length, 'elements');
    }

    showTooltip(text, trigger) {
        const tooltipContainer = document.getElementById('tooltip');
        const tooltipContent = document.getElementById('tooltip-content');
        
        tooltipContent.textContent = text;
        tooltipContainer.classList.remove('hidden');
        
        // Position tooltip
        const rect = trigger.getBoundingClientRect();
        const tooltipRect = tooltipContainer.getBoundingClientRect();
        
        let left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
        let top = rect.top - tooltipRect.height - 10;
        
        // Adjust if tooltip goes off screen
        if (left < 10) left = 10;
        if (left + tooltipRect.width > window.innerWidth - 10) {
            left = window.innerWidth - tooltipRect.width - 10;
        }
        if (top < 10) {
            top = rect.bottom + 10;
        }
        
        tooltipContainer.style.left = `${left}px`;
        tooltipContainer.style.top = `${top}px`;
    }

    hideTooltip() {
        const tooltipContainer = document.getElementById('tooltip');
        tooltipContainer.classList.add('hidden');
    }

    setupProgressTracking() {
        const requiredFields = ['objective', 'risk'];
        const progressBar = document.getElementById('progress-fill');
        const progressText = document.getElementById('progress-text');

        requiredFields.forEach(fieldName => {
            const field = document.getElementById(fieldName) || 
                         document.querySelector(`input[name="${fieldName}"]`);
            
            if (field) {
                if (field.type === 'radio') {
                    document.querySelectorAll(`input[name="${fieldName}"]`).forEach(radio => {
                        radio.addEventListener('change', () => this.updateProgress());
                    });
                } else {
                    field.addEventListener('change', () => this.updateProgress());
                }
            }
        });
    }

    updateProgress() {
        const requiredFields = ['objective', 'risk'];
        let completed = 0;

        requiredFields.forEach(fieldName => {
            if (fieldName === 'risk') {
                if (document.querySelector('input[name="risk"]:checked')) {
                    completed++;
                }
            } else {
                const field = document.getElementById(fieldName);
                if (field && field.value) {
                    completed++;
                }
            }
        });

        const percentage = Math.round((completed / requiredFields.length) * 100);
        
        document.getElementById('progress-fill').style.width = `${percentage}%`;
        document.getElementById('progress-text').textContent = `${percentage}% completo`;
    }

    async handleFormSubmission() {
        const submitButton = document.querySelector('.submit-button');
        const submitText = document.querySelector('.submit-text');
        const loadingText = document.querySelector('.loading-text');

        // Verify submit button exists
        if (!submitButton) {
            console.error('❌ Submit button not found');
            alert('Erro: Botão de envio não encontrado. Recarregue a página.');
            return;
        }

        // Show loading state
        submitButton.disabled = true;
        if (submitText) submitText.classList.add('hidden');
        if (loadingText) loadingText.classList.remove('hidden');

        try {
            // Collect form data with detailed validation
            this.formData = this.collectFormData();
            console.log('📋 Form data collected:', this.formData);
            
            // Enhanced validation with specific error messages
            const validation = this.validateFormDetailed();
            if (!validation.isValid) {
                throw new Error(validation.message);
            }

            // Calculate profile with delay for UX
            await this.delay(1500);
            
            this.userProfile = this.calculateProfile(this.formData);
            console.log('🎯 Profile calculated:', this.userProfile);
            
            // Track profile calculation with analytics
            if (window.cryptoFeatures?.analytics) {
                window.cryptoFeatures.analytics.trackProfileCalculation({
                    profile: this.userProfile.type,
                    objective: this.formData.objective,
                    risk: this.formData.risk,
                    amount: this.formData.amount,
                    experience: this.formData.experience,
                    allocation: this.userProfile.allocation
                });
            }
            
            // Verify profile was calculated successfully
            if (!this.userProfile || !this.userProfile.type) {
                throw new Error('Erro no cálculo do perfil. Verifique suas respostas.');
            }
            
            // Save data
            this.saveData();
            
            // Show results
            this.showResults();
            
        } catch (error) {
            console.error('❌ Form submission error:', error);
            
            // User-friendly error messages
            let errorMessage = 'Ocorreu um erro. Tente novamente.';
            if (error.message.includes('campos obrigatórios')) {
                errorMessage = error.message;
            } else if (error.message.includes('perfil')) {
                errorMessage = error.message;
            }
            
            alert(errorMessage);
        } finally {
            // Reset button state safely
            if (submitButton) {
                submitButton.disabled = false;
            }
            if (submitText) submitText.classList.remove('hidden');
            if (loadingText) loadingText.classList.add('hidden');
        }
    }

    validateFormDetailed() {
        const { objective, risk } = this.formData;
        
        if (!objective) {
            return {
                isValid: false,
                message: 'Por favor, selecione seu objetivo de investimento (Passo 1).'
            };
        }
        
        if (!risk) {
            return {
                isValid: false,
                message: 'Por favor, selecione sua tolerância a risco (Passo 2).'
            };
        }
        
        return {
            isValid: true,
            message: 'Formulário válido'
        };
    }

    collectFormData() {
        // Get elements safely
        const nameElement = document.getElementById('name');
        const objectiveElement = document.getElementById('objective');
        const riskElement = document.querySelector('input[name="risk"]:checked');
        const amountElement = document.getElementById('amount');
        const experienceElement = document.querySelector('input[name="experience"]:checked');

        // Log element availability for debugging
        console.log('📋 Form elements found:', {
            name: !!nameElement,
            objective: !!objectiveElement,
            risk: !!riskElement,
            amount: !!amountElement,
            experience: !!experienceElement
        });

        // Collect values safely with null checks
        return {
            name: nameElement?.value?.trim() || '',
            objective: objectiveElement?.value || '',
            risk: riskElement?.value || '',
            amount: amountElement?.value || '',
            experience: experienceElement?.value || '',
            timestamp: new Date().toISOString()
        };
    }

    validateForm() {
        const { objective, risk } = this.formData;
        return objective && risk;
    }

    calculateProfile(data) {
        const { objective, risk, amount, experience } = data;
        
        // Use A/B testing for allocation if available
        let allocation = null;
        if (window.cryptoFeatures?.abTesting) {
            const baseProfile = this.determineBaseProfile(objective, risk);
            allocation = window.cryptoFeatures.abTesting.getPortfolioAllocation(baseProfile, objective, risk);
        }
        
        // Profile determination logic based on specifications
        let profileType = 'moderado';
        let horizon = 'moderado';
        let alert = null;

        // Decision matrix (all 9 combinations)
        if (objective === 'curtissimo' && risk === 'alto') {
            profileType = 'arrojado';
            horizon = 'curto';
        } else if (objective === 'curtissimo' && risk === 'baixo') {
            profileType = 'moderado';
            horizon = 'curto';
            alert = 'Alerta: Trading de curto prazo envolve alto risco';
        } else if (objective === 'curtissimo' && risk === 'medio') {
            profileType = 'moderado';
            horizon = 'curto';
        } else if (objective === 'moderado' && risk === 'baixo') {
            profileType = 'conservador';
            horizon = 'moderado';
        } else if (objective === 'moderado' && risk === 'medio') {
            profileType = 'moderado';
            horizon = 'moderado';
        } else if (objective === 'moderado' && risk === 'alto') {
            profileType = 'arrojado';
            horizon = 'moderado';
            alert = 'Atenção à volatilidade';
        } else if (objective === 'longo' && risk === 'baixo') {
            profileType = 'conservador';
            horizon = 'longo';
        } else if (objective === 'longo' && risk === 'medio') {
            profileType = 'moderado';
            horizon = 'longo';
        } else if (objective === 'longo' && risk === 'alto') {
            profileType = 'arrojado';
            horizon = 'longo';
        }

        // Base allocations (100% Crypto)
        const baseAllocations = {
            conservador: {
                BTC: 70, ETH: 13, XRP: 7, PENDLE: 5, BNB: 3, SOL: 2
            },
            moderado: {
                BTC: 50, ETH: 20, BNB: 10, SOL: 8, XRP: 7, PENDLE: 5
            },
            arrojado: {
                ETH: 35, SPX6900: 20, BNB: 15, SOL: 15, XRP: 8, PENDLE: 7
                // Note: No BTC intentionally - reflects higher risk appetite with memecoins
            }
        };

        // Use A/B test allocation if available, otherwise use base allocation
        if (!allocation) {
            allocation = { ...baseAllocations[profileType] };
        }

        // Horizon adjustments
        if (horizon === 'curto') {
            // +5% ETH, -5% distributed proportionally across other alts
            allocation.ETH += 5;
            const otherAssets = Object.keys(allocation).filter(asset => asset !== 'ETH');
            const reduction = 5 / otherAssets.length;
            otherAssets.forEach(asset => {
                allocation[asset] = Math.max(0, allocation[asset] - reduction);
            });
        } else if (horizon === 'longo') {
            // +5% ETH, -5% BTC (only when BTC is present)
            if (allocation.BTC) {
                allocation.BTC -= 5;
                allocation.ETH += 5;
            } else {
                // No BTC, distribute -5% proportionally among other coins
                allocation.ETH += 5;
                const otherAssets = Object.keys(allocation).filter(asset => asset !== 'ETH');
                const reduction = 5 / otherAssets.length;
                otherAssets.forEach(asset => {
                    allocation[asset] = Math.max(0, allocation[asset] - reduction);
                });
            }
        }

        // Normalize to 100%
        allocation = this.normalizeAllocation(allocation);

        // Profile configurations
        const profiles = {
            conservador: {
                emoji: '🛡️',
                label: 'HOLDER',
                description: 'Você prioriza segurança e estabilidade, focando em Bitcoin e Ethereum como reservas de valor digitais.',
                tips: [
                    'Foque em BTC e ETH como base segura do seu portfólio',
                    'Use ordens limitadas para controlar melhor os preços',
                    'Evite alavancagem - priorize a preservação do capital',
                    'Considere estratégia HODL para reduzir stress de mercado'
                ]
            },
            moderado: {
                emoji: '⚖️',
                label: 'TRADER DE MÉDIO PRAZO',
                description: 'Você equilibra segurança com oportunidades de crescimento, focando em criptomoedas consolidadas.',
                tips: [
                    'Implemente take profit e stop loss para gerir riscos',
                    'Reequilibre sua carteira mensalmente ou trimestralmente',
                    'Diversifique entre ETH, BNB, SOL e XRP para reduzir volatilidade',
                    'Monitore tendências de médio prazo antes de ajustar posições'
                ]
            },
            arrojado: {
                emoji: '🚀',
                label: 'TRADER DE CURTO PRAZO',
                description: 'Você busca máximo retorno através de alta volatilidade, focando em altcoins e memecoins promissoras.',
                tips: [
                    'Gerencie rigorosamente o tamanho das posições (position sizing)',
                    'Tenha disciplina com stop loss - alta volatilidade exige controle',
                    'SPX6900 é memecoin: mantenha % controlado e monitore closely',
                    'Evite "all-in" - diversifique mesmo em perfil agressivo'
                ]
            }
        };

        const profile = profiles[profileType];

        // Add experience-based tips
        if (experience === 'iniciante') {
            profile.tips.push('Como iniciante, comece com valores pequenos para aprender');
        } else if (experience === 'avancado') {
            profile.tips.push('Use sua experiência para análise técnica mais sofisticada');
        }

        // Add amount-based tips
        if (amount === 'baixo') {
            profile.tips.push('Com valores menores, use exchanges com taxas baixas');
        } else if (amount === 'alto') {
            profile.tips.push('Com valores maiores, considere custódia hardware para segurança');
        }

        return {
            type: profileType,
            horizon,
            allocation,
            alert,
            ...profile
        };
    }

    determineBaseProfile(objective, risk) {
        // Determine base profile for A/B testing
        if (objective === 'longo' && risk === 'baixo') {
            return 'conservador';
        } else if (objective === 'curtissimo' && risk === 'alto') {
            return 'arrojado';
        } else if ((objective === 'moderado' && risk === 'alto') || 
                   (objective === 'longo' && risk === 'alto')) {
            return 'arrojado';
        } else {
            return 'moderado';
        }
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
            normalized[asset] = Math.round((allocation[asset] / total) * 100 * 10) / 10;
            runningTotal += normalized[asset];
        }

        // Last asset gets remainder to ensure exactly 100%
        const lastAsset = assets[assets.length - 1];
        normalized[lastAsset] = Math.round((100 - runningTotal) * 10) / 10;

        return normalized;
    }

    showResults() {
        this.populateProfileCard();
        this.populatePortfolioCard();
        this.populateSummaryCard();
        this.populateTipsCard();
        
        // Add compact layout enhancements
        setTimeout(() => {
            this.enhancePortfolioDisplay(this.userProfile.allocation);
            document.querySelector('.results-container')?.classList.add('compact-layout');
        }, 1000); // Allow time for initial portfolio display
        
        this.showSection('results');
        
        // Smooth scroll to results with delay
        setTimeout(() => {
            document.getElementById('results').scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
            });
        }, 300);

        console.log('📊 Results displayed');
    }

    populateProfileCard() {
        const { emoji, type, label, description, alert } = this.userProfile;
        
        document.getElementById('profile-emoji').textContent = emoji;
        document.getElementById('profile-name').textContent = this.capitalize(type);
        document.getElementById('profile-label').textContent = label;
        document.getElementById('profile-description').textContent = description;
        
        const alertContainer = document.getElementById('alert-container');
        if (alert) {
            alertContainer.textContent = `⚠️ ${alert}`;
            alertContainer.classList.add('show');
        } else {
            alertContainer.classList.remove('show');
        }
    }

    populatePortfolioCard() {
        const { allocation } = this.userProfile;
        const container = document.getElementById('allocation-container');
        
        container.innerHTML = '';

        // Crypto colors and order
        const cryptoColors = {
            BTC: '#f7931a',
            ETH: '#627eea',
            BNB: '#f3ba2f',
            SOL: '#9945ff',
            XRP: '#23292f',
            PENDLE: '#ff6b9d',
            SPX6900: '#8b5cf6'
        };

        // Sort by percentage descending
        const sortedAllocation = Object.entries(allocation)
            .filter(([, percentage]) => percentage > 0)
            .sort(([, a], [, b]) => b - a);

        // Create pie chart
        this.createPortfolioChart(sortedAllocation, cryptoColors);

        sortedAllocation.forEach(([crypto, percentage], index) => {
            const item = document.createElement('div');
            item.className = 'allocation-item';
            
            item.innerHTML = `
                <div class="crypto-symbol" data-crypto="${crypto}">${crypto}</div>
                <div class="crypto-info">
                    <div class="crypto-price">Carregando...</div>
                    <div class="crypto-change">—</div>
                </div>
                <div class="allocation-bar">
                    <div class="allocation-fill" style="width: 0%; background: ${cryptoColors[crypto] || '#667eea'};"></div>
                </div>
                <div class="allocation-percentage">${percentage}%</div>
            `;
            
            // Set CSS custom properties for hover effects
            item.style.setProperty('--allocation-color', cryptoColors[crypto] || '#667eea');
            
            container.appendChild(item);
            
            // Animate bar with staggered delay
            setTimeout(() => {
                const fill = item.querySelector('.allocation-fill');
                fill.style.width = `${percentage}%`;
                
                // Add entrance animation
                item.style.opacity = '0';
                item.style.transform = 'translateX(-20px)';
                
                setTimeout(() => {
                    item.style.transition = 'all 0.5s ease';
                    item.style.opacity = '1';
                    item.style.transform = 'translateX(0)';
                }, index * 100);
            }, 200);
        });
        
        // Load real-time prices after initial display
        this.loadRealtimePrices(sortedAllocation);
    }

    createPortfolioChart(sortedAllocation, cryptoColors) {
        const ctx = document.getElementById('portfolioChart');
        if (!ctx || !window.Chart) {
            console.warn('Chart.js not loaded or canvas not found');
            return;
        }

        // Destroy existing chart if it exists
        if (this.portfolioChart) {
            this.portfolioChart.destroy();
        }

        const labels = sortedAllocation.map(([crypto]) => crypto);
        const data = sortedAllocation.map(([, percentage]) => percentage);
        const backgroundColors = sortedAllocation.map(([crypto]) => cryptoColors[crypto] || '#667eea');

        this.portfolioChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: backgroundColors,
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                    borderWidth: 2,
                    hoverBorderColor: 'rgba(255, 255, 255, 0.4)',
                    hoverBorderWidth: 3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                cutout: '60%',
                plugins: {
                    legend: {
                        display: false // We'll use our own legend with the allocation bars
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff',
                        borderColor: 'rgba(255, 255, 255, 0.2)',
                        borderWidth: 1,
                        cornerRadius: 8,
                        displayColors: true,
                        callbacks: {
                            label: function(context) {
                                return `${context.label}: ${context.parsed}%`;
                            }
                        }
                    }
                },
                animation: {
                    animateRotate: true,
                    duration: 2000,
                    easing: 'easeInOutQuart'
                },
                interaction: {
                    intersect: false
                }
            }
        });

        console.log('📊 Portfolio chart created');
    }
    
    async loadRealtimePrices(sortedAllocation) {
        if (!window.cryptoFeatures?.priceAPI) {
            console.log('💰 Price API not available, skipping real-time prices');
            return;
        }
        
        try {
            const cryptoSymbols = sortedAllocation.map(([crypto]) => crypto);
            const cryptoIds = cryptoSymbols.map(symbol => 
                window.cryptoFeatures.priceAPI.symbolToId(symbol)
            );
            
            console.log('💰 Loading real-time prices for:', cryptoSymbols);
            const prices = await window.cryptoFeatures.priceAPI.getPrices(cryptoIds);
            
            if (prices) {
                this.updatePriceDisplay(cryptoSymbols, prices);
            }
        } catch (error) {
            console.error('❌ Error loading real-time prices:', error);
        }
    }
    
    updatePriceDisplay(cryptoSymbols, prices) {
        cryptoSymbols.forEach(symbol => {
            const cryptoId = window.cryptoFeatures.priceAPI.symbolToId(symbol);
            const priceData = prices[cryptoId];
            
            if (priceData) {
                const element = document.querySelector(`[data-crypto="${symbol}"]`);
                if (element) {
                    const priceElement = element.parentNode.querySelector('.crypto-price');
                    const changeElement = element.parentNode.querySelector('.crypto-change');
                    
                    if (priceElement) {
                        const formatted = window.cryptoFeatures.priceAPI.formatPrice(priceData.brl || 0);
                        priceElement.textContent = formatted;
                    }
                    
                    if (changeElement && priceData.usd_24h_change !== undefined) {
                        const change = window.cryptoFeatures.priceAPI.formatChange(priceData.usd_24h_change);
                        changeElement.textContent = change.text;
                        changeElement.className = `crypto-change ${change.color}`;
                    }
                }
            }
        });
        
        console.log('💰 Price display updated');
    }

    // Enhanced Portfolio Display with Compact Layout
    async enhancePortfolioDisplay(allocation) {
        try {
            if (!window.cryptoFeatures?.priceAPI) {
                console.log('💰 Price API not available for enhancement');
                return;
            }

            const prices = await window.cryptoFeatures.priceAPI.getPrices();
            const portfolioContainer = document.querySelector('#allocation-container');
            
            if (!portfolioContainer) return;
            
            // Add compact layout class
            portfolioContainer.classList.add('compact-portfolio');
            
            // Update each allocation item with enhanced price data
            Object.entries(allocation).forEach(([crypto, percentage]) => {
                const cryptoElement = portfolioContainer.querySelector(`[data-crypto="${crypto}"]`);
                if (!cryptoElement) return;
                
                const cryptoPrice = this.getCryptoPrice(prices, crypto);
                const priceChange = this.getCryptoPriceChange(prices, crypto);
                
                // Find existing price elements or create them
                let priceElement = cryptoElement.parentNode.querySelector('.crypto-price');
                let changeElement = cryptoElement.parentNode.querySelector('.crypto-change');
                
                if (priceElement && changeElement) {
                    // Update existing elements with enhanced formatting
                    priceElement.textContent = `R$ ${cryptoPrice.toLocaleString('pt-BR', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: cryptoPrice < 1 ? 6 : 2
                    })}`;
                    
                    changeElement.textContent = `${priceChange >= 0 ? '+' : ''}${priceChange.toFixed(2)}%`;
                    changeElement.className = `crypto-change ${priceChange >= 0 ? 'positive' : 'negative'}`;
                }
            });
            
            // Add compact layout indicator
            portfolioContainer.setAttribute('data-enhanced', 'true');
            
            console.log('✨ Portfolio display enhanced with compact layout');
        } catch (error) {
            console.error('❌ Error enhancing portfolio display:', error);
        }
    }

    getCryptoPrice(prices, crypto) {
        const cryptoMap = {
            'BTC': 'bitcoin', 'ETH': 'ethereum', 'SOL': 'solana',
            'BNB': 'binancecoin', 'XRP': 'ripple', 'PENDLE': 'pendle', 'SPX6900': 'spx6900'
        };
        const cryptoId = cryptoMap[crypto];
        return prices[cryptoId]?.brl || 0;
    }

    getCryptoPriceChange(prices, crypto) {
        const cryptoMap = {
            'BTC': 'bitcoin', 'ETH': 'ethereum', 'SOL': 'solana',
            'BNB': 'binancecoin', 'XRP': 'ripple', 'PENDLE': 'pendle', 'SPX6900': 'spx6900'
        };
        const cryptoId = cryptoMap[crypto];
        return prices[cryptoId]?.usd_24h_change || 0;
    }

    // Enhanced Portfolio HTML Structure
    updatePortfolioHTML(allocation) {
        const container = document.getElementById('allocation-container');
        if (!container) return;
        
        container.innerHTML = '';
        container.className = 'portfolio-allocation compact-layout';
        
        Object.entries(allocation)
            .filter(([, percentage]) => percentage > 0)
            .sort(([, a], [, b]) => b - a)
            .forEach(([crypto, percentage]) => {
                const item = document.createElement('div');
                item.className = 'crypto-item';
                item.setAttribute('data-crypto', crypto);
                item.innerHTML = `
                    <div class="crypto-info">
                        <span class="crypto-symbol" data-crypto="${crypto}">${crypto}</span>
                        <span class="crypto-percentage">${percentage}%</span>
                    </div>
                    <div class="crypto-price-info">
                        <span class="crypto-price">Carregando...</span>
                        <span class="crypto-change">—</span>
                    </div>
                `;
                container.appendChild(item);
            });
    }

    populateSummaryCard() {
        const container = document.getElementById('summary-grid');
        const { name, objective, risk, amount, experience } = this.formData;
        
        const labels = {
            objective: {
                curtissimo: 'Curtíssimo prazo (1-7 dias)',
                moderado: 'Moderado (4-9 semanas)',
                longo: 'Longo prazo (1+ anos)'
            },
            risk: {
                baixo: 'Baixo - Prefiro segurança',
                medio: 'Médio - Aceito algum risco',
                alto: 'Alto - Busco máximo retorno'
            },
            amount: {
                baixo: 'Até R$ 1.000',
                'medio-baixo': 'R$ 1.000 - R$ 10.000',
                'medio-alto': 'R$ 10.000 - R$ 50.000',
                alto: 'Mais de R$ 50.000'
            },
            experience: {
                iniciante: 'Iniciante',
                intermediario: 'Intermediário',
                avancado: 'Avançado'
            }
        };

        const summaryData = [
            { label: 'Objetivo', value: labels.objective[objective] },
            { label: 'Tolerância a risco', value: labels.risk[risk] }
        ];

        if (name) {
            summaryData.unshift({ label: 'Nome', value: name });
        }

        if (amount) {
            summaryData.push({ label: 'Valor para investir', value: labels.amount[amount] });
        }

        if (experience) {
            summaryData.push({ label: 'Experiência', value: labels.experience[experience] });
        }

        container.innerHTML = summaryData.map(item => `
            <div class="summary-item">
                <span class="summary-label">${item.label}:</span>
                <span class="summary-value">${item.value}</span>
            </div>
        `).join('');
    }

    populateTipsCard() {
        const { tips } = this.userProfile;
        const container = document.getElementById('tips-list');
        
        container.innerHTML = tips.map(tip => `<li>${tip}</li>`).join('');
    }

    shareWhatsApp() {
        const { type, label, horizon, allocation } = this.userProfile;
        const { name } = this.formData;
        
        const greeting = name ? `*${name}*, confira` : 'Confira';
        
        let allocationText = '';
        Object.entries(allocation)
            .filter(([, percentage]) => percentage > 0)
            .sort(([, a], [, b]) => b - a)
            .forEach(([crypto, percentage]) => {
                allocationText += `• ${crypto}: ${percentage}%\n`;
            });

        const text = `🚀 *${greeting} meu Perfil de Investidor Cripto*

📊 *Perfil:* ${this.capitalize(type)} (${label})
⏱️ *Horizonte:* ${this.capitalize(horizon)}

💰 *Carteira Recomendada:*
${allocationText}
✅ Análise completa em: ${window.location.href}

#CriptoTrading #InvestirEmCripto`;

        const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
        window.open(url, '_blank');

        // Track WhatsApp share
        if (window.cryptoFeatures?.analytics) {
            window.cryptoFeatures.analytics.trackEvent('whatsapp_share', {
                profile: type,
                hasName: !!name
            });
        }

        console.log('📱 WhatsApp share initiated');
    }

    saveToDevice() {
        const data = {
            userProfile: this.userProfile,
            formData: this.formData,
            timestamp: new Date().toISOString()
        };

        // Save to localStorage
        localStorage.setItem('cryptoAdvisorResults', JSON.stringify(data));

        // Create downloadable JSON
        const blob = new Blob([JSON.stringify(data, null, 2)], { 
            type: 'application/json' 
        });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `perfil-cripto-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        // Track save to device
        if (window.cryptoFeatures?.analytics) {
            window.cryptoFeatures.analytics.trackEvent('save_to_device', {
                profile: this.userProfile.type,
                format: 'json'
            });
        }

        alert('💾 Resultado salvo com sucesso!');
        console.log('💾 Results saved to device');
    }

    restartAnalysis() {
        try {
            console.log('🔄 Starting analysis restart...');
            
            // 1. Reset form safely
            const form = document.getElementById('crypto-form');
            if (form) {
                form.reset();
            } else {
                console.warn('⚠️ Form not found, clearing fields individually');
                this.clearFormFieldsIndividually();
            }
            
            // 2. Clear application data
            this.userProfile = null;
            this.formData = {};
            this.currentStep = 1;
            
            // 3. Clear localStorage completely
            this.clearAllStoredData();
            
            // 4. Reset all UI states
            this.resetUIStates();
            
            // 5. Reset step navigation
            this.resetStepNavigation();
            
            // 6. Show landing page
            this.showSection('landing');
            
            // 7. Smooth scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });
            
            // 8. Update progress indicators
            this.updateProgress();
            
            console.log('✅ Analysis restarted successfully');
            
        } catch (error) {
            console.error('❌ Error during analysis restart:', error);
            
            // Fallback: Hard refresh if restart fails
            if (confirm('Ocorreu um erro ao reiniciar. Deseja recarregar a página?')) {
                window.location.reload();
            }
        }
    }

    clearFormFieldsIndividually() {
        // Clear all form fields manually as backup
        const fieldIds = ['name', 'objective', 'amount'];
        
        fieldIds.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.value = '';
                if (element.tagName === 'SELECT') {
                    element.selectedIndex = 0;
                }
            }
        });

        // Clear radio buttons
        const radioGroups = ['risk', 'experience'];
        radioGroups.forEach(group => {
            const radios = document.querySelectorAll(`input[name="${group}"]`);
            radios.forEach(radio => {
                radio.checked = false;
            });
        });
    }

    clearAllStoredData() {
        // Clear all related localStorage items
        const keysToRemove = [
            'cryptoAdvisorFormData',
            'cryptoAdvisorData',
            'cryptoAdvisorResults',
            'consultor-financeiro-dados',
            'consultor-financeiro-resultado'
        ];

        keysToRemove.forEach(key => {
            localStorage.removeItem(key);
        });

        console.log('🗑️ All stored data cleared');
    }

    resetUIStates() {
        // Reset dropdown states
        document.querySelectorAll('.select-wrapper').forEach(wrapper => {
            wrapper.classList.remove('has-value', 'select-focused', 'select-active');
        });

        // Reset radio button states
        document.querySelectorAll('.radio-option').forEach(option => {
            option.classList.remove('selected', 'active');
        });

        // Reset button states
        const continueButton = document.getElementById('continue-button');
        const submitButton = document.getElementById('submit-button');
        
        if (continueButton) {
            continueButton.classList.add('disabled');
            continueButton.classList.remove('hidden');
        }
        
        if (submitButton) {
            submitButton.classList.add('hidden');
        }

        console.log('🎨 UI states reset');
    }

    resetStepNavigation() {
        // Reset all step states
        document.querySelectorAll('.form-step').forEach(step => {
            step.classList.remove('active');
        });

        // Show first step
        const firstStep = document.querySelector('[data-step="1"]');
        if (firstStep) {
            firstStep.classList.add('active');
        }

        // Reset step indicators
        this.currentStep = 1;
        this.updateStepDisplay();
        this.updateButtonStates();

        console.log('📄 Step navigation reset');
    }

    showSection(sectionName) {
        // Hide all sections (updated for new IDs)
        const sections = ['landing', 'questionnaire', 'questionnaire-section', 'results'];
        sections.forEach(section => {
            const element = document.getElementById(section);
            if (element) {
                element.classList.add('hidden');
            }
        });
        
        // Map old section names to new IDs if needed
        const sectionMap = {
            'questionnaire': 'questionnaire-section'
        };
        
        const targetId = sectionMap[sectionName] || sectionName;
        const targetElement = document.getElementById(targetId);
        
        if (targetElement) {
            targetElement.classList.remove('hidden');
            this.currentSection = sectionName;
        } else {
            console.warn(`Section ${targetId} not found`);
        }

        // Initialize step navigation for questionnaire
        if (sectionName === 'questionnaire') {
            this.currentStep = 1;
            this.restoreFormData();
            this.updateStepDisplay();
            this.updateButtonStates();
            
            // Show only first step
            document.querySelectorAll('.form-step').forEach(step => {
                step.classList.remove('active');
            });
            document.querySelector('[data-step="1"]').classList.add('active');
        }

        console.log(`📄 Section switched to: ${sectionName}`);
    }

    saveData() {
        const data = {
            userProfile: this.userProfile,
            formData: this.formData,
            timestamp: new Date().toISOString()
        };
        
        localStorage.setItem('cryptoAdvisorData', JSON.stringify(data));
        console.log('💾 Data saved to localStorage');
    }

    loadSavedData() {
        try {
            const saved = localStorage.getItem('cryptoAdvisorData');
            if (saved) {
                const data = JSON.parse(saved);
                
                // Only load if recent (within 24 hours)
                const savedTime = new Date(data.timestamp);
                const now = new Date();
                const hoursDiff = (now - savedTime) / (1000 * 60 * 60);
                
                if (hoursDiff < 24) {
                    this.userProfile = data.userProfile;
                    this.formData = data.formData;
                    console.log('📂 Saved data loaded');
                    
                    // Restore form data
                    this.restoreFormData();
                } else {
                    console.log('📂 Saved data expired, clearing');
                    localStorage.removeItem('cryptoAdvisorData');
                }
            }
        } catch (error) {
            console.warn('⚠️ Error loading saved data:', error);
        }
    }

    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // ===== UNIFIED FORM HANDLING =====

    handleUnifiedFormSubmission() {
        console.log('📝 Processing unified form submission');
        
        // Collect form data
        const formData = {
            nome: document.getElementById('nome').value || 'Usuário',
            objetivo: document.getElementById('objetivo').value,
            tolerancia: document.querySelector('[name="tolerancia"]:checked')?.value,
            valor: document.getElementById('valor').value,
            experiencia: document.getElementById('experiencia').value
        };

        // Validate required fields
        if (!formData.objetivo || !formData.tolerancia) {
            alert('Por favor, preencha o objetivo e tolerância a risco.');
            return;
        }

        // Store form data
        this.formData = {
            name: formData.nome,
            objective: formData.objetivo,
            risk: formData.tolerancia,
            amount: formData.valor,
            experience: formData.experiencia
        };

        // Update progress
        this.updateUnifiedProgress(100);
        document.getElementById('progress-text').textContent = 'Passo 2 de 2';

        // Track form completion
        if (window.cryptoFeatures?.analytics) {
            window.cryptoFeatures.analytics.trackFormStep('unified_form_completed', {
                formData: this.formData
            });
        }

        // Show review section
        setTimeout(() => {
            this.showReviewSection();
        }, 500);
    }

    updateUnifiedProgress(percentage) {
        const progressFill = document.getElementById('progress-fill');
        if (progressFill) {
            progressFill.style.width = percentage + '%';
        }
    }

    showReviewSection() {
        console.log('📋 Showing review section');
        
        // Hide questionnaire
        document.getElementById('questionnaire-section').classList.add('hidden');
        
        // Show review with collected data
        const reviewSection = document.getElementById('review-section');
        reviewSection.classList.remove('hidden');
        
        // Populate review data
        this.populateUnifiedReviewData();
    }

    showUnifiedForm() {
        console.log('📝 Showing unified form');
        
        // Hide review section
        document.getElementById('review-section').classList.add('hidden');
        
        // Show questionnaire
        document.getElementById('questionnaire-section').classList.remove('hidden');
        
        // Reset progress
        this.updateUnifiedProgress(0);
        document.getElementById('progress-text').textContent = 'Passo 1 de 2';
    }

    populateUnifiedReviewData() {
        console.log('📊 Populating review data:', this.formData);
        
        // Update review fields with form data
        const reviewFields = {
            nome: this.formData.name,
            objetivo: this.getObjectiveText(this.formData.objective),
            tolerancia: this.getToleranceText(this.formData.risk),
            valor: this.getAmountText(this.formData.amount),
            experiencia: this.getExperienceText(this.formData.experience)
        };

        Object.keys(reviewFields).forEach(field => {
            const element = document.querySelector(`[data-field="${field}"]`);
            if (element) {
                element.textContent = reviewFields[field];
            }
        });

        // Show any validation alerts
        this.showUnifiedValidationAlerts();
    }

    async handleFinalSubmission() {
        console.log('🚀 Processing final submission');
        
        const submitButton = document.getElementById('submit-analysis');
        const submitText = submitButton?.querySelector('.submit-text');
        const loadingText = submitButton?.querySelector('.loading-text');

        if (!submitButton) {
            console.error('❌ Submit button not found');
            alert('Erro: Botão de envio não encontrado. Recarregue a página.');
            return;
        }

        // Show loading state
        submitButton.disabled = true;
        if (submitText) submitText.classList.add('hidden');
        if (loadingText) loadingText.classList.remove('hidden');

        try {
            // Enhanced validation
            const validation = this.validateFormDetailed();
            if (!validation.isValid) {
                throw new Error(validation.message);
            }

            // Calculate profile with delay for UX
            await this.delay(1500);
            
            this.userProfile = this.calculateProfile(this.formData);
            console.log('🎯 Profile calculated:', this.userProfile);
            
            // Track profile calculation
            if (window.cryptoFeatures?.analytics) {
                window.cryptoFeatures.analytics.trackProfileCalculation({
                    profile: this.userProfile.type,
                    objective: this.formData.objective,
                    risk: this.formData.risk,
                    amount: this.formData.amount,
                    experience: this.formData.experience,
                    allocation: this.userProfile.allocation
                });
            }
            
            // Verify profile was calculated successfully
            if (!this.userProfile || !this.userProfile.type) {
                throw new Error('Erro no cálculo do perfil. Verifique suas respostas.');
            }
            
            // Save data
            this.saveData();
            
            // Show results
            this.showResults();
            
        } catch (error) {
            console.error('❌ Final submission error:', error);
            
            // User-friendly error messages
            let errorMessage = 'Ocorreu um erro. Tente novamente.';
            if (error.message.includes('campos obrigatórios')) {
                errorMessage = error.message;
            } else if (error.message.includes('perfil')) {
                errorMessage = error.message;
            }
            
            alert(errorMessage);
        } finally {
            // Reset button state
            if (submitButton) {
                submitButton.disabled = false;
            }
            if (submitText) submitText.classList.remove('hidden');
            if (loadingText) loadingText.classList.add('hidden');
        }
    }

    showUnifiedValidationAlerts() {
        const alertsContainer = document.getElementById('alerts-container');
        if (!alertsContainer) return;

        // Clear previous alerts
        alertsContainer.innerHTML = '';

        // Generate helpful alerts based on form data
        const alerts = [];

        if (this.formData.objective === 'curtissimo') {
            alerts.push({
                type: 'warning',
                title: 'Trading de Curto Prazo',
                text: 'Estratégias de curtíssimo prazo requerem monitoramento constante e conhecimento técnico.'
            });
        }

        if (this.formData.risk === 'alto') {
            alerts.push({
                type: 'caution',
                title: 'Alto Risco',
                text: 'Carteira de alto risco pode ter alta volatilidade. Invista apenas o que pode perder.'
            });
        }

        if (!this.formData.amount) {
            alerts.push({
                type: 'info',
                title: 'Valor de Investimento',
                text: 'Valor não informado. As sugestões serão baseadas em proporções percentuais.'
            });
        }

        // Display alerts
        alerts.forEach(alert => {
            const alertElement = document.createElement('div');
            alertElement.className = `alert alert-${alert.type}`;
            alertElement.innerHTML = `
                <div class="alert-icon">${this.getAlertIcon(alert.type)}</div>
                <div class="alert-content">
                    <div class="alert-title">${alert.title}</div>
                    <div class="alert-text">${alert.text}</div>
                </div>
            `;
            alertsContainer.appendChild(alertElement);
        });
    }

    getAlertIcon(type) {
        const icons = {
            warning: '⚠️',
            caution: '🚨',
            info: 'ℹ️',
            success: '✅'
        };
        return icons[type] || 'ℹ️';
    }

    // Helper functions for display text
    getObjectiveText(value) {
        const texts = {
            'curtissimo': 'Curtíssimo prazo (1-7 dias)',
            'moderado': 'Moderado (4-9 semanas)',
            'longo': 'Longo prazo (1+ anos)'
        };
        return texts[value] || value;
    }

    getToleranceText(value) {
        const texts = {
            'baixo': 'Baixo - Prefiro segurança',
            'medio': 'Médio - Aceito algum risco', 
            'alto': 'Alto - Busco máximo retorno'
        };
        return texts[value] || value;
    }

    getAmountText(value) {
        const texts = {
            'baixo': 'Até R$ 1.000',
            'medio-baixo': 'R$ 1.000 - R$ 10.000',
            'medio-alto': 'R$ 10.000 - R$ 50.000',
            'alto': 'Mais de R$ 50.000'
        };
        return texts[value] || 'Não informado';
    }

    getExperienceText(value) {
        const texts = {
            'iniciante': 'Iniciante (menos de 6 meses)',
            'intermediario': 'Intermediário (6 meses a 2 anos)',
            'avancado': 'Avançado (mais de 2 anos)'
        };
        return texts[value] || 'Não informado';
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    try {
        // Enhanced dropdown compatibility check
        const testSelect = document.createElement('select');
        const hasNativeSupport = 'addEventListener' in testSelect;
        
        if (!hasNativeSupport) {
            console.warn('⚠️ Limited dropdown support detected');
        }
        
        // Verify essential elements exist (updated for unified form)
        const requiredElements = [
            'questionnaire-section',
            'unified-form'
        ];
        
        const missingElements = requiredElements.filter(id => !document.getElementById(id));
        
        if (missingElements.length > 0) {
            console.warn('⚠️ Some elements missing:', missingElements);
            // Don't block initialization, just warn
        }
        
        // Setup unified form handler first
        setupUnifiedFormHandler();
        
        // Initialize the application
        window.cryptoAdvisor = new CryptoAdvisor();
        console.log('🎉 Consultor Financeiro loaded successfully');
        
    } catch (error) {
        console.error('❌ Failed to initialize Consultor Financeiro:', error);
        alert('Erro na inicialização. Recarregue a página.');
    }
});

// PWA Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

// ===== TRUST & CREDIBILITY FEATURES =====

// Testimonial rotation
let currentTestimonial = 0;

function showTestimonial(index) {
    const testimonials = document.querySelectorAll('.testimonial-item');
    const dots = document.querySelectorAll('.dot');
    
    // Hide current
    if (testimonials[currentTestimonial]) {
        testimonials[currentTestimonial].classList.remove('active');
    }
    if (dots[currentTestimonial]) {
        dots[currentTestimonial].classList.remove('active');
    }
    
    // Show new
    currentTestimonial = index;
    if (testimonials[currentTestimonial]) {
        testimonials[currentTestimonial].classList.add('active');
    }
    if (dots[currentTestimonial]) {
        dots[currentTestimonial].classList.add('active');
    }
}

// Auto-rotate testimonials every 4 seconds
function startTestimonialRotation() {
    const testimonials = document.querySelectorAll('.testimonial-item');
    if (testimonials.length > 0) {
        setInterval(() => {
            const nextIndex = (currentTestimonial + 1) % testimonials.length;
            showTestimonial(nextIndex);
        }, 4000);
        console.log('✅ Testimonial rotation started');
    }
}

// Live activity simulation
const activities = [
    "Ana acabou de descobrir que é perfil Conservador 🛡️",
    "Pedro criou sua carteira Arrojada com foco em altcoins 🚀", 
    "Márcia salvou sua análise e compartilhou no WhatsApp 📱",
    "Carlos está comparando cenários de Bull vs Bear Market 📊",
    "Júlia configurou alertas para BTC e ETH ⚡",
    "Roberto descobriu que deveria ter mais SOL na carteira 💡",
    "Fernanda ajustou seu perfil de Moderado para Arrojado 🔄",
    "Miguel está analisando seu perfil de alto risco 🎯",
    "Beatriz criou alertas para entrada em Ethereum 🔔",
    "Rafael está comparando carteiras conservadora vs arrojada ⚖️"
];

let activityIndex = 0;

function showLiveActivity() {
    const feed = document.getElementById('activity-feed');
    if (!feed) return;
    
    const activity = activities[activityIndex];
    const activityElement = document.createElement('div');
    activityElement.className = 'activity-item';
    activityElement.textContent = activity;
    
    // Add to top of feed
    feed.insertBefore(activityElement, feed.firstChild);
    
    // Keep only last 3 activities
    const items = feed.querySelectorAll('.activity-item');
    if (items.length > 3) {
        items[items.length - 1].remove();
    }
    
    activityIndex = (activityIndex + 1) % activities.length;
}

// Show new activity every 6 seconds
function startLiveActivity() {
    setInterval(showLiveActivity, 6000);
    // Show first activity after 2 seconds
    setTimeout(showLiveActivity, 2000);
    console.log('✅ Live activity feed started');
}

// Animated user counter
function animateCounter() {
    const counter = document.getElementById('users-count');
    if (!counter) return;
    
    const target = 12847;
    const start = target - Math.floor(Math.random() * 50);
    const duration = 2000;
    const increment = (target - start) / (duration / 16);
    
    let current = start;
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        counter.textContent = Math.floor(current).toLocaleString('pt-BR');
    }, 16);
    
    console.log('✅ Counter animation started');
}

// Initialize trust features on DOM load
document.addEventListener('DOMContentLoaded', () => {
    // Start testimonial rotation
    setTimeout(startTestimonialRotation, 500);
    
    // Start live activity feed
    setTimeout(startLiveActivity, 1000);
    
    // Start counter animation
    setTimeout(animateCounter, 1500);
    
    console.log('🎯 Trust & credibility features initialized');
});

// Enhanced error handling
window.addEventListener('error', (event) => {
    console.error('💥 Global error:', event.error);
    
    // Show user-friendly error for critical failures
    if (event.error && event.error.message) {
        const message = event.error.message;
        if (message.includes('null') || message.includes('undefined') || message.includes('Cannot read properties')) {
            console.error('🚨 Critical form error detected:', message);
            // Don't show alert here to avoid spam, but log for debugging
        }
    }
});

// Enhanced unhandled promise rejection handling
window.addEventListener('unhandledrejection', (event) => {
    console.error('💥 Unhandled promise rejection:', event.reason);
    event.preventDefault(); // Prevent the default handling
});

// Enhanced touch/click handling for better mobile support
document.addEventListener('touchstart', function() {}, { passive: true });

// Prevent zoom on input focus (iOS)
document.addEventListener('touchend', function(event) {
    const inputs = ['INPUT', 'SELECT', 'TEXTAREA'];
    if (inputs.includes(event.target.tagName)) {
        event.target.style.fontSize = '16px';
    }
});

// Debug helper for development
if (typeof window !== 'undefined') {
    window.cryptoAdvisorDebug = {
        getCurrentData: () => ({
            userProfile: window.cryptoAdvisor?.userProfile,
            formData: window.cryptoAdvisor?.formData
        }),
        testDropdowns: () => {
            const selects = document.querySelectorAll('select');
            console.log(`Found ${selects.length} dropdown(s):`, selects);
            return selects;
        }
    };
}

// ADD this to prevent error alerts
window.addEventListener('error', function(e) {
    // Suppress canvas/chart related errors from showing to user
    if (e.message.includes('canvas') || 
        e.message.includes('chart') || 
        e.message.includes('Bitcoin') ||
        e.message.includes('inicialização')) {
        e.preventDefault();
        return false;
    }
});

// Override alert for chart errors
const originalAlert = window.alert;
window.alert = function(message) {
    // Don't show alerts for chart initialization errors
    if (typeof message === 'string' && 
        (message.includes('inicialização') || 
         message.includes('chart') || 
         message.includes('canvas'))) {
        console.log('Suppressed error:', message);
        return;
    }
    originalAlert.call(this, message);
};

// ADD this to ensure chart loads properly
document.addEventListener('DOMContentLoaded', function() {
    // Wait a bit for DOM to be fully ready
    setTimeout(() => {
        if (window.bitcoinChart) {
            // Force chart redraw
            window.bitcoinChart.loadInitialData();
        } else if (typeof BitcoinChart !== 'undefined') {
            // Initialize if not already done
            window.bitcoinChart = new BitcoinChart();
        }
    }, 1000);
});

/* =====================================================
   LANDING PAGE IMPROVEMENTS - JAVASCRIPT FUNCTIONALITY
   ===================================================== */

// Mobile Navigation Toggle
document.addEventListener('DOMContentLoaded', function() {
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });
        
        // Close mobile menu when clicking on a link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
            });
        });
    }
});

// Smooth Scroll for Navigation Links
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});

// FAQ Accordion Functionality
document.addEventListener('DOMContentLoaded', function() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        
        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            
            // Close all other FAQ items
            faqItems.forEach(otherItem => {
                otherItem.classList.remove('active');
            });
            
            // Toggle current item
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });
});

// Enhanced Questionnaire Modal
document.addEventListener('DOMContentLoaded', function() {
    const mainCtaBtn = document.getElementById('main-cta-btn');
    const existingCtaBtn = document.querySelector('.cta-button');
    const modal = document.getElementById('questionnaire-modal');
    const closeBtn = document.getElementById('modal-close');
    const prevBtn = document.getElementById('prev-question');
    const nextBtn = document.getElementById('next-question');
    const progressFill = document.getElementById('progress-fill');
    const progressText = document.getElementById('progress-text');
    const questionContainer = document.getElementById('question-container');
    
    let currentQuestion = 0;
    let answers = {};
    
    // Comprehensive questionnaire questions
    const questions = [
        {
            id: 'experience',
            title: 'Qual é sua experiência com investimentos em criptomoedas?',
            options: [
                { value: 'beginner', text: 'Iniciante - Nunca investi em crypto' },
                { value: 'basic', text: 'Básico - Já comprei Bitcoin/Ethereum' },
                { value: 'intermediate', text: 'Intermediário - Invisto regularmente' },
                { value: 'advanced', text: 'Avançado - Faço trading ativo' }
            ]
        },
        {
            id: 'investment_goal',
            title: 'Qual é seu principal objetivo com investimentos em crypto?',
            options: [
                { value: 'preservation', text: 'Preservar patrimônio contra inflação' },
                { value: 'growth', text: 'Crescimento de patrimônio a longo prazo' },
                { value: 'income', text: 'Gerar renda passiva (staking, DeFi)' },
                { value: 'speculation', text: 'Especulação e ganhos rápidos' }
            ]
        },
        {
            id: 'time_horizon',
            title: 'Qual é seu horizonte de investimento?',
            options: [
                { value: 'short', text: 'Curto prazo (até 6 meses)' },
                { value: 'medium', text: 'Médio prazo (6 meses a 2 anos)' },
                { value: 'long', text: 'Longo prazo (2 a 5 anos)' },
                { value: 'very_long', text: 'Muito longo prazo (mais de 5 anos)' }
            ]
        },
        {
            id: 'risk_tolerance',
            title: 'Como você reagiria a uma queda de 50% na sua carteira crypto?',
            options: [
                { value: 'panic', text: 'Venderia tudo imediatamente' },
                { value: 'worry', text: 'Ficaria muito preocupado, mas aguardaria' },
                { value: 'hold', text: 'Manteria a posição e aguardaria recuperação' },
                { value: 'buy_more', text: 'Aproveitaria para comprar mais' }
            ]
        },
        {
            id: 'portfolio_percentage',
            title: 'Que % do seu patrimônio você destinaria para crypto?',
            options: [
                { value: 'very_low', text: 'Até 5% - Apenas teste' },
                { value: 'low', text: '5% a 15% - Complemento conservador' },
                { value: 'moderate', text: '15% a 30% - Parte significativa' },
                { value: 'high', text: 'Mais de 30% - Foco principal' }
            ]
        },
        {
            id: 'investment_frequency',
            title: 'Com que frequência você planeja investir?',
            options: [
                { value: 'once', text: 'Uma única vez (lump sum)' },
                { value: 'monthly', text: 'Mensalmente (DCA)' },
                { value: 'weekly', text: 'Semanalmente' },
                { value: 'opportunity', text: 'Quando aparecer oportunidade' }
            ]
        },
        {
            id: 'knowledge_level',
            title: 'Seu nível de conhecimento sobre blockchain e DeFi:',
            options: [
                { value: 'none', text: 'Pouco ou nenhum conhecimento' },
                { value: 'basic', text: 'Entendo o básico (Bitcoin, Ethereum)' },
                { value: 'intermediate', text: 'Conheço DeFi, staking, NFTs' },
                { value: 'advanced', text: 'Entendo protocolos complexos' }
            ]
        },
        {
            id: 'trading_style',
            title: 'Qual estilo de investimento combina mais com você?',
            options: [
                { value: 'hodl', text: 'Buy and Hold (HODL)' },
                { value: 'swing', text: 'Swing Trading (semanas/meses)' },
                { value: 'day', text: 'Day Trading (intraday)' },
                { value: 'dca', text: 'Dollar Cost Averaging (compra regular)' }
            ]
        },
        {
            id: 'market_volatility',
            title: 'Como você vê a volatilidade do mercado crypto?',
            options: [
                { value: 'avoid', text: 'Muito arriscada, prefiro evitar' },
                { value: 'accept', text: 'Aceito como parte do investimento' },
                { value: 'embrace', text: 'Oportunidade para maiores ganhos' },
                { value: 'profit', text: 'Essencial para lucrar no trading' }
            ]
        },
        {
            id: 'loss_reaction',
            title: 'Qual seria sua reação a perdas consecutivas?',
            options: [
                { value: 'stop', text: 'Pararia de investir em crypto' },
                { value: 'reduce', text: 'Reduziria significativamente exposição' },
                { value: 'maintain', text: 'Manteria estratégia original' },
                { value: 'increase', text: 'Aumentaria investimentos (média para baixo)' }
            ]
        },
        {
            id: 'diversification',
            title: 'Quantas criptomoedas diferentes você gostaria de ter?',
            options: [
                { value: 'few', text: '2-3 (apenas as principais)' },
                { value: 'moderate', text: '5-8 (mix de principais e alternativas)' },
                { value: 'many', text: '10-15 (diversificação ampla)' },
                { value: 'very_many', text: 'Mais de 15 (máxima diversificação)' }
            ]
        },
        {
            id: 'research_time',
            title: 'Quanto tempo você dedica para pesquisar investimentos?',
            options: [
                { value: 'minimal', text: 'Pouco tempo - prefiro seguir especialistas' },
                { value: 'moderate', text: 'Algumas horas por semana' },
                { value: 'significant', text: 'Várias horas por semana' },
                { value: 'extensive', text: 'Várias horas por dia' }
            ]
        },
        {
            id: 'profit_taking',
            title: 'Quando você realizaria lucros?',
            options: [
                { value: 'early', text: 'Ganhos de 20-50% já venderia parte' },
                { value: 'moderate', text: 'Esperaria ganhos de 100-200%' },
                { value: 'late', text: 'Só venderia com ganhos de 500%+' },
                { value: 'never', text: 'HODL - nunca venderia' }
            ]
        },
        {
            id: 'news_influence',
            title: 'Como notícias do mercado crypto influenciam suas decisões?',
            options: [
                { value: 'high', text: 'Muito - sempre ajusto posições' },
                { value: 'moderate', text: 'Moderadamente - analiso antes de agir' },
                { value: 'low', text: 'Pouco - mantenho estratégia' },
                { value: 'none', text: 'Nada - ignoro ruído do mercado' }
            ]
        },
        {
            id: 'technology_interest',
            title: 'Seu interesse na tecnologia blockchain:',
            options: [
                { value: 'investment_only', text: 'Apenas como investimento' },
                { value: 'casual', text: 'Interesse casual na tecnologia' },
                { value: 'enthusiast', text: 'Entusiasta da tecnologia' },
                { value: 'developer', text: 'Trabalho/estudo na área' }
            ]
        }
    ];
    
    // Open modal functions
    function openModal() {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        showQuestion(0);
    }
    
    // Close modal function
    function closeModal() {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        currentQuestion = 0;
        answers = {};
    }
    
    // Show specific question
    function showQuestion(index) {
        if (index >= questions.length) {
            processResults();
            return;
        }
        
        const question = questions[index];
        const progress = ((index) / questions.length) * 100;
        
        progressFill.style.width = progress + '%';
        progressText.textContent = `Pergunta ${index + 1} de ${questions.length}`;
        
        questionContainer.innerHTML = `
            <h3 class="question-title">${question.title}</h3>
            <div class="question-options">
                ${question.options.map(option => `
                    <button class="option-button" data-value="${option.value}">
                        ${option.text}
                    </button>
                `).join('')}
            </div>
        `;
        
        // Add click listeners to options
        questionContainer.querySelectorAll('.option-button').forEach(button => {
            button.addEventListener('click', () => {
                // Remove previous selection
                questionContainer.querySelectorAll('.option-button').forEach(btn => {
                    btn.classList.remove('selected');
                });
                
                // Add selection to clicked button
                button.classList.add('selected');
                
                // Store answer
                answers[question.id] = button.dataset.value;
                
                // Enable next button
                nextBtn.disabled = false;
            });
        });
        
        // Update navigation buttons
        prevBtn.disabled = index === 0;
        nextBtn.disabled = true;
        nextBtn.textContent = index === questions.length - 1 ? 'Finalizar' : 'Próxima';
    }
    
    // Process questionnaire results
    function processResults() {
        // Calculate profile based on answers
        const profile = calculateProfile(answers);
        
        // Close modal
        closeModal();
        
        // Trigger existing form submission with calculated profile
        if (window.cryptoAdvisor && window.cryptoAdvisor.processProfile) {
            window.cryptoAdvisor.processProfile(profile);
        } else {
            // Fallback to existing questionnaire system
            startAnalysis();
        }
    }
    
    // Calculate profile from answers
    function calculateProfile(answers) {
        let conservativeScore = 0;
        let moderateScore = 0;
        let aggressiveScore = 0;
        
        // Score based on answers
        const scoring = {
            experience: {
                'beginner': [3, 1, 0],
                'basic': [2, 3, 1],
                'intermediate': [1, 3, 2],
                'advanced': [0, 1, 3]
            },
            investment_goal: {
                'preservation': [3, 1, 0],
                'growth': [1, 3, 1],
                'income': [2, 2, 1],
                'speculation': [0, 1, 3]
            },
            time_horizon: {
                'short': [0, 1, 3],
                'medium': [1, 2, 2],
                'long': [2, 3, 1],
                'very_long': [3, 1, 0]
            },
            risk_tolerance: {
                'panic': [3, 0, 0],
                'worry': [2, 2, 0],
                'hold': [1, 3, 1],
                'buy_more': [0, 1, 3]
            },
            portfolio_percentage: {
                'very_low': [3, 1, 0],
                'low': [2, 3, 1],
                'moderate': [1, 2, 2],
                'high': [0, 1, 3]
            }
        };
        
        // Calculate scores
        Object.keys(answers).forEach(key => {
            if (scoring[key] && scoring[key][answers[key]]) {
                const scores = scoring[key][answers[key]];
                conservativeScore += scores[0];
                moderateScore += scores[1];
                aggressiveScore += scores[2];
            }
        });
        
        // Determine profile
        if (conservativeScore >= moderateScore && conservativeScore >= aggressiveScore) {
            return {
                profile: 'conservador',
                objective: 'longo',
                risk: 'baixo',
                amount: '50000',
                experience: 'iniciante'
            };
        } else if (aggressiveScore >= moderateScore && aggressiveScore >= conservativeScore) {
            return {
                profile: 'arrojado',
                objective: 'curtissimo',
                risk: 'alto',
                amount: '50000',
                experience: 'experiente'
            };
        } else {
            return {
                profile: 'moderado',
                objective: 'moderado',
                risk: 'medio',
                amount: '50000',
                experience: 'intermediario'
            };
        }
    }
    
    // Event listeners
    if (mainCtaBtn) {
        mainCtaBtn.addEventListener('click', openModal);
    }
    
    if (existingCtaBtn) {
        existingCtaBtn.addEventListener('click', function(e) {
            e.preventDefault();
            openModal();
        });
    }
    
    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }
    
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeModal();
            }
        });
    }
    
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            if (currentQuestion > 0) {
                currentQuestion--;
                showQuestion(currentQuestion);
            }
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            currentQuestion++;
            showQuestion(currentQuestion);
        });
    }
});

// Navbar scroll effect
window.addEventListener('scroll', function() {
    const navbar = document.getElementById('navbar');
    if (navbar) {
        if (window.scrollY > 100) {
            navbar.style.background = 'rgba(13, 17, 35, 0.98)';
        } else {
            navbar.style.background = 'rgba(13, 17, 35, 0.95)';
        }
    }
});

// Analytics tracking for new elements
document.addEventListener('DOMContentLoaded', function() {
    // Track navigation clicks
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function() {
            if (window.analytics) {
                window.analytics.trackEvent('navigation_click', {
                    section: this.getAttribute('href'),
                    text: this.textContent
                });
            }
        });
    });
    
    // Track CTA button clicks
    const mainCta = document.getElementById('main-cta-btn');
    if (mainCta) {
        mainCta.addEventListener('click', function() {
            if (window.analytics) {
                window.analytics.trackEvent('main_cta_click', {
                    location: 'hero_section',
                    text: this.textContent
                });
            }
        });
    }
    
    // Track FAQ interactions
    document.querySelectorAll('.faq-question').forEach(question => {
        question.addEventListener('click', function() {
            if (window.analytics) {
                window.analytics.trackEvent('faq_interaction', {
                    question: this.textContent,
                    action: 'toggle'
                });
            }
        });
    });
    
    // Track WhatsApp button clicks
    const whatsappBtn = document.querySelector('.whatsapp-button');
    if (whatsappBtn) {
        whatsappBtn.addEventListener('click', function() {
            if (window.analytics) {
                window.analytics.trackEvent('whatsapp_contact', {
                    source: 'floating_button'
                });
            }
        });
    }
});