import Form from "./components/form";
import { useState, useEffect } from "react";

const {
  Movr,
  Chain,
  Token,
  RouteOptions,
  WatcherEvent,
} = require('@movr/fund-movr-sdk')

const ethers = require('ethers')
require('dotenv').config()


function App() {
  //amount, setAmount, fromChain, setFromChain, toChain, setToChain, fromToken, setFromToken, toToken, setToToken, clickEvent
  const [fromChain, setFromChain] = useState();
  const [toChain, setToChain] = useState();
  const [fromToken, setFromToken] = useState();
  const [toToken, setToToken] = useState();

  const [amount, setAmount] = useState(1);


  const [status, setStatus] = useState(null);

  async function transferFunction() {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);

      await provider.send("eth_requestAccounts", []);

      const signer = provider.getSigner();

      const movr = new Movr(signer)

      const sendingChain = new Chain(137, process.env.POLYGON_RPC_NODE)
      const destinationChain = new Chain(100, process.env.XDAI_RPC_NODE)

      const USDC_POLGYON_ADDRESS = '0x2791bca1f2de4661ed88a30c99a7a9449aa84174'

      const token = new Token(
        USDC_POLGYON_ADDRESS,
        sendingChain,
      )

      const amount = '1000000'

      const result = await movr
        .connect(signer)
        .move(token, sendingChain, destinationChain)
        .estimateFee(RouteOptions.MaxOutput, amount)

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
          setStatus("Source Transaction Started. Step 1/5");
          console.log('🚀 Source Tx Started ', data)
        })
        .on(WatcherEvent.SourceTxCompleted, (data) => {
          setStatus("Source Transaction Completed. Step 2/5");
          console.log('🚀 Source Tx ', data)
        })
        .on(WatcherEvent.ClaimToBeStarted, async (data) => {
          setStatus("Claim Started. Step 3/5");

          console.log('🚀 Claim to be started ', data)

          const claimTx = await movr
            .connect(signer)
            .claim(data.txHash, sendingChain, destinationChain)

          await claimTx.wait()

          console.log(claimTx)

        })
        .on(WatcherEvent.DestinationTxStarted, (data) => {
          setStatus("Destination Transaction Started. Step 4/5");
          console.log('🚀 Destination Tx Started ', data)
        })
        .on(WatcherEvent.DestinationTxCompleted, (data) => {
          setStatus("Destination Transaction Completed. Step 5/5");
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
        clickEvent={(e) => transferFunction()} />
      {status && <> {status} </>}
    </div>
  );
}

export default App;
