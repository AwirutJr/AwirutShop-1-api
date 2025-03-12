//step 1 import
const express = require("express");
const app = express()
const morgan = require("morgan")
const { readdirSync } = require("fs")
const cors = require("cors")

// const authRoute = require('./routes/auth')
// const categoryRoute = require('./routes/category')

//middleware
app.use(morgan('dev')) //เช็คสถานโค้ด
app.use(express.json({limit:'20mb'})) //แปลงไฟล์เป็น json
app.use(cors()) //มองหาไฟล์ทั้งหมดได้

readdirSync('./routes').map((item)=> app.use('/api', require('./routes/' + item)))

//Step 2 start server
app.listen(5000,()=> console.log('server is running port 5000'))
