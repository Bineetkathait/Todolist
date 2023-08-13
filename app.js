//jshint esversion:6

import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import { dirname } from "path";
import { fileURLToPath } from "url";
import _ from "lodash";

const __dirname = dirname(fileURLToPath(import.meta.url));
const date = __dirname + "/date.js";

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

//*******************to connect with the local database ********************/
// mongoose.connect("mongodb://127.0.0.1/todolistDB")
// .then(() => console.log('Connected!'));

mongoose.connect("mongodb+srv://admin-bineet:PrRDrvMMh@cluster0.pargbz8.mongodb.net/todolistDB")
.then(()=>console.log("connected to online database"));


const itemsSchema=new mongoose.Schema({
  name: String
});
const Items=mongoose.model("items",itemsSchema);

const item1= new Items({
  name:"Buy Food"
});
const item2=new Items({
  name:"Read book"
});
const item3=new Items({
  name:"Run daily"
});

const defaultItems=[item1,item2,item3];


const listschema=new mongoose.Schema({
  name : String,
  items:[itemsSchema]
});

const List=mongoose.model("list",listschema);

app.get("/", async(req, res)=>{

  Items.find().then((items)=>{
    if(items.length==0){
    Items.insertMany(defaultItems).then(()=>console.log("Saved items to database"));
    res.redirect("/");
    }else{
      res.render("list", {listTitle: "Today", newListItems: items});
    }

  });
});

app.post("/", async(req, res)=>{

  const itemName = req.body.newItem;
  const listName=req.body.list;

  const item=new Items({
    name:itemName
  });


  if(listName==="Today"){
    item.save();
    res.redirect("/");
  }else{
    const userName=await List.findOne({ name:listName }).exec();
    console.log(item);
    userName.items.push(item);
    userName.save();
    res.redirect("/"+listName);
  }

});

app.post("/delete",async(req,res)=>{
  const checkedItemId=req.body.checkbox;
  const listName=req.body.listName;

  if(listName==="Today"){
    await Items.deleteOne({_id:checkedItemId}).then(console.log("sucessfully deleted"));
    res.redirect("/");
  }
  else{
    await List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}},{new:true});
    res.redirect("/"+listName);
  }
});

app.get("/:customListName",async(req,res)=>{
  const customListName=_.capitalize(req.params.customListName);

  const userName=await List.findOne({ name:customListName }).exec();
  if(!userName){
    const list =new List({
      name:customListName,
      items: defaultItems
    });
    list.save();
    res.redirect("/"+customListName);
  }else{
    res.render("list", {listTitle: userName.name, newListItems: userName.items});
  }
});

  app.get("/about", function(req, res){
    res.render("about");
  });

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
