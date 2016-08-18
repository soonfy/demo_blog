var mongoose = require('mongoose')
var Schema = mongoose.Schema
var ObjectId = Schema.Types.ObjectId

var SchemaPost = new Schema({
  name: String,
  title: String,
  content: String,
  createdAt: Date,
  date: String,
  comments: {
    type: Array,
    default: []
  },
  tags: {
    type: Array,
    default: []
  },
  pageviewer: {
    type: Number,
    default: 1
  }
})

module.exports = mongoose.model('post', SchemaPost)
