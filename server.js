const express = require("express");
const path=require('path');
const cors = require('cors');
const axios = require("axios");
const video=require('./routes/video');
const bodyParser= require("body-parser");
require('dotenv').config();

const app=express();
const port= process.env.PORT;
const mongoose = require("mongoose");
const connect = mongoose.connect(process.env.MONGODBURI,
  {
    useNewUrlParser: true, useUnifiedTopology: true,
    useCreateIndex: true, useFindAndModify: false
  })
  .then(() => console.log('MongoDB Connected...'))
  .catch(err => console.log(err));

app.use(cors())

app.use(bodyParser.urlencoded({ extended: true }));

app.use(bodyParser.json());


app.use('/uploads', express.static('uploads'));



app.use(express.json({extended:false}));


app.use("/api/auth",require("./routes/auth"));
app.use('/api/media', video);



app.listen(port,() => console.log(`Server started at ${port}`));