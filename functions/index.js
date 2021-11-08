const functions = require("firebase-functions");
const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");

const app = express();
const config = functions.config();
const stripe = require("stripe")(config.stripe.sk);

app.use(cors({ origin: true }));
// app.use(require("express-pino-logger")());

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  databaseURL: "https://atoll-ido-default-rtdb.firebaseio.com",
});

async function authMiddleware(req, res, next) {
  try {
    const token = (req.headers.authorization || "").split("Bearer ")[1];
    req.user = await admin.auth().verifyIdToken(token);
    next();
  } catch (error) {
    next(error);
  }
}

app.use((req, res, next) => {
  if (req.originalUrl === "/webhook") {
    next();
  } else {
    express.json()(req, res, next);
  }
});

app.get("/health", (req, res) => res.status(200).json({ status: "ok" }));

app.get("/verify", (req, res) => {
  return admin
    .database()
    .ref(`kyc/${req.query.address}`)
    .once("value")
    .then((snap) => res.send({ kyc: snap }));
});

app.post("/verify", (req, res) => {
  return stripe.identity.verificationSessions
    .create({
      type: "document",
      metadata: { user_id: req.body.address },
    })
    .then(({ client_secret }) => {
      res.send({ client_secret });
    })
    .catch((err) => {
      console.log(err);
      res.status(err.statusCode || 500).send(err);
    });
});

exports.api = functions.https.onRequest(app);

// Use a normal firebase function outside express app to pass the rawBody to constructEvent
exports.webhook = functions.https.onRequest(async (req, res) => {
  try {
    const event = await stripe.webhooks.constructEvent(
      req.rawBody.toString(),
      req.headers["stripe-signature"],
      config.stripe.endpoint_secret
    );
    if (event.type !== "identity.verification_session.verified") {
      return res.json({ received: true });
    }

    const session = event.data.object;
    const userId = event.data.object.metadata.user_id;

    // Redact user data
    await stripe.identity.verificationSessions.redact(session.id);

    await admin.database().ref(`kyc/${userId}`).set(session.id);
    return res.json({ received: true });
  } catch (err) {
    console.log(`❌ Error message: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
});
