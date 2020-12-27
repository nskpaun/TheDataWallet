pragma solidity >=0.4.25;

contract TheDataWallet {
    struct DeltaRequest {
        address from;
        address to;
        uint256 amount;
        uint256 requestID;
        string modelJson;
    }

    mapping(address => uint256) balances;

    mapping(address => DeltaRequest) activeRequests;

    uint256 private monotonicIncrementer = 1;
    DeltaRequest EMPTY_REQUEST = DeltaRequest(address(0),address(0),0,0,"");


    event RequestWasOutbid(uint256 _requestID, uint256 _oldAmount, uint256 _newAmount);
    event Delta(address indexed _from, address indexed _to, string _deltaJson);

    constructor() public {
        balances[tx.origin] = 10000;
    }

    function requestDelta(
        address receiver,
        uint256 amount,
        string memory modelJson
    ) public returns (uint256 requestID) {
        if (balances[msg.sender] < amount){
            return 0;
        }

        DeltaRequest memory activeRequest = activeRequests[receiver];

        if (activeRequest.requestID > 0 && activeRequest.amount >= amount) {
            // Active request at higher price.
            return 0;
        }

        if (activeRequest.amount > 0) {
            uint256 oldAmount = activeRequest.amount;
            balances[receiver] -= oldAmount;
            balances[activeRequest.from] += oldAmount;
            emit RequestWasOutbid(activeRequest.requestID, oldAmount, amount);
        }

        balances[msg.sender] -= amount;
        balances[receiver] += amount;

        uint256 generatedRequestID = monotonicIncrementer;
        monotonicIncrementer += 1;
        activeRequests[receiver] = DeltaRequest(
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
        if (activeRequests[msg.sender].requestID != requestID) return false;

        activeRequests[msg.sender] = EMPTY_REQUEST;
        emit Delta(msg.sender, receiver, deltaJson);
        return true;
    }

    function getActiveRequest() public view returns (address, string memory, uint256) {
       DeltaRequest memory activeRequest = activeRequests[msg.sender];
       return (activeRequest.from, activeRequest.modelJson, activeRequest.requestID);
    }

    function getBalance(address addr) public view returns (uint256) {
        return balances[addr];
    }

    function transfer(address addr, uint256 amount) public returns (bool) {
        if (balances[msg.sender] < amount) {
            return false;
        }

        balances[msg.sender] -= amount;
        balances[addr] += amount;

        return true;
    }
}
