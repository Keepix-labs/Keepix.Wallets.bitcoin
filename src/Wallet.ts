import * as bitcore from 'bitcore-lib';
import { blockchainsNetworks } from './blockchains-networks';
import { entropyToMnemonic } from '@ethersproject/hdnode';
import fetch from 'node-fetch';
import { blockchainsApis } from './blockchains-apis';
import CoinKey from 'coinkey';
import { sha256 } from 'js-sha256';

async function fetchBlockchainApi(type: string, apis: any = {}, key: string, format: (str: string) => string = (x) => x, additionalData: any = {}) {
    const lstOfEndpoint = apis[key] ?? blockchainsApis[type][key];
    const endpointData = lstOfEndpoint[Math.floor(Math.random()*lstOfEndpoint.length)];

    if (endpointData.method === 'GET') {
        const query = (await fetch(format(endpointData.url)));
        const resultOfQuery = endpointData.contentType === 'text' ? JSON.parse(await query.text()) : (await query.json());
        const resultOfEval = endpointData.resultEval(resultOfQuery, additionalData);//new Function("v", `with (v) { return (${format(endpointData.resultEval)})}`)({ result: resultOfQuery });

        return resultOfEval;
    } else if (endpointData.method === 'POST') {
        const query = (await fetch(format(endpointData.url), {
            method: 'POST',
            body: typeof endpointData.body === 'string' ? format(endpointData.body) : format(JSON.stringify(endpointData.body))
        }));
        const resultOfQuery = endpointData.contentType === 'text' ? (await query.text()) : (await query.json());
        const resultOfEval = endpointData.resultEval(resultOfQuery, additionalData);//new Function("v", `with (v) { return (${format(endpointData.resultEval)})}`)({ result: resultOfQuery });

        return resultOfEval;
    }
}

function makeid(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return result;
}

function createPrivateKey(templatePrivateKey: string, password: string): string {
    // Concaténation de la clé privée et du mot de passe
    const combined = templatePrivateKey + password;

    // Retourne le hash SHA-256 en hexadécimal
    return sha256(combined).substring(0, 64);
}

function createPrivateDerivatedKeyFromMnemonic(mnemonic: string) {
    const Mnemonic = require('bitcore-mnemonic');
    const code = new Mnemonic(mnemonic);
    const hdPrivateKey = code.toHDPrivateKey(); // no passphrase
    return { hdPrivateKey: hdPrivateKey, mnemonic: mnemonic };
}

function createPrivateDerivatedKey(templatePrivateKey: string, password: string) {
    const hash = createPrivateKey(templatePrivateKey, password);
    const Mnemonic = require('bitcore-mnemonic');
    const generatedPhrasePass = entropyToMnemonic(Buffer.from(hash, 'hex'));
    const code = new Mnemonic(generatedPhrasePass);
    const hdPrivateKey = code.toHDPrivateKey(); // no passphrase
    return { hdPrivateKey: hdPrivateKey, mnemonic: generatedPhrasePass };
}

function createPrivateKeyBase58(templatePrivateKey: string, networkPrivateKey: number, password: string) {
    const hash = createPrivateKey(templatePrivateKey, password);
    const base58Check = require('bitcore-lib/lib/encoding/base58check');
    const buf = Buffer.concat([
        Buffer.from([networkPrivateKey]), // network privateKey number
        Buffer.from(hash.substring(0, 64), 'hex'), // size 32
        Buffer.from([0x01])]); // 0x01 = compressed or remove for non compressed
    const hashInBase58 = base58Check.encode(buf);
    return hashInBase58;
}

function getBNFromPrivateKey(privateKeyBase58: string, ) {
    const base58Check = require('bitcore-lib/lib/encoding/base58check');
    const buf = base58Check.decode(privateKeyBase58);
    return bitcore.crypto.BN.fromBuffer(buf.slice(1, 32 + 1));
}

function defineDefaultNetwork(type: string) {
    if (blockchainsNetworks[type] !== undefined) {
        if (bitcore.Networks.get(blockchainsNetworks[type].name) === undefined) {
            bitcore.Networks.add(blockchainsNetworks[type]);
        }
        bitcore.Networks.defaultNetwork = bitcore.Networks.get(blockchainsNetworks[type].name);
    }
}

function getNetwork(type: string) {
    return blockchainsNetworks[type];
}

/**
 * Wallet class who respect the WalletLibraryInterface for Keepix
 */
export class Wallet {

    private key: any;
    private mnemonic?: string;
    private type: string;
    private apis?: any;
    
