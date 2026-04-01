import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiCheckCircle, FiClock, FiPackage, FiTruck } from 'react-icons/fi';

const STEPS = ['confirmed', 'in_design', 'bom_ready', 'in_production', 'quality_check', 'ready_for_despatch', 'despatched', 'delivered', 'completed'];
const STEP_LABELS = { confirmed: 'Confirmed', in_design: 'Design', bom_ready: 'BOM Ready', in_production: 'Production', quality_check: 'QC Check', ready_for_despatch: 'Ready', despatched: 'Despatched', delivered: 'Delivered', completed: 'Completed' };

const SaleOrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try { const { data } = await api.get(`/sale-orders/${id}`); setOrder(data); }
      catch { toast.error('Failed to load'); }
      finally { setLoading(false); }
    };
    fetch();
  }, [id]);

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-emerald-500"></div></div>;
  if (!order) return <p className="text-gray-400 text-center py-20">Sale Order not found</p>;

  const currentStep = STEPS.indexOf(order.status);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/sale-orders')} className="p-2 rounded-lg hover:bg-gray-800 text-gray-400"><FiArrowLeft /></button>
        <div>
          <h1 className="text-2xl font-bold text-white">{order.soNumber}</h1>
          <p className="text-sm text-gray-400">{order.subject}</p>
        </div>
      </div>

      {/* Progress Pipeline */}
      <div className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-6">
        <h3 className="text-sm font-medium text-gray-400 mb-4">Order Pipeline</h3>
        <div className="flex items-center gap-1 overflow-x-auto pb-2">
          {STEPS.map((step, i) => (
            <div key={step} className="flex items-center">
              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap ${
                i < currentStep ? 'bg-emerald-600/20 text-emerald-400' : i === currentStep ? 'bg-emerald-600 text-white' : 'bg-gray-700/50 text-gray-500'
              }`}>
                {i < currentStep ? <FiCheckCircle size={14} /> : <FiClock size={14} />}
                {STEP_LABELS[step]}
              </div>
              {i < STEPS.length - 1 && <div className={`w-6 h-0.5 ${i < currentStep ? 'bg-emerald-500' : 'bg-gray-700'}`}></div>}
            </div>
          ))}
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Order Details</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-gray-400">Client</span><span className="text-white">{order.client?.name} ({order.client?.company})</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Total Amount</span><span className="text-emerald-400 font-bold text-lg">₹{(order.totalAmount || 0).toLocaleString('en-IN')}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Advance Received</span><span className="text-white">₹{(order.advanceReceived || 0).toLocaleString('en-IN')}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Order Date</span><span className="text-white">{new Date(order.orderDate || order.createdAt).toLocaleDateString('en-IN')}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Expected Delivery</span><span className="text-white">{order.expectedDeliveryDate ? new Date(order.expectedDeliveryDate).toLocaleDateString('en-IN') : '—'}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Payment Terms</span><span className="text-white">{order.paymentTerms || '—'}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Warranty</span><span className="text-white">{order.warrantyTerms || '—'}</span></div>
          </div>
        </div>

        <div className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Linked Documents</h3>
          <div className="space-y-3">
            {order.linkedBOM && (
              <div className="flex items-center justify-between p-3 bg-gray-900/40 rounded-xl">
                <div className="flex items-center gap-3"><FiPackage className="text-indigo-400" /><div><p className="text-white text-sm">BOM</p><p className="text-xs text-gray-400">{order.linkedBOM.bomNumber}</p></div></div>
                <span className={`px-2 py-0.5 rounded-full text-xs ${order.linkedBOM.status === 'approved' ? 'bg-emerald-900/40 text-emerald-400' : 'bg-amber-900/40 text-amber-400'}`}>{order.linkedBOM.status}</span>
              </div>
            )}
            {order.linkedWorkOrders?.map(wo => (
              <div key={wo._id} className="flex items-center justify-between p-3 bg-gray-900/40 rounded-xl cursor-pointer hover:bg-gray-900/60" onClick={() => navigate(`/work-orders/${wo._id}`)}>
                <div className="flex items-center gap-3"><FiPackage className="text-blue-400" /><div><p className="text-white text-sm">Work Order</p><p className="text-xs text-gray-400">{wo.woNumber}</p></div></div>
                <div className="text-right"><p className="text-xs text-emerald-400">{wo.progressPercent}%</p><span className="text-xs text-gray-400">{wo.status?.replace(/_/g,' ')}</span></div>
              </div>
            ))}
            {order.linkedDespatch && (
              <div className="flex items-center justify-between p-3 bg-gray-900/40 rounded-xl">
                <div className="flex items-center gap-3"><FiTruck className="text-teal-400" /><div><p className="text-white text-sm">Despatch</p><p className="text-xs text-gray-400">{order.linkedDespatch.despatchNumber}</p></div></div>
                <span className="text-xs text-gray-400">{order.linkedDespatch.status}</span>
              </div>
            )}
            {!order.linkedBOM && !order.linkedWorkOrders?.length && !order.linkedDespatch && (
              <p className="text-gray-500 text-sm text-center py-4">No linked documents yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SaleOrderDetail;
