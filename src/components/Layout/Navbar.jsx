import { useDispatch, useSelector } from 'react-redux';
import { FiMenu, FiBell, FiLogOut, FiUser } from 'react-icons/fi';
import { logout } from '../../store/slices/authSlice';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ setSidebarOpen }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 flex w-full justify-between items-center px-4 py-3 md:px-6 border-b border-gray-800/50" style={{ backgroundColor: '#0f1117' }}>
      <div className="flex items-center gap-3">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setSidebarOpen(true);
          }}
          className="block rounded-lg border border-gray-700 p-2 lg:hidden hover:bg-gray-800 transition-colors"
        >
          <FiMenu className="text-xl text-gray-400" />
        </button>
        <div className="hidden sm:block">
          <h1 className="text-lg font-semibold text-white">
            Welcome, {userInfo?.name?.split(' ')[0] || 'User'}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button className="relative p-2 text-gray-400 hover:text-white transition-colors hover:bg-gray-800 rounded-lg">
          <FiBell className="text-lg" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500"></span>
        </button>

        <div className="flex items-center gap-3">
          <div className="hidden text-right lg:block">
            <span className="block text-sm font-medium text-white">
              {userInfo?.name}
            </span>
            <span className="block text-xs text-emerald-400 uppercase">
              {userInfo?.roleLabel || userInfo?.role?.replace(/_/g, ' ')}
            </span>
          </div>
          <div className="h-9 w-9 rounded-full bg-emerald-600 flex items-center justify-center text-white text-sm font-bold">
            {userInfo?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-sm font-medium text-red-400 hover:text-red-300 ml-1 transition-colors bg-red-900/20 hover:bg-red-900/40 px-3 py-1.5 rounded-lg border border-red-800/30"
          >
            <FiLogOut size={14} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
