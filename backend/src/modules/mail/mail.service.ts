import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(MailService.name);

  constructor() {
    // Configuração do Transportador (SMTP)
    // Em produção, use SendGrid, Mailgun ou seu SMTP corporativo
    this.transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST || 'smtp.ethereal.email',
      port: parseInt(process.env.MAIL_PORT || '587', 10),
      secure: process.env.MAIL_SECURE === 'true',
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });
  }

  async sendVerificationCode(email: string, code: string) {
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b;">
        <div style="background: linear-gradient(to right, #2563eb, #6366f1); padding: 32px; text-align: center; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">FINANHUB</h1>
          <p style="color: #e2e8f0; margin-top: 8px;">M&A Enterprise Ecosystem</p>
        </div>
        
        <div style="padding: 40px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 0 0 12px 12px;">
          <h2 style="font-size: 20px; font-weight: 600; margin-bottom: 16px;">Seu Código de Segurança</h2>
          <p style="line-height: 1.6;">Olá,</p>
          <p style="line-height: 1.6;">Você está iniciando seu cadastro no Finanhub. Para garantir a segurança da operação, utilize o código abaixo para validar seu e-mail corporativo:</p>
          
          <div style="background: white; padding: 24px; border-radius: 12px; text-align: center; margin: 32px 0; border: 2px dashed #cbd5e1;">
            <span style="font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #1e1b4b;">${code}</span>
          </div>
          
          <p style="font-size: 14px; color: #64748b; line-height: 1.6;">
            Este código expira em 15 minutos. Se você não solicitou este acesso, por favor ignore este e-mail.
          </p>
          
          <hr style="margin: 32px 0; border: 0; border-top: 1px solid #e2e8f0;" />
          
          <p style="font-size: 12px; color: #94a3b8; text-align: center;">
            Finanhub - Plataforma B2B para Fusões e Aquisições<br/>
            Este é um e-mail automático, por favor não responda.
          </p>
        </div>
      </div>
    `;

    try {
      await this.transporter.sendMail({
        from: `"Finanhub Security" <${process.env.MAIL_FROM || 'security@finanhub.com.br'}>`,
        to: email,
        subject: `${code} é seu código de verificação Finanhub`,
        html,
      });
      this.logger.log(`E-mail de verificação enviado para ${email}`);
    } catch (error) {
      this.logger.error(`Falha ao enviar e-mail para ${email}:`, error);
      if (process.env.NODE_ENV === 'production') throw error;
    }
  }

  async sendInvitation(email: string, fullName: string, tenantName: string, inviteLink: string) {
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b;">
        <div style="background: linear-gradient(to right, #2563eb, #6366f1); padding: 32px; text-align: center; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">FINANHUB</h1>
          <p style="color: #e2e8f0; margin-top: 8px;">M&A Enterprise Ecosystem</p>
        </div>

        <div style="padding: 40px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 0 0 12px 12px;">
          <h2 style="font-size: 20px; font-weight: 600; margin-bottom: 16px;">Você foi convidado</h2>
          <p style="line-height: 1.6;">Olá, <strong>${fullName}</strong></p>
          <p style="line-height: 1.6;">
            Você foi convidado para integrar o workspace <strong>${tenantName}</strong> na plataforma Finanhub.
            Clique no botão abaixo para definir sua senha e ativar sua conta:
          </p>

          <div style="text-align: center; margin: 32px 0;">
            <a href="${inviteLink}" style="background: #2563eb; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px;">
              Aceitar Convite
            </a>
          </div>

          <p style="font-size: 14px; color: #64748b; line-height: 1.6;">
            Este convite expira em 48 horas. Se você não esperava este convite, ignore este e-mail.
          </p>

          <hr style="margin: 32px 0; border: 0; border-top: 1px solid #e2e8f0;" />

          <p style="font-size: 12px; color: #94a3b8; text-align: center;">
            Finanhub - Plataforma B2B para Fusões e Aquisições<br/>
            Este é um e-mail automático, por favor não responda.
          </p>
        </div>
      </div>
    `;

    try {
      await this.transporter.sendMail({
        from: `"Finanhub" <${process.env.MAIL_FROM || 'noreply@finanhub.com.br'}>`,
        to: email,
        subject: `Convite para integrar ${tenantName} no Finanhub`,
        html,
      });
      this.logger.log(`Convite enviado para ${email}`);
    } catch (error) {
      this.logger.error(`Falha ao enviar convite para ${email}:`, error);
      if (process.env.NODE_ENV === 'production') throw error;
    }
  }

  async sendResetPasswordCode(email: string, code: string) {
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b;">
        <div style="background: linear-gradient(to right, #2563eb, #6366f1); padding: 32px; text-align: center; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">FINANHUB</h1>
          <p style="color: #e2e8f0; margin-top: 8px;">M&A Enterprise Ecosystem</p>
        </div>

        <div style="padding: 40px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 0 0 12px 12px;">
          <h2 style="font-size: 20px; font-weight: 600; margin-bottom: 16px;">Redefinição de Senha</h2>
          <p style="line-height: 1.6;">Olá,</p>
          <p style="line-height: 1.6;">Recebemos uma solicitação para redefinir a senha da sua conta Finanhub. Use o código abaixo para prosseguir:</p>

          <div style="background: white; padding: 24px; border-radius: 12px; text-align: center; margin: 32px 0; border: 2px dashed #cbd5e1;">
            <span style="font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #1e1b4b;">${code}</span>
          </div>

          <p style="font-size: 14px; color: #64748b; line-height: 1.6;">
            Este código expira em 15 minutos. Se você não solicitou a redefinirção de senha, ignore este e-mail — sua senha permanece inalterada.
          </p>

          <hr style="margin: 32px 0; border: 0; border-top: 1px solid #e2e8f0;" />

          <p style="font-size: 12px; color: #94a3b8; text-align: center;">
            Finanhub - Plataforma B2B para Fusões e Aquisições<br/>
            Este é um e-mail automático, por favor não responda.
          </p>
        </div>
      </div>
    `;

    try {
      await this.transporter.sendMail({
        from: `"Finanhub Security" <${process.env.MAIL_FROM || 'security@finanhub.com.br'}>`,
        to: email,
        subject: `${code} — Redefinição de senha Finanhub`,
        html,
      });
      this.logger.log(`E-mail de reset enviado para ${email}`);
    } catch (error) {
      this.logger.error(`Falha ao enviar e-mail de reset para ${email}:`, error);
      if (process.env.NODE_ENV === 'production') throw error;
    }
  }

  async sendNewLeadNotification(email: string, lead: any) {
    const listingTitle = lead.listing?.title || 'Seu Anúncio';
    const investorName = lead.investor?.fullName || 'Um Investidor';
    const leadMessage = lead.message || 'Manifestação de interesse recebida.';
    
    // Link para o painel de leads (ajustar conforme slug/url real)
    const dashboardLink = `${process.env.FRONTEND_URL || 'http://localhost:3001'}/dashboard/leads`;

    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b;">
        <div style="background: #020617; padding: 40px; text-align: center; border-radius: 16px 16px 0 0;">
          <h1 style="color: #12b3af; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.025em;">FINANHUB</h1>
          <p style="color: #64748b; margin-top: 8px; font-size: 14px; text-transform: uppercase; tracking: 0.1em;">Business Intelligence Hub</p>
        </div>

        <div style="padding: 40px; background: #ffffff; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 16px 16px;">
          <h2 style="font-size: 22px; font-weight: 700; color: #0f172a; margin-bottom: 24px;">Novo Lead Recebido</h2>
          
          <p style="line-height: 1.6; color: #475569;">
            Você recebeu uma nova manifestação de interesse para a oportunidade: <br/>
            <strong style="color: #0f172a; font-size: 18px;">${listingTitle}</strong>
          </p>

          <div style="margin: 32px 0; padding: 24px; background: #f8fafc; border-radius: 12px; border-left: 4px solid #12b3af;">
            <p style="margin: 0; font-size: 13px; font-weight: 600; color: #12b3af; text-transform: uppercase;">Mensagem do Investidor</p>
            <p style="margin: 12px 0 0; font-style: italic; color: #334155; line-height: 1.5;">"${leadMessage}"</p>
          </div>

          <div style="text-align: center; margin: 40px 0;">
            <a href="${dashboardLink}" style="background: #0f172a; color: #12b3af; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 15px; border: 1px solid #12b3af; display: inline-block;">
              VER DETALHES NO PAINEL
            </a>
          </div>

          <p style="font-size: 13px; color: #94a3b8; line-height: 1.6; text-align: center;">
            A equipe Finanhub está acompanhando esta solicitação para garantir a agilidade no processo de intermediação.
          </p>

          <hr style="margin: 40px 0; border: 0; border-top: 1px solid #f1f5f9;" />

          <p style="font-size: 11px; color: #cbd5e1; text-align: center; text-transform: uppercase; letter-spacing: 0.05em;">
            FINANHUB • PLATAFORMA DE INTERMEDIAÇÃO ESTRATÉGICA
          </p>
        </div>
      </div>
    `;

    try {
      await this.transporter.sendMail({
        from: `"Finanhub Leads" <${process.env.MAIL_FROM || 'leads@finanhub.com.br'}>`,
        to: email,
        subject: `Novo Lead: ${listingTitle}`,
        html,
      });
      this.logger.log(`E-mail de notificação de lead enviado para ${email}`);
    } catch (error) {
      this.logger.error(`Falha ao enviar e-mail de lead para ${email}:`, error);
    }
  }
}
