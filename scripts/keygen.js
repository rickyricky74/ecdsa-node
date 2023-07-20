const secp = require("ethereum-cryptography/secp256k1").secp256k1;
const { toHex } = require("ethereum-cryptography/utils");
const { keccak256 } = require("ethereum-cryptography/keccak.js");

const privateKey = secp.utils.randomPrivateKey();
const publicKey = secp.getPublicKey(privateKey);

console.log(
    `\n` +
    `Private key: ${toHex(privateKey)}\n` +
    `Public key: ${toHex(publicKey)}\n` +
    `Keccak256(Public Key): ${toHex(keccak256(publicKey))}\n` +
    `Last 40 of Keccak: ${toHex(keccak256(publicKey)).slice(-40)}` +
    `\n`
);
