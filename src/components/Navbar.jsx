
import React from 'react';
import { useVoting } from '../context/VotingContext';

const Navbar = () => {
    const { account, connectWallet, isCommissioner, loading } = useVoting();

    const formatAddress = (addr) => {
        return addr ? `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}` : '';
    };

    return (
        <nav className="bg-slate-800 border-b border-slate-700 shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">
                            Decentralized Voting
                        </h1>
                    </div>
                    <div className="flex items-center space-x-4">
                        {account ? (
                            <div className="flex items-center space-x-3">
                                {isCommissioner && (
                                    <span className="px-3 py-1 text-xs font-semibold text-white bg-indigo-600 rounded-full">
                                        Admin
                                    </span>
                                )}
                                <span className="text-slate-300 bg-slate-700 px-3 py-1 rounded-lg border border-slate-600 font-mono text-sm">
                                    {formatAddress(account)}
                                </span>
                            </div>
                        ) : (
                            <button
                                onClick={connectWallet}
                                disabled={loading}
                                className="btn-primary"
                            >
                                {loading ? 'Connecting...' : 'Connect Wallet'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
