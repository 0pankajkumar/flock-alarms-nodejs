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
   		console.log('Creating user', response.rowCount > 0 ? 'succeeded' : 'failed');
   	});
   	// client.end()
};

// Removes all user info from db as he is going away
exports.deleteToken = function (userId) {
   	client.query('DELETE FROM public.flock_users WHERE userid=$1', [userId], (err,response) => {
   		if(err){
   			throw err;
   		}
   		console.log('Deleting user', response.rowCount > 0 ? 'succeeded' : 'failed');
   	});
   	// client.end()
};


// gets token of a registered user
exports.getToken = async function (userId) {
	console.log('received this iser id for getToken', userId);
    // return db.users[userId];

  return await new Promise((resolve, reject) => {
  	client.query('SELECT flock_token FROM public.flock_users WHERE userid=$1', [userId], (err,response) => {
   		if(err){
   			reject(err);
   			// throw err;
   		}
   		console.log('Got user token from DB & returned back for evaluation');
   		
   		resolve(response.rows[0].flock_token);
   	});

  });
};


// gets token of a registered user
exports.getScheduledMessages = async function (userId, token) {
  console.log('received this iser id for getScheduledMessages', userId);
  var splmsg = "Yikes";
  return await new Promise((resolve, reject) => {
    client.query('SELECT msg FROM public.postman WHERE fromid=$1', [userId], (err,response) => {
      if(err){
        reject(err);
      }
      console.log('Got all the scheduled meesages');
      
      resolve(response.rows);
    });

         // resolve(splmsg);
  });
};


// Saves a message to be sent
exports.addAlarm = function (alarm) {
    // var alarms = db.alarms;
    // var insertAt = Math.max(0, alarms.findIndex(function (x) {
    //     return alarm.time < x.time;
    // }));
    // alarms.splice(insertAt, 0, alarm);

    return new Promise((resolve, reject) => {
    	client.query('INSERT INTO public.postman(toid, fromid, msg, timeofsending) VALUES($1, $2, $3, to_timestamp($4)) RETURNING idx', 
	    	[alarm.toid, alarm.fromid, alarm.msg, alarm.timeOfSending], (err, response) => {
	    	if(err){
	    		reject(err);
	    		// throw err;
	    	}
	    	// console.log('Row',response.rows[0].idx,'added successfully');
	    	console.log('Alarm addition', response.rowCount > 0 ? 'succeeded' : 'failed');
	    	resolve(response.rows[0].idx);
	    });

    });


    
};


// Deletes a sent meaasge
exports.removeAlarm = function (alarm, idx) {
    // var index = db.alarms.indexOf(alarm);
    // if (index !== -1) {
    //     db.alarms.splice(index, 1);
    // }

    console.log('we received this',idx,'id for removing');
    client.query('DELETE FROM public.postman WHERE idx=$1', 
    	[idx], (err, response) => {
    	if(err){
    		throw err;
    	}
    	console.log('Alarm deletion', response.rowCount > 0 ? 'succeeded' : 'failed');
    });
};



// Sends back all meesages of a particular user just for viewing
exports.userAlarms = function (userId) {
    // return db.alarms.filter(function (alarm) {
    //     return alarm.userId === userId;
    // });

    client.query('SELECT * FROM public.postman WHERE fromid=$1', [userId], (err, res) => {
    	if(err){
    		throw err;
    	}
    	return res.rows.map(ele => {
    		return {
    			toid: ele.toid,
    			msg: ele.msg,
    			timeOfSending: ele.timeOfSending
    		};
    	});
    });
};

// Send back all alarams of all users
exports.allAlarms = function () {
    // return db.alarms;
};

