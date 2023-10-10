const express = require("express");
const app = express();
const fs = require("fs");
const { readFile } = require("fs/promises");
const path = require("path");

app.use(express.json());

const port = 300;

async function exists (path) {  
  try {
    await fs.promises.access(path)
    return true
  } catch {
    return false
  }
}

app.use(express.static('views/images'));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../views/index.html'));
});

app.get("/images/:file", (req, res) => {
  res.sendFile(path.join(__dirname,`/../views/images/${req.params.file}`));
});

app.get('/script.js', (req, res) => {
  res.sendFile(path.join(__dirname, '../views/script.js'));
});

app.get('/style.css', (req, res) => {
  res.sendFile(path.join(__dirname, '../views/style.css'));
});

app.get("/api/pizza", async (req, res) => {
  try {
    const fileData = await readFile(path.join(`${__dirname}/pizzas.json`));
    res.json(JSON.parse(fileData));
	} catch (error) {
		console.error(`File reading error: ${error.message}`);
	}
});

app.get("/api/allergens", async (req, res) => {
  try {
    const fileData = await readFile(path.join(`${__dirname}/allergens.json`));
    res.json(JSON.parse(fileData));
	} catch (error) {
		console.error(`File reading error: ${error.message}`);
	}
});

app.get("/api/orders", async (req, res) => {
  if (await exists(path.join(`${__dirname}/orders.json`))) {
    try {
      const fileData = await readFile(path.join(`${__dirname}/orders.json`));
      res.json(JSON.parse(fileData));
    } catch (error) {
      console.error(`File reading error: ${error.message}`);
    }
  }
});

app.post("/api/orders", async (req, res) => {
  try {
    let newOrderObj;
    let newOrderBody;
    if (await exists(path.join(`${__dirname}/orders.json`))) {
      let fileData = await readFile(path.join(`${__dirname}/orders.json`));
      let convertedFileData = await JSON.parse(fileData);
      newOrderBody = req.body;
      newOrderObj = {
        orders: [...(convertedFileData.orders), newOrderBody]
      };
    }
    else {
      newOrderBody = req.body;
      newOrderObj = {
        orders: [newOrderBody]
      };
    }
    newOrderObj = JSON.stringify(newOrderObj, null, 3);
    fs.writeFile(path.join(`${__dirname}/orders.json`), newOrderObj, (err) => {
		  if (err) throw err;
	    }); 
      res.json(JSON.parse(JSON.stringify({"info": "Done"})));
  } catch (error) {
		console.error(`File reading error: ${error.message}`);
	}
})

app.listen(port, console.log(`http://127.0.0.1:${port}`));
