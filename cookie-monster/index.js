const express = require('express')
const https = require('https')
const fs = require('fs')

const app = express()

const HTTP_PORT = process.env.HTTP_PORT || 4080
const HTTPS_PORT = process.env.HTTPS_PORT || 4443

const cookieParser = require('cookie-parser')

app.use(cookieParser())

app.get('/set-cookie', (req, res) => {
  Object.keys(req.query).forEach(key => res.cookie(key, req.query[key], { secure: req.secure }))
  res.send(req.cookies)
})
app.get('/get-cookie', (req, res) => {
  res.send(req.cookies)
})

app.listen(HTTP_PORT, () => {
  console.log(`Cookie Monster listening on http ${HTTP_PORT}`)
})

const server = https.createServer({
  key: fs.readFileSync('./key.pem'),
  cert: fs.readFileSync('./cert.pem')
}, app)

server.listen(HTTPS_PORT, () => {
  console.log(`Cookie Monster listening on https ${HTTPS_PORT}`)
})