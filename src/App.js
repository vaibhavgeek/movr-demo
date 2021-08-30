import Form from "./components/form";
import { useState, useEffect } from "react";
import { Hook, Console, Unhook } from 'console-feed'

const {
  Movr,
  Chain,
  Token,
  RouteOptions,
  WatcherEvent,
} = require('@movr/fund-movr-sdk')

const ethers = require('ethers')
require('dotenv').config({ path: __dirname + '.env' })

function App() {
  //amount, setAmount, fromChain, setFromChain, toChain, setToChain, fromToken, setFromToken, toToken, setToToken, clickEvent
  const [fromChain, setFromChain] = useState(0);
  const [toChain, setToChain] = useState(0);
  const [fromToken, setFromToken] = useState('');
  const [toToken, setToToken] = useState('');

  const [amount, setAmount] = useState(1);



  const [logs, setLogs] = useState([])

  
  
  useEffect(() => {
    if (typeof window.ethereum !== 'undefined') {
      console.log('MetaMask is installed!');
    }

    Hook(
      window.console,
      (log) => setLogs((currLogs) => [...currLogs, log]),
      false
    )
    return () => Unhook(window.console)
  }, [])


  async function transferFunction() {
    try {

      const provider = new ethers.providers.Web3Provider(window.ethereum);

      await provider.send("eth_requestAccounts", []);

      const signer = provider.getSigner();

      const movr = new Movr(signer)

      const sendingChain = new Chain(fromChain, 'https://rpc-mainnet.matic.network/')
      const destinationChain = new Chain(toChain, 'https://rpc.xdaichain.com/')
      // from Chain  - 137 
      // to Chain - 100 

      const USDC_POLGYON_ADDRESS = fromToken
      //0x2791bca1f2de4661ed88a30c99a7a9449aa84174

      const token = new Token(
        USDC_POLGYON_ADDRESS,
        sendingChain,
      )

      const mainAmount = (amount * 1000000).toString();

      const result = await movr
        .connect(signer)
        .move(token, sendingChain, destinationChain)
        .estimateFee(RouteOptions.MaxOutput, mainAmount)

      console.log('quote ', result)

      const route = result.routes[0]

      console.log('sending route ', route)

      const [tx, { isClaimRequired, bridgeName }] = await movr
        .connect(signer)
        .move(token, sendingChain, destinationChain)
        .approveAndSendWithRoute(route)


      console.log(tx, isClaimRequired, bridgeName)



      await tx.wait()

      movr
        .watch(tx.hash, sendingChain, destinationChain, token, bridgeName)
        .on(WatcherEvent.SourceTxStarted, (data) => {
          console.log('🚀 Source Tx Started ', data)
        })
        .on(WatcherEvent.SourceTxCompleted, (data) => {
          console.log('🚀 Source Tx ', data)
        })
        .on(WatcherEvent.ClaimToBeStarted, async (data) => {
          console.log('🚀 Claim to be started ', data)

          const claimTx = await movr
            .connect(signer)
            .claim(data.txHash, sendingChain, destinationChain)

          await claimTx.wait()

          console.log(claimTx)

        })
        .on(WatcherEvent.DestinationTxStarted, (data) => {
          console.log('🚀 Destination Tx Started ', data)
        })
        .on(WatcherEvent.DestinationTxCompleted, (data) => {
          console.log('🚀 Destination Tx Ended', data)
        })

    } catch { }
  }
  return (
    <div className="App">
      <h2>Basic MOVR DEMO</h2>
      <Form
        toChain={toChain}
        setToChain={setToChain}
        fromChain={fromChain}
        setFromChain={setFromChain}
        fromToken={fromToken}
        setFromToken={setFromToken}
        toToken={toToken}
        setToToken={setToToken}
        amount={amount}
        setAmount={setAmount}
        clickEvent={transferFunction} />

      <Console logs={logs} variant="light" />
    </div>
  );
}

export default App;
