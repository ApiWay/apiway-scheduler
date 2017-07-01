var bunyan = require('bunyan')
var schedule = require('node-schedule');
var HashMap = require('hashmap');
var map = new HashMap();

let log = bunyan.createLogger({name:'scheduler'})


function dispatch (topic, message) {

  let service = topic.split("/")[1]

  if (service == 'schedule') {
    //do something
  }
}

function createJob (data) {
// var j = schedule.scheduleJob('42 * * * *', function(){
//   console.log('The answer to life, the universe, and everything!');
// });
}

function deleteJob (data) {

}

function updateJob (data) {

}

function updateSchedule () {
  //Sav
}




exports.dispatch = dispatch