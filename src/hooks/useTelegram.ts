// hooks/useTelegram.ts
import { useEffect, useState } from 'react';

interface TelegramUser {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
}

interface TelegramWebApp {
  initDataUnsafe?: {
    user?: TelegramUser;
  };
  expand: () => void;
  ready: () => void;
  close: () => void;
  sendData: (data: string) => void;
  HapticFeedback?: {
    impactOccurred: (style: 'light' | 'medium' | 'heavy') => void;
    notificationOccurred: (type: 'success' | 'error' | 'warning') => void;
  };
  themeParams?: {
    bg_color?: string;
    text_color?: string;
    button_color?: string;
    button_text_color?: string;
  };
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    };
  }
}

export function useTelegram() {
  const [tg, setTg] = useState<TelegramWebApp | null>(null);
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [isTelegram, setIsTelegram] = useState(false);

  useEffect(() => {
    if (window.Telegram?.WebApp) {
      const webApp = window.Telegram.WebApp;
      webApp.expand();
      webApp.ready();
      setTg(webApp);
      setIsTelegram(true);
      setUser(webApp.initDataUnsafe?.user || null);
    } else {
      // Демо-режим (вне Telegram)
      setUser({ id: 99999, first_name: 'Демо' });
    }
  }, []);

  const haptic = (type: 'impact' | 'success' | 'error' | 'warning', style?: 'light' | 'medium' | 'heavy') => {
    if (!tg?.HapticFeedback) return;

    if (type === 'impact') {
      tg.HapticFeedback.impactOccurred(style || 'light');
    } else {
      tg.HapticFeedback.notificationOccurred(type);
    }
  };

  // Отправка данных в бот (web_app_data). После вызова Telegram закрывает мини-апп.
  const sendData = (data: string) => {
    if (tg?.sendData) {
      tg.sendData(data);
      return true;
    }
    return false;
  };

  return { user, haptic, sendData, isTelegram, isReady: !!user };
}
