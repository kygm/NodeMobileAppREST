//package declarations
const express = require('express');
const app = express();
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const { removeAllListeners } = require('nodemon');
const cookieParser = require('cookie-parser');
//port declaration
const PORT = process.env.PORT || 1700;

//authorization var
var authorized;

//todays date
var todaysDate = new Date();
var dd = String(todaysDate.getDate()).padStart(2, '0');
var mm = String(todaysDate.getMonth() + 1).padStart(2, '0'); //January is 0!
var yyyy = todaysDate.getFullYear();


//handlebars
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

//body parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
//cookie parser
app.use(cookieParser());


var show = 0;

//mongodb database setup
//cloud db url
const dbUrl = "mongodb+srv://admin:Password1@cluster.qtabs.mongodb.net/test?retryWrites=true&w=majority";

mongoose.connect(dbUrl,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
//for showing page if conn error
var show;

const db = mongoose.connection;

//console.log(db.error);
db.on('error', () => {
  console.error.bind(console, 'connection error: ');
}).then(show = 1);
db.once('open', () => {
  console.log('MongoDB Connected');
}).then(show = 2);

console.log("DB Status: " + show);

  //load clients model
  require('./Models/Clients');
  const Client = mongoose.model('Clients');

  //load transact model
  require('./Models/Transaction');
  const Transaction = mongoose.model('Transactions');

  //must load transact and document models
  //afterwards




  //ROUTES


//working, returns entire list of clients
  app.get('/', async (req, res) => {
      //res.clearCookie("authorized");
      //console.log(req.cookies);
      var clientsList;
      clientsList = await Client.find({}).lean();

      return res.status(200).json({'client' : clientsList});

  });
  //questionable
  app.get('/getTransacts', async (req, res) => {
    var transactList;
    transactList = await Transaction.find({}).lean();
    return res.status(200).json({'transaction': transactList});
  });

  app.get('/getRevenue', async (req, res) =>{
    //in here, we need an aggregate query to return
    //total revenue (sum of cost - sum of price)
  });
  //working
  app.post('/addClient', async(req, res) =>{

    const newClient =
      {
        fname: req.body.fname,
        lname: req.body.lname,
        city: req.body.city,
        state: req.body.state,
        address: req.body.address,
        phoneNumber: req.body.phoneNumber,
        descript: req.body.descript

      }
      await new Client(newClient).save();

    console.log(req.body);
    return res.json(
      await Client.findOne({phoneNumber : req.body.phoneNumber})
    );
  });
  
  app.post('/clientDetails', async (req,res) =>{

    await Client.updateOne({_id: req.body.id}
      ,{
        fname: req.body.fname,
        lname: req.body.lname,
        state: req.body.state,
        address: req.body.address,
        phoneNumber: req.body.phoneNumber,
        city: req.body.city,
        descript: req.body.descript
      }, {upsert: true}
    );
    console.log("Updated client " + req.body.id);
    return res.status(200);
  });

  app.post('/addTransaction', async (req, res) =>{
    const newTransact =
      {
        fname: req.body.fname,
        lname: req.body.lname,
        phoneNumber: req.body.phoneNumber,
        transactDate: req.body.transactDate,
        transactCost: req.body.transactCost,
        transactPrice: req.body.transactPrice,
        transactTime: req.body.transactTime,
        descript: req.body.descript,
        transactName: req.body.transactName
      }
      await new Transaction(newTransact).save();
      console.log(req.body);

    return res.json(
      await Transaction.find({lname: req.body.lname})
    );
  });
  //working
  app.post('/deleteClient', async(req,res)=>{
    await Client.deleteOne({_id : req.body.id});
    console.log("Removed client with id of: " + req.body.id);

    return res.status(200);
  });
  app.post('/deleteTransact', async(req, res) =>{
    await Transaction.deleteOne({_id: req.body.id});
    console.log("Removed transaction with id of: " + req.body.id);
  });

//********************CONFIG*SECTION***********************//


//port selection
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
