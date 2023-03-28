This repository contains the NFT images and animations for StableBattle Project.
# How to use
To upload new images to Arweave drop a folder with new/updated nft into the `NFTs` folder.
Make sure that all file names end on either `300.png`, `512.png`, `3000.png` or `.mp4`.
Run yarn install && yarn upload. This will upload all updated files to Arweave and update the `NFTs.json`. Note that it may take a while to since it uses lazy bundlr funding.