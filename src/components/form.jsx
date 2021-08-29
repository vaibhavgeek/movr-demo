import './../App.css';

const TransactionHistory = ({ amount, setAmount, fromChain, setFromChain, toChain, setToChain, fromToken, setFromToken, toToken, setToToken, clickEvent }) => {
    return (
        <div className="form">
            <label>
                <span> From Chain ID: </span>
                <input type="text" name="From Chain ID:" value={fromChain} onChange={(e) => setFromChain(e.target.value)} />
            </label>

            
            <label>
                <span> To Chain ID: </span>
                <input type="text" name="To Chain ID:" value={toChain} onChange={(e) => setToChain(e.target.value)} />
            </label>
            
            <label>
                <span> From Token ID: </span>
                <input type="text" name="From Chain ID:" value={fromToken} onChange={(e) => setFromToken(e.target.value)} />
            </label>

            <label>
                <span> To Token ID: </span>
                <input type="text" name="From Chain ID:" value={toToken} onChange={(e) => setToToken(e.target.value)} />
            </label>

            <label>
                Amount:
                <input type="text" name="Amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
            </label>
        <button onClick={() => clickEvent()}>Proceed</button>
        </div>)
};
export default TransactionHistory;