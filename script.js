// Configuration
const CONFIG = {
    API_KEY: 'AIzaSyC5EY-X3uDlcqyJBNMSkEVIrFPVfSo7iRY',
    PROJECT_ID: '496393481593',
    PROJECT_NAME: 'projects/496393481593',
    API_URL: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent'
};

// State management
let currentChatId = null;
let chatHistory = [];
let isTyping = false;

// DOM elements
const elements = {
    messageInput: document.getElementById('messageInput'),
    sendBtn: document.getElementById('sendBtn'),
    messagesContainer: document.getElementById('messagesContainer'),
    chatHistory: document.getElementById('chatHistory'),
    newChatBtn: document.getElementById('newChatBtn'),
    loadingOverlay: document.getElementById('loadingOverlay'),
    errorModal: document.getElementById('errorModal'),
    errorMessage: document.getElementById('errorMessage'),
    closeErrorModal: document.getElementById('closeErrorModal'),
    retryBtn: document.getElementById('retryBtn'),
    charCount: document.getElementById('charCount')
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    loadChatHistory();
});

function initializeApp() {
    // Auto-resize textarea
    elements.messageInput.addEventListener('input', function() {
        autoResizeTextarea(this);
        updateCharCount();
        updateSendButton();
    });

    // Handle Enter key
    elements.messageInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (!elements.sendBtn.disabled) {
                sendMessage();
            }
        }
    });

    // Focus input on load
    elements.messageInput.focus();
}

function setupEventListeners() {
    // Send button
    elements.sendBtn.addEventListener('click', sendMessage);

    // New chat button
    elements.newChatBtn.addEventListener('click', startNewChat);

    // Suggestion chips
    document.querySelectorAll('.suggestion-chip').forEach(chip => {
        chip.addEventListener('click', function() {
            const prompt = this.getAttribute('data-prompt');
            elements.messageInput.value = prompt;
            autoResizeTextarea(elements.messageInput);
            updateCharCount();
            updateSendButton();
            sendMessage();
        });
    });

    // Modal controls
    elements.closeErrorModal.addEventListener('click', hideErrorModal);
    elements.retryBtn.addEventListener('click', function() {
        hideErrorModal();
        if (currentRetryFunction) {
            currentRetryFunction();
        }
    });

    // Close modal on overlay click
    elements.errorModal.addEventListener('click', function(e) {
        if (e.target === this) {
            hideErrorModal();
        }
    });

    // Escape key to close modal
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && elements.errorModal.classList.contains('show')) {
            hideErrorModal();
        }
    });
}

function autoResizeTextarea(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
}

function updateCharCount() {
    const count = elements.messageInput.value.length;
    elements.charCount.textContent = `${count}/4000`;
    
    if (count > 3500) {
        elements.charCount.style.color = '#ef4444';
    } else if (count > 3000) {
        elements.charCount.style.color = '#f59e0b';
    } else {
        elements.charCount.style.color = '#64748b';
    }
}

function updateSendButton() {
    const hasText = elements.messageInput.value.trim().length > 0;
    const notTyping = !isTyping;
    elements.sendBtn.disabled = !hasText || !notTyping;
}

async function sendMessage() {
    const message = elements.messageInput.value.trim();
    if (!message || isTyping) return;

    // Clear input
    elements.messageInput.value = '';
    autoResizeTextarea(elements.messageInput);
    updateCharCount();
    updateSendButton();

    // Slash commands: /image and /audio
    if (message.toLowerCase().startsWith('/image ')) {
        const prompt = message.slice(7).trim();
        if (!prompt) return;
        await handleImageCommand(prompt);
        return;
    }
    if (message.toLowerCase().startsWith('/audio ')) {
        const prompt = message.slice(7).trim();
        if (!prompt) return;
        await handleAudioCommand(prompt);
        return;
    }

    // Create new chat if none exists
    if (!currentChatId) {
        currentChatId = generateChatId();
        addChatToHistory(currentChatId, message.substring(0, 50));
    }

    // Add user message to UI
    addMessageToUI('user', message);

    // Show typing indicator
    showTypingIndicator();

    try {
        // Get AI response
        const response = await getAIResponse(message);
        
        // Hide typing indicator
        hideTypingIndicator();
        
        // Add AI response to UI
        addMessageToUI('assistant', response);
        
        // Update chat history
        updateChatHistory(currentChatId, message, response);
        
    } catch (error) {
        console.error('Error getting AI response:', error);
        hideTypingIndicator();
        showError('Failed to get AI response. Please try again.', () => sendMessage());
    }
}

