import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { ToastProvider } from './components/ToastProvider';
import './styles/globals.css';

// Safely locate the root container
const container = document.getElementById('root');
if (!container) {
	throw new Error('Root element with id="root" not found in index.html');
}

// Create and render the React root with StrictMode for highlighting potential issues
const root = createRoot(container);
root.render(
	<React.StrictMode>
		<ToastProvider>
			<App />
		</ToastProvider>
	</React.StrictMode>
);
