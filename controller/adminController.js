const admin = require('../model/adminSchema');
const user = require('../model/userSchema');
const mongoose=require('mongoose');
const { set, response } = require('../app');
const product = require('../model/productScema');
const category = require('../model/categorySchema');
const uuid = require('uuid');
const {ObjectId} = mongoose.Types;

module.exports={
  
    adminLogin:(req,res)=>{
        
        
        var admin = req.session.admin;
        if(admin){
            console.log("admin");
          res.redirect('/')
        }else{
            err=req.session.err
          // console.log("error"+err);
          res.render('admin/admin-login',{err})
          req.session.err=null;
    }
},
    adminCheck: async (req,res) => {
        const adminInfo = {
            email: req.body.email,
            password: req.body.password
        }
        var respons = {}
        var adminData = await admin.findOne({ email: adminInfo.email })
        if (adminData) {
            if (adminInfo.password == adminData.password) {
                respons.admin = adminData
                respons.status = true
                console.log("login successful")
                console.log(respons.admin);
                req.session.admin = respons.admin
                res.redirect('/admin')
            } else {
                respons.err = "invalid password"

                
                req.session.err = respons.err
                
                res.redirect('/admin/admin-login')
            }
        } else {
            respons.err = "invalid email"
            req.session.err = respons.err
            // req.session.err = response.msg
            res.redirect('/admin/admin-login')
        }


    },

    userlist:async(req,res)=>{
        var admin=req.session.admin
  if(admin){
    var userList=await user.find().toArray()
    res.render('admin/userlist',{admin,userList})
    }else{
  res.redirect('/admin/admin-login')
 }
    },

userDelete:async(req,res)=>{
    var userId=req.params.id
    await user.deleteOne({_id:ObjectId(userId)})
    res.redirect('/admin/user-list')
},

userBlock:async(req,res)=>{
    var userId=req.params.id
    await user.updateOne({_id:ObjectId(userId)},{$set:{status:false}})
    res.redirect('/admin/user-list')
},

userUnlock:async(req,res)=>{
    var userId=req.params.id
    user.updateOne({_id:ObjectId(userId)},{$set:{status:true}})
    res.redirect('/admin/user-list')
},
productAdd:(req,res)=>{
    var err=req.session.msg
    res.render('admin/product',{err})
    req.session.msg=null

},
addProduct:(req,res)=>{
    image = req.files.image
    productInfo=req.body
    var rmsg
            var nameRegex = /^([A-Za-z0-9_ ]){3,20}$/i;
            var priceRegex =/^([0-9.]){1,}$/i;
            var paraRegex = /^(.|\s)*[a-zA-Z]+(.|\s)*$/;

            if(productInfo.pname==''){
                rmsg="product name cannot be empty"
                req.session.msg=rmsg
      res.redirect('/admin/product-add')
            }

            else if(nameRegex.test(productInfo.pname)!=true){
               rmsg="enter valid product name"
               req.session.msg=rmsg
      res.redirect('/admin/product-add')
            }else if(productInfo.brand==''){
                rmsg="brand name cannot be empty"
                req.session.msg=rmsg
      res.redirect('/admin/product-add')
            }
            else if(nameRegex.test(productInfo.brand)!=true){
                rmsg="enter valid product brand"
                req.session.msg=rmsg
      res.redirect('/admin/product-add')
             }
             else if(productInfo.price==''){
                rmsg="price cannot be empty"
                req.session.msg=rmsg
      res.redirect('/admin/product-add')
            }else if(priceRegex.test(productInfo.price)!=true){
                rmsg="enter valid price"
                req.session.msg=rmsg
      res.redirect('/admin/product-add')
            }
               else if(productInfo.category==''){
                rmsg="catagory cannot be empty"
                req.session.msg=rmsg
      res.redirect('/admin/product-add')
            }
            else if(priceRegex.test(productInfo.stock)!=true){
                rmsg="enter valid product stock"
                req.session.msg=rmsg
      res.redirect('/admin/product-add')
             }else if(productInfo.stock==''){
                rmsg="stock cannot be empty"
                req.session.msg=rmsg
      res.redirect('/admin/product-add')
            }else if(priceRegex.test(productInfo.discount)!=true){
                rmsg="enter valid discount"
                req.session.msg=rmsg
      res.redirect('/admin/product-add')
            }else if(productInfo.discount==''){
                rmsg="discount cannot be empty"
                req.session.msg=rmsg
      res.redirect('/admin/product-add')
            }
            
            else if(paraRegex.test(productInfo.desc)!=true){
                rmsg="enter valid description"
                req.session.msg=rmsg
      res.redirect('/admin/product-add')
            }else if(productInfo.desc==''){
                rmsg="description cannot be empty"
                req.session.msg=rmsg
      res.redirect('/admin/product-add')
            }else if(image.length<1){
             rmsg="Add minimum 1 image"
             req.session.msg=rmsg
             res.redirect('/admin/product-add')
            }
             else if(image.length>3){
                rmsg="Add maximum 3 images"
                req.session.msg=rmsg
      res.redirect('/admin/product-add')
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
                    req.session.product=req.body
      res.redirect('/admin/product-add')
                })
             }
      


},

