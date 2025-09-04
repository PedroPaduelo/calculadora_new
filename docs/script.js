// Mobile Navigation Toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-link').forEach(n => n.addEventListener('click', () => {
    hamburger.classList.remove('active');
    navMenu.classList.remove('active');
}));

// Smooth Scrolling for Navigation Links
function scrollToSection(sectionId) {
    const element = document.getElementById(sectionId);
    if (element) {
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Update navigation links to use smooth scrolling
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href').substring(1);
        scrollToSection(targetId);
    });
});

// Features Tabs Functionality
const tabButtons = document.querySelectorAll('.tab-btn');
const tabPanes = document.querySelectorAll('.tab-pane');

tabButtons.forEach(button => {
    button.addEventListener('click', () => {
        const targetTab = button.getAttribute('data-tab');
        
        // Remove active class from all buttons and panes
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabPanes.forEach(pane => pane.classList.remove('active'));
        
        // Add active class to clicked button and corresponding pane
        button.classList.add('active');
        document.getElementById(targetTab).classList.add('active');
    });
});

// Navbar Background on Scroll
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 100) {
        navbar.style.background = 'rgba(255, 255, 255, 0.98)';
        navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
    } else {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        navbar.style.boxShadow = 'none';
    }
});

// Intersection Observer for Animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in-up');
        }
    });
}, observerOptions);

// Observe elements for animation
document.addEventListener('DOMContentLoaded', () => {
    const animateElements = document.querySelectorAll('.overview-card, .arch-layer, .algorithm-card, .setup-method, .info-card');
    animateElements.forEach(el => observer.observe(el));
});

// Copy Code Functionality
function createCopyButton(codeBlock) {
    const button = document.createElement('button');
    button.className = 'copy-btn';
    button.innerHTML = '<i class="fas fa-copy"></i>';
    button.title = 'Copiar código';
    
    button.addEventListener('click', async () => {
        const code = codeBlock.querySelector('code').textContent;
        try {
            await navigator.clipboard.writeText(code);
            button.innerHTML = '<i class="fas fa-check"></i>';
            button.style.color = '#10b981';
            setTimeout(() => {
                button.innerHTML = '<i class="fas fa-copy"></i>';
                button.style.color = '';
            }, 2000);
        } catch (err) {
            console.error('Erro ao copiar:', err);
        }
    });
    
    return button;
}

// Add copy buttons to code blocks
document.addEventListener('DOMContentLoaded', () => {
    const codeBlocks = document.querySelectorAll('.code-block');
    codeBlocks.forEach(block => {
        const copyBtn = createCopyButton(block);
        block.style.position = 'relative';
        block.appendChild(copyBtn);
    });
});

// Demo Links Status Check
async function checkDemoStatus() {
    const frontendLink = document.querySelector('a[href="http://localhost:3000"]');
    const backendLink = document.querySelector('a[href="http://localhost:3001"]');
    
    if (frontendLink) {
        try {
            const response = await fetch('http://localhost:3000', { mode: 'no-cors' });
            frontendLink.style.position = 'relative';
            frontendLink.insertAdjacentHTML('beforeend', '<span class="status-indicator online"></span>');
        } catch (error) {
            frontendLink.style.position = 'relative';
            frontendLink.insertAdjacentHTML('beforeend', '<span class="status-indicator offline"></span>');
        }
    }
    
    if (backendLink) {
        try {
            const response = await fetch('http://localhost:3001/health');
            if (response.ok) {
                backendLink.style.position = 'relative';
                backendLink.insertAdjacentHTML('beforeend', '<span class="status-indicator online"></span>');
            }
        } catch (error) {
            backendLink.style.position = 'relative';
            backendLink.insertAdjacentHTML('beforeend', '<span class="status-indicator offline"></span>');
        }
    }
}

// Typing Animation for Hero Title
function typeWriter(element, text, speed = 100) {
    let i = 0;
    element.innerHTML = '';
    
    function type() {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    
    type();
}

// Initialize typing animation
document.addEventListener('DOMContentLoaded', () => {
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle) {
        const originalText = heroTitle.textContent;
        setTimeout(() => {
            typeWriter(heroTitle, originalText, 50);
        }, 500);
    }
});

// Metrics Counter Animation
function animateCounter(element, target, duration = 2000) {
    const start = 0;
    const increment = target / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        
        if (element.textContent.includes('%')) {
            element.textContent = Math.floor(current) + '%';
        } else {
            element.textContent = Math.floor(current);
        }
    }, 16);
}

// Initialize counter animations when metrics come into view
const metricsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const value = entry.target.textContent;
            const numericValue = parseInt(value.replace(/[^\d]/g, ''));
            if (!isNaN(numericValue)) {
                animateCounter(entry.target, numericValue, 1500);
                metricsObserver.unobserve(entry.target);
            }
        }
    });
}, { threshold: 0.5 });

document.addEventListener('DOMContentLoaded', () => {
    const metricValues = document.querySelectorAll('.metric-value');
    metricValues.forEach(metric => metricsObserver.observe(metric));
});

// Parallax Effect for Hero Section
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero');
    const heroContent = document.querySelector('.hero-content');
    
    if (hero && heroContent) {
        const rate = scrolled * -0.5;
        heroContent.style.transform = `translateY(${rate}px)`;
    }
});

// Search Functionality (if needed)
function searchContent(query) {
    const sections = document.querySelectorAll('section');
    const results = [];
    
    sections.forEach(section => {
        const text = section.textContent.toLowerCase();
        if (text.includes(query.toLowerCase())) {
            results.push({
                section: section.id,
                title: section.querySelector('h2, h3')?.textContent || 'Seção',
                element: section
            });
        }
    });
    
    return results;
}

// Keyboard Navigation
document.addEventListener('keydown', (e) => {
    // ESC to close mobile menu
    if (e.key === 'Escape') {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    }
    
    // Arrow keys for tab navigation
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        const activeTab = document.querySelector('.tab-btn.active');
        if (activeTab) {
            const tabs = Array.from(document.querySelectorAll('.tab-btn'));
            const currentIndex = tabs.indexOf(activeTab);
            let nextIndex;
            
            if (e.key === 'ArrowLeft') {
                nextIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1;
            } else {
                nextIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0;
            }
            
            tabs[nextIndex].click();
            tabs[nextIndex].focus();
        }
    }
});

// Performance Monitoring
function logPerformance() {
    if ('performance' in window) {
        window.addEventListener('load', () => {
            setTimeout(() => {
                const perfData = performance.getEntriesByType('navigation')[0];
                console.log('Page Load Time:', perfData.loadEventEnd - perfData.loadEventStart, 'ms');
                console.log('DOM Content Loaded:', perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart, 'ms');
            }, 0);
        });
    }
}

// Initialize performance monitoring
logPerformance();

// Check demo status on load
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(checkDemoStatus, 1000);
});

// Add CSS for status indicators and copy buttons
const additionalStyles = `
.copy-btn {
    position: absolute;
    top: 1rem;
    right: 1rem;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: #e2e8f0;
    padding: 0.5rem;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 0.875rem;
}

.copy-btn:hover {
    background: rgba(255, 255, 255, 0.2);
}

.status-indicator {
    position: absolute;
    top: -5px;
    right: -5px;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    border: 2px solid #fff;
}

.status-indicator.online {
    background: #10b981;
}

.status-indicator.offline {
    background: #ef4444;
}

@keyframes pulse {
    0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
    70% { box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); }
    100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
}

.status-indicator.online {
    animation: pulse 2s infinite;
}
`;

// Inject additional styles
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);
