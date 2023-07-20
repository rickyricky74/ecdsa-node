const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;

const secp = require("ethereum-cryptography/secp256k1").secp256k1;
const { keccak256 } = require("ethereum-cryptography/keccak.js");
const { toHex, utf8ToBytes } = require("ethereum-cryptography/utils");

app.use(cors());
app.use(express.json());

/*

READ THIS FIRST:

- Info for the test accounts have been provided below so you can test in the UI straight away. 
- I am very aware that one would *never* do this in a real-world scenario.
- Replace the accounts with new accounts as you see fit.
- ../scripts/keygen.js can be used to generate new accounts and will output 
  the private key, public key, keccak256 hash of the public key, and the 
  last-40-byte version of the keccak25 has of the public key.
- Accounts below use the last 40 bytes of the keccak256 hash of the public key,
  which is required here because the signature verification process matches the 
  public key to the address by taking the last 40 bytes of the keccak256 hash (line: 108 below)

ACCOUNT INFO:

- Account 1: 544548a154a9b27e1412160469e9d4a0a95c7def

  Private Key:            29098360c4c3e644350b572955839111cd8e5df5bdfd2c522ad99dde59683614
  Public Key:             046805438d93a356e606e7eee77af15ae3629f2cf7928a03fc32ffc968630ae0ad6f4ab987ca2117ca9a810dbb93705e8c941ed0b4012da588e136faa4582d09b1
  keccak256(Public Key):  666bf5cb34cc8d194cf7febf544548a154a9b27e1412160469e9d4a0a95c7def

- Account 2: ead7e597066b6e6b70fa3874eeb5ed065a461176

  Private Key:            9769ddcb24a9dabdb491cbf4ce1cb38d2eee359d034bce65aaddb729efd67994 
  Public Key:             042acbb33b871bfae5f274840c0a643d3950b76dec92c5d2156279d1765b7f5d3544f4a05ccc95f45b992c7cbb513f82e6fe4ce66854279a2b48209e7aa1b61d41
  keccak256(Public Key):  c677a752f7bd6aabc3df2ffdead7e597066b6e6b70fa3874eeb5ed065a461176

- Account 3: a483a46771e8c8199af595949ed6713fd9d67d7d

  Private Key:            5e0ac547ea838939c600372e0b4927b9462d052ab1dc3fe28d2e99b2b13fcfd3
  Public Key:             0445e1f1de4d0630cccbd85e4840073c61658d2b08260a323058eaa4bb0f8a9ec27794b99895bc1017333c64e5d84859aaf40a011fe9929b36de03eaa829c1941e
  keccak256(Public Key):  ce9c598031ca335280f29d08a483a46771e8c8199af595949ed6713fd9d67d7d

*/

const balances = {
  "544548a154a9b27e1412160469e9d4a0a95c7def": { amount: 100, nonce: 5 },
  "ead7e597066b6e6b70fa3874eeb5ed065a461176": { amount: 50, nonce: 6 },
  "a483a46771e8c8199af595949ed6713fd9d67d7d": { amount: 75, nonce: 7 },
};

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address].amount || 0;
  const nonce = balances[address].nonce || 0;
  res.send({ balance: balance, nonce: nonce });
});

app.post("/send", async (req, res) => {
  const { sender, recipient, amount, nonce, signature } = req.body;

  setInitialBalance(sender);
  setInitialBalance(recipient);

  if(balances[sender].nonce + 1 !== nonce) {

    res.status(400).send({ message: "Invalid nonce!" });

  } else if(!(await verifySignature(sender, recipient, amount, nonce, signature, res))) {

    res.status(400).send({ message: "Invalid signature!" });

  } else if (balances[sender].amount < amount) {

    res.status(400).send({ message: "Not enough funds!" });

  } else {

    balances[sender].nonce++;
    balances[sender].amount -= amount;
    balances[recipient].amount += amount;

    res.send({ balance: balances[sender].amount });

  }

});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address].amount) {
    balances[address] = { amount: 0, nonce: 0 };
  }
}

async function verifySignature(address, recipient, sendAmount, nonce, signature) {
  const msgHash = keccak256(utf8ToBytes(address + recipient + sendAmount + nonce));
  const sigObj = new secp.Signature(BigInt(signature.r), BigInt(signature.s), signature.recovery);
  const pubKey = await sigObj.recoverPublicKey(msgHash);
  const pubKeyHex = toHex(keccak256(pubKey.toRawBytes(false)));
  const recoveredAddress = pubKeyHex.slice(-40);
  const isValid = await secp.verify(sigObj, toHex(msgHash), pubKey.toRawBytes(false)) && recoveredAddress === address;

  if(!isValid) {
    console.log(
    `\n` +
    `---------------------------------\n` +
    `Error: Invalid Signature Detected\n` +
    `---------------------------------\n` +
    `address: ${address}\n` +
    `recipient: ${recipient}\n` +
    `sendAmount: ${sendAmount}\n` +
    `nonce: ${nonce}\n` +
    `signature.r: ${signature.r}\n` +
    `signature.s: ${signature.s}\n` +
    `signature.recovery: ${signature.recovery}\n` +
    `msgHash: ${toHex(msgHash)}\n` +
    `pubKeyHex: ${pubKeyHex}\n` +
    `recoveredAddress: ${recoveredAddress}\n`
    `---------------------------------\n` +
    `\n`
    );
  }

  return isValid;
}
