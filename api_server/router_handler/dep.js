/**
 * 在这里定义和用户相关的路由处理函数，供 /router/user.js 模块进行调用
 */

// 导入数据库操作模块
const db = require('../db/index')

// 注册用户的处理函数
exports.getDep = (req, res) => {
    // 定义sql语句，查询学院信息
    const sqlStr = 'select * from dep_info'
    db.query(sqlStr, (err, results) => {
        // 1. 执行 SQL 语句失败
        if (err) return res.cc(err)
        
        // 2. 执行 SQL 语句成功
        res.send({
          status: 0,
          message: '获取文章分类列表成功！',
          data: results,
        })
    })
  }