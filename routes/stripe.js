const express = require('express')
const { authCheck } = require('../middleware/authcheck')
const Router = express.Router()

// import controller
const {payment} = require('../controllers/stripe')

Router.post('/user/create-checkout-session', authCheck,payment)

module.exports = Router
