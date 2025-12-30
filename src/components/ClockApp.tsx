import React, { useState, useEffect, useCallback } from 'react';
import { Settings, X, Check, Maximize, Minimize, Plus, Globe } from 'lucide-react';

interface Theme {
  background: string;
  cardBackground: string;
  textColor: string;
}

interface WorldClock {
  id: string;
  timezone: string;
  label: string;
}

const presets: (Theme & { name: string })[] = [
  { name: 'Ocean', cardBackground: '#5b6abf', textColor: '#e8d5d0' },
  { name: 'Midnight', cardBackground: '#1e293b', textColor: '#e2e8f0' },
  { name: 'Forest', cardBackground: '#166534', textColor: '#bbf7d0' },
  { name: 'Sunset', cardBackground: '#b45309', textColor: '#fef3c7' },
  { name: 'Berry', cardBackground: '#7c3aed', textColor: '#e9d5ff' },
];

const popularTimezones = [
  { timezone: 'America/New_York', label: 'New York' },
  { timezone: 'America/Los_Angeles', label: 'Los Angeles' },
  { timezone: 'America/Chicago', label: 'Chicago' },
  { timezone: 'Europe/London', label: 'London' },
  { timezone: 'Europe/Paris', label: 'Paris' },
  { timezone: 'Europe/Berlin', label: 'Berlin' },
  { timezone: 'Asia/Tokyo', label: 'Tokyo' },
  { timezone: 'Asia/Shanghai', label: 'Shanghai' },
  { timezone: 'Asia/Dubai', label: 'Dubai' },
  { timezone: 'Asia/Singapore', label: 'Singapore' },
  { timezone: 'Australia/Sydney', label: 'Sydney' },
  { timezone: 'Pacific/Auckland', label: 'Auckland' },
];

