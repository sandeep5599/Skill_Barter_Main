const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const sessionRoutes = require('./routes/sessions');
const userRoutes = require('./routes/userRoutes')

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

connectDB();

app.use('/api/auth', authRoutes);
app.use('/api/sessions', sessionRoutes);
// app.use('/api/points', require('./routes/points'));
app.use('/api', userRoutes);
app.use('/api/skills', require('./routes/skills'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

