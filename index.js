'use strict'

const express = require('express')
const multiparty = require('connect-multiparty')
const spawn = require('child_process').spawn
const config = require('config.json')('./config.json')
const path = require('path')
const fs = require('fs')

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
        console.log(`pdfsizeopt success: ${output_path}`)
        res.sendFile(output_path, function (err) {
          // clean up after ourselves if the file was transferred successfully
          if (!err) {
            fs.unlink(input_path, function (err) {})
            fs.unlink(output_path, function (err) {})
          } else {
            // keeping files around bc transfer error
            console.log(`transfer error; keeping ${input_path} and ${output_path}`)
          }
        })
        break
      default:
        console.log(`pdfsizeopt error with ${input_path} -> ${output_path}: ${exitStatus}`)
        res.set('Content-Type', 'text/plain')
        res.send('error')
    }
  })
})

// Tell our app to listen
app.listen(config.port, function (err) {
  if (err) {
    throw err
  }

  console.log(`Server started on port ${config.port}`)
})
