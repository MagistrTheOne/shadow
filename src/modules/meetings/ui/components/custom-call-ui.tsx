"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { 
  PaletteIcon, 
  LayoutIcon, 
  SettingsIcon,
  EyeIcon,
  EyeOffIcon,
  GridIcon,
  ListIcon,
  MaximizeIcon,
  MinimizeIcon
} from "lucide-react";
import { useCall } from "@stream-io/video-react-sdk";

interface CustomCallUIProps {
  isEnabled: boolean;
  onToggle: () => void;
}

interface UITheme {
  id: string;
  name: string;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
}

interface UILayout {
  id: string;
  name: string;
  description: string;
  icon: any;
}

export const CustomCallUI = ({ isEnabled, onToggle }: CustomCallUIProps) => {
  const [selectedTheme, setSelectedTheme] = useState('dark');
  const [selectedLayout, setSelectedLayout] = useState('grid');
  const [showControls, setShowControls] = useState(true);
  const [showParticipants, setShowParticipants] = useState(true);
  const [showChat, setShowChat] = useState(true);
  const [opacity, setOpacity] = useState([80]);
  const [blur, setBlur] = useState([0]);
  const [scale, setScale] = useState([100]);

  const call = useCall();

  const themes: UITheme[] = [
    {
      id: 'dark',
      name: 'Dark',
      primaryColor: '#3b82f6',
      secondaryColor: '#1e40af',
      backgroundColor: '#0f172a',
      textColor: '#f8fafc'
    },
    {
      id: 'light',
      name: 'Light',
      primaryColor: '#2563eb',
      secondaryColor: '#1d4ed8',
      backgroundColor: '#ffffff',
      textColor: '#1e293b'
    },
    {
      id: 'purple',
      name: 'Purple',
      primaryColor: '#8b5cf6',
      secondaryColor: '#7c3aed',
      backgroundColor: '#1e1b4b',
      textColor: '#f3e8ff'
    },
    {
      id: 'green',
      name: 'Green',
      primaryColor: '#10b981',
      secondaryColor: '#059669',
      backgroundColor: '#064e3b',
      textColor: '#ecfdf5'
    }
  ];

  const layouts: UILayout[] = [
    {
      id: 'grid',
      name: 'Grid Layout',
      description: 'Participants in a grid',
      icon: GridIcon
    },
    {
      id: 'list',
      name: 'List Layout',
      description: 'Participants in a list',
      icon: ListIcon
    },
    {
      id: 'focus',
      name: 'Focus Layout',
      description: 'One main speaker, others small',
      icon: MaximizeIcon
    },
    {
      id: 'minimal',
      name: 'Minimal Layout',
      description: 'Clean, minimal interface',
      icon: MinimizeIcon
    }
  ];

  const currentTheme = themes.find(t => t.id === selectedTheme) || themes[0];

  useEffect(() => {
    if (isEnabled) {
      // Применяем выбранную тему к интерфейсу
      const root = document.documentElement;
      root.style.setProperty('--primary-color', currentTheme.primaryColor);
      root.style.setProperty('--secondary-color', currentTheme.secondaryColor);
      root.style.setProperty('--background-color', currentTheme.backgroundColor);
      root.style.setProperty('--text-color', currentTheme.textColor);
    }
  }, [isEnabled, selectedTheme, currentTheme]);

  const applyCustomStyles = () => {
    // Применяем кастомные стили через CSS переменные
    const root = document.documentElement;
    root.style.setProperty('--ui-opacity', `${opacity[0]}%`);
    root.style.setProperty('--ui-blur', `${blur[0]}px`);
    root.style.setProperty('--ui-scale', `${scale[0]}%`);
  };

  if (!isEnabled) {
    return (
      <Card className="w-80 bg-white/5 backdrop-blur-sm border-white/10">
        <CardHeader className="p-4">
          <CardTitle className="flex items-center gap-2 text-white">
            <PaletteIcon className="w-5 h-5" />
            Custom UI
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <Button 
            onClick={onToggle}
            className="w-full bg-pink-600 hover:bg-pink-700 text-white"
          >
            Enable Custom UI
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-80 bg-white/5 backdrop-blur-sm border-white/10">
      <CardHeader className="p-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-white">
            <PaletteIcon className="w-5 h-5" />
            Custom UI
          </CardTitle>
          <Button
            size="sm"
            variant="outline"
            onClick={onToggle}
            className="text-white"
          >
            <SettingsIcon className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 space-y-4">
        {/* Theme Selection */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-300">Theme</h4>
          <div className="grid grid-cols-2 gap-2">
            {themes.map((theme) => (
              <Button
                key={theme.id}
                variant={selectedTheme === theme.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedTheme(theme.id)}
                className={`justify-start ${
                  selectedTheme === theme.id 
                    ? 'bg-pink-600 text-white' 
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                <div 
                  className="w-4 h-4 rounded-full mr-2"
                  style={{ backgroundColor: theme.primaryColor }}
                />
                {theme.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Layout Selection */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-300">Layout</h4>
          <div className="space-y-2">
            {layouts.map((layout) => {
              const Icon = layout.icon;
              return (
                <Button
                  key={layout.id}
                  variant={selectedLayout === layout.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedLayout(layout.id)}
                  className={`w-full justify-start ${
                    selectedLayout === layout.id 
                      ? 'bg-pink-600 text-white' 
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  <div className="text-left">
                    <div className="font-medium">{layout.name}</div>
                    <div className="text-xs opacity-75">{layout.description}</div>
                  </div>
                </Button>
              );
            })}
          </div>
        </div>

        {/* UI Elements Toggle */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-300">UI Elements</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="show-controls" className="text-sm text-gray-300">
                Show Controls
              </Label>
              <Switch
                id="show-controls"
                checked={showControls}
                onCheckedChange={setShowControls}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="show-participants" className="text-sm text-gray-300">
                Show Participants
              </Label>
              <Switch
                id="show-participants"
                checked={showParticipants}
                onCheckedChange={setShowParticipants}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="show-chat" className="text-sm text-gray-300">
                Show Chat
              </Label>
              <Switch
                id="show-chat"
                checked={showChat}
                onCheckedChange={setShowChat}
              />
            </div>
          </div>
        </div>

        {/* Visual Effects */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-300">Visual Effects</h4>
          
          <div className="space-y-2">
            <Label className="text-xs text-gray-400">
              Opacity: {opacity[0]}%
            </Label>
            <Slider
              value={opacity}
              onValueChange={setOpacity}
              max={100}
              min={10}
              step={10}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-gray-400">
              Blur: {blur[0]}px
            </Label>
            <Slider
              value={blur}
              onValueChange={setBlur}
              max={20}
              min={0}
              step={1}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-gray-400">
              Scale: {scale[0]}%
            </Label>
            <Slider
              value={scale}
              onValueChange={setScale}
              max={150}
              min={50}
              step={10}
              className="w-full"
            />
          </div>
        </div>

        {/* Preview */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-300">Preview</h4>
          <div 
            className="w-full h-20 rounded-lg border-2 border-dashed border-white/20 flex items-center justify-center"
            style={{
              backgroundColor: currentTheme.backgroundColor,
              opacity: opacity[0] / 100,
              filter: `blur(${blur[0]}px)`,
              transform: `scale(${scale[0] / 100})`
            }}
          >
            <div className="text-center">
              <div 
                className="w-8 h-8 rounded-full mx-auto mb-1"
                style={{ backgroundColor: currentTheme.primaryColor }}
              />
              <div 
                className="text-xs"
                style={{ color: currentTheme.textColor }}
              >
                {currentTheme.name} Theme
              </div>
            </div>
          </div>
        </div>

        {/* Apply Button */}
        <Button
          onClick={applyCustomStyles}
          className="w-full bg-pink-600 hover:bg-pink-700 text-white"
        >
          Apply Custom UI
        </Button>

        {/* Summary */}
        <div className="text-xs text-gray-400 space-y-1">
          <p>• Theme: {currentTheme.name}</p>
          <p>• Layout: {layouts.find(l => l.id === selectedLayout)?.name}</p>
          <p>• Elements: {[showControls && 'Controls', showParticipants && 'Participants', showChat && 'Chat'].filter(Boolean).join(', ')}</p>
        </div>
      </CardContent>
    </Card>
  );
};
