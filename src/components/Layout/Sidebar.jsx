import { useEffect, useRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  FiPieChart, FiUsers, FiCheckSquare, FiFileText, FiUser, FiX,
  FiCalendar, FiMessageSquare, FiTarget, FiSettings,
  FiPackage, FiTruck, FiShoppingCart, FiClipboard, FiLayers,
  FiTool, FiShield, FiGrid, FiBox, FiArchive, FiDollarSign
} from 'react-icons/fi';

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const location = useLocation();
  const { pathname } = location;
  const sidebar = useRef(null);
  const trigger = useRef(null);
  
  const { userInfo } = useSelector((state) => state.auth);
  const permissions = userInfo?.permissions || [];
  const isAdmin = userInfo?.role === 'super_admin';

  useEffect(() => {
    const clickHandler = ({ target }) => {
      if (!sidebar.current || !trigger.current) return;
      if (!sidebarOpen || sidebar.current.contains(target) || trigger.current.contains(target)) return;
      setSidebarOpen(false);
    };
    document.addEventListener('click', clickHandler);
    return () => document.removeEventListener('click', clickHandler);
  });

  const hasAccess = (module) => isAdmin || permissions.includes(module);

  // Navigation sections
  const sections = [
    {
      title: 'SALES',
      show: hasAccess('enquiry') || hasAccess('sales_offer') || hasAccess('sale_order') || hasAccess('customers'),
      items: [
        { title: 'Enquiries', path: '/enquiries', icon: <FiTarget />, module: 'enquiry' },
        { title: 'Sales Offers', path: '/sales-offers', icon: <FiFileText />, module: 'sales_offer' },
        { title: 'Sale Orders', path: '/sale-orders', icon: <FiClipboard />, module: 'sale_order' },
        { title: 'Customers', path: '/customers', icon: <FiUsers />, module: 'customers' }
      ]
    },
    {
      title: 'DESIGN & BOM',
      show: hasAccess('design') || hasAccess('bom') || hasAccess('items'),
      items: [
        { title: 'Bill of Materials', path: '/bom', icon: <FiLayers />, module: 'bom' },
        { title: 'Item Master', path: '/items', icon: <FiGrid />, module: 'items' },
      ]
    },
    {
      title: 'PROCUREMENT',
      show: hasAccess('procurement') || hasAccess('vendors') || hasAccess('grn'),
      items: [
        { title: 'Purchase Orders', path: '/purchase-orders', icon: <FiShoppingCart />, module: 'procurement' },
        { title: 'Vendors', path: '/vendors', icon: <FiUsers />, module: 'vendors' },
        { title: 'GRN', path: '/grn', icon: <FiArchive />, module: 'grn' },
      ]
    },
    {
      title: 'INVENTORY',
      show: hasAccess('inventory'),
      items: [
        { title: 'Stock Levels', path: '/inventory', icon: <FiBox />, module: 'inventory' },
        { title: 'Warehouses', path: '/warehouses', icon: <FiPackage />, module: 'inventory' },
      ]
    },
    {
      title: 'PRODUCTION',
      show: hasAccess('production') || hasAccess('work_order'),
      items: [
        { title: 'Work Orders', path: '/work-orders', icon: <FiTool />, module: 'work_order' },
        { title: 'Shop Floor', path: '/shop-floor', icon: <FiSettings />, module: 'production' },
      ]
    },
    {
      title: 'QUALITY',
      show: hasAccess('iqc') || hasAccess('oqc'),
      items: [
        { title: 'IQC (Incoming)', path: '/quality/iqc', icon: <FiShield />, module: 'iqc' },
        { title: 'OQC (Outgoing)', path: '/quality/oqc', icon: <FiCheckSquare />, module: 'oqc' },
      ]
    },
    {
      title: 'DESPATCH & SERVICE',
      show: hasAccess('despatch') || hasAccess('service'),
      items: [
        { title: 'Despatch', path: '/despatch', icon: <FiTruck />, module: 'despatch' },
        { title: 'Service', path: '/service', icon: <FiTool />, module: 'service' },
      ]
    },
    {
      title: 'FINANCE',
      show: hasAccess('invoices') || hasAccess('payments'),
      items: [
        { title: 'Invoices', path: '/invoices', icon: <FiDollarSign />, module: 'invoices' },
      ]
    },
    {
      title: 'HR & ADMIN',
      show: hasAccess('employees') || isAdmin,
      items: [
        { title: 'Employees', path: '/employees', icon: <FiUser />, module: 'employees' },
      ]
    }
  ];

  return (
    <aside
      ref={sidebar}
      className={`absolute left-0 top-0 z-40 flex h-screen w-72 flex-col overflow-y-hidden bg-dark-bg text-dark-text duration-300 ease-linear lg:static lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      {/* Header / Logo */}
      <div className="flex items-center justify-between gap-2 px-6 py-5 lg:py-6 border-b border-gray-700/50">
        <NavLink to="/">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-2.5 shadow-lg shadow-emerald-500/20">
              <FiSettings className="text-white text-xl" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-wide">Lexa<span className="text-emerald-400">ERP</span></h1>
              <p className="text-[10px] text-gray-400 tracking-widest uppercase">Manufacturing</p>
            </div>
          </div>
        </NavLink>

        <button
          ref={trigger}
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="block lg:hidden text-gray-400 hover:text-white"
        >
          <FiX className="text-2xl" />
        </button>
      </div>

      {/* Dashboard link */}
      <div className="px-4 pt-4">
        <NavLink
          to="/dashboard"
          onClick={() => setSidebarOpen(false)}
          className={`flex items-center gap-3 rounded-xl px-4 py-3 font-medium duration-200 ${
            pathname === '/dashboard'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
              : 'text-gray-300 hover:bg-gray-800/60'
          }`}
        >
          <FiPieChart className="text-lg" />
          Dashboard
        </NavLink>
      </div>

      {/* Navigation sections */}
      <div className="no-scrollbar flex flex-col overflow-y-auto duration-300 ease-linear px-4 pb-6">
        {sections.filter(s => s.show).map((section, sIdx) => (
          <div key={sIdx} className="mt-5">
            <h3 className="px-4 text-[11px] font-semibold text-gray-500 tracking-widest uppercase mb-2">
              {section.title}
            </h3>
            <ul className="flex flex-col gap-1">
              {section.items.filter(item => hasAccess(item.module)).map((link, index) => (
                <li key={index}>
                  <NavLink
                    to={link.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`group flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium duration-200 ${
                      pathname.startsWith(link.path)
                        ? 'bg-emerald-600/10 text-emerald-400 border-r-2 border-emerald-400'
                        : 'text-gray-400 hover:bg-gray-800/60 hover:text-gray-200'
                    }`}
                  >
                    <span className="text-base">{link.icon}</span>
                    {link.title}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* User info at bottom */}
      <div className="mt-auto border-t border-gray-700/50 px-4 py-4">
        <div className="flex items-center gap-3 px-2">
          <div className="h-9 w-9 rounded-full bg-emerald-600 flex items-center justify-center text-white text-sm font-bold">
            {userInfo?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{userInfo?.name}</p>
            <p className="text-xs text-gray-400 truncate">{userInfo?.roleLabel || userInfo?.role}</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
