# AI Chat Assistant

A modern, ChatGPT-like web application powered by Google's Gemini AI. Features a sleek interface with real-time chat, message history, and responsive design.

## Features

- 🤖 **AI-Powered Chat**: Uses Google Gemini Pro API for intelligent conversations
- 💬 **Real-time Messaging**: Instant responses with typing indicators
- 📱 **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- 💾 **Chat History**: Automatically saves and manages conversation history
- 🎨 **Modern UI**: Clean, professional interface with smooth animations
- ⚡ **Fast & Lightweight**: Optimized for performance and speed
- 🔒 **Error Handling**: Robust error handling with user-friendly messages
- 🖼️ **Image Generation**: `/image <prompt>` via Pollinations
- 🔊 **Audio Generation**: `/audio <prompt>` via Pollinations (audio player)

## Getting Started

1. **Open the Application**: Simply open `index.html` in your web browser
2. **Start Chatting**: Type your message and press Enter or click the send button
3. **Try Suggestions**: Click on the suggestion chips to get started quickly
4. **Manage Chats**: Use the sidebar to create new chats and view history

## API Configuration

The application is pre-configured with your Gemini API credentials:
- **API Key**: `AIzaSyC5EY-X3uDlcqyJBNMSkEVIrFPVfSo7iRY`
- **Project ID**: `496393481593`
- **Project Name**: `projects/496393481593`

## File Structure

```
├── index.html          # Main HTML file
├── styles.css          # CSS styles and responsive design
├── script.js           # JavaScript functionality and API integration
└── README.md           # This file
```

## Features in Detail

### Chat Interface
- Clean, modern design inspired by ChatGPT
- Auto-resizing text input
- Character counter (4000 character limit)
- Send button with loading states

### AI Integration
- Uses Google Gemini Pro model
- Configurable temperature and safety settings
- Proper error handling for API failures
- Retry functionality for failed requests

### User Experience
- Smooth animations and transitions
- Typing indicators during AI responses
- Message timestamps
- Responsive design for all screen sizes
- Keyboard shortcuts (Enter to send, Shift+Enter for new line)
- Slash commands: `/image` and `/audio`

### Data Management
- Local storage for chat history
- Automatic saving of conversations
- Chat management (new chat, load previous chats)
- Persistent state across browser sessions

## Browser Compatibility

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Security Notes

- API key is embedded in the client-side code for simplicity
- For production use, consider implementing server-side API calls
- All data is stored locally in the browser

## Troubleshooting

### Common Issues

1. **API Errors**: Check your internet connection and API key validity
2. **Messages Not Sending**: Ensure the input field has content and try again
3. **Chat History Not Loading**: Clear browser cache and try again

### Error Messages

The application includes comprehensive error handling with user-friendly messages for common issues like:
- Network connectivity problems
- API rate limiting
- Invalid responses
- Browser compatibility issues

## Customization

You can easily customize the application by modifying:
- **Colors**: Update CSS variables in `styles.css`
- **API Settings**: Modify the CONFIG object in `script.js`
- **UI Elements**: Edit the HTML structure in `index.html`
- **Features**: Add new functionality in `script.js`

## Pollinations Slash Commands

### Image
Type:

```
/image a cyberpunk city at night, neon lights, rain, ultra-detailed
```

This will fetch and display an image from:

```
GET https://image.pollinations.ai/prompt/{prompt}
```

### Audio
Type:

```
/audio motivational speech about perseverance
```

This will fetch and play audio from:

```
GET https://text.pollinations.ai/{prompt}?model=openai-audio&voice=alloy
```

## Support

If you encounter any issues or have questions, please check the browser console for error messages and ensure your API credentials are correct.

---

**Note**: This application is for demonstration purposes. For production use, consider implementing proper security measures and server-side API handling.
