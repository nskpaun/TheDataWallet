import { TheDataWalletInstance } from "../types/truffle-contracts";
import { DeltaRequest } from "../types/truffle-contracts/TheDataWallet";

interface TestDataWalletClient {
    publishDelta: () => Promise<void>
}

export function getTestClient(account: string, theDataWalletInstance: TheDataWalletInstance): TestDataWalletClient {
    return {
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

            const newModel = { m: 2, b: 3 };

            await theDataWalletInstance.publishDelta(
                latestDeltaRequest.args._from, JSON.stringify(newModel), latestDeltaRequest.args._requestID, { from: account });
        }
    };
};