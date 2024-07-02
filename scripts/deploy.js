const hre = require("hardhat");

async function main() {
  // Get the contract factory
  const Voting = await hre.ethers.getContractFactory("Voting");

  // Deploy the contract
  const voting = await Voting.deploy();
  await voting.deployed();

  // Log the address of the deployed contract
  console.log(`Voting deployed to: ${voting.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
