const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();
const jwt = require("jsonwebtoken");
const stripe = require("stripe")(process.env.STRIPE_SECRET);

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

    //all payment
    const furnitureResellPayment = client
      .db("furnitureResell")
      .collection("ResellPayment");

    //all advertising
    const furnitureResellAdvertisingProduct = client
      .db("furnitureResell")
      .collection("ResellAdvertising");

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
      const query = {
        category_name: id,
      };
      // console.log(query);
      const resellerAllCategory = await furnitureResellingProduct
        .find(query)
        .sort({ _id: -1 })
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
      };

      // console.log("data match", match);
      const alreadyBooked = await furnitureResellingBooking
        .find(match)
        .sort({ _id: -1 })
        .toArray();
      // console.log("already add", alreadyBooked);

      if (alreadyBooked.length) {
        const message = `You Already have a booking on ${match.user} `;
        return res.send({ acknowledged: false, message });
      }

      const option = await furnitureResellingBooking.insertOne(modalData);
      console.log("option", option);
      res.send(option);
    });

    // report

    app.delete("/allReportDelete/:id", async (req, res) => {
      const { id } = req.params;
      // console.log(id);
      const query = { _id: ObjectId(id) };
      const result = await furnitureResellingReport.deleteOne(query);
      // console.log(result);
      res.send(result);
    });

    // report delete
    app.post("/ReportData", async (req, res) => {
      const ReportData = req.body;
      // console.log(ReportData);
      const result = await furnitureResellingReport.insertOne(ReportData);
      // console.log(result);
      res.send(result);
    });

    app.post("/users", async (req, res) => {
      const user = req.body;
      const query = { email: user.email };
      const alreadyUser = await usersCollections.findOne(query);
      if (alreadyUser) {
        return res.send({ acknowledged: true });
      }
      const result = await usersCollections.insertOne(user);
      res.send(result);
    });

    // all user
    app.post("/allUser", async (req, res) => {
      const allUser = req.body;
      const query = { email: allUser.email };
      const alreadyUser = await furnitureResellingAllUser.findOne(query);
      if (alreadyUser) {
        return res.send({ acknowledged: true });
      }
      const result = await furnitureResellingAllUser.insertOne(allUser);
      res.send(result);
    });

    // resell all  User
    app.get("/ResellAllUser", async (req, res) => {
      const query = {};
      const result = await furnitureResellingAllUser.find(query).toArray();

      res.send(result);
    });

    //all buyer
    app.get("/allBuyer/:role", async (req, res) => {
      const email = req.params.role;
      // console.log(email);
      const query = { role: email };
      const result = await furnitureResellingAllUser.find(query).toArray();

      res.send(result);
    });
    //all seller
    app.get("/allSeller/:role", async (req, res) => {
      const email = req.params.role;
      // console.log(email);
      const query = { role: email };
      const result = await furnitureResellingAllUser.find(query).toArray();
      res.send(result);
    });

    // resell all  Report
    app.get("/ResellAllReport", async (req, res) => {
      const query = {};
      console.log(query);
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
    // my booking delete
    app.get("/myBookingDelete/:id", async (req, res) => {
      const { id } = req.params;
      // console.log(id);
      const query = { _id: ObjectId(id) };
      const result = await furnitureResellingBooking.deleteOne(query);
      res.send(result);
    });

    // all user delete
    app.get("/allUserDelete/:id", async (req, res) => {
      const { id } = req.params;
      // console.log(id);
      const query = { _id: ObjectId(id) };
      const result = await furnitureResellingAllUser.deleteOne(query);
      res.send(result);
    });

    // my product delete
    app.get("/myProductDelete/:id", async (req, res) => {
      const { id } = req.params;
      // console.log(id);
      const query = { _id: ObjectId(id) };
      const result = await furnitureResellingProduct.deleteOne(query);
      res.send(result);
    });

    // jwt token 1 step
    app.get("/jwt", async (req, res) => {
      const email = req.query.email;
      // console.log("email", email);
      const query = { email: email };
      const user = await furnitureResellingAllUser.findOne(query);
      // console.log("user", user);

      if (user) {
        const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, {
          expiresIn: "5h",
        });
        return res.send({ accessToken: token });
      }
      // console.log(user);
      res.status(403).send({ accessToken: "" });
    });

    app.get("/categoryOption", async (req, res) => {
      const query = {};
      const result = await furnitureResellingCategory
        .find(query)
        .project({
          category_name: 1,
        })
        .toArray();
      res.send(result);
    });

    app.post("/addSellerProduct", async (req, res) => {
      const product = req.body;
      // console.log(product);
      const result = await furnitureResellingProduct.insertOne(product);
      res.send(result);
    });

    app.get("/MyProduct", async (req, res) => {
      const email = req.query.email;
      // console.log(email);
      // const decodedEmail = req.decoded.email;

      // if (email !== decodedEmail) {
      //   return res.status(403).send({ message: "forbidden access" });
      // }

      const query = {
        seller_email: email,
      };

      // console.log(query);
      const booking = await furnitureResellingProduct.find(query).toArray();
      // console.log(booking);
      res.send(booking);
    });

    app.put("/verifyUser/:id", async (req, res) => {
      const { id } = req.params;
      // console.log(id);
      const filter = { _id: ObjectId(id) };
      const user = req.body;
      // console.log(user);
      const option = { upsert: true };
      const updatedUser = {
        $set: {
          verifyUser: user.verifyUser,
        },
      };
      const result = await furnitureResellingAllUser.updateOne(
        filter,
        updatedUser,
        option
      );
      // console.log(result);
      res.send(result);
    });

    app.get("/bookings/:id", async (req, res) => {
      const { id } = req.params;
      // console.log("1", id);
      const query = { _id: ObjectId(id) };
      // console.log("2", query);
      const booking = await furnitureResellingBooking.findOne(query);
      // console.log("hello", booking);
      res.send(booking);
    });

    // paymnet gatway
    app.post("/create-payment-intent", async (req, res) => {
      const booking = req.body;
      // console.log(booking);
      const price = booking.resale_price;
      const amount = price * 100;
      // console.log(price);
      const paymentIntent = await stripe.paymentIntents.create({
        currency: "usd",
        amount: amount,
        payment_method_types: ["card"],
      });
      res.send({
        clientSecret: paymentIntent.client_secret,
      });
    });

    app.post("/payments", async (req, res) => {
      const payment = req.body;
      // console.log("1", payment);
      const result = await furnitureResellPayment.insertOne(payment);

      const filter = {
        picture: payment.picture,
        name: payment.name,
        resale_price: payment.resale_price,
      };
      const updatedDoc = {
        $set: {
          paid: true,
          transactionId: payment.transactionId,
        },
      };
      const updateBooking = await furnitureResellingBooking.updateOne(
        filter,
        updatedDoc
      );
      // console.log("2", updateBooking);
      const updateProduct = await furnitureResellingProduct.updateOne(
        filter,
        updatedDoc
      );
      // console.log("3", updateProduct);
      res.send(result);
    });
    // advertising section
    app.post("/advertisingProduct", async (req, res) => {
      const payment = req.body;

      const query = {
        picture: payment.picture,
      };
      const alreadyUser = await furnitureResellAdvertisingProduct.findOne(
        query
      );
      if (alreadyUser) {
        return res.send({ acknowledged: false });
      }

      const result = await furnitureResellAdvertisingProduct.insertOne(payment);
      // console.log(result);
      res.send(result);
    });

    app.get("/AllAdvertising", async (req, res) => {
      const query = {};
      // console.log(query);
      const option = await furnitureResellAdvertisingProduct.find().toArray();
      // console.log(option);
      res.send(option);
    });
    app.delete("/AllAdvertisingDelete/:picture", async (req, res) => {
      const originalPrice = req.params.picture;
      // console.log("1", originalPrice);
      const query = {
        resale_price: originalPrice,
      };
      // // console.log("2", query);
      const booking = await furnitureResellAdvertisingProduct.deleteOne(query);
      // console.log("hello", booking);
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

// capacity: modalData.capacity,
// name: modalData.name,
// original_price: modalData.original_Price,
// resale_price: modalData.resale_price,
