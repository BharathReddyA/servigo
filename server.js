const express = require("express");
const path = require("path");
const mysql = require("mysql");
const session = require("express-session");
const createError = require('http-errors');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const multer = require("multer");

const app = express();
const port = 3000;

const crypto = require("crypto");
const secretKey = crypto.randomBytes(32).toString("hex");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, 'public')));

app.use(cookieParser());
app.use(logger('dev'));
app.use(express.urlencoded({ extended: false }));
app.use(express.static("public"));
app.use(express.json());

const MySQLStore = require('express-mysql-session')(session);

const connection = mysql.createConnection({
  host: 'mysql-db',
  port: '3306',
  user: 'admin',
  password: 'admin123',
  database: 'servicedb',
});

// const sessionStore = new MySQLStore({
//   host: 'localhost',
//   user: 'admin',
//   password: 'admin123',
//   database: 'servicedb',
// });

connection.connect((err) => {
  if (err) throw err;
  console.log("Connected to MySQL database!");
});

app.use(
  session({
    secret: secretKey,
    resave: false,
    saveUninitialized: true,
    // store: sessionStore
  })
);

app.get('/home-page', (req, res) => {
  res.render('home');
});

app.get("/signin", (req, res) => {
  res.sendFile(__dirname + "/signin.html");
});

app.post("/signin", (req, res) => {
  const name = req.body.name;
  const username = req.body.username;
  const phone = req.body.phone;
  const password = req.body.password;

  const query = `INSERT INTO users (name, username, phone, password) VALUES (?, ?, ?, ?)`;

  connection.query(query, [name, username, phone, password], (err, results) => {
    if (err) throw err;
    console.log("User registered successfully!");
    // res.redirect("/login");
    res.sendFile(path.join(__dirname, "/public/login.html"));
  });
});

app.get("/workSignup", (req, res) => {
  res.sendFile(__dirname + "/workerSignup.html");
});

app.post("/workSignup", (req, res) => {
  const wname = req.body.wname;
  const workType = req.body.work_type;
  const wusername = req.body.wusername;
  const wphone = req.body.wphone;
  const wpassword = req.body.wpassword;
  const query = "INSERT INTO worker (wname, work_type, wusername, wphone, wpassword) VALUES (?, ?, ?, ?, ?)";
  const values = [wname, workType, wusername, wphone, wpassword];

  connection.query(query, values, (error, results) => {
    if (error) {
      console.error('Error inserting data: ', error);
      res.status(500).send('Error inserting data');
    } else {
      console.log('Data inserted successfully');
      res.redirect("/workLogin");
    }
  });
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
  res.render('welcome', { user: req.user || null });
});

app.post("/welcome", (req, res) => {
  const workType = req.body['work-type'];
  const query = 'SELECT * FROM worker WHERE work_type = ?';

  connection.query(query, [workType], (err, results) => {
    if (err) throw err;
    const worker = results[0];
    res.render('welcome', { worker: worker });
  });
});

app.get("/login", (req, res) => {
  res.sendFile(__dirname + "/login.html");
});

app.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  const query = `SELECT * FROM users WHERE username = ? AND password = ?`;

  connection.query(query, [username, password], (err, results) => {
    console.log("Username:", username);
    console.log("Password:", password);
    if (err) throw err;
    if (results.length > 0) {
      console.log('if con starting');
      req.session.loggedIn = true;
      req.session.username = username;
      res.redirect("/welcome");
      console.log('im in if con')
    } else {
      console.log('in else con');
      res.send("Invalid username or password");
    }
  });
});

app.get("/workLogin", (req, res) => {
  res.sendFile(__dirname + "/workerLogin.html");
});

app.post("/workLogin", (req, res) => {
  const wusername = req.body.wusername;
  const wpassword = req.body.wpassword;

  const query = `SELECT * FROM worker WHERE wusername = ? AND wpassword = ?`;

  connection.query(query, [wusername, wpassword], (err, results) => {
    if (err) throw err;
    if (results.length === 1) {
      req.session.loggedIn = true;
      req.session.wusername = wusername;
      res.redirect("/workerDashboard");
    } else {
      res.send("Invalid username or password");
    }
  });
});

app.get("/welcome", (req, res) => {
  if (req.session.loggedIn) {
    const username = req.session.username;
    const query = `SELECT * FROM users WHERE username = ?`;

    connection.query(query, [username], (err, results) => {
      if (err) throw err;
      const user = results[0];
      res.render("welcome", { user: user });
    });
  } else {
    res.redirect("/login");
  }
});

