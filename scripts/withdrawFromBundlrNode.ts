import Bundlr from "@bundlr-network/client";
import * as arKey from "../arweave_key.json";

export default async function withdrawFromBundlrNode() {
  const bundlr = new Bundlr("http://node1.bundlr.network", "arweave", arKey);
	try {
		// 400 - something went wrong
		// response.data  = "Not enough balance for requested withdrawal"

		// 200 - Ok
		// response.data = {
		//     requested, // the requested amount,
		//     fee,       // the reward required by the network (network fee)
		//     final,     // total cost to your account (requested + fee)
		//     tx_id,     // the ID of the withdrawal transaction
		// }
		// 1. Get current balance
		const curBalance = await bundlr.getLoadedBalance();
		// 2. Withdraw all
		const response = await bundlr.withdrawBalance(curBalance);

		console.log(
			`Funds withdrawn txID=${response.tx_id} amount requested=${response.requested}`,
		);
	} catch (e) {
		console.log("Error wiithdrawing funds ", e);
	}
};

withdrawFromBundlrNode()