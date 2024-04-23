const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const authRouter = require('./routes/auth.route')
const commonRouter = require('./routes/common.route')
const userRouter = require('./routes/user.route')
const adminRouter = require('./routes/admin.route.js')
const path = require('path');
const cron = require('node-cron');
const tripDB = require('./models/usersTrip.model.js');
const signupDB = require('./models/signup.model.js');
const serverKey = process.env.FIREBASE_KEY;


// create express app
const app = express();

// app.set('view engine', 'ejs');
// app.engine('html', require('ejs').renderFile);


// // Set the views directory (where your templates will be stored)
// app.set('views', __dirname + '/views');

// // Define your API routes
app.get('/', (req, res) => {
  // Render the EJS template and pass data
  res.send("success")
});

app.set('view engine', 'ejs');
// app.set('views', __dirname + '/views');
app.engine('html', require('ejs').renderFile);

app.use(express.static(path.join(__dirname, './views')));

app.get('/privacy_policy', function (req, res) {
  res.sendFile(path.join(__dirname, 'Privacy_Policy.html'));
});

app.get('/myUride_Guidelines', function (req, res) {
  res.sendFile(path.join(__dirname, 'myUride_Guidelines.html'));
});

app.get('/myUride_User_Agreement', function (req, res) {
  res.sendFile(path.join(__dirname, 'myUride_User_Agreement.html'));
});

app.get('/myUride_Driver_Agreement', function (req, res) {
  res.sendFile(path.join(__dirname, 'myUride_Driver_Agreement.html'));
});




// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.json({ limit: '50mb' }))
  .use(express.urlencoded({ extended: true }));

// Configuring the database
require('dotenv').config()

mongoose.Promise = global.Promise;

// Connecting to the database
//console.log("----------------------->",process.env.DATABASE_URL)
mongoose.connect(process.env.DATABASE_URL, {
  useNewUrlParser: true
}).then(() => {
  console.log("Successfully connected to the database");
}).catch(err => {
  console.log('Could not connect to the database. Exiting now...', err);
  process.exit();
});

//initialize cors middleware
app.use(cors());

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Headers", "Origin,Content-Type, Content-Length, X-Requested-With");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  //req.con = con
  next();
});

// parse requests of content-type - application/json
app.use(express.json()) //handling the form data
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ limit: '50mb', extended: true }))

const port = 8001;

app.use('/v1/auth', authRouter);
app.use('/v1/common', commonRouter);
app.use('/v1/user', userRouter);
app.use('/v1/admin', adminRouter);

app.use("/public", express.static(path.join(__dirname, "public")));

app.use('/profileUploads', express.static(path.join(__dirname, 'profileUploads')));


app.get('/resetPassword', function (req, res) {
  res.sendFile(path.join(__dirname, '/resetPassword.html'));
});

app.get('/thankuResponse', function (req, res) {
  res.sendFile(path.join(__dirname, '/thankuResponse.html'));
});

app.get('/verificationResponse', function (req, res) {
  res.sendFile(path.join(__dirname, '/verificationResponse.html'));
});

cron.schedule('* * * * *', async () => {
  // console.log('Cron job executed! 1  -------------------------->');
  const finduser = await tripDB.find({ $ne: [{ status: 4 }], type: 2 });
  // console.log('finduser--------',finduser);
  if (finduser.length > 0) {
    //console.log('finduser===',finduser)
    await Promise.all(finduser.map(async (row) => {
      const newday = new Date(row.created_date);
      const departtime = new Date(row.depart_date_time);
      console.log('todayDate', todayDate);
      console.log('newday==', newday);
      const makenextday = newday.setDate(newday.getDate() + row.request_expiration);
      console.log('makenextday==', makenextday);
      var nextday = new Date(makenextday).toISOString().split('T')[0] + 'T00:00:00.000Z';
      console.log('nextday==', nextday);
      const todayDate = new Date();
      const matchday = await tripDB.find({
        $or: [{ $ne: [{ status: 4 }], type: 2, 'nextday': { $lte: todayDate } },
        { $ne: [{ status: 4 }], type: 2, departtime: { $lte: todayDate } }]
      })

      const update = await tripDB.updateOne({
        user_id: row._id
      }, {
        $set: {
          status: 4
        }
      });

      console.log('matchday==============', matchday);
    }));
    return success(res, 'Data Updated Successfully');
  }
});

