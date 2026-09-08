import React, { useState, useEffect } from 'react';
import { AdminLayout } from './layout/AdminLayout';
import { AdminDashboardView } from './views/AdminDashboardView';
import { AdminOrdersView } from './views/AdminOrdersView';
import { AdminCustomersView } from './views/AdminCustomersView';
import { AdminBookView } from './views/AdminBookView';
import { AdminPaymentsView } from './views/AdminPaymentsView';
import { AdminDeliveryView } from './views/AdminDeliveryView';
import { AdminSettingsView } from './views/AdminSettingsView';
import { Order } from '../../types';

type AdminSection = 'dashboard' | 'orders' | 'customers' | 'book' | 'payments' | 'delivery' | 'settings';

export const AdminRouter: React.FC = () => {
  const getSectionFromPath = (path: string): AdminSection => {
    const cleanPath = path.toLowerCase().replace(/\/$/, '');
    const cleanHash = window.location.hash.toLowerCase().replace(/^#\/?admin\/?/, '').replace(/\/$/, '');
    if (cleanPath === '/admin/orders' || cleanHash === 'orders') return 'orders';
    if (cleanPath === '/admin/customers' || cleanHash === 'customers') return 'customers';
    if (cleanPath === '/admin/book' || cleanHash === 'book') return 'book';
    if (cleanPath === '/admin/payments' || cleanHash === 'payments') return 'payments';
    if (cleanPath === '/admin/delivery' || cleanHash === 'delivery') return 'delivery';
    if (cleanPath === '/admin/settings' || cleanHash === 'settings') return 'settings';
    return 'dashboard';
  };

  const [currentSection, setCurrentSection] = useState<AdminSection>(() => 
    getSectionFromPath(window.location.pathname)
  );

  const [selectedOrderForModal, setSelectedOrderForModal] = useState<Order | null>(null);

  useEffect(() => {
    const handleRouteSync = () => {
      setCurrentSection(getSectionFromPath(window.location.pathname));
    };
    window.addEventListener('popstate', handleRouteSync);
    window.addEventListener('hashchange', handleRouteSync);
    return () => {
      window.removeEventListener('popstate', handleRouteSync);
      window.removeEventListener('hashchange', handleRouteSync);
    };
  }, []);

  const navigateTo = (section: AdminSection) => {
    setCurrentSection(section);
    const targetUrl = section === 'dashboard' ? '/admin' : `/admin/${section}`;
    if (window.location.pathname !== targetUrl) {
      window.history.pushState({}, '', targetUrl);
    }
  };

  const handleSelectOrderFromDashboard = (order: Order) => {
    setSelectedOrderForModal(order);
    navigateTo('orders');
  };

  return (
    <AdminLayout currentSection={currentSection} onNavigate={navigateTo}>
      {currentSection === 'dashboard' && (
        <AdminDashboardView
          onSelectOrder={handleSelectOrderFromDashboard}
          onNavigateToOrders={() => navigateTo('orders')}
          onNavigateToBook={() => navigateTo('book')}
        />
      )}

      {currentSection === 'orders' && (
        <AdminOrdersView
          selectedOrder={selectedOrderForModal}
          onClearSelectedOrder={() => setSelectedOrderForModal(null)}
        />
      )}

      {currentSection === 'customers' && <AdminCustomersView />}

      {currentSection === 'book' && <AdminBookView />}

      {currentSection === 'payments' && <AdminPaymentsView />}

      {currentSection === 'delivery' && <AdminDeliveryView />}

      {currentSection === 'settings' && <AdminSettingsView />}
    </AdminLayout>
  );
};
