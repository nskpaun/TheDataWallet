const TheDataWallet = artifacts.require("TheDataWallet");
import * as BN from "bn.js";

import { getTestClient } from "./TestDataWalletClient";
import { getTestConsumer } from "./TestDataWalletConsumer";

import { assert } from "chai";
import "mocha";
import { getTestData } from "./TestVectors";

contract('TheDataWalletWorkflowSimple', (accounts) => {
    it('should send delta and compute deltas correctly', async () => {
        const theDataWalletInstance = await TheDataWallet.deployed();

        const testData = getTestData();
        const consumerAccount = accounts[0];
        const clientAccount = accounts[1];

        const testConsumer = getTestConsumer(consumerAccount, theDataWalletInstance);
        const testClient = getTestClient(clientAccount, theDataWalletInstance, testData[0]);

        await testConsumer.requestDelta(clientAccount);
        await testClient.publishDelta();
        await testConsumer.trainModel();

        const resultModel = testConsumer.getCurrentModel();

        assert.equal(resultModel.slope, 6.511);
        assert.equal(resultModel.intercept, -312.663);
    });
});

contract('TheDataWallet_SingleConsumer_FederatedStochasticGradientDescent', (accounts) => {
    it('should send delta and compute deltas correctly', async () => {
        const theDataWalletInstance = await TheDataWallet.deployed();

        const testData = getTestData();
        const consumerAccount = accounts[0];

        const testClients = testData.map((testDatum, index) => {
            return getTestClient(accounts[index + 1], theDataWalletInstance, testDatum);
        })


        const testConsumer = getTestConsumer(consumerAccount, theDataWalletInstance);

        for (let x = 0; x < 10; x++) {
            for (const testClient of testClients) {
                await testConsumer.requestDelta(testClient.testAddresss);
                await testClient.publishDelta();
                await testConsumer.trainModel();
            }
        }

        const resultModel = testConsumer.getCurrentModel();
        assert.equal(Math.trunc(resultModel.slope * 100), 692);
        assert.equal(Math.trunc(resultModel.intercept), -322);
    });
});

contract('TheDataWallet', (accounts) => {
    it('account 0 should have an initial balance', async () => {
        const TheDataWalletInstance = await TheDataWallet.deployed();
        let balance: BN = await TheDataWalletInstance.getBalance(accounts[0]);
        assert.isFalse(balance.isZero(), "account funded");

        balance = await TheDataWalletInstance.getBalance(accounts[1]);
        assert.isFalse(balance.isZero(), "account funded");

        balance = await TheDataWalletInstance.getBalance(accounts[2]);
        assert.isFalse(balance.isZero(), "account funded");
    });
    it('should send deltas correctly', async () => {
        const TheDataWalletInstance = await TheDataWallet.deployed();

        // Setup 2 accounts.
        const accountOne = accounts[0];
        const accountTwo = accounts[1];

        // Get initial balances of first and second account.
        const accountOneStartingBalance: BN = (await TheDataWalletInstance.getBalance(accountOne));
        const accountTwoStartingBalance: BN = (await TheDataWalletInstance.getBalance(accountTwo));

        // Request a delta from first account to second.
        const amount = 10;
        const requestID = (await TheDataWalletInstance.requestDelta.call(accountTwo, "{}", 1, 1, { from: accountOne, value: new BN(amount), gasPrice: 0 })).toNumber();
        await TheDataWalletInstance.requestDelta(accountTwo, "{}", 1, 1, { from: accountOne, value: new BN(amount), gasPrice: 0 });
        assert.equal(requestID, 1, "Did not receive expected request ID");

        // Publish delta for transaction ID.

        const successfulPublish = await TheDataWalletInstance.publishDelta.call(accountOne, "{}", requestID, 1, 1, { from: accountTwo, gasPrice: 0 });
        await TheDataWalletInstance.publishDelta(accountOne, "{}", requestID, 1, 1, { from: accountTwo, gasPrice: 0 });
        assert.isTrue(successfulPublish, "Delta wasn't successfully published");

        // Get balances of first and second account after the transactions.
        const accountOneEndingBalance: BN = (await TheDataWalletInstance.getBalance(accountOne));
        const accountTwoEndingBalance: BN = (await TheDataWalletInstance.getBalance(accountTwo));

        assert.equal(accountOneEndingBalance.toString(), accountOneStartingBalance.sub(new BN(amount)).toString(), "Amount wasn't correctly taken from the sender");
        assert.equal(accountTwoEndingBalance.toString(), accountTwoStartingBalance.add(new BN(amount)).toString(), "Amount wasn't correctly sent to the receiver");
    });
    it('should not send deltas during active transactions.', async () => {
        const TheDataWalletInstance = await TheDataWallet.deployed();

        // Setup 3 accounts.
        const accountOne = accounts[0];
        const accountTwo = accounts[1];
        const accountThree = accounts[2];
        const amount = new BN(10);

        // Request a delta from first account to third.
        const requestID = (await TheDataWalletInstance.requestDelta.call(accountThree, "{33}", 1, 1, { from: accountOne, value: amount, gasPrice: 0 })).toNumber();
        await TheDataWalletInstance.requestDelta(accountThree, "{33}", 1, 1, { from: accountOne, value: amount, gasPrice: 0 });
        assert.equal(requestID, 2, "Did not receive expected request ID");

        // Request a delta from second account to third.
        const badRequestID = (await TheDataWalletInstance.requestDelta.call(accountThree, "{}", 1, 1, { from: accountTwo, value: new BN(2), gasPrice: 0 })).toNumber();
        assert.equal(badRequestID, 0, "Expected an invalid requestID");

        // Publish delta for transaction ID.
        const successfulPublish = await TheDataWalletInstance.publishDelta.call(accountOne, "{}", requestID, 1, 1, { from: accountThree, gasPrice: 0 });
        await TheDataWalletInstance.publishDelta(accountOne, "{}", requestID, 1, 1, { from: accountThree });
        assert.isTrue(successfulPublish, "Delta wasn't successfully published");

        // Make another request.
        const goodRequestID = (await TheDataWalletInstance.requestDelta.call(accountThree, "{2}", 1, 1, { from: accountTwo, value: new BN(2), gasPrice: 0 })).toNumber();
        assert.equal(goodRequestID, 3, "Expected a valid requestID after fulfilling previous transaction");
    });
});