    constructor({
        password,
        mnemonic,
        privateKey,
        derivated = false,
        type,
        apis,
        privateKeyTemplate = 'KyaZBvGcmzV5wpRH9s9cU3VwmHo92KJtxPWhfEC6RFpJRbwSPXqx'
    }: {
        password?: string,
        mnemonic?: string,
        derivated?: boolean,
        privateKey?: string,
        type: string,
        apis?: any,
        privateKeyTemplate?: string
    }) {
        defineDefaultNetwork(type);
        this.type = type;
        this.apis = apis;
        // from password
        if (password !== undefined) {
            if (derivated) { // can be used for creating multisig
                const { hdPrivateKey, mnemonic } = createPrivateDerivatedKey(privateKeyTemplate, password);
                const derived = hdPrivateKey.derive("m/0'");
                this.key = derived.privateKey;
                this.mnemonic = mnemonic;
                return ;
            }
            const networkPrivateKey = blockchainsNetworks.bitcoin.privatekey;//.bitcoin.mainnet.privatekey;
            const newPrivateKeyETH = createPrivateKeyBase58(privateKeyTemplate, networkPrivateKey, password);
            const bn = getBNFromPrivateKey(newPrivateKeyETH);
            this.key = bitcore.PrivateKey(bn);//newPrivateKeyETH, blockchainsNetworks.dogecoin.mainnet);
            return ;
        }
        if (mnemonic !== undefined) {
            const { hdPrivateKey } = createPrivateDerivatedKeyFromMnemonic(mnemonic);
            const derived = hdPrivateKey.derive("m/0'");
            this.key = derived.privateKey;
            this.mnemonic = mnemonic;
            return ;
        }
        // from privateKey only
        if (privateKey !== undefined) {
            this.mnemonic = undefined;
            this.key = bitcore.PrivateKey.fromWIF(privateKey);//new ethers.Wallet(privateKey);
            return ;
        }
        // Random
        const pass = makeid(20);
        this.key = bitcore.PrivateKey();
        const networkPrivateKey = blockchainsNetworks.bitcoin.privatekey;//.bitcoin.mainnet.privatekey;
        const newPrivateKeyETH = createPrivateKeyBase58(privateKeyTemplate, networkPrivateKey, pass);
        const bn = getBNFromPrivateKey(newPrivateKeyETH);
        this.key = bitcore.PrivateKey(bn);//newPrivateKeyETH, blockchainsNetworks.dogecoin.mainnet);
    }

    // PUBLIC

    public getPrivateKey() {
        return this.key.toWIF();
    }

    public getMnemonic() { // not implemented
        return this.mnemonic;
    }

    public getNetwork() {
        return this.key.toObject().network;
    }

    public getAddress() {
        const network = getNetwork(this.type);
        let ck = CoinKey.fromWif(this.key.toWIF(), {private: network.privatekey, public: network.publickey});
        return ck.publicAddress.toString();
    }

    public async getProdiver() {
        return undefined;
    }

    public getConnectedWallet = async () => {
        return undefined;
    }

    // always display the balance in 0 decimals like 1.01 ETH
    public async getCoinBalance(walletAddress?: string) {
        try {
            const targetAddress = walletAddress ?? this.getAddress();
            const balance = await fetchBlockchainApi(this.type, this.apis, 'getBalance', (str: string) => {
                return str.replace(/\$address/gm, targetAddress);
            }, { address: targetAddress });
            return (Number(balance) / 100000000).toFixed(8);
        } catch(e) {
            console.error(e);
            return '0';
        }
    }

    // always display the balance in 0 decimals like 1.01 RPL
    public async getTokenBalance(tokenAddress: string, walletAddress?: string) {
        return '0';
    }

    public satoshiToBTC(satoshi: number) {
        return Number((satoshi / 100000000).toFixed(8));
    }

    public btcToSatoshi(btc: number) {
        return btc * 100000000;
    }

    public async estimateCostSendCoinTo(receiverAddress: string, amount: string) {
        try {
            const amountInSatoshi = this.btcToSatoshi(Number(amount));
            const averageFeesPerByteInSatoshi = await this.getLatestBlockAverageFeePerByteInSatoshi();
            const estimation = await this.generateTxOfTransfer({
                minConfirmations: 6,
                amountInSatoshi: amountInSatoshi,
                receiverAddress: receiverAddress,
                feePerByte: averageFeesPerByteInSatoshi
            });
            if (estimation.tx !== undefined && estimation.fee !== undefined) {
                return { success: true, description: `${this.satoshiToBTC(estimation.fee)}` };
            }
            return { success: false, description: estimation.description };
        } catch (e) {
            return { success: false, description: `Error during the estimation. trace: ${e.message}` };
        }
    }

