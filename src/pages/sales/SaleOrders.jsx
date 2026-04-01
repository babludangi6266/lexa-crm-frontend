import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { FiPlus, FiEye, FiEdit2, FiTrash2 } from 'react-icons/fi';

const STATUS_COLORS = { confirmed: 'bg-blue-900/40 text-blue-400', design_pending: 'bg-amber-900/40 text-amber-400', in_design: 'bg-indigo-900/40 text-indigo-400', bom_ready: 'bg-cyan-900/40 text-cyan-400', procurement_pending: 'bg-orange-900/40 text-orange-400', in_production: 'bg-purple-900/40 text-purple-400', quality_check: 'bg-yellow-900/40 text-yellow-400', ready_for_despatch: 'bg-teal-900/40 text-teal-400', despatched: 'bg-emerald-900/40 text-emerald-400', delivered: 'bg-green-900/40 text-green-400', completed: 'bg-emerald-900/40 text-emerald-400', cancelled: 'bg-red-900/40 text-red-400' };

const SaleOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const navigate = useNavigate();

  const fetchOrders = async () => {
    try {
      const params = filter ? { status: filter } : {};
      const { data } = await api.get('/sale-orders', { params });
      setOrders(data);
    } catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchOrders(); }, [filter]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this sale order?')) return;
    try { await api.delete(`/sale-orders/${id}`); toast.success('Deleted'); fetchOrders(); }
    catch { toast.error('Failed'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div><h1 className="text-2xl font-bold text-white">Sale Orders</h1><p className="text-sm text-gray-400">Step 3: Confirmed orders — The Green Light</p></div>
      </div>

      <div className="flex flex-wrap gap-2">
        {['', 'confirmed', 'in_design', 'bom_ready', 'in_production', 'quality_check', 'ready_for_despatch', 'despatched', 'completed'].map(s => (
          <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === s ? 'bg-emerald-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
            {s ? s.replace(/_/g,' ') : 'All'}
          </button>
        ))}
      </div>

      <div className="bg-gray-800/50 border border-gray-700/50 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-700/50">
              <th className="text-left px-6 py-4 text-gray-400 font-medium">SO #</th>
              <th className="text-left px-6 py-4 text-gray-400 font-medium">Client</th>
              <th className="text-left px-6 py-4 text-gray-400 font-medium">Subject</th>
              <th className="text-left px-6 py-4 text-gray-400 font-medium">Amount</th>
              <th className="text-left px-6 py-4 text-gray-400 font-medium">Status</th>
              <th className="text-left px-6 py-4 text-gray-400 font-medium">Date</th>
              <th className="text-left px-6 py-4 text-gray-400 font-medium">Actions</th>
            </tr></thead>
            <tbody>
              {loading ? <tr><td colSpan="7" className="px-6 py-12 text-center text-gray-500">Loading...</td></tr>
              : orders.length === 0 ? <tr><td colSpan="7" className="px-6 py-12 text-center text-gray-500">No sale orders</td></tr>
              : orders.map(o => (
                <tr key={o._id} className="border-b border-gray-700/30 hover:bg-gray-800/60">
                  <td className="px-6 py-4 text-emerald-400 font-mono text-xs">{o.soNumber}</td>
                  <td className="px-6 py-4"><p className="text-white">{o.client?.name || '—'}</p><p className="text-xs text-gray-400">{o.client?.company}</p></td>
                  <td className="px-6 py-4 text-gray-300 max-w-[200px] truncate">{o.subject}</td>
                  <td className="px-6 py-4 text-white font-semibold">₹{(o.totalAmount || 0).toLocaleString('en-IN')}</td>
                  <td className="px-6 py-4"><span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[o.status] || 'bg-gray-700 text-gray-400'}`}>{o.status?.replace(/_/g,' ')}</span></td>
                  <td className="px-6 py-4 text-gray-400 text-xs">{new Date(o.createdAt).toLocaleDateString('en-IN')}</td>
                  <td className="px-6 py-4 flex items-center gap-2">
                    <button onClick={() => navigate(`/sale-orders/${o._id}`)} className="p-1.5 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white"><FiEye size={14} /></button>
                    <button onClick={() => handleDelete(o._id)} className="p-1.5 rounded-lg hover:bg-red-900/40 text-gray-400 hover:text-red-400"><FiTrash2 size={14} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SaleOrders;
