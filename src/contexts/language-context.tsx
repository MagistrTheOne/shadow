"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'ru';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Полные переводы для всей платформы
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
    
    // Dashboard
    'dashboard.welcome': 'Welcome',
    'dashboard.recentMeetings': 'Recent Meetings',
    'dashboard.upcomingMeetings': 'Upcoming Meetings',
    'dashboard.myAgents': 'My Agents',
    'dashboard.quickActions': 'Quick Actions',
    'dashboard.createMeeting': 'Create Meeting',
    'dashboard.createAgent': 'Create Agent',
    'dashboard.viewAll': 'View All',
    
    // Meetings
    'meetings.title': 'Meetings',
    'meetings.create': 'Create Meeting',
    'meetings.join': 'Join',
    'meetings.scheduled': 'Scheduled',
    'meetings.onGoing': 'Ongoing',
    'meetings.ended': 'Ended',
    'meetings.noMeetings': 'No meetings scheduled',
    
    // Participants
    'participants.title': 'Participants',
    'participants.enable': 'Enable Participant Management',
    'participants.speaking': 'speaking',
    'participants.withVideo': 'with video on',
    'participants.moderators': 'moderators',
    'participants.promote': 'Promote',
    'participants.remove': 'Remove',
    'participants.host': 'Host',
    'participants.moderator': 'Moderator',
    'participants.participant': 'Participant',
    
    // Agents
    'agents.title': 'AI Agents',
    'agents.create': 'Create Agent',
    'agents.edit': 'Edit',
    'agents.delete': 'Delete',
    'agents.test': 'Test',
    'agents.active': 'Active',
    'agents.inactive': 'Inactive',
    'agents.noAgents': 'No agents created yet',
    
    // Profile
    'profile.title': 'Profile',
    'profile.edit': 'Edit Profile',
    'profile.save': 'Save',
    'profile.cancel': 'Cancel',
    'profile.name': 'Name',
    'profile.email': 'Email',
    'profile.bio': 'Bio',
    'profile.status': 'Status',
    'profile.online': 'Online',
    'profile.away': 'Away',
    'profile.offline': 'Offline',
    'profile.dnd': 'Do Not Disturb',
    
    // Chats
    'chats.title': 'Chats',
    'chats.new': 'New Chat',
    'chats.send': 'Send',
    'chats.placeholder': 'Type a message...',
    'chats.noChats': 'No chats yet',
    
    // Settings
    'settings.title': 'Settings',
    'settings.general': 'General',
    'settings.notifications': 'Notifications',
    'settings.privacy': 'Privacy',
    'settings.language': 'Language',
    
    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.close': 'Close',
    'common.confirm': 'Confirm',
    'common.yes': 'Yes',
    'common.no': 'No',
    
    // Language
    'lang.english': 'English',
    'lang.russian': 'Русский',
  },
  ru: {
    // Navbar
    'nav.product': 'Продукт',
    'nav.features': 'Возможности',
    'nav.demo': 'Демо',
    'nav.pricing': 'Тарифы',
    'nav.getStarted': 'Начать',
    'nav.signIn': 'Войти',
    'nav.dashboard': 'Панель управления',
    
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
    
    // Dashboard
    'dashboard.welcome': 'Добро пожаловать',
    'dashboard.recentMeetings': 'Недавние встречи',
    'dashboard.upcomingMeetings': 'Предстоящие встречи',
    'dashboard.myAgents': 'Мои агенты',
    'dashboard.quickActions': 'Быстрые действия',
    'dashboard.createMeeting': 'Создать встречу',
    'dashboard.createAgent': 'Создать агента',
    'dashboard.viewAll': 'Показать все',
    
    // Meetings
    'meetings.title': 'Встречи',
    'meetings.create': 'Создать встречу',
    'meetings.join': 'Присоединиться',
    'meetings.scheduled': 'Запланировано',
    'meetings.onGoing': 'Идет',
    'meetings.ended': 'Завершено',
    'meetings.noMeetings': 'Нет запланированных встреч',
    
    // Participants
    'participants.title': 'Участники',
    'participants.enable': 'Включить управление участниками',
    'participants.speaking': 'говорят',
    'participants.withVideo': 'с включенным видео',
    'participants.moderators': 'модераторов',
    'participants.promote': 'Повысить',
    'participants.remove': 'Удалить',
    'participants.host': 'Организатор',
    'participants.moderator': 'Модератор',
    'participants.participant': 'Участник',
    
    // Agents
    'agents.title': 'ИИ-Агенты',
    'agents.create': 'Создать агента',
    'agents.edit': 'Редактировать',
    'agents.delete': 'Удалить',
    'agents.test': 'Тестировать',
    'agents.active': 'Активен',
    'agents.inactive': 'Неактивен',
    'agents.noAgents': 'Агенты еще не созданы',
    
    // Profile
    'profile.title': 'Профиль',
    'profile.edit': 'Редактировать профиль',
    'profile.save': 'Сохранить',
    'profile.cancel': 'Отмена',
    'profile.name': 'Имя',
    'profile.email': 'Email',
    'profile.bio': 'О себе',
    'profile.status': 'Статус',
    'profile.online': 'В сети',
    'profile.away': 'Отошел',
    'profile.offline': 'Не в сети',
    'profile.dnd': 'Не беспокоить',
    
    // Chats
    'chats.title': 'Чаты',
    'chats.new': 'Новый чат',
    'chats.send': 'Отправить',
    'chats.placeholder': 'Введите сообщение...',
    'chats.noChats': 'Чатов пока нет',
    
    // Settings
    'settings.title': 'Настройки',
    'settings.general': 'Общие',
    'settings.notifications': 'Уведомления',
    'settings.privacy': 'Конфиденциальность',
    'settings.language': 'Язык',
    
    // Common
    'common.loading': 'Загрузка...',
    'common.error': 'Ошибка',
    'common.success': 'Успешно',
    'common.save': 'Сохранить',
    'common.cancel': 'Отмена',
    'common.delete': 'Удалить',
    'common.edit': 'Редактировать',
    'common.close': 'Закрыть',
    'common.confirm': 'Подтвердить',
    'common.yes': 'Да',
    'common.no': 'Нет',
    
    // Language
    'lang.english': 'English',
    'lang.russian': 'Русский',
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
