const userService = require('../services/user-service') // Импортируем userService
const {validationResult} = require('express-validator')
const ApiError = require('../exceptions/api-error')


/*
  Создаем класс с функциями для маршрутизации, который содержит 6 методов: {
    - registartion - регистрация;
    - login - вход;
    - logout - выход;
    - activation - отправка ссылки для активации;
    - refresh - получение refresh-токена;
    - getUsers - получение пользователей;

  }

*/
class UserController {
  // Все методы асинхронны, т.к. мы работаем с запросами


  /*
    Функции принимают 3 аргумента: {
      - req - запрос;
      - res - ответ;
      - next - вызывает следующую в цепочке middleware;
    }
  */
  async registration(req, res, next) {
    try {
      // Проверяем поля
      const errors = validationResult(req)

      // Если errors не пустой, то выводим ошибку
      if(!errors.isEmpty()) {
        return next(ApiError.BadRequest('Ошибка при валидации', errors.array()))
      }
      // Достаем данные из тела запроса
      const {email, password} = req.body

      // Вызываем метод registartion и создаем нового пользователя
      const userData = await userService.registration(email, password)

      /*
        Сохраняем refresh токен в куки, параметры: {
          - Первый параметр - ключ;
          - Второй параметр - значение;
          - Третий параметр - Опции, такие как время жизни - maxAge, и httpOnly - опция, которая запрещает
            изменять значение куки внутри браузера
        }
      */
      res.cookie('refreshToken', userData.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000})

      // Отправляем данные клиенту
      return res.json(userData)
    } catch (e) {
      next(e)
    }
  }


  async login(req, res, next) {
    try {
      // Достаем данные из тела запроса
      const {email, password} = req.body


      // Выполняем вход
      const userData = await userService.login(email, password)

      // Сохраняем refresh токен в куки
      res.cookie('refreshToken', userData.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000})

      // Отправляем данные клиенту
      return res.json(userData)
    } catch (e) {
      next(e)
    }
  }


  async logout(req, res, next) {
    try {
      // Достаем refreshToken из куки
      const {refreshToken} = req.cookies

      // Выполняем выход
      const token = await userService.logout(refreshToken)

      // Удаляем куки
      res.clearCookie('refreshToken')

      return res.json(token)

    } catch (e) {
      next(e)
    }
  }


  async activation(req, res, next) {
    try {
      // Получаем ссылку активации
      const activationLink = req.params.link


      // Активируем пользователя
      await userService.activate(activationLink)

      //Редирект на главную страницу
      return res.redirect(process.env.CLIENT_URL)
    } catch (e) {
      next(e)
    }
  }



  async refresh(req, res, next) {
    try {
      // Достаем refreshToken из куки
      const {refreshToken} = req.cookies


      console.dir(`REFRESH - ${refreshToken}`);

      // Обновляем токен
      const userData = await userService.refresh(refreshToken)

      // Сохраняем refresh токен в куки
      res.cookie('refreshToken', userData.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true})

      // Отправляем данные клиенту
      return res.json(userData)
    } catch (e) {
      next(e)
    }
  }




    async getUsers(req, res, next) {
      try {
        // Получаем всех пользователей
        const users = await userService.getAllUsers()

        // Отправляем их на клиент
        return res.json(users)
      } catch (e) {
        next(e)
      }
    }

}

module.exports = new UserController() // Передаем уже экземпляр класса, т.е. объект
