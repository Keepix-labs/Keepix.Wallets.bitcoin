# Keepix.Wallets.bitcoin


## Install

```bash
npm i @keepix/wallets-bitcoin
```

## Use

```ts
import { Wallet } from '@keepix/wallets-bitcoin';

const wallet = new Wallet({ password: 'test', type: 'bitcoin' });

console.log(await wallet.getCoinBalance());
// 0.00000000
```

## Information

Library that respects the WalletLibraryInterface.  
This library is used to create wallets, hold coin and token balances and carry out transactions.  
  
```js
class Wallet {
    constructor({}: {
        password?: string,
        mnemonic?: string,
        privateKey?: string,
        type: string,
        apis?: any,
        privateKeyTemplate?: string
    }) {}

    getPrivateKey: () => string;
    getMnemonic: () => string | undefined;
    getAddress: () => string;
    getProdiver: () => Promise<any>;

    btcToSatoshi: (btc: number) => number;

    // returns like 1.01 (Always in readable value)
    getCoinBalance: (walletAddress?: string) => Promise<string>;
    // returns like 1.01 (Always in readable value)
    getTokenBalance: (tokenAddress: string, walletAddress?: string) => Promise<string>;

    // amount is always like 1.20 ETH 
    estimateCostSendCoinTo: (receiverAddress: string, amount: string) => Promise<{ success: boolean, description: string }>;
    estimateCostSendTokenTo: (tokenAddress: string, receiverAddress: string, amount: string) => Promise<{ success: boolean, description: string }>;
    sendCoinTo: (receiverAddress: string, amount: string) => Promise<{ success: boolean, description: string }>;
    sendTokenTo: (tokenAddress: string, receiverAddress: string, amount: string) => Promise<{ success: boolean, description: string }>;
}

export interface WalletLibraryInterface {
    Wallet: typeof Wallet;
};
```