const prisma = require('../config/prisma')


exports.listUsers = async (req, res) => {
    try {
        //code
        const usesr = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                role: true,
                enabled: true,
                address: true
            }
        })


        res.json(usesr)
    } catch (err) {
        console.log(err)
        res.status(500).json({
            message: "Token Invalid"
        })
    }
}

exports.changeStatus = async (req, res) => {
    try {
        const { id, enabled } = req.body
        const user = await prisma.user.update({
            where: { id: Number(id) },
            data: { enabled: enabled }
        })
        res.json({ message: 'Update Satus success' })
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: "Server error in changeStatus"
        });
    }
}

exports.changeRole = async (req, res) => {
    try {
        //code
        const { id, role } = req.body
        const user = await prisma.user.update({
            where: { id: Number(id) },
            data: { role: role }
        })
        res.json({ message: 'Update Role success' })
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: "Server error in changeStatus"
        });
    }
}

exports.UserCart = async (req, res) => {
    try {
        const { cart } = req.body
        // console.log(cart)
        // console.log(req.user.id, req.user.email)
        const user = await prisma.user.findFirst({
            where: { id: Number(req.user.id) }
        })
        // console.log(user)

        //check empty
        for (const item of cart) {
            const product = await prisma.product.findUnique({
                where: { id: item.id },
                select: { quantity: true, title: true },
            });

            if (!product || item.count > product.quantity) {
                return res.status(400).json({ ok: false, message: `ขออภัยสินค้า ${product?.title || 'product'} หมดแล้ว` });
            }
        }

        // Delete old cart item
        await prisma.productOnCart.deleteMany({
            where: {
                Cart: {
                    userId: user.id
                }
            }
        })
        //delete old cart
        await prisma.cart.deleteMany({
            where: { userId: user.id }
        })
        // เตรียมสินค้า
        let products = cart.map((item) => ({
            productId: item.id,
            count: item.count,
            price: item.price
        }))
        console.log(products)

        // หาผลรวม การทำงาน reduce (sum = ค่าผลรวม ถ้ามี 2 item ก็ + 2 item, item = ค่าที่ดึงมาจาก products) 0 ที่ต่อท้ายคือค่าเริ่มต้น
        let cartTotal = products.reduce((sum, item) => sum + item.price * item.count, 0)
        console.log(cartTotal)

        // New cart
        const newCart = await prisma.cart.create({
            data: {
                products: {
                    create: products
                },
                cartTotal: cartTotal,
                userId: user.id
            }
        })

        console.log(newCart)
        res.send('Add cart ok');
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: "Server error in Usercart"
        });
    }
};


exports.getUserCart = async (req, res) => {
    try {
        const cart = await prisma.cart.findFirst({
            where: {
                userId: Number(req.user.id)
            },
            include: {
                products: {
                    include: {
                        Product: true
                    }
                }
            }
        })
        console.log(cart)

        res.json({
            product: cart.products,
            cartToltal: cart.cartTotal
        })

    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: "Server error in userCart"
        });
    }
}

exports.emptyCart = async (req, res) => {
    try {
        //code
        const cart = await prisma.cart.findFirst({
            where: {
                userId: Number(req.user.id)
            }
        })

        if (!cart) {
            return res.status(400).json({ message: 'No cart' })
        }

        await prisma.productOnCart.deleteMany({
            where: {
                cartId: cart.id
            }
        })
        const result = await prisma.cart.deleteMany({
            where: {
                userId: Number(req.user.id)
            }
        })
        console.log(result)

        res.json({
            message: 'Cart empty',
            deleted: result.count
        })
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: "Server error in changeStatus"
        });
    }
}

exports.saveAddress = async (req, res) => {
    try {
        //code
        const { address } = req.body
        const addressUser = await prisma.user.update({
            where: {
                id: Number(req.user.id)
            },
            data: {
                address: address
            }
        })
        console.log(addressUser)

        res.json({ Ok: true, message: 'update address success!!!' })
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: "Server error in changeStatus"
        });
    }
}

exports.saveOrder = async (req, res) => {
    try {
        //เพิ่มการจ่ายเงิก่อน save เข้า db
        // console.log(req.body)
        // return res.send('hello Awirut!!!')

        const { id, amount, status, currency } = req.body.paymentIntent

        // ดึงสินค้ามา
        const userCart = await prisma.cart.findFirst({
            where: {
                userId: Number(req.user.id)
            },
            include: {
                products: true
            }
        })

        const amountTHB = Number(amount) / 100

        const order = await prisma.order.create({
            data: {
                products: {
                    create: userCart.products.map((item) => ({
                        productId: item.productId,
                        count: item.count,
                        price: item.price
                    }))
                },
                user: {
                    connect: { id: req.user.id }
                },
                cartTotal: userCart.cartTotal,
                stripPaymentId: id,
                amount: amountTHB,
                status: status,
                currency: currency,
            }
        })
        // console.log(order)
        // update product
        const updateProduct = userCart.products.map((item) => ({
            where: { id: item.productId },
            data: {
                quantity: { decrement: item.count }, //ลดจำนวนที่มีอยู่ จากการสั่งซื้อ decrement
                sold: { increment: item.count } // เพิ่มจำนวนสินค้าที่ขายได้ increment
            }
        }))
        console.log(updateProduct)

        //รอข้อมุลทั้งหมดก่อนค่อยทำงาน 
        //อัพเดทข้อมุลที่เราเตรียมไว้
        await Promise.all(
            updateProduct.map((updated) => prisma.product.update(updated))
        )
        // ลบจำนวนสินค้าออกจาก ตะกล้า
        await prisma.cart.deleteMany({
            where: { userId: req.user.id }
        })

        res.json({ ok: true, order })
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: "Server error in changeStatus"
        });
    }
}

exports.getOrder = async (req, res) => {
    try {
        const order = await prisma.order.findMany({
            where: { userId: Number(req.user.id) },
            include: {
                products: {
                    include: {
                        Product: true
                    }
                }
            }
        })
        if (order.length === 0) {
            return res.status(400).json({ ok: false, message: 'No order' })
        }
        console.log(order)


        res.json({ ok: true, order })
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: "Server error in changeStatus"
        });
    }
}