app.get('/userNewService', (req, res) => {
  res.render('userNewService')
})
// app.get('/userPreviousService', (req, res) => {
//   if (req.session.loggedIn) {
//     const username = req.session.username;
//     const query = `SELECT * FROM current_service WHERE username = ?`;

//     connection.query(query, [username], (err, results) => {
//       if (err) throw err;

//       const USP = results;

//       // Retrieve the photos for the service
//       const serviceType = USP.serviceType;
//       const photosQuery = `SELECT photo_filename FROM current_service WHERE serviceType = ?`;

//       connection.query(photosQuery, [serviceType], (err, photoResults) => {
//         if (err) throw err;

//         const photos = photoResults.map(result => result.photo_filename);

//         // Render the page with service details and photos
//         res.render("userPreviousService", { USP: USP, photos: photos });
//       });
//     });
//   } else {
//     res.redirect("/login");
//   }
// });

app.get('/userPreviousService', (req, res) => {
  if (req.session.loggedIn) {
    const username = req.session.username;
    const query = `SELECT * FROM current_service WHERE username = ?`;

    connection.query(query, [username], (err, results) => {
      if (err) {
        console.error('Error retrieving user previous services:', err);
        res.status(500).json({ error: 'Internal server error' });
      } else {
        console.log('results:', results);

        const USP = results;

        // Iterate over each service to retrieve its photos
        const photoPromises = USP.map(service => {
          const serviceId = service.id;
          const photosQuery = `SELECT photo_filename FROM current_service_photos WHERE service_id = ?`;

          return new Promise((resolve, reject) => {
            connection.query(photosQuery, [serviceId], (err, photoResults) => {
              if (err) reject(err);

              console.log('photoResults:', photoResults);

              const photos = photoResults ? photoResults.map(result => result.photo_filename) : [];
              service.photos = photos; // Add the photos array to the service object
              resolve();
            });
          });
        });

        // Wait for all photo queries to finish
        Promise.all(photoPromises)
          .then(() => {
            console.log('USP:', USP);
            res.render('userPreviousService', { USP: USP });
          })
          .catch(err => {
            console.error('Error retrieving photos for user previous services:', err);
            res.status(500).json({ error: 'Internal server error' });
          });
      }
    });
  } else {
    res.redirect('/login');
  }
});



// Multer configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix);
  }
});

const upload = multer({ storage: storage });

// app.get("/currentUserService", (req, res) => {
//   res.sendFile(__dirname + "/currentUserService");
// });
app.post('/currentUserService', upload.array('photos', 10), function (req, res) {
  console.log('came to upload block');
  if (req.session.loggedIn) {
    const username = req.session.username;
    const serviceType = req.body['serviceType'];
    const address = req.body['addressRequested'];
    const photos = req.files;

    // Check if all required fields are provided
    if (!serviceType || !address || !photos) {
      console.log('if block blocked');
      res.status(400).send('All fields are required');
      return;
    }

    // Iterate over the uploaded files
    for (const photo of photos) {
      // Retrieve the necessary file information
      const photoFilename = photo.filename;
      const photoOriginalname = photo.originalname;
      const photoMimetype = photo.mimetype;

      // Create the SQL query
      const query = `INSERT INTO current_service (username, serviceType, address, photo_filename, photo_originalname, photo_mimetype) VALUES (?, ?, ?, ?, ?, ?)`;
      const values = [username, serviceType, address, photoFilename, photoOriginalname, photoMimetype];

      // Execute the SQL query
      connection.query(query, values, function (error, results) {
        if (error) {
          console.error(error);
          res.status(500).send('Error inserting data');
        }
      });
    }

    res.redirect('/welcome');
  } else {
    console.log('User not logged in'); // Check if this message is logged
    res.status(401).send('User not logged in'); // Send an appropriate response
  }
});


// app.get('/photos/:serviceType', (req, res) => {
//   const serviceType = req.params.serviceType;
//   const query = `SELECT * FROM current_service WHERE serviceType = ?`;

//   connection.query(query, [serviceType], (err, results) => {
//     if (err) {
//       console.error(err);
//       res.status(500).send('Error retrieving data');
//     } else {
//       const photos = results.map(result => result.photo_filename);
//       // Render the page with the photos
//       res.render('photos', { photos: photos });
//     }
//   });
// });


// app.use('/', indexRouter);
// app.use('/users', usersRouter);

app.use(function(req, res, next) {
  next(createError(404));
});

app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error', { error: err });
});

app.use(function(err, req, res, next) {
  console.error(err); // Log the error to the console
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error', { error: err });
});


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

module.exports = app;
