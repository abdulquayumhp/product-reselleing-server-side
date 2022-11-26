const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();
const jwt = require("jsonwebtoken");

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

    // jwt token verify

    function verificationJWT(req, res, next) {
      const header = req.headers.authorization;
      // console.log(header);
      if (!header) {
        return res.status(401).send("unauthorize access");
      }
      const token = header.split(" ")[1];
      // console.log(token);
      jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
        if (err) {
          return res.status(403).send({ message: "forbidden access" });
        }
        req.decoded = decoded;
        next();
      });
    }

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
      // console.log(query);
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

      const match = {
        user: modalData.user,
        picture: modalData.picture,
        // capacity: modalData.capacity,
        // name: modalData.name,
        // original_price: modalData.original_Price,
        // resale_price: modalData.resale_price,
      };

      // console.log("data match", match);
      const alreadyBooked = await furnitureResellingBooking
        .find(match)
        .toArray();
      // console.log("already add", alreadyBooked);

      if (alreadyBooked.length) {
        const message = `You Already have a booking on ${match.user} `;
        return res.send({ acknowledged: false, message });
      }

      const option = await furnitureResellingBooking.insertOne(modalData);
      // console.log("option", option);
      res.send(option);
    });

    // report
    app.post("/ReportData", async (req, res) => {
      const ReportData = req.body;
      const result = await furnitureResellingReport.insertOne(ReportData);
      // console.log(result);
      res.send(result);
    });

    // all user
    app.post("/allUser", async (req, res) => {
      const allUser = req.body;
      const result = await furnitureResellingAllUser.insertOne(allUser);
      // console.log(result);
      res.send(result);
    });

    // resell all  User
    app.get("/ResellAllUser", verificationJWT, async (req, res) => {
      const query = {};
      const result = await furnitureResellingAllUser.find(query).toArray();

      res.send(result);
    });

    // resell all  Report
    app.get("/ResellAllReport", async (req, res) => {
      const query = {};
      // console.log(query);
      const result = await furnitureResellingReport.find(query).toArray();
      res.send(result);
    });

    // get my booking with email

    app.get("/MyBookings", verificationJWT, async (req, res) => {
      const email = req.query.email;
      const decodedEmail = req.decoded.email;

      if (email !== decodedEmail) {
        return res.status(403).send({ message: "forbidden access" });
      }

      const query = { user: email };

      // console.log(query);
      const booking = await furnitureResellingBooking.find(query).toArray();
      // console.log(booking);
      res.send(booking);
    });

    //email to email call for all user role information

    app.get("/emailForGetUser/:email", async (req, res) => {
      const email = req.params.email;

      // const decodedEmail = req.decoded.email;
      // console.log(decodedEmail);
      // if (email !== decodedEmail) {
      //   return res.status(403).send({ message: "forbidden access" });
      // }

      const query = { email: email };

      const booking = await furnitureResellingAllUser.findOne(query);
      // console.log(booking);
      res.send(booking);
    });

    app.get("/myBookingDelete/:id", async (req, res) => {
      const { id } = req.params;
      // console.log(id);
      const query = { _id: ObjectId(id) };
      const result = await furnitureResellingBooking.deleteOne(query);
      res.send(result);
    });

    // jwt token 1 step
    app.get("/jwt", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const user = await furnitureResellingAllUser.findOne(query);

      if (user) {
        const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, {
          expiresIn: "5h",
        });
        return res.send({ accessToken: token });
      }
      // console.log(user);
      res.status(403).send({ accessToken: "" });
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
