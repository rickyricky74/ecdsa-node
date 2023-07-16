const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;

app.use(cors());
app.use(express.json());

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

app.post("/send", (req, res) => {
  const { sender, recipient, amount, nonce, signature } = req.body;

  setInitialBalance(sender);
  setInitialBalance(recipient);

  // TODO:
  // - Verify signature
  //   - where msgHash = keccak256(sender + recipient + amount + nonce)
  //   - const isValid = secp.verify(signature, msgHash, pubKey);

  if(balances[sender].nonce + 1 !== nonce){
    res.status(400).send({ message: "Invalid nonce!" });
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
