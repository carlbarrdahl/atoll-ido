const hre = require("hardhat");
require("@reef-defi/hardhat-reef");

const {
  TestAccountSigningKey,
  Provider,
  Signer,
} = require("@reef-defi/evm-provider");
const { WsProvider, Keyring } = require("@polkadot/api");
const { createTestPairs } = require("@polkadot/keyring/testingPairs");
const { KeyringPair } = require("@polkadot/keyring/types");

const IDO = require("../artifacts/contracts/IDO.sol/IDO.json");
const Token = require("../artifacts/contracts/Token.sol/Token.json");
const ERC20Mintable = require("../artifacts/contracts/test/ERC20Mintable.sol/ERC20Mintable.json");
const { utils } = require("ethers");

const setup = async () => {
  const provider = new Provider({
    provider: new WsProvider("wss://rpc-testnet.reefscan.com/ws"),
  });

  await provider.api.isReady;
  const seed =
    "light fall visa reduce derive horror clump alcohol legend donor bronze above";
  let pair;
  if (seed) {
    const keyring = new Keyring({ type: "sr25519" });
    pair = keyring.addFromUri(seed);
  } else {
    const testPairs = createTestPairs();
    pair = testPairs.alice;
  }
  const signingKey = new TestAccountSigningKey(provider.api.registry);
  signingKey.addKeyringPair(pair);

  const wallet = new Signer(provider, pair.address, signingKey);

  // Claim default account
  if (!(await wallet.isClaimed())) {
    console.log(
      "No claimed EVM account found -> claimed default EVM account: ",
      await wallet.getAddress()
    );
    await wallet.claimDefaultAccount();
  }

  return {
    wallet,
    provider,
  };
};

async function main() {
  const { wallet, provider } = await setup();

  const tokenAddress = "0x2Ec6407504abFe503347e38D5a298D615DBBC0DD";
  const receivingAddress = "0xB0FEce67b1497a47f4b385512022799583FA2456";
  console.log(wallet);

  const token = await hre.ethers.getContractAt(
    "ERC20Mintable",
    tokenAddress,
    wallet
  );

  await token
    .connect(wallet)
    .mint(receivingAddress, hre.ethers.utils.parseEther("10"));
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
