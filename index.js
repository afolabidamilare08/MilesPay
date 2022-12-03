const express = require("express");
const app = express();
const morgan = require('morgan');
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const cors = require('cors')
// const cloudinary = require('cloudinary').v2

dotenv.config();
app.use(express.json())

const authRouter = require('./routes/auth');
const bankRouter = require('./routes/banks');

app.use(
    cors({
      origin: "*",
      method: '*',
      credentials: true
    })
  )
  
  
  if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
  }

  
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true })
const connection = mongoose.connection;


connection.once('open', () => {
  console.log('MongoDB database was able to connect successfully')
})

app.use('/auth',authRouter)
app.use('/banks',bankRouter)


const PORT = process.env.PORT || 5005;

app.listen(PORT, () => console.log(`Server is listening on port ${PORT}...`));