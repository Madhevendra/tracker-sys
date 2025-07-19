
"use client";

import { useEffect, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { themes, type Theme } from '@/lib/themes';
import { Palette } from 'lucide-react';

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
    return null; // or a placeholder/loader
  }

  return (
    <div className="flex items-center gap-2">
      <Palette className="w-5 h-5 text-muted-foreground"/>
      <Select value={activeTheme} onValueChange={applyTheme}>
        <SelectTrigger className="w-[180px] bg-background border-2 border-foreground focus:ring-accent">
          <SelectValue placeholder="Select a theme" />
        </SelectTrigger>
        <SelectContent>
          {themes.map(theme => (
            <SelectItem key={theme.name} value={theme.name}>
              {theme.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
