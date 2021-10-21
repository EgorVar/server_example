const UserModel = require('../models/user-model') // Импортируем модель пользователя
const bcrypt = require('bcrypt') // Импортируем bcrypt, для хэширования паролей
const uuid = require('uuid') // Генератор случайных строк
const mailService = require('./mail-service') // Импортируем mail-service
const tokenService = require('./token-service') // Импортируем token-service
const UserDto = require('../dtos/user-dto') // Импортируем класс UserDto
const ApiError = require('../exceptions/api-error') // Импортируем класс ApiError


class UserService {
  // НЕЗАБЫВАЕМ, ЧТО ВСЕ ФУНКЦИИ АСИНХРОННЫ, Т.К. РАБОТАЕМ С ЗАПРОСАМИ
  async registration(email, password) {
    const candidate = await UserModel.findOne({email}) // Ищем пользователя с email-ом, который передан в параметре

    // Если такой пользователь уже есть, выводим ошибку
    if(candidate) {
      throw ApiError.BadRequest(`Пользователь с почтовым адресом ${email} уже существует`)
    }


    // Хэшируем пароль, метод hash принимает 2 параметра: сам пароль и соль(степень хэширования)
    const hashPassword = await bcrypt.hash(password, 3)

    // Метод v4 возвращает уникальную строку
    const activationLink = uuid.v4()

    // Создаем нового пользователя
    const user = await UserModel.create({email, password: hashPassword, activationLink})

    // Отпраляем письмо на почту
    // 2 параметра: почта и ссылка на активацию
    await mailService.sendActivationMail(email, `${process.env.API_URL}/api/activate/${activationLink}`)

    // Создем payload
    const userDto = new UserDto(user) // id, email, isActivated

    // Генерируем токены
    const tokens = tokenService.generateToken({...userDto})

    // Сохраняем refresh токен в БД
    await tokenService.saveToken(userDto.id, tokens.refreshToken)

    // Возвращаем токены и информацию о пользователе
    return {
      ...tokens,
      user: userDto
    }
  }

  // Принимает ссылку для активации
  async activate(activationLink) {
    // Ищем пользователя с переданной ссылкой
    const user = await UserModel.findOne({activationLink})

    // Если пользователя нет, то выбрасываем ошибку
    if(!user) {
      throw ApiError.BadRequest('Неккоректная ссылка активации')
    }
    user.isActivated = true
    await user.save()
  }


  // Функция для входа
  async login(email, password) {
    // Ищем пользователя с переданным email
    const user = await UserModel.findOne({email})

    // Если пользовтаеля нет, то пробрасываем ошибку
    if(!user) {
      throw ApiError.BadRequest('Пользователь не был найден')
    }

    /*
      Метод compare сравнивает пароли.
      Принимает 2 параметра: {
        - Пароль переданный в параметр
        - Пароль из БД
      }
      На выходе мы получаем либо true, либо false
    */

    // Сравниваем пароли
    const isPassEquals = await bcrypt.compare(password, user.password)

    // Если пароли не равны, выбрасываем ошибку
    if(!isPassEquals) {
      throw ApiError.BadRequest('Неверный пароль')
    }

    // Создем payload
    const userDto = new UserDto(user)

    // Генерируем токены
    const tokens = await tokenService.generateToken({...userDto})

    // Сохраняем refresh токен в БД
    await tokenService.saveToken(userDto.id, tokens.refreshToken)

    // Возвращаем токены и информацию о пользователе
    return {
      ...tokens,
      user: userDto
    }
  }


  // Функция для выхода
  async logout(refreshToken) {
    // Удаляем токен
    const token = await tokenService.removeToken(refreshToken)

    return token
  }

  // Функция для обновления токена
  async refresh(refreshToken) {
    // Если токен пустой, выкидываем ошибку
    if(!refreshToken) {
      // UnauthorizedError, потому что такое может быть у неавторизованного пользователя
      throw ApiError.UnauthorizedError()
    }

    // Получаем payload из refresh токена
    const userData = tokenService.validateRefreshToken(refreshToken)

    // Ищем токен в БД
    const tokenFromDb = tokenService.findToken(refreshToken)

    // Убеждаемся, что валидация и поиск в БД прошли успешно
    if(!userData || !tokenFromDb) {
      // UnauthorizedError, потому что такое может быть у неавторизованного пользователя
      throw ApiError.UnauthorizedError()
    }

    // Ищем пользователя по id
    const user = await UserModel.findById(userData.id)

    // Создем payload
    const userDto = new UserDto(user)

    // Генерируем токены
    const tokens = await tokenService.generateToken({...userDto})

    // Сохраняем новый refresh токен в БД
    await tokenService.saveToken(userDto.id, tokens.refreshToken)

    // Возвращаем токены и информацию о пользователе
    return {
      ...tokens,
      user: userDto
    }

  }

  // Функция для получения всех пользователей
  async getAllUsers() {
    // Получаем все записи в БД
    const users = await UserModel.find()

    return users
  }
}

module.exports = new UserService() // Экспортируем экземпляр класса UserService
