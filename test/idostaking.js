const { expect } = require("chai");
let hre = require("hardhat");
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

const getEthers = () => {
  return hre.config.defaultNetwork === "reef" ? hre.reef : hre.ethers;
};

const setup = async () => {
  const provider = new Provider({
    provider: new WsProvider(hre.config.networks.reef.url),
  });

  await provider.api.isReady;
  const seed = hre.config.networks.reef.accounts.mnemonic;
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

const {
  utils: { parseEther },
} = hre.ethers;
describe("IDO", function () {
  before(() => {});
  it("Should create a new IDO", async function () {
    this.timeout(3 * 60 * 1000);
    const { wallet, provider } = await setup();
    const ethers = getEthers();
    console.log(wallet);
    const dic = {
      tokenReef: "0x88781Bc258e6637d649B76C66d359837425ecF5C",
      // tokenReef: "0xa5089A04191327aFcE134b5Ee4Ec95baA1612A98",
      tokenErc: "0xD64d2AFCA15AAe8f2Ed520Cd4C5Be24F2d700840",
      ido: "0xAD7d9Dbc7A37590F1491e11Eb0142997A031536d",
    };

    console.log(dic);

    // const stakingToken = await ethers.getContractAt(
    //   "ERC20Mintable",
    //   "0xD64d2AFCA15AAe8f2Ed520Cd4C5Be24F2d700840",
    //   wallet
    // );

    // const token = await ethers.getContractAt(
    //   "ERC20Mintable",
    //   dic.tokenReef,
    //   wallet
    // );
    // const ido = await ethers.getContractAt("IDO", dic.ido, wallet);

    const stakingToken = await hre.ethers.ContractFactory.fromSolidity(
      ERC20Mintable
    )
      .connect(wallet)
      .deploy("StakingToken", "ST");

    const rewardToken = await hre.ethers.ContractFactory.fromSolidity(
      ERC20Mintable
    )
      .connect(wallet)
      .deploy("RewardToken", "RT");
    const walletAddress = await wallet.getAddress();
    await stakingToken.mint(walletAddress, hre.ethers.utils.parseEther("100"));
    await rewardToken.mint(walletAddress, hre.ethers.utils.parseEther("200"));
    // console.log(await stakingToken.balanceOf(await wallet.getAddress()));
    // console.log(await rewardToken.balanceOf(await wallet.getAddress()));
    const vestingPeriod = 3 * 60; // 3 minutes

    console.log("ST", stakingToken.address);
    console.log("RT", rewardToken.address);
    await stakingToken.mint(
      "0xB0FEce67b1497a47f4b385512022799583FA2456",
      hre.ethers.utils.parseEther("10")
    );
    const ido = await hre.ethers.ContractFactory.fromSolidity(IDO)
      .connect(wallet)
      .deploy(stakingToken.address, rewardToken.address, vestingPeriod);
    console.log("IDO", ido.address);
    // await token.approve(ido.address, hre.ethers.utils.parseEther("0.1"));
    // await ido.stake(hre.ethers.utils.parseEther("0.1"));
    console.log(await ido.totalStaked());
  });
});
