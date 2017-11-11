'use strict'

const express = require('express')
const multiparty = require('connect-multiparty')
const spawn = require('child_process').spawn
const config = require('config.json')('./config.json')
const path = require('path')

// Create a new instance of express
const app = express()

// Tell express to use the multiparty middleware
app.use(multiparty())

// Route that receives a POST request to /
app.post('/', function (req, res) {
  const input_path = req.files.file.path
  const output_path = 
    path.join(path.dirname(input_path), 'pso_'+path.basename(input_path))
  console.log(JSON.stringify(req.files))
  console.log(input_path)
  var proc = spawn(config.pdfsizeopt, [input_path, output_path])
  proc.on('close', function (exitStatus) {
    switch (exitStatus) {
      case 0:
        console.log(`success: ${output_path}`)
        //res.set('Content-Type', 'application/pdf')
        res.sendFile(output_path)
        break
      default:
        console.log(`error: ${exitStatus}`)
        res.set('Content-Type', 'text/plain')
        res.send('error')
    }
  })
})

// Tell our app to listen on port 3000
app.listen(3000, function (err) {
  if (err) {
    throw err
  }

  console.log('Server started on port 3000')
})
