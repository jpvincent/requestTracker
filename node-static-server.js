
const express = require('express')
const app = express()

app.use(express.static('./'))

app.listen(2889, _ => console.log('server opened on port 2889'))
