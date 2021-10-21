// Сервис для генерации jwt

/*
  ЛОГИКА РАБОТЫ:
    - У нас есть 2 функции в классе: {
        * Первая generateToken - генерирует access и refresh токены
        * Вторая saveToken - сохраняет refresh токен в БД. Если же уже есть пользователь с refresh токеном, то
          он просто обновит свой токен.
    }
*/

const jwt = require('jsonwebtoken') // Импортируем jsonwebtoken
const TokenModel = require('../models/token-model') // Импортируем модель токена

class TokenService {
  // Передаем payload - информацию о пользователе, которые мы шифруем
  generateToken(payload) {

    /*
      Функция генерирует 2 токена: {
        - access - токен временного доступа;
        - refresh - токен для обновления access-токена;
      }
    */

    // Метод sign принимает 3 параметра: payload, секретный ключ и некоторые опции, например время жизни токена
    const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {expiresIn: '15s'})
    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {expiresIn: '30d'})

    return {
      accessToken,
      refreshToken
    }
  }

  // Добавляем функцию для сохранения refresh-токена в БД, передаем 2 параметра: id пользователя и refreshToken
  async saveToken(userId, refreshToken) {
    // Ищем пользователя с определеным id
    const tokenData = await TokenModel.findOne({user: userId})

    // Если нашли, то перезаписываем refresh-токен
    if(tokenData) {
      tokenData.refreshToken = refreshToken

      // Сохраняем изменения
      return tokenData.save()
    }

    // Создем новый refreshToken
    const token = await TokenModel.create({user: userId, refreshToken})

    // Сохраняем токен
    return token.save()




  }

  // Добавляем функцию для удаления refresh-токена в БД
  async removeToken(refreshToken) {
    // Удаляем токен из БД
    const tokenData = await TokenModel.deleteOne({refreshToken})

    return tokenData
  }

  // Валидация access токена
  validateAccessToken(token) {
    try {
      // Получаем payload из токена
      const userData = jwt.verify(token, process.env.JWT_ACCESS_SECRET)

      // Возвращаем токен
      return userData
    } catch (e) {
      return null
    }
  }

  // Валидация refresh токена
  validateRefreshToken(token) {
    try {
      // Получаем payload из токена
      const userData = jwt.verify(token, process.env.JWT_REFRESH_SECRET)

      // Возвращаем токен
      return userData
    } catch (e) {
      return null
    }
  }

  // Добавляем функцию для поиска refresh-токена в БД
  async findToken(refreshToken) {
    // Ищем токен из БД
    const tokenData = await TokenModel.findOne({refreshToken})
    return tokenData
  }
}

module.exports = new TokenService() // Экспортируем экземпляр класса TokenService
