import { ApiPromise } from "@polkadot/api";
import { WsProvider } from "@polkadot/rpc-provider";
import { options } from "@reef-defi/api";
import { Keyring } from "@polkadot/api";

import { Provider } from "@reef-defi/evm-provider";

import { mnemonicGenerate } from "@polkadot/util-crypto";

function createRandomWallet() {
  const keyring = new Keyring({ type: "sr25519" });
  return keyring.addFromMnemonic(mnemonicGenerate());
}

function createTestWallets() {
  const keyring = new Keyring({ type: "sr25519" });

  const seedAlice =
    "group cram clay fiction confirm sand banner life elbow witness hollow autumn";
  const seedBob =
    "light fall visa reduce derive horror clump alcohol legend donor bronze above";
  // const seed = mnemonicGenerate();
  // console.log(seed);
  return [keyring.addFromMnemonic(seedAlice), keyring.addFromMnemonic(seedBob)];
}

let provider;
describe("web3", () => {
  beforeAll(async () => {
    try {
      provider = new Provider({
        provider: new WsProvider("wss://rpc-testnet.reefscan.com/ws"),
      });
      await provider.api.isReadyOrError;

      // const provider = new WsProvider("wss://rpc-testnet.reefscan.com/ws");
      // const api = await new ApiPromise(options({ provider }));
      // await api.isReady;

      // use api
      // const alice = createRandomWallet();
      // const bob = createRandomWallet();

      // console.log(bobBalance);
      // console.log(bobBalance.data.toHuman());
      // const unsub = await reefProvider.api.tx.balances
      //   .transfer(bob.address, 12345)
      //   .signAndSend(alice, (result) => {
      //     console.log(`Current status is ${result.status}`);

      //     if (result.status.isInBlock) {
      //       console.log(
      //         `Transaction included at blockHash ${result.status.asInBlock}`
      //       );
      //     } else if (result.status.isFinalized) {
      //       console.log(
      //         `Transaction finalized at blockHash ${result.status.asFinalized}`
      //       );
      //       unsub();
      //     }
      //   });

      // Show the hash
      // console.log(`Submitted with hash ${txHash}`);
      // console.log(api.consts.balances.existentialDeposit.toBigInt());

      // console.log(api.consts.transactionPayment.transactionByteFee.toNumber());
      // const data = await api.query.system.account(
      //   "5F98oWfz2r5rcRVnP9VCndg33DAAsky3iuoBSpaPUbgN9AJn"
      // );
      // console.log(data.toHuman());
    } catch (error) {
      console.log(error);
    }
  });
  test("generate account", async () => {
    const [alice, bob] = createTestWallets();
    expect.assertions(1);
    console.log(alice.address);
    console.log(bob.address);

    // const bobBalance = await provider.api.derive.balances
    //   .all(alice.address)
    //   .then((balance) => {
    //     console.log(
    //       balance.freeBalance.toHuman(),
    //       balance.freeBalance.toBigInt()
    //     );
    //     // done();
    //     expect(true).toBe(true);
    //   });

    // const data = await provider.api.query.system.account(alice.address);

    // console.log(data);
    const unsub = provider.api.query.system.account(
      alice.address,
      async ({ nonce, data: balance }) => {
        console.log(
          `free balance is ${balance.free} with ${balance.reserved} reserved and a nonce of ${nonce}`
        );

        const unsub2 = await provider.api.query.system.account(
          bob.address,
          ({ nonce, data: balance2 }) => {
            console.log(
              `free balance is ${balance2.free} with ${balance2.reserved} reserved and a nonce of ${nonce}`
            );

            expect(true).toBe(true);
            unsub();
            unsub2();
          }
        );
      }
    );
    // console.log(bobBalance.freeBalance.toHuman());

    // const bobInfo = await provider.api.derive.balances.all(bob.address);

    // console.log(bobInfo);
    // const unsub = await provider.api.tx.balances
    //   .transfer(bob.address, 34543 * 1000)
    //   .signAndSend(alice, (result) => {
    //     console.log(`Current status is ${result.status}`);

    //     if (result.status.isInBlock) {
    //       console.log(
    //         `Transaction included at blockHash ${result.status.asInBlock}`
    //       );
    //     } else if (result.status.isFinalized) {
    //       console.log(
    //         `Transaction finalized at blockHash ${result.status.asFinalized}`
    //       );
    //       unsub();

    //     }
    //   });
  }, 60000);
});