const ClockApp: React.FC = () => {
  const [time, setTime] = useState(new Date());
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [worldClocks, setWorldClocks] = useState<WorldClock[]>([]);
  const [isAddingClock, setIsAddingClock] = useState(false);
  
  const [theme, setTheme] = useState<Theme>({
    
    cardBackground: '#5b6abf',
    textColor: '#e8d5d0',
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Hide controls after inactivity in fullscreen mode
  useEffect(() => {
    if (!isFullscreen) {
      setShowControls(true);
      return;
    }

    let timeout: NodeJS.Timeout;
    
    const handleMouseMove = () => {
      setShowControls(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        if (isFullscreen && !isSettingsOpen && !isAddingClock) {
          setShowControls(false);
        }
      }, 3000);
    };

    handleMouseMove();
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(timeout);
    };
  }, [isFullscreen, isSettingsOpen, isAddingClock]);

  // Handle fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.error('Fullscreen error:', err);
    }
  }, []);

  // Format seconds with leading zero
  const getSeconds = (): string => {
    return time.getSeconds().toString().padStart(2, '0');
  };

  // Format time as HH:MM
  const getTime = (): string => {
    const hours = time.getHours().toString().padStart(2, '0');
    const minutes = time.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  // Get AM/PM
  const getPeriod = (): string => {
    return time.getHours() >= 12 ? 'PM' : 'AM';
  };

  // Format date as YYYY-MM-DD
  const getDate = (): string => {
    const year = time.getFullYear();
    const month = (time.getMonth() + 1).toString().padStart(2, '0');
    const day = time.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Get day abbreviation
  const getDay = (): string => {
    const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    return days[time.getDay()];
  };

  const formatTimeForTimezone = (timezone: string): string => {
    return time.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false,
      timeZone: timezone 
    });
  };

  const handleColorChange = (key: keyof Theme, value: string) => {
    setTheme(prev => ({ ...prev, [key]: value }));
  };

  const applyPreset = (preset: Theme & { name: string }) => {
    setTheme({
      background: preset.background,
      cardBackground: preset.cardBackground,
      textColor: preset.textColor,
    });
  };

  const addWorldClock = (timezone: string, label: string) => {
    const newClock: WorldClock = {
      id: Date.now().toString(),
      timezone,
      label
    };
    setWorldClocks(prev => [...prev, newClock]);
    setIsAddingClock(false);
  };

  const removeWorldClock = (id: string) => {
    setWorldClocks(prev => prev.filter(c => c.id !== id));
  };

  const availableTimezones = popularTimezones.filter(
    tz => !worldClocks.some(wc => wc.timezone === tz.timezone)
  );

  return (
    <div 
      className="min-h-screen w-full flex flex-col items-center justify-center transition-colors duration-500 relative overflow-hidden p-4 md:p-8"
      style={{ backgroundColor: theme.background }}
    >
      {/* Main Clock Card */}
      <div 
        className="relative w-full max-w-md aspect-[9/16] md:aspect-[3/4] rounded-[2rem] md:rounded-[3rem] flex flex-col items-center justify-center p-8 transition-all duration-500 shadow-2xl"
        style={{ backgroundColor: theme.cardBackground }}
      >
        {/* Giant Seconds Display */}
        <div 
          className="font-clock font-semibold leading-none tracking-tight transition-colors duration-300"
          style={{ 
            color: theme.textColor,
            fontSize: 'clamp(180px, 45vw, 280px)',
          }}
        >
          {getSeconds()}
        </div>

        {/* Time Display */}
        <div 
          className="font-clock text-5xl md:text-6xl font-light tracking-wider mt-4 transition-colors duration-300"
          style={{ color: theme.textColor }}
        >
          {getTime()}
        </div>

        {/* Date Row */}
        <div 
          className="font-clock text-xl md:text-2xl font-light tracking-widest mt-4 flex items-center gap-4 opacity-80 transition-colors duration-300"
          style={{ color: theme.textColor }}
        >
          <span>{getPeriod()}</span>
          <span>{getDate()}</span>
          <span>{getDay()}</span>
        </div>
      </div>

      {/* World Clocks Row */}
      {worldClocks.length > 0 && (
        <div className={`flex flex-wrap justify-center gap-3 mt-6 transition-opacity duration-300 ${
          !showControls ? 'opacity-40' : 'opacity-100'
        }`}>
          {worldClocks.map((clock) => (
            <div 
              key={clock.id}
              className="group relative rounded-xl px-4 py-2 flex flex-col items-center transition-all hover:scale-105"
              style={{ 
                backgroundColor: theme.cardBackground + '40',
                color: theme.textColor 
              }}
            >
              <button
                onClick={() => removeWorldClock(clock.id)}
                className={`absolute -top-2 -right-2 p-1 rounded-full bg-red-500/80 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 ${
                  !showControls ? 'pointer-events-none' : ''
                }`}
              >
                <X size={10} color="#fff" />
              </button>
              <span className="text-xs font-medium uppercase tracking-wider opacity-70">
                {clock.label}
              </span>
              <span className="text-xl font-clock font-semibold">
                {formatTimeForTimezone(clock.timezone)}
              </span>
            </div>
          ))}
          
          {availableTimezones.length > 0 && (
            <button
              onClick={() => setIsAddingClock(true)}
              className={`rounded-xl px-4 py-2 flex flex-col items-center justify-center transition-all hover:scale-105 border-2 border-dashed ${
                !showControls ? 'opacity-0 pointer-events-none' : 'opacity-60 hover:opacity-100'
              }`}
              style={{ borderColor: theme.textColor + '40', color: theme.textColor }}
            >
              <Plus size={18} />
              <span className="text-xs font-medium uppercase tracking-wider mt-1">Add</span>
            </button>
          )}
        </div>
      )}

      {/* Control Buttons */}
      <div className={`absolute bottom-6 right-6 flex gap-3 transition-opacity duration-300 ${
        !showControls ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}>
        {/* Add World Clock Button (when empty) */}
        {worldClocks.length === 0 && (
          <button 
            onClick={() => setIsAddingClock(true)}
            className="p-3 rounded-full transition-all hover:scale-105 active:scale-95"
            style={{ 
              backgroundColor: theme.cardBackground + '60',
              color: theme.textColor 
            }}
            title="Add World Clock"
          >
            <Globe size={20} />
          </button>
        )}

        {/* Fullscreen Button */}
        <button 
          onClick={toggleFullscreen}
          className="p-3 rounded-full transition-all hover:scale-105 active:scale-95"
          style={{ 
            backgroundColor: theme.cardBackground + '60',
            color: theme.textColor 
          }}
          title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
        >
          {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
        </button>

        {/* Settings Button */}
        <button 
          onClick={() => setIsSettingsOpen(true)}
          className="p-3 rounded-full transition-all hover:scale-105 active:scale-95 group"
          style={{ 
            backgroundColor: theme.cardBackground + '60',
            color: theme.textColor 
          }}
        >
          <Settings 
            size={20} 
            className="transition-transform duration-700 group-hover:rotate-180" 
          />
        </button>
      </div>

      {/* Fullscreen hint */}
      {isFullscreen && showControls && (
        <div 
          className="absolute bottom-6 left-6 text-xs opacity-40 transition-opacity duration-300"
          style={{ color: theme.textColor }}
        >
          Move mouse to show controls • ESC to exit
        </div>
      )}

      {/* Add Clock Modal */}
      {isAddingClock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setIsAddingClock(false)}
          />
          
          <div 
            className="relative w-full max-w-sm rounded-2xl shadow-2xl p-6 overflow-hidden animate-fade-in"
            style={{ backgroundColor: '#1a1a1a' }}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">Add World Clock</h3>
              <button 
                onClick={() => setIsAddingClock(false)}
                className="p-2 rounded-full hover:bg-white/10 transition-colors"
              >
                <X size={20} className="text-white/60" />
              </button>
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
              {availableTimezones.map((tz) => (
                <button
                  key={tz.timezone}
                  onClick={() => addWorldClock(tz.timezone, tz.label)}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <span className="font-medium text-white/80">{tz.label}</span>
                  <span className="text-sm text-white/50 font-clock">
                    {formatTimeForTimezone(tz.timezone)}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setIsSettingsOpen(false)}
          />
          
          <div 
            className="relative w-full max-w-md rounded-2xl shadow-2xl p-6 overflow-hidden animate-fade-in"
            style={{ backgroundColor: '#1a1a1a' }}
          >
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-white">Appearance</h3>
              <button 
                onClick={() => setIsSettingsOpen(false)}
                className="p-2 rounded-full hover:bg-white/10 transition-colors"
              >
                <X size={20} className="text-white/60" />
              </button>
            </div>

            {/* Presets */}
            <div className="mb-6">
              <label className="text-xs font-semibold uppercase tracking-wider mb-3 block text-white/50">
                Presets
              </label>
              <div className="grid grid-cols-5 gap-2">
                {presets.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => applyPreset(preset)}
                    className="group relative w-full aspect-square rounded-xl border-2 transition-all hover:scale-105 overflow-hidden"
                    style={{ 
                      backgroundColor: preset.cardBackground,
                      borderColor: theme.cardBackground === preset.cardBackground ? preset.textColor : 'transparent' 
                    }}
                    title={preset.name}
                  >
                    {theme.cardBackground === preset.cardBackground && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Check size={16} style={{ color: preset.textColor }} />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Colors */}
            <div className="space-y-3">
              <label className="text-xs font-semibold uppercase tracking-wider mb-2 block text-white/50">
                Custom Colors
              </label>
              
              <ColorPicker 
                label="Background" 
                value={theme.background} 
                onChange={(v) => handleColorChange('background', v)}
              />
              <ColorPicker 
                label="Card Color" 
                value={theme.cardBackground} 
                onChange={(v) => handleColorChange('cardBackground', v)}
              />
              <ColorPicker 
                label="Text Color" 
                value={theme.textColor} 
                onChange={(v) => handleColorChange('textColor', v)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

const ColorPicker: React.FC<ColorPickerProps> = ({ label, value, onChange }) => (
  <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
    <span className="text-sm font-medium text-white/70">{label}</span>
    <div className="flex items-center gap-2">
      <span className="text-xs font-mono text-white/40 uppercase">{value}</span>
      <input 
        type="color" 
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="color-picker"
      />
    </div>
  </div>
);

export default ClockApp;
