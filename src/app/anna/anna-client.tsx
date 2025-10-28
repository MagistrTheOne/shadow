"use client";

import { useState, useEffect } from "react";
import { AnnaAvatar } from "@/components/anna-avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  SparklesIcon, 
  BotIcon, 
  VideoIcon, 
  MessageCircleIcon,
  StarIcon,
  ZapIcon,
  ShieldIcon,
  HeartIcon
} from "lucide-react";
import { heygenService } from "@/lib/ai/heygen-service";
import { toast } from "sonner";

export function AnnaPageClient() {
  const [message, setMessage] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [annaAvailable, setAnnaAvailable] = useState(false);
  const [annaInfo, setAnnaInfo] = useState<any>(null);

  useEffect(() => {
    checkAnnaAvailability();
  }, []);

  const checkAnnaAvailability = async () => {
    try {
      const isAvailable = await heygenService.isAnnaAvailable();
      setAnnaAvailable(isAvailable);
      
      if (isAvailable) {
        const info = await heygenService.getAnnaAvatar();
        setAnnaInfo(info);
      }
    } catch (error) {
      console.error("Error checking ANNA availability:", error);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    try {
      setIsGenerating(true);
      const response = await heygenService.createAnnaVideo(message, {
        voice_id: "1bd001e7c8f74e5ba8d4a16c8b5a7c8b",
        background: "transparent",
        ratio: "16:9"
      });

      if (response.code === 0) {
        toast.success("ANNA создала видео-ответ!");
        // Здесь можно добавить логику для отображения видео
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
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-3 mb-4">
          <SparklesIcon className="w-8 h-8 text-purple-400" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            ANNA
          </h1>
          <Badge variant="secondary" className="bg-purple-500/20 text-purple-300 border-purple-400/30">
            AI Avatar
          </Badge>
        </div>
        <p className="text-xl text-gray-300 mb-2">
          Ваш персональный AI ассистент с живым аватаром
        </p>
        <p className="text-gray-400">
          Главная фича платформы Shadow.AI - общайтесь с ANNA как с живым человеком!
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* ANNA Avatar */}
        <div className="flex justify-center">
          <AnnaAvatar
            text="Привет! Я ANNA, ваш AI ассистент. Готова помочь с любыми вопросами по платформе Shadow.AI!"
            autoPlay={true}
            showControls={true}
            size="xl"
            className="max-w-md"
          />
        </div>

        {/* Features & Interaction */}
        <div className="space-y-6">
          {/* Features */}
          <Card className="bg-white/5 backdrop-blur-sm border-purple-500/30">
            <CardHeader>
              <CardTitle className="text-purple-300 flex items-center gap-2">
                <StarIcon className="w-5 h-5" />
                Возможности ANNA
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <VideoIcon className="w-5 h-5 text-purple-400" />
                <span className="text-gray-300">Живой аватар с HeyGen AI</span>
              </div>
              <div className="flex items-center gap-3">
                <MessageCircleIcon className="w-5 h-5 text-purple-400" />
                <span className="text-gray-300">Естественное общение на русском и английском</span>
              </div>
              <div className="flex items-center gap-3">
                <ZapIcon className="w-5 h-5 text-purple-400" />
                <span className="text-gray-300">Помощь с митингами и агентами</span>
              </div>
              <div className="flex items-center gap-3">
                <ShieldIcon className="w-5 h-5 text-purple-400" />
                <span className="text-gray-300">Техническая поддержка платформы</span>
              </div>
            </CardContent>
          </Card>

          {/* Chat with ANNA */}
          <Card className="bg-white/5 backdrop-blur-sm border-purple-500/30">
            <CardHeader>
              <CardTitle className="text-purple-300 flex items-center gap-2">
                <HeartIcon className="w-5 h-5" />
                Общение с ANNA
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Напишите сообщение для ANNA..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="bg-white/10 border-purple-400/30 text-white placeholder-gray-400"
                rows={4}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!message.trim() || isGenerating || !annaAvailable}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
              >
                {isGenerating ? (
                  <>
                    <BotIcon className="w-4 h-4 mr-2 animate-spin" />
                    ANNA создает ответ...
                  </>
                ) : (
                  <>
                    <VideoIcon className="w-4 h-4 mr-2" />
                    Создать видео-ответ
                  </>
                )}
              </Button>
              
              {!annaAvailable && (
                <p className="text-red-400 text-sm text-center">
                  ANNA временно недоступна. Проверьте настройки HeyGen API.
                </p>
              )}
            </CardContent>
          </Card>

          {/* ANNA Info */}
          {annaInfo && (
            <Card className="bg-white/5 backdrop-blur-sm border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-purple-300">Информация об ANNA</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Статус:</span>
                  <Badge variant="secondary" className="bg-green-500/20 text-green-300">
                    {annaInfo.status}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">ID аватара:</span>
                  <span className="text-gray-300 font-mono text-xs">{annaInfo.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Провайдер:</span>
                  <span className="text-gray-300">HeyGen AI</span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="text-center mt-12 text-gray-400">
        <p>ANNA - главная фича платформы Shadow.AI</p>
        <p className="text-sm">Создано с помощью HeyGen AI • ID: 1652863dc2354b499db342a63feca19a</p>
      </div>
    </div>
  );
}
