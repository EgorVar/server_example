const { Schema, model } = require('mongoose') // Получаем Schema и model из mongoose с помощью декомпозиции

 // Создаем экземпляр класса Schema и описываем сущность
const UserSchema = new Schema({
  email: {type: String, unique: true, required: true},
  password: {type: String, required: true},
  isActivated: {type: Boolean, default: false},
  activationLink: {type: String, required: true}
})
/*
  UserSchema содержит 4 поля: {
    - email;
    - пароль;
    - поле, для проверки активированного пользователя;
    - ссылка для активации;
  }
*/


/*
  - type - тип значения
  - unique - уникальность значения
  - required - обязательное значение
  - default - значение по умалчанию
*/

/*
  Функция model принимает 2 аргумента: название схемы и саму схему
*/

module.exports = model('User', UserSchema) // Экспортируем UserSchema
