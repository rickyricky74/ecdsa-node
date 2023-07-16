const secp = require("noble-secp256k1");
const { toHex, utf8ToBytes } = require("ethereum-cryptography/utils");
const { keccak256 } = require("ethereum-cryptography/keccak.js");

const privateKey = secp.utils.randomPrivateKey();
const publicKey = secp.getPublicKey(privateKey);

console.log("Private key:", toHex(privateKey));
console.log("Public key:", toHex(publicKey));
console.log("Keccak256(Public Key):", toHex(keccak256(publicKey)));
console.log("Last 40 of Keccak:", toHex(keccak256(publicKey)).slice(-40));
