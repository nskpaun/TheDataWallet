import { TheDataWalletInstance } from "../types/truffle-contracts";
import { Delta } from "../types/truffle-contracts/TheDataWallet";

interface TestDataWalletConsumer {
    requestDelta: (clientAccount: string) => Promise<void>
    trainModel: () => Promise<void>
    getCurrentModel: () => Model
}

interface Model {
    m: number,
    b: number,
}

export function getTestConsumer(account: string, theDataWalletInstance: TheDataWalletInstance): TestDataWalletConsumer {
    let currentModel: Model = {m: 1, b: 0};
    return {
        requestDelta: async (clientAccount: string) => {
            await theDataWalletInstance.requestDelta(clientAccount, 20, JSON.stringify(currentModel), { from: account });
        },
        trainModel: async () => {
            const deltas = await theDataWalletInstance.getPastEvents("Delta", {
                filter: {
                    _to: account,
                }
            });

            if (!deltas || deltas.length < 1) {
                return;
            }
            const eventData = deltas[deltas.length - 1];
            const latestDelta: Delta = <Delta>{ name: "Delta", args: { ...eventData.returnValues } };

            if (latestDelta.args._to !== account) {
                return;
            }

            const newModel = <Model> JSON.parse(latestDelta.args._deltaJson);
            currentModel = {m: newModel.m, b: newModel.b};
        },
        getCurrentModel: () => {
            return currentModel
        },
    };
};
