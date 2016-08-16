var mongoose = require('mongoose')
var Schema = mongoose.Schema
var ObjectId = Schema.Types.ObjectId

var SchemaUser = new Schema({
  name: String,
  password: String,
  email: String
})

module.exports = mongoose.model('user', SchemaUser)
