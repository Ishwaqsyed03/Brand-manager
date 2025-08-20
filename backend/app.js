const express = require("express");
const cors = require("cors");
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Example route
app.get("/", (req, res) => {
  res.send("Steward Labs API is working ✅");
});

//auth routes
const authRoutes = require("./routes/authRoutes");
app.use("/auth", authRoutes);

//post routes
const postRoutes = require("./routes/postRoutes");
app.use("/post", postRoutes);

// ai routes
const aiRoutes = require('./routes/aiRoutes');
app.use('/ai', aiRoutes);

// storytelling routes
const storyRoutes = require('./routes/storyRoutes');
app.use('/story', storyRoutes);

// analytics routes
const analyticsRoutes = require('./routes/analyticsRoutes');
app.use('/analytics', analyticsRoutes);

// upload routes
const uploadRoutes = require('./routes/uploadRoutes');
app.use('/upload', uploadRoutes);

// oauth routes (gateway-style)
const oauthRoutes = require('./routes/oauthRoutes');
app.use('/', oauthRoutes);



module.exports = app;
