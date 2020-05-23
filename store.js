'use strict';

var fs = require('fs');
var https = require('https');
var dbFile = 'db.json';

// Everything is stored here

var db = {
    users: {},
    alarms: []
};

// Read db file on startup and save on exit

var readDatabase = function () {
    try {
        var stringContent = fs.readFileSync(dbFile);
        db = JSON.parse(stringContent);
    } catch (e) {
        console.log('No db found, creating %s', dbFile);
    }
};

var saveDatabase = function () {
    console.log('Saving db');
    var stringContent = JSON.stringify(db);
    fs.writeFileSync(dbFile, stringContent);
};

readDatabase();
process.on('SIGINT', function () { console.log('SIGINT'); process.exit(); });
process.on('SIGTERM', function () { console.log('SIGTERM'); process.exit(); });
process.on('exit', saveDatabase);

// Accessors

exports.getToken = function (userId) {
    return db.users[userId];
};

exports.saveToken = function (userId, token) {
    db.users[userId] = token;
};

exports.peekAlarm = function () {
    if (db.alarms.length > 0) {
        return db.alarms[0];
    } else {
        return null;
    }
};

exports.removeAlarm = function (alarm) {
    var index = db.alarms.indexOf(alarm);
    if (index !== -1) {
        db.alarms.splice(index, 1);
    }
};

exports.addAlarm = function (alarm) {
    var alarms = db.alarms;
    var insertAt = Math.max(0, alarms.findIndex(function (x) {
        return alarm.time < x.time;
    }));
    alarms.splice(insertAt, 0, alarm);
};

exports.userAlarms = function (userId) {
    return db.alarms.filter(function (alarm) {
        return alarm.userId === userId;
    });
};

exports.allAlarms = function () {
    return db.alarms;
};

exports.getAllFriends = (currentToken) => {
    https.get('https://api.flock.co/v1/roster.listContacts?token='+currentToken, (resp) => {
        let data = "";
        resp.on('data', (chunk) => {
            data += chunk;
        });
        resp.on('end', () => {
            let ans = JSON.parse(data).explanation;
            console.log(ans);
            return ans;
        });
    }).on("error", (err) => {
      console.log("Errorrrrrrrrrrrrrrrrr: " + err.message);
    });
};
