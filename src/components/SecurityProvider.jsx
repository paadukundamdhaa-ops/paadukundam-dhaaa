import React, { useEffect, useState, createContext, useContext } from 'react';

const SecurityContext = createContext();

export const useSecurity = () => useContext(SecurityContext);

export const SecurityProvider = ({ children }) => {
  const [isBlurred, setIsBlurred] = useState(false);
  const [warningMessage, setWarningMessage] = useState("");

  useEffect(() => {
    // 1. Disable Right Click (Context Menu)
    const handleContextMenu = (e) => {
      e.preventDefault();
    };

    // 2. Disable Specific Keyboard Shortcuts
    const handleKeyDown = (e) => {
      // F12
      if (e.key === 'F12') {
        e.preventDefault();
      }
      
      // Ctrl/Cmd + Shift + I/J/C
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j' || e.key === 'C' || e.key === 'c')) {
        e.preventDefault();
      }

      // Ctrl/Cmd + U (View Source)
      if ((e.ctrlKey || e.metaKey) && (e.key === 'U' || e.key === 'u')) {
        e.preventDefault();
      }

      // Ctrl/Cmd + S (Save)
      if ((e.ctrlKey || e.metaKey) && (e.key === 'S' || e.key === 's')) {
        e.preventDefault();
      }

      // Ctrl/Cmd + P (Print)
      if ((e.ctrlKey || e.metaKey) && (e.key === 'P' || e.key === 'p')) {
        e.preventDefault();
      }

      // Print Screen
      if (e.key === 'PrintScreen') {
        navigator.clipboard.writeText(''); // Attempt to clear clipboard
        setIsBlurred(true);
        setWarningMessage("Screenshots are disabled for security reasons.");
        setTimeout(() => setIsBlurred(false), 3000);
      }
    };

    // 3. Prevent Dragging universally
    const handleDragStart = (e) => {
      if (e.target.tagName.toLowerCase() === 'img') {
        e.preventDefault();
      }
    };

    // 4. Page Visibility API (Blur when losing focus)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsBlurred(true);
      } else {
        setIsBlurred(false);
      }
    };

    // 5. DevTools Detection (Simple Width/Height Delta heuristic)
    const detectDevTools = () => {
      const threshold = 160;
      const widthDelta = window.outerWidth - window.innerWidth > threshold;
      const heightDelta = window.outerHeight - window.innerHeight > threshold;
      
      if (widthDelta || heightDelta) {
        setIsBlurred(true);
        setWarningMessage("Developer Mode Detected. Content Protected.");
      } else if (!document.hidden) {
        // Only unblur if not hidden and no devtools
        setIsBlurred(false);
      }
    };

    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('dragstart', handleDragStart);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Check for DevTools periodically
    const devToolsInterval = setInterval(detectDevTools, 1000);

    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('dragstart', handleDragStart);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(devToolsInterval);
    };
  }, []);

  return (
    <SecurityContext.Provider value={{ isBlurred }}>
      <div 
        className={`min-h-screen transition-all duration-300 ${isBlurred ? 'blur-xl select-none pointer-events-none' : ''}`}
        style={{
          WebkitTouchCallout: 'none', 
          WebkitUserSelect: 'none',
          KhtmlUserSelect: 'none',
          MozUserSelect: 'none',
          msUserSelect: 'none',
          userSelect: 'none'
        }}
      >
        {isBlurred && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40">
            <div className="bg-black/90 p-8 rounded-2xl text-white text-center shadow-2xl border border-white/10 backdrop-blur-md">
              <svg className="w-16 h-16 mx-auto mb-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
              </svg>
              <h2 className="text-2xl font-bold mb-2">Protected Content</h2>
              <p className="text-gray-300">{warningMessage || "Content is hidden while app is out of focus."}</p>
            </div>
          </div>
        )}
        {children}
      </div>
    </SecurityContext.Provider>
  );
};
