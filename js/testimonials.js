// Enhanced Testimonials Section - Live Activity Feed
// Simulate live activity updates

const activities = [
    { icon: '💡', text: 'Lucas descobriu seu perfil Moderado', time: 'agora' },
    { icon: '🎯', text: 'Fernanda ativou carteira Conservadora', time: 'há 1 min' },
    { icon: '🚀', text: 'Gabriel aumentou posição em ETH', time: 'há 3 min' },
    { icon: '📈', text: 'Beatriz recebeu alerta de oportunidade', time: 'há 4 min' },
    { icon: '💰', text: 'Rafael descobriu perfil Arrojado', time: 'há 5 min' },
    { icon: '🔥', text: 'Julia completou o questionário', time: 'há 7 min' },
    { icon: '⚡', text: 'Marcos ativou notificações de mercado', time: 'há 8 min' },
    { icon: '🎉', text: 'Carolina alcançou meta de ROI', time: 'há 10 min' },
    { icon: '📊', text: 'André ajustou sua carteira para BTC', time: 'há 12 min' },
    { icon: '🎯', text: 'Patrícia compartilhou resultado no WhatsApp', time: 'há 15 min' },
    { icon: '💪', text: 'Roberto aumentou exposição a Solana', time: 'há 18 min' },
    { icon: '🔍', text: 'Camila analisou relatório de performance', time: 'há 20 min' }
];

let activityIndex = 0;

function updateActivityFeed() {
    const feed = document.getElementById('activityFeed');
    if (!feed) return;
    
    // Get next activity
    const newActivity = activities[activityIndex % activities.length];
    
    // Create new activity element
    const activityHTML = `
        <div class="activity-item" style="animation: slideIn 0.5s ease;">
            <span class="activity-icon">${newActivity.icon}</span>
            <span class="activity-text">${newActivity.text}</span>
            <span class="activity-time">${newActivity.time}</span>
        </div>
    `;
    
    // Add to beginning of feed
    feed.insertAdjacentHTML('afterbegin', activityHTML);
    
    // Keep only last 3 activities
    while (feed.children.length > 3) {
        feed.removeChild(feed.lastChild);
    }
    
    activityIndex++;
    
    console.log('✅ Activity feed updated:', newActivity.text);
}

// Animate trust numbers on scroll
function animateNumbers() {
    const numbers = document.querySelectorAll('.trust-number');
    
    numbers.forEach(num => {
        const target = num.innerText;
        
        // Handle different number formats
        if (target.includes(',')) {
            // Numbers like "12,847"
            const finalValue = parseInt(target.replace(',', ''));
            let current = 0;
            const increment = finalValue / 50;
            
            const timer = setInterval(() => {
                current += increment;
                if (current >= finalValue) {
                    current = finalValue;
                    clearInterval(timer);
                }
                num.innerText = Math.floor(current).toLocaleString('pt-BR');
            }, 30);
            
        } else if (target.includes('/')) {
            // Numbers like "4.9/5.0"
            const finalValue = parseFloat(target.split('/')[0]);
            let current = 0;
            const increment = finalValue / 30;
            
            const timer = setInterval(() => {
                current += increment;
                if (current >= finalValue) {
                    current = finalValue;
                    clearInterval(timer);
                }
                num.innerText = current.toFixed(1) + '/5.0';
            }, 50);
            
        } else if (target.includes('%')) {
            // Numbers like "98%"
            const finalValue = parseInt(target.replace('%', ''));
            let current = 0;
            const increment = finalValue / 30;
            
            const timer = setInterval(() => {
                current += increment;
                if (current >= finalValue) {
                    current = finalValue;
                    clearInterval(timer);
                }
                num.innerText = Math.floor(current) + '%';
            }, 50);
        }
    });
    
    console.log('✅ Trust numbers animation started');
}

// Trigger animation when section is visible
function observeTrustSection() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateNumbers();
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.5
    });

    const trustSection = document.querySelector('.trust-indicators');
    if (trustSection) {
        observer.observe(trustSection);
        console.log('✅ Trust section observer set up');
    }
}

// Add sparkle effect to testimonial cards on hover
function addSparkleEffects() {
    const cards = document.querySelectorAll('.testimonial-card');
    
    cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-5px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0) scale(1)';
        });
    });
    
    console.log('✅ Sparkle effects added to', cards.length, 'testimonial cards');
}

// Initialize testimonials enhancements
function initTestimonials() {
    console.log('🌟 Initializing enhanced testimonials...');
    
    // Set up activity feed updates every 5 seconds
    setInterval(updateActivityFeed, 5000);
    
    // Set up intersection observer for number animations
    observeTrustSection();
    
    // Add hover effects to cards
    addSparkleEffects();
    
    // Initial activity update after 2 seconds
    setTimeout(updateActivityFeed, 2000);
    
    console.log('✅ Enhanced testimonials initialized successfully');
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Small delay to ensure all elements are rendered
    setTimeout(initTestimonials, 500);
});

// Export for manual initialization if needed
window.testimonialsModule = {
    updateActivityFeed,
    animateNumbers,
    initTestimonials
};