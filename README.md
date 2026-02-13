# 💨 FartCaster

**Decentralized Flatulence Protocol** - Record your farts, earn FART tokens! 

A hilarious parody app built with React that lets you record audio (farts or any sounds), upload audio files, and earn mock cryptocurrency tokens.

## 🚀 Features

- 🎙️ **Real Audio Recording** - Use your microphone to record live audio
- 📤 **File Upload** - Upload existing audio files
- 💰 **Token System** - Earn FART tokens based on recording duration
- 💾 **Persistent Storage** - All recordings and tokens saved in browser localStorage
- 🔊 **Playback** - Play back your recordings anytime
- 📊 **Stats Tracking** - See play counts and ratings for each recording
- 🎨 **Beautiful UI** - Gradient backgrounds, smooth animations, and responsive design

## 🛠️ Quick Start

### Option 1: Deploy to Vercel (Recommended)

1. **Fork this repository** on GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your forked repository
5. Click "Deploy"
6. Done! Your app is live! 🎉

### Option 2: Run Locally

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/fartcaster.git
cd fartcaster

# Install dependencies
npm install

# Start development server
npm start
```

The app will open at [http://localhost:3000](http://localhost:3000)

### Option 3: Build for Production

```bash
# Install dependencies
npm install

# Create production build
npm run build

# The build folder is ready to deploy
```

## 📦 What's Inside

```
fartcaster/
├── public/
│   └── index.html          # HTML template
├── src/
│   ├── App.js             # Main FartCaster component
│   ├── index.js           # Entry point
│   └── index.css          # Tailwind CSS imports
├── package.json           # Dependencies
├── tailwind.config.js     # Tailwind configuration
└── README.md             # You are here!
```

## 🎮 How to Use

1. **Choose a Username** - Enter your username when you first open the app
2. **Record Audio** - Click the red microphone button and grant mic permissions
3. **Upload Files** - Or click the purple upload button to upload existing audio files
4. **Earn Tokens** - Longer recordings = more FART tokens!
5. **Play & Manage** - Click play to listen, or delete recordings you don't want

## 🌐 Deploy to Other Platforms

### Netlify
1. Drag and drop the `build` folder to [netlify.com/drop](https://app.netlify.com/drop)

### GitHub Pages
```bash
npm install --save-dev gh-pages

# Add to package.json:
"homepage": "https://YOUR_USERNAME.github.io/fartcaster",
"scripts": {
  "predeploy": "npm run build",
  "deploy": "gh-pages -d build"
}

# Deploy
npm run deploy
```

### Render
1. Connect your GitHub repo to [render.com](https://render.com)
2. Select "Static Site"
3. Build command: `npm run build`
4. Publish directory: `build`

## 🔧 Technologies Used

- **React** - UI framework
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **Web Audio API** - Recording functionality
- **localStorage** - Data persistence

## 📱 Browser Compatibility

- ✅ Chrome/Edge (recommended)
- ✅ Firefox
- ✅ Safari (requires microphone permissions)
- ⚠️ Mobile browsers (recording may vary by device)

## 🎨 Customization

Want to customize FartCaster? Here's what you can change:

- **Token calculation**: Edit `saveRecording()` in `src/App.js`
- **Colors/styling**: Modify Tailwind classes in JSX
- **Max recordings**: Change `.slice(0, 20)` in `saveRecording()`
- **Token name**: Find/replace "FART" with your token name

## 🤝 Contributing

This is a parody project, but contributions are welcome!

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is open source and available under the MIT License.

## ⚠️ Disclaimer

FartCaster is a parody/joke application. FART tokens have no real monetary value. This app stores all data locally in your browser - no blockchain involved (yet? 😏).

## 🎉 Credits

Built with love (and laughs) as a demonstration of React, Web Audio API, and modern web development.

---

**Made with 💨 by the FartCaster team**

For issues, suggestions, or just to share your best recordings, open an issue on GitHub!
