import React from 'react';
import { Home, Rocket, Store, User, Wifi, Battery, Signal } from 'lucide-react';
import { TabType, DeviceFrame } from '../types';

interface MobileDeviceFrameProps {
  deviceFrame: DeviceFrame;
  activeTab: TabType;
  onNavigateTab: (tab: TabType) => void;
  children: React.ReactNode;
}

export const MobileDeviceFrame: React.FC<MobileDeviceFrameProps> = ({
  deviceFrame,
  activeTab,
  onNavigateTab,
  children,
}) => {
  const isFullscreen = deviceFrame === 'fullscreen';

  if (isFullscreen) {
    return (
      <div className="w-full min-h-[calc(100vh-65px)] bg-slate-50 flex flex-col justify-between relative max-w-2xl mx-auto">
        <div className="flex-1">{children}</div>

        {/* Bottom Shell Navigation */}
        <nav className="sticky bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-2.5 flex items-center justify-around z-40 shadow-sm">
          <button
            onClick={() => onNavigateTab('home')}
            className={`flex flex-col items-center gap-1 transition-all ${
              activeTab === 'home' ? 'text-[#7C3AED]' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-[10px] font-bold">Home</span>
          </button>
          <button
            onClick={() => onNavigateTab('mission')}
            className={`flex flex-col items-center gap-1 transition-all ${
              activeTab === 'mission' ? 'text-[#7C3AED]' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Rocket className="w-5 h-5" />
            <span className="text-[10px] font-bold">Mission</span>
          </button>
          <button
            onClick={() => onNavigateTab('marketplace')}
            className={`flex flex-col items-center gap-1 transition-all ${
              activeTab === 'marketplace' ? 'text-[#7C3AED]' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Store className="w-5 h-5" />
            <span className="text-[10px] font-bold">Marketplace</span>
          </button>
          <button
            onClick={() => onNavigateTab('profile')}
            className={`flex flex-col items-center gap-1 transition-all ${
              activeTab === 'profile' ? 'text-[#7C3AED]' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <User className="w-5 h-5" />
            <span className="text-[10px] font-bold">Profile</span>
          </button>
        </nav>
      </div>
    );
  }

  // iPhone 16 Pro & Pixel 9 distinct device frames
  const isIPhone = deviceFrame === 'iphone16';

  return (
    <div className="py-6 flex justify-center items-center select-none">
      <div
        className={`relative w-[385px] h-[790px] bg-slate-50 flex flex-col overflow-hidden shadow-2xl transition-all duration-300 ${
          isIPhone
            ? 'rounded-[50px] border-[10px] border-slate-900 shadow-slate-900/25'
            : 'rounded-[38px] border-[10px] border-[#202124] shadow-slate-800/30'
        }`}
      >
        {/* Hardware Top Camera / Notch Notch */}
        {isIPhone ? (
          /* iPhone Dynamic Island */
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-6 bg-black rounded-full z-50 flex items-center justify-between px-2.5 shadow-sm">
            <div className="w-2.5 h-2.5 rounded-full bg-[#111] border border-slate-800 flex items-center justify-center">
              <div className="w-1 h-1 rounded-full bg-blue-950/60" />
            </div>
            <div className="w-2 h-2 rounded-full bg-[#181818]" />
          </div>
        ) : (
          /* Android Pixel Center Punch Hole */
          <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-black rounded-full border border-slate-700 z-50 flex items-center justify-center">
            <div className="w-1 h-1 rounded-full bg-indigo-950/80" />
          </div>
        )}

        {/* Status Bar */}
        <div className="pt-2.5 px-6 pb-1.5 flex items-center justify-between text-slate-800 text-[11px] font-bold tracking-tight z-40 bg-slate-50">
          <span>{isIPhone ? '9:41' : '10:08'}</span>
          <div className="flex items-center gap-1.5 text-slate-700">
            {!isIPhone && <span className="text-[9px] font-extrabold text-slate-500 mr-0.5">5G</span>}
            <Signal className="w-3 h-3 fill-current" />
            <Wifi className="w-3 h-3" />
            <Battery className="w-3.5 h-3.5 fill-current" />
          </div>
        </div>

        {/* Screen Content Scroll Area */}
        <div className="flex-1 overflow-y-auto no-scrollbar relative bg-slate-50">
          {children}
        </div>

        {/* Shell Bottom Navigation Bar */}
        <nav className="bg-white border-t border-slate-200 px-4 py-2 flex items-center justify-around z-40 relative shadow-sm">
          <button
            onClick={() => onNavigateTab('home')}
            className={`flex flex-col items-center gap-1 transition-all ${
              activeTab === 'home' ? 'text-[#7C3AED]' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-[10px] font-bold">Home</span>
          </button>

          <button
            onClick={() => onNavigateTab('mission')}
            className={`flex flex-col items-center gap-1 transition-all ${
              activeTab === 'mission' ? 'text-[#7C3AED]' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Rocket className="w-5 h-5" />
            <span className="text-[10px] font-bold">Mission</span>
          </button>

          <button
            onClick={() => onNavigateTab('marketplace')}
            className={`flex flex-col items-center gap-1 transition-all ${
              activeTab === 'marketplace' ? 'text-[#7C3AED]' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Store className="w-5 h-5" />
            <span className="text-[10px] font-bold">Marketplace</span>
          </button>

          <button
            onClick={() => onNavigateTab('profile')}
            className={`flex flex-col items-center gap-1 transition-all ${
              activeTab === 'profile' ? 'text-[#7C3AED]' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <User className="w-5 h-5" />
            <span className="text-[10px] font-bold">Profile</span>
          </button>
        </nav>

        {/* Bottom Hardware Navigation / Gesture Indicator Bar */}
        <div className="bg-white pb-2 pt-1 flex justify-center z-40">
          <div
            className={`h-1 bg-slate-300 rounded-full ${
              isIPhone ? 'w-32' : 'w-24 bg-slate-400'
            }`}
          />
        </div>
      </div>
    </div>
  );
};
