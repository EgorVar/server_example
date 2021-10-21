// Модель refresh токена
const { Schema, model } = require('mongoose')


/*
  UserSchema содержит 4 поля: {
    - Идентификатор пользователя;
    - Refresh-токен
  }
*/

const TokenSchema = new Schema({
  user: {type: Schema.Types.ObjectId, ref: 'User'}, // Ссылаемся на сущность User
  refreshToken: {type: String, required: true}
})

// Schema.Types.ObjectId - ngb id пользователя

module.exports = model('Token', TokenSchema) // Экспортируем TokenSchema
