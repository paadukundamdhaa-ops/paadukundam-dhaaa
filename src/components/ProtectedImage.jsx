import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';

export const ProtectedImage = ({ src, alt, className = '', crossOrigin, style = {} }) => {
  const { user } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef(null);

  // Lazy loading observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          // Optional: we can disconnect after it's loaded once, or keep it to unload off-screen
        } else {
          // Unload if far off-screen for Layer 16 (Secure Lazy Loading)
          setIsVisible(false);
        }
      },
      { rootMargin: '200px' }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) observer.unobserve(containerRef.current);
    };
  }, []);

  // Generate Watermark SVG logic
  const getWatermarkUrl = () => {
    const text = user?.email 
      ? `${user.email} | ${new Date().toLocaleString('en-IN')} | UID: ${user.id.substring(0, 8)}`
      : '© Paadukundamdhaa';

    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="350" height="150" opacity="0.08" transform="rotate(-30)">
        <text x="10" y="75" font-family="Arial, sans-serif" font-size="12" fill="white" font-weight="bold">${text}</text>
      </svg>
    `;
    
    // We encode the SVG to base64 so it can be used as a background image
    const base64 = btoa(unescape(encodeURIComponent(svg)));
    return `url('data:image/svg+xml;base64,${base64}')`;
  };

  return (
    <div 
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      style={{
        ...style,
        // Layer 6, 15, 22: Disable selection and touch callouts strictly on the wrapper
        WebkitTouchCallout: 'none',
        WebkitUserSelect: 'none',
        KhtmlUserSelect: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none',
        userSelect: 'none',
      }}
      onContextMenu={(e) => e.preventDefault()}
    >
      {isVisible ? (
        <>
          {/* Layer 7: Actual Image, disabled pointer events */}
          <img
            src={src || ''}
            alt={alt}
            className="w-full h-full object-cover"
            style={{
              pointerEvents: 'none', // Prevents direct clicking/dragging
              userSelect: 'none',
            }}
            draggable={false}
            crossOrigin={crossOrigin}
          />
          
          {/* Layer 7 & 8 & 9: Transparent Overlay + Dynamic Watermark */}
          <div 
            className="absolute inset-0 z-10 pointer-events-auto"
            style={{
              backgroundImage: getWatermarkUrl(),
              backgroundRepeat: 'repeat',
              backgroundPosition: 'center',
            }}
            onContextMenu={(e) => e.preventDefault()}
            onDragStart={(e) => e.preventDefault()}
          />
        </>
      ) : (
        <div className="w-full h-full bg-gray-900/10 animate-pulse" />
      )}
    </div>
  );
};
