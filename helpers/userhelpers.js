const user = require('../model/userSchema')
var bcrypt=require('bcrypt')
const { set, response } = require('../app');
const cart =  require('../model/cartSchema')
const products=require('../model/productScema')
const orders=require('../model/orderschema')
const mongoose=require('mongoose');
const {ObjectId} = mongoose.Types;


module.exports={
    insertUser:(userInfo)=>{
        console.log(userInfo);
    return new Promise(async(resolve, reject) => {
        var rmsg
        var nameRegex = /^([A-Za-z ]){5,25}$/gm;
        var pswdregx = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]){8,16}/gm
        var emailregx = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
        var phoneregx = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/
        const validatemail = await user.findOne({ email: userInfo.email })
        if (userInfo.name == '') {
          rmsg = "Name field is empty"
          resolve(rmsg)
        } else if(nameRegex.test(userInfo.name)!=true){
           rmsg ="Enter valid name"
           resolve(rmsg)
        }else if (userInfo.email == '') {
          rmsg = "Email field is empty"
          resolve(rmsg)
        } else if (validatemail) {
          rmsg = "Email already exist"
          resolve(rmsg)
        } else if (emailregx.test(userInfo.email) != true) {
          rmsg = "Invalid email"
          resolve(rmsg)
        } else if (userInfo.phone == '') {
          rmsg = "Phone number field is empty"
          resolve(rmsg)
        } else if (phoneregx.test(userInfo.phone) != true) {
          rmsg = "Invalid Phone number"
          resolve(rmsg)
        } else if (userInfo.password == '') {
          rmsg = "Password field is empty" 
          resolve(rmsg)
        } else if (pswdregx.test(userInfo.password) != true) {
          rmsg = "password should contain atleast 8 characters uppercase lowercase and number"
          resolve(rmsg)
        } else if ((userInfo.cpassword) != (userInfo.password)) {
          rmsg = "Password does not match"
          resolve(rmsg)
        } else {
          const userData={
            name:userInfo.name,
            email:userInfo.email,
            phone:userInfo.phone,
            password:userInfo.password,
            status:true,
          }
          userData.password=await bcrypt.hash(userData.password,10)
          await user.insertOne(userData).then((data) =>{
            console.log(data);
            resolve()
          })
        }
    
    })
    },

  userCheck: (userInfo) => {
    console.log(userInfo);
    var respons = {}
    return new Promise(async (resolve, reject) => {
      var users = await user.findOne({ email: userInfo.email })
      if (users) {
        if (users.status) {

          bcrypt.compare(userInfo.password, users.password).then((status) => {
            if (status) {
              console.log(status)
              respons.user = users
              respons.status = true
              resolve(respons)
            } else {
              respons.msg = "Invalid password"
              resolve(respons)
            }
          })

        } else {
          respons.msg = "Your account has been blocked"
          resolve(respons)
        }
      }
      else {
        respons.msg = "invalid email"
        resolve(respons)
      }
    })
  },

  addToCart:(proId,userId)=>{
    console.log(userId);
    let proObj={
      item:ObjectId(proId),
      quantity:1
    }
     return new Promise(async(resolve, reject) => {
      let userCart= await cart.findOne({user:ObjectId(userId)})
      console.log("kkkkkkk",userCart);
      if(userCart){
        let proExist=userCart.products.findIndex(products=>products.item==proId)
        console.log(proExist);
        if(proExist!=-1){
                cart.updateOne({user:ObjectId(userId),'products.item':ObjectId(proId)},
                {
                  $inc:{'products.$.quantity':1}
                }).then(()=>{
                  resolve() 
                })
        }else{
             cart.updateOne({user:ObjectId(userId)},{$push:{products:proObj}}).then((response)=>{
            resolve()
          })
        }
          
         
      }else{
        let cartObj={
          user:ObjectId(userId),
          products:[proObj],
        }
        cart.insertOne(cartObj).then((response)=>{
          resolve()
        })
      }
      
     })
  },

  getCartProducts:(userId,count)=>{
    console.log(userId);
    return new Promise(async(resolve, reject) => {
      let cartItems= await cart.aggregate([
        {
          $match:{user:ObjectId(userId)}
        },{
          $unwind:'$products'
        },
        {
          $project:{
            item:'$products.item',
            quantity:'$products.quantity'
          }
        },
        {
          $lookup:{
            from:'products',
            localField:'item',
            foreignField:'_id',
            as:'products'
          },
          
        },
        {
          $project:{
            item:1,quantity:1,products:{$arrayElemAt:['$products',0]}
          }
        }
       
      ]).toArray()
      //  console.log("jhsgduisfyu",cartItems);
      // console.log("cart==== ",cartItems[0]);
      console.log(count);
      if(count<=0){
        resolve()
      }else{
      resolve(cartItems)
    
   } })
  },

  getCount:(userId)=>{
  return new Promise(async(resolve, reject) => {
    var count;
    let carts=await cart.findOne({user:ObjectId(userId)})
    
    if(carts){

      count=carts.products.length
    }
    if(!count){
        count=0
    }
   resolve(count)
   
  })
},

