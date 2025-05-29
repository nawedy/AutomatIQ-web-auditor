import nodemailer from "nodemailer"

interface EmailConfig {
  host: string
  port: number
  secure: boolean
  user: string
  password: string
  from: string
}

interface EmailData {
  to: string
  subject: string
  html: string
  text?: string
}

class EmailService {
  private transporter: nodemailer.Transporter
  private config: EmailConfig

  constructor(config: EmailConfig) {
    this.config = config
    this.transporter = nodemailer.createTransporter({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.user,
        pass: config.password,
      },
    })
  }

  async sendEmail(data: EmailData): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: this.config.from,
        to: data.to,
        subject: data.subject,
        html: data.html,
        text: data.text,
      })
      console.log(`Email sent to ${data.to}: ${data.subject}`)
    } catch (error) {
      console.error("Failed to send email:", error)
      throw error
    }
  }

  async sendAuditCompleteEmail(
    userEmail: string,
    websiteName: string,
    score: number,
    issuesFound: number,
    reportUrl: string,
  ): Promise<void> {
    const scoreColor = score >= 80 ? "#10B981" : score >= 60 ? "#F59E0B" : "#EF4444"

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Audit Complete</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">AuditPro</h1>
          <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Website Audit Complete</p>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <h2 style="color: #333; margin-top: 0;">Audit Results for ${websiteName}</h2>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 15px;">
              <span style="font-size: 18px; font-weight: bold;">Overall Score:</span>
              <span style="font-size: 24px; font-weight: bold; color: ${scoreColor};">${score}/100</span>
            </div>
            
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <span style="font-size: 16px;">Issues Found:</span>
              <span style="font-size: 18px; font-weight: bold; color: ${issuesFound > 0 ? "#EF4444" : "#10B981"};">${issuesFound}</span>
            </div>
          </div>
          
          <p>Your website audit has been completed successfully. ${issuesFound > 0 ? "We found some areas for improvement." : "Great job! Your website is performing well."}</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${reportUrl}" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">View Full Report</a>
          </div>
        </div>
      </body>
      </html>
    `

    await this.sendEmail({
      to: userEmail,
      subject: `Audit Complete: ${websiteName} - Score: ${score}/100`,
      html,
      text: `Audit Complete for ${websiteName}\nScore: ${score}/100\nIssues Found: ${issuesFound}\nView report: ${reportUrl}`,
    })
  }

  async sendScheduledAuditReminder(userEmail: string, websiteName: string, scheduledTime: string): Promise<void> {
    const html = `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2>Scheduled Audit Reminder</h2>
        <p>This is a reminder that an audit for <strong>${websiteName}</strong> is scheduled to run at ${scheduledTime}.</p>
        <p>You will receive another email once the audit is complete.</p>
      </body>
      </html>
    `

    await this.sendEmail({
      to: userEmail,
      subject: `Scheduled Audit Reminder: ${websiteName}`,
      html,
      text: `Scheduled audit reminder for ${websiteName} at ${scheduledTime}`,
    })
  }
}

// Email service instance
export const emailService = new EmailService({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: Number.parseInt(process.env.EMAIL_PORT || "587"),
  secure: process.env.EMAIL_SECURE === "true",
  user: process.env.EMAIL_USER || "",
  password: process.env.EMAIL_PASSWORD || "",
  from: process.env.EMAIL_FROM || "noreply@auditpro.com",
})

export default emailService
