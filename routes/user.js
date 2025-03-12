const express = require('express')
const Router = express.Router()
const { authCheck,adminCheck} = require('../middleware/authcheck')
const { listUsers,
        changeStatus,
        changeRole,
        UserCart,
        getUserCart,
        emptyCart,
        saveAddress,
        saveOrder,
        getOrder
 } = require('../controllers/user')


Router.get('/users',authCheck,adminCheck, listUsers)
Router.post('/change-status',authCheck,adminCheck, changeStatus)
Router.post('/change-role',authCheck,adminCheck, changeRole)


Router.post('/user/cart',authCheck, UserCart)
Router.get('/user/cart',authCheck, getUserCart)
Router.delete('/user/cart',authCheck, emptyCart)

Router.post('/user/address',authCheck, saveAddress)
Router.post('/user/order',authCheck, saveOrder)
Router.get('/user/order',authCheck, getOrder)






module.exports = Router