const express = require('express');
const app = express();
const cors = require('cors');
const mongodb = require('mongodb');
const mongoClient = mongodb.MongoClient;
const dotenv = require('dotenv').config();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const URL = process.env.DB;
const DB = "crmcapstone";
app.listen(process.env.PORT || 3000);

//middleware
app.use(express.json());
app.use(cors({
    origin : "https://crmfrontend.netlify.app"
    // origin : "http://localhost:3001"
}))

const Authenticate = (req,res,next) => {
    if (req.headers.authorization) {
        try {
            const decode = jwt.verify(req.headers.authorization, process.env.SECRET);
            if(decode){
                next()
            }
        } catch (error) {
            res.status(401).json({message:"UnAuthorized"})
        }
    } else {
        res.status(401).json({message:"UnAuthorized"})
    }
};

app.get('/', function(req,res){
    res.send("Welcome to Capstone CRM Project !")
})

//create user
app.post('/user',Authenticate, async function(req,res){
    try {
        const connection = await mongoClient.connect(URL);
        const db = connection.db(DB);
        await db.collection('users').insertOne(req.body);
        await connection.close();
        res.json({message:"User Data Insert"})
    } catch (error) {
        console.log(error)
        res.status(500).json({message:"Something Went Wrong"})
    }
})

//get users
app.get('/users',Authenticate, async function(req,res){
    try {
        const connection = await mongoClient.connect(URL);
        const db = connection.db(DB);
        const resUser = await db.collection('users').find().toArray();
        await connection.close();
        res.json(resUser);
    } catch (error) {
        console.log(error);
        res.status(500).json({message:"Something Went Wrong"})
    }
})

//view user
app.get('/user/:id',Authenticate, async function(req,res){
    try {
        const connection = await mongoClient.connect(URL);
        const db = connection.db(DB);
        const user = await db.collection('users').findOne({ _id: new mongodb.ObjectId(req.params.id) });
        await connection.close();
        res.json(user);
    } catch (error) {
        res.status(500).json({message:"Something Went Wrong"})
    }
})

//Edit user
app.put('/user/:id',Authenticate, async function(req,res){
    try {
        const connection = await mongoClient.connect(URL);
        const db = connection.db(DB);
        const view = await db.collection('users').findOneAndUpdate({_id: new mongodb.ObjectId(req.params.id)},{$set:req.body});
        await connection.close();
        res.json(view);
    } catch (error) {
        res.status(500).json({message:"Something Went Wrong"})
    }
})

//Delete user
app.delete('/user/:id',Authenticate, async function(req,res){
    try {
        const connection = await mongoClient.connect(URL);
        const db = connection.db(DB);
        const user = await db.collection('users').findOneAndDelete({ _id: new mongodb.ObjectId(req.params.id)});
        await connection.close();
        res.json(user);
    } catch (error) {
        res.status(500).json({message:"Something Went Wrong"})
    }
})

//create registerui
app.post('/createregister',async function(req,res){
    try{
        const connection = await mongoClient.connect(URL);
        const db = connection.db(DB);

        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(req.body.password,salt);
        req.body.password = hash;
        req.body.repeatpassword = hash;
        await db.collection('registerui').insertOne(req.body);
        await connection.close();
        res.json({message:"registerui insert successfully"})
    } catch (error) {
        console.log(error)
        res.status(500).json({message:"something went wrong"});
    }
})

//login 
app.post('/login',async function(req,res){
    try {
        const connection = await mongoClient.connect(URL);
        const db = connection.db(DB);
        const user = await db.collection('registerui').findOne({ email: req.body.email });
        if (user) {
            const compare = await bcrypt.compare(req.body.password, user.password);
            if (compare) {
                const token = jwt.sign({_id: user._id},process.env.SECRET,{expiresIn:"10m"})
                res.json({token})
            } else {
                console.log(error)
                res.json({message:"Enter correct Password"})
            }
        } else {
            console.log(error)
            res.status(401).json({message:"Enter correct Email"})
        }
        await connection.close();
    } catch (error) {
        console.log(error)
        res.status(500).json({message:"Something Went Wrong"})
    }
})

