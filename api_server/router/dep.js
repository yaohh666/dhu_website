const express = require('express')
const router = express.Router()

// 导入学院信息处理函数模块
const depHandler = require('../router_handler/dep')

// 获取学院基本信息
router.get('/getDep', depHandler.getDep)

module.exports = router