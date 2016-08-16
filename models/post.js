var mongoose = require('mongoose')
var Schema = mongoose.Schema
var ObjectId = Schema.Types.ObjectId

var SchemaPost = new Schema({
  name: String,
  title: String,
  content: String,
  createdAt: Date,
  date: String
})

module.exports = mongoose.model('post', SchemaPost)