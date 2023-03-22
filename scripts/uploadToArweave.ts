import * as fs from "fs";
import * as arKey from "../arweave_key.json";
import md5File from "md5-file";
import Bundlr from "@bundlr-network/client";

interface NFTItemInteface {
  md5_hash : string;
  ar_hash: string;
  ar_link: string;
  http_link: string;
  updated : number;
}

interface NFTInterface {
  name : string;
  updated : number;
  image350?: NFTItemInteface;
  image512?: NFTItemInteface;
  image3000?: NFTItemInteface;
  animation?: NFTItemInteface;
}

export default async function updateArweaveNFTs() {
  const filesToUpload = findNFTsToUpload();
  console.log(filesToUpload);
  const newArHashes : string[] = await uploadFilesToArweave(filesToUpload);
  console.log(newArHashes);
  updateNFTsJson(filesToUpload, newArHashes);
}

function findNFTsToUpload() {
  const oldNFTs : NFTInterface[] = parseJSONAsNFT();
  let filesToUpload : {folder: string; file: string;}[] = []
  const nftFolders = fs.readdirSync("./NFTs/").filter(item => item[0] != ".");
  for(const nftFolder of nftFolders) {
    const nftFiles = fs.readdirSync(`./NFTs/${nftFolder}/`).filter(item => item[0] != ".");
    const oldNFT = oldNFTs.find(nft => nft.name == nftFolder);
    for(const nftFile of nftFiles) {
      const md5_hash = md5File.sync(`./NFTs/${nftFolder}/${nftFile}`);
      if(!oldNFT ||
        (nftFile.slice(-7, -4) == "350" && (!oldNFT.image350 || md5_hash != oldNFT.image350.md5_hash)) ||
        (nftFile.slice(-7, -4) == "512" && (!oldNFT.image512 || md5_hash != oldNFT.image512.md5_hash)) ||
        (nftFile.slice(-8, -4) == "3000" && (!oldNFT.image3000 || md5_hash != oldNFT.image3000.md5_hash)) ||
        (nftFile.slice(-3) == "mp4" && (!oldNFT.animation || md5_hash != oldNFT.animation.md5_hash)))
      {
        filesToUpload.push({folder: nftFolder, file: nftFile});
      }
    }
  }
  return filesToUpload;
}

async function uploadFilesToArweave(filesToUpload : {folder: string; file: string;}[]) : Promise<string[]> {
  let newArHashes : string[] = []
  const bundlr = new Bundlr("http://node1.bundlr.network", "arweave", arKey);
  const fileSizeTotal : number = filesToUpload.reduce((result, nft) => {
    return result + fs.statSync(`./NFTs/${nft.folder}/${nft.file}`).size;
  }, 0);
  const uploadPrice = await bundlr.getPrice(fileSizeTotal);
  console.log(`Uploading updated NFTs to Bundlr will cost ${bundlr.utils.unitConverter(fileSizeTotal)}`);
  const nodeBalance = await bundlr.getLoadedBalance();
  console.log(`Node balance = ${bundlr.utils.unitConverter(nodeBalance)}`);
  if (nodeBalance < uploadPrice) {
		console.log("Funding wallet--->");
		// Fund the node, give it enough so you can upload a full size
		try {
			// response = {
			// 	id, // the txID of the fund transfer
			// 	quantity, // how much is being transferred
			// 	reward, // the amount taken by the network as a fee
			// 	target, // the address the funds were sent to
			// };
			const response = await bundlr.fund(uploadPrice);
			console.log(`Funding successful txID=${response.id} amount funded=${bundlr.utils.unitConverter(response.quantity)}`);
		} catch (e) {
			console.log("Error funding node ", e);
		}
	}

  for(const fileToUpload of filesToUpload) {
    let ar_hash = "none";
    try {
      const tags = 
        fileToUpload.file.slice(-7, -4) == "350" || 
        fileToUpload.file.slice(-7, -4) == "512" || 
        fileToUpload.file.slice(-8, -4) == "3000" 
          ? [{name: "Content-Type", value: "image/png"}] :
        fileToUpload.file.slice(-3) == "mp4"
          ? [{name: "Content-Type", value: "video/mp4"}] : 
        []
      const response = await bundlr.uploadFile(`./NFTs/${fileToUpload.folder}/${fileToUpload.file}`); // Returns an axios response
      console.log(`${fileToUpload.file} file of NFT ${fileToUpload.folder} uploaded ==> https://arweave.net/${response.id}`);
      ar_hash = response.id;
    } catch (e) {
      console.log("Error uploading file ", e);
    }
    newArHashes.push(ar_hash);
  }
  return newArHashes;
}

function updateNFTsJson(
  filesToUpload : {folder: string; file: string;}[],
  newArHashes : string[]
) {
  let newNFTs : NFTInterface[] = parseJSONAsNFT();
  for(let i = 0; i < filesToUpload.length; i++) {
    if(newArHashes[i] != "none") {
      const nftItem = filesToUpload[i];
      let index = newNFTs.findIndex(nft => nft.name == nftItem.file)
      if(index == -1) {
        index = newNFTs.length;
        newNFTs.push({name: nftItem.folder, updated: Date.now()})
      }
      newNFTs[index].updated = Date.now();
      if(nftItem.file.slice(-7, -4) == "350") {
        newNFTs[index].image350 = {
          md5_hash : md5File.sync(`./NFTs/${nftItem.folder}/${nftItem.file}`),
          ar_hash : newArHashes[i],
          ar_link : `ar://${newArHashes[i]}`,
          http_link : `https://arweave.net/${newArHashes[i]}`,
          updated : Date.now()
        };
      }
      if(nftItem.file.slice(-7, -4) == "512") {
        newNFTs[index].image512 = {
          md5_hash : md5File.sync(`./NFTs/${nftItem.folder}/${nftItem.file}`),
          ar_hash : newArHashes[i],
          ar_link : `ar://${newArHashes[i]}`,
          http_link : `https://arweave.net/${newArHashes[i]}`,
          updated : Date.now()
        };
      }
      if(nftItem.file.slice(-8, -4) == "3000") {
        newNFTs[index].image3000 = {
          md5_hash : md5File.sync(`./NFTs/${nftItem.folder}/${nftItem.file}`),
          ar_hash : newArHashes[i],
          ar_link : `ar://${newArHashes[i]}`,
          http_link : `https://arweave.net/${newArHashes[i]}`,
          updated : Date.now()
        };
      }
      if(nftItem.file.slice(-3) == "mp4") {
        newNFTs[index].animation = {
          md5_hash : md5File.sync(`./NFTs/${nftItem.folder}/${nftItem.file}`),
          ar_hash : newArHashes[i],
          ar_link : `ar://${newArHashes[i]}`,
          http_link : `https://arweave.net/${newArHashes[i]}`,
          updated : Date.now()
        };
      }
      console.log(`Updated ${filesToUpload[i].file} info in ${filesToUpload[i].file} NFT`)
    }
  }
  fs.writeFileSync(`NFTs.json`, JSON.stringify(newNFTs), { flag: 'w' });
}

function parseJSONAsNFT() : NFTInterface[] {
  let NFTs : NFTInterface[] = [];
  const jsonNFTs = JSON.parse(fs.readFileSync("./NFTs.json").toString());
  for(const nft of jsonNFTs) {
    const NFT : NFTInterface = {
      name: nft.name,
      updated: nft.updated,
      image350: nft.image350,
      image512: nft.image512,
      image3000: nft.image3000,
      animation: nft.animation
    }
    NFTs.push(NFT);
  } 
  return NFTs;
}

updateArweaveNFTs();