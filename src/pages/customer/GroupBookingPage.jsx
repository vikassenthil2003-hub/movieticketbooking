import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Plus, Share2, Check, Clock, CheckCircle2, AlertCircle, Copy, ArrowRight, ShieldAlert } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const GroupBookingPage = () => {
  const { user, isAuthenticated, isAdmin } = useAuth();

  const [shows, setShows] = useState([]);
  const [selectedShowId, setSelectedShowId] = useState('');
  const [totalSeats, setTotalSeats] = useState(3);
  const [groupTitle, setGroupTitle] = useState('Weekend Movie Night');
  const [activeGroup, setActiveGroup] = useState(null);
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [memberJoinName, setMemberJoinName] = useState('');
  const [memberJoinEmail, setMemberJoinEmail] = useState('');
  const [memberSeatNumber, setMemberSeatNumber] = useState('E4');
  const [copiedCode, setCopiedCode] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  // Fetch available shows to start group
  useEffect(() => {
    const fetchShows = async () => {
      try {
        const res = await api.get('/shows');
        setShows(res.data?.shows || []);
        if (res.data?.shows?.length > 0) {
          setSelectedShowId(res.data.shows[0]._id);
        }
      } catch (err) {
        console.error('[Shows fetch error]:', err);
      }
    };
    fetchShows();
  }, []);

  // Create Group Session
  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (isAdmin) {
      alert('Admins are not allowed to book movie tickets. Please use a customer account.');
      return;
    }
    if (!isAuthenticated) {
      alert('Please sign in to create a group booking session.');
      return;
    }

    try {
      const res = await api.post('/groups', {
        showId: selectedShowId,
        totalSeatsNeeded: Number(totalSeats),
        title: groupTitle,
      });
      setActiveGroup(res.data);
      setStatusMessage(`Group session ${res.data.groupCode} created successfully!`);
    } catch (err) {
      alert(err.message || 'Failed to create group');
    }
  };

  // Lookup / Join existing group
  const handleLookupGroup = async (e) => {
    e.preventDefault();
    if (!joinCodeInput.trim()) return;

    try {
      const res = await api.get(`/groups/${joinCodeInput.trim()}`);
      setActiveGroup(res.data);
      setStatusMessage(`Joined group session: ${res.data.groupCode}`);
    } catch (err) {
      alert(err.message || 'Group session not found.');
    }
  };

  // Add Member to Group
  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!activeGroup) return;

    try {
      const res = await api.post(`/groups/${activeGroup.groupCode}/join`, {
        name: memberJoinName || user?.name || 'Friend',
        email: memberJoinEmail || user?.email || 'friend@demo.com',
        seatNumbers: [memberSeatNumber],
      });
      setActiveGroup(res.data);
      setMemberJoinName('');
      setMemberJoinEmail('');
      setStatusMessage('Member joined group successfully!');
    } catch (err) {
      alert(err.message || 'Failed to add member to group');
    }
  };

  // Simulate Member Share Payment
  const handleSimulatePayShare = async (memberEmail) => {
    try {
      const res = await api.post(`/groups/${activeGroup.groupCode}/pay-share`, {
        memberEmail,
      });
      // Refresh group
      const updated = await api.get(`/groups/${activeGroup.groupCode}`);
      setActiveGroup(updated.data);
      setStatusMessage(`Simulated split payment completed for ${memberEmail}!`);
    } catch (err) {
      alert(err.message || 'Payment simulation failed');
    }
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  if (isAdmin) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full p-8 rounded-3xl glass-panel border border-amber-500/30 text-center space-y-5 animate-in fade-in duration-300">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-bold font-display text-white">Group Booking Restricted</h2>
            <p className="text-sm text-slate-300 mt-2">
              Admins are not allowed to book movie tickets. Please use a customer account.
            </p>
          </div>
          <div className="pt-2 flex flex-col gap-3">
            <Link
              to="/admin/dashboard"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-sm shadow-glow-violet transition-all"
            >
              Go to Admin Dashboard
            </Link>
            <Link
              to="/"
              className="w-full py-2.5 rounded-xl bg-cine-800 hover:bg-cine-700 text-slate-300 hover:text-white text-xs font-semibold transition-all"
            >
              Return to Homepage
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-10">
      <div>
        <h1 className="text-3xl font-black font-display text-white">Group Booking & Split Pay</h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Coordinate cinema outings with friends, share seats, and simulate split contributions
        </p>
      </div>

      {statusMessage && (
        <div className="p-4 rounded-2xl bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs sm:text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Two action tabs: Start Group vs Join by Code */}
      {!activeGroup ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Start New Group */}
          <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-white/10 space-y-5 shadow-xl">
            <div className="flex items-center gap-2.5">
              <Users className="w-5 h-5 text-violet-400" />
              <h2 className="text-lg font-bold font-display text-white">Start a Group Booking</h2>
            </div>

            <form onSubmit={handleCreateGroup} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">Group Outing Title</label>
                <input
                  type="text"
                  value={groupTitle}
                  onChange={(e) => setGroupTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-xs"
                  placeholder="e.g. Leo Release Night"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Select Showtime</label>
                <select
                  value={selectedShowId}
                  onChange={(e) => setSelectedShowId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-xs"
                >
                  {shows.slice(0, 10).map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.movieId?.title} — {s.theatreId?.name} ({s.date} {s.startTime})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">
                  Total Seats Needed ({totalSeats})
                </label>
                <input
                  type="number"
                  min="2"
                  max="10"
                  value={totalSeats}
                  onChange={(e) => setTotalSeats(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-xs"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs shadow-glow-violet transition-all"
              >
                Create Group Session & Invite Friends
              </button>
            </form>
          </div>

          {/* Join with Code */}
          <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-white/10 space-y-5 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2.5">
                <Share2 className="w-5 h-5 text-teal-400" />
                <h2 className="text-lg font-bold font-display text-white">Join Existing Group</h2>
              </div>
              <p className="text-xs text-slate-400 mt-2">
                Have a shareable booking invite code like <em>GRP-A1B2C3</em>? Enter it below to join and pay your split share.
              </p>
            </div>

            <form onSubmit={handleLookupGroup} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">Group Invite Code</label>
                <input
                  type="text"
                  value={joinCodeInput}
                  onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                  placeholder="e.g. GRP-48FA12"
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-xs font-mono font-bold uppercase tracking-wider text-center"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-glow-teal transition-all"
              >
                Find Group Session
              </button>
            </form>
          </div>
        </div>
      ) : (
        /* Active Group Session View */
        <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-white/10 space-y-8 shadow-2xl">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-extrabold px-3 py-1 rounded-full bg-violet-600/30 text-violet-300 border border-violet-500/40">
                  {activeGroup.groupCode}
                </span>
                <span
                  className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                    activeGroup.status === 'confirmed'
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : 'bg-amber-500/20 text-amber-300'
                  }`}
                >
                  {activeGroup.status.toUpperCase()}
                </span>
              </div>
              <h2 className="text-2xl font-black font-display text-white mt-1">
                {activeGroup.title}
              </h2>
              <p className="text-xs text-slate-400">
                {activeGroup.movieId?.title} • {activeGroup.theatreId?.name} • {activeGroup.totalSeatsNeeded} Seats Total
              </p>
            </div>

            <button
              onClick={() => copyCode(activeGroup.groupCode)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cine-800 hover:bg-cine-700 border border-white/10 text-xs font-semibold text-slate-200 transition-colors self-start"
            >
              {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-teal-400" />}
              <span>{copiedCode ? 'Code Copied!' : 'Copy Invite Code'}</span>
            </button>
          </div>

          {/* Members Contribution List */}
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-slate-300 uppercase tracking-wider">
              Participant Status & Split Contributions
            </h3>

            <div className="space-y-3">
              {activeGroup.members?.map((m, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-cine-800/80 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-violet-600 to-teal-400 flex items-center justify-center font-bold text-xs text-white">
                      {m.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">{m.name}</h4>
                      <p className="text-xs text-slate-400">
                        {m.email} • Seats: <span className="font-mono text-violet-300">{m.selectedSeats?.join(', ') || 'Auto'}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 justify-between sm:justify-end">
                    <div className="text-right">
                      <div className="text-xs font-bold text-white">₹{m.shareAmount || 200}</div>
                      <span
                        className={`text-[10px] font-bold uppercase ${
                          m.paymentStatus === 'paid' ? 'text-emerald-400' : 'text-amber-400'
                        }`}
                      >
                        {m.paymentStatus === 'paid' ? 'Paid (Simulated)' : 'Pending'}
                      </span>
                    </div>

                    {m.paymentStatus !== 'paid' && (
                      <button
                        onClick={() => handleSimulatePayShare(m.email)}
                        className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-sm transition-all"
                      >
                        Simulate Pay
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Add Another Friend Form */}
          {activeGroup.members?.length < activeGroup.totalSeatsNeeded && (
            <form onSubmit={handleAddMember} className="p-4 rounded-2xl bg-cine-800/40 border border-white/5 space-y-3">
              <span className="text-xs font-bold text-slate-300">Add Participant Friend to Group</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <input
                  type="text"
                  placeholder="Friend's Name"
                  value={memberJoinName}
                  onChange={(e) => setMemberJoinName(e.target.value)}
                  className="px-3 py-2 rounded-xl glass-input"
                  required
                />
                <input
                  type="email"
                  placeholder="Friend's Email"
                  value={memberJoinEmail}
                  onChange={(e) => setMemberJoinEmail(e.target.value)}
                  className="px-3 py-2 rounded-xl glass-input"
                  required
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold transition-all"
                >
                  Join Member
                </button>
              </div>
            </form>
          )}

          {/* Exit / Reset view */}
          <div className="pt-4 border-t border-white/10 flex justify-between items-center text-xs">
            <button
              onClick={() => setActiveGroup(null)}
              className="text-slate-400 hover:text-white"
            >
              &larr; Switch or Create Different Group
            </button>
            <span className="text-slate-500">All split payments are demonstration simulations.</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupBookingPage;
