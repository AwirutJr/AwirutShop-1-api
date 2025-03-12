const express = require('express')
const Router = express.Router()
const { create,list,remove } = require('../controllers/category')

const {authCheck, adminCheck} = require('../middleware/authcheck')

// @ENPOINT http://localhost:5000/api/category
Router.post('/category',authCheck,adminCheck, create)
Router.get('/category', list)
Router.delete('/category/:id',authCheck,adminCheck, remove)


module.exports = Router