const prisma = require('../config/prisma')

exports.create = async (req, res) => {
    try {
        const { name } = req.body
        
        // ตรวจสอบว่าชื่อ category ซ้ำในฐานข้อมูลหรือไม่
        const existingCategory = await prisma.category.findFirst({
            where: {
                name: name
            }
        })

        if (existingCategory) {
            return res.status(400).json({
                message: "มีแล้วสร้างมาทำไม"
            })
        }

        // ถ้าไม่ซ้ำก็ทำการสร้าง category ใหม่
        const category = await prisma.category.create({
            data: {
                name: name
            }
        })

        res.send(category)
    } catch (err) {
        console.log(err)
        res.status(500).json({
            message: "Server error in create"
        })
    }
}


exports.list = async(req, res) => {
    try {
        const category = await prisma.category.findMany()
        res.send(category)
    }catch(err) {
        console.log(err)
        res.status(500).json({
            message: "server error in list"
        })
    }
}

exports.remove = async(req, res) => {
    try {
        const { id } = req.params
        const category = await prisma.category.delete({
            where: {
                id: Number(id)
            }
        })
        console.log(category)
        res.send('Page Remove in controllers')
    }catch(err) {
        console.log(err)
        res.status(500).json({
            message: "server error in Remove"
        })
    }
}