//create Admin 
app.post('/admin',Authenticate, async function(req,res){
    try {
        const connection = await mongoClient.connect(URL);
        const db = connection.db(DB);
        await db.collection('admins').insertOne(req.body);
        await connection.close();
        res.json({message:"Admin Data Insert"})
    } catch (error) {
        console.log(error)
        res.status(500).json({message:"Something Went Wrong"})
    }
})

//get admins
app.get('/admins',Authenticate, async function(req,res){
    try {
        const connection = await mongoClient.connect(URL);
        const db = connection.db(DB);
        const allAdmin = await db.collection('admins').find().toArray();
        await connection.close();
        res.json(allAdmin);
    } catch (error) {
        console.log(error);
        res.status(500).json({message:"Something Went Wrong"})
    }
})

//get users in admin account
app.get('/admins',Authenticate, async function(req,res){
    try {
        const connection = await mongoClient.connect(URL);
        const db = connection.db(DB);
        const allusersinAdmin = await db.collection('users').find().toArray();
        await connection.close();
        res.json(allusersinAdmin);
    } catch (error) {
        console.log(error);
        res.status(500).json({message:"Something Went Wrong"})
    }
})

//view Admin
app.get('/admin/:id',Authenticate, async function(req,res){
    try {
        const connection = await mongoClient.connect(URL);
        const db = connection.db(DB);
        const admin = await db.collection('admins').findOne({ _id: new mongodb.ObjectId(req.params.id) });
        await connection.close();
        res.json(admin);
    } catch (error) {
        res.status(500).json({message:"Something Went Wrong"})
    }
})

//Edit admin
app.put('/admin/:id',Authenticate, async function(req,res){
    try {
        const connection = await mongoClient.connect(URL);
        const db = connection.db(DB);
        const viewAdmin = await db.collection('admins').findOneAndUpdate({_id: new mongodb.ObjectId(req.params.id)},{$set:req.body});
        await connection.close();
        res.json(viewAdmin);
    } catch (error) {
        res.status(500).json({message:"Something Went Wrong"})
    }
})

//Delete admin
app.delete('/admin/:id',Authenticate, async function(req,res){
    try {
        const connection = await mongoClient.connect(URL);
        const db = connection.db(DB);
        const admin = await db.collection('admins').findOneAndDelete({ _id: new mongodb.ObjectId(req.params.id)});
        await connection.close();
        res.json(admin);
    } catch (error) {
        res.status(500).json({message:"Something Went Wrong"})
    }
})

//create Adminregister
app.post('/createadminregister',async function(req,res){
    try{
        const connection = await mongoClient.connect(URL);
        const db = connection.db(DB);

        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(req.body.password,salt);
        req.body.password = hash;
        req.body.repeatpassword = hash;
        await db.collection('adminregister').insertOne(req.body);
        await connection.close();
        res.json({message:"Admin insert successfully"})
    } catch (error) {
        console.log(error)
        res.status(500).json({message:"something went wrong"});
    }
})

//Admin login 
app.post('/adminlogin',async function(req,res){
    try {
        const connection = await mongoClient.connect(URL);
        const db = connection.db(DB);
        const admin = await db.collection('adminregister').findOne({ email: req.body.email });
        if (admin) {
            const compare = await bcrypt.compare(req.body.password, admin.password);
            if (compare) {
                const token = jwt.sign({_id: admin._id},process.env.SECRET,{expiresIn:"10m"})
                res.json({token})
            } else {
                console.log(error)
                res.json({message:"Enter correct Password"})
            }
        } else {
            console.log(error)
            res.status(401).json({message:"Enter correct Email"})
        }
        await connection.close();
    } catch (error) {
        console.log(error)
        res.status(500).json({message:"Something Went Wrong"})
    }
})