require("@nomiclabs/hardhat-waffle");

const isReef = process.env.REEF;

isReef && require("@reef-defi/hardhat-reef");
// }

const mnemonic =
  // "group cram clay fiction confirm sand banner life elbow witness hollow autumn";
  "light fall visa reduce derive horror clump alcohol legend donor bronze above";

module.exports = {
  solidity: "0.8.4",
  ...(isReef
    ? {
        defaultNetwork: "reef",
        networks: {
          reef: {
            url: "wss://rpc-testnet.reefscan.com/ws",
            // "ws://127.0.0.1:9944",
            accounts: { mnemonic },
          },
        },
      }
    : {}),
};
