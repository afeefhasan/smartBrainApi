const express=require('express');
const bodyParser=require('body-parser');
const mongoose = require('mongoose');
// const jwt = require('jsonwebtoken');
// // const bcrypt =require('bcrypt-nodejs');
// const config = require('config');
const Clarifai =require('clarifai');
const helmet=require('helmet');
const cors=require('cors');
const {check,validationResult}=require('express-validator')
// const { MongoClient } = require('mongodb');
const UsersSchemas=require('./Schema/users.js');
const bcrypt=require('bcryptjs');
const app=express()
app.use(cors());
app.use(bodyParser.json());

app.use(express.json({ extended: false }));

app.use(express.static('.'));
app.use(helmet());
app.use(bodyParser.urlencoded({ extended: true }))

const app2 = new Clarifai.App({
    apiKey: '95ba94e97294463c9e0f590c8670d199'
   });

const DB = "mongodb+srv://afeef:afeef%401180@cluster0.tifw3.mongodb.net/smart-brain?retryWrites=true&w=majority";
const connectToDatabase = async () => {
    try{
        await mongoose.connect(DB,{

        })
        console.log("MongoDB is connected");
    } catch(error){
        console.log(error);

        process.exit(1);
    }
}
connectToDatabase();

app.get('/',(req,res)=>{
    res.json(database.users)
})
app.post('/clarifai',
(req,res)=>{
    app2.models
    .predict('f76196b43bbd45c99b4f3cd8e8b40a8a',req.body.input)
    .then(data=>
        res.json(data)
        )
        .catch(err=>
            res.status(400).json('unable to get face position')
            )
}
)
app.post('/signin',
[
    check('email','type your email').isEmail(),
    check('password','Password is required').not().isEmpty()

],
async (req,res)=>{
    try{
        const {email,password}=req.body;
        let user=await UsersSchemas.findOne({email});
        if (!user){
            return res.status(401).json('Not Found')
        }
        let ispasscorr=await bcrypt.compare(password,user.password);
        if (ispasscorr===true){
            res.json(user)
        }
        else{
            res.status(401).json('wrong password');
        }
    }catch(error){
        console.log(error.message)
        return res.status(500).json({msg:'server error ...'})
    }
    

    
})
app.post('/signup',
[
    check('email','type your email').isEmail(),
    check('password','Password is required').not().isEmpty()
],
   async (req,res)=>{
    try{
    let {email,password,name,rank,joined}=req.body;
    let user= await UsersSchemas.findOne({email});
        console.log(user)
    const errors = validationResult(req);
    if(!errors.isEmpty())
    {
        return res.status(401).json({errors : errors.array()});
    }
    if (user){
        return res.status(401).json("present")
    }

    const salt=await bcrypt.genSalt(10);
    password=await bcrypt.hash(password,salt);
    joined=new Date();
    user= new UsersSchemas(
        {
            email,
            password,
            name,
            rank,
            joined
        }
    )
    await user.save();

    res.json(user)
    res.json('true');
    }
    catch(error){
        
        return res.status(500).json({msg:'server error ...'})
    }
    


});
app.get('/profile/:id', (req,res) => {
    const {id}=req.params;
    let found=false;
    database.users.forEach(user=>{
        if (user.id===id){
            found=true;
            return res.json(user);
        }
    })
    if (! found){
        res.status(404).json('no such users')
    }

})
app.put('/rank',
async (req,res)=>{
    const {id}=req.body;
    let found=false;
    var count;
    var user=await UsersSchemas.findById(id,{password : 0});

    if (user){
        found=true;
        count=user.rank;
        count++;
    }
    var user2=await UsersSchemas.findByIdAndUpdate(id,{"rank":count})
    var user3=await UsersSchemas.findById(id,{password : 0});
    res.json(user3.rank)
    if (!found){
        res.status(404).json('no such users')
    }

})

// Load hash from your password DB.
// bcrypt.compare("bacon", hash, function(err, res) {
//     // res == true
// });
// bcrypt.compare("veggies", hash, function(err, res) {
//     // res = false
// }); 
const port = process.env.PORT || 3000;
app.listen(port,()=>{
    console.log(`server is running on port ${port}`)
})