class MakeOrBreakApp {
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
            dailyIdeasLimit: 15,  
            swipeThreshold: 150, // Reduced threshold for easier swiping
            isSwiping: false,
            isFollowUpMode: false,
            touchData: {
                startX: 0,
                currentX: 0,
                startY: 0,
                startTime: 0
            }
        };
        
        this.libraryBtn = this.safeGetElement('library-btn');
        this.libraryModal = this.safeGetElement('library-modal');
        this.libraryContent = this.safeGetElement('library-content');
        this.closeLibraryBtn = this.safeGetElement('close-library-btn');

        // Add library-related method bindings
        this.bindMethods();
        this.setupLibraryEventListeners();

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
        
        const libraryMethodsToBind = [
            'openLibrary',
            'closeLibrary',
            'deleteLibraryItem'
        ];
        
        methodsToBind.forEach(method => {
            if (typeof this[method] === 'function') {
                this[method] = this[method].bind(this);
            } else {
                console.warn(`Method ${method} does not exist and cannot be bound`);
            }
        });
        
        libraryMethodsToBind.forEach(method => {
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
    
    setupLibraryEventListeners() {
        if (this.libraryBtn) {
            this.libraryBtn.addEventListener('click', this.openLibrary);
        }
        if (this.closeLibraryBtn) {
            this.closeLibraryBtn.addEventListener('click', this.closeLibrary);
        }
    }

    setupEventListeners() {
        // Remove existing listeners to prevent duplicates
        this.removeExistingListeners();

        // Setup button handlers
        if (this.dislikeBtn) {
            this.dislikeBtn.addEventListener('click', () => this.processVote(false));
        }
        if (this.likeBtn) {
            this.likeBtn.addEventListener('click', () => this.processVote(true));
        }

        // Enhanced touch and mouse event handlers
        this.addTouchHandlers();
    }
    
    openLibrary() {
        if (!this.libraryModal || !this.libraryContent) return;

        // Retrieve vote history
        const voteHistory = this.getVoteHistory();

        // Filter and group 'Make' ideas
        const makeIdeas = voteHistory.filter(item => item.vote === 'Make');

        // Clear previous content
        this.libraryContent.innerHTML = '';

        if (makeIdeas.length === 0) {
            this.libraryContent.innerHTML = `
                <div class="empty-library">
                    <p>Your library is empty. Start exploring ideas to save them!</p>
                </div>
            `;
        } else {
            // Create library items
            makeIdeas.forEach((item, index) => {
                const libraryItem = document.createElement('div');
                libraryItem.classList.add('library-item');
                libraryItem.innerHTML = `
                    <div class="library-item-content">
                        <p>${this.sanitizeHTML(item.idea)}</p>
                        <div class="library-item-meta">
                            <span>${new Date(item.timestamp).toLocaleDateString()}</span>
                        </div>
                    </div>
                    <button class="delete-library-item" data-index="${index}">
                        <i class="fas fa-trash"></i>
                    </button>
                `;
                
                // Add event listener for delete button
                const deleteBtn = libraryItem.querySelector('.delete-library-item');
                deleteBtn.addEventListener('click', () => this.deleteLibraryItem(index));

                this.libraryContent.appendChild(libraryItem);
            });
        }

        // Show the library modal
        this.libraryModal.classList.add('open');
    }
    
    closeLibrary() {
        if (!this.libraryModal) return;
        this.libraryModal.classList.remove('open');
    }
    
    deleteLibraryItem(index) {
        try {
            const voteHistory = this.getVoteHistory();
            
            // Remove the specific 'Make' idea
            const makeIdeas = voteHistory.filter(item => item.vote === 'Make');
            const ideaToRemove = makeIdeas[index];
            
            // Find and remove the exact item from full vote history
            const fullHistoryIndex = voteHistory.findIndex(
                item => item.idea === ideaToRemove.idea && 
                        item.timestamp === ideaToRemove.timestamp
            );
            
            if (fullHistoryIndex !== -1) {
                voteHistory.splice(fullHistoryIndex, 1);
                localStorage.setItem('voteHistory', JSON.stringify(voteHistory));
                
                // Refresh library view
                this.openLibrary();
            }
        } catch (error) {
            console.error('Error deleting library item:', error);
        }
    }

    removeExistingListeners() {
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

        // Add touch and mouse events with improved compatibility
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

    async fetchBusinessIdeas(previousIdea = null) {
        if (!this.API_KEY) {
            throw new Error('API key is missing');
        }
    
        // Construct prompt with optional previous idea context
        const basePrompt = `INNOVATIVE PRODUCT & STARTUP IDEAS GENERATOR
    
    CORE OBJECTIVE:
    Generate 5 unique, diverse product or startup concepts that are distinct from typical business ideas.
    
    CRITICAL GUIDELINES:
    - Cover WIDE range of domains: physical products, digital platforms, hardware, software, services
    - Solve tangible problems or create novel experiences
    - Include clear value proposition
    - Span various industries: consumer tech, wellness, sustainability, entertainment, productivity, education, lifestyle`;

        // Modify prompt if follow-up mode is active
        let followUpContext = '';
        if (previousIdea) {
            followUpContext = `
    
    FOLLOW-UP CONTEXT:
    The previous idea was: "${previousIdea}"
    
    ADDITIONAL CONSTRAINTS:
    - Generate ideas that are either:
      a) Directly related and expanding on the previous concept
      b) Solving adjacant problems in the same domain
      c) Offering a complementary innovation
    - Demonstrate how the new idea builds upon or enhances the previous concept`;
        }
    
        const promptSuffix = `
    
    REQUIRED OUTPUT FORMAT:
    Respond ONLY as a strict JSON array of strings. EACH IDEA MUST BE:
    - 1-2 concise sentences
    - Globally scalable concept
    - Actionable and potentially fundable
    - Use clear, engaging language
    
    FORBIDDEN CONCEPTS:
    - No standard app or website ideas
    - Avoid generic marketplace platforms
    - No repetitive AI-assistant type products`;
    
        const fullPrompt = basePrompt + followUpContext + promptSuffix;
    
        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.API_KEY}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: fullPrompt }] }]
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
            this.state.isFollowUpMode = !!previousIdea;
    
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
        
        // Add special styling for follow-up mode
        if (this.state.isFollowUpMode) {
            ideaCard.classList.add('follow-up-idea');
        }

        ideaCard.innerHTML = `
            <div class="idea-content">
                <h2>${this.state.isFollowUpMode ? 'Follow-up Idea' : 'Make or Break?'}</h2>
                <p>${this.sanitizeHTML(idea)}</p>
            </div>
            <div class="interaction-overlay">
                <div class="vote-indicator left-vote">
                    <i class="fas fa-times"></i>
                    <span>Break</span>
                </div>
                <div class="vote-indicator right-vote">
                    <i class="fas fa-check"></i>
                    <span>Make</span>
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

        // Prevent multiple simultaneous touch events
        if (this.state.isSwiping) return;

        // Normalize event coordinates
        const clientX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
        const clientY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;

        this.state.touchData = {
            startX: clientX,
            currentX: clientX,
            startY: clientY,
            startTime: Date.now()
        };

        this.state.isSwiping = true;

        // Visual feedback
        const activeCard = this.ideaCarousel.querySelector('.idea-card');
        if (activeCard) {
            activeCard.style.transition = 'none';
            activeCard.style.willChange = 'transform'; // Performance optimization
        }

        // Prevent default to stop scrolling and text selection
        e.preventDefault();
    }

    handleMove(e) {
        if (!this.state.isSwiping) return;
        if (!this.ideaCarousel) return;

        const activeCard = this.ideaCarousel.querySelector('.idea-card');
        if (!activeCard) return;

        // Normalize event coordinates
        const clientX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
        const clientY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;

        // Prevent vertical scrolling during horizontal swipe
        const verticalDiff = Math.abs(clientY - this.state.touchData.startY);
        const horizontalDiff = clientX - this.state.touchData.startX;

        // More precise swipe detection
        if (verticalDiff > Math.abs(horizontalDiff) && verticalDiff > 20) {
            this.state.isSwiping = false;
            return;
        }

        // Update touch data
        this.state.touchData.currentX = clientX;

        // Smooth rotation and translation
        const maxRotation = 15; // Maximum rotation angle
        const rotationFactor = 0.2; // Control rotation intensity
        const rotation = Math.min(
            maxRotation, 
            Math.max(-maxRotation, horizontalDiff * rotationFactor)
        );

        // Apply transform with improved smoothing
        activeCard.style.transform = `
            translateX(${horizontalDiff}px) 
            rotate(${rotation}deg)
        `;

        // Enhanced vote indicators
        const leftIndicator = activeCard.querySelector('.left-vote');
        const rightIndicator = activeCard.querySelector('.right-vote');
        const swipeThreshold = 100; // Increased threshold for clearer intent

        // Dynamic opacity for indicators
        const indicatorOpacity = Math.min(1, Math.abs(horizontalDiff) / swipeThreshold);
        
        if (horizontalDiff < -swipeThreshold) {
            leftIndicator.style.opacity = indicatorOpacity;
            rightIndicator.style.opacity = 0;
        } else if (horizontalDiff > swipeThreshold) {
            rightIndicator.style.opacity = indicatorOpacity;
            leftIndicator.style.opacity = 0;
        } else {
            leftIndicator.style.opacity = 0;
            rightIndicator.style.opacity = 0;
        }

        // Prevent default to stop scrolling
        e.preventDefault();
    }

    handleEnd(e) {
        if (!this.state.isSwiping) return;
        if (!this.ideaCarousel) return;

        const activeCard = this.ideaCarousel.querySelector('.idea-card');
        if (!activeCard) return;

        // Reset styles
        activeCard.style.willChange = 'auto';
        activeCard.style.transition = 'transform 0.3s ease';

        // Calculate swipe details
        const horizontalDiff = this.state.touchData.currentX - this.state.touchData.startX;
        const timeDiff = Date.now() - this.state.touchData.startTime;
        const swipeVelocity = Math.abs(horizontalDiff / timeDiff);

        const swipeThreshold = 150; // Consistent with existing code
        const fastSwipeVelocity = 0.5; // Velocity threshold for fast swipe

        // Determine vote based on swipe distance and velocity
        const isFastSwipe = swipeVelocity > fastSwipeVelocity;
        const isLongSwipe = Math.abs(horizontalDiff) > swipeThreshold;

        if (isFastSwipe || isLongSwipe) {
            // Determine vote direction
            const isLike = horizontalDiff > 0;
            this.processVote(isLike);
        } else {
            // Snap back to original position
            activeCard.style.transform = 'translateX(0) rotate(0)';
        }

        // Reset indicators
        const leftIndicator = activeCard.querySelector('.left-vote');
        const rightIndicator = activeCard.querySelector('.right-vote');
        
        if (leftIndicator) leftIndicator.style.opacity = 0;
        if (rightIndicator) rightIndicator.style.opacity = 0;

        this.state.isSwiping = false;
    }

    processVote(isLike) {
        const currentIdea = this.state.ideas[this.state.currentIndex];
        if (!currentIdea) return;
    
        // Track votes
        this.saveVoteToHistory(currentIdea, isLike);
    
        // Get the active card
        const activeCard = this.ideaCarousel.querySelector('.idea-card');
        if (!activeCard) return;
    
        // Determine animation direction and intensity
        const rotationDirection = isLike ? 1 : -1;
        const exitTransform = `
            translateX(${rotationDirection * 150}%) 
            rotate(${rotationDirection * 45}deg) 
            scale(0.8)
        `;
    
        // Apply exit animation
        activeCard.style.transition = 'transform 0.5s cubic-bezier(0.6, -0.28, 0.735, 0.045), opacity 0.5s ease';
        activeCard.style.transform = exitTransform;
        activeCard.style.opacity = '0';
    
        // Add vote indication
        const voteIndicator = document.createElement('div');
        voteIndicator.classList.add('vote-result');
        
        // Follow-up interaction logic
        if (isLike) {
            // Prompt to generate follow-up ideas
            this.promptFollowUpIdea(currentIdea);
            voteIndicator.textContent = 'EXPLORE ➜';
        } else {
            voteIndicator.textContent = 'BREAK ✗';
        }
        
        voteIndicator.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(${rotationDirection * 15}deg);
            font-size: 3rem;
            font-weight: bold;
            color: ${isLike ? 'green' : 'red'};
            opacity: 0.7;
            pointer-events: none;
            z-index: 10;
        `;
        this.ideaCarousel.appendChild(voteIndicator);
    
        // Remove vote indicator after animation
        setTimeout(() => {
            voteIndicator.remove();
        }, 1000);
    
        // Wait for animation to complete before moving to next steps
        setTimeout(() => {
            // If not a 'Like' vote, move to next idea
            if (!isLike) {
                this.state.currentIndex++;
    
                // Check if we need more ideas
                if (this.state.currentIndex >= this.state.ideas.length) {
                    this.loadOrFetchIdeas();
                    return;
                }
    
                // Render next idea
                this.renderIdeas();
            }
        }, 500);
    }
    
    promptFollowUpIdea(currentIdea) {
        // Create follow-up modal
        const followUpModal = document.createElement('div');
        followUpModal.classList.add('follow-up-modal');
        followUpModal.innerHTML = `
            <div class="follow-up-content">
                <h2>Explore This Idea Further?</h2>
                <p>${this.sanitizeHTML(currentIdea)}</p>
                <div class="follow-up-actions">
                    <button id="generate-follow-up" class="btn-primary">Generate Related Ideas</button>
                    <button id="close-follow-up" class="btn-secondary">Close</button>
                </div>
            </div>
        `;

        // Add to body
        document.body.appendChild(followUpModal);

        // Add event listeners
        const generateBtn = followUpModal.querySelector('#generate-follow-up');
        const closeBtn = followUpModal.querySelector('#close-follow-up');

        generateBtn.addEventListener('click', async () => {
            // Remove modal
            followUpModal.remove();

            // Show loading state
            this.showLoadingState();

            try {
                // Fetch follow-up ideas based on current idea
                await this.fetchBusinessIdeas(currentIdea);
            } catch (error) {
                this.handleFetchError(error);
            }
        });

        closeBtn.addEventListener('click', () => {
            // Remove modal
            followUpModal.remove();

            // Move to next idea on 'close'
            this.state.currentIndex++;

            // Check if we need more ideas
            if (this.state.currentIndex >= this.state.ideas.length) {
                this.loadOrFetchIdeas();
                return;
            }

            // Render next idea
            this.renderIdeas();
        });
    }
    
    showLoadingState() {
        if (!this.ideaCarousel) return;

        this.ideaCarousel.innerHTML = `
            <div class="idea-card active loading-state">
                <div class="idea-content">
                    <h2>Generating Follow-up Ideas...</h2>
                    <div class="loading-spinner"></div>
                </div>
            </div>
        `;
    }

    saveVoteToHistory(idea, isLike, followUp = false) {
        try {
            const voteHistory = JSON.parse(localStorage.getItem('voteHistory') || '[]');
            voteHistory.push({
                idea: idea,
                vote: isLike ? 'Make' : 'Break',
                followUp: followUp,
                timestamp: new Date().toISOString()
            });
            localStorage.setItem('voteHistory', JSON.stringify(voteHistory));
        } catch (error) {
            console.error('Error saving vote history:', error);
        }
    }
    
    getVoteHistory() {
        try {
            return JSON.parse(localStorage.getItem('voteHistory') || '[]');
        } catch (error) {
            console.error('Error retrieving vote history:', error);
            return [];
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
        const makeOrBreakApp = new MakeOrBreakApp();
    } catch (error) {
        console.error('Failed to initialize MakeOrBreakApp:', error);
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
