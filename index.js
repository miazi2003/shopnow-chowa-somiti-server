const express = require("express");
const app = express();

const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = process.env.PORT || 5000;
require("dotenv").config();
app.use(
  cors({origin : ["http://localhost:5173","https://amazing-cannoli-b3379f.netlify.app"],
    credentials: true,
  })
);
app.use(express.json());



const uri = process.env.MONGODB_URI;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});



async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const database = client.db("somitiDB");
    const usersCollection = database.collection("users");
    const depositCollection = database.collection("deposit");



    // users data api
    app.get("/users",     async (req, res) => {
      const result = await usersCollection.find().toArray();
      res.send(result);
    });


app.get("/users-filter",    async (req, res) => {
  const email = req.query.email;
  if (!email) return res.status(400).send({ message: "Email is required" });

  try {
    const user = await usersCollection.findOne({ email });
    if (!user) return res.status(404).send({ message: "User not found" });
    res.send(user); // ✅ এই ইউজারের ডাটা
  } catch (err) {
    res.status(500).send({ message: "Failed to fetch user" });
  }
});



    app.post("/users",   async (req, res) => {
      const userData = req.body;

      const result = await usersCollection.insertOne(userData);
      res.send(result);
    });



    //deposit data
    app.post("/user-deposit",       async (req, res) => {
      const depositData = req.body;

      const result = await depositCollection.insertOne(depositData);
      res.send(result);
    });



    app.get("/user-deposit",     async (req, res) => {
      const result = await depositCollection.find().toArray();
      res.send(result);
    });



    // Update deposit by ID
    app.put("/user-deposit/:id",       async (req, res) => {
      const { id } = req.params;
      const { amount, date } = req.body;

      try {
        const result = await depositCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: { amount, date } }
        );
        res.send(result);
      } catch (err) {
        res.status(500).send({ error: err.message });
      }
    });



    app.get("/deposits",     async (req, res) => {
      const { email } = req.query;

      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }

      try {
        const deposits = await depositCollection.find({ email }).toArray();
        res.json(deposits);
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch deposits" });
      }
    });

    // app.delete("/deposits", async (req, res) => {
    //   try {
    //     const result = await depositCollection.deleteMany({});
    //     res.status(200).json({
    //       message: "All deposits deleted successfully",
    //       deletedCount: result.deletedCount,
    //     });
    //   } catch (err) {
    //     console.error(err);
    //     res.status(500).json({ message: "Failed to delete deposits" });
    //   }
    // });


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
  }
}
run().catch(console.dir);

app.get("/", async (req, res) => {
  console.log("server running");
  res.send("server is cooking now shopnow chowa");
});

app.listen(port, () => {
  console.log("port running on", port);
});
