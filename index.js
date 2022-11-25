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

// console.log(uri);
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function mongodbConnect() {
  try {
    // all product
    const furnitureResellingProduct = client
      .db("furnitureResell")
      .collection("furnitureResellProduct");

    // all category
    const furnitureResellingCategory = client
      .db("furnitureResell")
      .collection("ResellCategory");

    // all booking
    const furnitureResellingBooking = client
      .db("furnitureResell")
      .collection("ResellBooking");

    // all report
    const furnitureResellingReport = client
      .db("furnitureResell")
      .collection("ResellReport");

    //all user
    const furnitureResellingAllUser = client
      .db("furnitureResell")
      .collection("ResellAllUser");

    // const user = { name: "abudl" };

    // const box = furnitureResellingCategory.insertOne(user);

    //get all furnitureReselling

    app.get("/ResellingFurniture", async (req, res) => {
      const query = {};
      const option = await furnitureResellingCategory.find().toArray();
      //   console.log(option);
      res.send(option);
    });

    // all furniture  data
    app.get("/home/category/:category", async (req, res) => {
      const id = req.params.category;
      const query = { category: id };
      console.log(query);
      const resellerAllCategory = await furnitureResellingProduct
        .find(query)
        .toArray();
      res.send(resellerAllCategory);
    });

    // all booking fatch data
    // booking
    app.post("/modalData", async (req, res) => {
      const modalData = req.body;
      // console.log("helo", modalData);
      // const query = {
      //   email: modalData.user,
      // };
      // console.log("email", query);
      const option = await furnitureResellingBooking.insertOne(modalData);
      // console.log(option);
      res.send(option);
    });
    // report
    app.post("/ReportData", async (req, res) => {
      const ReportData = req.body;
      const result = await furnitureResellingReport.insertOne(ReportData);
      console.log(result);
      res.send(result);
    });
    // all user
    app.post("/allUser", async (req, res) => {
      const allUser = req.body;
      // console.log(allUser);
      const result = await furnitureResellingAllUser.insertOne(allUser);
      // console.log(result);
      res.send(result);
    });

    // resell all  User
    app.get("/ResellAllUser", async (req, res) => {
      const query = {};
      const result = await furnitureResellingAllUser.find(query).toArray();
      res.send(result);
    });

    // resell all  Report
    app.get("/ResellAllReport", async (req, res) => {
      const query = {};
      const result = await furnitureResellingReport.find(query).toArray();
      res.send(result);
    });

    // get my booking with email

    app.get("/MyBookings", async (req, res) => {
      const email = req.query.email;
      const query = { user: email };

      console.log(query);
      const booking = await furnitureResellingBooking.find(query).toArray();
      // console.log(booking);
      res.send(booking);
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
