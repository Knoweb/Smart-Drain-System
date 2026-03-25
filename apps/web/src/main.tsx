/**
 * MAIN ENTRY POINT — src/main.tsx
 * ---------------------------------------------------------------------------
 * This is the file Vite loads first. It mounts the React app into the
 * <div id="root"> in index.html.
 * StrictMode is kept ON during development — it intentionally double-renders
 * components to help detect side-effect bugs.
 */

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import '@/styles/globals.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
)
