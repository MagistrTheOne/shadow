/**
 * Email notification utilities using Resend
 * Falls back to console logging if Resend is not configured
 */

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

let resendClient: any = null;

// Lazy load Resend to avoid errors if not installed
async function getResendClient() {
  if (resendClient) return resendClient;
  
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  if (!RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not configured, email sending will be disabled');
    return null;
  }

  try {
    // Dynamic import с обработкой ошибок
    // Используем Function constructor для предотвращения статического анализа Next.js
    const importResend = new Function('return import("resend")');
    const resendModule = await (importResend() as Promise<any>).catch(() => null);
    if (!resendModule || !resendModule.Resend) {
      console.warn('Resend package not installed, email sending disabled');
      return null;
    }
    const { Resend } = resendModule;
    resendClient = new Resend(RESEND_API_KEY);
    return resendClient;
  } catch (error) {
    console.warn('Resend package not installed, email sending disabled');
    return null;
  }
}

/**
 * Send an email notification
 */
export async function sendEmail(options: EmailOptions): Promise<{ success: boolean; error?: string }> {
  const client = await getResendClient();
  
  if (!client) {
    // Log to console in development/staging
    console.log('[Email]', {
      to: options.to,
      subject: options.subject,
      html: options.html.substring(0, 100) + '...',
    });
    return { success: true }; // Return success to not break the flow
  }

  try {
    await client.emails.send({
      from: options.from || process.env.RESEND_FROM_EMAIL || 'noreply@shadow.ai',
      to: options.to,
      subject: options.subject,
      html: options.html,
    });

    return { success: true };
  } catch (error: any) {
    console.error('Failed to send email:', error);
    return { 
      success: false, 
      error: error.message || 'Unknown error' 
    };
  }
}

/**
 * Send meeting reminder email
 */
export async function sendMeetingReminderEmail(
  userEmail: string,
  userName: string,
  meetingTitle: string,
  meetingId: string,
  scheduledAt: Date
): Promise<{ success: boolean }> {
  const meetingUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/meetings/${meetingId}`;
  const formattedDate = scheduledAt.toLocaleString('ru-RU', {
    dateStyle: 'long',
    timeStyle: 'short',
  });

  return sendEmail({
    to: userEmail,
    subject: `Напоминание: ${meetingTitle}`,
    html: `
      <!DOCTYPE html>
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2>Напоминание о встрече</h2>
          <p>Привет, ${userName}!</p>
          <p>Напоминаем, что у вас запланирована встреча:</p>
          <div style="background: #f4f4f4; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0;">${meetingTitle}</h3>
            <p><strong>Дата и время:</strong> ${formattedDate}</p>
          </div>
          <a href="${meetingUrl}" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 10px;">
            Открыть встречу
          </a>
        </body>
      </html>
    `,
  });
}

/**
 * Send meeting started notification
 */
export async function sendMeetingStartedEmail(
  userEmail: string,
  userName: string,
  meetingTitle: string,
  meetingId: string
): Promise<{ success: boolean }> {
  const meetingUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/meetings/${meetingId}/call`;

  return sendEmail({
    to: userEmail,
    subject: `Встреча "${meetingTitle}" началась`,
    html: `
      <!DOCTYPE html>
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2>Встреча началась</h2>
          <p>Привет, ${userName}!</p>
          <p>Встреча "${meetingTitle}" только что началась.</p>
          <a href="${meetingUrl}" style="background: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 10px;">
            Присоединиться к встрече
          </a>
        </body>
      </html>
    `,
  });
}

