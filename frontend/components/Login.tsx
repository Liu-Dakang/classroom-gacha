import React, { useState } from 'react';
import { User, Lock, School, LogIn, UserPlus } from 'lucide-react';

interface LoginProps {
    onLogin: (token: string, username: string, isAdmin: boolean) => void;
}

export default function Login({ onLogin }: LoginProps) {
    const [isRegistering, setIsRegistering] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const API_URL = 'http://localhost:8000';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isRegistering) {
                // Register
                const res = await fetch(`${API_URL}/users`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password }),
                });

                if (!res.ok) {
                    const data = await res.json();
                    throw new Error(data.detail || 'Registration failed');
                }

                // Auto login on register (backend returns token)
                const data = await res.json();
                const meRes = await fetch(`${API_URL}/users/me`, {
                    headers: { 'Authorization': `Bearer ${data.access_token}` }
                });
                const me = await meRes.json();

                onLogin(data.access_token, username, me.is_admin);

            } else {
                // Login (OAuth2 form request)
                const formData = new URLSearchParams();
                formData.append('username', username);
                formData.append('password', password);

                const res = await fetch(`${API_URL}/token`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: formData,
                });

                if (!res.ok) {
                    throw new Error('Login failed: Incorrect class name or password');
                }

                const data = await res.json();
                // Get user info to check admin status
                const meRes = await fetch(`${API_URL}/users/me`, {
                    headers: { 'Authorization': `Bearer ${data.access_token}` }
                });
                const me = await meRes.json();

                onLogin(data.access_token, username, me.is_admin);
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-8 relative overflow-hidden">
                {/* Background blobs */}
                <div className="absolute top-0 left-0 w-32 h-32 bg-purple-500/20 blur-3xl -translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 right-0 w-32 h-32 bg-amber-500/20 blur-3xl translate-x-1/2 translate-y-1/2" />

                <div className="relative z-10">
                    <div className="flex justify-center mb-8">
                        <div className="bg-slate-800 p-4 rounded-full border border-slate-700 shadow-inner">
                            <School className="w-12 h-12 text-amber-400" />
                        </div>
                    </div>

                    <h2 className="text-3xl font-bold text-center text-white mb-2">
                        {isRegistering ? '注册新班级' : '班级登录'}
                    </h2>
                    <p className="text-slate-400 text-center mb-8">
                        {isRegistering ? '创建属于你的班级抽卡系统' : '欢迎回来，请登录管理班级'}
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300 ml-1">班级名称 (账号)</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
                                <input
                                    type="text"
                                    required
                                    value={username}
                                    onChange={e => setUsername(e.target.value)}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 outline-none transition-all placeholder:text-slate-600"
                                    placeholder="例如: 2024级1班"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300 ml-1">班级密码</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 outline-none transition-all placeholder:text-slate-600"
                                    placeholder="••••••••"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            handleSubmit(e);
                                        }
                                    }}
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm animate-in fade-in slide-in-from-top-2">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-amber-900/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    {isRegistering ? <UserPlus className="w-5 h-5" /> : <LogIn className="w-5 h-5" />}
                                    {isRegistering ? '立即注册' : '进入系统'}
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center text-sm">
                        <span className="text-slate-500">
                            {isRegistering ? '已有账号? ' : '还没有账号? '}
                        </span>
                        <button
                            onClick={() => {
                                setIsRegistering(!isRegistering);
                                setError('');
                            }}
                            className="text-amber-400 hover:text-amber-300 font-medium transition-colors"
                        >
                            {isRegistering ? '直接登录' : '注册新班级'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
