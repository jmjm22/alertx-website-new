const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const morgan = require('morgan');
require('dotenv').config();

const app = express();

// הגדרות תצוגה
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// קבצים סטטיים
app.use(express.static(path.join(__dirname, 'public')));

// אמצעים
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// ראוטים
const mainRoutes = require('./routes/mainRoutes');
app.use('/', mainRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`AlertX server running on http://localhost:${PORT}`);
});

const apiRoutes = require('./routes/apiRoutes');
app.use('/api', apiRoutes);
