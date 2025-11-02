// AI Chat Integration for Lost & Found
class AIChatAssistant {
    constructor() {
        this.isOpen = false;
        this.chatHistory = [];
        this.init();
    }

    init() {
        this.createChatInterface();
        this.loadChatHistory();
    }

    createChatInterface() {
        // Create chat container
        const chatContainer = document.createElement('div');
        chatContainer.id = 'ai-chat-container';
        chatContainer.innerHTML = `
            <div id="chat-header">
                <div class="chat-title">
                    <i class="fas fa-robot"></i>
                    <span>Lost & Found Assistant</span>
                </div>
                <button id="minimize-chat">
                    <i class="fas fa-minus"></i>
                </button>
                <button id="close-chat">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div id="chat-messages"></div>
            <div id="chat-input-area">
                <div id="suggested-questions">
                    <span>Quick questions:</span>
                    <button class="suggestion-btn" data-question="How do I report a found item?">Report Found Item</button>
                    <button class="suggestion-btn" data-question="How to search for lost items?">Search Tips</button>
                    <button class="suggestion-btn" data-question="What items are commonly lost?">Common Lost Items</button>
                </div>
                <div class="input-container">
                    <input type="text" id="chat-input" placeholder="Ask me about lost items...">
                    <button id="send-message">
                        <i class="fas fa-paper-plane"></i>
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(chatContainer);

        // Create chat toggle button
        const chatToggle = document.createElement('div');
        chatToggle.id = 'chat-toggle';
        chatToggle.innerHTML = `
            <i class="fas fa-comments"></i>
            <span class="notification-dot"></span>
        `;
        document.body.appendChild(chatToggle);

        this.attachEventListeners();
    }

    attachEventListeners() {
        // Toggle chat
        document.getElementById('chat-toggle').addEventListener('click', () => {
            this.toggleChat();
        });

        // Close and minimize
        document.getElementById('close-chat').addEventListener('click', () => {
            this.closeChat();
        });

        document.getElementById('minimize-chat').addEventListener('click', () => {
            this.minimizeChat();
        });

        // Send message
        document.getElementById('send-message').addEventListener('click', () => {
            this.sendMessage();
        });

        document.getElementById('chat-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });

        // Suggested questions
        document.querySelectorAll('.suggestion-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const question = e.target.getAttribute('data-question');
                document.getElementById('chat-input').value = question;
                this.sendMessage();
            });
        });
    }

    toggleChat() {
        const chatContainer = document.getElementById('ai-chat-container');
        this.isOpen = !this.isOpen;

        if (this.isOpen) {
            chatContainer.classList.add('open');
            document.getElementById('chat-input').focus();
            this.hideNotification();
        } else {
            chatContainer.classList.remove('open');
        }
    }

    closeChat() {
        const chatContainer = document.getElementById('ai-chat-container');
        chatContainer.classList.remove('open');
        this.isOpen = false;
    }

    minimizeChat() {
        const chatContainer = document.getElementById('ai-chat-container');
        chatContainer.classList.toggle('minimized');
    }

    async sendMessage() {
        const input = document.getElementById('chat-input');
        const message = input.value.trim();

        if (!message) return;

        // Add user message to chat
        this.addMessage(message, 'user');
        input.value = '';

        // Show typing indicator
        this.showTypingIndicator();

        try {
            // Get AI response
            const response = await this.getAIResponse(message);
            this.removeTypingIndicator();
            this.addMessage(response, 'assistant');
        } catch (error) {
            this.removeTypingIndicator();
            this.addMessage("I'm having trouble responding right now. Please try again later.", 'assistant');
            console.error('Chat error:', error);
        }

        this.saveChatHistory();
    }

    async getAIResponse(userMessage) {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

        // AI response logic based on user message
        const lowerMessage = userMessage.toLowerCase();

        // Greeting responses
        if (this.isGreeting(lowerMessage)) {
            return this.getGreetingResponse();
        }

        // Report found item guidance
        if (lowerMessage.includes('report') || lowerMessage.includes('found')) {
            return this.getReportGuidance();
        }

        // Search guidance
        if (lowerMessage.includes('search') || lowerMessage.includes('find') || lowerMessage.includes('lost')) {
            return this.getSearchGuidance();
        }

        // Common lost items
        if (lowerMessage.includes('common') || lowerMessage.includes('usually') || lowerMessage.includes('often')) {
            return this.getCommonItemsResponse();
        }

        // Contact information
        if (lowerMessage.includes('contact') || lowerMessage.includes('reach') || lowerMessage.includes('help')) {
            return this.getContactResponse();
        }

        // Image search
        if (lowerMessage.includes('image') || lowerMessage.includes('photo') || lowerMessage.includes('picture')) {
            return this.getImageSearchResponse();
        }

        // Default response for other queries
        return this.getDefaultResponse(userMessage);
    }

    isGreeting(message) {
        const greetings = ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening'];
        return greetings.some(greeting => message.includes(greeting));
    }

    getGreetingResponse() {
        const greetings = [
            "Hello! I'm your Lost & Found assistant. How can I help you today?",
            "Hi there! I'm here to help you with lost and found items. What do you need assistance with?",
            "Welcome! I can help you report found items, search for lost items, or answer any questions about our service."
        ];
        return greetings[Math.floor(Math.random() * greetings.length)];
    }

    getReportGuidance() {
        return `To report a found item:

1. Go to the "Report Found" section
2. Fill in the item details (name, description, location)
3. Upload a photo if possible (helps with AI identification)
4. Add your contact information
5. Submit the report

The item will then be searchable by others looking for their lost belongings. Our AI will also analyze the image to help with categorization.`;
    }

    getSearchGuidance() {
        return `You can search for lost items in several ways:

🔍 **Text Search**: 
- Use the Search page to search by item name, description, or location
- Add filters by date or detailed description

📷 **Image Search**:
- Upload a photo of a similar item
- Our AI will find visually similar found items
- Great for when you're not sure how to describe the item

💡 **Tips**:
- Be specific in your search terms
- Try different keyword combinations
- Check recent dates first
- Use the image search for better matches`;
    }

    getCommonItemsResponse() {
        return `Based on our data, the most commonly lost items are:

• Phones and electronic devices
• Keys and keychains
• Wallets and purses
• Water bottles and drink containers
• Books and notebooks
• Glasses and sunglasses
• Headphones and earbuds
• Jackets and clothing items
• Backpacks and bags
• Jewelry (especially rings and watches)

Pro tip: Always add contact information to your valuable items!`;
    }

    getContactResponse() {
        return `For assistance with lost and found items:

📧 **Email Support**: 
- General inquiries: support@lostfound.com
- Technical issues: tech@lostfound.com

📞 **Phone Support**:
- Main line: 1-800-LOST-FOUND
- Available Mon-Fri, 9AM-6PM

💬 **Live Chat**:
- You're using it right now! I'm here to help.

📍 **In Person**:
- Visit your local lost and found office
- Check with building security or administration

Remember to provide detailed information about your item when contacting support.`;
    }

    getImageSearchResponse() {
        return `Our image search feature uses AI to help find your lost items:

🤖 **How it works**:
1. Upload a clear photo of a similar item
2. Our AI analyzes the image features
3. It compares with found items in our database
4. Shows you the most similar matches

📸 **Best practices for photos**:
- Use good lighting
- Take photos from multiple angles
- Include size references if possible
- Avoid blurry or dark images

🎯 **What the AI looks for**:
- Color, shape, and texture patterns
- Distinctive features and markings
- Size and proportion characteristics
- Brand logos or unique designs

The better your photo, the better the matches will be!`;
    }

    getDefaultResponse(userMessage) {
        const responses = [
            `I understand you're asking about "${userMessage}". As a Lost & Found assistant, I can help you with reporting found items, searching for lost items, using image search, or general questions about our service. Could you be more specific about what you need help with?`,

            `Thanks for your question! I'm specialized in helping with lost and found items. I can guide you on how to report found items, search for lost belongings, use our AI image search, or answer questions about common lost items. What would you like to know?`,

            `I'm here to assist with lost and found matters. I can help you:
• Report a found item
• Search for a lost item
• Use image search feature
• Learn about common lost items
• Get contact information

How can I specifically help you with "${userMessage}"?`
        ];
        return responses[Math.floor(Math.random() * responses.length)];
    }

    addMessage(content, sender) {
        const messagesContainer = document.getElementById('chat-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        
        const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        messageDiv.innerHTML = `
            <div class="message-content">
                <div class="message-text">${this.formatMessage(content)}</div>
                <div class="message-time">${timestamp}</div>
            </div>
            ${sender === 'assistant' ? '<div class="message-avatar"><i class="fas fa-robot"></i></div>' : ''}
        `;

        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        // Add to chat history
        this.chatHistory.push({
            content,
            sender,
            timestamp: new Date().toISOString()
        });
    }

    formatMessage(content) {
        // Convert line breaks and basic formatting
        return content
            .replace(/\n/g, '<br>')
            .replace(/\•/g, '•')
            .replace(/(\d+)\./g, '$1.');
    }

    showTypingIndicator() {
        const messagesContainer = document.getElementById('chat-messages');
        const typingDiv = document.createElement('div');
        typingDiv.id = 'typing-indicator';
        typingDiv.className = 'message assistant-message typing';
        typingDiv.innerHTML = `
            <div class="message-avatar"><i class="fas fa-robot"></i></div>
            <div class="message-content">
                <div class="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;
        messagesContainer.appendChild(typingDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    removeTypingIndicator() {
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    showNotification() {
        const notificationDot = document.querySelector('.notification-dot');
        notificationDot.style.display = 'block';
    }

    hideNotification() {
        const notificationDot = document.querySelector('.notification-dot');
        notificationDot.style.display = 'none';
    }

    saveChatHistory() {
        try {
            localStorage.setItem('lostFoundChatHistory', JSON.stringify(this.chatHistory));
        } catch (error) {
            console.warn('Could not save chat history:', error);
        }
    }

    loadChatHistory() {
        try {
            const saved = localStorage.getItem('lostFoundChatHistory');
            if (saved) {
                this.chatHistory = JSON.parse(saved);
                // Optionally load last few messages
                this.loadRecentMessages();
            }
        } catch (error) {
            console.warn('Could not load chat history:', error);
        }
    }

    loadRecentMessages() {
        // Load last 5 messages for context
        const recentMessages = this.chatHistory.slice(-5);
        const messagesContainer = document.getElementById('chat-messages');
        
        recentMessages.forEach(msg => {
            this.addMessage(msg.content, msg.sender);
        });
    }

    clearChatHistory() {
        this.chatHistory = [];
        const messagesContainer = document.getElementById('chat-messages');
        messagesContainer.innerHTML = '';
        localStorage.removeItem('lostFoundChatHistory');
    }
}

// Initialize chat when page loads
let aiChatAssistant;

document.addEventListener('DOMContentLoaded', function() {
    // Wait a bit for the page to load completely
    setTimeout(() => {
        aiChatAssistant = new AIChatAssistant();
        
        // Show welcome message after a delay
        setTimeout(() => {
            if (!aiChatAssistant.chatHistory.length) {
                aiChatAssistant.addMessage("Hello! I'm your Lost & Found AI assistant. I can help you report found items, search for lost belongings, or answer any questions about our service. How can I assist you today?", 'assistant');
            }
        }, 1000);
    }, 2000);
});