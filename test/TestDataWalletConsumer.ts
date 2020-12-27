import { TheDataWalletInstance } from "../types/truffle-contracts";
import { Delta } from "../types/truffle-contracts/TheDataWallet";
import { LinearModel, LinearModelDelta } from "./LinearModel";

interface TestDataWalletConsumer {
    requestDelta: (clientAccount: string, amount?: number) => Promise<void>
    trainModel: () => Promise<void>
    getCurrentModel: () => LinearModel
}

export function getTestConsumer(account: string, theDataWalletInstance: TheDataWalletInstance): TestDataWalletConsumer {
    let currentModel: LinearModel = {intercept: -300, slope: 6.7, learningRate: 0.005};
    return {
        requestDelta: async (clientAccount: string, amount: number = 20) => {
            await theDataWalletInstance.requestDelta(clientAccount, amount, JSON.stringify(currentModel), { from: account });
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

            const newModel = <LinearModelDelta> JSON.parse(latestDelta.args._deltaJson);
            currentModel = {...newModel, learningRate: currentModel.learningRate*0.99};
        },
        getCurrentModel: () => {
            return currentModel
        },
    };
};
