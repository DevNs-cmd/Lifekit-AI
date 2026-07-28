import React from 'react';
import { Sparkles, Monitor } from 'lucide-react';
import { DeviceFrame } from '../types';

interface HeaderProps {
  deviceFrame: DeviceFrame;
  setDeviceFrame: (frame: DeviceFrame) => void;
}

export const Header: React.FC<HeaderProps> = ({
  deviceFrame,
  setDeviceFrame,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 px-4 py-3 sticky top-0 z-50 flex items-center justify-between gap-3 shadow-sm text-slate-900">
      {/* Brand & Identity */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#4C0FBD] to-[#7C3AED] flex items-center justify-center shadow-md shadow-indigo-200">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-slate-900 font-bold text-lg tracking-tight">LifeKit</h1>
            <span className="text-[10px] font-extrabold uppercase bg-violet-100 text-[#7C3AED] px-2 py-0.5 rounded-full border border-violet-200">
              AI Execution App
            </span>
          </div>
          <p className="text-xs text-slate-500">AI Execution Marketplace for Human Goals</p>
        </div>
      </div>

      {/* Frame Controls */}
      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
        <button
          onClick={() => setDeviceFrame('iphone16')}
          title="iPhone 16 Pro Frame"
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            deviceFrame === 'iphone16' ? 'bg-white text-[#7C3AED] font-bold shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          iPhone
        </button>
        <button
          onClick={() => setDeviceFrame('pixel9')}
          title="Android Pixel Frame"
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            deviceFrame === 'pixel9' ? 'bg-white text-[#7C3AED] font-bold shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Android
        </button>
        <button
          onClick={() => setDeviceFrame('fullscreen')}
          title="Full Screen View"
          className={`p-1.5 rounded-lg text-xs transition-all ${
            deviceFrame === 'fullscreen' ? 'bg-white text-[#7C3AED] font-bold shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Monitor className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
};

