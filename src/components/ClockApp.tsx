import React, { useState, useEffect, useCallback } from 'react';
import { Settings, MapPin, RefreshCw, X, Check, Maximize, Minimize, Plus, Trash2, Globe } from 'lucide-react';

interface Theme {
  background: string;
  clockText: string;
  dateText: string;
  accent: string;
}

interface WorldClock {
  id: string;
  timezone: string;
  label: string;
}

const presets: (Theme & { name: string })[] = [
  { name: 'Midnight', background: '#0f172a', clockText: '#f8fafc', dateText: '#94a3b8', accent: '#38bdf8' },
  { name: 'Sunset', background: '#451a03', clockText: '#fef3c7', dateText: '#d6d3d1', accent: '#f59e0b' },
  { name: 'Forest', background: '#052e16', clockText: '#dcfce7', dateText: '#86efac', accent: '#22c55e' },
  { name: 'Cotton Candy', background: '#fdf2f8', clockText: '#db2777', dateText: '#f472b6', accent: '#ec4899' },
  { name: 'Matrix', background: '#000000', clockText: '#00ff00', dateText: '#008f00', accent: '#00ff00' },
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
  const [locationName, setLocationName] = useState('Detecting Location...');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [worldClocks, setWorldClocks] = useState<WorldClock[]>([
    { id: '1', timezone: 'Europe/London', label: 'London' },
    { id: '2', timezone: 'Asia/Tokyo', label: 'Tokyo' },
  ]);
  const [isAddingClock, setIsAddingClock] = useState(false);
  
  const [theme, setTheme] = useState<Theme>({
    background: '#1a1a1a',
    clockText: '#ffffff',
    dateText: '#a3a3a3',
    accent: '#3b82f6',
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchLocation();
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

  const fetchLocation = () => {
    setLocationName('Locating...');
    if (!navigator.geolocation) {
      setLocationName('Location not supported');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
          );
          const data = await response.json();
          const city = data.city || data.locality || data.principalSubdivision || 'Unknown Location';
          const country = data.countryCode || '';
          setLocationName(`${city}, ${country}`);
        } catch {
          const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
          setLocationName(timeZone.replace('_', ' '));
        }
      },
      () => {
        const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        setLocationName(timeZone.replace('_', ' '));
      }
    );
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  const formatTimeForTimezone = (timezone: string): string => {
    return time.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true,
      timeZone: timezone 
    });
  };

  const getTimezoneOffset = (timezone: string): string => {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      timeZoneName: 'shortOffset'
    });
    const parts = formatter.formatToParts(time);
    const offsetPart = parts.find(p => p.type === 'timeZoneName');
    return offsetPart?.value || '';
  };

  const handleColorChange = (key: keyof Theme, value: string) => {
    setTheme(prev => ({ ...prev, [key]: value }));
  };

  const applyPreset = (preset: Theme & { name: string }) => {
    setTheme({
      background: preset.background,
      clockText: preset.clockText,
      dateText: preset.dateText,
      accent: preset.accent
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
      className="min-h-screen w-full flex flex-col items-center justify-center transition-colors duration-500 relative overflow-hidden"
      style={{ backgroundColor: theme.background }}
    >
      {/* Background Decorative Glow */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150vw] h-[150vw] rounded-full pointer-events-none blur-3xl animate-pulse-glow"
        style={{ background: `radial-gradient(circle, ${theme.accent} 0%, transparent 70%)` }}
      />

      {/* Main Clock Container */}
      <div className="z-10 flex flex-col items-center text-center p-8 w-full max-w-4xl">
        
        {/* Location Badge */}
        <button 
          className={`flex items-center gap-2 mb-8 px-4 py-2 rounded-full glass shadow-lg cursor-pointer hover:bg-white/10 transition-all group ${
            !showControls ? 'opacity-0' : 'opacity-100'
          }`}
          onClick={fetchLocation}
          title="Refresh Location"
        >
          <MapPin size={16} style={{ color: theme.accent }} />
          <span 
            className="text-sm font-medium tracking-wide uppercase"
            style={{ color: theme.dateText }}
          >
            {locationName}
          </span>
          <RefreshCw 
            size={14} 
            className="opacity-50 group-hover:opacity-100 transition-opacity" 
            style={{ color: theme.dateText }} 
          />
        </button>

        {/* Time Display */}
        <h1 
          className="text-7xl md:text-9xl font-bold tracking-tighter mb-4 font-mono-clock transition-colors duration-300"
          style={{ 
            color: theme.clockText, 
            textShadow: `0 0 40px ${theme.accent}40, 0 0 80px ${theme.accent}20` 
          }}
        >
          {formatTime(time)}
        </h1>

        {/* Date Display */}
        <h2 
          className="text-xl md:text-3xl font-light tracking-wide transition-colors duration-300 mb-8"
          style={{ color: theme.dateText }}
        >
          {formatDate(time)}
        </h2>

        {/* World Clocks */}
        {worldClocks.length > 0 && (
          <div className={`flex flex-wrap justify-center gap-4 mt-4 transition-opacity duration-300 ${
            !showControls ? 'opacity-60' : 'opacity-100'
          }`}>
            {worldClocks.map((clock) => (
              <div 
                key={clock.id}
                className="group relative glass rounded-xl px-5 py-3 flex flex-col items-center min-w-[140px] transition-all hover:scale-105"
              >
                <button
                  onClick={() => removeWorldClock(clock.id)}
                  className={`absolute -top-2 -right-2 p-1 rounded-full bg-red-500/80 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 ${
                    !showControls ? 'pointer-events-none' : ''
                  }`}
                >
                  <X size={12} color="#fff" />
                </button>
                <span 
                  className="text-xs font-medium uppercase tracking-wider mb-1"
                  style={{ color: theme.dateText }}
                >
                  {clock.label}
                </span>
                <span 
                  className="text-2xl font-bold font-mono-clock"
                  style={{ color: theme.clockText }}
                >
                  {formatTimeForTimezone(clock.timezone)}
                </span>
                <span 
                  className="text-xs opacity-60"
                  style={{ color: theme.dateText }}
                >
                  {getTimezoneOffset(clock.timezone)}
                </span>
              </div>
            ))}
            
            {/* Add Clock Button */}
            {availableTimezones.length > 0 && (
              <button
                onClick={() => setIsAddingClock(true)}
                className={`glass rounded-xl px-5 py-3 flex flex-col items-center justify-center min-w-[140px] transition-all hover:scale-105 hover:bg-white/10 ${
                  !showControls ? 'opacity-0 pointer-events-none' : 'opacity-100'
                }`}
                style={{ borderStyle: 'dashed' }}
              >
                <Plus size={24} style={{ color: theme.accent }} />
                <span 
                  className="text-xs font-medium uppercase tracking-wider mt-1"
                  style={{ color: theme.dateText }}
                >
                  Add City
                </span>
              </button>
            )}
          </div>
        )}

        {/* Initial Add Clock Button when empty */}
        {worldClocks.length === 0 && (
          <button
            onClick={() => setIsAddingClock(true)}
            className={`mt-4 glass rounded-xl px-6 py-4 flex items-center gap-3 transition-all hover:scale-105 hover:bg-white/10 ${
              !showControls ? 'opacity-0 pointer-events-none' : 'opacity-100'
            }`}
          >
            <Globe size={20} style={{ color: theme.accent }} />
            <span 
              className="text-sm font-medium"
              style={{ color: theme.dateText }}
            >
              Add World Clock
            </span>
          </button>
        )}
      </div>

      {/* Control Buttons */}
      <div className={`absolute bottom-8 right-8 flex gap-3 transition-opacity duration-300 ${
        !showControls ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}>
        {/* Fullscreen Button */}
        <button 
          onClick={toggleFullscreen}
          className="p-4 rounded-full glass shadow-lg transition-all hover:scale-105 active:scale-95 group"
          title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
        >
          {isFullscreen ? (
            <Minimize size={24} style={{ color: theme.clockText }} />
          ) : (
            <Maximize size={24} style={{ color: theme.clockText }} />
          )}
        </button>

        {/* Settings Button */}
        <button 
          onClick={() => setIsSettingsOpen(true)}
          className="p-4 rounded-full glass shadow-lg transition-all hover:scale-105 active:scale-95 group"
        >
          <Settings 
            size={24} 
            className="transition-transform duration-700 group-hover:rotate-180" 
            style={{ color: theme.clockText }} 
          />
        </button>
      </div>

      {/* Fullscreen hint */}
      {isFullscreen && showControls && (
        <div 
          className="absolute bottom-8 left-8 text-xs opacity-50 transition-opacity duration-300"
          style={{ color: theme.dateText }}
        >
          Move mouse to show controls • ESC to exit
        </div>
      )}

      {/* Add Clock Modal */}
      {isAddingClock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsAddingClock(false)}
          />
          
          <div 
            className="relative w-full max-w-sm rounded-2xl shadow-2xl p-6 overflow-hidden border-2 animate-fade-in"
            style={{ 
              backgroundColor: theme.background === '#fdf2f8' || theme.background === '#ffffff' ? '#ffffff' : '#1e1e1e',
              borderColor: theme.accent 
            }}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 
                className="text-lg font-bold"
                style={{ color: theme.background === '#fdf2f8' || theme.background === '#ffffff' ? '#000' : '#fff' }}
              >
                Add World Clock
              </h3>
              <button 
                onClick={() => setIsAddingClock(false)}
                className="p-2 rounded-full hover:bg-black/10 transition-colors"
              >
                <X size={20} style={{ color: theme.dateText }} />
              </button>
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
              {availableTimezones.map((tz) => (
                <button
                  key={tz.timezone}
                  onClick={() => addWorldClock(tz.timezone, tz.label)}
                  className="w-full flex items-center justify-between p-3 rounded-lg bg-black/5 hover:bg-black/10 transition-colors"
                >
                  <span className="font-medium" style={{ color: theme.dateText }}>
                    {tz.label}
                  </span>
                  <span className="text-sm opacity-60" style={{ color: theme.dateText }}>
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
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsSettingsOpen(false)}
          />
          
          <div 
            className="relative w-full max-w-md rounded-2xl shadow-2xl p-6 overflow-hidden border-2 animate-fade-in"
            style={{ 
              backgroundColor: theme.background === '#fdf2f8' || theme.background === '#ffffff' ? '#ffffff' : '#1e1e1e',
              borderColor: theme.accent 
            }}
          >
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-6">
              <h3 
                className="text-xl font-bold"
                style={{ color: theme.background === '#fdf2f8' || theme.background === '#ffffff' ? '#000' : '#fff' }}
              >
                Appearance
              </h3>
              <button 
                onClick={() => setIsSettingsOpen(false)}
                className="p-2 rounded-full hover:bg-black/10 transition-colors"
              >
                <X size={20} style={{ color: theme.dateText }} />
              </button>
            </div>

            {/* Presets */}
            <div className="mb-6">
              <label 
                className="text-xs font-semibold uppercase tracking-wider mb-3 block opacity-70"
                style={{ color: theme.dateText }}
              >
                Presets
              </label>
              <div className="grid grid-cols-5 gap-2">
                {presets.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => applyPreset(preset)}
                    className="group relative w-full aspect-square rounded-lg border-2 transition-all hover:scale-105"
                    style={{ 
                      backgroundColor: preset.background,
                      borderColor: theme.background === preset.background ? theme.accent : 'transparent' 
                    }}
                    title={preset.name}
                  >
                    <div 
                      className="absolute inset-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" 
                      style={{ backgroundColor: preset.accent }}
                    />
                    {theme.background === preset.background && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Check size={16} color={preset.clockText} />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Colors */}
            <div className="space-y-3">
              <label 
                className="text-xs font-semibold uppercase tracking-wider mb-2 block opacity-70"
                style={{ color: theme.dateText }}
              >
                Custom Colors
              </label>
              
              <ColorPicker 
                label="Background" 
                value={theme.background} 
                onChange={(v) => handleColorChange('background', v)}
                textColor={theme.dateText}
              />
              <ColorPicker 
                label="Text Color" 
                value={theme.clockText} 
                onChange={(v) => handleColorChange('clockText', v)}
                textColor={theme.dateText}
              />
              <ColorPicker 
                label="Accent Glow" 
                value={theme.accent} 
                onChange={(v) => handleColorChange('accent', v)}
                textColor={theme.dateText}
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
  textColor: string;
}

const ColorPicker: React.FC<ColorPickerProps> = ({ label, value, onChange, textColor }) => (
  <div className="flex items-center justify-between p-3 rounded-lg bg-black/5">
    <span className="text-sm font-medium" style={{ color: textColor }}>{label}</span>
    <div className="flex items-center gap-2">
      <span 
        className="text-xs font-mono opacity-50 uppercase"
        style={{ color: textColor }}
      >
        {value}
      </span>
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
