// Use a normal firebase function outside express app to pass the rawBody to constructEvent
exports.webhook = functions.https.onRequest(async (req, res) => {
  try {
    const sig = req.headers["stripe-signature"];

    console.log("sig", sig);
    console.log("body", req.rawBody.toString());
    console.log("whsec", config.stripe.endpoint_secret);
    const event = await stripe.webhooks.constructEvent(
      req.rawBody.toString(),
      sig,
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
