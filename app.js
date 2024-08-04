const express = require('express')
const connection = require('./db-config')
const imageRoutes = require('./routes/image');
const app = express()
const cors = require('cors')
const morgan = require('morgan')
const routes = require('./routes/index')

const port = process.env.PORT || 5000
app.use(express.json())

const connectToDatabase = () => {
  connection.connect(err => {
    if (err) {
      console.error('Error connecting to the database:', err.stack);
      setTimeout(connectToDatabase, 2000); // Reconnect after 2 seconds
    } else {
      console.log('Connected to the database as id', connection.threadId);
    }
  });

  connection.on('error', function (err) {
    console.error('Database error', err);
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
      connectToDatabase();  // Reconnect if the connection is lost
    } else {
      throw err;
    }
  });
};

connectToDatabase();

const allowedOrigins = ['http://www.dabicorn.konecton.com', 'https://www.dabicorn.konecton.com', 'http://dabicorn.konecton.com', 'https://dabicorn.konecton.com']

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('UnauthorizedError'))
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true, // Si vous utilisez des cookies ou des sessions
  optionsSuccessStatus: 200
}

app.use(cors(corsOptions))

app.use(morgan('tiny'))
app.use(express.urlencoded({ extended: true }))

app.use('/hero', routes.hero)
app.use('/image', imageRoutes)
app.use('/sound', routes.sound)

app.listen(port, () => {
  console.log(`Server listening on port ${port}`)
})

app.use((err, req, res, next) => {
  if (err.name === 'UnauthorizedError') {
    res.status(403).json({ error: 'Unauthorized' });
  } else {
    next(err);
  }
});