// Slash command handlers
async function handleImageCommand(prompt) {
    // Ensure chat exists
    if (!currentChatId) {
        currentChatId = generateChatId();
        addChatToHistory(currentChatId, prompt.substring(0, 50));
    }

    // Show user's slash command
    addMessageToUI('user', `/image ${prompt}`);
    showTypingIndicator();

    try {
        const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}`;
        hideTypingIndicator();
        addMediaMessageToUI('assistant', 'image', imageUrl, prompt);
        updateChatHistory(currentChatId, `/image ${prompt}`, `IMAGE:${imageUrl}`);
    } catch (error) {
        console.error('Image command failed:', error);
        hideTypingIndicator();
        showError('Failed to generate image. Please try again.');
    }
}

async function handleAudioCommand(prompt) {
    // Ensure chat exists
    if (!currentChatId) {
        currentChatId = generateChatId();
        addChatToHistory(currentChatId, prompt.substring(0, 50));
    }

    addMessageToUI('user', `/audio ${prompt}`);
    showTypingIndicator();

    try {
        // Default voice
        const voice = 'alloy';
        const audioUrl = `https://text.pollinations.ai/${encodeURIComponent(prompt)}?model=openai-audio&voice=${encodeURIComponent(voice)}`;
        hideTypingIndicator();
        addMediaMessageToUI('assistant', 'audio', audioUrl, prompt);
        updateChatHistory(currentChatId, `/audio ${prompt}`, `AUDIO:${audioUrl}`);
    } catch (error) {
        console.error('Audio command failed:', error);
        hideTypingIndicator();
        showError('Failed to generate audio. Please try again.');
    }
}

function addMediaMessageToUI(type, mediaType, url, caption = '') {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;

    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.innerHTML = type === 'user' ? '<i class="fas fa-user"></i>' : '<i class="fas fa-robot"></i>';

    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';

    const bubble = document.createElement('div');
    bubble.className = 'message-bubble';

    if (mediaType === 'image') {
        const img = document.createElement('img');
        img.src = url;
        img.alt = caption || 'Generated image';
        img.loading = 'lazy';
        bubble.appendChild(img);
        if (caption) {
            const cap = document.createElement('div');
            cap.className = 'media-caption';
            cap.textContent = caption;
            bubble.appendChild(cap);
        }
    } else if (mediaType === 'audio') {
        const audio = document.createElement('audio');
        audio.controls = true;
        audio.src = url;
        audio.className = 'audio-player';
        bubble.appendChild(audio);
        if (caption) {
            const cap = document.createElement('div');
            cap.className = 'media-caption';
            cap.textContent = caption;
            bubble.appendChild(cap);
        }
    }

    const time = document.createElement('div');
    time.className = 'message-time';
    time.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    messageContent.appendChild(bubble);
    messageContent.appendChild(time);
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(messageContent);

    const welcomeMessage = document.querySelector('.welcome-message');
    if (welcomeMessage) {
        welcomeMessage.style.display = 'none';
    }

    elements.messagesContainer.appendChild(messageDiv);
    scrollToBottom();
}

async function getAIResponse(message) {
    const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message })
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.success || !data.response) {
        throw new Error(data.error || 'Invalid response format from AI service');
    }

    return data.response;
}

function addMessageToUI(type, content) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.innerHTML = type === 'user' ? '<i class="fas fa-user"></i>' : '<i class="fas fa-robot"></i>';
    
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    
    const bubble = document.createElement('div');
    bubble.className = 'message-bubble';
    bubble.textContent = content;
    
    const time = document.createElement('div');
    time.className = 'message-time';
    time.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    messageContent.appendChild(bubble);
    messageContent.appendChild(time);
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(messageContent);
    
    // Hide welcome message if it exists
    const welcomeMessage = document.querySelector('.welcome-message');
    if (welcomeMessage) {
        welcomeMessage.style.display = 'none';
    }
    
    elements.messagesContainer.appendChild(messageDiv);
    scrollToBottom();
}

function showTypingIndicator() {
    isTyping = true;
    updateSendButton();
    
    const typingDiv = document.createElement('div');
    typingDiv.className = 'typing-indicator';
    typingDiv.id = 'typingIndicator';
    
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.innerHTML = '<i class="fas fa-robot"></i>';
    
    const dots = document.createElement('div');
    dots.className = 'typing-dots';
    dots.innerHTML = '<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>';
    
    typingDiv.appendChild(avatar);
    typingDiv.appendChild(dots);
    elements.messagesContainer.appendChild(typingDiv);
    scrollToBottom();
}

