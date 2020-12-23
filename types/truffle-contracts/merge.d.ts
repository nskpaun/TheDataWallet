/* Generated by ts-generator ver. 0.0.8 */
/* tslint:disable */

/// <reference types="truffle-typings" />

import * as TruffleContracts from ".";

declare global {
  namespace Truffle {
    interface Artifacts {
      require(name: "ConvertLib"): TruffleContracts.ConvertLibContract;
      require(name: "MetaCoin"): TruffleContracts.MetaCoinContract;
      require(name: "Migrations"): TruffleContracts.MigrationsContract;
      require(name: "TheDataWallet"): TruffleContracts.TheDataWalletContract;
    }
  }
}
