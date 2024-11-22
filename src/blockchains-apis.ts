export const blockchainsApis = {
    bitcoin: {
      "getBalance": [
        {
          "url": "https://blockchain.info/balance?active=$address",
          "method": "GET",
          "resultEval": (result, additionalData) => result[additionalData.address].final_balance
        },
        {
          "url": "https://api.blockcypher.com/v1/btc/main/addrs/$address/balance",
          "method": "GET",
          "resultEval": (result) => result?.final_balance ?? 0
        }
      ],
      "getUnspentOutputs": [
        {
          "url": "https://blockchain.info/unspent?active=$address",
          "method": "GET",
          "resultEval": (result) => result.unspent_outputs.map(x => ({ txId: x.tx_hash_big_endian, outputIndex: x.tx_output_n, satoshis: x.value, confirmations: x.confirmations, script: x.script }))
        },
        {
          "url": "https://api.blockcypher.com/v1/btc/main/addrs/$address?unspentOnly=true",
          "method": "GET",
          "resultEval": (result) => result.txrefs.map(x => ({ txId: x.tx_hash, outputIndex: x.tx_output_n, satoshis: x.value, confirmations: x.confirmations, script: '76a914b9f757cb3d61d8aba720e5a1dc4f916d1b0c1fed88ac' }))
        }
      ],
      "getLatestBlockHash": [
        {
          "url": "https://blockchain.info/q/latesthash",
          "contentType": "text",
          "method": "GET",
          "resultEval": (result) => result
        },
        {
          "url": "https://api.blockcypher.com/v1/btc/main",
          "method": "GET",
          "resultEval": (result) => result.hash
        }
      ],
      "getLatestBlockAverageFeePerByteInSatoshi": [
        {
          "url": "https://blockchain.info/rawblock/$latesthash",
          "method": "GET",
          "resultEval": (result) => result.tx.reduce((acc, tx) => acc + (tx.fee / tx.size), 0) / result.tx.length
        },
        {
          "url": "https://api.blockcypher.com/v1/btc/main/blocks/$latesthash",
          "method": "GET",
          "resultEval": (result) => result.fees / result.size
        }
      ],
      "pushTx": [ // TODO add one more push api https://github.com/Blockstream/esplora/blob/master/API.md
        {
          "url": "https://api.blockcypher.com/v1/btc/main/txs/push",
          "method": "POST",
          "body": {
              "tx": "$txHex"
          },
          "resultEval": (result) => result.tx.hash
        }
      ]
    },
    litecoin: {
      "getBalance": [
        {
          "url": "https://api.blockcypher.com/v1/litecoin/main/addrs/$address/balance",
          "method": "GET",
          "resultEval": (result) => result?.final_balance ?? 0
        }
      ],
      "getUnspentOutputs": [
        {
          "url": "https://api.blockcypher.com/v1/litecoin/main/addrs/$address?unspentOnly=true",
          "method": "GET",
          "resultEval": (result) => result.txrefs.map(x => ({ txId: x.tx_hash, outputIndex: x.tx_output_n, satoshis: x.value, confirmations: x.confirmations, script: '76a914b9f757cb3d61d8aba720e5a1dc4f916d1b0c1fed88ac' }))
        }
      ],
      "getLatestBlockHash": [
        {
          "url": "https://api.blockcypher.com/v1/litecoin/main",
          "method": "GET",
          "resultEval": (result) => result.hash
        }
      ],
      "getLatestBlockAverageFeePerByteInSatoshi": [
        {
          "url": "https://api.blockcypher.com/v1/litecoin/main/blocks/$latesthash",
          "method": "GET",
          "resultEval": (result) => result.fees / result.size
        }
      ],
      "pushTx": [ // TODO add one more push api https://github.com/Blockstream/esplora/blob/master/API.md
        {
          "url": "https://api.blockcypher.com/v1/litecoin/main/txs/push",
          "method": "POST",
          "body": {
              "tx": "$txHex"
          },
          "resultEval": (result) => result.tx.hash
        }
      ]
    },
    dogecoin: {
      "getBalance": [
        {
          "url": "https://dogechain.info/api/v1/address/balance/$address",
          "method": "GET",
          "resultEval": (result) => result?.error ? 0 : Number((result.balance*100000000).toFixed(0))
        }
      ],
      "getUnspentOutputs": [
        {
          "url": "https://dogechain.info/api/v1/address/unspent/$address/1",
          "method": "GET",
          "resultEval": (result) => result?.error ? [] : result.unspent_outputs.map(x => ({ txId: x.tx_hash, outputIndex: x.tx_output_n, satoshis: x.value, confirmations: x.confirmations, script: x.script }))
        }
      ],
      "getLatestBlockHash": [
        {
          "url": "https://dogechain.info/api/v1/block/besthash",
          "method": "GET",
          "resultEval": (result) => result.hash
        }
      ],
      "getLatestBlockAverageFeePerByteInSatoshi": [
        {
          "url": "https://dogechain.info/api/v1/block/$latesthash",
          "method": "GET",
          "resultEval": (result) => result.block.fees / result.block.size
        }
      ],
      "pushTx": [
        {
          "url": "https://api.blockcypher.com/v1/doge/main/txs/push",
          "method": "POST",
          "body": {
              "tx": "$txHex"
          },
          "resultEval": (result) => result.tx.hash
        }
      ]
    },
    bsv: {
      "getBalance": [
        {
          "url": "https://api.whatsonchain.com/v1/bsv/main/address/$address/confirmed/balance",
          "method": "GET",
          "resultEval": (result) => result?.confirmed ?? 0
        }
      ],
      "getUnspentOutputs": [
        {
          "url": "https://api.whatsonchain.com/v1/bsv/main/address/$address/unconfirmed/unspent",
          "method": "GET",
          "resultEval": (result) => result.result.map(x => ({ txId: x.tx_hash, outputIndex: x.tx_pos, satoshis: x.value, confirmations: 6, script: '76a914b9f757cb3d61d8aba720e5a1dc4f916d1b0c1fed88ac' }))
        }
      ]
    },
    dash: {
      "getBalance": [
        {
          "url": "https://api.blockcypher.com/v1/dash/main/addrs/$address/balance",
          "method": "GET",
          "resultEval": (result) => result?.final_balance ?? 0
        }
      ],
      "getUnspentOutputs": [
        {
          "url": "https://api.blockcypher.com/v1/dash/main/addrs/$address?unspentOnly=true",
          "method": "GET",
          "resultEval": (result) => result.txrefs.map(x => ({ txId: x.tx_hash, outputIndex: x.tx_output_n, satoshis: x.value, confirmations: x.confirmations, script: '76a914b9f757cb3d61d8aba720e5a1dc4f916d1b0c1fed88ac' }))
        }
      ],
      "getLatestBlockHash": [
        {
          "url": "https://api.blockcypher.com/v1/dash/main",
          "method": "GET",
          "resultEval": (result) => result.hash
        }
      ],
      "getLatestBlockAverageFeePerByteInSatoshi": [
        {
          "url": "https://api.blockcypher.com/v1/dash/main/blocks/$latesthash",
          "method": "GET",
          "resultEval": (result) => result.fees / result.size
        }
      ],
      "pushTx": [ // TODO add one more push api https://github.com/Blockstream/esplora/blob/master/API.md
        {
          "url": "https://api.blockcypher.com/v1/dash/main/txs/push",
          "method": "POST",
          "body": {
              "tx": "$txHex"
          },
          "resultEval": (result) => result.tx.hash
        }
      ]
    },
    'bitcoin-cash': {
      "getBalance": [
        {
          "url": "https://api.fullstack.cash/v5/electrumx/balance/$address",
          "method": "GET",
          "resultEval": (result) => result?.error ? 0 : Number((result.balance.confirmed*100000000).toFixed(0))
        }
      ],
      "getUnspentOutputs": [
        {
          "url": "https://api.fullstack.cash/v5/electrumx/utxos/$address",
          "method": "GET",
          "resultEval": (result) => !result?.success ? [] : result.utxos.map(x => ({ txId: x.tx_hash, outputIndex: x.tx_pos, satoshis: x.value, confirmations: 1000, script: x.script }))
        }
      ],
      "getLatestBlockHash": [
        {
          "url": "https://api.fullstack.cash/v5/blockchain/getBestBlockHash",
          "method": "GET",
          "resultEval": (result) => result
        }
      ],
      "getLatestBlockAverageFeePerByteInSatoshi": [
        {
          "url": "https://api.fullstack.cash/v5/control/getnetworkinfo",
          "method": "GET",
          "resultEval": (result) => result.relayfee*1000000
        }
      ],
      "pushTx": [
        {
          "url": "https://api.fullstack.cash/v5/electrumx/tx/broadcast",
          "method": "POST",
          "body": {
              "txHex": "$txHex"
          },
          "resultEval": (result) => result?.tx.hash ?? result?.tx ?? result
        }
      ]
    },
};