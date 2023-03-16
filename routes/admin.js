var express = require('express');
const { response } = require('../app');
const adminhelpers = require('../helpers/adminhelpers');
const product = require('../model/productScema');
var nocache=require('nocache');
// const { deletProducts } = require('../helpers/adminhelpers');
const category = require('../model/categorySchema');
const adminController = require('../controller/adminController');
// const admin = require('../model/adminSchema');
var router = express.Router();

// function verify(req,res,next){
//   if(req.session.admin){
//     next()

//   }else{
//     redirect('/admin/admin-login')
//   }
// }

verifyLogin=(req,res,next)=>{
  let admin=req.session.admin
  if(admin)
  {
    next()
  }else{
    res.redirect('/admin/admin-login')
  }
}

/* GET users listing. */
router.get('/',verifyLogin, function(req, res, next) {
  res.render('admin/admin-home');
});

router.get('/admin-login',nocache(),adminController.adminLogin)
// (req,res)=>{

//   res.render('admin/admin-login')
//   admin = req.session.admin;
//   if(admin){
//     res.redirect('/')
//   }else{
//     err=req.session.err
//     // console.log("error"+err);
//     res.render('admin/admin-login',{err})
//     req.session.err=null;
//   }
// })

router.post('/admin-login',adminController.adminCheck)
// (req,res)=>{
//   const adminInfo={
//      email:req.body.email,
//      password:req.body.password
//   }

//   adminhelpers.adminCheck(adminInfo).then((response)=>{
//     console.log(response);
//     if(response.status){
//       console.log("login successful")
//       req.session.admin=response.admin
//       res.redirect('/admin')
//     }else{
//       console.log(response.msg)
//       req.session.err=response.msg
//       res.redirect('/admin/admin-login')
//     }
//   })
// })

router.get('/user-list',adminController.userlist)
// verifyLogin,(req,res)=>{
//  var admin=req.session.admin
//   if(admin){
//   adminhelpers.getUsers().then((users)=>{
//     res.render('admin/userlist',{admin,users})
//   })
  
//  }else{
//   res.redirect('/admin/admin-login')
//  }
  
// })

router.get('/delet-user/:id',verifyLogin,adminController.userDelete)
// (req,res)=>{
//   console.log(req.params.id);
//   adminhelpers.deletUsers(req.params.id)
//   res.redirect('/admin/user-list')
// })

router.get('/block-user/:id',verifyLogin,adminController.userBlock)
// (req,res)=>{
//   adminhelpers.blockUser(req.params.id)
//   res.redirect('/admin/user-list')
// })

router.get('/unblock-user/:id',verifyLogin,adminController.userUnlock)
// verifyLogin,(req,res)=>{
//   adminhelpers.unblockUser(req.params.id)
//   res.redirect('/admin/user-list')
// })

router.get('/product-add',verifyLogin,adminController.productAdd)
// (req,res)=>{
//   var err=req.session.msg
//   adminhelpers.showCategory().then((show)=>{
//     res.render('admin/product',{err,show})
//   })
  
//   req.session.msg=null

// })

//router.post('/product-add',verifyLogin,adminController.addProduct)
// router.post('/product-add',(req,res)=>{
//   image = req.files.image
//   adminhelpers.addProduct(req.body,image).then((msg)=>{
//     if(msg){
//       req.session.msg=msg
//       res.redirect('/admin/product-add')
//     }else{
//       req.session.product=req.body
//       res.redirect('/admin/product-add')
//     }
//   })
// })

router.get('/product-list',verifyLogin,adminController.productList)
// (req,res)=>{
//   adminhelpers.getProducts().then((products)=>{
//     res.render('admin/product-list',{products})
//   })
 
// })

router.get('/product-delete/:id',adminController.productDelete)
// (req,res)=>{
//   console.log(req.params.id);
//   adminhelpers.deletProducts(req.params.id)
//   res.redirect('/admin/product-list')
// })


router.get('/product-edit/:id',adminController.productEdit)
// router.get('/product-edit/:id',async(req,res)=>{
//    let category=await adminhelpers.showCategory()
//    console.log("categories"+category);
//   adminhelpers.selectProduct(req.params.id).then((products)=>{
   
//     res.render('admin/product-edit',{products,category})
//   })
// })

router.post('/product-edit',verifyLogin,adminController.editProduct)
// (req,res)=>{
//    adminhelpers.updateProduct(req.params.id,req.body).then(()=>{
//     res.redirect('/admin/product-list')
//    })
// })

// router.get('/add',(req,res)=>{
//   res.render('admin/add')
// })


router.get('/category-add',verifyLogin,adminController.categoryAdd)
// (req,res)=>{
//    var err=req.session.err;
//    editCategoryData=req.session.editCategory;
//    adminhelpers.showCategory().then((categoryData)=>{
//     res.render('admin/category',{err,categoryData,editCategoryData})
//     req.session.msg=null
//     req.session.editCategory=null;
//    })
//    })

router.post('/category-add',adminController.addCategory)
// (req,res)=>{

//   adminhelpers.addCategory(req.body).then((data)=>{
//      if(data.id){
        
//         res.redirect('/admin/category-add')
//      }else{
//       req.session.err=data
//       res.redirect('/admin/category-add')
//      }
//   })
  
// })

router.get('/category-edit/:id',verifyLogin,adminController.categoryEdit)
// (req,res)=>{
  
//   adminhelpers.editcategory(req.params.id).then((data)=>{
//     req.session.editCategory=data
//     res.redirect('/admin/category-add')
//   })
// })


router.post('/category-edit/:id',verifyLogin,adminController.updateCategory)
// (req,res)=>{
//   let categoryId=req.params.id
//   let updateData=req.body
//   adminhelpers.updateCategory(categoryId,updateData)
//   res.redirect('/admin/category-edit/'+req.params.id)
// })


router.get('/category-delete/:id',adminController.categoryDelete)
// (req,res)=>{
//   adminhelpers.deleteCategory(req.params.id)
//   res.redirect('/admin/category-add')
// })




module.exports = router;

