import React, { useEffect, useState } from 'react';
import { Trash2, LogOut, Users, ShieldAlert } from 'lucide-react';

interface AdminPanelProps {
    token: string;
    onLogout: () => void;
}

interface User {
    id: number;
    username: string;
    is_admin: boolean;
}

export default function AdminPanel({ token, onLogout }: AdminPanelProps) {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const API_URL = 'http://localhost:8000';

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await fetch(`${API_URL}/admin/users`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setUsers(data);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const deleteUser = async (id: number, name: string) => {
        if (!window.confirm(`确定要彻底删除班级 "${name}" 吗？所有数据将无法恢复！`)) return;

        try {
            const res = await fetch(`${API_URL}/admin/users/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                setUsers(prev => prev.filter(u => u.id !== id));
                alert("删除成功");
            } else {
                const d = await res.json();
                alert(d.detail || "删除失败");
            }
        } catch (e) {
            alert("删除失败");
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white p-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-12">
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <ShieldAlert className="text-red-500" />
                        超级管理员后台
                    </h1>
                    <button
                        onClick={onLogout}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700"
                    >
                        <LogOut size={18} />
                        退出登录
                    </button>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
                    <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                        <h2 className="text-xl font-semibold flex items-center gap-2">
                            <Users className="text-blue-400" />
                            已注册班级列表
                        </h2>
                        <span className="text-slate-500 text-sm">共 {users.length} 个账号</span>
                    </div>

                    {loading ? (
                        <div className="p-12 text-center text-slate-500">加载中...</div>
                    ) : (
                        <div className="divide-y divide-slate-800">
                            {users.map(user => (
                                <div key={user.id} className="p-6 flex items-center justify-between hover:bg-slate-800/50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${user.is_admin ? 'bg-red-500/20 text-red-500' : 'bg-blue-500/20 text-blue-500'}`}>
                                            {user.is_admin ? <ShieldAlert size={20} /> : <Users size={20} />}
                                        </div>
                                        <div>
                                            <div className="font-bold text-lg">{user.username}</div>
                                            <div className="text-xs text-slate-500">ID: {user.id} {user.is_admin && '(Admin)'}</div>
                                        </div>
                                    </div>

                                    {!user.is_admin && (
                                        <button
                                            onClick={() => deleteUser(user.id, user.username)}
                                            className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition-all text-sm border border-red-500/20"
                                        >
                                            <Trash2 size={16} />
                                            删除该班级
                                        </button>
                                    )}
                                </div>
                            ))}

                            {users.length === 0 && (
                                <div className="p-12 text-center text-slate-500">暂无数据</div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
