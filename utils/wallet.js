import { Keyring } from "@polkadot/api";

import { mnemonicGenerate } from "@polkadot/util-crypto";

export function createRandomWallet() {
  const keyring = new Keyring({ type: "sr25519" });
  return keyring.addFromMnemonic(mnemonicGenerate());
}
