import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Users, Shield, Award, Search, UserCheck } from 'lucide-react';

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/users').catch(() => api.get('/users'));
      const raw = res?.data !== undefined ? res.data : res;
      const list = Array.isArray(raw) ? raw : (Array.isArray(raw?.data) ? raw.data : []);
      setUsers(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    if (!window.confirm(`Update role of user to "${newRole}"?`)) return;
    try {
      await api.put(`/admin/users/${userId}/role`, { role: newRole }).catch(() =>
        api.put(`/users/${userId}/role`, { role: newRole })
      );
      fetchUsers();
    } catch (err) {
      alert(err.message || err.response?.data?.message || 'Failed to update user role');
    }
  };

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">Registered Users & Staff</h1>
        <p className="text-xs text-navy-400 mt-0.5">Role-based access governance and membership tiers</p>
      </div>

      <div className="flex items-center gap-3 bg-navy-900/60 border border-navy-800 p-3 rounded-2xl">
        <Search className="w-4 h-4 text-navy-500 ml-2" />
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-navy-950/80 border border-navy-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-accent-primary"
        />
      </div>

      <div className="bg-navy-900/60 border border-navy-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-navy-800 bg-navy-950/60 text-navy-400 font-semibold">
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Tier</th>
                <th className="py-3 px-4">Reward Points</th>
                <th className="py-3 px-4">Joined</th>
                <th className="py-3 px-4 text-right">Assign Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-800/60 text-navy-200">
              {filtered.map((u) => (
                <tr key={u._id} className="hover:bg-navy-800/20">
                  <td className="py-3 px-4 font-bold text-white flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-navy-800 border border-navy-700 flex items-center justify-center font-bold text-accent-secondary text-xs">
                      {u.name ? u.name[0].toUpperCase() : 'U'}
                    </div>
                    <span>{u.name}</span>
                  </td>
                  <td className="py-3 px-4 text-navy-300 font-mono text-[11px]">{u.email}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                        u.role === 'admin'
                          ? 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/30'
                          : u.role === 'theatre'
                          ? 'bg-teal-500/10 text-teal-300 border border-teal-500/30'
                          : 'bg-navy-800 text-navy-300'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-medium text-amber-300">{u.tier || 'Bronze'}</td>
                  <td className="py-3 px-4 font-bold text-white">{u.rewardPoints || 0}</td>
                  <td className="py-3 px-4 text-navy-400">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u._id, e.target.value)}
                      className="bg-navy-950 border border-navy-800 rounded-lg px-2 py-1 text-[11px] text-navy-200 focus:outline-none focus:border-accent-primary"
                    >
                      <option value="user">User</option>
                      <option value="theatre">Theatre</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && !loading && (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-navy-500">
                    No users matching criteria found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminUsersPage;
