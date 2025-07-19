
"use client";

import { useEffect, useState } from 'react';
import { themes, type Theme } from '@/lib/themes';
import { Palette, Check } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

const DefaultIcon = ({ theme }: { theme: Theme }) => (
    <div className="w-full h-full rounded-full overflow-hidden flex">
        <div className="w-1/2 h-full" style={{ backgroundColor: `hsl(${theme.colors.primary})` }}></div>
        <div className="w-1/2 h-full flex flex-col">
            <div className="h-1/2 w-full" style={{ backgroundColor: `hsl(${theme.colors.accent})` }}></div>
            <div className="h-1/2 w-full" style={{ backgroundColor: `hsl(${theme.colors.secondary})` }}></div>
        </div>
    </div>
);

const ForestIcon = ({ theme }: { theme: Theme }) => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <rect width="24" height="24" rx="12" fill={`hsl(${theme.colors.background})`} />
        <rect x="10" y="16" width="4" height="4" fill={`hsl(${theme.colors['primary-foreground']})`} />
        <rect x="8" y="14" width="8" height="2" fill={`hsl(${theme.colors.primary})`} />
        <rect x="6" y="12" width="12" height="2" fill={`hsl(${theme.colors.primary})`} />
        <rect x="8" y="10" width="8" height="2" fill={`hsl(${theme.colors.primary})`} />
        <rect x="10" y="8" width="4" height="2" fill={`hsl(${theme.colors.primary})`} />
        <rect x="12" y="6" width="2" height="2" fill={`hsl(${theme.colors.accent})`} />
    </svg>
);

const OceanIcon = ({ theme }: { theme: Theme }) => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <rect width="24" height="24" rx="12" fill={`hsl(${theme.colors.background})`} />
        <rect y="18" width="24" height="6" fill={`hsl(${theme.colors.primary})`} />
        <rect y="14" width="24" height="4" fill={`hsl(${theme.colors.accent})`} />
        <path d="M4 14H6V12H8V10H16V12H18V14H20V12H22V10H20V8H18V10H16V8H8V6H6V8H4V10H2V12H4V14Z" fill={`hsl(${theme.colors['primary-foreground']})`} />
    </svg>
);

const SunsetIcon = ({ theme }: { theme: Theme }) => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <rect width="24" height="24" rx="12" fill={`hsl(${theme.colors.background})`} />
        <rect y="16" width="24" height="8" fill={`hsl(${theme.colors.secondary})`} />
        <circle cx="12" cy="12" r="6" fill={`hsl(${theme.colors.primary})`} />
        <circle cx="12" cy="12" r="3" fill={`hsl(${theme.colors.accent})`} />
    </svg>
);

const MoonIcon = ({ theme }: { theme: Theme }) => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <rect width="24" height="24" rx="12" fill={`hsl(${theme.colors.background})`} />
        <circle cx="12" cy="12" r="7" fill={`hsl(${theme.colors.primary})`} />
        <circle cx="14" cy="10" r="1.5" fill={`hsl(${theme.colors.secondary})`} />
        <circle cx="10" cy="15" r="1" fill={`hsl(${theme.colors.secondary})`} />
    </svg>
);

const themeIcons: { [key: string]: React.ComponentType<{ theme: Theme }> } = {
    Default: DefaultIcon,
    Forest: ForestIcon,
    Ocean: OceanIcon,
    Sunset: SunsetIcon,
    Moon: MoonIcon,
};


export default function ThemeSelector() {
  const [activeTheme, setActiveTheme] = useState('Default');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const savedTheme = localStorage.getItem('pixel-theme');
    if (savedTheme && themes.find(t => t.name === savedTheme)) {
      applyTheme(savedTheme);
    } else {
      applyTheme('Default');
    }
  }, []);

  const applyTheme = (themeName: string) => {
    const theme = themes.find(t => t.name === themeName);
    if (!theme) return;

    const root = document.documentElement;
    Object.entries(theme.colors).forEach(([key, value]) => {
        const cssVarName = `--${key}`;
        root.style.setProperty(cssVarName, value);
    });
    
    setActiveTheme(theme.name);
    if (isClient) {
      localStorage.setItem('pixel-theme', theme.name);
    }
  };

  if (!isClient) {
    return <div className="h-10 w-[248px]"></div>;
  }

  return (
    <TooltipProvider>
      <div className="flex flex-wrap justify-end md:justify-start items-center gap-2">
        <Palette className="w-5 h-5 text-muted-foreground hidden md:block"/>
        <div className="flex items-center flex-wrap justify-end gap-3">
          {themes.map(theme => {
            const Icon = themeIcons[theme.name] || DefaultIcon;
            return (
              <Tooltip key={theme.name}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => applyTheme(theme.name)}
                    className={cn(
                      "w-8 h-8 rounded-full border-2 p-0 transition-all overflow-hidden",
                      activeTheme === theme.name ? "border-ring ring-2 ring-ring" : "border-foreground/30 hover:border-ring"
                    )}
                    aria-label={`Select ${theme.name} theme`}
                  >
                    <Icon theme={theme} />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{theme.name}</p>
                </TooltipContent>
              </Tooltip>
            )
          })}
        </div>
      </div>
    </TooltipProvider>
  );
}
