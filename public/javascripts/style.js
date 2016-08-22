var node_name = document.getElementById('name')
var node_pass = document.getElementById('pass')
var node_pass_repeat = document.getElementById('pass_repeat')
var node_email = document.getElementById('email')
var node_register = document.getElementsByClassName('register')[0]

var bool_name = false,
  bool_pass = false,
  bool_email = false

node_name.addEventListener('blur', function () {
  var name = this.value.replace(/(^\s*)|(\s*$)/g, '')
  if(name.indexOf('\s') === -1 && name.length > 0){
    bool_name = true
  }
  if(name.length === 0){
    this.nextElementSibling.innerHTML = '用户名不能为空。'
  }
  if(name.indexOf('\s') > -1){
    this.nextElementSibling.innerHTML = '用户名不能包含空字符。'
  }
}, false)
node_name.addEventListener('blur', function () {
  if(bool_name && bool_pass && bool_email){
    node_register.style.disabled = false
  }
}, false)

node_pass.addEventListener('blur', function () {
  var pass = this.value.replace(/(^\s*)|(\s*$)/g, '')
  if(pass.length === 0){
    this.nextElementSibling.innerHTML = '密码不能为空。'
  }
}, false)

node_pass_repeat.addEventListener('blur', function () {
  var pass_repeat = this.value.replace(/(^\s*)|(\s*$)/g, '')
  var pass = node_pass.value.replace(/(^\s*)|(\s*$)/g, '')
  if(pass === pass_repeat && pass.length > 0){
    bool_pass = true
  }else{
    this.nextElementSibling.innerHTML = '两次密码不相同。'
  }
}, false)

node_email.addEventListener('blur', function () {
  var email = this.value.replace(/(^\s*)|(\s*$)/g, '')
  if(email.length === 0){
    this.nextElementSibling.innerHTML = '邮箱不能为空。'
  }
}, false)