productList:async(req,res)=>{
    var productList=await product.find().sort({_id:-1}).toArray()
    res.render('admin/product-list',{productList})
},

productDelete:(req,res)=>{
    productId=req.params.id
    product.deleteOne({_id:ObjectId(productId)})
    res.redirect('/admin/product-list')
},

productEdit:async(req,res)=>{
    var productId=req.params.id
    products=await product.findOne({_id:ObjectId(productId)})
    
    res.render('admin/product-edit',{products})
},

editProduct:(req,res)=>{
    productId=req.params.id;
    console.log("proiid"+productId);
    productInfo=req.body;
    product.updateOne({_id:ObjectId(productId)},{$set:{
        name:productInfo.pname,
        brand:productInfo.brand,
        catagory:productInfo.category,
        price:productInfo.price,
        stock:productInfo.stock,
        discount:productInfo.discount,
        description:productInfo.desc,
     }}).then(()=>{
        obj=req.files;
        
        if(obj)
        {
            const count=Object.keys(obj).length
            for(i=0;i<count;i++){
                imgId=Object.keys(obj)[i]
                image=Object.values(obj)[i]
                console.log("imaaaage",imgId);
                image.mv('./public/product-images/'+imgId+'.jpg').then((err)=>{
                    if(err){
                        console.log(err)
                    }else{
                        console.log("done")
                    }
                 })
            }
            res.redirect('/admin/product-add')
        }
        else{
            res.redirect('/admin/product-list')
        }
       
     }) 
   
},

categoryAdd:async(req,res)=>{
    var err=req.session.msg;
     editCategoryData=req.session.editCategory;
     console.log("edit data",editCategoryData);
    var categoryData=await category.find().toArray()
    res.render('admin/category',{err,categoryData,editCategoryData})
    req.session.msg=null
    req.session.editCategory=null;
       
},

addCategory:async(req,res)=>{
    categoryInfo=req.body;
    console.log("cat info",categoryInfo);
    var respons={}
    var msg
        var nameRegex = /^([A-Za-z_ ]){3,20}$/i;
        if(categoryInfo.category==''){
            msg='enter a category'
            req.session.msg=msg
            res.redirect('/admin/category-add')
        }else if(nameRegex.test(categoryInfo.category)!=true){
            msg='enter valid category'
            req.session.msg=msg
            res.redirect('/admin/category-add')
        }else{
            await category.insertOne(categoryInfo).then((data)=>{
                respons.id=data.insertedId
              })
              if(respons.id){
                    res.redirect('/admin/category-add')
                 }else{
                    req.session.msg=data
                    res.redirect('/admin/category-add')
                 }
                
               
        
        }
},

categoryEdit:async(req,res)=>{
  var categoryId=req.params.id;
  console.log("iddddddd",categoryId);
  categoryData=await category.findOne({_id:ObjectId(categoryId)})
  console.log("cat data",categoryData);
  req.session.editCategory=categoryData.category;
  res.redirect('/admin/category-add')

},

updateCategory:async(req,res)=>{
     categoryId=req.params.id
  let updateData=req.body
  await category.updateOne({_id:ObjectId(categoryId)},{$set:{category:updateData.catagory}})
  res.redirect('/admin/category-edit/'+req.params.id)
},

categoryDelete:(req,res)=>{
    let categoryId=req.params.id
    category.deleteOne({_id:ObjectId(categoryId)})
   res.redirect('/admin/category-add')
}

}
