//Connecting to postgres on heroku
const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  // ssl: true,
});

client.connect(err => {
  if (err) {
    console.error('database connection error', err.stack)
  } else {
    console.log('database connected')
  }
});


// Accessors

// saves newly registered users
exports.saveToken = function (userId, token) {
    // db.users[userId] = token;

   	client.query('INSERT INTO public.flock_users(userid, flock_token) VALUES($1, $2)', [userId, token], (err,response) => {
   		if(err){
   			throw err;
   		}
   		console.log('Creating user', response);
   	});
};

// Removes all user info from db as he is going away
exports.deleteToken = function (userId) {
   	client.query('DELETE FROM public.flock_users WHERE userid=$1', [userId], (err,response) => {
   		if(err){
   			throw err;
   		}
   		console.log('Deleting user', response);
   	});
};


// gets token of a registered user
exports.getToken = function (userId) {
    // return db.users[userId];
};


exports.peekAlarm = function () {
    // if (db.alarms.length > 0) {
    //     return db.alarms[0];
    // } else {
    //     return null;
    // }
};

// Deletes a sent meaasge
exports.removeAlarm = function (alarm) {
    // var index = db.alarms.indexOf(alarm);
    // if (index !== -1) {
    //     db.alarms.splice(index, 1);
    // }
};

// Saves a message to be sent
exports.addAlarm = function (alarm) {
    // var alarms = db.alarms;
    // var insertAt = Math.max(0, alarms.findIndex(function (x) {
    //     return alarm.time < x.time;
    // }));
    // alarms.splice(insertAt, 0, alarm);
};

// Sends back all meesages of a particular user just for viewing
exports.userAlarms = function (userId) {
    // return db.alarms.filter(function (alarm) {
    //     return alarm.userId === userId;
    // });
};

// Send back all alarams of all users
exports.allAlarms = function () {
    // return db.alarms;
};

