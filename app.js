const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb://127.0.0.1/todolistDB", { useNewUrlParser: true });
const itemsSchema = new mongoose.Schema({
	name: String
});
const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
	name: "Welcome to ToDo List"
})
const item2 = new Item({
	name: "Hit + button to add a new item"
})
const item3 = new Item({
	name: "<-- Hit this button to delete an item"
})

const defaultItems = [item1, item2, item3];

const listSchema = {
	name: String,
	items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

app.get("/", function (req, res) {

	Item.find().then(function (forundItems) {
		if (forundItems.length == 0) {
			Item.insertMany(defaultItems).then((result) => {
				console.log("Successfully inserted");
			}).catch((err) => {
				console.log(err);
			})
			res.redirect("/");
		} else {
			res.render("list", { listTitle: "Today", newListItems: forundItems });
		}
	}).catch((err) => {
		console.log(err);
	})


});

app.post("/", function (req, res) {

	const itemName = req.body.newItem;
	const listName = req.body.list;
	const item = new Item({
		name: itemName
	})

	

	if(listName == "Today"){
		item.save();
		res.redirect("/");
	}
	else{
		List.findOne({name: listName}).then((foundList)=>{
			foundList.items.push(item);
			foundList.save();
			res.redirect("/"+listName);
		}).catch((err)=>{
			console.log(err);
		})
	}



});

app.post("/delete", function (req, res) {
	const deleteID = req.body.checkbox;
	const listName = req.body.listName;
	if(listName == "Today"){
		if (deleteID != "on") {
			Item.findByIdAndRemove(deleteID).then((result) => {
				console.log("Successfully deleted the checked item");
				res.redirect("/");
			}).catch((err) => {
				console.log(err);
			})
		}
	}
	else{
		if(deleteID != "on"){
			List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: deleteID}}}).then((result)=>{
				console.log("Successfully deleted");
				res.redirect("/"+listName);
			}).catch((err)=>{
				console.log(err);
			})
		}
	}
})

app.get("/:customListName", function (req, res) {
	const customListName = _.capitalize(req.params.customListName);
	List.findOne({ name: customListName }).then((foundList) => {
		if (!foundList) {
			const list = new List({
				name: customListName,
				items: defaultItems
			})
			list.save();
			res.redirect("/" + customListName);
		}
		else {
			res.render("list", { listTitle: foundList.name, newListItems: foundList.items });
		}
	}).catch((err) => {
		console.log(err);
	})
})

app.get("/about", function (req, res) {
	res.render("about");
});

app.listen(3000, function () {
	console.log("Server started on port 3000");
});

