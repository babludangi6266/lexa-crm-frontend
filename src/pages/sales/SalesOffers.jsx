import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2, FiCheck, FiSend } from 'react-icons/fi';
import Modal from '../../components/Modals/Modal';

const SalesOffers = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ customerName: '', company: '', subject: '', description: '', materialCost: [], labourHours: 0, labourRate: 0, overheadCost: 0, profitMarginPercent: 20, taxPercent: 18, validityDays: 30, deliveryDays: '', paymentTerms: '50% Advance, 50% Before Despatch', warrantyTerms: '1 Year from date of installation' });

  const fetchData = async () => {
    try { 
      const [offerRes, itemRes] = await Promise.all([
        api.get('/sales-offers'),
        api.get('/items')
      ]);
      setOffers(offerRes.data);
      setItems(itemRes.data.filter(i => i.type === 'raw_material' || i.type === 'sub_assembly' || i.type === 'finished_goods'));
    }
    catch { toast.error('Failed to load data'); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetchData(); }, []);

  const addMaterial = () => setForm({ ...form, materialCost: [...form.materialCost, { item: '', quantity: 1, unitPrice: 0, totalCost: 0 }] });
  const updateMaterial = (idx, field, val) => {
    const mat = [...form.materialCost];
    mat[idx][field] = val;
    if (field === 'item') {
      const selected = items.find(i => i._id === val);
      if (selected) mat[idx].unitPrice = selected.standardCost || 0;
    }
    if (field === 'quantity' || field === 'unitPrice' || field === 'item') {
      mat[idx].totalCost = Number(mat[idx].quantity) * Number(mat[idx].unitPrice);
    }
    setForm({ ...form, materialCost: mat });
  };
  const removeMaterial = (idx) => {
    const mat = [...form.materialCost];
    mat.splice(idx, 1);
    setForm({ ...form, materialCost: mat });
  };

  const calculateTotals = (f) => {
    const matCost = (f.materialCost || []).reduce((s, m) => s + (m.totalCost || 0), 0);
    const labCost = (f.labourHours || 0) * (f.labourRate || 0);
    const totalCost = matCost + labCost + (f.overheadCost || 0);
    const profit = totalCost * ((f.profitMarginPercent || 0) / 100);
    const subtotal = totalCost + profit;
    const tax = subtotal * ((f.taxPercent || 18) / 100);
    return { ...f, labourCost: labCost, totalCost, profitAmount: profit, subtotal, taxAmount: tax, totalAmount: subtotal + tax };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = calculateTotals(form);
      if (editId) { await api.put(`/sales-offers/${editId}`, data); toast.success('Updated'); }
      else { await api.post('/sales-offers', data); toast.success('Created'); }
      setShowModal(false); setEditId(null); fetchData();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const handleApprove = async (id) => {
    try { await api.put(`/sales-offers/${id}/approve`); toast.success('Approved'); fetchData(); }
    catch { toast.error('Failed'); }
  };

  const handleConvertToSO = async (offer) => {
    try {
      const soData = {
        salesOffer: offer._id, enquiry: offer.enquiry, client: offer.client,
        subject: offer.subject, description: offer.description,
        items: [{ description: offer.subject, quantity: 1, unit: 'nos', unitPrice: offer.totalAmount, taxPercent: offer.taxPercent, totalPrice: offer.totalAmount }],
        subtotal: offer.subtotal, taxAmount: offer.taxAmount, totalAmount: offer.totalAmount,
        paymentTerms: offer.paymentTerms, warrantyTerms: offer.warrantyTerms
      };
      await api.post('/sale-orders', soData);
      toast.success('Converted to Sale Order!');
      fetchData();
    } catch (err) { toast.error('Conversion failed'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete?')) return;
    try { await api.delete(`/sales-offers/${id}`); toast.success('Deleted'); fetchData(); }
    catch { toast.error('Failed'); }
  };

  const STATUS_COLORS = { draft: 'bg-gray-700 text-gray-300', pending_approval: 'bg-amber-900/40 text-amber-400', approved: 'bg-emerald-900/40 text-emerald-400', sent: 'bg-blue-900/40 text-blue-400', accepted: 'bg-green-900/40 text-green-400', rejected: 'bg-red-900/40 text-red-400', revised: 'bg-indigo-900/40 text-indigo-400', expired: 'bg-gray-700 text-gray-500' };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div><h1 className="text-2xl font-bold text-white">Sales Offers / Quotations</h1><p className="text-sm text-gray-400">Step 2: Costing & quoting</p></div>
        <button onClick={() => { setEditId(null); setForm({ customerName: '', company: '', subject: '', description: '', materialCost: [], labourHours: 0, labourRate: 0, overheadCost: 0, profitMarginPercent: 20, taxPercent: 18, validityDays: 30, deliveryDays: '', paymentTerms: '50% Advance, 50% Before Despatch', warrantyTerms: '1 Year from date of installation' }); setShowModal(true); }} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-medium transition-colors"><FiPlus /> New Offer</button>
      </div>

      <div className="bg-gray-800/50 border border-gray-700/50 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-700/50">
              <th className="text-left px-6 py-4 text-gray-400 font-medium">Offer #</th>
              <th className="text-left px-6 py-4 text-gray-400 font-medium">Customer</th>
              <th className="text-left px-6 py-4 text-gray-400 font-medium">Subject</th>
              <th className="text-left px-6 py-4 text-gray-400 font-medium">Amount</th>
              <th className="text-left px-6 py-4 text-gray-400 font-medium">Status</th>
              <th className="text-left px-6 py-4 text-gray-400 font-medium">Actions</th>
            </tr></thead>
            <tbody>
              {loading ? <tr><td colSpan="6" className="px-6 py-12 text-center text-gray-500">Loading...</td></tr>
              : offers.length === 0 ? <tr><td colSpan="6" className="px-6 py-12 text-center text-gray-500">No offers yet</td></tr>
              : offers.map(o => (
                <tr key={o._id} className="border-b border-gray-700/30 hover:bg-gray-800/60">
                  <td className="px-6 py-4 text-emerald-400 font-mono text-xs">{o.offerNumber}</td>
                  <td className="px-6 py-4"><p className="text-white font-medium">{o.customerName}</p><p className="text-xs text-gray-400">{o.company}</p></td>
                  <td className="px-6 py-4 text-gray-300">{o.subject}</td>
                  <td className="px-6 py-4 text-white font-semibold">₹{(o.totalAmount || 0).toLocaleString('en-IN')}</td>
                  <td className="px-6 py-4"><span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[o.status]}`}>{o.status?.replace(/_/g,' ')}</span></td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => { setForm({...o, materialCost: o.materialCost || []}); setEditId(o._id); setShowModal(true); }} className="p-1.5 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white"><FiEdit2 size={14} /></button>
                      {o.status === 'draft' && <button onClick={() => handleApprove(o._id)} className="p-1.5 rounded-lg hover:bg-emerald-900/40 text-gray-400 hover:text-emerald-400" title="Approve"><FiCheck size={14} /></button>}
                      {o.status === 'approved' && <button onClick={() => handleConvertToSO(o)} className="px-2 py-1 bg-blue-600/20 text-blue-400 rounded-lg text-xs hover:bg-blue-600/30">→ Sale Order</button>}
                      <button onClick={() => handleDelete(o._id)} className="p-1.5 rounded-lg hover:bg-red-900/40 text-gray-400 hover:text-red-400"><FiTrash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editId ? 'Edit Sales Offer' : 'New Sales Offer'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="block text-sm text-gray-400 mb-1">Customer *</label><input required value={form.customerName} onChange={e=>setForm({...form,customerName:e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none" /></div>
            <div><label className="block text-sm text-gray-400 mb-1">Company</label><input value={form.company} onChange={e=>setForm({...form,company:e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none" /></div>
          </div>
          <div><label className="block text-sm text-gray-400 mb-1">Subject *</label><input required value={form.subject} onChange={e=>setForm({...form,subject:e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none" /></div>
          
          <div className="bg-gray-800/50 p-4 border border-gray-700/50 rounded-xl">
            <label className="block text-sm font-medium text-gray-300 mb-3">Costing Materials</label>
            {form.materialCost.map((m, idx) => (
              <div key={idx} className="flex gap-2 mb-2 items-center">
                <select value={m.item._id || m.item} onChange={e => updateMaterial(idx, 'item', e.target.value)} className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none">
                  <option value="">Select Item...</option>
                  {items.map(i => <option key={i._id} value={i._id}>{i.itemCode} - {i.name}</option>)}
                </select>
                <input type="number" min="1" value={m.quantity} onChange={e => updateMaterial(idx, 'quantity', e.target.value)} placeholder="Qty" className="w-16 bg-gray-900 border border-gray-700 rounded-lg px-2 py-2 text-white text-sm focus:outline-none" />
                <input type="number" value={m.unitPrice} onChange={e => updateMaterial(idx, 'unitPrice', e.target.value)} placeholder="Price" className="w-24 bg-gray-900 border border-gray-700 rounded-lg px-2 py-2 text-white text-sm focus:outline-none" />
                <div className="w-24 text-right text-sm text-emerald-400 font-mono">₹{m.totalCost || 0}</div>
                <button type="button" onClick={() => removeMaterial(idx)} className="text-red-400 px-2 py-2 hover:bg-red-900/40 rounded-lg"><FiTrash2 size={14}/></button>
              </div>
            ))}
            <button type="button" onClick={addMaterial} className="text-emerald-400 text-sm mt-2 px-1"><FiPlus className="inline mr-1" size={12}/>Add Material</button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div><label className="block text-sm text-gray-400 mb-1">Labour Hours</label><input type="number" value={form.labourHours} onChange={e=>setForm({...form,labourHours:Number(e.target.value)})} className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none" /></div>
            <div><label className="block text-sm text-gray-400 mb-1">Labour Rate (₹/hr)</label><input type="number" value={form.labourRate} onChange={e=>setForm({...form,labourRate:Number(e.target.value)})} className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none" /></div>
            <div><label className="block text-sm text-gray-400 mb-1">Overhead Cost (₹)</label><input type="number" value={form.overheadCost} onChange={e=>setForm({...form,overheadCost:Number(e.target.value)})} className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none" /></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div><label className="block text-sm text-gray-400 mb-1">Profit Margin %</label><input type="number" value={form.profitMarginPercent} onChange={e=>setForm({...form,profitMarginPercent:Number(e.target.value)})} className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none" /></div>
            <div><label className="block text-sm text-gray-400 mb-1">Tax %</label><input type="number" value={form.taxPercent} onChange={e=>setForm({...form,taxPercent:Number(e.target.value)})} className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none" /></div>
            <div><label className="block text-sm text-gray-400 mb-1">Delivery Days</label><input type="number" value={form.deliveryDays} onChange={e=>setForm({...form,deliveryDays:e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none" /></div>
          </div>
          <div><label className="block text-sm text-gray-400 mb-1">Payment Terms</label><input value={form.paymentTerms} onChange={e=>setForm({...form,paymentTerms:e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none" /></div>
          <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl font-medium transition-colors">{editId ? 'Update' : 'Create'} Offer</button>
        </form>
      </Modal>
    </div>
  );
};

export default SalesOffers;
