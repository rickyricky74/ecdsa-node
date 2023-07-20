import { useState } from "react";
import server from "./server";
import Modal from "react-modal";
import { secp256k1 as secp } from "ethereum-cryptography/secp256k1";
import { keccak256 } from "ethereum-cryptography/keccak";
import { utf8ToBytes } from "ethereum-cryptography/utils";

Modal.setAppElement("#root");

function Transfer({ address, setBalance, nonces, incrementNonce }) {
  const [sendAmount, setSendAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [msgHash, setMsgHash] = useState("");
  const [privateKey, setPrivateKey] = useState("");
  const [signature, setSignature] = useState({ r: null, s: null, recovery: null });

  const setValue = (setter) => (evt) => setter(evt.target.value);

  function openModal(e) {
    e.preventDefault()
    setMsgHash(keccak256(utf8ToBytes( address + recipient + sendAmount +  (Number(nonces[address])+1) )));
    setModalIsOpen(true);
  }

  function closeModal(e) {
    setModalIsOpen(false);
  };

  function updatePrivateKey(e) {
    setPrivateKey(e.target.value);
  }

  const sign = async () => {
    if(!privateKey) return;
    const sig = await secp.sign(msgHash, privateKey);
    setSignature({ r: sig.r.toString(), s: sig.s.toString(), recovery: sig.recovery });
    setModalIsOpen(false);
    setPrivateKey("");
  }

  const cannotSign = () => !address || !sendAmount || sendAmount <= 0 || !recipient || signature.r;

  async function transfer(evt) {
    evt.preventDefault();

    try {
      const {
        data: { balance },
      } = await server.post(`send`, {
        sender: address,
        amount: parseInt(sendAmount),
        nonce: nonces[address]+1,
        signature: signature,
        recipient: recipient,
      });
      incrementNonce(address);
      setBalance(balance);
      setSendAmount("");
      setRecipient("");
      setSignature({ r: null, s: null, recovery: null });
      alert("Transfer successful!");
    } catch (ex) {
      setSendAmount("");
      setRecipient("");
      setSignature({ r: null, s: null, recovery: null });      
      alert(ex.response.data.message);
    }
  }

  return (
    <div className="transfer-box">
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

        { !signature.r && <button className="button" onClick={openModal} disabled={cannotSign()} >Sign Transaction</button> }

        { signature.r && <div className="signed">Signed! Ready to Transfer</div> }

        <input type="submit" className="button" value="Transfer" disabled={!signature.r} />

      </form>

      <Modal
        className="sign-modal"
        overlayClassName="sign-modal-overlay"
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="My dialog"
      >
        <div>
          <p>Sign the transaction with your private key:</p>
          <input type="text" className="priv-key-input" placeholder="Enter private key" onChange={updatePrivateKey} />
        </div>
        <button className="button sign-button" onClick={sign} disabled={!privateKey}>Sign</button>
      </Modal>   

    </div>
  );
}

export default Transfer;
