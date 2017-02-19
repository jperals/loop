const express = require('express');
const fs = require('fs-extra');
const bodyParser = require('body-parser');
const jsonfile = require('jsonfile');

const PORT = 3001;
const COMPONENTS_ROOT = './components';
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

app.listen(PORT, function () {
    console.log('Backend listening on port ' + PORT + '\n');
});

app.get('/api/components', function(req, res) {
    var dirs = [];
    fs.readdir(COMPONENTS_ROOT, function(err, fileNames) {
        for(let i = 0; i < fileNames.length; i++) {
            let fileName = fileNames[i];
            let filePath = [COMPONENTS_ROOT, fileName].join('/');
            if(fs.lstatSync(filePath).isDirectory() && isComponent(fileName)) {
                dirs.push({
                    name: fileName,
                    path: [filePath, fileName + '.html'].join('/')
                });
            }
        }
        res.json({
            data: {
                components: dirs
            }
        })
    });
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
    var filePathSplit = filePath.split('/');
    var dir = filePathSplit.splice(0, filePathSplit.length-1).join('/');
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
        fs.ensureDir(dir, function(err) {
            if(err) {
                res.status(500).send({ error: err });
                console.error(err);
            }
            else {
                fs.writeFile(filePath, code, function () {
                    res.send({
                        filePath: filePath,
                        status: 'OK'
                    });
                });
            }
        })
    });
});

app.put('/api/component', function (req, res) {
    var code = req.body.code;
    var filePath = getMainFilePath(req.body.componentId);
    var filePathSplit = filePath.split('/');
    var dir = filePathSplit.splice(0, filePathSplit.length-1).join('/');
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
        fs.ensureDir(dir, function(err) {
            if(err) {
                res.status(500).send({ error: err });
                console.error(err);
            }
            else {
                fs.writeFile(filePath, code, function () {
                    res.send({
                        filePath: filePath,
                        status: 'OK'
                    });
                });
            }
        })
    });
});

function getMainFilePath(id) {
    var path = id.split('/');
    var filePath = COMPONENTS_ROOT + '/' + id + '/' + (path.length > 1 ? path[1] : id + '.html');
    console.log('filePath:', filePath);
    return filePath;
}

function isComponent(dirName) {
    return true;
}