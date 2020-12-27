import { TheDataWalletInstance } from "../types/truffle-contracts";
import { DeltaRequest } from "../types/truffle-contracts/TheDataWallet";
import { LinearModel } from "./LinearModel";
import { trainLinearModel } from "./Trainer";

interface TestDataWalletClient {
    publishDelta: () => Promise<void>
    testAddresss: string
}

type Data = {
    height: number;
    weight: number;
}

export function getTestClient(account: string, theDataWalletInstance: TheDataWalletInstance, data: Data): TestDataWalletClient {
    return {
        testAddresss: account,
        publishDelta: async () => {
            const deltaRequests = await theDataWalletInstance.getPastEvents("DeltaRequest");

            if (!deltaRequests || deltaRequests.length < 1) {
                return;
            }
            const eventData = deltaRequests[deltaRequests.length - 1];
            const latestDeltaRequest: DeltaRequest = <DeltaRequest>{ name: "DeltaRequest", args: { ...eventData.returnValues } };

            if (latestDeltaRequest.args._to !== account) {
                return;
            }

            const model = <LinearModel>JSON.parse(latestDeltaRequest.args._modelJson);
            const delta = trainLinearModel(model, data.height, data.weight);

            await theDataWalletInstance.publishDelta(
                latestDeltaRequest.args._from, JSON.stringify(delta), latestDeltaRequest.args._requestID, { from: account });
        }
    };
};