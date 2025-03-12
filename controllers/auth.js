const prisma = require('../config/prisma')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { token } = require('morgan')

exports.register = async(req, res) => {
    //code 
    try {
        const {email, password} = req.body
        console.log(email, password)

        const existingUser = await prisma.user.findUnique({
            where: {
                email: email
            }
        })
        
        if (existingUser) {
            return res.status(400).json({
                message: "This email is already registered" 
            })
        }
        

        if(!email){
            return res.status(404).json({
                message: "email is required"
            })
        }

        if(!password) {
            return res.status(404).json({
                message: "password is required"
            })
        }
        //step 2 check Email in DB already ?
        const user = await prisma.user.findFirst({
            where: {
                email: email
            }
        })
        if(user) {
            return res.status(400).json({
                message: "email already exist!!!"
            })
        }
        //step 3 Hash password
        const Hashpassword = await bcrypt.hash(password, 10)
        console.log(Hashpassword)

        //step 4 register
        await prisma.user.create({
            data: {
                email: email,
                password: Hashpassword
            }
        })

        res.send('Page register in controllers')
    }catch(err) {
        console.log(err)
        res.status(500).json({
            message: "server error"
        })
    }
}

exports.login = async(req, res ) => {
    try {
        const {email, password} = req.body
        console.log(email, password)

        //step 1 check email
        const user = await prisma.user.findFirst( {
            where: {
                email: email
            }
        })
        if(!user || !user.enabled) {
            return res.status(400).json({
                message: "User found or not Enabled"
            })
        }
        //step 2 check password
        const isMatch = await bcrypt.compare(password, user.password)
        if(!isMatch) {
            return res.status(400).json({
                message: "Password is incorrect!!!"
            })
        }
        //step 3 Create Payload
        const payload = {
            id: user.id,
            email: user.email,
            role: user.role
        }
        //step 4 Generate Token 
        jwt.sign(payload,process.env.SECRET,{ expiresIn:'30d'}, (err,token) => {
            if(err){
                return res.status(500).json({
                    message: "server error in token"
                })
            } 
            res.json({ payload, token})
        })
        
        console.log(payload)
    }catch(err) {
        console.log(err)
        res.status(500).json({
            message: "server error"
        })
    }
}

exports.currentUser = async(req, res) => {
    try {
        //code
        const user = await prisma.user.findFirst({
            where: { email: req.user.email },
            select: {
                id: true,
                email: true,
                name: true,
                role: true
            }
        })
        res.json({ user })
    }catch(err) {
        console.log(err)
        res.statyt(500).json({
            message: "server error in curentUser"
        })
    }
}
  