export const blockchainsNetworks = {
    bitcoin: {
      name: 'livenet',
      alias: 'mainnet',
      pubkeyhash: 0x00,
      privatekey: 0x80,
      scripthash: 0x05,
      bech32prefix: 'bc',
      xpubkey: 0x0488b21e,
      xprivkey: 0x0488ade4,
      networkMagic: 0xf9beb4d9,
      port: 8333,
      dnsSeeds: [
        'seed.bitcoin.sipa.be',
        'dnsseed.bluematt.me',
        'dnsseed.bitcoin.dashjr.org',
        'seed.bitcoinstats.com',
        'seed.bitnodes.io',
        'bitseed.xf2.org'
      ]
    },
    litecoin: {
      name: 'livenet',
      alias: 'mainnet',
      pubkeyhash: 0x30, // 48
      privatekey: 0xb0, // 176
      scripthash: 0x32, // 50
      scripthash2: 0x05, // 5
      bech32prefix: 'ltc',
      xpubkey: 0x0488b21e,
      xprivkey: 0x0488ade4,
      networkMagic: 0xfbc0b6db,
      port: 9333,
      dnsSeeds: [
        'dnsseed.litecointools.com',
        'dnsseed.litecoinpool.org',
        'dnsseed.ltc.xurious.com',
        'dnsseed.koin-project.com',
        'seed-a.litecoin.loshan.co.uk',
        'dnsseed.thrasher.io'
      ]
    },
    dogecoin: {
      name: 'livenet',
      alias: 'mainnet',
      pubkeyhash: 0x1e,
      privatekey: 0x9e,
      scripthash: 0x16,
      xpubkey: 0x0488b21e,
      xprivkey: 0x0488ade4,
      networkMagic: 0xc0c0c0c0,
      port: 22556,
      dnsSeeds: [
        'seed.multidoge.org',
        'seed2.multidoge.org',
        'veryseed.denarius.pro',
        'muchseed.denarius.pro',
        'suchseed.denarius.pro',
        'seed.dogecoin.com',
        'seed.dogechain.info',
        'seed.mophides.com',
        'seed.dglibrary.org'
      ]
    },
    bsv: {
      name: 'livenet',
      alias: 'mainnet',
      pubkeyhash: 0x00,
      privatekey: 0x80,
      scripthash: 0x05,
      bech32prefix: 'bc',
      xpubkey: 0x0488b21e,
      xprivkey: 0x0488ade4,
      networkMagic: 0xE8F3E1E3,
      port: 8333,
      dnsSeeds: [
        'seed.bitcoin.sipa.be',
        'dnsseed.bluematt.me',
        'dnsseed.bitcoin.dashjr.org',
        'seed.bitcoinstats.com',
        'seed.bitnodes.io',
        'bitseed.xf2.org'
      ]
    },
};