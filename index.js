const express = require('express');
const fs = require('fs');

const PORT = 3001;
const COMPONENTS_ROOT = 'components';

var app = express();

app.use(function(req, res, next) {
    console.log(req.originalUrl);
    next();
});

app.use('/components', express.static(COMPONENTS_ROOT));

app.listen(PORT, function () {
    console.log('App listening on port ' + PORT + '!');
});
