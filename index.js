const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const jsonfile = require('jsonfile');

const PORT = 3001;
const COMPONENTS_ROOT = 'components';
const COMPONENTS_JSON = 'components/components.json';

var app = express();

app.use(function (req, res, next) {
    console.log(req.originalUrl);
    next();
});

app.use(bodyParser.json());

app.use(express.static('./'));
app.use('/components', express.static(COMPONENTS_ROOT));

app.listen(PORT, function () {
    console.log('App listening on port ' + PORT + '!');
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

app.put('/api/component', function (req, res) {
    var code = req.body.code;
    var componentId = req.body.componentId;
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
        if (obj && obj[componentId]) {
            console.warn("Warning: element '" + componentId + "' already exists");
        }
        obj[componentId] = componentId;
        jsonfile.writeFile(COMPONENTS_JSON, obj, function (err) {
            if(err) {
                console.error(err);
            }
        });
        var newDir = COMPONENTS_ROOT + '/' + componentId;
        fs.mkdir(newDir, function (err) {
            if(err && err.code !== 'EEXIST') {
                console.error(err);
                return;
            }
            fs.writeFile(getMainFilePath(componentId), code, function () {
                res.send({
                    componentId: req.params.componentId,
                    status: 'OK'
                });
            })
        });
    });
});

function getMainFilePath(id) {
    var path = id.split('/');
    var filePath = COMPONENTS_ROOT + '/' + id + '/' + (path.length > 1 ? path[1] : id + '.html');
    console.log('filePath:', filePath);
    return filePath;
}