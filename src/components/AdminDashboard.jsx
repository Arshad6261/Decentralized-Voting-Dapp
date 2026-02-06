
import React, { useState } from 'react';
import { useVoting } from '../context/VotingContext';
import { GENDER } from '../constants';

const AdminDashboard = () => {
    const { registerCandidate, setVotingPeriod, emergencyStop, announceResult, distributeToken, loading, error, isCommissioner } = useVoting();

    const [candidateForm, setCandidateForm] = useState({ name: '', party: '', age: '', gender: GENDER.MALE });
    const [periodForm, setPeriodForm] = useState({ start: '', end: '' });
    const [tokenForm, setTokenForm] = useState({ address: '', amount: '1' });

    if (!isCommissioner) {
        return <div className="text-center text-red-400 mt-10">Access Denied: You are not the Election Commissioner.</div>;
    }

    const handleCandidateRegister = async (e) => {
        e.preventDefault();
        await registerCandidate(candidateForm.name, candidateForm.party, candidateForm.age, candidateForm.gender);
        setCandidateForm({ name: '', party: '', age: '', gender: GENDER.MALE });
    };

    const handleSetPeriod = async (e) => {
        e.preventDefault();
        await setVotingPeriod(periodForm.start, periodForm.end);
        setPeriodForm({ start: '', end: '' });
    };

    const handleDistributeToken = async (e) => {
        e.preventDefault();
        await distributeToken(tokenForm.address, tokenForm.amount);
        setTokenForm({ address: '', amount: '1' });
    };

    return (
        <div className="space-y-8 animate-fade-in-up">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">Admin Dashboard</h2>
                <div className="space-x-4">
                    <button onClick={emergencyStop} className="btn-danger">
                        Emergency Stop
                    </button>
                    <button onClick={announceResult} className="btn-primary bg-green-600 hover:bg-green-700">
                        Announce Result
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Register Candidate */}
                <div className="card">
                    <h3 className="text-xl font-semibold mb-4 text-indigo-400">Register Candidate</h3>
                    <form onSubmit={handleCandidateRegister} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-400">Name</label>
                            <input
                                type="text"
                                required
                                className="input-field"
                                value={candidateForm.name}
                                onChange={(e) => setCandidateForm({ ...candidateForm, name: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-400">Party</label>
                            <input
                                type="text"
                                required
                                className="input-field"
                                value={candidateForm.party}
                                onChange={(e) => setCandidateForm({ ...candidateForm, party: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-400">Age</label>
                                <input
                                    type="number"
                                    required
                                    min="18"
                                    className="input-field"
                                    value={candidateForm.age}
                                    onChange={(e) => setCandidateForm({ ...candidateForm, age: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400">Gender</label>
                                <select
                                    className="input-field"
                                    value={candidateForm.gender}
                                    onChange={(e) => setCandidateForm({ ...candidateForm, gender: Number(e.target.value) })}
                                >
                                    <option value={GENDER.MALE}>Male</option>
                                    <option value={GENDER.FEMALE}>Female</option>
                                    <option value={GENDER.OTHER}>Other</option>
                                </select>
                            </div>
                        </div>
                        <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
                            {loading ? 'Processing...' : 'Register Candidate'}
                        </button>
                    </form>
                </div>

                {/* Set Voting Period */}
                <div className="card h-fit">
                    <h3 className="text-xl font-semibold mb-4 text-indigo-400">Set Voting Period</h3>
                    <form onSubmit={handleSetPeriod} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-400">Start Duration (seconds from now)</label>
                            <input
                                type="number"
                                required
                                className="input-field"
                                placeholder="e.g., 60 (1 min)"
                                value={periodForm.start}
                                onChange={(e) => setPeriodForm({ ...periodForm, start: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-400">End Duration (seconds from start)</label>
                            <input
                                type="number"
                                required
                                className="input-field"
                                placeholder="e.g., 3600 (1 hour)"
                                value={periodForm.end}
                                onChange={(e) => setPeriodForm({ ...periodForm, end: e.target.value })}
                            />
                            <p className="text-xs text-slate-500 mt-1">Must be {'>'} 3600 (1 hour) as per contract constraints.</p>
                        </div>
                        <button type="submit" disabled={loading} className="btn-secondary w-full mt-2">
                            {loading ? 'Processing...' : 'Set Period'}
                        </button>
                    </form>
                </div>
            </div>

            {/* Distribute Token */}
            <div className="card h-fit w-full lg:w-1/2 mx-auto">
                <h3 className="text-xl font-semibold mb-4 text-indigo-400">Distribute GLD Tokens</h3>
                <form onSubmit={handleDistributeToken} className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="flex-grow w-full">
                        <label className="block text-sm font-medium text-slate-400">Voter Address</label>
                        <input
                            type="text"
                            required
                            className="input-field"
                            placeholder="0x..."
                            value={tokenForm.address}
                            onChange={(e) => setTokenForm({ ...tokenForm, address: e.target.value })}
                        />
                    </div>
                    <div className="w-full md:w-24">
                        <label className="block text-sm font-medium text-slate-400">Amount</label>
                        <input
                            type="number"
                            required
                            min="1"
                            className="input-field"
                            value={tokenForm.amount}
                            onChange={(e) => setTokenForm({ ...tokenForm, amount: e.target.value })}
                        />
                    </div>
                    <button type="submit" disabled={loading} className="btn-primary mb-[2px] w-full md:w-auto">
                        Send
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AdminDashboard;
