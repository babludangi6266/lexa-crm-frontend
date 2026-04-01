import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout/Layout';
import Login from './pages/auth/Login';

// Dashboard
import Dashboard from './pages/dashboard/Dashboard';

// Sales Pipeline
import Enquiries from './pages/sales/Enquiries';
import SalesOffers from './pages/sales/SalesOffers';
import SaleOrders from './pages/sales/SaleOrders';
import SaleOrderDetail from './pages/sales/SaleOrderDetail';

// Design & BOM
import BOMList from './pages/design/BOMList';
import BOMDetail from './pages/design/BOMDetail';
import ItemMaster from './pages/design/ItemMaster';

// Procurement
import PurchaseOrders from './pages/procurement/PurchaseOrders';
import Vendors from './pages/procurement/Vendors';
import GRNList from './pages/procurement/GRNList';

// Inventory
import StockLevels from './pages/inventory/StockLevels';
import Warehouses from './pages/inventory/Warehouses';

// Production
import WorkOrders from './pages/production/WorkOrders';
import WorkOrderDetail from './pages/production/WorkOrderDetail';
import ShopFloor from './pages/production/ShopFloor';

// Quality
import IQCInspections from './pages/quality/IQCInspections';
import OQCInspections from './pages/quality/OQCInspections';

// Despatch & Service
import DespatchList from './pages/despatch/DespatchList';
import ServiceList from './pages/service/ServiceList';

// Finance
import Invoices from './pages/finance/Invoices';
import InvoicePDF from './pages/finance/InvoicePDF';

// HR
import Employees from './pages/hr/Employees';

// Shared / Existing
// (Legacy features such as Chat, Calendar, Reports, Leads have been disabled to focus purely on the 10-step Manufacturing Workflow)

const ProtectedRoute = ({ children }) => {
  const { userInfo } = useSelector((state) => state.auth);
  if (!userInfo) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  const { userInfo } = useSelector((state) => state.auth);

  return (
    <>
      <Toaster position="top-right" />
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          {/* Root Redirect */}
          <Route 
             path="/" 
             element={
               userInfo ? (
                 <Navigate to="/dashboard" replace />
               ) : (
                 <Navigate to="/login" replace />
               )
             } 
          />

          {/* All ERP Routes — protected behind Layout */}
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            {/* Dashboard */}
            <Route path="dashboard" element={<Dashboard />} />

            {/* Sales Pipeline */}
            <Route path="enquiries" element={<Enquiries />} />
            <Route path="sales-offers" element={<SalesOffers />} />
            <Route path="sale-orders" element={<SaleOrders />} />
            <Route path="sale-orders/:id" element={<SaleOrderDetail />} />
            <Route path="customers" element={<Enquiries />} /> {/* Reuses clients for now */}

            {/* Design & BOM */}
            <Route path="bom" element={<BOMList />} />
            <Route path="bom/:id" element={<BOMDetail />} />
            <Route path="items" element={<ItemMaster />} />

            {/* Procurement */}
            <Route path="purchase-orders" element={<PurchaseOrders />} />
            <Route path="vendors" element={<Vendors />} />
            <Route path="grn" element={<GRNList />} />

            {/* Inventory */}
            <Route path="inventory" element={<StockLevels />} />
            <Route path="warehouses" element={<Warehouses />} />

            {/* Production */}
            <Route path="work-orders" element={<WorkOrders />} />
            <Route path="work-orders/:id" element={<WorkOrderDetail />} />
            <Route path="shop-floor" element={<ShopFloor />} />

            {/* Quality */}
            <Route path="quality/iqc" element={<IQCInspections />} />
            <Route path="quality/oqc" element={<OQCInspections />} />

            {/* Despatch & Service */}
            <Route path="despatch" element={<DespatchList />} />
            <Route path="service" element={<ServiceList />} />

            {/* Finance */}
            <Route path="invoices" element={<Invoices />} />
            <Route path="invoices/:id/pdf" element={<InvoicePDF />} />

            {/* HR */}
            <Route path="employees" element={<Employees />} />

            {/* Shared - Disabled */}
          </Route>
        </Routes>
      </Router>
    </>
  );
}

export default App;
