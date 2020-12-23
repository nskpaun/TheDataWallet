pragma solidity >=0.4.25 <0.7.0;

contract TheDataWallet {
    mapping(address => uint256) balances;
    mapping(address => uint256) activeTransactions;

    uint256 private monotonicIncrementer = 1;

    event DeltaRequest(
        address indexed _from,
        address indexed _to,
        uint256 _value,
        uint256 _requestID,
        string _modelJson
    );
    event Delta(address indexed _from, address indexed _to, string _deltaJson);

    constructor() public {
        balances[tx.origin] = 10000;
    }

    function requestDelta(
        address receiver,
        uint256 amount,
        string memory modelJson
    ) public returns (uint256 requestID) {
        if (balances[msg.sender] < amount || activeTransactions[receiver] > 0)
            return 0;
        balances[msg.sender] -= amount;
        balances[receiver] += amount;

        uint256 generatedRequestID = monotonicIncrementer;
        monotonicIncrementer += 1;
        activeTransactions[receiver] = generatedRequestID;

        emit DeltaRequest(
            msg.sender,
            receiver,
            amount,
            generatedRequestID,
            modelJson
        );
        return generatedRequestID;
    }

    function publishDelta(
        address receiver,
        string memory deltaJson,
        uint256 requestID
    ) public returns (bool validFulfillment) {
        if (activeTransactions[msg.sender] != requestID) return false;

        activeTransactions[msg.sender] = 0;

        emit Delta(msg.sender, receiver, deltaJson);

        return true;
    }

    function getBalance(address addr) public view returns (uint256) {
        return balances[addr];
    }
}
