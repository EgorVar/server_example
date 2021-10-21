// Middleware для отпраки данных зарегистрированным пользователями

/*
  ПОЯСНЕНИЕ

  Чтобы понять, что пользователь авторизован, нам необходимо получить access токен.
  Получать мы его будем из Headers поля Authorization

  Указывается токен в поле следующим образом:
    - Bearer ${ACCESS_TOKEN}

*/

const ApiError = require('../exceptions/api-error') // Подключаем класс для вывода ошибок
const tokenService = require('../services/token-service') // Подключаем tokenService

module.exports = function (req, res, next) {
  try {
    // Получаем значение поля Authorization
    const authorizationHeader = req.headers.authorization

    // Если этот хэдер не указан, пробрасываем ошибку
    if(!authorizationHeader) {
      return next(ApiError.UnauthorizedError())
    }

    // Достаем токен из хэдера
    const accessToken = authorizationHeader.split(' ')[1]

    // Если токена нет, пробрасываем ошибку
    if(!accessToken) {
      return next(ApiError.UnauthorizedError())
    }

    // Получаем payload
    const userData = tokenService.validateAccessToken(accessToken)

    // Если payload нет, пробрасываем ошибку
    if(!userData) {
      return next(ApiError.UnauthorizedError())
    }

    // Помещаем данные о пользователе в запрос
    req.user = userData

    // Вызываем следующий middleware
    next()

  } catch (e) {
    // Пробрасываем ошибку
    return next(ApiError.UnauthorizedError())
  }
}
