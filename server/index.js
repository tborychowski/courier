require('dotenv').config();

const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const {logger, isDev} = require('./lib');
const app = express();
const api = require('./api/');
const port = process.env.PORT || 3000;

function sendView (res, view) {
	res.sendFile(view, { root: __dirname });
}

function rootPath (req, res) {
	if (req.path.substr(1)) return res.redirect('/');
	sendView(res, 'index.html');
}


if (isDev) app.use(require('connect-livereload')());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use('/api/', api);
app.use('/', express.static(path.join(__dirname, '..', 'public')));
app.use('/', rootPath);

logger.info('--- STARTING -----------------------------------------------------');
app.listen(port, () => logger.info('Server started: http://localhost:' + port));
