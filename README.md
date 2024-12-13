# Integrated AI Chat Interface

An advanced user interface for interacting with multiple AI models (ChatGPT, Claude, Gemini) in a unified and elegant interface.

![Project Interface](images/screenshot.png)

## Features

### Model Management
- Multi-model support: ChatGPT, Claude, Gemini
- Easy model addition and removal
- Automatic API key validation
- Seamless switching between models

### User Interface
- Modern and elegant design
- Dark/Light mode
- Animated loading indicators
- Smooth transitions
- Seamless scrolling
- Responsive user experience

### Security
- Secure API key storage in Local Storage
- API key validation
- Clear error messages in Arabic

## Requirements
- API key for each model you want to use:
  - ChatGPT: OpenAI API key
  - Claude: Anthropic API key
  - Gemini: Google AI API key

## How to Use

1. **Adding a Model**
   - Click the "Add Model" button
   - Select the desired model
   - Enter your API key
   - Wait for key validation

2. **Sending Messages**
   - Select the model you want to use
   - Type your message in the text box
   - Click send or press Enter

3. **Customizing the Interface**
   - Use the theme toggle to switch between dark and light modes
   - Your preferences are automatically saved

## Security & Privacy
- API keys are stored in browser's Local Storage
- No API keys are shared with external servers
- Keys are validated directly with official API endpoints

## Project Structure
```
├── index.html      # Main page structure
├── style.css       # CSS styles
├── script.js       # JavaScript logic
├── README.md       # English documentation
└── README_ar.md    # Arabic documentation
```

## Recent Updates
- Improved header design and organization
- Added smooth scrolling without visible scrollbar
- Improved control button positioning and sizing
- Enhanced dark/light mode user experience

## Code Organization

### JavaScript (script.js)
- `ChatInterface` class manages all functionality
- Methods are organized by feature:
  - Model management
  - Theme handling
  - API interactions
  - UI updates

### CSS (style.css)
- Organized by components:
  - Core variables and themes
  - Layout structure
  - Header components
  - Chat interface
  - Modal and forms

### HTML (index.html)
- Clean semantic structure
- Modular component organization
- Responsive layout design
