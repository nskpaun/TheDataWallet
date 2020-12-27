/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import BN from "bn.js";
import { EventData, PastEventOptions } from "web3-eth-contract";

export interface TheDataWalletContract
  extends Truffle.Contract<TheDataWalletInstance> {
  "new"(meta?: Truffle.TransactionDetails): Promise<TheDataWalletInstance>;
}

export interface Delta {
  name: "Delta";
  args: {
    _from: string;
    _to: string;
    _deltaJson: string;
    _amountPaid: BN;
    _metaData: { numberOfFeatures: BN; trainingType: BN };
    _didTrainingMetaDataMatch: boolean;
    0: string;
    1: string;
    2: string;
    3: BN;
    4: { numberOfFeatures: BN; trainingType: BN };
    5: boolean;
  };
}

export interface RequestWasDenied {
  name: "RequestWasDenied";
  args: {
    _requestID: BN;
    _oldAmount: BN;
    _desiredAmount: BN;
    0: BN;
    1: BN;
    2: BN;
  };
}

export interface RequestWasOutbid {
  name: "RequestWasOutbid";
  args: {
    _requestID: BN;
    _oldAmount: BN;
    _newAmount: BN;
    0: BN;
    1: BN;
    2: BN;
  };
}

type AllEvents = Delta | RequestWasDenied | RequestWasOutbid;

export interface TheDataWalletInstance extends Truffle.ContractInstance {
  requestDelta: {
    (
      receiver: string,
      modelJson: string,
      trainingType: number | BN | string,
      numberOfFeatures: number | BN | string,
      txDetails?: Truffle.TransactionDetails
    ): Promise<Truffle.TransactionResponse<AllEvents>>;
    call(
      receiver: string,
      modelJson: string,
      trainingType: number | BN | string,
      numberOfFeatures: number | BN | string,
      txDetails?: Truffle.TransactionDetails
    ): Promise<BN>;
    sendTransaction(
      receiver: string,
      modelJson: string,
      trainingType: number | BN | string,
      numberOfFeatures: number | BN | string,
      txDetails?: Truffle.TransactionDetails
    ): Promise<string>;
    estimateGas(
      receiver: string,
      modelJson: string,
      trainingType: number | BN | string,
      numberOfFeatures: number | BN | string,
      txDetails?: Truffle.TransactionDetails
    ): Promise<number>;
  };

  publishDelta: {
    (
      receiver: string,
      deltaJson: string,
      requestID: number | BN | string,
      trainingType: number | BN | string,
      numberOfFeatures: number | BN | string,
      txDetails?: Truffle.TransactionDetails
    ): Promise<Truffle.TransactionResponse<AllEvents>>;
    call(
      receiver: string,
      deltaJson: string,
      requestID: number | BN | string,
      trainingType: number | BN | string,
      numberOfFeatures: number | BN | string,
      txDetails?: Truffle.TransactionDetails
    ): Promise<boolean>;
    sendTransaction(
      receiver: string,
      deltaJson: string,
      requestID: number | BN | string,
      trainingType: number | BN | string,
      numberOfFeatures: number | BN | string,
      txDetails?: Truffle.TransactionDetails
    ): Promise<string>;
    estimateGas(
      receiver: string,
      deltaJson: string,
      requestID: number | BN | string,
      trainingType: number | BN | string,
      numberOfFeatures: number | BN | string,
      txDetails?: Truffle.TransactionDetails
    ): Promise<number>;
  };

  denyActiveRequest: {
    (
      requestID: number | BN | string,
      desiredAmount: number | BN | string,
      txDetails?: Truffle.TransactionDetails
    ): Promise<Truffle.TransactionResponse<AllEvents>>;
    call(
      requestID: number | BN | string,
      desiredAmount: number | BN | string,
      txDetails?: Truffle.TransactionDetails
    ): Promise<boolean>;
    sendTransaction(
      requestID: number | BN | string,
      desiredAmount: number | BN | string,
      txDetails?: Truffle.TransactionDetails
    ): Promise<string>;
    estimateGas(
      requestID: number | BN | string,
      desiredAmount: number | BN | string,
      txDetails?: Truffle.TransactionDetails
    ): Promise<number>;
  };

