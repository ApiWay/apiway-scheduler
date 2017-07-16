var bunyan = require('bunyan')
var scheduler = require('node-schedule');
var HashMap = require('hashmap');
var spawn = require('child_process').spawn
var map = new HashMap();
var ApiWay  = require('apiway-sdk-js')
let aw = new ApiWay({});
let awSchedule = aw.getSchedule();
let awScheduler = aw.getScheduler();
let awInstance = aw.getInstance();

let log = bunyan.createLogger({name:'scheduler'})

let schedulerId = process.env.schedulerId ? process.env.schedulerId : "59590f800c4e7d000f9de44e"

function bootstrap () {
  console.log('bootstrap')
  console.log(schedulerId)
  awScheduler.getScheduler(schedulerId).then((res) => {
    console.log(res.data.data)
    let schedules = res.data.data.schedules
    schedules.forEach(scheduleId => {
      createSchedule(scheduleId)
    })
  })
}

function dispatch (topic, message) {
  console.log(topic)
  console.log(message)

  let obj = JSON.parse(message)

  let topicArray = topic.split("/")

  if (topicArray[1] == 'scheduler') {
    if (topicArray[2] == 'create') {
      createSchedule(obj)
    } else if (topicArray[2] == 'update') {

    } else if (topicArray[2] == 'delete') {
      deleteSchedule(obj)
    } else if (topicArray[2] == 'kill') {
      kill(obj)
    }
  }
  console.log(message)
}

function createSchedule (scheduleId) {
  console.log('createSchedule')
  awSchedule.getSchedule(scheduleId)
    .then((schedule) => {
      let j = scheduler.scheduleJob(schedule.cron, function() {
        console.log(schedule._id)
        console.log(schedule.cron)
        createInstance(schedule.projectId)
      })
      map.set(scheduleId, j)
    })
  setActiveSchedule(scheduleId)
}

function setActiveSchedule (scheduleId) {
  console.log('setActiveSchedule: ' + scheduleId)
  awSchedule.updateState(scheduleId, "active")
}

function setInactiveSchedule (scheduleId) {
  console.log('setInactiveSchedule: ' + scheduleId)
function createSchedule (schedule) {
  console.log('createJob')
  let j = scheduler.scheduleJob(schedule.cron, function() {
    console.log(schedule._id)
    console.log(schedule.cron)
    createInstance(schedule.projectId)
  })
  setActiveSchedule(schedule._id)
  map.set(schedule._id, j)
  // awSchedule.getSchedule(schedule._id)
  //   .then((res) => {
  //     let schedule = res.data.data
  //     let j = scheduler.scheduleJob(schedule.cron, function() {
  //       console.log(schedule._id)
  //       console.log(schedule.cron)
  //       createInstance(schedule.projectId)
  //     })
  //     setActiveSchedule(schedule)
  //     map.set(scheduleId, j)
  //   })
}

function deleteSchedule (schedule) {
  cancelJob(schedule._id)
}

function setActiveSchedule (scheduleId) {
  awSchedule.updateState(scheduleId, "active")
}

function setInactiveSchedule (scheduleId) {
  awSchedule.updateState(scheduleId, "inactive")
    .then((res) => {
      console.log(res)
    }).catch(err => {
      console.error(err)
  })
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
}

function setInactiveAll () {
  map.forEach(function(value, key) {
    console.log(key + " : " + value);
    setInactiveSchedule(key)
  });
}

function gracefullExit () {
  console.log('gracefullExit')
  setInactiveAll()
}

function kill(data) {

  return new Promise((resolve, reject) => {
    let cmd = `kubectl delete pods -l schedulerId=${process.env.schedulerId}`
    runInBash(cmd, (err) => {
      if (err) {
        console.log('kill error : ' + err)
        reject(err)
      } else {
        console.log('kill done')
        resolve()
      }
    })
  })
}

function runInBash(cmd, cb) {
  // Would love to create a pseudo terminal here (pty), but don't have permissions in Lambda
  /*
   var proc = require('pty.js').spawn('/bin/bash', ['-c', config.cmd], {
   name: 'xterm-256color',
   cwd: cloneDir,
   env: env,
   })
   proc.socket.setEncoding(null)
   if (proc.socket._readableState) {
   delete proc.socket._readableState.decoder
   delete proc.socket._readableState.encoding
   }
   */
  // var logCmd = opts.logCmd || cmd
  // delete opts.logCmd

  // log.info(`$ ${logCmd}`)
  // var proc = spawn('/bin/bash', ['-c', cmd ], opts)
  var proc = spawn('/bin/bash', ['-c', cmd ])
  // proc.on('error', cb)
  proc.on('error', function (err) {
    console.log(err)
    cb(err);
  });

  proc.on('close', function(code) {
    var err
    if (code) {
      err = new Error(`Command "${cmd}" failed with code ${code}`)
      err.code = code
    }
    cb(err)
  })
}

exports.gracefullExit = gracefullExit
exports.dispatch = dispatch
exports.bootstrap = bootstrap
