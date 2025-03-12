const express = require('express');
const Router = express.Router();
//constroller
const { create, list, remove, listby, searchFilters, update, read, cteateImages, removeImage } = require('../controllers/product');
const {authCheck, adminCheck} = require('../middleware/authcheck');
// @ENDPOINT http://localhost:5000/api/product

Router.post('/product', create);  // ใช้ POST สำหรับการสร้างข้อมูล
Router.get('/products/:count', list);  // ใช้ GET สำหรับดึงข้อมูล
Router.delete('/product/:id', remove);  // ใช้ DELETE สำหรับลบข้อมูล 
Router.post('/productby', listby);  // ใช้ GET ถ้าต้องการดึงข้อมูล
Router.post('/product/filters', searchFilters);  // ใช้ POST ถ้าต้องการกรองข้อมูล
Router.put('/product/:id', update); // ใช้ PUT update ข้อมูล
Router.get('/product/:id', read);  // ใช้ GET อ่านข้อมูลบางตัว

Router.post('/images',authCheck, adminCheck, cteateImages);
Router.post('/removeimages',authCheck, adminCheck, removeImage);


module.exports = Router;