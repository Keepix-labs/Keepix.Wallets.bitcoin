import { Wallet } from './Wallet';

let mockedValues = {};
let queryMockedCallBack = (url) => {

  if (mockedValues[url]) {
    return mockedValues[url];
  } else {
    console.log('mock not intercepted', url);
  }
  return new Promise(resolve => resolve({
    json: () => {
      return new Promise(res => res(''));
    }
  }));
};

jest.mock('node-fetch', () => {
  const originalModule = jest.requireActual('node-fetch');

  //Mock the default export and named export 'foo'
  return {
    __esModule: true,
    ...originalModule,
    default: jest.fn((url) => {
        return queryMockedCallBack(url);
      }
    )
  };
});

const mockFetch = () => {
  
}

describe('basic wallet', () => {

  it('can generate same wallet', async () => {
    const address = '1HxJKBJso1jGJNoo5XmkiygE6c1gB1PQDo';
    const privateKey = 'L19zVKSjUtKSnDJnKt34W5ZeoEQAWg3v1Nc4fjo4qou9oGPejJBz';

    const wallet = new Wallet({ password: 'toto', type: 'bitcoin' });

    expect(wallet.getAddress()).toEqual(address);
    expect(wallet.getPrivateKey()).toEqual(privateKey);
  }, 60000);

  it('can generate same derivated wallet', async () => {
    const address = '1GmUmogRCS3euPbTHtU1sHrC7CwLQBn1j1';
    const privateKey = 'Kx9xgFEmri3HG5MSqMdXczpeg73p4seZBo2Y4DRdrPFHJNGFiFbH';
    const mnemonic = 'install lava skate gossip lend wash chronic aunt neck awesome gun open tribe elegant early jeans hybrid magnet sense pear truth fly jar mushroom';

    const wallet = new Wallet({ password: 'toto', type: 'bitcoin', derivated: true });

    expect(wallet.getAddress()).toEqual(address);
    expect(wallet.getPrivateKey()).toEqual(privateKey);
    expect(wallet.getMnemonic()).toEqual(mnemonic);
  }, 60000);

  it('can generate derivated wallet from mnemonic', async () => {
    const address = '1GmUmogRCS3euPbTHtU1sHrC7CwLQBn1j1';
    const privateKey = 'Kx9xgFEmri3HG5MSqMdXczpeg73p4seZBo2Y4DRdrPFHJNGFiFbH';
    const mnemonic = 'install lava skate gossip lend wash chronic aunt neck awesome gun open tribe elegant early jeans hybrid magnet sense pear truth fly jar mushroom';

    const wallet = new Wallet({ mnemonic: mnemonic, type: 'bitcoin' });

    expect(wallet.getAddress()).toEqual(address);
    expect(wallet.getPrivateKey()).toEqual(privateKey);
    expect(wallet.getMnemonic()).toEqual(mnemonic);
  }, 60000);

  it('can generate wallet from privateKey', async () => {
    const address = '1GmUmogRCS3euPbTHtU1sHrC7CwLQBn1j1';
    const privateKey = 'Kx9xgFEmri3HG5MSqMdXczpeg73p4seZBo2Y4DRdrPFHJNGFiFbH';

    const wallet = new Wallet({ privateKey: privateKey, type: 'bitcoin' });

    expect(wallet.getAddress()).toEqual(address);
    expect(wallet.getPrivateKey()).toEqual(privateKey);
  }, 60000);

  it('can generate random wallet', async () => {
    const wallet = new Wallet({ type: 'bitcoin' });

    expect(wallet.getAddress()).toBeDefined();
    expect(wallet.getPrivateKey()).toBeDefined();
  }, 60000);

  it('can get wallet balance', async () => {
    const wallet = new Wallet({
      password: 'toto',
      type: 'bitcoin',
      apis: {
        'getBalance': [
          {
            'url': 'test1',
            'method': 'GET',
            'resultEval': 'result.final_balance'
          }
        ]
      }
    });

    mockedValues['test1'] = Promise.resolve({ json: () => Promise.resolve({
      final_balance: '50000000000'
    }) });

    expect(await wallet.getCoinBalance()).toEqual('500.00000000');
  });

  it('can get utxo', async () => {
    const wallet = new Wallet({
      password: 'toto',
      type: 'bitcoin',
      apis: {
        "getUnspentOutputs": [
          {
            "url": "$address",
            "method": "GET",
            "resultEval": "result.unspent_outputs.map(x => ({ txId: x.tx_hash_big_endian, outputIndex: x.tx_output_n, satoshis: x.value, confirmations: x.confirmations, script: x.script }))"
          },
        ]
      }
    });

    mockedValues[wallet.getAddress()] = Promise.resolve({ json: () => Promise.resolve({
      unspent_outputs: [
        { tx_hash_big_endian: 'hash', tx_output_n: 1, value: 100, confirmations: 18238, script: 'script' },
        { tx_hash_big_endian: 'hash', tx_output_n: 1, value: 100, confirmations: 18239, script: 'script' },
        { tx_hash_big_endian: 'hash', tx_output_n: 1, value: 100, confirmations: 18240, script: 'script' }
      ]
    }) });

    const list = await wallet.getUTXOList();
    expect(list.length).toEqual(3);
    expect(list).toMatchObject([
      { txId: 'hash', outputIndex: 1, satoshis: 100, confirmations: 18238, script: 'script' },
      { txId: 'hash', outputIndex: 1, satoshis: 100, confirmations: 18239, script: 'script' },
      { txId: 'hash', outputIndex: 1, satoshis: 100, confirmations: 18240, script: 'script' },
    ]);
  });

  it('can estimateCostSendCoinTo and push', async () => {
    const wallet = new Wallet({
      password: 'toto',
      type: 'bitcoin',
      apis: {
        "getUnspentOutputs": [
          {
            "url": "unspent/$address",
            "method": "GET",
            "resultEval": "result.unspent_outputs.map(x => ({ txId: x.tx_hash_big_endian, outputIndex: x.tx_output_n, satoshis: x.value, confirmations: x.confirmations, script: x.script }))"
          },
        ],
        "getLatestBlockHash": [
          {
            "url": "blockhash",
            "method": "GET",
            "resultEval": "'ninja'"
          }
        ],
        "getLatestBlockAverageFeePerByteInSatoshi": [
          {
            "url": "block/$latesthash",
            "method": "GET",
            "resultEval": "20"
          }
        ],
        "pushTx": [
          {
            "url": "push",
            "method": "POST",
            "body": {
                "tx": "$txHex"
            },
            "resultEval": "'$txHex'" // force return the txHex
          }
        ]
      }
    });

    mockedValues[`unspent/${wallet.getAddress()}`] = Promise.resolve({ json: () => Promise.resolve({
      unspent_outputs: [
        { tx_hash_big_endian: '5bb0d5f26ccf1c4845bfb5a76390f9275b621b4baf768c085549ecb184e0431f', tx_output_n: 1, value: wallet.btcToSatoshi(0.1), confirmations: 18238, script: '76a914b9f757cb3d61d8aba720e5a1dc4f916d1b0c1fed88ac' },
        { tx_hash_big_endian: '5bb0d5f26ccf1c4845bfb5a76390f9275b621b4baf768c085549ecb184e0431f', tx_output_n: 1, value: wallet.btcToSatoshi(0.1), confirmations: 18239, script: '76a914b9f757cb3d61d8aba720e5a1dc4f916d1b0c1fed88ac' },
      ]
    }) });
    mockedValues['block/ninja'] = Promise.resolve({ json: () => Promise.resolve({}) });
    mockedValues['push'] = Promise.resolve({ json: () => Promise.resolve({}) });

    expect(await wallet.estimateCostSendCoinTo('15hWDpJL793CrzBhrDLggfNjVgFxbCmAkV', `0.01`)).toMatchObject({
      success: true,
      description: "0.00006734"
    });

    // check if the txHex is always same
    expect(await wallet.sendCoinTo('15hWDpJL793CrzBhrDLggfNjVgFxbCmAkV', `0.01`)).toMatchObject({
      success: true,
      description: "02000000011f43e084b1ec4955088c76af4b1b625b27f99063a7b5bf45481ccf6cf2d5b05b010000006a47304402202b8c1ddfb3d17ad50772a95abb650a189947368dd6f09ec1294c4997403d8c4c02201da4f1c94f5e02d43bee510eb6cbe3a16b774a79a9c941f30621b8550c8d1fca012102f8cf9fadad2db6f41be5406dd942ed9ac4b3bfdca3c4a8fb26b37b2e554c3f4dfdffffff0240420f00000000001976a914338988b663d7881e8187e6337a4f3d17b4a7816e88acf2398900000000001976a914b9f757cb3d61d8aba720e5a1dc4f916d1b0c1fed88ac00000000"
    });
  });
})