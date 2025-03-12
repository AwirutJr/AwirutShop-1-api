//import
const express = require('express')
const Router = express.Router()
const { register,login,currentUser } = require('../controllers/auth')

//import middleware
const { authCheck, adminCheck} = require('../middleware/authcheck')

// @ENPOINT http://localhost:5000/api/register
Router.post('/register', register)
Router.post('/login', login )
Router.post('/current-user',authCheck, currentUser)
Router.post('/current-admin',authCheck,adminCheck, currentUser)


module.exports = Router