
"use client";

import { useEffect, useState } from 'react';
import { themes } from '@/lib/themes';
import { Palette, Check } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

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
      <div className="flex items-center gap-2">
        <Palette className="w-5 h-5 text-muted-foreground"/>
        <div className="flex items-center gap-3">
          {themes.map(theme => (
            <Tooltip key={theme.name}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => applyTheme(theme.name)}
                  className={cn(
                    "w-8 h-8 rounded-full border-2 p-1 transition-all",
                    activeTheme === theme.name ? "border-ring ring-2 ring-ring" : "border-foreground/30 hover:border-ring"
                  )}
                  aria-label={`Select ${theme.name} theme`}
                >
                  <div className="w-full h-full rounded-full overflow-hidden flex">
                      <div className="w-1/2 h-full" style={{ backgroundColor: `hsl(${theme.colors.primary})` }}></div>
                      <div className="w-1/2 h-full flex flex-col">
                        <div className="h-1/2 w-full" style={{ backgroundColor: `hsl(${theme.colors.accent})` }}></div>
                        <div className="h-1/2 w-full" style={{ backgroundColor: `hsl(${theme.colors.secondary})` }}></div>
                      </div>
                  </div>
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{theme.name}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </div>
    </TooltipProvider>
  );
}
