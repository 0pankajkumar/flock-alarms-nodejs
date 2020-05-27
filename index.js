var config = require('./config.js');
var flock = require('flockos');
var express = require('express');
var store = require('./store.js');
var chrono = require('chrono-node');
var Mustache = require('mustache');
var fs = require('fs');
var util = require('util');
var helper = require('./helper');

flock.appId = config.appId || process.env.appId;
flock.appSecret = config.appSecret || process.env.appSecret;

var app = express();
// var router = express.Router();

var cors = require('cors');
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use(flock.events.tokenVerifier);
app.post('/events', flock.events.listener);

app.use(express.static('public'));

app.get('/getWebpage', (req, res) => {
    res.set('Content-Type', 'text/html');
    var body = Mustache.render(listTemplate, { alarms: '' });
    res.send(body);
});

app.get('/getContacts', (req, res) => {
    res.set('Content-Type', 'json');
    var body = helper.getContacts('76e5d594-9b7c-465d-bd19-8d43e675c886')
    res.send(body);
});










app.listen(process.env.PORT || 8080, function () {
    console.log('Listening on 8080');
});

flock.events.on('app.install', function (event, callback) {
    store.saveToken(event.userId, event.token);
    callback();
});

flock.events.on('client.slashCommand', function (event, callback) {
    var r = parseDate(event.text);
    console.log('parse result', r);
    if (r) {
        var alarm = {
            userId: event.userId,
            time: r.date.getTime(),
            text: event.text.slice(r.end).trim()
        };
        console.log('adding alarm', alarm);
        addAlarm(alarm);
        callback(null, { text: 'Alarm added' });
    } else {
        callback(null, { text: 'Alarm time not specified' });
    }
});

var parseDate = function (text) {
    var r = chrono.parse(text);
    if (r && r.length > 0) {
        return {
            date: r[0].start.date(),
            start: r[0].index,
            end: r[0].index + r[0].text.length
        };
    } else {
        return null;
    }
};

var addAlarm = function (alarm) {
    store.addAlarm(alarm);
    scheduleAlarm(alarm);
};

var scheduleAlarm = function (alarm) {
    var delay = Math.max(0, alarm.time - new Date().getTime());
    setTimeout(function () {
        sendAlarm(alarm);
        store.removeAlarm(alarm);
    }, delay);
};

// schedule all alarms saved in db
store.allAlarms().forEach(scheduleAlarm);

var sendAlarm = function (alarm) {
    flock.chat.sendMessage(config.botToken || process.env.botToken, {
        to: alarm.userId,
        text: alarm.text
    });
};

var listTemplate = fs.readFileSync('list.mustache.html', 'utf8');
app.get('/list', function (req, res) {
    var event = JSON.parse(req.query.flockEvent);
    var alarms = store.userAlarms(event.userId).map(function (alarm) {
        return {
            text: alarm.text,
            timeString: new Date(alarm.time).toLocaleString()
        }
    });

    var currentToken = store.getToken(event.userId);
    console.log("Current token is ",currentToken);


    res.set('Content-Type', 'text/html');
    var body = Mustache.render(listTemplate, { alarms: alarms });
    res.send(body);
});

flock.events.on('client.messageAction', function (event, callback) {
    var messages = event.messages;
    if (!(messages && messages.length > 0)) {
        console.log('chat', event.chat);
        console.log('uids', event.messageUids);
        console.log('token', store.getToken(event.userId));
        flock.chat.fetchMessages(store.getToken(event.userId), {
            chat: event.chat,
            uids: event.messageUids
        }, function (error, messages) {
            if (error) {
                console.warn('Got error');
                callback(error);
            } else {
                setAlarms(messages);
            }
        });
    } else {
        setAlarms(messages);
    }
    var setAlarms = function (messages) {
        var alarms = messages.map(function (message) {
            var parsed = parseDate(message.text);
            if (parsed) {
                return {
                    userId: event.userId,
                    time: parsed.date.getTime(),
                    text: util.format('In %s: %s', event.chatName, message.text)
                }
            } else {
                return null;
            }
        }).filter(function (alarm) {
            return alarm !== null;
        });
        if (alarms.length > 0) {
            alarms.forEach(addAlarm);
            callback(null, { text: util.format('%d alarm(s) added', alarms.length) });
        } else {
            callback(null, { text: 'No alarms found' });
        }
    };
});
