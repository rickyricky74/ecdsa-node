import { useState } from "react";
import server from "./server";

// TODO: 
// - Add a button for the user to sign the transaction
//   - Provide pop-up to enter the private key
//   - Create a msgHash keccak256(sender + recipient + amount + nonce)
//   - Create the signature: secp.signAsync(msgHash, privKey)
//   - Set the signature in a useState variable (i.e. [signature, setSignature] = useState(""))
// - Implement signature verification in the server

function Transfer({ address, setBalance, nonces, incrementNonce }) {
  const [sendAmount, setSendAmount] = useState("");
  const [recipient, setRecipient] = useState("");

  const setValue = (setter) => (evt) => setter(evt.target.value);

  async function transfer(evt) {
    evt.preventDefault();

    try {
      const {
        data: { balance },
      } = await server.post(`send`, {
        sender: address,
        amount: parseInt(sendAmount),
        nonce: nonces[address]+1,
        signature: "0x0",
        recipient,
      });
      incrementNonce(address);
      setBalance(balance);
    } catch (ex) {
      alert(ex.response.data.message);
    }
  }

  return (
    <form className="container transfer" onSubmit={transfer}>
      <h1>Send Transaction</h1>

      <label>
        Send Amount
        <input
          placeholder="1, 2, 3..."
          value={sendAmount}
          onChange={setValue(setSendAmount)}
        ></input>
      </label>

      <label>
        Recipient
        <input
          placeholder="Type an address, for example: 0x2"
          value={recipient}
          onChange={setValue(setRecipient)}
        ></input>
      </label>

      <input type="submit" className="button" value="Transfer" />
    </form>
  );
}

export default Transfer;
