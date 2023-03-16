const { default: mongoose }= require("mongoose")
const orderData = mongoose.Schema({
    deliveryDetails:{
        type:Object,
        required : true
    },
    userId:{
        type:String,
        required : true
    },
    paymentMethod:{
        type:String,
        required:true
    },
    products:{
        type:String,
        required:true
    },
    totalAmount:{
        type:Number,
        required:true
    },
    status:{
        type:String,
        required:true
    },
    date:{
        type:String,
        required:true
    }

    
})
const orders = mongoose.model("orders",orderData).collection

module.exports=orders;