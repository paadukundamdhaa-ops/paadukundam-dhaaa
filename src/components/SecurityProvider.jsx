import React, { useEffect, useState, createContext, useContext } from 'react';

const SecurityContext = createContext();

export const useSecurity = () => useContext(SecurityContext);

export const SecurityProvider = ({ children }) => {
  const [isBlurred, setIsBlurred] = useState(false);
  const [warningMessage, setWarningMessage] = useState("");

  useEffect(() => {
    // 1. Disable Right Click (Context Menu) - Removed for inspect access
    const handleContextMenu = (e) => {
      // e.preventDefault();
    };

    // 2. Disable Specific Keyboard Shortcuts
    const handleKeyDown = (e) => {
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

    // 5. DevTools Detection - Removed for inspect access
    const detectDevTools = () => {
      // Intentionally left blank to allow DevTools
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
          // WebkitTouchCallout: 'none', 
          // WebkitUserSelect: 'none',
          // KhtmlUserSelect: 'none',
          // MozUserSelect: 'none',
          // msUserSelect: 'none',
          // userSelect: 'none'
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
