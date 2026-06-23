import React from 'react';
import { Loader2 } from 'lucide-react';

export default function Loading({ fullScreen = true, message = "Loading..." }) {
  const containerClass = fullScreen 
    ? "min-h-screen flex flex-col items-center justify-center bg-gray-50" 
    : "w-full py-12 flex flex-col items-center justify-center";

  return (
    <div className={containerClass}>
      <div className="relative">
        <div className="absolute inset-0 bg-primary blur-xl opacity-30 rounded-full animate-pulse"></div>
        <Loader2 size={48} className="text-primary animate-spin relative z-10" />
      </div>
      <p className="mt-4 text-sm font-bold text-gray-500 tracking-widest uppercase animate-pulse">{message}</p>
    </div>
  );
}