cron.schedule('* * * * *', async () => {
  // console.log('Cron job executed! 2  -------------------------->');
  const finduser = await tripDB.find({ $ne: [{ status: 4 }], type: 2 });
  // console.log('finduser--------',finduser);
  if (finduser.length > 0) {
    //console.log('finduser===',finduser)
    await Promise.all(finduser.map(async (row) => {
      const newday = new Date(row.created_date);
      const returntime = new Date(row.return_date_time);
      //console.log('todayDate', todayDate);
      //console.log('newday==', newday);

      const makenextday = newday.setDate(newday.getDate() + row.request_expiration);
      //console.log('makenextday==', makenextday);
      var nextday = new Date(makenextday).toISOString().split('T')[0] + 'T00:00:00.000Z';
      //console.log('nextday==', nextday);
      const todayDate = new Date();
      const matchday = await tripDB.find({
        $or: [{ $ne: [{ status: 4 }], type: 2, 'nextday': { $lte: todayDate } },
        { $ne: [{ status: 4 }], type: 2, returntime: { $lte: todayDate } }]
      })

      const update = await tripDB.updateOne({
        user_id: row._id
      }, {
        $set: {
          status: 4
        }
      });

      // console.log('matchday==============', matchday);
    }));
    return success(res, 'Data Updated Successfully');
  }
});

//notify driver to start the trip
// Aniket commented below
//Schedule cronjob to run every minute
// cron.schedule('* * * * *', async () => {
//     console.log('Cron job executed! 3  -------------------------->');
//     try {
//         const trips = await tripDB.find({type:1}); // Retrieve all trips from the database
//         const currentTime = new Date();
//         trips.forEach(async(trip) => {
//             const getDriver = await signupDB.findById({ _id: trip.user_id })
//             const tripDepartureTime = new Date(trip.depart_date_time);
//             if (tripDepartureTime.getTime() === currentTime.getTime()) {
//                 // Send notification to the driver for this specific trip
//                 var fcm = new FCM(serverKey);
//                 let message = {
//                     to: getDriver.device_token,
//                     notification: {
//                         title: "Your trip is going to start",
//                         body: "Your trip is going to start",
//                     },

//                     data: {
//                         title: 'ok',
//                         body: "Your trip is going to start"
//                     }

//                 };

//                 console.log("message", message);
//                 fcm.send(message, function (err, response) {
//                     if (err) {
//                         return notifyError(response, 'Error')
//                     } else {
//                         return notifySuccess(res, 'Trip successfully deleted')
//                     }
//                 })
//             }
//         });
//     } catch (error) {
//         console.error('Error:', error);
//     }
// });

//request expireation handle
// Schedule cronjob to run every minute
cron.schedule('* * * * *', async () => {
  // console.log('Cron job executed! 4 -------------------------->');
  const finduser = await tripDB.find();
  //  console.log('finduser--------',finduser);
  if (finduser.length > 0) {
    // console.log('finduser===',finduser)
    await Promise.all(finduser.map(async (row) => {

      if (row.request_expiration !== null || row.request_expiration !== '' || row.request_expiration !== undefined) {
        const newday = new Date(row.created_date);
        const returntime = new Date(row.return_date_time);
        console.log('todayDate', todayDate);
        console.log('newday==', newday);

        const makenextday = newday.setDate(newday.getDate() + row.request_expiration);
        console.log('makenextday==', makenextday);
        var nextday = new Date(makenextday).toISOString().split('T')[0] + 'T00:00:00.000Z';
        console.log('nextday==', nextday);
        const todayDate = new Date();
        console.log('todayDate==', todayDate);

        if (new Date(nextday) < new Date(todayDate)) {
          const updateStatus = await tripDB.findByIdAndUpdate({ _id: row._id }, {
            status: 4
          }, { new: true })
          //  console.log("updateStatus",updateStatus)
        }
      }
      // var getDate;
      // if(row.trip == 'oneway'){
      //     getDate = row.depart_date_time;
      // }else{
      //     getDate = row.return_date_time;
      // }

      // const matchday = await tripDB.find({$or:[{$ne:[{status:4}],type:2,'nextday':{$lte: todayDate}},
      // {$ne:[{status:4}],type:2,returntime:{$lte: todayDate}}]})

      //     const update= await tripDB.updateOne({
      //          user_id: row._id
      //      }, {
      //          $set: {
      //              status: 4
      //          }
      //      });

      // console.log('matchday==============', matchday);
    }));
    //return success(res, 'Data Updated Successfully');
  }
});

function logRoutes(expressApp) {
  expressApp._router.stack.forEach((middleware) => {
    if (middleware.route) {
      console.log(`\x1b[32m${Object.keys(middleware.route.methods)} -> ${middleware.route.path}\x1b[0m`);
    } else if (middleware.name === 'router') {
      middleware.handle.stack.forEach((handler) => {
        if (handler.route) {
          console.log(`\x1b[32m${Object.keys(handler.route.methods)} -> ${middleware.regexp}${handler.route.path}\x1b[0m`);
        }
      });
    }
  });
}


logRoutes(app);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`)
});


