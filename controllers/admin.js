const prisma = require("../config/prisma")

exports.changeOrderStatus = async(req, res) => {
    try{
        //code
        const { orderId, orderStatus } = req.body

        const orderUpdate = await prisma.order.update({
            where:{ id: orderId},
            data:{ orderStatus: orderStatus}
        })
        // console.log(orderUpdate)

        res.json(orderUpdate)
    } catch(err) {
        console.log(err);
        res.status(500).json({
            message: "Server error in changeOrderStatus"
        })
    }
}

exports.getOrderAdmin = async(req, res) => {
    try{
        //code
        const order = await prisma.order.findMany({
            include: {
                products:{
                    include:{
                        Product: true
                    }
                },
                user:{
                    select:{
                        id: true,
                        email: true,
                        address: true
                    }
                }
            }
        })

        res.json(order)
    } catch(err) {
        console.log(err);
        res.status(500).json({
            message: "Server error in getOrderAdmin"
        })
    }
}