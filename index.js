const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const jsonfile = require('jsonfile');

const PORT = 3001;
const COMPONENTS_ROOT = '.';
const COMPONENTS_JSON = [COMPONENTS_ROOT, 'components.json'].join('/');

var app = express();

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.use(function (req, res, next) {
    console.log(req.originalUrl);
    next();
});

app.use(bodyParser.json());

app.use(express.static('./'));
app.use('/components', express.static(COMPONENTS_ROOT));

app.listen(PORT, function () {
    console.log('Backend listening on port ' + PORT + '\n');
});

app.get('/api/component/:id', function(req, res) {
    var mainFile = getMainFilePath(req.params.id);
    fs.readFile(mainFile, function(err, data) {
        if(err) {
            console.error(err);
        }
        res.send(data);
    });
});

app.put('/api/file', function (req, res) {
    var code = req.body.code;
    var filePath = req.body.filePath;
    console.log('Code:', code);
    console.log('File path:', filePath);
    jsonfile.readFile(COMPONENTS_JSON, function (err, obj) {
        if (err) {
            if(err.code === 'ENOENT') {
                obj = {};
            }
            else {
                console.error(err);
                return;
            }
        }
        if (obj && obj[filePath]) {
            console.warn("Warning: element '" + filePath + "' already exists");
        }
        obj[filePath] = filePath;
        jsonfile.writeFile(COMPONENTS_JSON, obj, function (err) {
            if(err) {
                console.error(err);
            }
        });
        fs.writeFile(filePath, code, function () {
            res.send({
                filePath: filePath,
                status: 'OK'
            });
        });
    });
});

function getMainFilePath(id) {
    var path = id.split('/');
    var filePath = COMPONENTS_ROOT + '/' + id + '/' + (path.length > 1 ? path[1] : id + '.html');
    console.log('filePath:', filePath);
    return filePath;
}