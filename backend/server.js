require('dotenv').config();
const express = require('express');
const cors = require('cors');
const classifyRoute = require('./routes/classify');
const sessionRoute = require('./routes/session');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/classify', classifyRoute);
app.use('/session', sessionRoute);

app.get('/', (req, res) => {
  res.send('FocusGuard backend is running.');
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`FocusGuard backend listening on port ${PORT}`);
});