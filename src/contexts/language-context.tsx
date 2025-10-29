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
    'nav.whitelist': 'Whitelist',
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
    
    // Landing Hero
    'landing.hero.badge': 'Premium AI Technology • 2025',
    'landing.hero.title1': 'Intelligent',
    'landing.hero.title2': 'AI Avatars',
    'landing.hero.subtitle': 'Experience the future of professional meetings with AI avatars that understand context, generate insights, and enhance collaboration.',
    'landing.hero.cta': 'Go to Dashboard',
    'landing.hero.videoDescription': 'Watch our AI avatar in action during a real meeting scenario',
    
    // Landing Features
    'landing.features.badge': 'Product Features',
    'landing.features.title1': 'Everything you need for',
    'landing.features.title2': 'professional meetings',
    'landing.features.subtitle': 'Experience enterprise-grade video conferencing with sophisticated AI avatars, intelligent automation, and seamless collaboration tools.',
    'landing.features.trusted': 'Trusted by enterprise teams worldwide',
    
    // Feature Items
    'landing.features.aiAvatars.title': 'AI Avatars',
    'landing.features.aiAvatars.desc': 'Sophisticated avatars that understand context and respond naturally to your meetings.',
    'landing.features.videoCalls.title': 'Premium Video Calls',
    'landing.features.videoCalls.desc': 'Crystal clear video quality with advanced noise cancellation and background effects.',
    'landing.features.chat.title': 'Real-time Chat',
    'landing.features.chat.desc': 'Instant messaging during meetings with AI-powered suggestions and translations.',
    'landing.features.transcripts.title': 'Smart Transcripts',
    'landing.features.transcripts.desc': 'Automatic transcription with AI-powered summaries and action item extraction.',
    'landing.features.insights.title': 'AI Insights',
    'landing.features.insights.desc': 'Get intelligent insights, sentiment analysis, and meeting effectiveness metrics.',
    'landing.features.security.title': 'Enterprise Security',
    'landing.features.security.desc': 'Bank-level encryption, SOC 2 compliance, and advanced privacy controls.',
    
    // Landing Pricing
    'landing.pricing.badge': 'Pricing',
    'landing.pricing.title1': 'Choose your',
    'landing.pricing.title2': 'perfect plan',
    'landing.pricing.subtitle': 'Start free and scale as you grow. All plans include our enterprise AI avatar technology and premium meeting features.',
    'landing.pricing.popular': 'Most Popular',
    'landing.pricing.starter.name': 'Starter',
    'landing.pricing.starter.price': 'Free',
    'landing.pricing.starter.period': 'forever',
    'landing.pricing.starter.desc': 'Perfect for individuals and small teams',
    'landing.pricing.starter.cta': 'Get Started',
    'landing.pricing.professional.name': 'Professional',
    'landing.pricing.professional.price': '$29',
    'landing.pricing.professional.period': 'per month',
    'landing.pricing.professional.desc': 'Best for growing teams and businesses',
    'landing.pricing.professional.cta': 'Start Free Trial',
    'landing.pricing.enterprise.name': 'Enterprise',
    'landing.pricing.enterprise.price': 'Custom',
    'landing.pricing.enterprise.period': 'pricing',
    'landing.pricing.enterprise.desc': 'For large organizations with advanced needs',
    'landing.pricing.enterprise.cta': 'Contact Sales',
    'landing.pricing.trial': 'All plans include 14-day free trial • No credit card required • Cancel anytime',
    'landing.pricing.compliance': '✓ SOC 2 Compliant',
    'landing.pricing.gdpr': '✓ GDPR Ready',
    'landing.pricing.uptime': '✓ 99.9% Uptime SLA',
    
    // Pricing Features
    'landing.pricing.features.meetings5': 'Up to 5 meetings per month',
    'landing.pricing.features.basicAvatar': 'Basic AI avatar',
    'landing.pricing.features.standardVideo': 'Standard video quality',
    'landing.pricing.features.basicTranscripts': 'Basic transcripts',
    'landing.pricing.features.emailSupport': 'Email support',
    'landing.pricing.features.unlimitedMeetings': 'Unlimited meetings',
    'landing.pricing.features.advancedAvatars': 'Advanced AI avatars',
    'landing.pricing.features.hdVideo': 'HD video quality',
    'landing.pricing.features.smartTranscripts': 'Smart transcripts & summaries',
    'landing.pricing.features.aiInsights': 'AI-powered insights',
    'landing.pricing.features.prioritySupport': 'Priority support',
    'landing.pricing.features.customBranding': 'Custom branding',
    'landing.pricing.features.everythingPro': 'Everything in Professional',
    'landing.pricing.features.customTraining': 'Custom AI avatar training',
    'landing.pricing.features.4kVideo': '4K video quality',
    'landing.pricing.features.advancedAnalytics': 'Advanced analytics',
    'landing.pricing.features.sso': 'SSO integration',
    'landing.pricing.features.dedicatedSupport': 'Dedicated support',
    'landing.pricing.features.customIntegrations': 'Custom integrations',
    'landing.pricing.features.onPremise': 'On-premise deployment',
    
    // Landing Footer
    'landing.footer.brand': 'Shadow AI',
    'landing.footer.description': 'The future of professional meetings with intelligent AI avatars and seamless collaboration.',
    'landing.footer.product': 'Product',
    'landing.footer.company': 'Company',
    'landing.footer.support': 'Support',
    'landing.footer.copyright': 'All rights reserved.',
    'landing.footer.createdBy': 'Created by',
    'landing.footer.contact': 'Contact',
    
    // Whitelist
    'whitelist.badge': 'Early Access',
    'whitelist.title': 'Join the Whitelist',
    'whitelist.subtitle': 'Get early access to Shadow AI before the public launch. Be among the first to experience revolutionary AI-powered video meetings.',
    'whitelist.dropDate': 'Drop Date: November 23, 2025',
    'whitelist.formTitle': 'Request Early Access',
    'whitelist.name': 'Name',
    'whitelist.namePlaceholder': 'Your full name',
    'whitelist.company': 'Company',
    'whitelist.companyPlaceholder': 'Your company name',
    'whitelist.email': 'Email',
    'whitelist.emailPlaceholder': 'your.email@example.com',
    'whitelist.request': 'Request',
    'whitelist.requestPlaceholder': 'Tell us about your use case and why you need early access...',
    'whitelist.submit': 'Submit Request',
    'whitelist.submitting': 'Submitting...',
    'whitelist.success': 'Your request has been submitted successfully!',
    'whitelist.error': 'Failed to submit request. Please try again.',
    'whitelist.info': 'We will review your request and contact you soon.',
  },
  ru: {
    // Navbar
    'nav.product': 'Продукт',
    'nav.features': 'Возможности',
    'nav.demo': 'Демо',
    'nav.pricing': 'Тарифы',
    'nav.whitelist': 'Белый список',
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
    
    // Landing Hero
    'landing.hero.badge': 'Премиум ИИ Технологии • 2025',
    'landing.hero.title1': 'Умные',
    'landing.hero.title2': 'ИИ Аватары',
    'landing.hero.subtitle': 'Познайте будущее профессиональных встреч с ИИ-аватарами, которые понимают контекст, генерируют инсайты и улучшают сотрудничество.',
    'landing.hero.cta': 'Перейти в панель',
    'landing.hero.videoDescription': 'Посмотрите нашего ИИ-аватара в действии во время реальной встречи',
    
    // Landing Features
    'landing.features.badge': 'Возможности продукта',
    'landing.features.title1': 'Всё необходимое для',
    'landing.features.title2': 'профессиональных встреч',
    'landing.features.subtitle': 'Опыт корпоративных видеоконференций с продвинутыми ИИ-аватарами, интеллектуальной автоматизацией и инструментами совместной работы.',
    'landing.features.trusted': 'Доверяют корпоративные команды по всему миру',
    
    // Feature Items
    'landing.features.aiAvatars.title': 'ИИ Аватары',
    'landing.features.aiAvatars.desc': 'Продвинутые аватары, которые понимают контекст и естественно реагируют на ваши встречи.',
    'landing.features.videoCalls.title': 'Премиум видеозвонки',
    'landing.features.videoCalls.desc': 'Кристально чистое качество видео с продвинутым подавлением шума и эффектами фона.',
    'landing.features.chat.title': 'Чат в реальном времени',
    'landing.features.chat.desc': 'Мгновенные сообщения во время встреч с ИИ-предложениями и переводами.',
    'landing.features.transcripts.title': 'Умные транскрипты',
    'landing.features.transcripts.desc': 'Автоматическая транскрипция с ИИ-резюме и извлечением задач.',
    'landing.features.insights.title': 'ИИ Инсайты',
    'landing.features.insights.desc': 'Получайте интеллектуальные инсайты, анализ настроений и метрики эффективности встреч.',
    'landing.features.security.title': 'Корпоративная безопасность',
    'landing.features.security.desc': 'Банковское шифрование, соответствие SOC 2 и продвинутые настройки конфиденциальности.',
    
    // Landing Pricing
    'landing.pricing.badge': 'Тарифы',
    'landing.pricing.title1': 'Выберите свой',
    'landing.pricing.title2': 'идеальный план',
    'landing.pricing.subtitle': 'Начните бесплатно и масштабируйтесь по мере роста. Все планы включают нашу корпоративную технологию ИИ-аватаров и премиум функции встреч.',
    'landing.pricing.popular': 'Самый популярный',
    'landing.pricing.starter.name': 'Стартовый',
    'landing.pricing.starter.price': 'Бесплатно',
    'landing.pricing.starter.period': 'навсегда',
    'landing.pricing.starter.desc': 'Идеально для частных лиц и малых команд',
    'landing.pricing.starter.cta': 'Начать',
    'landing.pricing.professional.name': 'Профессиональный',
    'landing.pricing.professional.price': '$29',
    'landing.pricing.professional.period': 'в месяц',
    'landing.pricing.professional.desc': 'Лучший для растущих команд и бизнеса',
    'landing.pricing.professional.cta': 'Начать бесплатный пробный период',
    'landing.pricing.enterprise.name': 'Корпоративный',
    'landing.pricing.enterprise.price': 'Индивидуально',
    'landing.pricing.enterprise.period': 'ценообразование',
    'landing.pricing.enterprise.desc': 'Для крупных организаций с продвинутыми потребностями',
    'landing.pricing.enterprise.cta': 'Связаться с продажами',
    'landing.pricing.trial': 'Все планы включают 14-дневный бесплатный пробный период • Без кредитной карты • Отмена в любое время',
    'landing.pricing.compliance': '✓ Соответствие SOC 2',
    'landing.pricing.gdpr': '✓ Готовность GDPR',
    'landing.pricing.uptime': '✓ 99.9% SLA доступности',
    
    // Pricing Features
    'landing.pricing.features.meetings5': 'До 5 встреч в месяц',
    'landing.pricing.features.basicAvatar': 'Базовый ИИ-аватар',
    'landing.pricing.features.standardVideo': 'Стандартное качество видео',
    'landing.pricing.features.basicTranscripts': 'Базовые транскрипты',
    'landing.pricing.features.emailSupport': 'Поддержка по email',
    'landing.pricing.features.unlimitedMeetings': 'Неограниченные встречи',
    'landing.pricing.features.advancedAvatars': 'Продвинутые ИИ-аватары',
    'landing.pricing.features.hdVideo': 'HD качество видео',
    'landing.pricing.features.smartTranscripts': 'Умные транскрипты и резюме',
    'landing.pricing.features.aiInsights': 'ИИ-инсайты',
    'landing.pricing.features.prioritySupport': 'Приоритетная поддержка',
    'landing.pricing.features.customBranding': 'Кастомный брендинг',
    'landing.pricing.features.everythingPro': 'Всё из Профессионального',
    'landing.pricing.features.customTraining': 'Кастомное обучение ИИ-аватара',
    'landing.pricing.features.4kVideo': '4K качество видео',
    'landing.pricing.features.advancedAnalytics': 'Продвинутая аналитика',
    'landing.pricing.features.sso': 'SSO интеграция',
    'landing.pricing.features.dedicatedSupport': 'Выделенная поддержка',
    'landing.pricing.features.customIntegrations': 'Кастомные интеграции',
    'landing.pricing.features.onPremise': 'On-premise развертывание',
    
    // Landing Footer
    'landing.footer.brand': 'Shadow AI',
    'landing.footer.description': 'Будущее профессиональных встреч с интеллектуальными ИИ-аватарами и бесшовным сотрудничеством.',
    'landing.footer.product': 'Продукт',
    'landing.footer.company': 'Компания',
    'landing.footer.support': 'Поддержка',
    'landing.footer.copyright': 'Все права защищены.',
    'landing.footer.createdBy': 'Создано',
    'landing.footer.contact': 'Контакты',
    
    // Whitelist
    'whitelist.badge': 'Ранний доступ',
    'whitelist.title': 'Присоединиться к списку',
    'whitelist.subtitle': 'Получите ранний доступ к Shadow AI до публичного запуска. Будьте среди первых, кто испытает революционные видеовстречи с ИИ.',
    'whitelist.dropDate': 'Дата запуска: 23 ноября 2025',
    'whitelist.formTitle': 'Запросить ранний доступ',
    'whitelist.name': 'Имя',
    'whitelist.namePlaceholder': 'Ваше полное имя',
    'whitelist.company': 'Компания',
    'whitelist.companyPlaceholder': 'Название вашей компании',
    'whitelist.email': 'Email',
    'whitelist.emailPlaceholder': 'ваш.email@example.com',
    'whitelist.request': 'Запрос',
    'whitelist.requestPlaceholder': 'Расскажите нам о вашем случае использования и почему вам нужен ранний доступ...',
    'whitelist.submit': 'Отправить запрос',
    'whitelist.submitting': 'Отправка...',
    'whitelist.success': 'Ваш запрос успешно отправлен!',
    'whitelist.error': 'Не удалось отправить запрос. Пожалуйста, попробуйте снова.',
    'whitelist.info': 'Мы рассмотрим ваш запрос и скоро свяжемся с вами.',
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
