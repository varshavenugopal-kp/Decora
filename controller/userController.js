const user = require('../model/userSchema')
var bcrypt=require('bcrypt')
const { set, response } = require('../app');
const cart =  require('../model/cartSchema')
const products=require('../model/productScema')
const orders=require('../model/orderschema')
const mongoose=require('mongoose');
const {ObjectId} = mongoose.Types;
const uuid = require('uuid');
const { logger } = require('../model/userSchema');
const nodemailer=require('nodemailer')







module.exports={


  otpVerification : async(req,res)=>{
    let data = req.body;
    let response={}
        let checkuser = await user.findOne({email:data.email})
        if(checkuser){
          if(checkuser.status) {
            otpEmail = checkuser.email
            response.otp = OTP()
            let otp = response.otp
            let mailTransporter = nodemailer.createTransport({
                service : "gmail",
                auth : {
                    user:process.env.EMAIL_ADDRESS,
                    pass:process.env.EMAIL_PASSWORD
                }
            })
            
            let details = {
                from:process.env.EMAIL_ADDRESS,
                to:otpEmail, 
                subject:"Organico",
                text: otp+" is your Organico verification code. Do not share OTP with anyone "
            }
  
            mailTransporter.sendMail(details,(err)=>{
                if(err){
                    console.log(err);
                }else{
                    console.log("OTP Send Successfully ");
                }
            })
  
            function OTP(){
                OTP = Math.random()*1000000
                OTP = Math.floor(OTP)
                return OTP
            }
            response.user = checkuser
            response.status = true
            if(response.status){
              req.session.otp=response.otp;
              req.session.otpData=req.body;
              req.session.otpUser=response.user;
              res.redirect('/otp-login')
            }
            
            // resolve(response) 
          }
          else{
            req.session.otpErr="Entered email is blocked!";
            res.redirect('/otp-login');
            req.session.otpErr = null;
          }
        }else{
          req.session.otpErr="Email not registered!";
          res.redirect('/otp-login');
          req.session.otpErr = null; 
        }
  
   },
   otpLogin : async(req,res)=>{
    otp=req.session.otp
    userOtp=req.body.otp
    var user=req.session.otpUser
    if(otp==userOtp){
      req.session.user=user
      req.session.otp=null
      res.redirect('/')   
    }else{
      req.session.InvalidOtp="Invalid Otp"
      res.redirect('/otp-login')
    }
   },






    userSignup:(req,res)=>{
        var err=req.session.rmsg
        res.render('users/user-signup',{err})
        req.session.msg=null
    },

    insertUser:async(req,res)=>{
        let userInfo=req.body
        var rmsg
        var nameRegex = /^([A-Za-z ]){5,25}$/gm;
        var pswdregx = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]){8,16}/gm
        var emailregx = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
        var phoneregx = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/
        const validatemail = await user.findOne({ email: userInfo.email })
        if (userInfo.name == '') {
          req.session.rmsg = "Name field is empty"
          res.redirect('/user-signup')
        } else if(nameRegex.test(userInfo.name)!=true){
        req.session.rmsg ="Enter valid name"
           res.redirect('/user-signup')
        }else if (userInfo.email == '') {
        req.session.rmsg = "Email field is empty"
          res.redirect('/user-signup')
        } else if (validatemail) {
        req.session.rmsg = "Email already exist"
          res.redirect('/user-signup')
        } else if (emailregx.test(userInfo.email) != true) {
        req.session.rmsg = "Invalid email"
          res.redirect('/user-signup')
        } else if (userInfo.phone == '') {
        req.session.rmsg = "Phone number field is empty"
          res.redirect('/user-signup')
        } else if (phoneregx.test(userInfo.phone) != true) {
        req.session.rmsg = "Invalid Phone number"
          res.redirect('/user-signup')
        } else if (userInfo.password == '') {
        req.session.rmsg = "Password field is empty" 
          res.redirect('/user-signup')
        } else if (pswdregx.test(userInfo.password) != true) {
        req.session.rmsg = "password should contain atleast 8 characters uppercase lowercase and number"
          res.redirect('/user-signup',)
        } else if ((userInfo.cpassword) != (userInfo.password)) {
        req.session.rmsg = "Password does not match"
          res.redirect('/user-signup')
        }else {
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
          })
          req.session.user=req.body
          res.redirect('/')
        }
    },


    userLogin: (req, res) => {
        var user = req.session.user
        if (user) {
            res.redirect('/')
        } else {
            err = req.session.err
            res.render('users/user-login', {err})
            req.session.err = null
        }
    },

    usercheck: async (req, res) => {
        const userInfo = {
            email: req.body.email,
            password: req.body.password,
        }
        var respons = {}

        var users = await user.findOne({ email: userInfo.email })
        if (users) {
            if (users.status) {

                bcrypt.compare(userInfo.password, users.password).then((status) => {
                    if (status) {
                        console.log(status)
                        respons.user = users
                        respons.status = true
                        console.log("login successful")
                        req.session.user = respons.user
                        res.redirect('/')

                    } else {
                        respons.msg = "Invalid password"
                        req.session.err = respons.msg
                        res.redirect('/user-login')
                    }
                })

            } else {
                respons.msg = "Your account has been blocked"
                req.session.err = respons.msg
                res.redirect('/user-login')
            }
        }
        else {
            respons.msg = "invalid email"
            req.session.err = respons.msg
            res.redirect('/user-login')
        }
    },

    userShop:async(req,res)=>{
        let user=req.session.user
        var productList=await products.find().toArray()
        res.render('users/shop',{user,productList})
    },

    productDetails:async(req,res)=>{
        proId=req.params.id
        let user=req.session.user
        let product=await products.findOne({_id:ObjectId(proId)})
        let dprice =parseInt( Math.round(product.price - ((product.price * product.discount) / 100)))
        console.log("discount" + dprice);
        res.render('users/product-detail', {user, product, id: req.params.id, user, dprice })  
 
    },
    addressbook:async(req,res)=>{
     let users=req.session.user
    let userId=req.session.user._id;
    let userData=await user.findOne({_id:ObjectId(userId)})
    console.log("pranav"+userData.name);
    res.render('users/addressbook',{userData,users})
    },

    getAddress:async(req,res)=>{
      let userId=req.session.user._id
      let userdata=await user.findOne({id:ObjectId(userId)})
      res.render('users/place-order')
    },

    deleteAddress:(req,res)=>{
      let addressId=req.params.id
      let userId=req.session.user._id
      console.log("sdfg"+addressId);
      user.updateOne({_id:ObjectId(userId)},{$pull:{address:{id:addressId}}})
      res.redirect('/addressbook')
    },
    

    // orderHistory:async(req,res)=>{
    //    let userId=req.session.user._id;
    //    let orderData=await orders.find({userId:userId}).toArray()
      
    //    res.render('users/order-history',{orderData})
    // },

    // orderDetails:async(req,res)=>{
    //    let orderId=req.params.orderId
    //    let proId=req.params.proId
    //    let index=req.params.index
    //    let order=await orders.findOne({_id:ObjectId(orderId)})
    //    let singleProduct={
    //     product:order.products[index],
    //     address:order.deliveryDetails
    //    }
    //    console.log("products"+singleProduct.product);
       
    //    res.render('users/order-details',{singleProduct})
    // }

    orderHistory:async (req,res) => {
      const users = req.session.user
      const userId = users._id
      console.log("usid",userId);
      const order = await orders.find({ userId:userId}).toArray()
      console.log("asdfgh"+order);
      res.render('users/order-history', { users, order })
    },
    
    orderedProducts: async (req, res) => {
      const orderId = req.params.id
      const users = req.session.user
      const userId = users._id
      //const count = await globalFunction.cartCount(userId)
    
          let orderdatas = await orders.aggregate([
            {
              $match: { _id:new ObjectId(orderId) }
            },
            {
              $unwind: '$products'
            },
            {
              $project: {
                item: '$products.item',
                quantity: '$products.quantity',
               
              }
            },
            {
              $lookup: {
                from: 'products',
                localField: 'item',
                foreignField: '_id',
                as: 'productDetails'
              }
            },
            {
              $project: {
                item: 1, quantity: 1, productDetails: { $arrayElemAt: ['$productDetails', 0] }
              }
            }
          ]).toArray();
          console.log(orderdatas);
          res.render('users/order-details',{orderdatas,users})
    },
   
   

    userProfile: async(req,res)=>{
     let userId=req.session.user._id
     var userData= await user.findOne({_id:ObjectId(userId)})
     console.log("hiiiiii",userData);
     res.render('users/userProfile',{userData})
     
    },

    userProfileEdit: async(req,res)=>{
      let userId=req.session.user._id
      
      let userdata=req.body
      console.log("userid"+userId);
      var userData= await user.updateOne({_id:ObjectId(userId)},{$set:{
        name:userdata.name,
        email:userdata.email,
        phone:userdata.phone
      }}).then()
      console.log("hiiiiii",userData);
      res.redirect('/user-profile')
      
     },

     selectAddress:async(req,res)=>{
      let id=req.params.id;
      console.log("id:"+id);
      let userId=req.session.user._id;
      let selectedAddress=await user.aggregate([
        {
          $match:{_id:ObjectId(userId)}
        },
        {
          $unwind:'$address'
        },
        {
          $match:{'address.id':id}
        },
      ]).toArray();
      let data=selectedAddress[0].address;
      let name=selectedAddress[0].name;
      let arr=name.split(' ');
      let address={
        fname:arr[0],
        lname:arr[1],
        email:data.email,
        address:data.address,
        country:data.country,
        state:data.state,
        city:data.city,
        zip:data.zip,
        phone:data.phone
      }
      req.session.selectedAddress=address
      res.redirect('/place-order')

     },
     removeOrder:async(req,res)=>{
      orderId=req.params.id
      await orders.deleteOne({_id:ObjectId(orderId)}).then(()=>{
        res.redirect('/order-history')
      })
     }
   
}

       