function hideTypingIndicator() {
    isTyping = false;
    updateSendButton();
    
    const typingIndicator = document.getElementById('typingIndicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

function scrollToBottom() {
    elements.messagesContainer.scrollTop = elements.messagesContainer.scrollHeight;
}

function generateChatId() {
    return 'chat_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function startNewChat() {
    currentChatId = null;
    chatHistory = [];
    
    // Clear messages
    elements.messagesContainer.innerHTML = `
        <div class="welcome-message">
            <div class="welcome-icon">
                <i class="fas fa-robot"></i>
            </div>
            <h2>Welcome to AI Assistant</h2>
            <p>Ask me anything! I'm here to help you with questions, creative tasks, analysis, and more.</p>
            <div class="suggestions">
                <div class="suggestion-chip" data-prompt="Explain quantum computing in simple terms">
                    <i class="fas fa-atom"></i>
                    Explain quantum computing
                </div>
                <div class="suggestion-chip" data-prompt="Write a creative story about a time traveler">
                    <i class="fas fa-feather-alt"></i>
                    Write a creative story
                </div>
                <div class="suggestion-chip" data-prompt="Help me plan a healthy meal for the week">
                    <i class="fas fa-utensils"></i>
                    Plan healthy meals
                </div>
                <div class="suggestion-chip" data-prompt="Explain the latest trends in AI technology">
                    <i class="fas fa-brain"></i>
                    AI trends
                </div>
            </div>
        </div>
    `;
    
    // Re-attach event listeners to suggestion chips
    document.querySelectorAll('.suggestion-chip').forEach(chip => {
        chip.addEventListener('click', function() {
            const prompt = this.getAttribute('data-prompt');
            elements.messageInput.value = prompt;
            autoResizeTextarea(elements.messageInput);
            updateCharCount();
            updateSendButton();
            sendMessage();
        });
    });
    
    // Focus input
    elements.messageInput.focus();
    
    // Update chat history UI
    updateChatHistoryUI();
}

function addChatToHistory(chatId, title) {
    const chatItem = {
        id: chatId,
        title: title,
        timestamp: Date.now(),
        messages: []
    };
    
    chatHistory.unshift(chatItem);
    saveChatHistory();
    updateChatHistoryUI();
}

function updateChatHistory(chatId, userMessage, aiResponse) {
    const chat = chatHistory.find(c => c.id === chatId);
    if (chat) {
        chat.messages.push(
            { type: 'user', content: userMessage, timestamp: Date.now() },
            { type: 'assistant', content: aiResponse, timestamp: Date.now() }
        );
        saveChatHistory();
    }
}

function updateChatHistoryUI() {
    elements.chatHistory.innerHTML = '';
    
    chatHistory.forEach(chat => {
        const chatItem = document.createElement('div');
        chatItem.className = 'chat-item';
        if (chat.id === currentChatId) {
            chatItem.classList.add('active');
        }
        
        chatItem.innerHTML = `
            <div class="chat-item-title">${chat.title}</div>
            <div class="chat-item-time">${new Date(chat.timestamp).toLocaleDateString()}</div>
        `;
        
        chatItem.addEventListener('click', () => loadChat(chat.id));
        elements.chatHistory.appendChild(chatItem);
    });
}

function loadChat(chatId) {
    const chat = chatHistory.find(c => c.id === chatId);
    if (!chat) return;
    
    currentChatId = chatId;
    
    // Clear messages
    elements.messagesContainer.innerHTML = '';
    
    // Load messages
    chat.messages.forEach(message => {
        addMessageToUI(message.type, message.content);
    });
    
    // Update UI
    updateChatHistoryUI();
    elements.messageInput.focus();
}

function saveChatHistory() {
    try {
        localStorage.setItem('aiChatHistory', JSON.stringify(chatHistory));
    } catch (error) {
        console.error('Failed to save chat history:', error);
    }
}

function loadChatHistory() {
    try {
        const saved = localStorage.getItem('aiChatHistory');
        if (saved) {
            chatHistory = JSON.parse(saved);
            updateChatHistoryUI();
        }
    } catch (error) {
        console.error('Failed to load chat history:', error);
        chatHistory = [];
    }
}

let currentRetryFunction = null;

function showError(message, retryFunction = null) {
    elements.errorMessage.textContent = message;
    currentRetryFunction = retryFunction;
    elements.retryBtn.style.display = retryFunction ? 'block' : 'none';
    elements.errorModal.classList.add('show');
}

function hideErrorModal() {
    elements.errorModal.classList.remove('show');
    currentRetryFunction = null;
}

// Utility functions
function formatTime(timestamp) {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDate(timestamp) {
    return new Date(timestamp).toLocaleDateString();
}

// Handle page visibility changes
document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        // Page is hidden, save state
        saveChatHistory();
    }
});

// Handle beforeunload
window.addEventListener('beforeunload', function() {
    saveChatHistory();
});

// Error handling for unhandled promises
window.addEventListener('unhandledrejection', function(event) {
    console.error('Unhandled promise rejection:', event.reason);
    showError('An unexpected error occurred. Please try again.');
    event.preventDefault();
});

// Global error handler
window.addEventListener('error', function(event) {
    console.error('Global error:', event.error);
    showError('An unexpected error occurred. Please refresh the page.');
});
