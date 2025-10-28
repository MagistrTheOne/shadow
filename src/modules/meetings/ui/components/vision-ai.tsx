"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  EyeIcon, 
  EyeOffIcon, 
  CameraIcon,
  UsersIcon,
  AlertTriangleIcon,
  CheckCircleIcon,
  ActivityIcon
} from "lucide-react";
import { useCall } from "@stream-io/video-react-sdk";

interface VisionAIProps {
  isEnabled: boolean;
  onToggle: () => void;
}

interface VisionDetection {
  id: string;
  type: 'face' | 'object' | 'emotion' | 'gesture';
  confidence: number;
  position: { x: number; y: number; width: number; height: number };
  label: string;
  timestamp: Date;
}

export const VisionAI = ({ isEnabled, onToggle }: VisionAIProps) => {
  const [isActive, setIsActive] = useState(false);
  const [detections, setDetections] = useState<VisionDetection[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>(['face', 'emotion']);
  
  const call = useCall();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const features = [
    { id: 'face', name: 'Face Detection', icon: UsersIcon },
    { id: 'emotion', name: 'Emotion Recognition', icon: ActivityIcon },
    { id: 'object', name: 'Object Detection', icon: CameraIcon },
    { id: 'gesture', name: 'Gesture Recognition', icon: AlertTriangleIcon },
  ] as const;

  // Моковые данные для демонстрации
  const mockDetections: VisionDetection[] = [
    {
      id: '1',
      type: 'face',
      confidence: 0.95,
      position: { x: 100, y: 50, width: 80, height: 80 },
      label: 'John Smith',
      timestamp: new Date(Date.now() - 5000)
    },
    {
      id: '2',
      type: 'emotion',
      confidence: 0.87,
      position: { x: 120, y: 60, width: 40, height: 40 },
      label: 'Happy',
      timestamp: new Date(Date.now() - 3000)
    },
    {
      id: '3',
      type: 'object',
      confidence: 0.92,
      position: { x: 200, y: 100, width: 60, height: 40 },
      label: 'Laptop',
      timestamp: new Date(Date.now() - 1000)
    }
  ];

  useEffect(() => {
    if (isEnabled && isActive) {
      // В реальном приложении здесь будет интеграция с Vision AI SDK
      setDetections(mockDetections);
      
      // Симуляция обновления детекций в реальном времени
      const interval = setInterval(() => {
        setDetections(prev => {
          const newDetection: VisionDetection = {
            id: Date.now().toString(),
            type: features[Math.floor(Math.random() * features.length)].id as any,
            confidence: Math.random() * 0.3 + 0.7,
            position: {
              x: Math.random() * 200,
              y: Math.random() * 150,
              width: Math.random() * 50 + 30,
              height: Math.random() * 50 + 30
            },
            label: ['Happy', 'Sad', 'Neutral', 'Laptop', 'Phone', 'Book'][Math.floor(Math.random() * 6)],
            timestamp: new Date()
          };
          return [...prev.slice(-9), newDetection]; // Keep last 10 detections
        });
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [isEnabled, isActive]);

  const startVisionAI = async () => {
    setIsLoading(true);
    try {
      // В реальном приложении здесь будет инициализация Vision AI SDK
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsActive(true);
    } catch (error) {
      console.error('Error starting Vision AI:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const stopVisionAI = () => {
    setIsActive(false);
    setDetections([]);
  };

  const toggleFeature = (featureId: string) => {
    setSelectedFeatures(prev => 
      prev.includes(featureId) 
        ? prev.filter(id => id !== featureId)
        : [...prev, featureId]
    );
  };

  const getDetectionColor = (type: string) => {
    switch (type) {
      case 'face': return 'border-blue-500 bg-blue-500/20';
      case 'emotion': return 'border-green-500 bg-green-500/20';
      case 'object': return 'border-purple-500 bg-purple-500/20';
      case 'gesture': return 'border-orange-500 bg-orange-500/20';
      default: return 'border-gray-500 bg-gray-500/20';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-green-400';
    if (confidence >= 0.7) return 'text-yellow-400';
    return 'text-red-400';
  };

  if (!isEnabled) {
    return (
      <Card className="w-80 bg-white/5 backdrop-blur-sm border-white/10">
        <CardHeader className="p-4">
          <CardTitle className="flex items-center gap-2 text-white">
            <EyeIcon className="w-5 h-5" />
            Vision AI
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <Button 
            onClick={onToggle}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            Enable Vision AI
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
            <EyeIcon className="w-5 h-5" />
            Vision AI
          </CardTitle>
          <Badge variant={isActive ? "default" : "secondary"}>
            {isActive ? "Active" : "Inactive"}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 space-y-4">
        {/* Feature Selection */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-300">Detection Features</h4>
          <div className="grid grid-cols-2 gap-2">
            {features.map((feature) => {
              const Icon = feature.icon;
              const isSelected = selectedFeatures.includes(feature.id);
              
              return (
                <Button
                  key={feature.id}
                  variant={isSelected ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleFeature(feature.id)}
                  className={`flex items-center gap-2 ${
                    isSelected 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-xs">{feature.name}</span>
                </Button>
              );
            })}
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant={isActive ? "destructive" : "default"}
            onClick={isActive ? stopVisionAI : startVisionAI}
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : isActive ? (
              <EyeOffIcon className="w-4 h-4 mr-1" />
            ) : (
              <EyeIcon className="w-4 h-4 mr-1" />
            )}
            {isLoading ? 'Starting...' : isActive ? 'Stop' : 'Start'}
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            onClick={onToggle}
            className="text-white"
          >
            Settings
          </Button>
        </div>

        {/* Detections Display */}
        {isActive && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-300">Live Detections</h4>
            <ScrollArea className="h-48 w-full">
              <div className="space-y-2 pr-4">
                {detections.map((detection) => (
                  <div
                    key={detection.id}
                    className={`p-3 rounded-lg border ${getDetectionColor(detection.type)}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {detection.type}
                        </Badge>
                        <span className="text-sm font-medium text-white">
                          {detection.label}
                        </span>
                      </div>
                      <span className={`text-xs ${getConfidenceColor(detection.confidence)}`}>
                        {Math.round(detection.confidence * 100)}%
                      </span>
                    </div>
                    <div className="text-xs text-gray-400">
                      Position: ({Math.round(detection.position.x)}, {Math.round(detection.position.y)})
                    </div>
                  </div>
                ))}
                
                {detections.length === 0 && (
                  <div className="text-center text-gray-400 py-8">
                    <EyeIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No detections yet</p>
                    <p className="text-xs">Vision AI is analyzing the video stream</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* Status Indicator */}
        {isActive && (
          <div className="flex items-center gap-2 text-indigo-400 text-sm">
            <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse" />
            <span>Analyzing video stream...</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
