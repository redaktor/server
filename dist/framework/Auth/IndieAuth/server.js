"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const path = require("path");
const router_1 = require("./router");
const Template_1 = require("../../Template");
const basePath = '../../../';
var app = express();
app.engine('html', Template_1.render);
app.set('view engine', 'html');
app.set('views', path.resolve(__dirname, basePath + 'views/IndieAuth'));
app.use(express.static(path.resolve(__dirname, basePath)));
app.use(express.static(path.resolve(__dirname, basePath + 'assets')));
app.use(express.static(path.resolve(__dirname, basePath + 'node_modules')));
app.use(router_1.default);
app.listen(5000);
//# sourceMappingURL=server.js.map