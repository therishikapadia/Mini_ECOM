require('dotenv').config();
const express=require('express')
const path = require('path')

const {logReqRes}=require('./middlewares')
const {restrictTo,checkForAuthentication}=require('./middlewares/auth')
const cookieParser=require('cookie-parser')

const {connectMongoDB}=require('./connect')

const staticRouter=require('./routes/staticRouter')
const userRoute=require('./routes/user')
const customerRoute=require('./routes/customer')
const adminRoute=require('./routes/admin')
const orderRoute=require('./controllers/order')

const app=express()
const port=8000

// Added proper error handling for MongoDB connection
connectMongoDB('mongodb://127.0.0.1:27017/omtraders')
.then(()=>console.log('MongoDB Connected'))
.catch((err) => {
    console.error('MongoDB Connection Error:', err);
    process.exit(1);
});

//middelwares
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser())
app.use(express.json())
app.use(logReqRes("log.txt"))
app.use(checkForAuthentication)

//views
app.set('view engine','ejs')
app.set('views',path.resolve('./views'))

//routes
app.use('/',staticRouter)
app.use('/user',userRoute)
app.use('/customer',customerRoute)
app.use('/admin',adminRoute)


app.listen(port,()=>console.log("Server running on port",port))
