// Маршрутизация

const {Router} = require('express') // Получаем Router из express с помощью декомпозиции

const userController = require('../controllers/user-controller') // Импортируем контроллеры для маршрутов

const {body} = require('express-validator') // Импортируем функцию для валидации тела запроса

const authMiddleware = require('../middlewares/auth-middleware') // Импортируем authMiddleware

const router = new Router() // Создаем экземпляр класса Router

router.post('/registration',
    body('email').isEmail(), // Валидация email
    body('password').isLength({min: 3, max: 32}), // Валидация пароля
    userController.registration) // Эндпойнт регистрации

router.post('/login', userController.login) // Эндпойнт входа
router.post('/logout', userController.logout) // Эндпойнт выхода
router.get('/activate/:link', userController.activation) // Эндпойнт отправки ссылки на почту (Двоеточие указывает на динамический параметр)
router.get('/refresh', userController.refresh) // Эндпойнт для получения refresh-токена
router.get('/users',
  authMiddleware, // Передаем authMiddleware в маршрут
  userController.getUsers) // Эндпойнт для тестов


module.exports = router  // Экспортируем объект router
