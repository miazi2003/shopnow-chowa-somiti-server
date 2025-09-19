// index.js
const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

// CORS setup
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://amazing-cannoli-b3379f.netlify.app",
    ],
    credentials: true,
  })
);

// JSON parsing
app.use(express.json());

// MongoDB setup
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// Connect to DB
async function run() {
  try {
    await client.connect();
    const database = client.db("somitiDB");
    const usersCollection = database.collection("users");
    const depositCollection = database.collection("deposit");

    // USERS ROUTES
    app.get("/users", async (req, res) => {
      const result = await usersCollection.find().toArray();
      res.send(result);
    });

    app.get("/users-filter", async (req, res) => {
      const email = req.query.email;
      if (!email) return res.status(400).send({ message: "Email is required" });

      try {
        const user = await usersCollection.findOne({ email });
        if (!user) return res.status(404).send({ message: "User not found" });
        res.send(user);
      } catch (err) {
        res.status(500).send({ message: "Failed to fetch user" });
      }
    });

    app.post("/users", async (req, res) => {
      const userData = req.body;
      const result = await usersCollection.insertOne(userData);
      res.send(result);
    });

    // DEPOSIT ROUTES
    app.post("/user-deposit", async (req, res) => {
      const depositData = req.body;
      const result = await depositCollection.insertOne(depositData);
      res.send(result);
    });

    app.get("/user-deposit", async (req, res) => {
      const result = await depositCollection.find().toArray();
      res.send(result);
    });

    app.put("/user-deposit/:id", async (req, res) => {
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

    app.get("/deposits", async (req, res) => {
      const { email } = req.query;
      if (!email) return res.status(400).json({ error: "Email is required" });

      try {
        const deposits = await depositCollection.find({ email }).toArray();
        res.json(deposits);
      } catch (err) {
        res.status(500).json({ error: "Failed to fetch deposits" });
      }
    });

    // Ping test
    await client.db("admin").command({ ping: 1 });
    console.log("MongoDB connected successfully!");
  } catch (err) {
    console.error(err);
  }
}
run().catch(console.dir);

// Root route
app.get("/", (req, res) => {
  console.log("Server running");
  res.send("Server is cooking now shopnow chowa doneeeee");
});

// Listen
app.listen(port, () => {
  console.log("Server running on port", port);
});
