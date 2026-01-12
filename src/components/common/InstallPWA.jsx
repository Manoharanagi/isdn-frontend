import React, { useState, useEffect } from 'react';

/**
 * InstallPWA Component
 *
 * Prompts users to install the app as a PWA when available.
 * Shows at bottom of screen with install/dismiss options.
 */
export default function InstallPWA() {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [showInstall, setShowInstall] = useState(false);

    useEffect(() => {
        // Listen for the beforeinstallprompt event
        const handler = (e) => {
            // Prevent the mini-infobar from appearing on mobile
            e.preventDefault();
            // Stash the event so it can be triggered later
            setDeferredPrompt(e);
            // Show the install prompt
            setShowInstall(true);

            console.log('PWA install prompt available');
        };

        window.addEventListener('beforeinstallprompt', handler);

        // Check if app is already installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
            console.log('App is already installed');
        }

        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) {
            console.log('No deferred prompt available');
            return;
        }

        // Show the install prompt
        deferredPrompt.prompt();

        // Wait for the user's response
        const { outcome } = await deferredPrompt.userChoice;

        console.log(`User ${outcome === 'accepted' ? 'accepted' : 'dismissed'} the install prompt`);

        // Clear the deferred prompt
        setDeferredPrompt(null);
        setShowInstall(false);

        // Log the installation
        if (outcome === 'accepted') {
            console.log('✅ PWA installed successfully!');
        }
    };

    const handleDismiss = () => {
        setShowInstall(false);
        console.log('Install prompt dismissed');

        // Show again after 7 days
        const dismissedAt = Date.now();
        localStorage.setItem('pwa-install-dismissed', dismissedAt.toString());
    };

    // Check if user previously dismissed
    useEffect(() => {
        const dismissedAt = localStorage.getItem('pwa-install-dismissed');
        if (dismissedAt) {
            const daysSinceDismissed = (Date.now() - parseInt(dismissedAt)) / (1000 * 60 * 60 * 24);
            if (daysSinceDismissed < 7) {
                setShowInstall(false);
            }
        }
    }, []);

    if (!showInstall) return null;

    return (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-white rounded-lg shadow-2xl p-4 z-50 border-2 border-blue-500 animate-slide-up">
            <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                    <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                </div>
                <div className="flex-grow">
                    <h3 className="font-bold text-gray-900 mb-1 text-lg">Install ISDN Driver App</h3>
                    <p className="text-sm text-gray-600 mb-3">
                        Install this app on your device for:
                    </p>
                    <ul className="text-sm text-gray-600 mb-3 space-y-1">
                        <li className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Quick access from home screen
                        </li>
                        <li className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Works offline
                        </li>
                        <li className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Push notifications
                        </li>
                    </ul>
                    <div className="flex gap-2">
                        <button
                            onClick={handleInstall}
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
                        >
                            Install Now
                        </button>
                        <button
                            onClick={handleDismiss}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition"
                        >
                            Later
                        </button>
                    </div>
                </div>
                <button
                    onClick={handleDismiss}
                    className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition"
                    aria-label="Close"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>
    );
}
