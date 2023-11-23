const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(cors({
    origin: ['https://chauni-cafe-and-resturant.web.app','http://localhost:5173',],
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());
// need  verifytoken cors and helmet error solution
// verify token
const verifyUserWithToken = async (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).send({ message: 'Authentication failed: User not authorized' })
    }
    
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (error, decode) => {
            if (error) {
                return res.status(403).send({ message: 'Access to this resource is forbidden' })
            }
            else {
                req.user = decode
                next();
            }
        })
    
}

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@assignmentdb.20nrhba.mongodb.net/?retryWrites=true&w=majority`;


const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // const foodsModiFiedCollection1 = client.db('FoodData').collection('foodcollections');
        const foodsModiFiedCollection = client.db('FoodData').collection('foodModifiedCollection');
        const ordersCollection = client.db('FoodData').collection('ordercollections');
        console.log("Pinged your deployment. You successfully connected to MongoDB!");

        
        



        app.get('/api/v1/foods', async (req, res) => {
            const result = await foodsModiFiedCollection.find().toArray();
            res.send(result);
        });



        app.get('/api/v1/foodpagination', async (req, res) => {
            const page = parseInt(req.query.pages);
            const size = parseInt(req.query.size);

            const result = await foodsModiFiedCollection.find()
                .skip(page * size)
                .limit(size)
                .toArray();
            res.send(result);
        });
        // find details single data
        app.get('/api/v1/details/:id', async (req, res) => {
            const id = req.params.id;

            const result = await foodsModiFiedCollection.findOne({ _id: new ObjectId(id) });
            res.send(result);
        });
        // post the order
        app.post('/api/v1/order', async (req, res) => {
            const ordersData = req.body;
            const result = await ordersCollection.insertOne(ordersData);
            res.send(result);
        });
        // myOrder
        app.get('/api/v1/myOrders', async (req, res) => {
            // console.log(req.user.useremail)
            // console.log(req.query.useremail)

            // if (req.user?.useremail == req.query?.useremail) {
            //     const email = req.query.useremail;
            //     const result = await ordersCollection.find({ useremail: email }).toArray();
            //     res.send(result);
            // }

            // else {
            //     return res.status(403).send({ message: 'You are forbidden to access' })
                
            // }
            const email = req.query.useremail
                const result = await ordersCollection.find({ useremail: email }).toArray();
                res.send(result);
        });
        // DELETE ORDER
        app.delete('/api/v1/myOrders/:id', async (req, res) => {
            const id = req.params.id;
            const result = ordersCollection.deleteOne({ _id: new ObjectId(id) });
            res.send(result);
        })
        // addFood
        app.post('/api/v1/addFood', async (req, res) => {
            const data = req.body;
            const result = await foodsModiFiedCollection.insertOne(data);
            res.send(result);
        });
        // query my food by user
        app.get('/api/v1/myFood', async (req, res) => {
            const email = req.query.useremail;
            const result = await foodsModiFiedCollection.find({ userEmail: email }).toArray();
            res.send(result);
        });
        //update food with patch
        app.patch('/api/v1/updateFood/:id', async (req, res) => {
            const id = req.params.id;
            const upInfo = req.body;
            console.log(id);
            const result = await foodsModiFiedCollection.updateOne({ _id: new ObjectId(id) }, { $set: upInfo });
            res.send(result);
        });
        // update the count
        app.patch('/api/v1/updatecount/:id',async(req,res)=>{
            const id = req.params.id;
            const {countValue} = req.body;
            // const countvalue = upCount.count;
            const result = await foodsModiFiedCollection.updateOne({_id: new ObjectId(id)},{$set:{count:countValue}});
            res.send(result.modifiedCount);
            
            

        });

        // update quantity
        app.patch('/api/v1/updateQuantity/:id',async(req,res)=>{
            const id =req.params.id;
            const {quantityValue} = req.body;
            const result = await foodsModiFiedCollection.updateOne({_id:new ObjectId(id)},{$set:{quantity:quantityValue}});
            res.send(result);
        });
        // sot data by count
        app.get('/api/v1/sortCountData',async(req,res)=>{
            const result = await foodsModiFiedCollection.find().sort({count: -1}).toArray();
            res.send(result);
        });
        

        // json token
        app.post('/jwt', async (req, res) => {
            const user = req.body;



            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
            res.cookie('token', token, {
                httpOnly: true,
                secure: true,
                sameSite:'none',


            })
                .send({ token });


        })

        // json token end


    } finally {

    }
}
run().catch(console.dir);
app.get("/", (req, res) => { res.send("Crud is running..."); });
app.listen(port, () => { console.log(`Simple Crud is Running on port ${port}`); });