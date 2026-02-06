
import React, { useState, useEffect } from 'react';
import { useVoting } from '../context/VotingContext';
import { GENDER, VOTING_STATUS } from '../constants';

const VoterDashboard = () => {
    const {
        account,
        candidates,
        registerVoter,
        vote,
        votingStatus,
        times,
        checkTokenBalance,
        userVoterId,
        loading
    } = useVoting();

    const [voterForm, setVoterForm] = useState({ name: '', age: '', gender: GENDER.MALE });
    const [timeLeft, setTimeLeft] = useState('');
    const [winner, setWinner] = useState(null);

    // Timer Logic
    useEffect(() => {
        const timer = setInterval(() => {
            const now = Math.floor(Date.now() / 1000);
            if (votingStatus === VOTING_STATUS.NOT_STARTED) {
                if (times.start > 0) {
                    const diff = times.start - now;
                    if (diff > 0) setTimeLeft(`Starts in: ${formatTime(diff)}`);
                    else setTimeLeft("Starting soon...");
                } else {
                    setTimeLeft("Voting has not been scheduled.");
                }
            } else if (votingStatus === VOTING_STATUS.IN_PROGRESS) {
                const diff = times.end - now;
                if (diff > 0) setTimeLeft(`Ends in: ${formatTime(diff)}`);
                else setTimeLeft("Voting is ending...");
            } else {
                setTimeLeft("Voting has ended.");
            }
        }, 1000);
        return () => clearInterval(timer);
    }, [votingStatus, times]);

    const formatTime = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h}h ${m}m ${s}s`;
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        await registerVoter(voterForm.name, voterForm.age, voterForm.gender);
        setVoterForm({ name: '', age: '', gender: GENDER.MALE });
    };

    const handleVote = async (candidateId) => {
        const hasToken = await checkTokenBalance();
        if (!hasToken) {
            alert("You do not hold the required GLD Token to vote!");
            return;
        }
        await vote(candidateId);
    };

    // Helper to find voter ID handled in context

    return (
        <div className="space-y-8 animate-fade-in-up">
            {/* Status Section */}
            <div className="text-center p-6 bg-slate-800 rounded-xl shadow-lg border border-slate-700 bg-opacity-50 backdrop-blur-sm">
                <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-emerald-600 mb-2">
                    {votingStatus === VOTING_STATUS.NOT_STARTED && "Voting Not Started"}
                    {votingStatus === VOTING_STATUS.IN_PROGRESS && "Voting In Progress"}
                    {votingStatus === VOTING_STATUS.ENDED && "Voting Ended"}
                </h2>
                <p className="text-xl text-slate-300 font-mono">{timeLeft}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Registration Form */}
                <div className="lg:col-span-1">
                    <div className="card sticky top-24">
                        <h3 className="text-xl font-semibold mb-4 text-indigo-400">
                            {userVoterId ? "Voter Profile" : "Voter Registration"}
                        </h3>
                        {userVoterId ? (
                            <div className="text-green-400 font-bold p-4 bg-green-900/30 rounded border border-green-700">
                                You are registered!
                                <p className="text-sm text-green-300 mt-1">Voter ID: {userVoterId}</p>
                            </div>
                        ) : (
                            <form onSubmit={handleRegister} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400">Name</label>
                                    <input
                                        type="text" required className="input-field"
                                        value={voterForm.name}
                                        onChange={(e) => setVoterForm({ ...voterForm, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-400">Age</label>
                                    <input
                                        type="number" required min="18" className="input-field"
                                        value={voterForm.age}
                                        onChange={(e) => setVoterForm({ ...voterForm, age: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-400">Gender</label>
                                    <select
                                        className="input-field"
                                        value={voterForm.gender}
                                        onChange={(e) => setVoterForm({ ...voterForm, gender: Number(e.target.value) })}
                                    >
                                        <option value={GENDER.MALE}>Male</option>
                                        <option value={GENDER.FEMALE}>Female</option>
                                        <option value={GENDER.OTHER}>Other</option>
                                    </select>
                                </div>
                                <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
                                    Register
                                </button>
                            </form>
                        )}
                    </div>
                </div>

                {/* Candidates List */}
                <div className="lg:col-span-2 space-y-4">
                    <h3 className="text-2xl font-semibold text-white mb-4">Candidates</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {candidates.length > 0 ? candidates.map((candidate) => (
                            <div key={candidate.candidateId} className="card hover:border-indigo-500 transition-colors">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="text-xl font-bold text-white">{candidate.name}</h4>
                                        <p className="text-slate-400 text-sm">{candidate.party}</p>
                                        <div className="mt-2 space-y-1 text-sm text-slate-500">
                                            <p>Age: {candidate.age}</p>
                                            <p>Gender: {Object.keys(GENDER).find(k => GENDER[k] === candidate.gender)}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-2xl font-bold text-indigo-400">{candidate.votes}</span>
                                        <p className="text-xs text-slate-500 uppercase">Votes</p>
                                    </div>
                                </div>
                                <div className="mt-6">
                                    <button
                                        onClick={() => handleVote(candidate.candidateId)}
                                        disabled={votingStatus !== VOTING_STATUS.IN_PROGRESS || loading}
                                        className={`w-full py-2 rounded font-bold transition ${votingStatus === VOTING_STATUS.IN_PROGRESS
                                            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white'
                                            : 'bg-slate-700 text-slate-500 cursor-not-allowed'}`}
                                    >
                                        Vote
                                    </button>
                                </div>
                            </div>
                        )) : (
                            <div className="col-span-2 text-center text-slate-500 py-10 bg-slate-800 rounded-xl">
                                No candidates registered yet.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VoterDashboard;
