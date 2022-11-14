const express = require('express')
const app = express()
const cors = require('cors')
const bodyParser = require('body-parser')
require('dotenv').config()
const mongoose = require('mongoose');
const { User } = require('./schema')(mongoose)

const MONGO_URI = process.env.MONGO_URI;
mongoose.connect(MONGO_URI);

app.use(cors())
app.use(express.static('public'))
app.use(bodyParser.urlencoded({extended: true}))

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.post('/api/users', (req, res) => {
  let user = new User(req.body);
  user.save(function(err, data) {
    if(err) {
      return res.status(500).json({err: 'error adding user'})
    }
    res.json(data);
  })
});

app.get('/api/users', (req, res) => {
  User.find(function(err, data) {
    if(err) {
      return res.status(500).json({err: 'error loading users'})
    }
    res.json(data);
  });
});

app.post('/api/users/:_id/exercises', (req, res) => {
  const {description, duration, date} = req.body;
  const userId = req.params._id;
  User.findById(req.params._id, function(err, data) {
    if(err) {
      return res.status(500).json({err: 'error loading user: ' + userId})
    }
    data.exercises.push({
      description: description,
      duration: duration,
      date: date ? new Date(date).toDateString() : new Date().toDateString(),
    })
    
    data.save(function(err, exercisesData) {
      if(err) {
        return res.status(500).json({err: 'error adding user detail'})
      }
      let last = exercisesData.exercises[exercisesData.exercises.length - 1];
      return res.json({
        _id: exercisesData._id,
        username: exercisesData.username,
        description: last.description,
        duration: last.duration,
        date: last.date
      });
    })
  });
});

app.get('/api/users/:_id/logs', (req, res) => {
  const userId = req.params._id;
  const {from, to, limit} = req.query;

  User.findById(userId, function(err, data) {
    if(err) {
      return res.status(500).json({err: 'error loading user: ' + userId})
    }

    
    return res.json({
      _id: data._id,
      username: data.username,
      count: data.exercises.length,
      log: data.exercises
         //.filter(filterFromTo(new Date(from), new Date(to)))
        .map(item => ({
        description: item.description,
        duration: item.duration,
        date: item.date
      })).slice(0, limit || data.exercises.length)
    });    
  });
});

function filterFromTo(from, to) {
  return function(item) {
    
    let d = new Date(item.date) 
    return d >= from && d <= to;
  };
}



const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
