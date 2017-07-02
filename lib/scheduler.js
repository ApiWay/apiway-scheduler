var bunyan = require('bunyan')
var scheduler = require('node-schedule');
var HashMap = require('hashmap');
var map = new HashMap();
var ApiWay  = require('apiway.js')
let aw = new ApiWay({});
let awSchedule = aw.getSchedule();
let awScheduler = aw.getScheduler();
let awInstance = aw.getInstance();

let log = bunyan.createLogger({name:'scheduler'})

let schedulerId = process.env.schedulerId ? process.env.schedulerId : "59590f800c4e7d000f9de44e"
exports.bootstrap = function () {
  awScheduler.getScheduler(schedulerId).then((res) => {
    // console.log(res.data.data)
    let schedules = res.data.data.schedules
    schedules.forEach(schedule => {
      createJob(schedule)
    })
  })
}


function dispatch (topic, message) {

  let target = topic.split("/")[2]

  if (target == 'schedule') {
    console.log(message)
  }
}

function createJob (scheduleId) {
  awSchedule.getSchedule(scheduleId)
    .then((res) => {
      let schedule = res.data.data
      let j = scheduler.scheduleJob(schedule.cron, function() {
        console.log(schedule._id)
        console.log(schedule.cron)
        createInstance(schedule.projectId)
      })
      setActiveSchedule(schedule)
      map.set(scheduleId, j)
    })
}

function setActiveSchedule (schedule) {
  awSchedule.updateState(schedule._id, "active")
}

function createInstance (projectId) {
  let options = {
    projectId: projectId
  }
  awInstance.addInstance(options)
    .then((res) => {
      console.log('addInstance done')
      // console.log(res.data)
    })
}

function cancelJob (scheduleId) {
  let job = map.get(scheduleId)
  job.cancel()
}

function updateJob (data) {

}

function updateSchedule () {
  //Sav
}




exports.dispatch = dispatch