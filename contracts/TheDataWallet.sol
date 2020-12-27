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

    constructor() public {}

    function requestDelta(
        address payable receiver,
        string memory modelJson,
        TrainingType trainingType,
        uint32 numberOfFeatures
    ) public payable returns (uint256 requestID) {
        uint256 amount = msg.value;
        DeltaRequest memory activeRequest = activeRequests[receiver];

        // Verify request.
        if (activeRequest.requestID > 0 && activeRequest.amount >= amount) {
            return 0;
        }

        // Cancel current request if new amount is higher.
        if (activeRequest.amount > 0) {
            uint256 oldAmount = activeRequest.amount;
            activeRequest.escrow.refundBuyer();
            emit RequestWasOutbid(activeRequest.requestID, oldAmount, amount);
        }

        // Create Request.
        uint256 generatedRequestID = monotonicIncrementer;
        monotonicIncrementer += 1;
        TDWEscrow escrow = new TDWEscrow(msg.sender, receiver);

        activeRequests[receiver] = DeltaRequest(
            msg.sender,
            receiver,
            amount,
            generatedRequestID,
            modelJson,
            TrainingMetaData(numberOfFeatures, trainingType),
            escrow
        );

        // Deposit value to escrow.
        escrow.deposit.value(amount)();
        return generatedRequestID;
    }

    function publishDelta(
        address receiver,
        string memory deltaJson,
        uint256 requestID,
        TrainingType trainingType,
        uint32 numberOfFeatures
    ) public returns (bool validFulfillment) {

        // Only publish an active request.
        DeltaRequest memory request = activeRequests[msg.sender];
        if (request.requestID != requestID) return false;

        // Create and publish delta.
        bool didTrainingMetaDataMatchRequest =
            request.metaData.trainingType == trainingType &&
                request.metaData.numberOfFeatures == numberOfFeatures;

        activeRequests[msg.sender] = EMPTY_REQUEST;
        emit Delta(
            msg.sender,
            receiver,
            deltaJson,
            request.amount,
            TrainingMetaData(numberOfFeatures, trainingType),
            didTrainingMetaDataMatchRequest
        );

        // Deliver funds to delta sender.
        request.escrow.confirmDelivery();
        return true;
    }

    function denyActiveRequest(uint256 requestID, uint256 desiredAmount)
        public
        returns (bool success)
    {
        DeltaRequest memory activeRequest = activeRequests[msg.sender];

        // Can only cancel your own request.
        if (activeRequest.requestID != requestID) {
            return false;
        }

        // Cannot make smaller counter-offer.
        if (desiredAmount <= activeRequest.amount) {
            return false;
        }

        // Clear active request.
        activeRequests[msg.sender] = EMPTY_REQUEST;

        // Publish request denied event.
        emit RequestWasDenied(requestID, activeRequest.amount, desiredAmount);

        // Refund delta requester.
        activeRequest.escrow.refundBuyer();

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
}
