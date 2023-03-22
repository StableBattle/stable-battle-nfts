import Bundlr from "@bundlr-network/client";
import * as arKey from "../arweave_key.json";

export default async function checkBundlrNodeBalance() {
  const bundlr = new Bundlr("http://node1.bundlr.network", "arweave", arKey);
  const curBalance = await bundlr.getLoadedBalance();
  console.log(`Current Bundlr node balance = ${bundlr.utils.unitConverter(curBalance)}`);
  return curBalance;
};

checkBundlrNodeBalance()