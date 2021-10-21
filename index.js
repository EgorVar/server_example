/*

  Полная структура сервера - {

    - index.js - Корневой файл сервера;
    - router - Маршруты сервера;
    - controllers - Функционал для обработки маршрутов;
    - services - Разделение контроллеров на меньшие составляющие: {
      * Работа с пользователями
      * Работа с токенами
      * Работа с почтой
    }

  }


*/


require('dotenv').config() // Импортируем переменную окружения
const express = require('express') // Импортируем express
const cors = require('cors') // Импортируем cors (Для работы с запросами в браузере)
const cookieParser = require('cookie-parser') // Импортируем cookie-parser
const mongoose = require('mongoose') // Импортируем mongoose
const router = require('./router/index.js')  // Импортируем router
const errorMiddleware = require('./middlewares/error-middleware')  // Импортируем middleware для вывода ошибок


const PORT = process.env.PORT || 5000 // Используем 5000 порт





const app = express()  // Создаем экземпляр приложения

app.use(cors({'credentials': true, origin: 'http://localhost:3000'})) // Подключаем middleware cors()
app.use(cookieParser()) // Подключаем middleware cookieParser()
app.use(express.json()) // Подключаем middleware express.json()






/*
  Подключаем router в middleware, передаем 2 параметра - {
    Маршрут, по которому будут производиться запросы;
    router - уже готовые пути;
}
*/
app.use('/api', router)

// errorMiddleware ВСЕГДА СТАВИТСЯ В КОНЦЕ ВСЕЙ ЦЕПОЧКИ
app.use(errorMiddleware) // Подключаем middleware для вывода ошибок



const start = async () => {
  try {
    // Работа с БД всегда асинхронна, не забываем про async await

    // Подключаемся к БД
    await mongoose.connect(process.env.DB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })

    // Запускаем сервер
    app.listen(PORT, () => console.log(`Server started on port = ${PORT}`)) // Запуск приложения
  } catch(e) {
    console.log(e)
  }
}


start() // Вызываем функцию start