    public async sendCoinTo(receiverAddress: string, amount: string) {
        const amountInSatoshi = this.btcToSatoshi(Number(amount));
        const averageFeesPerByteInSatoshi = await this.getLatestBlockAverageFeePerByteInSatoshi();
        const estimation = await this.generateTxOfTransfer({
            minConfirmations: 6,
            amountInSatoshi: amountInSatoshi,
            receiverAddress: receiverAddress,
            feePerByte: averageFeesPerByteInSatoshi
        });
        if (estimation.tx === undefined) {
            return { success: false, description: estimation.description };
        }
        const txHex = estimation.tx.enableRBF().sign(this.key).toBuffer().toString('hex');

        //https://api.blockcypher.com/v1/btc/main/txs/push
        //https://api.blockcypher.com/v1/btc/main/txs/decode (for testing)
        const hash = await fetchBlockchainApi(this.type, this.apis, 'pushTx', (str: string) => {
            return str.replace(/\$txHex/gm, txHex);
        }, { txHex: txHex });
        if (hash !== undefined) {
            return { success: true, description: hash };
        }
        return { success: false, description: `Push failed hash not found.` };
    }

    public async sendTokenTo(tokenAddress: string, receiverAddress: string, amount: string) {
        return { success: true, description: `Not Implemented` };
    }

    public async estimateCostSendTokenTo(tokenAddress: string, receiverAddress: string, amount: string) {
        return { success: true, description: `Not Implemented` };
    }

    public async getLatestBlockAverageFeePerByteInSatoshi() {

        const lastestHash = await fetchBlockchainApi(this.type, this.apis, 'getLatestBlockHash');
        const averageFeesPerByteInSatoshi = await fetchBlockchainApi(this.type, this.apis, 'getLatestBlockAverageFeePerByteInSatoshi', (str: string) => {
            return str.replace(/\$latesthash/gm, lastestHash)
        }, { lastestHash: lastestHash });

        // +30%
        const averageFeesPerByteInSatoshiSpeed = Number((averageFeesPerByteInSatoshi * 1.30).toFixed(0));
        return averageFeesPerByteInSatoshiSpeed;
    }

    public async getUTXOList() {
        const listOfUTXO = await fetchBlockchainApi(this.type, this.apis, 'getUnspentOutputs', (str: string) => {
            return str.replace(/\$address/gm, this.getAddress())
        }, { address: this.getAddress() });
        return listOfUTXO;
    }

    public async generateTxOfTransfer({
        minConfirmations = 6,
        amountInSatoshi,
        receiverAddress,
        feePerByte
    }: {
        minConfirmations: number,
        amountInSatoshi: number,
        receiverAddress: string,
        feePerByte: number
    }) {
        const utxoSizeOfObjects = {
            HEADER: 10,
            OUTPUT: 34,
            INPUT: 180,
            POINTER: 1
        };
        const listOfUTXO = await this.getUTXOList();
        let tx = new bitcore.Transaction();
        let availableSat = 0;
        let feesNeeded = utxoSizeOfObjects.HEADER + utxoSizeOfObjects.OUTPUT; // 10 = base informations cost, 34 = one Output

        for (let utxo of listOfUTXO) {
            if (utxo.confirmations >= minConfirmations) {
                availableSat += utxo.satoshis;
                tx.from(utxo);
                feesNeeded += utxoSizeOfObjects.INPUT + utxoSizeOfObjects.POINTER; // size of the input
                if (availableSat === (amountInSatoshi + (feesNeeded*feePerByte))) break; // if perfect amount
                if (availableSat >= (amountInSatoshi + ((feesNeeded + utxoSizeOfObjects.OUTPUT)*feePerByte))) break; // if surplus 
            }
        }

        if (availableSat < (amountInSatoshi + (feesNeeded*feePerByte))) {
            return { success: false, description: `You do not have enough in your wallet to send that much. (available with minimum ${minConfirmations} confirmations: ${this.satoshiToBTC(availableSat)}, tx+feesCost: ${this.satoshiToBTC((amountInSatoshi + (feesNeeded*feePerByte)))})` };
        }

        tx.to(receiverAddress, amountInSatoshi);

        // -- [Change] Determine if we have surplus excluding fees.
        let change = 0;
        if (availableSat >= (amountInSatoshi + ((feesNeeded + utxoSizeOfObjects.OUTPUT)*feePerByte))) {
            feesNeeded += utxoSizeOfObjects.OUTPUT;
            change = Number((availableSat - (amountInSatoshi + ((feesNeeded)*feePerByte))).toFixed(0));
        }
        if (change > 0) {
            tx.to(this.getAddress(), change);
        }
        // -----------------------------------------------
        return {
            tx: tx,
            change: change,
            fee: ((feesNeeded)*feePerByte)
        };
    }
}