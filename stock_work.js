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

/*---------------------------- Set Path ในการดึงข้อมูลต่าง ๆ เวลาที่เราเปิดหน้า index เช่น รูป เป็นต้น --------------------*/
app.set('view engine', 'ejs'); //Set template engine
app.set('views','./stock'); //ใช้ในการอ้าง path หรือ floder ของ view โดยที่ต้องตรวจสอบให้ดีว่า ชื่อ folder ใน code กับ ชื่อ folder จริงมันตรงกัน
app.use(express.static(path.join(__dirname,'/stock'))); //กำหนดให้ path วิ้งไปที่ stock

app.get('/', function(req,res){
    
    var dummy_products = []; //Set ตัวแปร dummy_product เป็น array

    for(var i=0; i<100; i++){
        dummy_products.push({id: i, image: "/images/dolls.png", title:"ชื่อสินค้า", description: "รายละเอียด", prince: 1000, stock: 100})
    }
    console.log(JSON.stringify(dummy_products));
    res.render("index",{header:  'Stock Workshop',topics: "Stock Workshop", products: dummy_products});
});

//เมื่อมีการเรียกหน้า add จะมีการ inject code ลงในหน้า add.ejs ด้วย
app.get('/add', function(req,res){
    res.render("add",{header:  'Create Products', topics: "บันทึกข้อมูล"});
});

app.post('/api/add', function(req, res){
    try{
        var form = new formidable.IncomingForm();
        var newname = Date.now();
        form.parse(req, function (err, fields, files){
            console.log("Files: "+JSON.stringify(files));
            console.log("Fields: "+JSON.stringify(fields));

            /*var oldpath = files.exampleInputFile.path;
            var fileName = newname.toString()+"."+files.*/
        });
    } catch(err){
        console.log("err: "+err);
        res.json(err);
    }
});

var server = app.listen(3000, function(){
    var host =server.address().address;
    var port = server.address().port;
    console.log("Listen at http://%s:%s", host, port);
});