"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  CameraIcon, 
  CameraOffIcon, 
  SparklesIcon, 
  ImageIcon,
  SettingsIcon,
  CheckIcon
} from "lucide-react";
import { useCall } from "@stream-io/video-react-sdk";

interface BackgroundEffectsProps {
  isEnabled: boolean;
  onToggle: () => void;
}

type BackgroundEffect = 'none' | 'blur' | 'virtual' | 'custom';

export const BackgroundEffects = ({ isEnabled, onToggle }: BackgroundEffectsProps) => {
  const [selectedEffect, setSelectedEffect] = useState<BackgroundEffect>('none');
  const [isBlurEnabled, setIsBlurEnabled] = useState(false);
  const [isVirtualBackgroundEnabled, setIsVirtualBackgroundEnabled] = useState(false);
  const [customBackground, setCustomBackground] = useState<string | null>(null);

  const call = useCall();

  const effects = [
    { id: 'none', name: 'None', icon: CameraOffIcon },
    { id: 'blur', name: 'Blur', icon: SparklesIcon },
    { id: 'virtual', name: 'Virtual', icon: ImageIcon },
    { id: 'custom', name: 'Custom', icon: SettingsIcon },
  ] as const;

  const handleEffectChange = async (effect: BackgroundEffect) => {
    setSelectedEffect(effect);
    
    if (!call) return;

    try {
      // Stream Video SDK не предоставляет встроенного API для background effects
      // Эффекты применяются только локально на уровне UI
      switch (effect) {
        case 'blur':
          setIsBlurEnabled(true);
          setIsVirtualBackgroundEnabled(false);
          setCustomBackground(null);
          break;
        case 'virtual':
          setIsBlurEnabled(false);
          setIsVirtualBackgroundEnabled(true);
          setCustomBackground(null);
          break;
        case 'custom':
          setIsBlurEnabled(false);
          setIsVirtualBackgroundEnabled(false);
          break;
        default:
          setIsBlurEnabled(false);
          setIsVirtualBackgroundEnabled(false);
          setCustomBackground(null);
      }
    } catch (error) {
      console.error('Error applying background effect:', error);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCustomBackground(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  if (!isEnabled) {
    return (
      <Card className="w-80 bg-white/5 backdrop-blur-sm border-white/10">
        <CardHeader className="p-4">
          <CardTitle className="flex items-center gap-2 text-white">
            <CameraIcon className="w-5 h-5" />
            Background Effects
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <Button 
            onClick={onToggle}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            Enable Background Effects
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
            <CameraIcon className="w-5 h-5" />
            Background Effects
          </CardTitle>
          <Badge variant="default" className="bg-blue-600">
            Active
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 space-y-4">
        <div className="grid grid-cols-2 gap-2">
          {effects.map((effect) => {
            const Icon = effect.icon;
            const isSelected = selectedEffect === effect.id;
            
            return (
              <Button
                key={effect.id}
                variant={isSelected ? "default" : "outline"}
                size="sm"
                onClick={() => handleEffectChange(effect.id)}
                className={`flex items-center gap-2 ${
                  isSelected 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                <Icon className="w-4 h-4" />
                {isSelected && <CheckIcon className="w-3 h-3" />}
                <span className="text-xs">{effect.name}</span>
              </Button>
            );
          })}
        </div>

        {selectedEffect === 'blur' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">Blur Intensity</span>
              <Badge variant="secondary">High</Badge>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: '80%' }}></div>
            </div>
          </div>
        )}

        {selectedEffect === 'virtual' && (
          <div className="space-y-2">
            <div className="grid grid-cols-3 gap-2">
              {['office', 'nature', 'abstract'].map((bg) => (
                <div
                  key={bg}
                  className="aspect-video bg-gray-700 rounded cursor-pointer hover:ring-2 hover:ring-blue-500"
                  style={{
                    backgroundImage: `url(/backgrounds/${bg}.jpg)`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {selectedEffect === 'custom' && (
          <div className="space-y-2">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
            />
            {customBackground && (
              <div className="aspect-video bg-gray-700 rounded overflow-hidden">
                <img 
                  src={customBackground} 
                  alt="Custom background" 
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>
        )}

        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={onToggle}
            className="flex-1"
          >
            <SettingsIcon className="w-4 h-4 mr-1" />
            Settings
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
