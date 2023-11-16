/*
Copyright 2017 - 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at
    http://aws.amazon.com/apache2.0/
or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and limitations under the License.
*/

const {calculateLayout} = require('./layoutCalculator')
const express = require('express')
const bodyParser = require('body-parser')
const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware')

// declare a new express app
const app = express()
app.use(bodyParser.json())
app.use(awsServerlessExpressMiddleware.eventContext())

// Enable CORS for all methods
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', '*')
  next()
})

app.post('/calculateLayout', function (req, res) {
  console.log('event-start', req)
  const {nodes, edges, layoutName, boundingBox} = req.body
  console.log('event', req.body)
  calculateLayout({
    boundingBox,
    graph: {
      edges,
      nodes
    },
    layoutName
  })
    .then(result => {
      console.log('result', result)
      res.json(result)
    })
    .catch(error => {
      console.log('Error', error)
    })
})

// app.post('/calculateLayout/*', async function(req, res) {
//   res.json({success: 200, url: req.url});
// });
// app.get('/calculateLayout/*', async function(req, res) {
//   res.json({success: 200, url: req.url});
// });
// app.put('/calculateLayout/*', async function(req, res) {
//   res.json({success: 200, url: req.url});
// });
// app.delete('/calculateLayout/*', async function(req, res) {
//   res.json({success: 200, url: req.url});
// });

app.listen(3000, function () {
  console.log('App started')
})

// Export the app object. When executing the application local this does nothing. However,
// to port it to AWS Lambda we will create a wrapper around that will load the app from
// this file
module.exports = app
