const { default: mongoose }= require("mongoose")

const productData=mongoose.Schema({
    productname:{
        type:String,
        required : true
    },
    brand:{
        type:String,
        required : true
    },
    category:{
        type:String,
        required : true
    },
    stock:{
        type:Number,
        required : true
    },
    price:{
        type:Number,
        required : true
    },
    discount:{
        type:Number,
        required:true
    },
    description:{
        type:String,
        required : true
    },
    image:{
        type:Array,
        required:true
    }
})

const product = mongoose.model("Product",productData).collection

module.exports=product;