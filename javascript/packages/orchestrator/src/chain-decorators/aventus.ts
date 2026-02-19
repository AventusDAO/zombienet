import { Node } from "../sharedTypes";
import { generateKeyForNode as _generateKeyForNode } from "../keys";
import { Keyring } from "@polkadot/api";
import { u8aToHex } from "@polkadot/util";
import { cryptoWaitReady } from "@polkadot/util-crypto";
import { CreateLogTable, decorators } from "@zombienet/utils";

// Aventus genesis node key type
export type GenesisNodeKey = [string, string, { [key: string]: string }];

export function getNodeKey(node: Node, useStash = true): GenesisNodeKey {
  const { sr_stash, sr_account, ed_account } = node.accounts;

  const address = useStash ? sr_stash.address : sr_account.address;

  const key: GenesisNodeKey = [
    address,
    address,
    {
      aura: sr_account.address,
      grandpa: ed_account.address,
      authority_discovery: sr_account.address,
      im_online: sr_account.address,
      avn: sr_account.address,
      nodk_sr: sr_account.address,
    },
  ];

  return key;
}

async function generateKeyForNode(nodeName?: string, mnemonic?: string): Promise<any> {
  const keys = await _generateKeyForNode(nodeName, mnemonic);

  await cryptoWaitReady();

  const eth_keyring = new Keyring({ type: "ethereum" });
  const eth_account = eth_keyring.createFromUri(
    `${keys.mnemonic}/m/44'/60'/0'/0/0`,
  );

  keys.ec_account = {
    address: eth_account.address,
    publicKey: eth_account.address.toLowerCase(),
  };


  new CreateLogTable({
    colWidths: [30, 70],
  }).pushToPrint([
    [
      decorators.cyan("👤 ETHEREUM KEY"),

      decorators.green(nodeName),
      decorators.green(JSON.stringify(keys.ec_account, null, 2)),
    ],
  ]);

  return keys;
}

export default {
  getNodeKey,
  generateKeyForNode
};