  getActiveRequest(
    txDetails?: Truffle.TransactionDetails
  ): Promise<{ 0: string; 1: string; 2: BN }>;

  getBalance(addr: string, txDetails?: Truffle.TransactionDetails): Promise<BN>;

  methods: {
    requestDelta: {
      (
        receiver: string,
        modelJson: string,
        trainingType: number | BN | string,
        numberOfFeatures: number | BN | string,
        txDetails?: Truffle.TransactionDetails
      ): Promise<Truffle.TransactionResponse<AllEvents>>;
      call(
        receiver: string,
        modelJson: string,
        trainingType: number | BN | string,
        numberOfFeatures: number | BN | string,
        txDetails?: Truffle.TransactionDetails
      ): Promise<BN>;
      sendTransaction(
        receiver: string,
        modelJson: string,
        trainingType: number | BN | string,
        numberOfFeatures: number | BN | string,
        txDetails?: Truffle.TransactionDetails
      ): Promise<string>;
      estimateGas(
        receiver: string,
        modelJson: string,
        trainingType: number | BN | string,
        numberOfFeatures: number | BN | string,
        txDetails?: Truffle.TransactionDetails
      ): Promise<number>;
    };

    publishDelta: {
      (
        receiver: string,
        deltaJson: string,
        requestID: number | BN | string,
        trainingType: number | BN | string,
        numberOfFeatures: number | BN | string,
        txDetails?: Truffle.TransactionDetails
      ): Promise<Truffle.TransactionResponse<AllEvents>>;
      call(
        receiver: string,
        deltaJson: string,
        requestID: number | BN | string,
        trainingType: number | BN | string,
        numberOfFeatures: number | BN | string,
        txDetails?: Truffle.TransactionDetails
      ): Promise<boolean>;
      sendTransaction(
        receiver: string,
        deltaJson: string,
        requestID: number | BN | string,
        trainingType: number | BN | string,
        numberOfFeatures: number | BN | string,
        txDetails?: Truffle.TransactionDetails
      ): Promise<string>;
      estimateGas(
        receiver: string,
        deltaJson: string,
        requestID: number | BN | string,
        trainingType: number | BN | string,
        numberOfFeatures: number | BN | string,
        txDetails?: Truffle.TransactionDetails
      ): Promise<number>;
    };

    denyActiveRequest: {
      (
        requestID: number | BN | string,
        desiredAmount: number | BN | string,
        txDetails?: Truffle.TransactionDetails
      ): Promise<Truffle.TransactionResponse<AllEvents>>;
      call(
        requestID: number | BN | string,
        desiredAmount: number | BN | string,
        txDetails?: Truffle.TransactionDetails
      ): Promise<boolean>;
      sendTransaction(
        requestID: number | BN | string,
        desiredAmount: number | BN | string,
        txDetails?: Truffle.TransactionDetails
      ): Promise<string>;
      estimateGas(
        requestID: number | BN | string,
        desiredAmount: number | BN | string,
        txDetails?: Truffle.TransactionDetails
      ): Promise<number>;
    };

    getActiveRequest(
      txDetails?: Truffle.TransactionDetails
    ): Promise<{ 0: string; 1: string; 2: BN }>;

    getBalance(
      addr: string,
      txDetails?: Truffle.TransactionDetails
    ): Promise<BN>;
  };

  getPastEvents(event: string): Promise<EventData[]>;
  getPastEvents(
    event: string,
    options: PastEventOptions,
    callback: (error: Error, event: EventData) => void
  ): Promise<EventData[]>;
  getPastEvents(event: string, options: PastEventOptions): Promise<EventData[]>;
  getPastEvents(
    event: string,
    callback: (error: Error, event: EventData) => void
  ): Promise<EventData[]>;
}
