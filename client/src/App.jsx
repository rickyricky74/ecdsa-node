import Wallet from "./Wallet";
import Transfer from "./Transfer";
import "./App.scss";
import { useState } from "react";

function App() {
  const [balance, setBalance] = useState(0);
  const [address, setAddress] = useState("");
  const [nonces, setNonce] = useState({}); 

  const initNonce = (address, nonce) => {
    setNonce(origNonces => {
      let newNonces = {...origNonces};
      newNonces[address] = nonce;
      return newNonces;
    });
  };

  const incrementNonce = (address) => {
    setNonce(origNonces => {
      let newNonces = {...origNonces};
      newNonces[address] = newNonces[address] + 1;
      return newNonces;
    })
  };

  return (
    <div className="app">
      <Wallet
        balance={balance}
        setBalance={setBalance}
        address={address}
        setAddress={setAddress}
        nonces={nonces}
        initNonce={initNonce}
      />
      <Transfer 
        setBalance={setBalance} 
        address={address} 
        nonces={nonces} 
        incrementNonce={incrementNonce} 
      />
    </div>
  );
}

export default App;
