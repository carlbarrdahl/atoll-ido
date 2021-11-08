const { task } = require("hardhat/config");

task("balance", "Prints an account's balance")
  .addParam(
    "stakingToken",
    "The ERC20's address of the token that should be staked"
  )
  .addParam(
    "rewardToken",
    "The ERC20's address of the token that should be rewarded"
  )
  .addParam(
    "apiKey",
    "API key to Atoll IDO backend for finalizing creation of IDO"
  )
  .addParam(
    "vestingPeriod",
    "Vesting period to lock staked tokens",
    60 * 60 * 24 * 30
  ) // 30 days
  .setAction(async (taskArgs, hre) => {
    const {
      deployments,
      ethers: { getContractAt, getSigners, getContractFactory },
    } = hre;
    const [caller] = await getSigners();
    console.log("Using the account:", caller.address);

    const IDO = await getContractFactory("IDOStaking");
    const stakingToken = await getContractAt("ERC20", taskArgs.stakingToken);
    const rewardToken = await getContractAt("ERC20", taskArgs.rewardToken);

    const ido = await IDO.deploy(
      stakingToken.address,
      rewardToken.address,
      taskArgs.vestingPeriod
    );
  });

module.exports = {};