changeProductQuantity:(details)=>{
 console.log("detailsssss"+details);
  details.count=parseInt(details.count)
 
  return new Promise((resolve, reject) => {
    cart.updateOne({_id:ObjectId(details.cart),'products.item':ObjectId(details.products)},
    {
      $inc:{'products.$.quantity':details.count}
    }
    ).then(()=>{
      resolve()
    })
  })
},
changeQuantity:(data)=>{
  console.log("help",data);
  data.count=parseInt(data.count)
  data.quantity=parseInt(data.quantity)
  return new Promise((resolve, reject) => {
    if(data.count==-1 && data.quantity==1){
      cart.updateOne({id:ObjectId(data.cart)},
      {
        $pull:{products:{item:ObjectId(data.products)}}
      }
      ).then((res)=>{
        resolve({removeProduct:true})
      })

    }else{
    cart.updateOne({_id:ObjectId(data.cart),'products.item':ObjectId(data.product)},
    {
      $inc:{'products.$.quantity':data.count}
    }).then((res)=>{
      resolve({status:true})
    })}
  })
  

},


getTotalAmount:(userId)=>{
  return new Promise(async(resolve, reject) => {
    let cartItems= await cart.aggregate([
      {
        $match:{user:ObjectId(userId)}
      },{
        $unwind:'$products'
      },
      {
        $project:{
          item:'$products.item',
          quantity:'$products.quantity'
        }
      },
      {
        $lookup:{
          from:'products',
          localField:'item',
          foreignField:'_id',
          as:'products'
        },
        
      },
      {
        $project:{
          item:1,quantity:1,products:{$arrayElemAt:['$products',0]}
        }
      },
      {
        $group:{
          _id:null,
          total:{$sum:{$multiply:['$quantity','$products.price']}}
        }
      }
     
    ]).toArray()
    console.log("hhhhh",cartItems);
    
    
    resolve(cartItems)
  
}) 
 
},


placeOrder:(order,product,total,userId)=>{
  console.log(userId);
return new Promise(async(resolve, reject) => {
  let status=order['payment']==='cod' ? 'placed' : 'pending'

let orderObject={
  deliveryDetails:{
    name:order.first_name+" "+order.last_name,
    email:order.email,
    address:order.address,
    country:order.country,
    state:order.state,
    city:order.city,
    zip:order.zipCode,
    phone:order.phone
  },
  userId:userId,
  paymentMethod:order['payment'],
  products:product,
  totalAmount:total,
  status:status,
  date:new Date()
}
let productCount=product.length;
for(i=0;i<productCount;i++){
  qty= -(product[i].quantity)
  let productId=product[i].item
  
   products.updateOne({_id:productId},{$inc:{stock:qty}})
  
}




// const validatemail = await user.findOne({ email: userInfo.email })

if(order.save=='true'){
  
  user.updateOne({_id:ObjectId(userId)},{$push:{address:orderObject.deliveryDetails}}).then((re)=>{
    
  })
}




orders.insertOne(orderObject).then((response)=>{
  cart.deleteOne({user:ObjectId(userId)}).then((qq)=>{
    resolve()
  })
})
})
},

discountAmount:()=>{
  
}



}
