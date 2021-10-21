// Middleware для ошибок

/*
  ИНТЕРЕСНЫЙ ФАКТ

  Время от времени это middleware нихуя не работает.
  Я не ебу почему, код абсолютно правильно написан

  

  ☦ Ну со мной бог, так что не отчаиваемся ☦

*/
const ApiError = require('../exceptions/api-error') // Подключаем класс для вывода ошибок


module.exports = (err, req, res, next) => {
  console.log(err)

  // Оператор instanceof проверяет, принадлежит ли объект к определённому классу
  if(err instanceof ApiError) {
    return res.status(err.status).json({message: err.message, errors: err.errors})
  }

  // Ошибка сервера
  return res.status(500).json({message: 'Непредвиденная ошибка'})
}
