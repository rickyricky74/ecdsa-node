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
      <div>
        <p>544548a154a9b27e1412160469e9d4a0a95c7def: {nonces["544548a154a9b27e1412160469e9d4a0a95c7def"] ?? 0}</p>
        <p>ead7e597066b6e6b70fa3874eeb5ed065a461176: {nonces["ead7e597066b6e6b70fa3874eeb5ed065a461176"] ?? 0}</p>
        <p>a483a46771e8c8199af595949ed6713fd9d67d7d: {nonces["a483a46771e8c8199af595949ed6713fd9d67d7d"] ?? 0}</p>
      </div>
    </div>
  );
}

export default App;
