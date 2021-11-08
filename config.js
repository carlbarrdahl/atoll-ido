const isDev = process.env.NODE_ENV !== "production";

module.exports = {
  apiURL: isDev
    ? "http://localhost:5001/atoll-ido/us-central1"
    : "https://us-central1-atoll-ido.cloudfunctions.net",
  // apiURL: "https://us-central1-atoll-ido.cloudfunctions.net",
  network: {
    tokenSymbol: "REEF",
    tokenDecimals: 18,
    networkURL: "wss://rpc-testnet.reefscan.com/ws",
    explorerURL: "https://testnet.reefscan.com",
    backendWs: "wss://testnet.reefscan.com/api/v3",
    backendHttp: "https://testnet.reefscan.com/api/v3",
  },
  firebase: {
    apiKey: "AIzaSyBbPWwaB7dXpss8vtEeomZ_Uq6YDlwqFLU",
    authDomain: "atoll-ido.firebaseapp.com",
    databaseURL: "https://atoll-ido-default-rtdb.firebaseio.com",
    projectId: "atoll-ido",
    storageBucket: "atoll-ido.appspot.com",
    messagingSenderId: "62411318856",
    appId: "1:62411318856:web:07f5dae570f177509b5a7d",
  },
  stripe: {
    pk: "pk_test_51JsOSAH7fX0VA34ey0k59L0MQL5CKxfQS7LEP7ExMdgGgbglA99nfSokhe4knNy42VNtaBkdPm1vgKycs9kkpu37002lBNGQcM",
    sk: process.env.STRIPE_SK,
  },
};
