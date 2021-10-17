const express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var sqlite3 =require('sqlite3');
var helpers = require('express-helpers');
var formidable =require('formidable'); //upload รูปภาพ
var fs = require('fs'); //file systems
var proid;
//const { render } = require('pug');


var app = express();
helpers(app);

app.use(express.urlencoded({
    extended: true
}));

/*---------------------------- Set Path ในการดึงข้อมูลต่าง ๆ เวลาที่เราเปิดหน้า index เช่น รูป เป็นต้น --------------------*/
app.set('view engine', 'ejs'); //Set template engine
app.set('views','./stock'); //ใช้ในการอ้าง path หรือ floder ของ view โดยที่ต้องตรวจสอบให้ดีว่า ชื่อ folder ใน code กับ ชื่อ folder จริงมันตรงกัน
app.use(express.static(path.join(__dirname,'/stock'))); //กำหนดให้ path วิ่งไปที่ stock เพื่อที่จะดึงข้อมูลพวก theme, add.ejs, index.ejs ขึ้นมา

app.get('/', function(req,res){
    /*
    var dummy_products = []; //Set ตัวแปร dummy_product เป็น array

    for(var i=0; i<100; i++){
        dummy_products.push({id: i, image: "/images/dolls.png", title:"ชื่อสินค้า", description: "รายละเอียด", prince: 1000, stock: 100})
    }
    console.log(JSON.stringify(dummy_products));
    res.render("index",{header:  'Stock Workshop',topics: "Stock Workshop", products: dummy_products});
    */
   querydb(function(results){
    res.render("index",{header:  'Stock Workshop',topics: "Stock Workshop", edits: 'Edit Products', products: results});
   });
    
});

//เมื่อมีการเรียกหน้า add จะมีการ inject code ลงในหน้า add.ejs ด้วย
app.get('/add', function(req,res){
    res.render("add",{header:  'Create Products', topics: "บันทึกข้อมูล"});
});

app.get('/edit',function(req, res){
    proid = req.query.id;
    QueryById(req.query.id, function (row) {
        res.render("edit", { header: "Edit Product", item: row })
    })   
});


app.post('/api/update',function(req, res){
    try{
        var form = new formidable.IncomingForm();
        var newname = Date.now();

        form.parse(req, function (err, fields, files){
            if (files.exampleInputFile.size !=0){

                var oldpath = files.exampleInputFile.path;
                //var fileName = newname.toString()+"."+files.exampleInputFile.name.split('.').pop();
                //var newpath = path.join(__dirname, "stock/images/" +fileName); //กำหนด path ให้รูปมาลงใน stock/images
                var newpath = path.join(__dirname, "stock/images/" +fields.image); //กำหนด path ให้รูปมาลงใน stock/images

                fs.rename(oldpath, newpath, function(err){
                    if(err) throw err;
                    console.log("Update file Successfully");
                });
    
            }

            var data = {
                id: fields.id,
                title: fields.title,
                description: fields.description,
                prince: fields.prince,
                stock: fields.stock,
                //image: fileName
                }
                    //res.end("Insert Data: "+ JSON.stringify(data));
            updateData(data)
            res.redirect('/');

        });
    } catch(err){
        console.log("err: "+err);
        res.json(err);
    }
});

app.post('/api/add', function(req, res){
    try{
        var form = new formidable.IncomingForm();
        var newname = Date.now();
        form.parse(req, function (err, fields, files){

            var oldpath = files.exampleInputFile.path;
            var fileName = newname.toString()+"."+files.exampleInputFile.name.split('.').pop();
            var newpath = path.join(__dirname, "stock/images/" +fileName); //กำหนด path ให้รูปมาลงใน stock/images

            fs.rename(oldpath, newpath, function(err){
                if(err) throw err;

                var data = {
                    title: fields.title,
                    description: fields.description,
                    prince: fields.prince,
                    stock: fields.stock,
                    image: fileName
                }
                //res.end("Insert Data: "+ JSON.stringify(data));
                insertData(data)
                res.redirect('/');
            });
        });
    } catch(err){
        console.log("err: "+err);
        res.json(err);
    }
});

app.get('/api/delete', function(req, res){
    deletedata(req.query.id, function(){
        res.redirect('/');
    });
});

function deletedata(id, callback){
    let db = opendb();

    const sql = `Delete from stock where id='${id}'`;

    console.log(sql);

    db.run(sql, function(err){
        if(err) throw err

        callback();
    });

    closedb(db);
}

//Insert DB
function insertData(data){
    let db = opendb();
    const sql = `Insert into stock(title,description, prince, stock, image)
    values('${data.title}','${data.description}', '${data.prince}', '${data.stock}', '${data.image}')`;
    console.log(sql);

    db.run(sql)

    closedb(db);
}

//Update DB
function updateData(data){
    let db = opendb();
    const sql = `UPDATE stock SET title= '${data.title}',
                description= '${data.description}', 
                prince= '${data.prince}', 
                stock= '${data.stock}' where id= '${data.id}'`;
    console.log(sql);            

    db.run(sql)

    closedb(db);
}

//เรียกข้อมูลทั้งหมดจาก DB ขึ้นมาแสดงผลการทำงาน
function querydb(callback){
    let db = opendb();

    db.all(`select * from stock order by id`, (err,row) =>{
        if(err){
            callback([]);
        }
        callback(row);
    });
    closedb(db);
}

function QueryById(id,callback){

    let db =opendb();

    db.get(`select * from stock where id=${id}`, function (err, row) {
        if (err) throw err;

        callback(row);
      });
    
      closedb(db);
    }

//Create DB
function opendb(){
    let db = new sqlite3.Database(path.join(__dirname,'stock/db/data.db'), (err) =>{
        if(err){
            console.error(err.message);            
        }
        console.log('Connected to the stock database');
    });

    var sql_create_table = `CREATE TABLE IF NOT EXISTS 'stock' (
        'id' INTEGER PRIMARY KEY AUTOINCREMENT,
        'title' TEXT,
        'description' TEXT,
        'prince' INTEGER,
        'stock' INTEGER,
        'image' TEXT
    )`;
    db.run(sql_create_table);
    return db;
}

//Close DB
function closedb(db){
    db.close((err) => {
        if (err){
            return console.error(err.message);
        }
    });
}

var server = app.listen(3000, function(){
    var host =server.address().address;
    var port = server.address().port;
    console.log("Listen at http://%s:%s", host, port);
});