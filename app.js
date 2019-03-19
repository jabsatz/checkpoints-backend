const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const markers = require('./api/markers');

const app = express();

app.use(bodyParser.json());

app.use(cors());

app.use('/markers', markers);

module.exports = app;
