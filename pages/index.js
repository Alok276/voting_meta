import { useState, useEffect } from "react";
import { ethers } from "ethers";
import votingAbi from "../artifacts/contracts/Voting.sol/Voting.json";

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [voting, setVoting] = useState(undefined);
  const [candidates, setCandidates] = useState([]);
  const [newCandidate, setNewCandidate] = useState("");
  const [voteIndex, setVoteIndex] = useState("");

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Replace with your deployed contract address
  const votingABI = votingAbi.abi;

  const getWallet = async () => {
    if (window.ethereum) {
      setEthWallet(window.ethereum);
    }

    if (ethWallet) {
      const account = await ethWallet.request({ method: "eth_accounts" });
      handleAccount(account);
    }
  };

  const handleAccount = (account) => {
    if (account.length > 0) {
      console.log("Account connected: ", account[0]);
      setAccount(account[0]);
      getVotingContract();
    } else {
      console.log("No account found");
    }
  };

  const connectAccount = async () => {
    if (!ethWallet) {
      alert("MetaMask wallet is required to connect");
      return;
    }

    const accounts = await ethWallet.request({ method: "eth_requestAccounts" });
    handleAccount(accounts);
  };

  const getVotingContract = () => {
    const provider = new ethers.providers.Web3Provider(ethWallet);
    const signer = provider.getSigner();
    const votingContract = new ethers.Contract(contractAddress, votingABI, signer);

    setVoting(votingContract);
  };

  const addCandidate = async () => {
    if (voting && newCandidate) {
      const tx = await voting.addCandidate(newCandidate);
      await tx.wait();
      fetchCandidates();
      setNewCandidate(""); // Clear input after adding candidate
    }
  };

  const vote = async () => {
    if (voting && voteIndex !== "") {
      const tx = await voting.vote(parseInt(voteIndex));
      await tx.wait();
      fetchCandidates();
      setVoteIndex(""); // Clear input after voting
    }
  };

  const fetchCandidates = async () => {
    if (voting) {
      const candidateCount = await voting.getCandidateCount();
      const candidatesArray = [];
      for (let i = 0; i < candidateCount; i++) {
        const candidate = await voting.getCandidate(i);
        candidatesArray.push({ name: candidate[0], voteCount: candidate[1].toString() });
      }
      setCandidates(candidatesArray);
    }
  };

  const initUser = () => {
    // Check to see if user has MetaMask
    if (!ethWallet) {
      return <p>Please install MetaMask in order to use this Voting DApp.</p>;
    }

    // Check to see if user is connected. If not, connect to their account
    if (!account) {
      return <button onClick={connectAccount}>Please connect your MetaMask wallet</button>;
    }

    if (candidates.length === 0) {
      fetchCandidates();
    }

    return (
      <div>
        <p>Your Account: {account}</p>
        <h2>Candidate List</h2>
        <ul>
          {candidates.map((candidate, index) => (
            <li key={index}>
              {candidate.name} - {candidate.voteCount} votes
            </li>
          ))}
        </ul>
        <input
          type="text"
          placeholder="New candidate name"
          value={newCandidate}
          onChange={(e) => setNewCandidate(e.target.value)}
        />
        <button onClick={addCandidate}>Add Candidate</button>
        <input
          type="number"
          placeholder="Vote for candidate index"
          value={voteIndex}
          onChange={(e) => setVoteIndex(e.target.value)}
        />
        <button onClick={vote}>Vote</button>
      </div>
    );
  };

  useEffect(() => {
    getWallet();
  }, []);

  useEffect(() => {
    if (account && voting) {
      fetchCandidates();
    }
  }, [account, voting]);

  return (
    <main className="container">
      <header><h1>Welcome to the Voting DApp!</h1></header>
      {initUser()}
      <style jsx>{`
        .container {
          text-align: center;
        }
      `}
      </style>
    </main>
  );
}
