const prisma = require("../config/prisma");
const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUDS_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

// create product
exports.create = async (req, res) => {
    try {
        const { title, description, price, quantity, categoryId, images } = req.body //สร้างข้อมูล
        // console.log( title, description, price, quantity, categoryId, images ) 
        const existingProduct = await prisma.product.findFirst({
            where: {
                title: title,
            }
        })

        if (existingProduct) {
            return res.status(400).json({
                message: `มี ${existingProduct.title} แล้วจะสร้างมาทำไม`
            });
        }

        const product = await prisma.product.create({
            data: {
                title: title,
                description: description,
                price: parseFloat(price),
                quantity: parseInt(quantity),
                categoryId: parseInt(categoryId),
                images: {
                    create: images.map((item) => ({
                        asset_id: item.asset_id,
                        public_id: item.public_id,
                        url: item.url,
                        secure_url: item.secure_url
                    }))
                }
            }
        })

        res.send(product)
    } catch (err) {
        console.log(err)
        res.status(500).json({
            message: "server error in create product"
        })
    }
}
// list product
exports.list = async (req, res) => {
    try {
        const { count } = req.params
        const product = await prisma.product.findMany({
            take: parseInt(count),
            orderBy: { createdAt: "desc" },
            include: {
                category: true,
                images: true
            }
        }) //ค้นหาสินค้า
        res.send(product)
    } catch (err) {
        console.log(err)
        res.status(500).json({
            message: "server error in list product"
        })
    }
}

exports.read = async (req, res) => {
    try {
        const { id } = req.params
        const product = await prisma.product.findFirst({
            where: {
                id: Number(id)
            },
            include: {
                category: true,
                images: true
            }
        }) //ค้นหาสินค้า
        res.send(product)
    } catch (err) {
        console.log(err)
        res.status(500).json({
            message: "server error in list product"
        })
    }
}

exports.update = async (req, res) => {
    try {
        const { title, description, price, quantity, categoryId, images } = req.body //สร้างข้อมูล
        // console.log( title, description, price, quantity, categoryId, images ) 

        //clear images
        await prisma.image.deleteMany({
            where: {
                productId: Number(req.params.id)
            }
        })



        const product = await prisma.product.update({
            where: {
                id: Number(req.params.id)
            },
            data: {
                title: title,
                description: description,
                price: parseFloat(price),
                quantity: parseInt(quantity),
                categoryId: parseInt(categoryId),
                images: {
                    create: images.map((item) => ({
                        asset_id: item.asset_id,
                        public_id: item.public_id,
                        url: item.url,
                        secure_url: item.secure_url
                    }))
                }
            }
        })

        res.send({
            message: "update product success",
            data: product
        })
    } catch (err) {
        console.log(err)
        res.status(500).json({
            message: "server error in create product"
        })
    }
}

exports.remove = async (req, res) => {
    try {
        //code
        const { id } = req.params
        //ค้นหาสินค้า include image


        const product = await prisma.product.findFirst({
            where: {
                id: Number(id)
            },
            include: {
                images: true
            }
        })

        if (!product) {
            return res.status(400).json({
                message: "image not found!!!"
            })
        }

        console.log(product)
        //Promise ลบแบบ รอจนว่า loop จะทำงานเสร็จ
        const deleteImage = product.images.map((image) =>
            new Promise((resolve, reject) => {
                // delete in cloundinary
                cloudinary.uploader.destroy(image.public_id, (error, result) => {
                    if (error) reject(error)
                    else resolve(result)



                })
            })
        )
        await Promise.all(deleteImage)

        await prisma.product.delete({
            where: { id: Number(id) }
        })
        res.send("remove product success")
    } catch (err) {
        console.log(err)
        res.status(500).json({
            message: "server error in remove product"
        })
    }
}

exports.listby = async (req, res) => {
    try {
        //code
        const { sort, order, limit } = req.body
        // console.log(sort, order, limit)
        const product = await prisma.product.findMany({
            take: limit,
            orderBy: { [sort]: order },
            include: { 
                category: true ,
                images: true
            }
        })



        res.send(product)
    } catch (err) {
        console.log(err)
        res.status(500).json({
            message: "server error in listby product"
        })
    }
}
//ค้นหาข้อมูล
const headleQuery = async (req, res, query) => {
    try {
        //code
        const product = await prisma.product.findMany({
            where: {
                title: {
                    contains: query,
                }
            },
            include: {
                category: true,
                images: true
            }
        })




        res.send(product)
    } catch (err) {
        console.log(err)
        res.status(500).send("server error in headleQuery product")
    }
}
const headlePrice = async (req, res, priceRange) => {
    try {
        const product = await prisma.product.findMany({
            where: {
                price: {
                    gte: priceRange[0],  // ราคามากกว่าหรือเท่ากับ price[0]
                    // lte: price[1]   // ราคาน้อยกว่าหรือเท่ากับ price[1]
                }
            },
            include: {
                category: true,
                images: true
            }
        })
        res.send(product)
    } catch (err) {
        console.log(err)
        res.status(500).send("Server error in handlePrice product")
    }
}
const headleCategory = async (req, res, category) => {
    try {
        const product = await prisma.product.findMany({
            where: {
                categoryId: {
                    in: category.map((id) => Number(id))
                }
            },
            include: {
                category: true,
                images: true
            }
        })
        res.send(product)
    } catch (err) {
        console.log(err)
        res.status(500).send("Server error in handlePrice product")
    }
}
exports.searchFilters = async (req, res) => {
    try {
      const { query, category, price } = req.body;
  
      // ตรวจสอบว่า query, category หรือ price ถูกส่งมาหรือไม่
      if (query) {
        console.log("query-->", query);
        await headleQuery(req, res, query);
      }
      if (price) {
        console.log("price-->", price);
        await headlePrice(req, res, price);
      }
      if (category) {
        console.log("category-->", category);
        await headleCategory(req, res, category);
      }
  
      // ถ้าไม่มีค่าที่ส่งมาทั้ง query, category, price
      if (!query && !category && !price) {
        return res.status(400).json({ message: "Missing required search parameters." });
      }
  
    } catch (err) {
      console.log(err);
      res.status(500).json({
        message: "Server error in searchFilters product"
      });
    }
  }
  

exports.cteateImages = async (req, res) => {
    try {

        // console.log(req.body)    
        const result = await cloudinary.uploader.upload(req.body.image, {
            public_id: `${Date.now()}`,
            resource_type: 'auto',
            folder: 'Awirut-Shop'
        })
        res.send(result)
    } catch (err) {
        console.log(err)
        res.status(500).json({
            message: "server error in createImage product"
        })
    }
}
exports.removeImage = async (req, res) => {
    try {
        //code
        const { public_id } = req.body

        cloudinary.uploader.destroy(public_id, (result) => {
            res.send('remove image success!!!')
        })

    } catch (err) {
        console.log(err)
        res.status(500).json({
            message: "server error in remove product"
        })
    }
} 