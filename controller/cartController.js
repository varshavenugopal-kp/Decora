const user = require('../model/userSchema')
var bcrypt = require('bcrypt')
const { set, response } = require('../app');
const cart = require('../model/cartSchema')
const products = require('../model/productScema')
const orders = require('../model/orderschema')
const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;
const uuid = require('uuid');
const { placeOrder } = require('../helpers/userhelpers');
const Razorpay = require('razorpay');
const crypto=require('crypto')
// const { count } = require('../model/userSchema');


var instance = new Razorpay({
  key_id: 'rzp_test_PviVA6VS2vFEaD',
  key_secret: 'SbgEWipyuED1RfJJhKj4ZI19',
})



function getTotalAmount(userId) {
  return new Promise(async (resolve, reject) => {
    let cartamt = await cart.aggregate([
      {
        $match: { user: ObjectId(userId) }
      }, {
        $unwind: '$products'
      },
      {
        $project: {
          item: '$products.item',
          quantity: '$products.quantity'
        }
      },
      {
        $lookup: {
          from: 'products',
          localField: 'item',
          foreignField: '_id',
          as: 'products'
        },

      },
      {
        $project: {
          item: 1, quantity: 1, products: { $arrayElemAt: ['$products', 0] }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: { $multiply: ['$quantity', '$products.price'] } }
        }
      }

    ]).toArray()
    console.log("hhhhh", cartamt);


    resolve(cartamt)

  })

}

function getCount(userId) {
  return new Promise(async (resolve, reject) => {
    var count;
    let carts = await cart.findOne({ user: ObjectId(userId) })

    if (carts) {

      count = carts.products.length
    }
    if (!count) {
      count = 0
    }
    resolve(count)

  })
}

function getCartProducts(userId, count) {
  console.log(userId);
  return new Promise(async (resolve, reject) => {
    let cartItems = await cart.aggregate([
      {
        $match: { user: ObjectId(userId) }
      }, {
        $unwind: '$products'
      },
      {
        $project: {
          item: '$products.item',
          quantity: '$products.quantity'
        }
      },
      {
        $lookup: {
          from: 'products',
          localField: 'item',
          foreignField: '_id',
          as: 'products'
        },

      },
      {
        $project: {
          item: 1, quantity: 1, products: { $arrayElemAt: ['$products', 0] }
        }
      }

    ]).toArray()
    //  console.log("jhsgduisfyu",cartItems);
    // console.log("cart==== ",cartItems[0]);
    console.log(count);
    if (count <= 0) {
      resolve()
    } else {
      resolve(cartItems)

    }
  })
}




