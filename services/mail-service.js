// Сервис для отпраки писем активации на почту

/*
  ВАЖНО ВКЛЮЧИТЬ НЕБЕЗОПАСНЫЕ ПРИЛОЖЕНИЯ
  ПО ССЫЛКЕ  https://www.google.com/настройки/безопасность/lesssecureapps
  ИНАЧЕ ПИЗДА, НИХУЯ ОТПРАВЛЯТЬСЯ НЕ БУДЕТ
*/

const nodemailer = require('nodemailer') // Импортируем nodemailer для отправки писем

class MailService {

  constructor() {
    // Инициализируем почтовый клиент
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
      }
    })
  }



  // Принимает два параметра: email и ссылка для активации
  async sendActivationMail(to, link) {
    // Отправка сообщения
    await this.transporter.sendMail({
      from: process.env.SMTP_USER,
      to,
      subject: `Активация аккаунта на ${process.env.API_URL}`,
      text: '',
      html:
        `
          <div>
            <h1>Для активации перейдите по ссылке</h1>
            <a href="${link}">${link}</a>
          </div>
        `
    })
  }
}

module.exports = new MailService() // Экспортируем экземпляр класса MailService
