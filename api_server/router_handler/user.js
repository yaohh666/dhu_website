/**
 * 在这里定义和用户相关的路由处理函数，供 /router/user.js 模块进行调用
 */

// 导入数据库操作模块
const db = require('../db/index')
// 导入bcrypt这个包
const bcrypt = require('bcryptjs')
// 用这个包来生成 Token 字符串
const jwt = require('jsonwebtoken')
// 导入配置文件
const config = require('../config')


// 注册用户的处理函数
exports.regUser = (req, res) => {
    console.log(req.body);
    // 获取客户端提交到服务器的用户信息
    const userinfo = req.body
    // 对表单中的数据进行合法性校验
    if(!userinfo.username || !userinfo.password) {
        return res.send({status: 1, message: '用户名和密码不合法！'})
    }

    // 定义sql语句，查询用户名是否被占用
    const sqlStr = 'select * from ev_users where username=?'
    db.query(sqlStr, userinfo.username, (err, results) => {
        // 执行sql语句失败
        if(err) {
            return res.send({status: 1,message: err.message})
        }
        // 判断用户名是否被占用
        if(results.length > 0) {
            return res.send({status: 1, message: '用户名被占用，请更换其他用户名！'})
        } else {
          // 调用 bcrypt.hashSync 对密码进行加密
          userinfo.password = bcrypt.hashSync(userinfo.password, 10)

          // 定义插入新用户sql语句
          const sql = 'insert into ev_users set ?'
          // 调用db.query执行sql语句
          db.query(sql,{username: userinfo.username, password: userinfo.password}, (err, results) => {
            if(err) return res.send({status: 1,message: err.message})
            if(results.affectedRows !== 1) return res.send({status: 1,message: '注册用户失败，请稍后再试！'})
            res.send({status: 0,message: '注册成功！'})
          })
        }
    })
  }
  
// 登录的处理函数
exports.login = (req, res) => {
    const userinfo = req.body
    const sql = 'select * from ev_users where username=?'

    db.query(sql, userinfo.username, function (err, results) {
      console.log(results);
      // 执行sql语句失败
      if(err) return res.cc(err)
      // 执行 sql 语句成功，但是查询到数据条数不等于 1
      if(results.length !== 1) return res.cc('登陆失败！')

      // 拿着用户输入的密码,和数据库中存储的密码进行对比
      const compareResult = bcrypt.compareSync(userinfo.password, results[0].password)
      // 如果对比的结果等于 false, 则证明用户输入的密码错误
      if (!compareResult && !(userinfo.password == results[0].password)) {
        return res.cc('登录失败！')
      }
      // TODO：登录成功，生成 Token 字符串
      // 剔除完毕之后，user 中只保留了用户的 id, username, nickname, email 这四个属性的值
      const user = { ...results[0], password: '', user_pic: '' }
      // 生成 Token 字符串
      const tokenStr = jwt.sign(user, config.jwtSecretKey, {
        expiresIn: '10h', // token 有效期为 10 个小时
      })
      res.send({
        status: 0,
        message: '登录成功！',
        username: userinfo.username,
        // 为了方便客户端使用 Token，在服务器端直接拼接上 Bearer 的前缀
        token: 'Bearer ' + tokenStr,
      })
    })
}