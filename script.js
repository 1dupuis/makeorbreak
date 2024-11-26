class SipOrSpitApp {
    constructor() {
        // Secure API key handling
        this.API_KEY = 'AIzaSyDZm9VpvHeGrS5YSYvZqTaL3q7tiXyH9dc';
        
        // Robust DOM element selection with null checks
        this.ideaCarousel = this.safeGetElement('idea-carousel');
        this.queriesLeftEl = this.safeGetElement('queries-left');
        this.dislikeBtn = this.safeGetElement('dislike-btn');
        this.likeBtn = this.safeGetElement('like-btn');

        // Enhanced state management with type safety
        this.state = {
            ideas: [],           
            currentIndex: 0,     
            dailyIdeasLimit: 5,  
            swipeThreshold: 250, 
            isSwiping: false,
            touchData: {
                startX: 0,
                currentX: 0,
                startY: 0
            }
        };

        // Bind methods to ensure correct context
        this.bindMethods();

        // Initialize the app
        this.initializeApp();
    }

    // Method to safely get DOM elements
    safeGetElement(id) {
        const element = document.getElementById(id);
        if (!element) {
            console.warn(`Element with id '${id}' not found`);
        }
        return element;
    }

    // Bind methods to preserve 'this' context
    bindMethods() {
        const methodsToBind = [
            'handleStart', 
            'handleMove', 
            'handleEnd', 
            'processVote',
            'loadOrFetchIdeas'
        ];
        
        methodsToBind.forEach(method => {
            // Only bind methods that actually exist on the prototype
            if (typeof this[method] === 'function') {
                this[method] = this[method].bind(this);
            } else {
                console.warn(`Method ${method} does not exist and cannot be bound`);
            }
        });
    }
    
    initializeApp() {
        this.loadAppState();
        this.setupEventListeners();
        this.loadOrFetchIdeas();
    }

    setupEventListeners() {
        // Clear existing listeners to prevent duplicates
        this.removeExistingListeners();

        // Setup button handlers
        if (this.dislikeBtn) {
            this.dislikeBtn.addEventListener('click', () => this.processVote(false));
        }
        if (this.likeBtn) {
            this.likeBtn.addEventListener('click', () => this.processVote(true));
        }

        // Touch and mouse event handlers
        this.addTouchHandlers();
    }

    removeExistingListeners() {
        // Remove all potential existing event listeners
        const events = [
            { element: this.ideaCarousel, events: ['touchstart', 'mousedown'] },
            { element: document, events: ['touchmove', 'mousemove', 'touchend', 'mouseup'] }
        ];

        events.forEach(({ element, events }) => {
            if (element) {
                events.forEach(eventType => {
                    element.removeEventListener(eventType, this.handleStart);
                    element.removeEventListener(eventType, this.handleMove);
                    element.removeEventListener(eventType, this.handleEnd);
                });
            }
        });
    }

    addTouchHandlers() {
        if (!this.ideaCarousel) return;

        // Add touch and mouse events with passive option for performance
        this.ideaCarousel.addEventListener('touchstart', this.handleStart, { passive: false });
        this.ideaCarousel.addEventListener('mousedown', this.handleStart);
        document.addEventListener('touchmove', this.handleMove, { passive: false });
        document.addEventListener('mousemove', this.handleMove);
        document.addEventListener('touchend', this.handleEnd, { passive: false });
        document.addEventListener('mouseup', this.handleEnd);
    }

    loadAppState() {
        const today = new Date().toISOString().split('T')[0];
        const storedState = this.getSavedState();

        // Reset state if not from today
        if (storedState.date !== today) {
            this.state.dailyIdeasLimit = 5;
            this.state.ideas = [];
        } else {
            this.state = { ...this.state, ...storedState, currentIndex: 0 };
        }

        // Update UI
        if (this.queriesLeftEl) {
            this.queriesLeftEl.textContent = this.state.dailyIdeasLimit;
        }
    }

    getSavedState() {
        try {
            return JSON.parse(localStorage.getItem('sipOrSpitAppState') || '{}');
        } catch (error) {
            console.error('Error parsing saved state:', error);
            return {};
        }
    }

    async loadOrFetchIdeas() {
        // Check if we have ideas to display
        if (this.hasIdeasToDisplay()) {
            this.renderIdeas();
            return;
        }

        // Check daily limit
        if (this.state.dailyIdeasLimit <= 0) {
            this.showDailyLimitReachedMessage();
            return;
        }

        // Fetch new ideas
        try {
            await this.fetchBusinessIdeas();
        } catch (error) {
            this.handleFetchError(error);
        }
    }

    hasIdeasToDisplay() {
        return this.state.ideas.length > 0 && 
               this.state.currentIndex < this.state.ideas.length;
    }

    showDailyLimitReachedMessage() {
        if (!this.ideaCarousel) return;

        this.ideaCarousel.innerHTML = `
            <div class="idea-card active">
                <div class="idea-content">
                    <h2>Daily Limit Reached</h2>
                    <p>You've explored all ideas for today. Come back tomorrow!</p>
                </div>
            </div>
        `;
    }

    async fetchBusinessIdeas() {
        if (!this.API_KEY) {
            throw new Error('API key is missing');
        }
    
        const prompt = `INNOVATIVE PRODUCT & STARTUP IDEAS GENERATOR
    
    CORE OBJECTIVE:
    Generate 5 unique, diverse product or startup concepts that are distinct from typical business ideas.
    
    CRITICAL GUIDELINES:
    - Cover WIDE range of domains: physical products, digital platforms, hardware, software, services
    - Solve tangible problems or create novel experiences
    - Include clear value proposition
    - Span various industries: consumer tech, wellness, sustainability, entertainment, productivity, education, lifestyle
    
    REQUIRED OUTPUT FORMAT:
    Respond ONLY as a strict JSON array of strings. EACH IDEA MUST BE:
    - 1-2 concise sentences
    - Globally scalable concept
    - Actionable and potentially fundable
    - Use clear, engaging language
    
    FORBIDDEN CONCEPTS:
    - No standard app or website ideas
    - Avoid generic marketplace platforms
    - No repetitive AI-assistant type products
    
    EXAMPLE FORMAT:
    ["A modular smart home device that transforms into multiple tools using magnetic, interchangeable components, enabling users to customize a single purchase for various household needs.", "Biodegradable consumer electronics packaging that grows into plantable seed gardens, creating a zero-waste tech accessory lifecycle."]
    
    INNOVATION DOMAINS TO EXPLORE:
    - Sustainable consumer products
    - Hybrid physical-digital experiences
    - Wellness and personal development tools
    - Next-generation educational technologies
    - Adaptive lifestyle solutions
    - Emerging consumer interaction models
    
    ADDITIONAL CONSTRAINTS:
    - Must be original
    - Demonstrate clear market potential
    - Suggest a novel technological or design approach`;
    
        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.API_KEY}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }]
                })
            });
    
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
    
            const data = await response.json();
            const responseText = data.candidates[0].content.parts[0].text;
    
            // Improved parsing with multiple fallback strategies
            const ideas = this.parseIdeas(responseText);
    
            if (ideas.length === 0) {
                throw new Error('No valid ideas generated');
            }
    
            // Update state
            this.state.ideas = ideas;
            this.state.dailyIdeasLimit = Math.max(0, this.state.dailyIdeasLimit - 1);
            this.state.currentIndex = 0;
    
            // Update UI
            if (this.queriesLeftEl) {
                this.queriesLeftEl.textContent = this.state.dailyIdeasLimit;
            }
    
            this.saveAppState();
            this.renderIdeas();
        } catch (error) {
            console.error('Fetch error:', error);
            throw error;
        }
    }

    parseIdeas(responseText) {
        const parsingStrategies = [
            // Try JSON parsing first
            () => {
                try {
                    const jsonMatch = responseText.match(/\[.*?\]/s);
                    return jsonMatch ? JSON.parse(jsonMatch[0]) : [];
                } catch {
                    return [];
                }
            },
            // Try line-by-line parsing
            () => responseText
                .split('\n')
                .filter(line => line.trim().length > 10)
                .slice(0, 5),
            // Last resort: use a default set of ideas
            () => [
                "Oops! Try again."
            ]
        ];

        for (const strategy of parsingStrategies) {
            const ideas = strategy();
            const validIdeas = ideas
                .filter(idea => idea && typeof idea === 'string' && idea.trim().length > 10)
                .slice(0, 5);

            if (validIdeas.length > 0) {
                return validIdeas;
            }
        }

        return [];
    }

    renderIdeas() {
        if (!this.ideaCarousel) return;

        this.ideaCarousel.innerHTML = '';

        const idea = this.state.ideas[this.state.currentIndex];
        if (!idea) {
            this.loadOrFetchIdeas();
            return;
        }

        const ideaCard = document.createElement('div');
        ideaCard.classList.add('idea-card', 'active');
        ideaCard.innerHTML = `
            <div class="idea-content">
                <h2>Business Idea</h2>
                <p>${this.sanitizeHTML(idea)}</p>
            </div>
            <div class="interaction-overlay">
                <div class="vote-indicator left-vote">
                    <i class="fas fa-times"></i>
                    <span>Spit</span>
                </div>
                <div class="vote-indicator right-vote">
                    <i class="fas fa-check"></i>
                    <span>Sip</span>
                </div>
                <div class="swipe-progress"></div>
            </div>
        `;

        this.ideaCarousel.appendChild(ideaCard);
    }

    // Basic HTML sanitization to prevent XSS
    sanitizeHTML(str) {
        const temp = document.createElement('div');
        temp.textContent = str;
        return temp.innerHTML;
    }

    // Touch and swipe event handlers
    handleStart(e) {
        if (!this.ideaCarousel) return;

        const clientX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
        const clientY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;

        this.state.touchData = {
            startX: clientX,
            currentX: clientX,
            startY: clientY
        };

        this.state.isSwiping = true;
        document.body.style.cursor = 'grabbing';

        // Prevent default to stop scrolling
        e.preventDefault();
    }

    handleMove(e) {
        if (!this.state.isSwiping) return;
        if (!this.ideaCarousel) return;

        const activeCard = this.ideaCarousel.querySelector('.idea-card');
        if (!activeCard) return;

        const clientX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
        const clientY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;

        // Prevent vertical scrolling during horizontal swipe
        if (Math.abs(clientY - this.state.touchData.startY) > 20) {
            this.state.isSwiping = false;
            return;
        }

        this.state.touchData.currentX = clientX;
        const diffX = this.state.touchData.currentX - this.state.touchData.startX;

        // Transform card
        activeCard.style.transform = `translateX(${diffX}px) rotate(${diffX / 10}deg)`;

        // Show vote indicators
        const leftIndicator = activeCard.querySelector('.left-vote');
        const rightIndicator = activeCard.querySelector('.right-vote');

        if (diffX < 0) {
            leftIndicator.classList.add('active');
            rightIndicator.classList.remove('active');
        } else {
            rightIndicator.classList.add('active');
            leftIndicator.classList.remove('active');
        }

        // Prevent default to stop scrolling
        e.preventDefault();
    }

    handleEnd(e) {
        if (!this.state.isSwiping) return;
        if (!this.ideaCarousel) return;

        const activeCard = this.ideaCarousel.querySelector('.idea-card');
        if (!activeCard) return;

        const diffX = this.state.touchData.currentX - this.state.touchData.startX;

        // Reset styles
        activeCard.style.transform = '';
        document.body.style.cursor = 'default';

        const leftIndicator = activeCard.querySelector('.left-vote');
        const rightIndicator = activeCard.querySelector('.right-vote');
        
        if (leftIndicator) leftIndicator.classList.remove('active');
        if (rightIndicator) rightIndicator.classList.remove('active');

        // Determine vote based on swipe
        if (Math.abs(diffX) > this.state.swipeThreshold) {
            this.processVote(diffX > 0);
        }

        this.state.isSwiping = false;
    }

    processVote(isLike) {
        const currentIdea = this.state.ideas[this.state.currentIndex];
        if (!currentIdea) return;

        // Track votes
        this.saveVoteToHistory(currentIdea, isLike);

        // Move to next idea
        this.state.currentIndex++;

        // Check if we need more ideas
        if (this.state.currentIndex >= this.state.ideas.length) {
            this.loadOrFetchIdeas();
            return;
        }

        // Render next idea
        this.renderIdeas();
    }

    saveVoteToHistory(idea, isLike) {
        try {
            const voteHistory = JSON.parse(localStorage.getItem('voteHistory') || '[]');
            voteHistory.push({
                idea: idea,
                vote: isLike ? 'sip' : 'spit',
                timestamp: new Date().toISOString()
            });
            localStorage.setItem('voteHistory', JSON.stringify(voteHistory));
        } catch (error) {
            console.error('Error saving vote history:', error);
        }
    }

    saveAppState() {
        try {
            const stateToStore = {
                ...this.state,
                date: new Date().toISOString().split('T')[0]
            };
            localStorage.setItem('sipOrSpitAppState', JSON.stringify(stateToStore));
        } catch (error) {
            console.error('Error saving app state:', error);
        }
    }

    handleFetchError(error) {
        console.error('Idea Fetch Error:', error);
        
        if (!this.ideaCarousel) return;

        this.ideaCarousel.innerHTML = `
            <div class="idea-card active">
                <div class="idea-content">
                    <h2>Oops! Something Went Wrong</h2>
                    <p>${this.sanitizeHTML(error.message || 'Unable to fetch business ideas.')}</p>
                    <button id="retry-btn">Retry</button>
                </div>
            </div>
        `;

        const retryBtn = this.ideaCarousel.querySelector('#retry-btn');
        if (retryBtn) {
            retryBtn.addEventListener('click', () => {
                // Reset state to allow retrying
                this.state.dailyIdeasLimit = Math.max(this.state.dailyIdeasLimit, 1);
                this.loadOrFetchIdeas();
            });
        }
    }
}

// App initialization with error handling
document.addEventListener('DOMContentLoaded', () => {
    try {
        const sipOrSpitApp = new SipOrSpitApp();
    } catch (error) {
        console.error('Failed to initialize SipOrSpitApp:', error);
        const errorContainer = document.createElement('div');
        errorContainer.innerHTML = `
            <div class="error-message">
                <h2>App Initialization Failed</h2>
                <p>We're sorry, but the app couldn't start properly. Please try refreshing the page.</p>
                <small>${error.message}</small>
            </div>
        `;
        document.body.appendChild(errorContainer);
    }
});
