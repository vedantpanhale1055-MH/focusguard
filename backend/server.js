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

const exitCheckRoutes = require("./routes/exitCheck");
app.use("/exit-check", exitCheckRoutes);

const analysisRoutes = require("./routes/analysis");
app.use("/analysis", analysisRoutes);

app.get('/', (req, res) => {
  res.send('FocusGuard backend is running.');
});

const PORT = process.env.PORT || 3001;

// Only listen locally when run directly (node server.js).
// Vercel's serverless runtime imports `app` instead of calling listen().
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`FocusGuard backend listening on port ${PORT}`);
  });
}

module.exports = app;