import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ref, onValue } from 'firebase/database';
import { database } from '../config/firebase';
import StatCard from '../components/common/StatCard';
import Card from '../components/common/Card';
import { Truck, Users, FileText, DollarSign, Activity, Clock } from 'lucide-react';
import { format } from 'date-fns';

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalVehicles: 0,
    availableVehicles: 0,
    activeRentals: 0,
    pendingPayments: 0,
    revenueToday: 0,
    totalCustomers: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch vehicles
    const vehiclesRef = ref(database, 'vehicles');
    const unsubVehicles = onValue(vehiclesRef, (snapshot) => {
      if (snapshot.exists()) {
        const vehiclesData = snapshot.val();
        const vehiclesArray = Object.values(vehiclesData);
        const available = vehiclesArray.filter(v => v.status === 'Available').length;
        
        setStats(prev => ({
          ...prev,
          totalVehicles: vehiclesArray.length,
          availableVehicles: available
        }));
      }
    });

    // Fetch rentals
    const rentalsRef = ref(database, 'rentals');
    const unsubRentals = onValue(rentalsRef, (snapshot) => {
      if (snapshot.exists()) {
        const rentalsData = snapshot.val();
        const rentalsArray = Object.entries(rentalsData).map(([id, data]) => ({ id, ...data }));
        const active = rentalsArray.filter(r => r.status === 'Active').length;
        
        setStats(prev => ({
          ...prev,
          activeRentals: active
        }));

        // Get recent activities
        const recent = rentalsArray
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5);
        setRecentActivities(recent);
      }
      setLoading(false);
    });

    // Fetch customers
    const customersRef = ref(database, 'customers');
    const unsubCustomers = onValue(customersRef, (snapshot) => {
      if (snapshot.exists()) {
        const customersData = snapshot.val();
        setStats(prev => ({
          ...prev,
          totalCustomers: Object.keys(customersData).length
        }));
      }
    });

    // Fetch billing
    const billingRef = ref(database, 'billing');
    const unsubBilling = onValue(billingRef, (snapshot) => {
      if (snapshot.exists()) {
        const billingData = snapshot.val();
        const billingArray = Object.values(billingData);
        
        // Calculate pending payments
        const pending = billingArray.filter(b => b.status === 'Pending').length;
        
        // Calculate today's revenue
        const today = new Date().toDateString();
        const todayRevenue = billingArray
          .filter(b => new Date(b.createdAt).toDateString() === today && b.status === 'Paid')
          .reduce((sum, b) => sum + (b.totalAmount || 0), 0);
        
        setStats(prev => ({
          ...prev,
          pendingPayments: pending,
          revenueToday: todayRevenue
        }));
      }
    });

    return () => {
      unsubVehicles();
      unsubRentals();
      unsubCustomers();
      unsubBilling();
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-600 mt-2">Monitor your rental business at a glance</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        <StatCard
          title="Total Vehicles"
          value={stats.totalVehicles}
          icon={Truck}
          color="primary"
        />
        <StatCard
          title="Available Vehicles"
          value={stats.availableVehicles}
          icon={Activity}
          color="success"
        />
        <StatCard
          title="Active Rentals"
          value={stats.activeRentals}
          icon={FileText}
          color="info"
        />
        <StatCard
          title="Total Customers"
          value={stats.totalCustomers}
          icon={Users}
          color="warning"
        />
        <StatCard
          title="Pending Payments"
          value={stats.pendingPayments}
          icon={Clock}
          color="danger"
        />
        <StatCard
          title="Revenue Today"
          value={`₹${stats.revenueToday.toLocaleString()}`}
          icon={DollarSign}
          color="success"
        />
      </div>

      {/* Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Recent Rentals" icon={FileText}>
          {recentActivities.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No recent activities</p>
          ) : (
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {activity.vehicleName || 'Vehicle'}
                    </p>
                    <p className="text-sm text-gray-600">
                      Customer: {activity.customerName || 'N/A'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {activity.createdAt ? format(new Date(activity.createdAt), 'PPp') : 'N/A'}
                    </p>
                  </div>
                  <div className="ml-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        activity.status === 'Active'
                          ? 'bg-green-100 text-green-800'
                          : activity.status === 'Completed'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {activity.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card title="Quick Actions" icon={Activity}>
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => navigate('/vehicles')}
              className="p-6 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors text-left"
            >
              <Truck className="text-orange-600 mb-2" size={32} />
              <p className="font-semibold text-gray-900">Add Vehicle</p>
              <p className="text-sm text-gray-600 mt-1">Register new vehicle</p>
            </button>
            <button 
              onClick={() => navigate('/customers')}
              className="p-6 bg-teal-50 hover:bg-teal-100 rounded-lg transition-colors text-left"
            >
              <Users className="text-teal-600 mb-2" size={32} />
              <p className="font-semibold text-gray-900">Add Customer</p>
              <p className="text-sm text-gray-600 mt-1">Register new customer</p>
            </button>
            <button 
              onClick={() => navigate('/rentals')}
              className="p-6 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-left"
            >
              <FileText className="text-blue-600 mb-2" size={32} />
              <p className="font-semibold text-gray-900">New Rental</p>
              <p className="text-sm text-gray-600 mt-1">Create rental entry</p>
            </button>
            <button 
              onClick={() => navigate('/billing')}
              className="p-6 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors text-left"
            >
              <DollarSign className="text-amber-600 mb-2" size={32} />
              <p className="font-semibold text-gray-900">Generate Bill</p>
              <p className="text-sm text-gray-600 mt-1">Create new bill</p>
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
