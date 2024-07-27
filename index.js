import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "permalist",
  password: "freelancer2024",
  port: 5432,
});
db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

/*let items = [
  { id: 1, title: "Buy milk" },
  { id: 2, title: "Finish homework" },
];*/

async function checkItems() {
  const result = await db.query("SELECT * FROM items order by id asc");
  let items = [];
  result.rows.forEach((item) => {
    items.push(item);
  });
  return items;
}
app.get("/", async (req, res) => {
  const items = await checkItems();
  res.render("index.ejs", {
    listTitle: "Today",
    listItems: items,
  });
});

app.post("/add", async (req, res) => {
  const item = req.body.newItem;
  //items.push({ title: item });
  try 
   {
    await db.query(
      "INSERT INTO items (title) VALUES ($1)",
      [item]
    );
    res.redirect("/");
   }
  catch (err) 
   {
      console.log(err);
      const item = await checkItems();
      res.render("index.ejs", {
        listTitle: "Today",
        listItems: items,
        error: "item has already been added, try again.",
      });
   }
});

app.post("/edit", async (req, res) => {
  const updatedItemId = req.body.updatedItemId; // Updated item ID from the form
  const updatedItemTitle = req.body.updatedItemTitle; // Updated item title from the form
  
  try {
    // Update the title of the item with the specified ID in the database
    await db.query(
      "UPDATE items SET title = $1 WHERE id = $2",
      [updatedItemTitle, updatedItemId]
    );
    
    res.redirect("/"); // Redirect back to the homepage after successful update
  } catch (error) {
    // Handle errors appropriately
    console.error("Error occurred while updating item:", error);
    res.status(500).send("Internal Server Error");
  }
});





app.post("/delete", async (req, res) => {
  const deleteItemId = req.body.deleteItemId; // id of item to delete  from the form
  try {
    // Update the title of the item with the specified ID in the database
    await db.query(
      "DELETE FROM items WHERE id = $1",
      [deleteItemId]
    );
    
    res.redirect("/"); // Redirect back to the homepage after successful update
  } catch (error) {
    // Handle errors appropriately
    console.error("Error occurred while deleting item:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
