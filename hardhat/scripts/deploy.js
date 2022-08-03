const { ethers } = require("hardhat");
require("dotenv").config({ path: ".env"});
const { METADATA_URL } = require("../constants");

async function main() {

  // URL from where we can extract the metadata for a DePleb NFT 
  const metadataURL = METADATA_URL;

  /*
    A ContractFactory in ether.js is an abstraction used to deploy new smart contracts,
    so dePlebsContract here is a factory for instances of our DePlebs contract
  */

    const dePlebsContract = await ethers.getContractFactory("DePlebs");

    // deploy contract 
    const deployedDePlebsContract = await dePlebsContract.deploy(
      metadataURL
    )

    // print the address of the deployed contract 
    console.log("DePlebs Contract Address:", deployedDePlebsContract.address);

}

// Calling the main function and catching any errors 
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })