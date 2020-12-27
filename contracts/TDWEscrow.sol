pragma solidity >=0.4.25;

contract TDWEscrow {
    enum State { AWAITING_PAYMENT, AWAITING_DELIVERY, COMPLETE }
    
    State public currState;
    
    address payable public buyer;
    address payable public seller;
    
    modifier onlyBuyer() {
        require(msg.sender == buyer, "Only buyer can call this method");
        _;
    }
    
    constructor(address payable _buyer, address payable _seller) public {
        buyer = _buyer;
        seller = _seller;
    }
    
    function deposit() external payable {
        require(currState == State.AWAITING_PAYMENT, "Already paid");
        currState = State.AWAITING_DELIVERY;
    }
    
    function confirmDelivery() public {
        require(currState == State.AWAITING_DELIVERY, "Cannot confirm delivery");
        seller.transfer(address(this).balance);
        currState = State.COMPLETE;
    }

    function refundBuyer() public {
        require(currState == State.AWAITING_DELIVERY, "Cannot refund buyer");
        buyer.transfer(address(this).balance);
        currState = State.COMPLETE;
    }
}