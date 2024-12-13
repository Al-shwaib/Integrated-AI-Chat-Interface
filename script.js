class ChatInterface {
    constructor() {
        this.chatMessages = document.getElementById('chatMessages');
        this.userInput = document.getElementById('userInput');
        this.sendButton = document.getElementById('sendButton');
        this.themeToggle = document.getElementById('themeToggle');
        this.modelSelector = document.getElementById('modelSelector');
        this.addModelBtn = document.getElementById('addModel');
        this.apiModal = document.getElementById('apiModal');
        this.modelSelect = document.getElementById('modelSelect');
        this.apiKeyInput = document.getElementById('apiKey');
        this.saveApiKeyBtn = document.getElementById('saveApiKey');
        this.cancelApiKeyBtn = document.getElementById('cancelApiKey');
        this.apiStatus = document.getElementById('apiStatus');
        
        this.currentModel = null;
        this.models = this.loadModels();
        
        this.initializeEventListeners();
        this.initializeTheme();
        this.initializeModels();
        this.adjustTextareaHeight();
    }

    initializeEventListeners() {
        // Chat event listeners
        this.sendButton.addEventListener('click', () => this.sendMessage());
        this.userInput.addEventListener('input', () => this.adjustTextareaHeight());
        this.userInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                if (e.shiftKey) {
                    setTimeout(() => this.adjustTextareaHeight(), 0);
                } else {
                    e.preventDefault();
                    this.sendMessage();
                }
            }
        });
        
        // Theme toggle
        this.themeToggle.addEventListener('click', () => {
            const currentTheme = document.body.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            this.applyTheme(newTheme);
        });

        // Model management
        this.addModelBtn.addEventListener('click', () => this.showApiModal());
        this.saveApiKeyBtn.addEventListener('click', () => this.saveApiKey());
        this.cancelApiKeyBtn.addEventListener('click', () => this.hideApiModal());
        
        this.modelSelector.addEventListener('click', (e) => {
            const modelButton = e.target.closest('.model-button:not(.add-model)');
            if (modelButton) {
                if (e.target.classList.contains('remove-icon')) {
                    this.removeModel(modelButton.dataset.model);
                } else {
                    this.setActiveModel(modelButton.dataset.model);
                }
            }
        });

        // API key validation on input
        this.apiKeyInput.addEventListener('input', () => {
            this.apiStatus.className = 'api-status';
            this.apiStatus.textContent = '';
        });
    }

    loadModels() {
        const savedModels = localStorage.getItem('models');
        return savedModels ? JSON.parse(savedModels) : {};
    }

    saveModels() {
        localStorage.setItem('models', JSON.stringify(this.models));
    }

    initializeModels() {
        // Add saved models to the UI
        const modelEntries = Object.entries(this.models);
        modelEntries.forEach(([model, data]) => {
            this.addModelButton(model, data.status === 'active');
        });

        // Select the last used model if available
        if (modelEntries.length > 0) {
            const lastModel = modelEntries[modelEntries.length - 1][0];
            this.setActiveModel(lastModel);
        }
    }

    showApiModal() {
        // Update model select options to only show unselected models
        const modelSelect = document.getElementById('modelSelect');
        modelSelect.innerHTML = ''; // Clear existing options
        
        const availableModels = {
            'gemini': 'Gemini',
            'chatgpt': 'ChatGPT',
            'claude': 'Claude'
        };

        // Only show models that haven't been added yet
        Object.entries(availableModels).forEach(([value, text]) => {
            if (!this.models[value]) {
                const option = document.createElement('option');
                option.value = value;
                option.textContent = text;
                modelSelect.appendChild(option);
            }
        });

        // If no models are available, show message and return
        if (modelSelect.options.length === 0) {
            alert('تم إضافة جميع النماذج المتاحة. يرجى حذف نموذج لإضافة نموذج جديد.');
            return;
        }

        this.apiModal.classList.add('show');
        this.apiStatus.className = 'api-status';
        this.apiStatus.textContent = '';
        this.apiKeyInput.value = '';
    }

    hideApiModal() {
        this.apiModal.classList.remove('show');
        this.apiKeyInput.value = '';
        this.apiStatus.className = 'api-status';
        this.apiStatus.textContent = '';
    }

    async validateApiKey(model, apiKey) {
        this.apiStatus.className = 'api-status loading';
        this.apiStatus.innerHTML = `
            <div class="loading-spinner"></div>
            <div>جاري التحقق من مفتاح API</div>
        `;

        try {
            // Example API validation for different models
            let isValid = false;
            
            switch(model) {
                case 'chatgpt':
                    // OpenAI API validation
                    const response = await fetch('https://api.openai.com/v1/models', {
                        headers: {
                            'Authorization': `Bearer ${apiKey}`
                        }
                    });
                    isValid = response.ok;
                    break;
                    
                case 'claude':
                    // Claude API validation
                    // Add your Claude API validation logic here
                    isValid = apiKey.startsWith('claude-');
                    break;
                    
                case 'gemini':
                    // Gemini API validation
                    // Add your Gemini API validation logic here
                    isValid = apiKey.length > 20;
                    break;
            }

            if (isValid) {
                this.apiStatus.className = 'api-status success';
                this.apiStatus.textContent = 'مفتاح API صالح';
            } else {
                this.apiStatus.className = 'api-status error';
                this.apiStatus.textContent = 'مفتاح API غير صالح';
            }

            return isValid;
        } catch (error) {
            this.apiStatus.className = 'api-status error';
            this.apiStatus.textContent = 'حدث خطأ أثناء التحقق من مفتاح API';
            return false;
        }
    }

    async checkApiStatus(model, apiKey) {
        try {
            const isValid = await this.validateApiKey(model, apiKey);
            return isValid ? 'active' : 'disabled';
        } catch {
            return 'disabled';
        }
    }

    async saveApiKey() {
        const model = this.modelSelect.value;
        const apiKey = this.apiKeyInput.value.trim();
        
        // Check if model already exists
        if (this.models[model]) {
            this.apiStatus.className = 'api-status error';
            this.apiStatus.textContent = 'هذا النموذج موجود بالفعل';
            return;
        }
        
        if (!apiKey) {
            this.apiStatus.className = 'api-status error';
            this.apiStatus.textContent = 'الرجاء إدخال مفتاح API';
            return;
        }

        try {
            const isValid = await this.validateApiKey(model, apiKey);
            if (isValid) {
                const status = await this.checkApiStatus(model, apiKey);
                this.models[model] = {
                    apiKey: apiKey,
                    status: status
                };
                this.saveModels();
                this.addModelButton(model, status === 'active');
                
                // Set this as the active model
                setTimeout(() => {
                    this.hideApiModal();
                    this.setActiveModel(model);
                }, 1000);
            }
        } catch (error) {
            this.apiStatus.className = 'api-status error';
            this.apiStatus.textContent = 'حدث خطأ أثناء حفظ مفتاح API';
        }
    }

    addModelButton(model, isActive = true) {
        const modelNames = {
            'gemini': 'Gemini',
            'chatgpt': 'ChatGPT',
            'claude': 'Claude'
        };

        // Remove existing button if it exists
        const existingButton = this.modelSelector.querySelector(`[data-model="${model}"]`);
        if (existingButton) {
            existingButton.remove();
        }

        const button = document.createElement('button');
        button.className = `model-button ${!isActive ? 'disabled' : ''}`;
        button.dataset.model = model;
        button.innerHTML = `
            ${modelNames[model]}
            <span class="remove-icon">×</span>
        `;

        // Insert before the add button
        this.modelSelector.insertBefore(button, this.addModelBtn);
    }

    removeModel(model) {
        const button = this.modelSelector.querySelector(`[data-model="${model}"]`);
        if (button) {
            if (button.classList.contains('active')) {
                this.currentModel = null;
            }
            button.remove();
            delete this.models[model];
            this.saveModels();
        }
    }

    async setActiveModel(model) {
        const modelData = this.models[model];
        if (!modelData) {
            alert('الرجاء إضافة مفتاح API أولاً');
            return;
        }

        // Check if API is still valid
        const status = await this.checkApiStatus(model, modelData.apiKey);
        if (status === 'disabled') {
            alert('مفتاح API غير صالح أو منتهي الصلاحية');
            this.addModelButton(model, false);
            return;
        }

        this.currentModel = model;
        this.modelSelector.querySelectorAll('.model-button').forEach(button => {
            button.classList.toggle('active', button.dataset.model === model);
        });
    }

    adjustTextareaHeight() {
        const textarea = this.userInput;
        // Reset height to auto to get the correct scrollHeight
        textarea.style.height = 'auto';
        
        // Calculate new height
        const newHeight = Math.min(Math.max(textarea.scrollHeight, 50), 200);
        
        // Set new height
        textarea.style.height = newHeight + 'px';
        
        // Adjust input container padding if needed
        const inputContainer = textarea.closest('.input-container');
        if (inputContainer) {
            const extraPadding = newHeight > 50 ? 10 : 0;
            inputContainer.style.paddingTop = (15 + extraPadding) + 'px';
            inputContainer.style.paddingBottom = (15 + extraPadding) + 'px';
        }
    }

    initializeTheme() {
        const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
        const getCurrentTheme = () => {
            const savedTheme = localStorage.getItem('theme');
            if (savedTheme) {
                return savedTheme;
            }
            return prefersDarkScheme.matches ? 'dark' : 'light';
        };
        this.applyTheme(getCurrentTheme());
        prefersDarkScheme.addEventListener('change', (e) => {
            if (!localStorage.getItem('theme')) {
                this.applyTheme(e.matches ? 'dark' : 'light');
            }
        });
    }

    applyTheme(theme) {
        document.body.setAttribute('data-theme', theme);
        this.themeToggle.textContent = theme === 'dark' ? 'الوضع النهاري' : 'الوضع الليلي';
        localStorage.setItem('theme', theme);
    }

    async sendMessage() {
        if (!this.currentModel) {
            alert('الرجاء اختيار نموذج للمحادثة');
            return;
        }

        const message = this.userInput.value.trim();
        if (!message) return;

        // Add user message to chat
        this.addMessageToChat(message, 'user');
        
        // Clear input and reset height
        this.userInput.value = '';
        this.userInput.style.height = '50px';
        
        // Reset input container padding
        const inputContainer = this.userInput.closest('.input-container');
        if (inputContainer) {
            inputContainer.style.paddingTop = '15px';
            inputContainer.style.paddingBottom = '15px';
        }

        // Show loading indicator with typing animation
        this.showLoading();

        try {
            const response = await this.fetchGPTResponse(message);
            this.hideLoading();
            this.addMessageToChat(response, 'bot');
        } catch (error) {
            this.hideLoading();
            this.addMessageToChat(error.message || 'عذراً، حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى.', 'bot', true);
            console.error('Error:', error);
        }
    }

    async fetchGPTResponse(message) {
        const modelData = this.models[this.currentModel];
        if (!modelData) {
            throw new Error('لم يتم العثور على مفتاح API للنموذج');
        }

        try {
            let response;
            switch(this.currentModel) {
                case 'chatgpt':
                    response = await this.callOpenAI(message, modelData.apiKey);
                    break;
                case 'claude':
                    response = await this.callClaude(message, modelData.apiKey);
                    break;
                case 'gemini':
                    response = await this.callGemini(message, modelData.apiKey);
                    break;
                default:
                    throw new Error('نموذج غير مدعوم');
            }
            return response;
        } catch (error) {
            console.error('Error:', error);
            throw new Error(`حدث خطأ أثناء الاتصال بـ ${this.currentModel}: ${error.message}`);
        }
    }

    async callOpenAI(message, apiKey) {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [
                    {
                        role: 'user',
                        content: message
                    }
                ],
                temperature: 0.7
            })
        });

        if (!response.ok) {
            throw new Error('فشل في الاتصال بـ OpenAI');
        }

        const data = await response.json();
        return data.choices[0].message.content;
    }

    async callClaude(message, apiKey) {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: 'claude-2',
                max_tokens: 1000,
                messages: [
                    {
                        role: 'user',
                        content: message
                    }
                ]
            })
        });

        if (!response.ok) {
            throw new Error('فشل في الاتصال بـ Claude');
        }

        const data = await response.json();
        return data.content[0].text;
    }

    async callGemini(message, apiKey) {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: message
                    }]
                }]
            })
        });

        if (!response.ok) {
            throw new Error('فشل في الاتصال بـ Gemini');
        }

        const data = await response.json();
        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
            return data.candidates[0].content.parts[0].text;
        } else {
            throw new Error('لم يتم استلام رد صحيح من Gemini');
        }
    }

    addMessageToChat(message, sender, isError = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${sender}-message`;
        if (isError) messageDiv.classList.add('error-message');
        
        // Split message into paragraphs
        const paragraphs = message.split('\n');
        paragraphs.forEach((paragraph, index) => {
            if (paragraph.trim()) {
                const p = document.createElement('p');
                p.textContent = paragraph;
                messageDiv.appendChild(p);
                
                // Add spacing between paragraphs
                if (index < paragraphs.length - 1) {
                    messageDiv.appendChild(document.createElement('br'));
                }
            }
        });

        this.chatMessages.appendChild(messageDiv);
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }

    showLoading() {
        const typingIndicator = document.createElement('div');
        typingIndicator.className = 'typing-indicator';
        typingIndicator.id = 'typingIndicator';
        typingIndicator.innerHTML = `
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
        `;
        this.chatMessages.appendChild(typingIndicator);
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }

    hideLoading() {
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }
}

// Initialize the chat interface when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new ChatInterface();
});
