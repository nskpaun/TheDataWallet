const TheDataWallet = artifacts.require("TheDataWallet");

import { getTestClient } from "./TestDataWalletClient";
import { getTestConsumer } from "./TestDataWalletConsumer";

import { assert } from "chai";
import "mocha";
import { getTestData } from "./TestVectors";
import { TheDataWalletInstance } from "../types/truffle-contracts";
import * as BN from "bn.js";

contract('TheDataWallet_PriceDynamics', (accounts) => {
    let theDataWalletInstance: TheDataWalletInstance
    let consumerAccount: string;
    let denialOfServiceAttackerAccount: string;
    let clientAccount: string;
    before('Set up instance and actors', async () => {
        theDataWalletInstance = await TheDataWallet.deployed();
        consumerAccount = accounts[0];
        denialOfServiceAttackerAccount = accounts[1];
        clientAccount = accounts[2];

        // Give attacker some currency to work with.
        theDataWalletInstance.transfer(denialOfServiceAttackerAccount, 5000, { from: consumerAccount })
    });
    it('should have a mechanism for consumers to stop actors trying to disrupt normal exchange by spamming at low prices',
        async () => {
            const testData = getTestData();
            const testConsumer = getTestConsumer(consumerAccount, theDataWalletInstance);
            const testDenialOfServiceAttacker = getTestConsumer(denialOfServiceAttackerAccount, theDataWalletInstance);
            const testClient = getTestClient(clientAccount, theDataWalletInstance, testData[0]);

            const clientAccountBalanceStart: BN = (await theDataWalletInstance.getBalance(testClient.testAddresss));
            const consumerBalanceStart: BN = (await theDataWalletInstance.getBalance(accounts[0]));
            const denialOfServiceAttackerBalanceStart: BN = (await theDataWalletInstance.getBalance(accounts[1]));

            await testDenialOfServiceAttacker.requestDelta(clientAccount, 1);
            await testConsumer.requestDelta(clientAccount, 100);

            // See log for request outbid.
            const pastEvents = await theDataWalletInstance.getPastEvents("RequestWasOutbid");
            assert.equal(pastEvents.length, 1);

            await testClient.publishDelta();

            const clientAccountBalance: BN = (await theDataWalletInstance.getBalance(testClient.testAddresss));
            const consumerBalance: BN = (await theDataWalletInstance.getBalance(accounts[0]));
            const denialOfServiceAttackerBalance: BN = (await theDataWalletInstance.getBalance(accounts[1]));

            assert.equal(clientAccountBalance.toString(), clientAccountBalanceStart.add(new BN(100)).toString());
            assert.equal(consumerBalance.toString(), consumerBalanceStart.sub(new BN(100)).toString());
            assert.equal(denialOfServiceAttackerBalance.toString(), denialOfServiceAttackerBalanceStart.toString());
        });
    it('should allow clients to deny a request.',
        async () => {
            const testData = getTestData();
            const testConsumer = getTestConsumer(consumerAccount, theDataWalletInstance);
            const testClient = getTestClient(clientAccount, theDataWalletInstance, testData[0]);

            const clientAccountBalanceStart: BN = (await theDataWalletInstance.getBalance(testClient.testAddresss));
            const consumerBalanceStart: BN = (await theDataWalletInstance.getBalance(accounts[0]));

            await testConsumer.requestDelta(clientAccount, 50);

            let clientAccountBalance: BN = (await theDataWalletInstance.getBalance(testClient.testAddresss));
            let consumerBalance: BN = (await theDataWalletInstance.getBalance(accounts[0]));

            assert.equal(clientAccountBalance.toString(), clientAccountBalanceStart.toString());
            assert.equal(consumerBalance.toString(), consumerBalanceStart.sub(new BN(50)).toString());

            await testClient.denyActiveRequest(100);

            clientAccountBalance = (await theDataWalletInstance.getBalance(testClient.testAddresss));
            consumerBalance = (await theDataWalletInstance.getBalance(accounts[0]));

            assert.equal(clientAccountBalance.toString(), clientAccountBalanceStart.toString());
            assert.equal(consumerBalance.toString(), consumerBalanceStart.toString());

            const pastEvents = await theDataWalletInstance.getPastEvents("RequestWasDenied");
            assert.equal(pastEvents[0].returnValues._desiredAmount, 100);
        });
});