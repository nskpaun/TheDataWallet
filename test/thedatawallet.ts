const TheDataWallet = artifacts.require("TheDataWallet");

import {getTestClient} from "./TestDataWalletClient";
import {getTestConsumer} from "./TestDataWalletConsumer";

import { assert } from "chai";
import "mocha";

contract('TheDataWalletWorkflowSimple', (accounts) => {
    it('should send delta and compute deltas correctly', async () => {
        const theDataWalletInstance = await TheDataWallet.deployed();

        const consumerAccount = accounts[0];
        const clientAccount = accounts[1];

        const testConsumer = getTestConsumer(consumerAccount, theDataWalletInstance);
        const testClient = getTestClient(clientAccount, theDataWalletInstance);

        await testConsumer.requestDelta(clientAccount);
        await testClient.publishDelta();
        await testConsumer.trainModel();

        const resultModel =  testConsumer.getCurrentModel();

        assert.equal(resultModel.m, 2);
        assert.equal(resultModel.b, 3);
    });
});

contract('TheDataWallet', (accounts) => {
    it('should put 10000 TheDataWallet in the first account', async () => {
        const TheDataWalletInstance = await TheDataWallet.deployed();
        const balance = await TheDataWalletInstance.getBalance(accounts[0]);

        assert.equal(balance.toNumber(), 10000, "10000 wasn't in the first account");
    });
    it('should send deltas correctly', async () => {
        const TheDataWalletInstance = await TheDataWallet.deployed();

        // Setup 2 accounts.
        const accountOne = accounts[0];
        const accountTwo = accounts[1];

        // Get initial balances of first and second account.
        const accountOneStartingBalance = (await TheDataWalletInstance.getBalance(accountOne)).toNumber();
        const accountTwoStartingBalance = (await TheDataWalletInstance.getBalance(accountTwo)).toNumber();

        // Request a delta from first account to second.
        const amount = 10;
        const requestID = (await TheDataWalletInstance.requestDelta.call(accountTwo, amount, "{}", { from: accountOne })).toNumber();
        await TheDataWalletInstance.requestDelta(accountTwo, amount, "{}", { from: accountOne });
        assert.equal(requestID, 1, "Did not receive expected request ID");

        // Publish delta for transaction ID.

        const successfulPublish = await TheDataWalletInstance.publishDelta.call(accountOne, "{}", requestID, { from: accountTwo });
        await TheDataWalletInstance.publishDelta(accountOne, "{}", requestID, { from: accountTwo });
        assert.isTrue(successfulPublish, "Delta wasn't successfully published");

        // Get balances of first and second account after the transactions.
        const accountOneEndingBalance = (await TheDataWalletInstance.getBalance(accountOne)).toNumber();
        const accountTwoEndingBalance = (await TheDataWalletInstance.getBalance(accountTwo)).toNumber();

        assert.equal(accountOneEndingBalance, accountOneStartingBalance - amount, "Amount wasn't correctly taken from the sender");
        assert.equal(accountTwoEndingBalance, accountTwoStartingBalance + amount, "Amount wasn't correctly sent to the receiver");
    });
    it('should not send deltas during active transactions.', async () => {
        const TheDataWalletInstance = await TheDataWallet.deployed();

        // Setup 3 accounts.
        const accountOne = accounts[0];
        const accountTwo = accounts[1];
        const accountThree = accounts[2];
        const amount = 10;

        // Request a delta from first account to third.
        const requestID = (await TheDataWalletInstance.requestDelta.call(accountThree, amount, "{1}", { from: accountOne })).toNumber();
        await TheDataWalletInstance.requestDelta(accountThree, amount, "{1}", { from: accountOne });
        assert.equal(requestID, 2, "Did not receive expected request ID");

        // Request a delta from second account to third.
        const badRequestID = (await TheDataWalletInstance.requestDelta.call(accountThree, 10, "{}", { from: accountTwo })).toNumber();
        assert.equal(badRequestID, 0, "Expected an invalid requestID");

        // Publish delta for transaction ID.
        const successfulPublish = await TheDataWalletInstance.publishDelta.call(accountOne, "{}", requestID, { from: accountThree });
        await TheDataWalletInstance.publishDelta(accountOne, "{}", requestID, { from: accountThree });
        assert.isTrue(successfulPublish, "Delta wasn't successfully published");

        // Make another request.
        const goodRequestID = (await TheDataWalletInstance.requestDelta.call(accountThree, 0, "{2}", { from: accountTwo })).toNumber();
        assert.equal(goodRequestID, 3, "Expected a valid requestID after fulfilling previous transaction");
    });
});
