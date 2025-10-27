import { db } from '@/db';
import { payments } from '@/db/schema';
import { eq } from 'drizzle-orm';

export interface SberPaymentConfig {
  merchantId: string;
  merchantLogin: string;
  merchantPassword: string;
  apiUrl: string;
  returnUrl: string;
  failUrl: string;
}

export interface SberPaymentRequest {
  orderNumber: string;
  amount: number;
  currency: string;
  description: string;
  email?: string;
  phone?: string;
}

export interface SberPaymentResponse {
  orderId: string;
  formUrl: string;
  errorCode?: number;
  errorMessage?: string;
}

export class SberPaymentService {
  private config: SberPaymentConfig;

  constructor(config: SberPaymentConfig) {
    this.config = config;
  }

  async createPayment(request: SberPaymentRequest): Promise<SberPaymentResponse> {
    try {
      const orderId = this.generateOrderId();
      
      // Создаем запрос к Сбер Кассе
      const paymentData = {
        userName: this.config.merchantLogin,
        password: this.config.merchantPassword,
        orderNumber: request.orderNumber,
        amount: request.amount * 100, // Сбер работает в копейках
        currency: request.currency === 'RUB' ? 643 : 840, // RUB = 643, USD = 840
        returnUrl: this.config.returnUrl,
        failUrl: this.config.failUrl,
        description: request.description,
        email: request.email,
        phone: request.phone,
      };

      // Здесь должен быть реальный API вызов к Сбер Кассе
      // Для демонстрации возвращаем моковый ответ
      const response = await this.mockSberApiCall(paymentData);

      // Сохраняем платеж в базу данных
      await db.insert(payments).values({
        subscriptionId: request.orderNumber,
        amount: request.amount,
        currency: request.currency,
        status: 'pending',
        sberOrderId: orderId,
        createdAt: new Date(),
      });

      return {
        orderId,
        formUrl: response.formUrl,
      };
    } catch (error) {
      console.error('Sber payment creation error:', error);
      throw error;
    }
  }

  async checkPaymentStatus(orderId: string): Promise<{
    status: 'pending' | 'succeeded' | 'failed' | 'canceled';
    amount?: number;
    currency?: string;
  }> {
    try {
      // Здесь должен быть реальный API вызов для проверки статуса
      const status = await this.mockSberStatusCheck(orderId);

      // Обновляем статус в базе данных
      await db
        .update(payments)
        .set({
          status: status.status,
          paidAt: status.status === 'succeeded' ? new Date() : undefined,
        })
        .where(eq(payments.sberOrderId, orderId));

      return status;
    } catch (error) {
      console.error('Sber payment status check error:', error);
      throw error;
    }
  }

  async handleWebhook(data: any): Promise<void> {
    try {
      const { orderId, status, amount, currency } = data;

      await db
        .update(payments)
        .set({
          status: status === 'approved' ? 'succeeded' : 'failed',
          paidAt: status === 'approved' ? new Date() : undefined,
        })
        .where(eq(payments.sberOrderId, orderId));
    } catch (error) {
      console.error('Sber webhook handling error:', error);
      throw error;
    }
  }

  private generateOrderId(): string {
    return `sber_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async mockSberApiCall(data: any): Promise<{ formUrl: string }> {
    // Моковый API вызов - в реальности здесь будет HTTP запрос к Сбер Кассе
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          formUrl: `https://securepayments.sberbank.ru/payment/merchants/${this.config.merchantId}/payment_ru.html?mdOrder=${data.orderNumber}`,
        });
      }, 100);
    });
  }

  private async mockSberStatusCheck(orderId: string): Promise<{
    status: 'pending' | 'succeeded' | 'failed' | 'canceled';
    amount?: number;
    currency?: string;
  }> {
    // Моковая проверка статуса
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          status: 'succeeded',
          amount: 2990,
          currency: 'RUB',
        });
      }, 100);
    });
  }
}

// Конфигурация для Сбер Кассы
export const sberConfig: SberPaymentConfig = {
  merchantId: process.env.SBER_MERCHANT_ID || '',
  merchantLogin: process.env.SBER_MERCHANT_LOGIN || '',
  merchantPassword: process.env.SBER_MERCHANT_PASSWORD || '',
  apiUrl: process.env.SBER_API_URL || 'https://securepayments.sberbank.ru',
  returnUrl: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success`,
  failUrl: `${process.env.NEXT_PUBLIC_APP_URL}/payment/failed`,
};

export const sberPaymentService = new SberPaymentService(sberConfig);
