
import React, { createContext, useContext, useEffect, useState } from 'react';
import { ethers } from 'ethers';
import VoteABI from '../VoteABI.json';
import { VOTE_CONTRACT_ADDRESS, VOTING_STATUS } from '../constants';

const VotingContext = createContext();

const ERC20_ABI = [
    "function balanceOf(address owner) view returns (uint256)",
    "function transfer(address to, uint256 amount) returns (bool)"
];

export const VotingProvider = ({ children }) => {
    const [account, setAccount] = useState(null);
    const [provider, setProvider] = useState(null);
    const [signer, setSigner] = useState(null);
    const [contract, setContract] = useState(null);
    const [tokenContract, setTokenContract] = useState(null);
    const [votingStatus, setVotingStatus] = useState(VOTING_STATUS.NOT_STARTED);
    const [isCommissioner, setIsCommissioner] = useState(false);
    const [candidates, setCandidates] = useState([]);
    const [times, setTimes] = useState({ start: 0, end: 0 });
    const [userVoterId, setUserVoterId] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [chainId, setChainId] = useState(null);

    // Initialize Ethers and Contract
    useEffect(() => {
        const init = async () => {
            if (window.ethereum) {
                try {
                    // Listen for account changes
                    window.ethereum.on('accountsChanged', (accounts) => {
                        if (accounts.length > 0) {
                            setAccount(accounts[0]);
                            // data fetches will trigger via another useEffect depending on account/contract
                        } else {
                            setAccount(null);
                            setIsCommissioner(false);
                        }
                    });

                    // Listen for chain changes
                    window.ethereum.on('chainChanged', () => {
                        window.location.reload();
                    });

                    const _provider = new ethers.BrowserProvider(window.ethereum);
                    setProvider(_provider);

                    const network = await _provider.getNetwork();
                    setChainId(network.chainId);

                    const accounts = await _provider.listAccounts();
                    if (accounts.length > 0) {
                        const _signer = await _provider.getSigner();
                        setSigner(_signer);
                        setAccount(accounts[0].address);
                    }

                } catch (err) {
                    console.error("Initialization error:", err);
                    setError("Failed to initialize wallet connection.");
                }
            }
        };
        init();
        // Cleanup listeners
        return () => {
            if (window.ethereum) {
                window.ethereum.removeAllListeners('accountsChanged');
                window.ethereum.removeAllListeners('chainChanged');
            }
        };
    }, []);

    // Initialize Contracts when signer is available (or provider for read-only, but we usually want signer)
    useEffect(() => {
        if (provider && account) {
            const initContracts = async () => {
                try {
                    const _signer = await provider.getSigner();
                    setSigner(_signer);

                    // Use placeholder checks or real contract creation
                    const _contract = new ethers.Contract(VOTE_CONTRACT_ADDRESS, VoteABI, _signer);
                    setContract(_contract);

                    // Fetch Token Address dynamically from the contract
                    let _tokenAddress;
                    try {
                        _tokenAddress = await _contract.gldToken();
                        console.log("Fetched GLD Token Address:", _tokenAddress);
                    } catch (err) {
                        console.error("Failed to fetch token address", err);
                        _tokenAddress = ethers.ZeroAddress; // Fallback or handle error
                    }

                    if (_tokenAddress && _tokenAddress !== ethers.ZeroAddress) {
                        setTokenContract(new ethers.Contract(_tokenAddress, ERC20_ABI, _signer));
                    }

                    // Fetch initial data
                    await fetchContractData(_contract, account);

                } catch (err) {
                    console.error("Contract load error:", err);
                    // Don't set global error here if it's just invalid address placeholder
                }
            }
            initContracts();
        }
    }, [provider, account]);

    const fetchContractData = async (_contract, _account) => {
        setLoading(true);
        try {
            // Roles
            const commissioner = await _contract.electionCommission();
            setIsCommissioner(_account.toLowerCase() === commissioner.toLowerCase());

            // Status
            const status = await _contract.getVotingStatus();
            setVotingStatus(Number(status));

            // Candidates logic
            // This relies on getCandidateList from ABI
            try {
                const candidateList = await _contract.getCandidateList();
                // Transform data if necessary (structs return as Proxy/Result)
                const formattedCandidates = candidateList.map(c => ({
                    name: c.name,
                    party: c.party,
                    age: Number(c.age),
                    gender: Number(c.gender),
                    candidateId: Number(c.candidateId),
                    candidateAddress: c.candidateAddress,
                    votes: Number(c.votes)
                }));
                setCandidates(formattedCandidates);
            } catch (err) {
                console.log("Error fetching candidates", err);
            }

            // Fetch Voters to find my ID
            try {
                const voterList = await _contract.getVoterList();
                const myVoter = voterList.find(v => v.voterAddress.toLowerCase() === _account.toLowerCase());
                if (myVoter) {
                    setUserVoterId(Number(myVoter.voterId));
                } else {
                    setUserVoterId(0);
                }
            } catch (err) {
                console.log("Error fetching voters", err);
            }

            // Fetch Times
            try {
                const sTime = await _contract.startTime();
                const eTime = await _contract.endTime();
                setTimes({ start: Number(sTime), end: Number(eTime) });
            } catch (err) {
                console.log("Error fetching times", err);
            }

        } catch (err) {
            console.error("Data fetch error:", err);
            // Silent fail for now as address might be wrong
        } finally {
            setLoading(false);
        }
    };

    const connectWallet = async () => {
        if (!window.ethereum) {
            setError("MetaMask is not installed!");
            return;
        }
        setLoading(true);
        setError("");
        try {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            setAccount(accounts[0]);
        } catch (err) {
            setError("Failed to connect wallet.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // --- Transactions ---

    const simpleTx = async (txFunction, successMsg) => {
        setLoading(true);
        setError("");
        try {
            const tx = await txFunction();
            await tx.wait(); // Wait for confirmation
            // Refresh data
            await fetchContractData(contract, account);
            return { success: true, message: successMsg };
        } catch (err) {
            console.error("Transaction Error:", err);
            let msg = "Transaction failed";
            if (err.reason) msg = err.reason;
            if (err.message && err.message.includes("user rejected")) msg = "User rejected transaction";
            setError(msg);
            return { success: false, message: msg };
        } finally {
            setLoading(false);
        }
    };

    const registerCandidate = async (name, party, age, gender) => {
        return simpleTx(
            () => contract.registerCandidate(name, party, age, gender),
            "Candidate registered successfully!"
        );
    };

    const setVotingPeriod = async (startDuration, endDuration) => {
        return simpleTx(
            () => contract.setVotingPeriod(startDuration, endDuration),
            "Voting period set!"
        );
    };

    const emergencyStop = async () => {
        return simpleTx(
            () => contract.emergencyStopVoting(),
            "Voting stopped!"
        );
    };

    const announceResult = async () => {
        return simpleTx(
            () => contract.announceVotingResult(),
            "Result announced!"
        );
    };

    const registerVoter = async (name, age, gender) => {
        return simpleTx(
            () => contract.registerVoter(name, age, gender),
            "Voter registered!"
        );
    };

    const vote = async (candidateId) => {
        if (!userVoterId) {
            setError("You are not registered to vote!");
            return;
        }
        return simpleTx(
            () => contract.castVote(userVoterId, candidateId),
            "Vote cast successfully!"
        );
    };

    const checkTokenBalance = async () => {
        if (!tokenContract || !account) return false;
        try {
            const balance = await tokenContract.balanceOf(account);
            return balance > 0;
        } catch (err) {
            console.error("Token check failed", err);
            return false;
        }
    };

    const distributeToken = async (toAddress, amount) => {
        if (!tokenContract) return { success: false, message: "Token contract not loaded" };
        return simpleTx(
            () => tokenContract.transfer(toAddress, ethers.parseUnits(amount, 18)), // Assuming 18 decimals
            `Sent ${amount} GLD to ${toAddress}`
        );
    };

    return (
        <VotingContext.Provider value={{
            account,
            connectWallet,
            isCommissioner,
            votingStatus,
            candidates,
            times,
            userVoterId,
            loading,
            error,
            registerCandidate,
            setVotingPeriod,
            emergencyStop,
            announceResult,
            registerVoter,
            vote,
            checkTokenBalance,
            distributeToken,
            contract
        }}>
            {children}
        </VotingContext.Provider>
    );
};

export const useVoting = () => useContext(VotingContext);
