(function() {
    // Configuration Object
    const CONFIG = {
        STORAGE_KEY: 'make_break_tutorial_config_v1',
        MAX_TUTORIAL_VIEWS: 3,
        DEBUG_MODE: false, // Set to true for console logging
        TUTORIAL_VERSION_KEY: 'make_break_tutorial_v2'
    };

    // Comprehensive Styles with Modern Design
    const tutorialStyles = `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;800&display=swap');
        
        .tutorial-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.85);
            z-index: 10000;
            display: flex;
            justify-content: center;
            align-items: center;
            font-family: 'Inter', sans-serif;
            backdrop-filter: blur(5px);
            animation: fadeIn 0.3s ease-out;
        }
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        .tutorial-container {
            width: 90%;
            max-width: 600px;
            background: linear-gradient(135deg, #ffffff 0%, #f4f4f4 100%);
            border-radius: 25px;
            box-shadow: 0 20px 50px rgba(0,0,0,0.2);
            overflow: hidden;
            position: relative;
            transform: scale(0.9);
            opacity: 0;
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .tutorial-container.active {
            transform: scale(1);
            opacity: 1;
        }
        .tutorial-header {
            background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
            color: white;
            padding: 20px;
            text-align: center;
            position: relative;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }
        .tutorial-content {
            padding: 30px;
            text-align: center;
            position: relative;
        }
        .tutorial-image {
            font-size: 100px;
            margin-bottom: 20px;
            opacity: 0.8;
            transition: transform 0.3s ease;
        }
        .tutorial-image:hover {
            transform: scale(1.1) rotate(5deg);
        }
        .tutorial-description {
            color: #333;
            margin-bottom: 20px;
            line-height: 1.6;
        }
        .tutorial-buttons {
            display: flex;
            border-top: 1px solid #e0e0e0;
        }
        .tutorial-btn {
            flex: 1;
            padding: 15px;
            border: none;
            background: #f0f0f0;
            color: #333;
            font-weight: 600;
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
        }
        .tutorial-btn:hover {
            background: #e0e0e0;
        }
        .tutorial-next {
            background: #4CAF50;
            color: white;
        }
        .tutorial-next:hover {
            background: #45a049;
        }
        .tutorial-progress {
            display: flex;
            justify-content: center;
            padding: 10px;
            background: #f8f8f8;
        }
        .tutorial-dot {
            width: 10px;
            height: 10px;
            background-color: #e0e0e0;
            border-radius: 50%;
            margin: 0 5px;
            transition: all 0.3s ease;
            cursor: pointer;
        }
        .tutorial-dot.active {
            background-color: #4CAF50;
            width: 15px;
        }
        .tutorial-tip {
            background: #e6f3e6;
            border-left: 5px solid #4CAF50;
            padding: 10px;
            margin-top: 15px;
            font-style: italic;
            color: #2c542c;
        }
        .skip-tutorial {
            position: absolute;
            top: 15px;
            right: 15px;
            background: none;
            border: none;
            color: white;
            cursor: pointer;
            font-size: 16px;
            opacity: 0.7;
            transition: opacity 0.3s ease;
        }
        .skip-tutorial:hover {
            opacity: 1;
        }
    `;

    // Enhanced Tutorial Steps with More Comprehensive Information
    const tutorialSteps = [
        {
            title: "Welcome to Make or Break!",
            description: "Your AI-powered Business Idea Evaluation Platform. Transform raw concepts into actionable entrepreneurial insights.",
            image: "🚀",
            tip: "Every great business starts with a single idea. Let's find yours!",
            additionalDetails: [
                "Personalized idea analysis",
                "Quick decision-making tools",
                "Machine learning-powered insights"
            ]
        },
        {
            title: "MAKE (Validate) an Idea",
            description: "Identify promising business concepts with potential for success. Your 'MAKE' signals a concept worth exploring deeper.",
            image: "💡",
            tip: "Look for unique value propositions, market demand, and innovation potential.",
            additionalDetails: [
                "Saves ideas to personal library",
                "Enables further AI-powered exploration",
                "Builds your entrepreneurial portfolio"
            ]
        },
        {
            title: "BREAK (Filter) an Idea",
            description: "Not all ideas are created equal. Quickly filter out concepts that don't align with your entrepreneurial vision.",
            image: "❌",
            tip: "Consider market saturation, feasibility, and innovation when breaking an idea.",
            additionalDetails: [
                "Refines your idea selection process",
                "Saves time and mental energy",
                "Helps develop critical evaluation skills"
            ]
        },
        {
            title: "Deep Dive & Follow-Up",
            description: "Transform initial impressions into comprehensive business insights through AI-powered exploration.",
            image: "🔍",
            tip: "Ask detailed questions, request market analysis, or explore idea variations.",
            additionalDetails: [
                "Unlimited idea exploration",
                "AI-generated insights and suggestions",
                "Contextual idea refinement"
            ]
        },
        {
            title: "Idea Library: Your Entrepreneurial Vault",
            description: "Curate, organize, and track your most promising business concepts in one intelligent workspace.",
            image: "📁",
            tip: "Your library is a living document of potential business opportunities.",
            additionalDetails: [
                "Permanent idea storage",
                "Easy retrieval and review",
                "Track idea evolution over time"
            ]
        }
    ];

    // Logging Utility
    const Logger = {
        log: function(message) {
            if (CONFIG.DEBUG_MODE) {
                console.log(`[Tutorial Logger]: ${message}`);
            }
        },
        error: function(message) {
            console.error(`[Tutorial Error]: ${message}`);
        }
    };

    // Tutorial State Management
    class TutorialStateManager {
        constructor() {
            this.initializeState();
        }

        initializeState() {
            const storedConfig = this.getTutorialConfig();
            
            // Set default state if not exists
            if (!storedConfig) {
                this.resetTutorialState();
            }
        }

        getTutorialConfig() {
            try {
                const config = localStorage.getItem(CONFIG.STORAGE_KEY);
                return config ? JSON.parse(config) : null;
            } catch (error) {
                Logger.error('Failed to retrieve tutorial config');
                return null;
            }
        }

        resetTutorialState() {
            const defaultConfig = {
                completed: false,
                viewCount: 0,
                lastViewDate: null
            };

            try {
                localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(defaultConfig));
                Logger.log('Tutorial state reset');
            } catch (error) {
                Logger.error('Failed to reset tutorial state');
            }
        }

        shouldShowTutorial() {
            const config = this.getTutorialConfig();
            
            if (!config) {
                Logger.error('No tutorial configuration found');
                return false;
            }

            // Check if tutorial is already completed
            if (config.completed) {
                Logger.log('Tutorial already completed');
                return false;
            }

            // Limit tutorial views
            if (config.viewCount >= CONFIG.MAX_TUTORIAL_VIEWS) {
                Logger.log('Maximum tutorial views reached');
                return false;
            }

            return true;
        }

        incrementTutorialView() {
            try {
                const config = this.getTutorialConfig();
                if (config) {
                    config.viewCount++;
                    config.lastViewDate = new Date().toISOString();
                    
                    localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(config));
                    Logger.log(`Tutorial view incremented: ${config.viewCount}`);
                }
            } catch (error) {
                Logger.error('Failed to increment tutorial view');
            }
        }

        markTutorialCompleted() {
            try {
                const config = this.getTutorialConfig();
                if (config) {
                    config.completed = true;
                    config.viewCount = CONFIG.MAX_TUTORIAL_VIEWS;
                    
                    localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(config));
                    Logger.log('Tutorial marked as completed');
                }
            } catch (error) {
                Logger.error('Failed to mark tutorial as completed');
            }
        }
    }

    // Main Tutorial Class
    class AdvancedIntroTutorial {
        constructor() {
            this.stateManager = new TutorialStateManager();
            this.currentStep = 0;
            this.setupErrorHandling();
            this.setupStyles();
        }

        setupErrorHandling() {
            window.addEventListener('error', (event) => {
                Logger.error(`Unhandled error: ${event.message}`);
                this.safeCleanup();
            });
        }

        setupStyles() {
            const styleElement = document.createElement('style');
            styleElement.textContent = tutorialStyles;
            document.head.appendChild(styleElement);
        }

        safeCleanup() {
            try {
                if (this.overlay && this.overlay.parentNode) {
                    this.overlay.parentNode.removeChild(this.overlay);
                }
            } catch (error) {
                Logger.error('Error during tutorial cleanup');
            }
        }

        start() {
            // Advanced first-time user detection
            const tutorialCount = parseInt(localStorage.getItem(CONFIG.TUTORIAL_VERSION_KEY) || '0');
            
            // Comprehensive check before showing tutorial
            if (!this.stateManager.shouldShowTutorial()) {
                Logger.log('Tutorial will not be shown');
                return;
            }

            // Show tutorial for first 3 visits, then offer option to revisit
            if (tutorialCount < 3) {
                localStorage.setItem(CONFIG.TUTORIAL_VERSION_KEY, (tutorialCount + 1).toString());
                
                // Increment view count
                this.stateManager.incrementTutorialView();

                try {
                    this.createTutorialModal();
                } catch (error) {
                    Logger.error('Failed to create tutorial modal');
                    this.safeCleanup();
                }
            } else {
                // Optional: Provide a way to restart tutorial
                this.offerTutorialRestart();
            }
        }

        createTutorialModal() {
            this.overlay = document.createElement('div');
            this.overlay.className = 'tutorial-overlay';
            
            this.tutorialContainer = document.createElement('div');
            this.tutorialContainer.className = 'tutorial-container';
            
            this.renderCurrentStep();
            
            this.overlay.appendChild(this.tutorialContainer);
            document.body.appendChild(this.overlay);

            // Slight delay for animation
            setTimeout(() => {
                this.tutorialContainer.classList.add('active');
            }, 50);
        }

        renderCurrentStep() {
            const currentStep = tutorialSteps[this.currentStep];
            
            this.tutorialContainer.innerHTML = `
                <button class="skip-tutorial">Skip Tutorial</button>
                <div class="tutorial-header">${currentStep.title}</div>
                <div class="tutorial-content">
                    <div class="tutorial-image">${currentStep.image}</div>
                    <div class="tutorial-description">${currentStep.description}</div>
                    
                    <div class="tutorial-tip">${currentStep.tip}</div>
                    
                    <ul style="list-style-type: none; padding: 0; margin-top: 15px;">
                        ${currentStep.additionalDetails.map(detail => 
                            `<li style="margin: 5px 0; color: #666;">• ${detail}</li>`
                        ).join('')}
                    </ul>
                </div>
                <div class="tutorial-buttons">
                    ${this.currentStep > 0 ? '<button class="tutorial-btn tutorial-prev">Previous</button>' : ''}
                    <button class="tutorial-btn tutorial-next">
                        ${this.currentStep === tutorialSteps.length - 1 ? 'Finish' : 'Next'}
                    </button>
                </div>
                <div class="tutorial-progress">
                    ${tutorialSteps.map((_, index) => 
                        `<div class="tutorial-dot ${index === this.currentStep ? 'active' : ''}" 
                             data-step="${index}"></div>`
                    ).join('')}
                </div>
            `;

            this.setupEventListeners();
        }

        setupEventListeners() {
            const prevBtn = this.tutorialContainer.querySelector('.tutorial-prev');
            const nextBtn = this.tutorialContainer.querySelector('.tutorial-next');
            const skipBtn = this.tutorialContainer.querySelector('.skip-tutorial');
            const progressDots = this.tutorialContainer.querySelectorAll('.tutorial-dot');

            // Previous button
            if (prevBtn) {
                prevBtn.addEventListener('click', () => {
                    if (this.currentStep > 0) {
                        this.currentStep--;
                        this.renderCurrentStep();
                    }
                });
            }

            // Next button
            nextBtn.addEventListener('click', () => {
                if (this.currentStep < tutorialSteps.length - 1) {
                    this.currentStep++;
                    this.renderCurrentStep();
                } else {
                    this.completeTutorial();
                }
            });

            // Skip button
            skipBtn.addEventListener('click', () => this.completeTutorial());

            // Progress dots navigation
            progressDots.forEach(dot => {
                dot.addEventListener('click', (e) => {
                    const stepIndex = parseInt(e.target.getAttribute('data-step'));
                    this.currentStep = stepIndex;
                    this.renderCurrentStep();
                });
            });

            // Optional: Keyboard navigation
            document.addEventListener('keydown', (e) => {
                if (e.key === 'ArrowRight' && this.currentStep < tutorialSteps.length - 1) {
                    this.currentStep++;
                    this.renderCurrentStep();
                }
                if (e.key === 'ArrowLeft' && this.currentStep > 0) {
                    this.currentStep--;
                    this.renderCurrentStep();
                }
                if (e.key === 'Escape') {
                    this.completeTutorial();
                }
            });
        }

        offerTutorialRestart() {
            // Optional method to offer restarting tutorial after multiple visits
            Logger.log("Tutorial restart option can be implemented here");
        }

        completeTutorial() {
            // Remove overlay with smooth exit animation
            this.tutorialContainer.style.transform = 'scale(0.7)';
            this.tutorialContainer.style.opacity = '0';
            
            setTimeout(() => {
                if (this.overlay && this.overlay.parentNode) {
                    document.body.removeChild(this.overlay);
                }
            }, 300);
            
            try {
                // Mark as fully completed
                this.stateManager.markTutorialCompleted();
                localStorage.setItem('make_break_tutorial_completed', 'true');
                
                // Optional: Show welcome toast or notification
                this.showWelcomeNotification();
            } catch (error) {
                Logger.error('Error completing tutorial');
            }
        }

        showWelcomeNotification() {
            // Create a toast-style welcome notification
            const notification = document.createElement('div');
            notification.style.cssText = `
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: #4CAF50;
                color: white;
                padding: 15px;
                border-radius: 10px;
                box-shadow: 0 10px 20px rgba(0,0,0,0.2);
                z-index: 10000;
                animation: slideIn 0.5s ease;
            `;
            notification.innerHTML = `
                <strong>Welcome Aboard!</strong><br>
                Start exploring business ideas right away.
            `;
            
            document.body.appendChild(notification);

            // Auto-remove after 5 seconds
            setTimeout(() => {
                if (notification.parentNode) {
                    document.body.removeChild(notification);
                }
            }, 5000);
        }
    }

    // Initialization with Error Handling
    function initializeTutorial() {
        try {
            // Ensure DOM is fully loaded
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => {
                    const tutorial = new AdvancedIntroTutorial();
                    tutorial.start();
                });
            } else {
                const tutorial = new AdvancedIntroTutorial();
                tutorial.start();
            }
        } catch (error) {
            Logger.error('Failed to initialize tutorial');
        }
    }

    // Expose initialization function
    window.initializeTutorial = initializeTutorial;

    // Automatic initialization
    initializeTutorial();
})();
