import { useState } from 'react';

import RepDemoManagement from "./pages/rep/repDemoManagement";
import { AppProvider, useApp } from '@/store/AppContext';
import { Layout } from '@/components/layout/Layout';

import { Login } from '@/pages/Login';
import { Register } from '@/pages/Register';

import { ProductManagement } from "@/pages/admin/ProductManagement";
import { DoctorDashboard } from '@/pages/doctor/DoctorDashboard';
import { ProductCatalog } from '@/pages/doctor/ProductCatalog';
import { ProductDetails } from '@/pages/doctor/ProductDetails';
import { DemoBooking } from '@/pages/doctor/DemoBooking';
import { DemoSessionPage } from '@/pages/doctor/DemoSessionPage';
import { DemoSessions } from '@/pages/doctor/DemoSessions';
import { SampleManagement } from '@/pages/doctor/SampleManagement';
import { OrderProduct } from '@/pages/doctor/OrderProduct';
import { MyOrders } from '@/pages/doctor/MyOrders';
import { OrganizationPage } from '@/pages/doctor/OrganizationPage';
import { OrderManagement } from '@/pages/rep/OrderManagement';

import { RepDashboard } from '@/pages/rep/RepDashboard';
import { InteractionManagement } from '@/pages/rep/InteractionManagement';

import { AdminDashboard } from '@/pages/admin/AdminDashboard';
import { AdminManagement } from '@/pages/admin/AdminManagement';

import { NotificationsPage } from '@/pages/shared/NotificationsPage';
import { ProfilePage } from '@/pages/shared/ProfilePage';
import { SettingsPage } from '@/pages/shared/SettingsPage';


function Router() {
  const { role, page } = useApp();

  const getDashboard = () => {
    if (role === 'doctor') return <DoctorDashboard />;
    if (role === 'rep') return <RepDashboard />;

    return <AdminDashboard />;
  };

  const pageMap: Record<string, React.ReactNode> = {
    dashboard: getDashboard(),

    products: <ProductCatalog />,
    'product-details': <ProductDetails />,
    'product-management': <ProductManagement />,

    'demo-booking': <DemoBooking />,
    'demo-session': <DemoSessionPage />,
    demos: <DemoSessions />,

    samples: <SampleManagement />,
    'sample-request': <SampleManagement />,

    'order-product': <OrderProduct />,
    orders: <MyOrders />,

    organizations: <OrganizationPage />,

'order-management': <OrderManagement />,

interactions: <InteractionManagement />,
'demo-management': <RepDemoManagement />,

    reps: <AdminManagement />,
    doctors: <AdminManagement />,
    analytics: <AdminDashboard />,

    notifications: <NotificationsPage />,
    profile: <ProfilePage />,
    settings: <SettingsPage />,
  };

  return <>{pageMap[page] || getDashboard()}</>;
}


function AuthenticatedApp() {
  return (
    <AppProvider>
      <Layout>
        <Router />
      </Layout>
    </AppProvider>
  );
}


function App() {
  const [showRegister, setShowRegister] = useState(false);

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('bi_user');

    return savedUser
      ? JSON.parse(savedUser)
      : null;
  });

  const handleLogin = (loggedInUser: unknown) => {
    setUser(loggedInUser);
  };

  const handleRegister = (registeredUser: unknown) => {
    setUser(registeredUser);
  };

  if (!user) {
    if (showRegister) {
      return (
        <Register
          onRegister={handleRegister}
          onLogin={() => setShowRegister(false)}
        />
      );
    }

    return (
      <Login
        onLogin={handleLogin}
        onRegister={() => setShowRegister(true)}
      />
    );
  }

  return <AuthenticatedApp />;
}

export default App;