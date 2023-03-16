
const admin = require('../model/adminSchema');
const user = require('../model/userSchema');
const mongoose=require('mongoose');
const { set, response } = require('../app');
const product = require('../model/productScema');
const category = require('../model/categorySchema');
const uuid = require('uuid');
const {ObjectId} = mongoose.Types;

module.exports={
    adminCheck:async(adminInfo)=>{
        console.log(adminInfo);
        var respons={}
        // return new Promise(async(resolve, reject) => {
            var adminData = await admin.findOne({email:adminInfo.email})
            if(adminData){
                if(adminInfo.password==adminData.password){
                    respons.admin=adminData
                    respons.status=true
                    resolve(respons)
                }else{
                    respons.msg="invalid password"
                    resolve(respons)
                }
            }else{
                respons.msg="invalid email"
                resolve(respons)
            }
       
    },

    getUsers: ()=>{
        return new Promise(async(resolve, reject) => {
            var userList=await user.find().toArray()
            resolve(userList)
        })
    },
     
    deletUsers:(userId)=>{
        return new Promise(async(resolve, reject) => {
            await user.deleteOne({_id:ObjectId(userId)})
        
        })
    },

    blockUser:(userId)=>{
        return new Promise(async(resolve, reject) => {
            await user.updateOne({_id:ObjectId(userId)},{$set:{status:false}})
        })
    },

    unblockUser:(userId)=>{
        return new Promise((resolve, reject) => {
            user.updateOne({_id:ObjectId(userId)},{$set:{status:true}})
        })
    },

    addProduct:(productInfo,image)=>{

        return new Promise((resolve, reject) => {
            var rmsg
            var nameRegex = /^([A-Za-z0-9_ ]){3,20}$/i;
            var priceRegex =/^([0-9.]){1,}$/i;
            var paraRegex = /^(.|\s)*[a-zA-Z]+(.|\s)*$/;

            if(productInfo.pname==''){
                rmsg="product name cannot be empty"
                resolve(rmsg)
            }

            else if(nameRegex.test(productInfo.pname)!=true){
               rmsg="enter valid product name"
               resolve(rmsg)
            }else if(productInfo.brand==''){
                rmsg="brand name cannot be empty"
                resolve(rmsg)
            }
            else if(nameRegex.test(productInfo.brand)!=true){
                rmsg="enter valid product brand"
                resolve(rmsg)
             }
             else if(productInfo.price==''){
                rmsg="price cannot be empty"
                resolve(rmsg)
            }else if(priceRegex.test(productInfo.price)!=true){
                rmsg="enter valid price"
                resolve(rmsg)
            }
               else if(productInfo.category==''){
                rmsg="catagory cannot be empty"
                resolve(rmsg)
            }
            else if(priceRegex.test(productInfo.stock)!=true){
                rmsg="enter valid product stock"
                resolve(rmsg)
             }else if(productInfo.stock==''){
                rmsg="stock cannot be empty"
                resolve(rmsg)
            }else if(priceRegex.test(productInfo.discount)!=true){
                rmsg="enter valid discount"
                resolve(rmsg)
            }else if(productInfo.discount==''){
                rmsg="discount cannot be empty"
                resolve(rmsg)
            }
            
            else if(paraRegex.test(productInfo.desc)!=true){
                rmsg="enter valid description"
                resolve(rmsg)
            }else if(productInfo.desc==''){
                rmsg="description cannot be empty"
                resolve(rmsg)
            }
            
             else if(image.length>4){
                rmsg="Add maximum 4 images"
                resolve(rmsg)
             }
             else{
                count = image.length
                imgId = []
                if(count){
                    for(i=0;i<count;i++){
                     imgId[i]=uuid.v4()
                     image[i].mv('./public/product-images/'+imgId[i]+'.jpg',(err,done)=>{
                        if(err){
                            console.log(err)
                        }else{
                            console.log("done")
                        }
                     })
                    }
                }else{
                    imgId[0]=uuid.v4()
                    image.mv('./public/product-images/'+imgId[0]+'.jpg',(err,done)=>{
                        if(err){
                            console.log(err)
                        }else{
                            console.log("done")
                        }
                     })
                }
                productInfo.price=parseInt(productInfo.price)
                productInfo.stock=parseInt(productInfo.stock)
                productInfo.discount=parseInt(productInfo.discount)
                productInfo.image = imgId
                console.log("info==",productInfo);
                product.insertOne(productInfo).then((data)=>{
                    resolve()
                })
             }
        })


    },
    getProducts: ()=>{
        return new Promise(async(resolve, reject) => {
            var productList=await product.find().toArray()
            resolve(productList)
        })
    },


    deletProducts:(productId)=>{
       return new Promise((resolve, reject) => {
        product.deleteOne({_id:ObjectId(productId)})
       })
    },

    deleteCategory:(categoryId)=>{
        return new Promise((resolve, reject) => {
            category.deleteOne({_id:ObjectId(categoryId)})
        })
    },

    selectProduct:(productId)=>{
        return new Promise((resolve, reject) => {
           products= product.findOne({_id:ObjectId(productId)})
            resolve(products)
        })
    },

    updateProduct:(productId,productInfo)=>{
        return new Promise((resolve, reject) => {
           product.updateOne({_id:ObjectId(userId)},{$set:{
            name:productInfo.pname,
            brand:productInfo.brand,
            catagory:productInfo.category,
            price:productInfo.price,
            stock:productInfo.stock,
            discount:productInfo.discount,
            description:productId.desc
         }}).then((response)=>{
            resolve(response)
         }) 
        })
    },

    addCategory:(categoryInfo)=>{
        var respons={}
        return new Promise((resolve, reject) => {
        var rmsg
        var nameRegex = /^([A-Za-z0-9_ ]){3,20}$/i;
        if(categoryInfo.category==''){
            rmsg='enter a category'
            resolve(rmsg)
        }else if(nameRegex.test(categoryInfo.category)!=true){
            rmsg='enter valid category'
            resolve(rmsg)
        }else{
            category.insertOne(categoryInfo).then((data)=>{
                respons.id=data.insertedId
                console.log(data);
                resolve(respons)
            })
        }
        })
    },

    editcategory:(categoryId)=>{
        return new Promise((resolve, reject) => {
           var categoryData=category.findOne({_id:ObjectId(categoryId)})
               resolve(categoryData)
        })
    },

    updateCategory:(categoryId,updateData)=>{
        return new Promise((resolve, reject) => {
            category.updateOne({_id:ObjectId(categoryId)},{$set:{category:updateData.category}})
            
        })
    },

    showCategory:()=>{
       return new Promise(async(resolve, reject) => {
        var categoryData=await category.find().toArray()
       
        resolve(categoryData)
       })
    },
    getSingleProduct:(proId)=>{
        return new Promise(async(resolve, reject) => {
            let products=await product.findOne({_id:ObjectId(proId)})
            resolve(products);
        })
    }

}

   