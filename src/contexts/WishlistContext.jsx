import React, { createContext, useContext, useState, useEffect } from 'react';

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem('padukundam-wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('Error loading wishlist from localStorage', e);
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('padukundam-wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  const toggleWishlist = (event) => {
    setWishlist(prev => {
      const isSaved = prev.some(item => item.id === event.id);
      if (isSaved) {
        return prev.filter(item => item.id !== event.id);
      } else {
        // Just store the essential data for display
        const savedEvent = {
          id: event.id,
          title: event.title,
          date: event.date || '',
          month: event.month || '',
          img: event.img || event.image_url, 
          venue: event.venue || '',
          price: event.price || 0,
          displayStatus: event.displayStatus || 'LIVE'
        };
        return [...prev, savedEvent];
      }
    });
  };

  const isInWishlist = (eventId) => {
    return wishlist.some(item => item.id === eventId);
  };

  return (
    <WishlistContext.Provider value={{ wishlist, toggleWishlist, isInWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
}

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlist must be used within WishlistProvider');
  return context;
};
