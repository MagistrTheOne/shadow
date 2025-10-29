"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'ru';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Простые переводы для основных элементов
const translations = {
  en: {
    // Navbar
    'nav.product': 'Product',
    'nav.features': 'Features',
    'nav.demo': 'Demo',
    'nav.pricing': 'Pricing',
    'nav.getStarted': 'Get Started',
    'nav.signIn': 'Sign In',
    'nav.dashboard': 'Dashboard',
    
    // Hero section
    'hero.title': 'AI-Powered Video Meetings',
    'hero.subtitle': 'Revolutionary video conferencing with AI agents, real-time collaboration, and advanced features.',
    'hero.cta': 'Start Your Free Trial',
    
    // Features
    'features.aiAgents': 'AI Agents',
    'features.videoCalls': 'Video Calls',
    'features.collaboration': 'Real-time Collaboration',
    'features.analytics': 'Advanced Analytics',
    
    // Footer
    'footer.company': 'Company',
    'footer.product': 'Product',
    'footer.resources': 'Resources',
    'footer.legal': 'Legal',
    'footer.copyright': '© 2024 Shadow. All rights reserved.',
  },
  ru: {
    // Navbar
    'nav.product': 'Продукт',
    'nav.features': 'Возможности',
    'nav.demo': 'Демо',
    'nav.pricing': 'Тарифы',
    'nav.getStarted': 'Начать',
    'nav.signIn': 'Войти',
    'nav.dashboard': 'Панель',
    
    // Hero section
    'hero.title': 'Видеозвонки с ИИ',
    'hero.subtitle': 'Революционные видеоконференции с ИИ-агентами, совместной работой в реальном времени и продвинутыми функциями.',
    'hero.cta': 'Начать бесплатно',
    
    // Features
    'features.aiAgents': 'ИИ-Агенты',
    'features.videoCalls': 'Видеозвонки',
    'features.collaboration': 'Совместная работа',
    'features.analytics': 'Аналитика',
    
    // Footer
    'footer.company': 'Компания',
    'footer.product': 'Продукт',
    'footer.resources': 'Ресурсы',
    'footer.legal': 'Правовая информация',
    'footer.copyright': '© 2024 Shadow. Все права защищены.',
  }
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  // Загружаем сохраненный язык из localStorage
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'ru')) {
      setLanguage(savedLanguage);
    }
  }, []);

  // Сохраняем язык в localStorage
  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations[typeof language]] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
