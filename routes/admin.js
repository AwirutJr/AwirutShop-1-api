const express = require('express')
const { authCheck } = require('../middleware/authcheck')
const Router = express.Router()

// import controller
const { changeOrderStatus, getOrderAdmin } = require('../controllers/admin')

Router.put('/admin/change-order-status', authCheck, changeOrderStatus)
Router.get('/admin/orders', authCheck, getOrderAdmin)

module.exports = Router
