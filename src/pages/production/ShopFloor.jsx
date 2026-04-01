import { useState, useEffect } from 'react';import api from '../../services/api';import toast from 'react-hot-toast';import { FiPlay, FiCheckCircle } from 'react-icons/fi';
import { useSelector } from 'react-redux';

const ShopFloor = () => { 
  const { userInfo } = useSelector((state) => state.auth);
  const [data, setData] = useState(null); 
  const [operatorTasks, setOperatorTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const fetch = async () => { 
    try { 
      if (userInfo?.role === 'operator') {
        const { data } = await api.get('/work-orders');
        // Flatten tasks assigned to this operator
        const tasks = [];
        data.forEach(wo => {
           wo.tasks.forEach((t, idx) => {
             if (t.assignedTo === userInfo._id || t.assignedTo?._id === userInfo._id) {
               tasks.push({ woId: wo._id, woNumber: wo.woNumber, productName: wo.productName, taskIndex: idx, ...t });
             }
           });
        });
        setOperatorTasks(tasks);
      } else {
        const { data } = await api.get('/work-orders/dashboard'); 
        setData(data); 
      }
    } catch { toast.error('Failed'); } finally { setLoading(false); } 
  };
  useEffect(() => { fetch(); }, []);

  const handleTaskStatus = async (woId, taskIndex, status) => {
    try {
      await api.put(`/work-orders/${woId}/task-status`, { taskIndex, status });
      toast.success(status === 'in_progress' ? 'Task Started' : 'Task Completed');
      fetch();
    } catch { toast.error('Failed to update task'); }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-emerald-500"></div></div>;

  if (userInfo?.role === 'operator') return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-white">My Work Queue</h1><p className="text-sm text-gray-400">Tablet operative mode</p></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {operatorTasks.length === 0 ? <p className="text-gray-500 col-span-3 text-center py-12">No tasks assigned to you right now.</p> : operatorTasks.map((t, i) => (
          <div key={i} className={`bg-gray-800/50 border rounded-2xl p-5 ${t.status === 'completed' ? 'border-emerald-500/30' : t.status === 'in_progress' ? 'border-amber-500/50' : 'border-gray-700/50'}`}>
            <div className="flex justify-between items-start mb-4">
              <div>
                 <p className="text-emerald-400 font-mono text-xs">{t.woNumber}</p>
                 <h3 className="text-white font-semibold text-lg">{t.taskName}</h3>
                 <p className="text-xs text-gray-400">{t.productName}</p>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${t.status === 'completed' ? 'bg-emerald-900/40 text-emerald-400' : t.status === 'in_progress' ? 'bg-amber-900/40 text-amber-400' : 'bg-gray-700 text-gray-300'}`}>{t.status.replace(/_/g,' ')}</span>
            </div>
            
            <div className="flex gap-3 mt-6">
              {t.status === 'pending' && <button onClick={() => handleTaskStatus(t.woId, t.taskIndex, 'in_progress')} className="flex-1 bg-amber-600 hover:bg-amber-700 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2"><FiPlay /> Start Task</button>}
              {t.status === 'in_progress' && <button onClick={() => handleTaskStatus(t.woId, t.taskIndex, 'completed')} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2"><FiCheckCircle /> Complete Task</button>}
              {t.status === 'completed' && <div className="flex-1 text-center text-emerald-500 font-medium py-3 border border-emerald-900/50 rounded-xl bg-emerald-900/20"><FiCheckCircle className="inline mr-2" /> Done</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
  return (<div className="space-y-6"><div><h1 className="text-2xl font-bold text-white">Shop Floor Dashboard</h1><p className="text-sm text-gray-400">Live production overview</p></div>
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">{[{label:'Total',val:data?.stats?.totalWO||0,color:'text-white'},{label:'Planned',val:data?.stats?.planned||0,color:'text-blue-400'},{label:'In Progress',val:data?.stats?.inProgress||0,color:'text-amber-400'},{label:'Completed',val:data?.stats?.completed||0,color:'text-emerald-400'},{label:'On Hold',val:data?.stats?.onHold||0,color:'text-gray-400'}].map((s,i)=>(<div key={i} className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4 text-center"><p className={`text-2xl font-bold ${s.color}`}>{s.val}</p><p className="text-xs text-gray-400">{s.label}</p></div>))}</div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{(data?.activeWorkOrders||[]).map(wo=>(<div key={wo._id} className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-5"><div className="flex justify-between mb-3"><div><p className="text-emerald-400 font-mono text-xs">{wo.woNumber}</p><h3 className="text-white font-semibold">{wo.productName}</h3></div><span className={`px-2 py-0.5 rounded-full text-xs h-fit ${wo.priority==='urgent'?'bg-red-900/40 text-red-400':wo.priority==='high'?'bg-orange-900/40 text-orange-400':'bg-blue-900/40 text-blue-400'}`}>{wo.priority}</span></div>
      <div className="w-full bg-gray-700 rounded-full h-3 mb-2"><div className="bg-gradient-to-r from-emerald-500 to-teal-400 h-3 rounded-full" style={{width:`${wo.progressPercent}%`}}></div></div>
      <div className="flex justify-between text-xs text-gray-400"><span>{wo.progressPercent}%</span>{wo.plannedEndDate && <span>Due: {new Date(wo.plannedEndDate).toLocaleDateString('en-IN')}</span>}</div></div>))}</div>
    {(!data?.activeWorkOrders?.length) && <p className="text-gray-500 text-center py-8">No active work orders on the floor</p>}</div>);};
export default ShopFloor;
