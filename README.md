# Decentralized Voting DApp (Web3)

A transparent and secure blockchain-based voting application built with React.js, Solidity, and Ethers.js. This DApp utilizes an ERC20 token (`GLDToken`) for voter eligibility verification and supports three distinct user roles: Voters, Candidates, and an Election Commissioner.
<b>Demo Link : <a href="https://voting-dapp-three-mu.vercel.app/">Click Here</a></b>

## 📜 Smart Contract Overview

 [cite_start]The logic is handled by the `Vote.sol` smart contract[cite: 4], which manages the following entities:

* [cite_start]**Voter:** Can register and cast a vote if they hold GLD Tokens[cite: 6, 124].
* [cite_start]**Candidate:** Anyone (except the commissioner) can register as a candidate (Max limit: 2 candidates)[cite: 15, 63, 64].
* [cite_start]**Election Commissioner:** The deployer of the contract who manages the election timeline and announces results[cite: 25, 40].

## 🚀 Features

### 👮 Admin (Election Commissioner)
* [cite_start]**Set Voting Period:** Define the start and end duration for the election[cite: 132].
* [cite_start]**Emergency Stop:** Halt the election immediately in case of issues[cite: 155].
* [cite_start]**Announce Results:** Calculate votes and publish the winner's address to the blockchain.

### 🗳️ Voter Portal
* [cite_start]**Self-Registration:** Users can register their profile (Name, Age, Gender)[cite: 99].
* [cite_start]**Token-Gated Voting:** **Requirement:** Voter must hold `> 0` GLD Tokens to cast a vote.
* [cite_start]**Duplicate Check:** Ensures one vote per wallet address[cite: 126].

### 👤 Candidate Portal
* [cite_start]**Self-Registration:** Users can register as candidates with details (Party, Age, Gender)[cite: 56].
* [cite_start]**Live Vote Tracking:** Candidates can see their vote count in real-time[cite: 85].

---

## 🛠️ Tech Stack

* **Frontend:** React.js
* **Blockchain Integration:** Ethers.js (v6)
* **Smart Contract:** Solidity (v0.8.26)
* **Token Standard:** ERC20 (OpenZeppelin)
* **Tools:** Hardhat, MetaMask

---

## ⚙️ Prerequisites

Before running this project, ensure you have:
1.  **Node.js** (v14+) installed.
2.  **MetaMask** extension installed in your browser.
3.  [cite_start]**GLD Token Contract Address:** You must deploy a standard ERC20 token first, as the Voting contract requires its address in the constructor[cite: 38].

---

## 📦 Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/your-username/voting-dapp.git](https://github.com/your-username/voting-dapp.git)
    cd voting-dapp
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Environment Configuration:**
    Create a `.env` file in the root directory and add your contract details:
    ```env
    REACT_APP_VOTING_CONTRACT_ADDRESS="0x..."
    REACT_APP_GLD_TOKEN_ADDRESS="0x..."
    ```

4.  **Run the Application:**
    ```bash
    npm start
    ```

---

## 📝 Usage Guide

### 1. Deployment (Smart Contract)
When deploying `Vote.sol`, you must pass the address of the ERC20 token:
```javascript
const gldTokenAddress = "0x..."; // Your GLD Token Address
const vote = await Vote.deploy(gldTokenAddress);

### 2. Election Setup (Admin)
* **Connect:** Connect with the wallet used to deploy the contract (Election Commission).
* **Navigate:** Go to the Admin Dashboard.
* **Set Timer:** Set the **Voting Period** (in seconds).
    > **Note:** The contract uses a hardcoded base timestamp. [cite_start]Ensure durations are calculated correctly relative to `1720799550` (or update the contract base time before deployment). [cite: 134]

### 3. Registration (Candidates & Voters)
* **Candidates:** Connect a different wallet and register.
    * [cite_start]*Constraint:* Only 2 candidates are allowed by default in the current contract logic. [cite: 63]
* **Voters:** Connect a wallet holding **GLD Tokens** and register.

### 4. Voting Phase
* [cite_start]**Status Change:** Once the `startTime` is reached, the status automatically changes to `InProgress`. [cite: 141]
* **Casting Votes:** Voters can select a candidate and click **Vote**.
    > [cite_start]**Important:** The transaction will fail if the user has **0 GLD Tokens**. [cite: 124]

### 5. Results
* [cite_start]**Announce:** Once `endTime` passes, the Admin clicks **Announce Result** to write the winner to the blockchain. [cite: 146]