module.exports = {
  addToCart: async (req, res) => {
    let proId = req.params.id;
    let userId = req.session.user._id;
    console.log(userId);
    let proObj = {
      item: ObjectId(proId),
      quantity: 1
    }
    let userCart = await cart.findOne({ user: ObjectId(userId) })
    console.log("kkkkkkk", userCart);
    if (userCart) {
      let proExist = userCart.products.findIndex(products => products.item == proId)
      console.log(proExist);
      if (proExist != -1) {
        cart.updateOne({ user: ObjectId(userId), 'products.item': ObjectId(proId) },
          {
            $inc: { 'products.$.quantity': 1 }
          }).then(() => {
            res.redirect('/cart');
          })
      } else {
        cart.updateOne({ user: ObjectId(userId) }, { $push: { products: proObj } }).then((response) => {
          res.redirect('/cart');
        })
      }


    } else {
      let cartObj = {
        user: ObjectId(userId),
        products: [proObj],
      }
      cart.insertOne(cartObj).then((response) => {
        res.redirect('/cart');
      })
    }
  },

  cartList: async (req, res) => {
    let user = req.session.user
    let userId = req.session.user._id
    count = await getCount(req.session.user._id)
    let total = await getTotalAmount(req.session.user._id)

    console.log(userId);

    let cartItems = await cart.aggregate([
      {
        $match: { user: ObjectId(userId) }
      }, {
        $unwind: '$products'
      },
      {
        $project: {
          item: '$products.item',
          quantity: '$products.quantity'
        }
      },
      {
        $lookup: {
          from: 'products',
          localField: 'item',
          foreignField: '_id',
          as: 'products'
        },

      },
      {
        $project: {
          item: 1, quantity: 1, products: { $arrayElemAt: ['$products', 0] }
        }
      }

    ]).toArray()
    console.log(cartItems);
    console.log(count);
    if (count <= 0) {
      count = 0
    } else {
      res.render('users/cart', { cartItems, user, count, total })

    }
    console.log("last" + products);



  },

  changeProductQuantity: async (req, res) => {
    let data = req.body
    let user = req.session.user

    let total = await getTotalAmount(req.session.user._id)
    //   userhelpers.changeQuantity(data).then(async(status)=>{
    //    console.log(status);

    //    let total=await userhelpers.getTotalAmount(req.session.user._id)
    //    status.total=total[0].total
    //    res.json(status)
    //  })
    data.count = parseInt(data.count)
    cart.updateOne({ _id: ObjectId(data.cart), 'products.item': ObjectId(data.products) },
      {
        $inc: { 'products.$.quantity': data.count }
      }
    )
    data.total = total[0].total
  },

  placeOrder: async(req, res) => {
   address=req.session.selectedAddress;
    let user = req.session.user
    let total =await getTotalAmount(req.session.user._id)
    console.log("nnn",total);
    res.render('users/checkout', { total, user: req.session.user._id,address })
  },



  orderSubmit: async (req, res) => {
    let order = req.body
    console.log("hello last",req.body);
    let userId = req.session.user._id
    let product = await getCartProducts(req.session.user._id)
    let total = await getTotalAmount(req.session.user._id)

    let status = order['payment'] === 'cod' ? 'placed' : 'pending'
   

    let orderObject = {
      deliveryDetails: {
        id:uuid.v4(),
        name: order.first_name + " " + order.last_name,
        email: order.email,
        address: order.address,
        country: order.country,
        state: order.state,
        city: order.city,
        zip: order.zipCode,
        phone: order.phone
      },
      userId: userId,
      paymentMethod: order['payment'],
      products: product,
      totalAmount: total,
      status: status,
      date: new Date()
    }
    let productCount = product.length;
    for (i = 0; i < productCount; i++) {
      qty = -(product[i].quantity)
      let productId = product[i].item

      products.updateOne({ _id: productId }, { $inc: { stock: qty } })

    }
    console.log("qqqq",order.save);
    if (order.save == 'true') {

      user.updateOne({ _id: ObjectId(userId) }, { $push: { address: orderObject.deliveryDetails } }).then((re) => {

      })
    }
    orders.insertOne(orderObject).then((response) => {
      cart.deleteOne({ user: ObjectId(userId) }).then((qq) => {
      let oId=response.insertedId
        if(status=='placed'){
          res.json({cod:true})
        } else {
          console.log(total);
          let totalAmt = total[0]?.total
          var options = {
            amount: totalAmt * 100,  // amount in the smallest currency unit
            currency: "INR",
            receipt: "" + oId
          };
          instance.orders.create(options, function (err, order) {
            if (err) {
              console.log(err);
            } else {
              console.log(order);
              res.json(order)
            }

          });

        }
    })
  })

  
},

verifyPayment:async(req,res)=>{
  let details=req.body
  orderId=details['order[receipt]']
let hmac=crypto.createHmac('sha256','SbgEWipyuED1RfJJhKj4ZI19')
hmac.update(details['payment[razorpay_order_id]']+'|'+details['payment[razorpay_payment_id]']);
hmac=hmac.digest('hex')
if(hmac==details['payment[razorpay_signature]']){
  orders.updateOne({_id:ObjectId(orderId)},
  {
    $set:{
      status:'placed'
    }
  })
console.log("gfhgfhjgkjh");
  res.json({status:true})
}else{
  res.json({status:false})

}
},

orderPlaced:(req,res)=>{
  res.render('users/successpage')
},
successPage:(req,res)=>{
res.redirect('/success-page')
}


}