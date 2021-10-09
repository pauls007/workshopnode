const express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var sqlite3 =require('sqlite3');
var helpers = require('express-helpers');
var formidable =require('formidable'); //upload รูปภาพ
var fs = require("fs"); //file systems
//const { render } = require('pug');


var app = express();
helpers(app);

app.use(express.urlencoded({
    extended: true
}));

app.set('view engine', 'ejs'); //Set template engine
app.set('views','./stock'); //ใช้ในการอ้าง path หรือ floder ของ view โดยที่ต้องตรวจสอบให้ดีว่า ชื่อ folder ใน code กับ ชื่อ folder จริงมันตรงกัน
app.use(express.static(path.join(__dirname,'/stock'))); //กำหนดให้ path วิ้งไปที่ stock

app.get('/', function(req,res){
    res.render("index",{header:  'Stock Workshop',topics: "Stock Workshop"});
});

var server = app.listen(3000, function(){
    var host =server.address().address;
    var port = server.address().port;
    console.log("Listen at http://%s:%s", host, port);
});