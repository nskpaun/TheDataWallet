/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { MigrationsContract } from "./Migrations";
import { TheDataWalletContract } from "./TheDataWallet";

declare global {
  namespace Truffle {
    interface Artifacts {
      require(name: "Migrations"): MigrationsContract;
      require(name: "TheDataWallet"): TheDataWalletContract;
    }
  }
}

export { MigrationsContract, MigrationsInstance } from "./Migrations";
export { TheDataWalletContract, TheDataWalletInstance } from "./TheDataWallet";
