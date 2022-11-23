const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();
// const jwt = require("jsonwebtoken");

// mongodb
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

app.use(cors());
app.use(express.json());

const port = process.env.port || 8000;

// mongodb user
const uri = `mongodb+srv://${process.env.DB_ADMIN_USER}:${process.env.DB_PASSWORD}@cluster0.wtn02jv.mongodb.net/?retryWrites=true&w=majority`;

console.log(uri);
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function mongodbConnect() {
  try {
    const furnitureResellingProduct = client
      .db("furnitureResell")
      .collection("furnitureResellProduct");

    //get all furnitureReselling

    app.get("/ResellingFurniture", async (req, res) => {
      const query = {};
      const option = await furnitureResellingProduct.find().toArray();
      //   console.log(option);
      res.send(option);
    });

    app.get("/home/category/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const resellerDetails = await furnitureResellingProduct.findOne(query);
      res.send(resellerDetails);
    });
  } finally {
  }
}
mongodbConnect().catch((err) => console.log(err));

app.get("/", (req, res) => {
  res.send("server is running on port 8000");
});

app.listen(port, () => {
  console.log("server is running");
});
