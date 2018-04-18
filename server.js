// Express Setup //
const express = require('express');
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static('public'));

// Knex Setup //
const env = process.env.NODE_ENV || 'development';
const config = require('./knexfile')[env];  
const knex = require('knex')(config);

// bcrypt setup
let bcrypt = require('bcrypt');
const saltRounds = 10;

// jwt setup
const jwt = require('jsonwebtoken');
let jwtSecret = process.env.jwtSecret;
if (jwtSecret === undefined) {
  console.log("You need to define a jwtSecret environment variable to continue.");
  knex.destroy();
  process.exit();
}

// Verify the token that a client gives us.
// This is setup as middleware, so it can be passed as an additional argument to Express after
// the URL in any route. This will restrict access to only those clients who possess a valid token.
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token)
    return res.status(403).send({ error: 'No token provided.' });
  jwt.verify(token, jwtSecret, function(err, decoded) {
    if (err)
      return res.status(500).send({ error: 'Failed to authenticate token.' });
    // if everything good, save to request for use in other routes
    req.userID = decoded.id;
    next();
  });
}


// Login //

app.post('/api/login', (req, res) => {
  if (!req.body.email || !req.body.password)
    return res.status(400).send();
  knex('users').where('email',req.body.email).first().then(user => {
    if (user === undefined) {
      res.status(403).send("Invalid credentials");
      throw new Error('abort');
    }
    return [bcrypt.compare(req.body.password, user.hash),user];
  }).spread((result,user) => {
    if (result) {
      let token = jwt.sign({ id: user.id }, jwtSecret, {
	expiresIn: '24h' // expires in 24 hours
      });
      res.status(200).json({user:{name:user.name,id:user.id},token:token});
    } else {
      res.status(403).send("Invalid credentials");
    }
    return;
  }).catch(error => {
    if (error.message !== 'abort') {
      console.log(error);
      res.status(500).json({ error });
    }
  });
});

//Get My User
app.get('/api/me', verifyToken, (req,res) => {
  knex('users').where('id',req.userID).first().select('name','id').then(user => {
    res.status(200).json({user:user});
  }).catch(error => {
    res.status(500).json({ error });
  });
});

// Registration //

app.post('/api/users', (req, res) => {
  if (!req.body.email || !req.body.password || !req.body.name)
    return res.status(400).send();
  knex('users').where('email',req.body.email).first().then(user => {
    if (user !== undefined) {
      res.status(403).send("Email address already exists");
      throw new Error('abort');
    }
    return bcrypt.hash(req.body.password, saltRounds);
  }).then(hash => {
    return knex('users').insert({email: req.body.email, hash: hash,
				 name:req.body.name});
  }).then(ids => {
    return knex('users').where('id',ids[0]).first().select('name','id');
  }).then(user => {
    let token = jwt.sign({ id: user.id }, jwtSecret, {
      expiresIn: '24h' // expires in 24 hours
    });
    res.status(200).json({user:user,token:token});
    return;
  }).catch(error => {
    if (error.message !== 'abort') {
      console.log(error);
      res.status(500).json({ error });
    }
  });
});

// Get Journal Entries
app.get('/api/users/:id/entries', (req, res) => {
  let id = parseInt(req.params.id);
  knex('users').join('entries','users.id','entries.user_id')
    .where('users.id',id)
    .orderBy('created','desc')
	.select('entry','name','created').then(tweets => {
	    console.log(tweets)
      res.status(200).json({tweets:tweets});
    }).catch(error => {
      console.log(error);
      res.status(500).json({ error });
    });
});

// Create Journal Entry

app.post('/api/users/:id/entries', (req, res) => {
    let id = parseInt(req.params.id);
    console.log("in add entry")
    knex('users').where('id',id).first().then(user => {
	console.log("found usee")
	console.log('id');
	console.log(id)
    return knex('entries').insert({user_id: id, entry:req.body.entry, created: new Date()});
  }).then(ids => {
      console.log("added Entry")
      return knex('entries').where('id',ids[0]).first();
  }).then(entry => {
      console.log(entry)
      res.status(200).json({entry: entry});
    return;
  }).catch(error => {
    console.log(error);
    res.status(500).json({ error });
  });
});


app.listen(9001, () => console.log('Server listening on port 9001!'));
