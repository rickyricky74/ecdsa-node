import server from "./server";

function Wallet({ address, setAddress, balance, setBalance, nonces, initNonce }) {

  async function onChange(evt) {
    
    const address = evt.target.value;

    setAddress(address);
    if (address) {
      const {
        data: { balance, nonce },
      } = await server.get(`balance/${address}`);
      setBalance(balance);
      initNonce(address, nonce);
    } else {
      setBalance(0);
    }
  }

  return (
    <div className="container wallet">
      <h1>Your Wallet</h1>

      <label>
        Wallet Address
        <input placeholder="Type an address, for example: 0x1" value={address} onChange={onChange}></input>
      </label>

      <div className="balance">Balance: {balance}</div>
      <pre>Nonce: {nonces[address] ?? 0}</pre>
    </div>
  );
}

export default Wallet;
