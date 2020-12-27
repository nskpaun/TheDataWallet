pragma solidity >=0.4.25;
pragma experimental ABIEncoderV2;

import "./TDWEscrow.sol";

contract TheDataWallet {
    struct DeltaRequest {
        address from;
        address to;
        uint256 amount;
        uint256 requestID;
        string modelJson;
        TrainingMetaData metaData;
        TDWEscrow escrow;
    }

    struct TrainingMetaData {
        uint32 numberOfFeatures;
        TrainingType trainingType;
    }

    enum TrainingType {
        EMPTY,
        STOCHASTIC_GRADIENT_DESCENT,
        GRADIENT_BOOSTING_DECISION_TREE
    }
    DeltaRequest EMPTY_REQUEST =
        DeltaRequest(
            address(0),
            address(0),
            0,
            0,
            "",
            TrainingMetaData(0, TrainingType.EMPTY),
            new TDWEscrow(address(0), address(0))
        );

    mapping(address => uint256) balances;
    mapping(address => DeltaRequest) activeRequests;
    uint256 private monotonicIncrementer = 1;

    event RequestWasOutbid(
        uint256 _requestID,
        uint256 _oldAmount,
        uint256 _newAmount
    );
    event RequestWasDenied(
        uint256 _requestID,
        uint256 _oldAmount,
        uint256 _desiredAmount
    );
    event Delta(
        address indexed _from,
        address indexed _to,
        string _deltaJson,
        uint256 _amountPaid,
        TrainingMetaData _metaData,
        bool _didTrainingMetaDataMatch
    );

    constructor() public {
        balances[tx.origin] = 10000;
    }

    function requestDelta(
        address payable receiver,
        string memory modelJson,
        TrainingType trainingType,
        uint32 numberOfFeatures
    ) public payable returns (uint256 requestID) {
        require(msg.value > 0, "Not funded hahaha!");
        uint256 amount = msg.value;
        DeltaRequest memory activeRequest = activeRequests[receiver];

        if (activeRequest.requestID > 0 && activeRequest.amount >= amount) {
            // Active request at higher price.
            return 0;
        }

        if (activeRequest.amount > 0) {
            uint256 oldAmount = activeRequest.amount;
            activeRequest.escrow.refundBuyer();
            emit RequestWasOutbid(activeRequest.requestID, oldAmount, amount);
        }

        uint256 generatedRequestID = monotonicIncrementer;
        monotonicIncrementer += 1;

        TDWEscrow escrow = new TDWEscrow(msg.sender, receiver);
        escrow.deposit.value(amount)();

        activeRequests[receiver] = DeltaRequest(
            msg.sender,
            receiver,
            amount,
            generatedRequestID,
            modelJson,
            TrainingMetaData(numberOfFeatures, trainingType),
            escrow
        );
        return generatedRequestID;
    }

    function publishDelta(
        address receiver,
        string memory deltaJson,
        uint256 requestID,
        TrainingType trainingType,
        uint32 numberOfFeatures
    ) public returns (bool validFulfillment) {
        DeltaRequest memory request = activeRequests[msg.sender];
        if (request.requestID != requestID) return false;

        bool didTrainingMetaDataMatchRequest =
            request.metaData.trainingType == trainingType &&
                request.metaData.numberOfFeatures == numberOfFeatures;

        request.escrow.confirmDelivery();

        activeRequests[msg.sender] = EMPTY_REQUEST;
        emit Delta(
            msg.sender,
            receiver,
            deltaJson,
            request.amount,
            TrainingMetaData(numberOfFeatures, trainingType),
            didTrainingMetaDataMatchRequest
        );
        return true;
    }

    function denyActiveRequest(uint256 requestID, uint256 desiredAmount)
        public
        returns (bool success)
    {
        DeltaRequest memory activeRequest = activeRequests[msg.sender];
        if (activeRequest.requestID != requestID) {
            return false;
        }

        if (desiredAmount <= activeRequest.amount) {
            return false;
        }

        activeRequest.escrow.refundBuyer();
        activeRequests[msg.sender] = EMPTY_REQUEST;

        emit RequestWasDenied(requestID, activeRequest.amount, desiredAmount);
        return true;
    }

    function getActiveRequest()
        public
        view
        returns (
            address,
            string memory,
            uint256
        )
    {
        DeltaRequest memory activeRequest = activeRequests[msg.sender];
        return (
            activeRequest.from,
            activeRequest.modelJson,
            activeRequest.requestID
        );
    }

    function getBalance(address addr) public view returns (uint256) {
        return addr.balance;
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
