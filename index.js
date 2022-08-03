const express = require("express");
const app = express();
const cors = require("cors");
const mongodb = require("mongodb");
//const URL = "mongodb+srv://shivakumark:Test1234@cluster0.kot9grj.mongodb.net/?retryWrites=true&w=majority";
const URL = "mongodb://127.0.0.1:27017/survey"
const DB = "survey";

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


app.use(cors())
app.use(express.json());

app.post("/register", async function (req, res) {
    try {
        let connection = await mongodb.connect(URL);
        let db = connection.db(DB);

        //check wheater email is unique
        let uniqueEmail = await db.collection("users").findOne({ email: req.body.email });

        if (uniqueEmail) {
            res.json({
                message: "email already exist"
            })
        } else {
            let salt = await bcrypt.genSalt(10);

            let hash = await bcrypt.hash(req.body.password, salt);

            //encrypting the paasword using bycrypt 
            req.body.password = hash;

            //inserting deatails of users 
            let users = await db.collection("users").insertOne(req.body);

            await connection.close();
            res.json({
                message: "User Registerd"
            })
        }
    } catch (error) {
        console.log(error)
    }
})

//posting the user login details 
app.post("/login", async function (req, res) {
    try {
        let connection = await mongodb.connect(URL);
        let db = connection.db(DB);
        //finding the email ispresent in the user collection
        let user = await db.collection("users").findOne({ email: req.body.email })

        if (user) {

            //comparing the given password and password present in the database
            let isPassword = await bcrypt.compare(req.body.password, user.password);
            if (isPassword) {
                
                //generating the JWT token
                let token = jwt.sign({ _id: user._id }, "qwertyuiop")

                res.json({
                    message: "allow",
                    token,
                    id: user._id
                })
            } else {
                res.json({
                    message: "Email or password is incorrect"
                })
            }
        } else {
            res.json({
                message: "Email or password is incorrect"
            })
        }
    } catch (error) {
        console.log(error)
    }
})

app.get("/user/:id", async function (req, res) {
    try {
        let connection = await mongodb.connect(URL);
        let db = connection.db(DB);

        //getting user details for the corresponding email
        let user = await db.collection("users").findOne({ email: req.params.id })
        res.json(user)
        await connection.close();
    } catch (error) {
        console.log(error)

    }
})

app.post("/survey", async function (req, res) {
    try {
        let connection = await mongodb.connect(URL);
        let db = connection.db(DB);

        //inserting job detaials to survey collection
        await db.collection("survey").insertOne(req.body);
        await connection.close();
        res.json({
            message: "Survey recorded"
        })
    } catch (error) {
        console.log(error)
    }
})

//getting user by id

app.get("/users/:id", async function (req, res) {
    try {
        let connection = await mongodb.connect(URL);
        let db = connection.db(DB);
        //getting user details for the corresponding id
        let users = await db.collection("users").findOne({ _id: mongodb.ObjectID(req.params.id) })
        res.json(users)
        await connection.close();
    } catch (error) {
        console.log(error)
    }
})

app.get("/survey/:id", async function (req, res) {
    
    try {
        let connection = await mongodb.connect(URL);
        let db = connection.db(DB);
        //getting survey details for the corresponding user email
        let jobs = await db.collection("survey").find({ email: req.params.id}).toArray();
        res.json(jobs)
        await connection.close();
    } catch (error) {
        console.log(error)
    }
})

app.listen(5000)