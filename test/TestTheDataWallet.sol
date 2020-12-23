pragma solidity >=0.4.25 <0.7.0;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/TheDataWallet.sol";

contract TestTheDataWallet {

  function testInitialBalanceUsingDeployedContract() public {
    TheDataWallet theDataWallet = TheDataWallet(DeployedAddresses.TheDataWallet());

    uint expected = 10000;

    Assert.equal(meta.getBalance(tx.origin), expected, "Owner should have 10000 TheDataWallet initially");
  }

  function testInitialBalanceWithNewTheDataWallet() public {
    TheDataWallet meta = new TheDataWallet();

    uint expected = 10000;

    Assert.equal(meta.getBalance(tx.origin), expected, "Owner should have 10000 TheDataWallet initially");
  }

}
