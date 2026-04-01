import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { FiTrendingUp, FiDollarSign, FiPackage, FiShield, FiTruck, FiUsers, FiAlertTriangle, FiClock, FiCheckCircle, FiActivity } from 'react-icons/fi';

const Dashboard = () => {
  const { userInfo } = useSelector(s => s.auth);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await api.get('/dashboard/admin');
        setStats(data);
      } catch {
        try {
          const { data } = await api.get('/dashboard/employee');
          setStats(data);
        } catch { /* non-critical */ }
      }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-emerald-500"></div>
    </div>
  );

  const kpiCards = [
    { title: 'Total Enquiries', value: stats?.sales?.totalEnquiries || 0, icon: <FiUsers className="text-blue-400" />, color: 'border-blue-600/30', bg: 'bg-blue-600/10' },
    { title: 'Active Orders', value: stats?.sales?.totalSaleOrders || 0, icon: <FiPackage className="text-indigo-400" />, color: 'border-indigo-600/30', bg: 'bg-indigo-600/10' },
    { title: 'Revenue', value: `₹${((stats?.finance?.totalRevenue || 0) / 100000).toFixed(1)}L`, icon: <FiDollarSign className="text-emerald-400" />, color: 'border-emerald-600/30', bg: 'bg-emerald-600/10' },
    { title: 'Pending Payments', value: `₹${((stats?.finance?.pendingPayments || 0) / 100000).toFixed(1)}L`, icon: <FiClock className="text-amber-400" />, color: 'border-amber-600/30', bg: 'bg-amber-600/10' },
    { title: 'WOs In Progress', value: stats?.production?.woInProgress || 0, icon: <FiActivity className="text-purple-400" />, color: 'border-purple-600/30', bg: 'bg-purple-600/10' },
    { title: 'QC Pass Rate', value: `${stats?.quality?.passRate || 0}%`, icon: <FiShield className="text-teal-400" />, color: 'border-teal-600/30', bg: 'bg-teal-600/10' },
    { title: 'Despatches', value: stats?.logistics?.totalDespatches || 0, icon: <FiTruck className="text-cyan-400" />, color: 'border-cyan-600/30', bg: 'bg-cyan-600/10' },
    { title: 'Low Stock Items', value: stats?.inventory?.lowStockCount || 0, icon: <FiAlertTriangle className="text-red-400" />, color: 'border-red-600/30', bg: 'bg-red-600/10' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-sm text-gray-400">Welcome back, {userInfo?.name}! — {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            userInfo?.role === 'super_admin' ? 'bg-red-900/40 text-red-400' : 'bg-emerald-900/40 text-emerald-400'
          }`}>
            {userInfo?.roleLabel || userInfo?.role?.replace(/_/g, ' ')}
          </span>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpiCards.map((kpi, idx) => (
          <div key={idx} className={`bg-gray-800/50 border ${kpi.color} rounded-2xl p-5 hover:bg-gray-800/70 transition-all`}>
            <div className={`w-10 h-10 ${kpi.bg} rounded-xl flex items-center justify-center text-xl mb-3`}>
              {kpi.icon}
            </div>
            <p className="text-2xl font-bold text-white">{kpi.value}</p>
            <p className="text-xs text-gray-400 mt-1">{kpi.title}</p>
          </div>
        ))}
      </div>

      {/* Manufacturing Pipeline */}
      <div className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Manufacturing Pipeline</h3>
        <div className="flex items-center gap-1 overflow-x-auto pb-2">
          {[
            { step: '1', label: 'Enquiry', count: stats?.pipeline?.enquiries || 0, color: 'bg-blue-500' },
            { step: '2', label: 'Offer', count: stats?.pipeline?.offers || 0, color: 'bg-indigo-500' },
            { step: '3', label: 'SO', count: stats?.pipeline?.saleOrders || 0, color: 'bg-violet-500' },
            { step: '4', label: 'Design', count: stats?.pipeline?.boms || 0, color: 'bg-purple-500' },
            { step: '5', label: 'Procure', count: stats?.pipeline?.pos || 0, color: 'bg-pink-500' },
            { step: '6', label: 'GRN/IQC', count: stats?.pipeline?.grns || 0, color: 'bg-rose-500' },
            { step: '7', label: 'Production', count: stats?.pipeline?.workOrders || 0, color: 'bg-amber-500' },
            { step: '8', label: 'OQC', count: stats?.pipeline?.oqc || 0, color: 'bg-teal-500' },
            { step: '9', label: 'Despatch', count: stats?.pipeline?.despatches || 0, color: 'bg-cyan-500' },
            { step: '10', label: 'Service', count: stats?.pipeline?.services || 0, color: 'bg-emerald-500' },
          ].map((item, i) => (
            <div key={i} className="flex items-center">
              <div className="flex flex-col items-center min-w-[70px]">
                <div className={`w-10 h-10 ${item.color} rounded-full flex items-center justify-center text-white text-sm font-bold mb-1`}>
                  {item.count}
                </div>
                <p className="text-[10px] text-gray-400 whitespace-nowrap">{item.step}. {item.label}</p>
              </div>
              {i < 9 && <div className="w-4 h-0.5 bg-gray-700 mx-0.5 mt-[-12px]"></div>}
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Recent Activity */}
        <div className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-6 md:col-span-2">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {(stats?.recentActivity || []).length > 0 ? stats.recentActivity.map((a, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 bg-gray-900/40 rounded-xl">
                <FiCheckCircle className="text-emerald-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{a.description}</p>
                  <p className="text-xs text-gray-400">{a.time}</p>
                </div>
              </div>
            )) : (
              <p className="text-gray-500 text-center py-8">No recent activity</p>
            )}
          </div>
        </div>

        {/* Production Health */}
        <div className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Production Health</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">WO Completion</span>
                <span className="text-white font-medium">{stats?.production?.completionRate || 0}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2.5">
                <div className="bg-emerald-500 h-2.5 rounded-full" style={{ width: `${stats?.production?.completionRate || 0}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">QC Pass Rate</span>
                <span className="text-white font-medium">{stats?.quality?.passRate || 0}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2.5">
                <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: `${stats?.quality?.passRate || 0}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">On-Time Delivery</span>
                <span className="text-white font-medium">{stats?.logistics?.onTimeRate || 0}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2.5">
                <div className="bg-purple-500 h-2.5 rounded-full" style={{ width: `${stats?.logistics?.onTimeRate || 0}%` }}></div>
              </div>
            </div>
            <div className="pt-2 border-t border-gray-700/50">
              <p className="text-xs text-gray-400">Total Employees</p>
              <p className="text-xl font-bold text-white">{stats?.hr?.totalEmployees || 0}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
