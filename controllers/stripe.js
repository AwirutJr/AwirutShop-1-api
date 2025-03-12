const prisma = require('../config/prisma')
// This is your test secret API key.
const stripe = require("stripe")('sk_test_51QsHjyCkGoJKYmi2XWnWMFH7jV7y3CWidBzcwYJ3eRDhXTVL9SUSWLZ3y3aBH5U0btgGcjga8Gp2f3wS6Wwo6xpk00WWTAzvSj');

exports.payment = async (req, res) => {
    try {
        //code
        //check user
        const cart = await prisma.cart.findFirst({
            where: {
                userId: req.user.id
            }
        })

        const amountTHB = cart.cartTotal * 100


        // Create a PaymentIntent with the order amount and currency
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amountTHB,
            currency: "thb",
            // In the latest version of the API, specifying the `automatic_payment_methods` parameter is optional because Stripe enables its functionality by default.
            automatic_payment_methods: {
                enabled: true,
            },
        });

        res.send({
            clientSecret: paymentIntent.client_secret,
          });

        // res.send('hello payment')
    } catch (err) {
        console.log(err)
        res.status(500).json({
            message: "Token Invalid"
        })
    }
}