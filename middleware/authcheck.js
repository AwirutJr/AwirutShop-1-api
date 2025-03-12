// authcheck.js (middleware)
const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma')

exports.authCheck = async (req, res, next) => { 
    try {
        //code
        const headerToken = req.headers.authorization;
        if (!headerToken) {
            return res.status(401).json({
                message: "No Token, Authorization"
            });
        }
        
        // เลือกแค่ token ที่ต้องการ
        const token = headerToken.split(" ")[1];
        
        // แปลง jwt
        const decode = jwt.verify(token, process.env.SECRET);
        req.user = decode; // ตั้งค่า req.user ที่นี่

        const user = await prisma.user.findFirst({
            where: {email: req.user.email}
        })

        if(!user.enabled) {
            return res.status(400).json({message: "this account cannot"})
        }

        // console.log('Hello middleware');
        next(); // ข้ามไปยัง middleware ถัดไป
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: "Server error in authCheck"
        });
    }
}; // เสร็จแล้ว

// adminCheck middleware 
exports.adminCheck = async (req, res, next) => {
    try {
        const { email } = req.user;
        const adimUser = await prisma.user.findFirst({
            where: {email: email }
        })
        if(!adimUser || adimUser.role !== 'admin') {
            return res.status(403).json({
                message: "Acess Denied: Admin Only"
            })
        }
        // console.log("admin check", email);
        next(); // ข้ามไปยัง controller ถัดไป
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: "Server error in adminCheck"
        });
    }
}; // เสร็จแล้ว
