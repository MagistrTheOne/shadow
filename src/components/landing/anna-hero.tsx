"use client";

import { useState, useEffect } from "react";
import { AnnaAvatar } from "@/components/anna-avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  SparklesIcon, 
  PlayIcon, 
  StarIcon,
  ZapIcon,
  ShieldIcon,
  HeartIcon,
  ArrowRightIcon
} from "lucide-react";
import { heygenService } from "@/lib/ai/heygen-service";
import { toast } from "sonner";

export const AnnaHero = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [annaAvailable, setAnnaAvailable] = useState(false);

  useEffect(() => {
    checkAnnaAvailability();
  }, []);

  const checkAnnaAvailability = async () => {
    try {
      const isAvailable = await heygenService.isAnnaAvailable();
      setAnnaAvailable(isAvailable);
    } catch (error) {
      console.error("Error checking ANNA availability:", error);
    }
  };

  const handleTryAnna = async () => {
    try {
      setIsGenerating(true);
      const response = await heygenService.createAnnaVideo(
        "Привет! Я ANNA, ваш персональный AI ассистент. Добро пожаловать в Shadow.AI - платформу будущего для видео митингов!",
        {
          voice_id: "1bd001e7c8f74e5ba8d4a16c8b5a7c8b",
          background: "transparent",
          ratio: "16:9"
        }
      );

      if (response.code === 0) {
        toast.success("ANNA создала приветственное видео!");
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error("Error generating ANNA video:", error);
      toast.error("Ошибка создания видео с ANNA");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-purple-900 via-black to-pink-900 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Content */}
          <div className="space-y-8">
            {/* Badge */}
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="bg-purple-500/20 text-purple-300 border-purple-400/30 px-4 py-2">
                <SparklesIcon className="w-4 h-4 mr-2" />
                Главная фича
              </Badge>
              <Badge variant="outline" className="border-green-400/30 text-green-300">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse" />
                ANNA Online
              </Badge>
            </div>

            {/* Title */}
            <div className="space-y-4">
              <h1 className="text-5xl lg:text-7xl font-bold">
                <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  ANNA
                </span>
                <br />
                <span className="text-white">
                  AI Avatar
                </span>
              </h1>
              <p className="text-xl text-gray-300 max-w-lg">
                Ваш персональный AI ассистент с живым аватаром. 
                Общайтесь с ANNA как с живым человеком!
              </p>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <PlayIcon className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-white font-medium">Живой аватар</p>
                  <p className="text-gray-400 text-sm">HeyGen AI технология</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-pink-500/20 rounded-lg flex items-center justify-center">
                  <HeartIcon className="w-5 h-5 text-pink-400" />
                </div>
                <div>
                  <p className="text-white font-medium">Естественное общение</p>
                  <p className="text-gray-400 text-sm">Русский и английский</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <ZapIcon className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-white font-medium">Помощь с митингами</p>
                  <p className="text-gray-400 text-sm">AI-ассистент</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <ShieldIcon className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-white font-medium">Техподдержка</p>
                  <p className="text-gray-400 text-sm">24/7 помощь</p>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={handleTryAnna}
                disabled={isGenerating || !annaAvailable}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 text-lg font-semibold"
              >
                {isGenerating ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    ANNA создает видео...
                  </>
                ) : (
                  <>
                    <PlayIcon className="w-5 h-5 mr-2" />
                    Попробовать ANNA
                  </>
                )}
              </Button>
              
              <Button
                variant="outline"
                className="border-purple-400/30 text-purple-300 hover:bg-purple-500/20 px-8 py-4 text-lg"
              >
                Узнать больше
                <ArrowRightIcon className="w-5 h-5 ml-2" />
              </Button>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-8 pt-8 border-t border-white/10">
              <div className="text-center">
                <p className="text-2xl font-bold text-white">100%</p>
                <p className="text-gray-400 text-sm">AI Powered</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-white">24/7</p>
                <p className="text-gray-400 text-sm">Доступность</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-white">RU/EN</p>
                <p className="text-gray-400 text-sm">Языки</p>
              </div>
            </div>
          </div>

          {/* Right Side - ANNA Avatar */}
          <div className="flex justify-center lg:justify-end">
            <div className="relative">
              {/* Glow effect */}
              <div className="absolute -inset-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-2xl" />
              
              {/* ANNA Avatar Card */}
              <Card className="bg-white/5 backdrop-blur-sm border-purple-500/30 p-6">
                <CardContent className="p-0">
                  <AnnaAvatar
                    text="Привет! Я ANNA, ваш персональный AI ассистент. Добро пожаловать в Shadow.AI!"
                    autoPlay={true}
                    showControls={true}
                    size="xl"
                    className="max-w-sm"
                  />
                </CardContent>
              </Card>

              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce">
                <StarIcon className="w-4 h-4 text-yellow-800" />
              </div>
              
              <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-green-400 rounded-full flex items-center justify-center animate-pulse">
                <div className="w-2 h-2 bg-white rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/50 to-transparent" />
    </div>
  );
};
