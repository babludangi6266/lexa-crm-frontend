import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2, FiUser, FiMail, FiPhone, FiSearch } from 'react-icons/fi';
import Modal from '../../components/Modals/Modal';

const ROLE_LABELS = {
  super_admin: 'Super Admin', sales: 'Sales Team', design_engineer: 'Design Engineer',
  supply_chain: 'Supply Chain', store_keeper: 'Store Keeper', production_supervisor: 'Production Supervisor',
  quality_control: 'Quality Control', logistics: 'Logistics', service_engineer: 'Service Engineer',
  operator: 'Operator', employee: 'Employee'
};

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({
    name: '', email: '', password: '', role: 'employee', department: '',
    designation: '', salaryMode: 'monthly', employmentType: 'full-time',
    gender: '', contactNumber: ''
  });

  const fetchEmployees = async () => {
    try {
      const { data } = await api.get('/users');
      setEmployees(data);
    } catch { toast.error('Failed to load employees'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchEmployees(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        const { password, ...updateData } = form;
        await api.put(`/users/${editId}`, password ? form : updateData);
        toast.success('Employee updated');
      } else {
        await api.post('/auth/register', form);
        toast.success('Employee created');
      }
      setShowModal(false);
      setEditId(null);
      fetchEmployees();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const handleEdit = (emp) => {
    setForm({
      name: emp.name, email: emp.email, password: '', role: emp.role,
      department: emp.department || '', designation: emp.designation || '',
      salaryMode: emp.salaryMode || 'monthly', employmentType: emp.employmentType || 'full-time',
      gender: emp.gender || '', contactNumber: emp.contactNumber || ''
    });
    setEditId(emp._id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this employee?')) return;
    try { await api.delete(`/users/${id}`); toast.success('Deleted'); fetchEmployees(); }
    catch { toast.error('Failed'); }
  };

  const filtered = employees.filter(e =>
    !search || e.name?.toLowerCase().includes(search.toLowerCase()) ||
    e.email?.toLowerCase().includes(search.toLowerCase()) ||
    e.department?.toLowerCase().includes(search.toLowerCase())
  );

  const ROLE_COLORS = {
    super_admin: 'bg-red-900/40 text-red-400', sales: 'bg-blue-900/40 text-blue-400',
    design_engineer: 'bg-indigo-900/40 text-indigo-400', supply_chain: 'bg-teal-900/40 text-teal-400',
    production_supervisor: 'bg-amber-900/40 text-amber-400', quality_control: 'bg-purple-900/40 text-purple-400',
    operator: 'bg-cyan-900/40 text-cyan-400', employee: 'bg-gray-700 text-gray-400'
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Employees</h1>
          <p className="text-sm text-gray-400">Manage team members & role assignments</p>
        </div>
        <button onClick={() => { setEditId(null); setForm({ name: '', email: '', password: '', role: 'employee', department: '', designation: '', salaryMode: 'monthly', employmentType: 'full-time', gender: '', contactNumber: '' }); setShowModal(true); }}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-medium transition-colors">
          <FiPlus /> Add Employee
        </button>
      </div>

      <div className="relative">
        <FiSearch className="absolute left-4 top-3 text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, email, department..."
          className="w-full bg-gray-800/50 border border-gray-700/50 rounded-xl pl-10 pr-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? <p className="text-gray-500 col-span-3 text-center py-12">Loading...</p>
          : filtered.length === 0 ? <p className="text-gray-500 col-span-3 text-center py-12">No employees found</p>
          : filtered.map(emp => (
          <div key={emp._id} className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-5 hover:border-gray-600/50 transition-all">
            <div className="flex items-start gap-4 mb-4">
              <div className="h-12 w-12 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                {emp.name?.charAt(0)?.toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-white font-semibold truncate">{emp.name}</h3>
                <p className="text-xs text-gray-400">{emp.designation || emp.department || '—'}</p>
                <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${ROLE_COLORS[emp.role] || ROLE_COLORS.employee}`}>
                  {ROLE_LABELS[emp.role] || emp.role}
                </span>
              </div>
            </div>
            <div className="space-y-1 text-sm text-gray-400">
              <p className="flex items-center gap-2"><FiMail size={13} /> {emp.email}</p>
              {emp.contactNumber && <p className="flex items-center gap-2"><FiPhone size={13} /> {emp.contactNumber}</p>}
              {emp.department && <p className="flex items-center gap-2"><FiUser size={13} /> {emp.department}</p>}
            </div>
            <div className="flex gap-2 mt-4 pt-3 border-t border-gray-700/50 justify-end">
              <button onClick={() => handleEdit(emp)} className="p-1.5 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white"><FiEdit2 size={14} /></button>
              <button onClick={() => handleDelete(emp._id)} className="p-1.5 rounded-lg hover:bg-red-900/40 text-gray-400 hover:text-red-400"><FiTrash2 size={14} /></button>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editId ? 'Edit Employee' : 'Add Employee'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm text-gray-400 mb-1">Full Name *</label>
              <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none" /></div>
            <div><label className="block text-sm text-gray-400 mb-1">Email *</label>
              <input type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none" /></div>
            {!editId && <div><label className="block text-sm text-gray-400 mb-1">Password *</label>
              <input type="password" required={!editId} value={form.password} onChange={e => setForm({...form, password: e.target.value})}
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none" /></div>}
            <div><label className="block text-sm text-gray-400 mb-1">Role *</label>
              <select value={form.role} onChange={e => setForm({...form, role: e.target.value})}
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none">
                {Object.entries(ROLE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select></div>
            <div><label className="block text-sm text-gray-400 mb-1">Department</label>
              <input value={form.department} onChange={e => setForm({...form, department: e.target.value})}
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none" /></div>
            <div><label className="block text-sm text-gray-400 mb-1">Designation</label>
              <input value={form.designation} onChange={e => setForm({...form, designation: e.target.value})}
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none" /></div>
            <div><label className="block text-sm text-gray-400 mb-1">Phone</label>
              <input value={form.contactNumber} onChange={e => setForm({...form, contactNumber: e.target.value})}
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none" /></div>
            <div><label className="block text-sm text-gray-400 mb-1">Gender</label>
              <select value={form.gender} onChange={e => setForm({...form, gender: e.target.value})}
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none">
                <option value="">Select...</option><option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option>
              </select></div>
            <div><label className="block text-sm text-gray-400 mb-1">Employment Type</label>
              <select value={form.employmentType} onChange={e => setForm({...form, employmentType: e.target.value})}
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none">
                <option value="full-time">Full Time</option><option value="part-time">Part Time</option><option value="contract">Contract</option><option value="intern">Intern</option>
              </select></div>
            <div><label className="block text-sm text-gray-400 mb-1">Salary Mode</label>
              <select value={form.salaryMode} onChange={e => setForm({...form, salaryMode: e.target.value})}
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none">
                <option value="monthly">Monthly</option><option value="hourly">Hourly</option><option value="daily">Daily</option>
              </select></div>
          </div>
          <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl font-medium transition-colors">
            {editId ? 'Update' : 'Create'} Employee
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Employees;
