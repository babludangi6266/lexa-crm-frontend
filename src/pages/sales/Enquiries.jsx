import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2, FiPhone, FiMail, FiMapPin, FiEye } from 'react-icons/fi';
import Modal from '../../components/Modals/Modal';

const STATUS_COLORS = {
  new_lead: 'bg-blue-900/40 text-blue-400',
  contacted: 'bg-cyan-900/40 text-cyan-400',
  requirement_gathered: 'bg-indigo-900/40 text-indigo-400',
  quote_sent: 'bg-amber-900/40 text-amber-400',
  converted: 'bg-emerald-900/40 text-emerald-400',
  lost: 'bg-red-900/40 text-red-400',
  on_hold: 'bg-gray-700/40 text-gray-400',
};

const Enquiries = () => {
  const [enquiries, setEnquiries] = useState([]);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [filter, setFilter] = useState('');
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    customerName: '', company: '', email: '', phone: '', source: 'phone',
    subject: '', description: '', requirements: '', status: 'new_lead', priority: 'medium', expectedValue: '', assignedTo: ''
  });

  const fetchData = async () => {
    try {
      const params = filter ? { status: filter } : {};
      const [enqRes, usersRes] = await Promise.all([
        api.get('/enquiries', { params }),
        api.get('/users')
      ]);
      setEnquiries(enqRes.data);
      setUsers(usersRes.data.filter(u => u.role === 'sales' || u.role === 'super_admin' || u.department === 'Sales'));
    } catch (err) { toast.error('Failed to load enquiries data'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [filter]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form };
      if (!payload.assignedTo) delete payload.assignedTo;
      
      if (editId) {
        await api.put(`/enquiries/${editId}`, payload);
        toast.success('Enquiry updated');
      } else {
        await api.post('/enquiries', payload);
        toast.success('Enquiry created');
      }
      setShowModal(false);
      setEditId(null);
      setForm({ customerName: '', company: '', email: '', phone: '', source: 'phone', subject: '', description: '', requirements: '', status: 'new_lead', priority: 'medium', expectedValue: '', assignedTo: '' });
      fetchData();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const handleEdit = (enq) => {
    setForm({ customerName: enq.customerName, company: enq.company, email: enq.email || '', phone: enq.phone || '', source: enq.source, subject: enq.subject, description: enq.description || '', requirements: enq.requirements || '', status: enq.status, priority: enq.priority, expectedValue: enq.expectedValue || '', assignedTo: enq.assignedTo?._id || '' });
    setEditId(enq._id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this enquiry?')) return;
    try { await api.delete(`/enquiries/${id}`); toast.success('Deleted'); fetchData(); }
    catch (err) { toast.error('Delete failed'); }
  };

  const handleConvert = async (enq) => {
    try {
      const offerData = {
        enquiry: enq._id, customerName: enq.customerName, company: enq.company,
        subject: enq.subject, description: enq.description, client: enq.client,
        materialCost: [], labourHours: 0, labourRate: 0, totalCost: 0, subtotal: 0, totalAmount: 0
      };
      await api.post('/sales-offers', offerData);
      toast.success('Converted to Sales Offer');
      navigate('/sales-offers');
    } catch (err) { toast.error('Conversion failed'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Enquiries</h1>
          <p className="text-sm text-gray-400">Step 1: Customer requests & leads</p>
        </div>
        <button onClick={() => { setEditId(null); setForm({ customerName: '', company: '', email: '', phone: '', source: 'phone', subject: '', description: '', requirements: '', status: 'new_lead', priority: 'medium', expectedValue: '', assignedTo: '' }); setShowModal(true); }} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-medium transition-colors">
          <FiPlus /> New Enquiry
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {['', 'new_lead', 'contacted', 'requirement_gathered', 'quote_sent', 'converted', 'lost'].map(s => (
          <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === s ? 'bg-emerald-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
            {s ? s.replace(/_/g, ' ') : 'All'}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-gray-800/50 border border-gray-700/50 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700/50">
                <th className="text-left px-6 py-4 text-gray-400 font-medium">Enquiry #</th>
                <th className="text-left px-6 py-4 text-gray-400 font-medium">Customer</th>
                <th className="text-left px-6 py-4 text-gray-400 font-medium">Subject</th>
                <th className="text-left px-6 py-4 text-gray-400 font-medium">Status</th>
                <th className="text-left px-6 py-4 text-gray-400 font-medium">Assigned To</th>
                <th className="text-left px-6 py-4 text-gray-400 font-medium">Priority</th>
                <th className="text-left px-6 py-4 text-gray-400 font-medium">Expected Value</th>
                <th className="text-left px-6 py-4 text-gray-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" className="px-6 py-12 text-center text-gray-500">Loading...</td></tr>
              ) : enquiries.length === 0 ? (
                <tr><td colSpan="7" className="px-6 py-12 text-center text-gray-500">No enquiries found</td></tr>
              ) : enquiries.map(enq => (
                <tr key={enq._id} className="border-b border-gray-700/30 hover:bg-gray-800/60 transition-colors">
                  <td className="px-6 py-4 text-emerald-400 font-mono text-xs">{enq.enquiryNumber}</td>
                  <td className="px-6 py-4">
                    <p className="text-white font-medium">{enq.customerName}</p>
                    <p className="text-xs text-gray-400">{enq.company}</p>
                  </td>
                  <td className="px-6 py-4 text-gray-300">{enq.subject}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[enq.status] || 'bg-gray-700 text-gray-400'}`}>
                      {enq.status?.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-300">
                    {enq.assignedTo ? (
                      <div className="flex items-center gap-2">
                         <div className="w-5 h-5 rounded-full bg-emerald-900/40 text-emerald-400 flex items-center justify-center text-[10px] font-bold">
                           {enq.assignedTo.name?.charAt(0)}
                         </div>
                         <span className="text-sm">{enq.assignedTo.name}</span>
                      </div>
                    ) : <span className="text-gray-500 italic text-xs">Unassigned</span>}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-medium ${enq.priority === 'urgent' ? 'text-red-400' : enq.priority === 'high' ? 'text-orange-400' : enq.priority === 'medium' ? 'text-blue-400' : 'text-gray-400'}`}>
                      {enq.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-300">
                    {enq.expectedValue ? `₹${Number(enq.expectedValue).toLocaleString('en-IN')}` : '—'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleEdit(enq)} className="p-1.5 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"><FiEdit2 size={14} /></button>
                      <button onClick={() => handleDelete(enq._id)} className="p-1.5 rounded-lg hover:bg-red-900/40 text-gray-400 hover:text-red-400 transition-colors"><FiTrash2 size={14} /></button>
                      {enq.status !== 'converted' && enq.status !== 'lost' && (
                        <button onClick={() => handleConvert(enq)} className="px-2 py-1 bg-blue-600/20 text-blue-400 rounded-lg text-xs hover:bg-blue-600/30 transition-colors">
                          → Quote
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editId ? 'Edit Enquiry' : 'New Enquiry'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="block text-sm text-gray-400 mb-1">Customer Name *</label><input type="text" required value={form.customerName} onChange={e => setForm({...form, customerName: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none" /></div>
            <div><label className="block text-sm text-gray-400 mb-1">Company *</label><input type="text" required value={form.company} onChange={e => setForm({...form, company: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none" /></div>
            <div><label className="block text-sm text-gray-400 mb-1">Email</label><input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none" /></div>
            <div><label className="block text-sm text-gray-400 mb-1">Phone</label><input type="text" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none" /></div>
            <div><label className="block text-sm text-gray-400 mb-1">Source</label><select value={form.source} onChange={e => setForm({...form, source: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none">{['walk_in','phone','email','website','referral','exhibition','other'].map(s => <option key={s} value={s}>{s.replace(/_/g,' ')}</option>)}</select></div>
            <div><label className="block text-sm text-gray-400 mb-1">Priority</label><select value={form.priority} onChange={e => setForm({...form, priority: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none">{['low','medium','high','urgent'].map(p => <option key={p} value={p}>{p}</option>)}</select></div>
          </div>
          <div><label className="block text-sm text-gray-400 mb-1">Subject *</label><input type="text" required value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none" /></div>
          <div><label className="block text-sm text-gray-400 mb-1">Requirements / Specifications</label><textarea rows="3" value={form.requirements} onChange={e => setForm({...form, requirements: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none"></textarea></div>
          <div><label className="block text-sm text-gray-400 mb-1">Expected Value (₹)</label><input type="number" value={form.expectedValue} onChange={e => setForm({...form, expectedValue: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none" /></div>
          
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm text-gray-400 mb-1">Assign To (Sales Exec)</label><select value={form.assignedTo} onChange={e => setForm({...form, assignedTo: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none"><option value="">-- Unassigned --</option>{users.map(u => <option key={u._id} value={u._id}>{u.name} ({u.roleLabel || u.role})</option>)}</select></div>
            {editId && <div><label className="block text-sm text-gray-400 mb-1">Status</label><select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none">{['new_lead','contacted','requirement_gathered','quote_sent','converted','lost','on_hold'].map(s => <option key={s} value={s}>{s.replace(/_/g,' ')}</option>)}</select></div>}
          </div>
          
          <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl font-medium transition-colors">{editId ? 'Update' : 'Create'} Enquiry</button>
        </form>
      </Modal>
    </div>
  );
};

export default Enquiries;
