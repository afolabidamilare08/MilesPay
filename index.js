const express = require("express");
const app = express();
const morgan = require('morgan');
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const cors = require('cors')
const cloudinary = require('cloudinary').v2

cloudinary.config({
  secure: true,
  cloud_name:"dksqvivvi",
  api_key:"887119742253941",
  api_secret:"b0JWnPpZHdNTXdun43MRAVHUsMU"
})

dotenv.config();
app.use(express.json())

const authRouter = require('./routes/auth');
const bankRouter = require('./routes/banks');
const bugRouter = require('./routes/report_bug');
const cryptoRouter = require('./routes/crypto');
const cryptoOrderRouter = require('./routes/crypto_order');
const GiftcardRouter = require('./routes/Giftcard');
const GiftcardOrderRouter = require('./routes/Giftcard_order');

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

app.use('/', bankRouter)
app.use('/auth',authRouter)
app.use('/banks',bankRouter)
app.use('/bug',bugRouter)
app.use('/crypto',cryptoRouter)
app.use('/crypto_order',cryptoOrderRouter)
app.use('/gift_card',GiftcardRouter)
app.use('/gift_order',GiftcardOrderRouter)


const PORT = process.env.PORT || 5005;

app.listen(PORT, () => console.log(`Server is listening on port ${PORT}...`));