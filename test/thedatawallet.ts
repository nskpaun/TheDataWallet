const TheDataWallet = artifacts.require("TheDataWallet");

import { BigNumber } from 'bignumber.js'
import { assert } from "chai";
import "mocha";

contract('TheDataWallet', (accounts) => {
    it('should put 10000 TheDataWallet in the first account', async () => {
        const TheDataWalletInstance = await TheDataWallet.deployed();
        const balance = await TheDataWalletInstance.getBalance(accounts[0]);

        assert.equal(balance.toNumber(), 10000, "10000 wasn't in the first account");
    });
    it('should send coin correctly', async () => {
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
});
