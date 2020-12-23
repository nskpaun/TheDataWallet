const TheDataWallet = artifacts.require("TheDataWallet");

module.exports = function(deployer) {
  deployer.deploy(TheDataWallet);
};
