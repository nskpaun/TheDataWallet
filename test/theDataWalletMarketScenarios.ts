const TheDataWallet = artifacts.require("TheDataWallet");

import { getTestClient } from "./TestDataWalletClient";
import { getTestConsumer } from "./TestDataWalletConsumer";

import { assert } from "chai";
import "mocha";
import { getTestData } from "./TestVectors";
import { TheDataWalletInstance } from "../types/truffle-contracts";
import { Delta } from "../types/truffle-contracts/TheDataWallet";

contract('TheDataWallet_PriceDynamics', (accounts) => {
    let theDataWalletInstance: TheDataWalletInstance
    let consumerAccount: string;
    let denialOfServiceAttackerAccount: string;
    let clientAccount: string;
    before('Set up instance and actors', async () => {
        theDataWalletInstance = await TheDataWallet.deployed();
        consumerAccount = accounts[0];
        clientAccount = accounts[2];
    });
    it('should log price and metadata to the network.',
        async () => {
            const testData = getTestData();
            const testConsumer = getTestConsumer(consumerAccount, theDataWalletInstance);
            const testClient = getTestClient(clientAccount, theDataWalletInstance, testData[0]);

            await testConsumer.requestDelta(clientAccount, 100);
            await testClient.publishDelta();

            const pastEvents = await theDataWalletInstance.getPastEvents("Delta");
            const eventData = pastEvents[0];
            const latestDelta: Delta = <Delta>{ name: "Delta", args: { ...eventData.returnValues } };

            assert.isTrue(latestDelta.args._didTrainingMetaDataMatch, "meta data should be reported as matched.");
            assert.equal(latestDelta.args._metaData.numberOfFeatures, 1, "number of features should match.");
        });
    it('should log price and metadata to network with mismatch flag',
        async () => {
            const testData = getTestData();
            const testConsumer = getTestConsumer(consumerAccount, theDataWalletInstance);
            const testClient = getTestClient(clientAccount, theDataWalletInstance, testData[0]);

            await testConsumer.requestDelta(clientAccount, 100);
            await testClient.publishDelta(1, 2);

            const pastEvents = await theDataWalletInstance.getPastEvents("Delta");
            const eventData = pastEvents[0];
            const latestDelta: Delta = <Delta>{ name: "Delta", args: { ...eventData.returnValues } };

            assert.isFalse(latestDelta.args._didTrainingMetaDataMatch, "meta data should be reported as not matched.");
            assert.equal(latestDelta.args._metaData.numberOfFeatures, 2, "wrong number of features reported.")
        });
});