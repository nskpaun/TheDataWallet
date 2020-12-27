import { TheDataWalletInstance } from "../types/truffle-contracts";
import { LinearModel } from "./LinearModel";
import { trainLinearModel } from "./Trainer";

interface TestDataWalletClient {
    publishDelta: (trainingType?: number, numberOfFeatures?: number) => Promise<void>;
    denyActiveRequest: (desiredAmount: number) => Promise<void>;
    testAddresss: string;
}

type Data = {
    height: number;
    weight: number;
}

export function getTestClient(account: string, theDataWalletInstance: TheDataWalletInstance, data: Data): TestDataWalletClient {
    return {
        testAddresss: account,
        publishDelta: async (trainingType = 1, numberOfFeatures = 1) => {
            const request = await theDataWalletInstance.getActiveRequest({ from: account });
            const fromAddress = request[0];
            const modelJSON = request[1];
            const requestID = request[2];

            if (!fromAddress || !modelJSON || !requestID) {
                return;
            }

            const model = <LinearModel>JSON.parse(modelJSON);
            const delta = trainLinearModel(model, data.height, data.weight);

            await theDataWalletInstance.publishDelta(
                fromAddress, JSON.stringify(delta), requestID, trainingType, numberOfFeatures, { from: account });
        },
        denyActiveRequest: async (desiredAmount: number) => {
            const request = await theDataWalletInstance.getActiveRequest({ from: account });
            const requestID = request[2];

            await theDataWalletInstance.denyActiveRequest(requestID, desiredAmount, { from: account });
        },
    };
};