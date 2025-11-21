import React, { useState, useEffect } from 'react';
import { ref, onValue, push, set, remove } from 'firebase/database';
import { database } from '../config/firebase';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import InputField from '../components/common/InputField';
import Modal from '../components/common/Modal';
import Table from '../components/common/Table';
import { FileText, Plus, Edit, Trash2, Search, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { format, differenceInDays } from 'date-fns';

const Rentals = () => {
  const [rentals, setRentals] = useState([]);
  const [filteredRentals, setFilteredRentals] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRental, setEditingRental] = useState(null);
  const [formData, setFormData] = useState({
    vehicleId: '',
    customerId: '',
    startDate: '',
    endDate: '',
    additionalCharges: {
      diesel: 0,
      transport: 0,
      driverFee: 0
    },
    status: 'Active',
    notes: ''
  });

  useEffect(() => {
    // Fetch rentals
    const rentalsRef = ref(database, 'rentals');
    const unsubRentals = onValue(rentalsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const rentalsArray = Object.entries(data).map(([id, rental]) => ({
          id,
          ...rental
        }));
        setRentals(rentalsArray);
        setFilteredRentals(rentalsArray);
      } else {
        setRentals([]);
        setFilteredRentals([]);
      }
    });

    // Fetch vehicles
    const vehiclesRef = ref(database, 'vehicles');
    const unsubVehicles = onValue(vehiclesRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const vehiclesArray = Object.entries(data).map(([id, vehicle]) => ({
          id,
          ...vehicle
        }));
        setVehicles(vehiclesArray);
        console.log('All vehicles:', vehiclesArray);
        console.log('Available vehicles:', vehiclesArray.filter(v => v.status === 'Available'));
      }
    });

    // Fetch customers
    const customersRef = ref(database, 'customers');
    const unsubCustomers = onValue(customersRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const customersArray = Object.entries(data).map(([id, customer]) => ({
          id,
          ...customer
        }));
        setCustomers(customersArray);
      }
    });

    return () => {
      unsubRentals();
      unsubVehicles();
      unsubCustomers();
    };
  }, []);

  useEffect(() => {
    const filtered = rentals.filter(rental =>
      rental.vehicleName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rental.customerName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredRentals(filtered);
  }, [searchTerm, rentals]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('additionalCharges.')) {
      const field = name.split('.')[1];
      setFormData({
        ...formData,
        additionalCharges: {
          ...formData.additionalCharges,
          [field]: parseFloat(value) || 0
        }
      });
    } else if (name === 'vehicleId') {
      const vehicle = vehicles.find(v => v.id === value);
      setFormData({
        ...formData,
        vehicleId: value,
        vehicleName: vehicle?.model || '',
        rentRate: vehicle?.rentRate || 0
      });
    } else if (name === 'customerId') {
      const customer = customers.find(c => c.id === value);
      setFormData({
        ...formData,
        customerId: value,
        customerName: customer?.name || ''
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const calculateTotalRent = () => {
    if (!formData.startDate || !formData.endDate || !formData.rentRate) return 0;
    
    const days = differenceInDays(new Date(formData.endDate), new Date(formData.startDate)) + 1;
    const baseRent = days * parseFloat(formData.rentRate || 0);
    const additionalTotal = Object.values(formData.additionalCharges).reduce((sum, val) => sum + parseFloat(val || 0), 0);
    
    return baseRent + additionalTotal;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const totalRent = calculateTotalRent();
      const rentalData = {
        ...formData,
        totalRent,
        createdAt: new Date().toISOString()
      };

      if (editingRental) {
        const rentalRef = ref(database, `rentals/${editingRental.id}`);
        await set(rentalRef, {
          ...rentalData,
          updatedAt: new Date().toISOString()
        });
        toast.success('Rental updated successfully!');
      } else {
        // Add new rental with meaningful ID: RENTAL_VEHICLEID_CUSTOMERID_DATE
        const dateStr = formData.startDate.replace(/-/g, '');
        const rentalId = `RENTAL_${formData.vehicleId}_${formData.customerId}_${dateStr}`;
        const rentalRef = ref(database, `rentals/${rentalId}`);
        await set(rentalRef, {
          ...rentalData,
          id: rentalId
        });
        
        // Update vehicle status
        const vehicleRef = ref(database, `vehicles/${formData.vehicleId}`);
        const vehicle = vehicles.find(v => v.id === formData.vehicleId);
        await set(vehicleRef, {
          ...vehicle,
          status: 'On Rent',
          updatedAt: new Date().toISOString()
        });
        
        toast.success('Rental created successfully!');
      }
      
      resetForm();
      setIsModalOpen(false);
    } catch (error) {
      toast.error('Error saving rental: ' + error.message);
    }
  };

  const handleComplete = async (rental) => {
    if (window.confirm('Mark this rental as completed?')) {
      try {
        // Update rental status
        const rentalRef = ref(database, `rentals/${rental.id}`);
        await set(rentalRef, {
          ...rental,
          status: 'Completed',
          completedAt: new Date().toISOString()
        });

        // Update vehicle status back to available
        const vehicleRef = ref(database, `vehicles/${rental.vehicleId}`);
        const vehicle = vehicles.find(v => v.id === rental.vehicleId);
        if (vehicle) {
          await set(vehicleRef, {
            ...vehicle,
            status: 'Available',
            updatedAt: new Date().toISOString()
          });
        }

        toast.success('Rental completed successfully!');
      } catch (error) {
        toast.error('Error completing rental: ' + error.message);
      }
    }
  };

  const handleEdit = (rental) => {
    setEditingRental(rental);
    setFormData({
      vehicleId: rental.vehicleId,
      customerId: rental.customerId,
      vehicleName: rental.vehicleName,
      customerName: rental.customerName,
      rentRate: rental.rentRate,
      startDate: rental.startDate,
      endDate: rental.endDate,
      additionalCharges: rental.additionalCharges || {
        diesel: 0,
        transport: 0,
        driverFee: 0
      },
      status: rental.status,
      notes: rental.notes || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (rentalId) => {
    if (window.confirm('Are you sure you want to delete this rental?')) {
      try {
        const rentalRef = ref(database, `rentals/${rentalId}`);
        await remove(rentalRef);
        toast.success('Rental deleted successfully!');
      } catch (error) {
        toast.error('Error deleting rental: ' + error.message);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      vehicleId: '',
      customerId: '',
      startDate: '',
      endDate: '',
      additionalCharges: {
        diesel: 0,
        transport: 0,
        driverFee: 0
      },
      status: 'Active',
      notes: ''
    });
    setEditingRental(null);
  };

  const columns = [
    {
      header: 'Vehicle',
      accessor: 'vehicleName'
    },
    {
      header: 'Customer',
      accessor: 'customerName'
    },
    {
      header: 'Start Date',
      accessor: 'startDate',
      render: (row) => format(new Date(row.startDate), 'PP')
    },
    {
      header: 'End Date',
      accessor: 'endDate',
      render: (row) => format(new Date(row.endDate), 'PP')
    },
    {
      header: 'Duration',
      render: (row) => {
        const days = differenceInDays(new Date(row.endDate), new Date(row.startDate)) + 1;
        return `${days} day${days > 1 ? 's' : ''}`;
      }
    },
    {
      header: 'Total Rent',
      accessor: 'totalRent',
      render: (row) => `₹${row.totalRent?.toLocaleString() || 0}`
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${
            row.status === 'Active'
              ? 'bg-green-100 text-green-800'
              : row.status === 'Completed'
              ? 'bg-blue-100 text-blue-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {row.status}
        </span>
      )
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex gap-2">
          {row.status === 'Active' && (
            <button
              onClick={() => handleComplete(row)}
              className="text-green-600 hover:text-green-800"
              title="Mark as Completed"
            >
              <CheckCircle size={18} />
            </button>
          )}
          <button
            onClick={() => handleEdit(row)}
            className="text-blue-600 hover:text-blue-800"
          >
            <Edit size={18} />
          </button>
          <button
            onClick={() => handleDelete(row.id)}
            className="text-red-600 hover:text-red-800"
          >
            <Trash2 size={18} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Rental Management</h1>
          <p className="text-gray-600 mt-2">Track and manage vehicle rentals</p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          icon={Plus}
        >
          New Rental
        </Button>
      </div>

      <Card>
        <div className="mb-4">
          <InputField
            type="text"
            placeholder="Search rentals..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={Search}
          />
        </div>

        <Table columns={columns} data={filteredRentals} />
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        title={editingRental ? 'Edit Rental' : 'Create New Rental'}
        size="lg"
      >
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="mb-4">
              <label className="label">Select Vehicle</label>
              {vehicles.length === 0 ? (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-yellow-800 text-sm">
                    No vehicles found. Please add some vehicles first.
                  </p>
                </div>
              ) : (
                <>
                  <select
                    name="vehicleId"
                    value={formData.vehicleId}
                    onChange={handleChange}
                    className="input-field"
                    required
                  >
                    <option value="">Choose a vehicle</option>
                    {/* Show available vehicles first */}
                    {vehicles.filter(v => v.status === 'Available').map(vehicle => (
                      <option key={vehicle.id} value={vehicle.id}>
                        {vehicle.model || 'Unknown Model'} - {vehicle.vehicleId || vehicle.id} (₹{vehicle.rentRate || 0}/day) - Available
                      </option>
                    ))}
                    {/* Show other vehicles if editing or no available vehicles */}
                    {(editingRental || vehicles.filter(v => v.status === 'Available').length === 0) && 
                      vehicles.filter(v => v.status !== 'Available').map(vehicle => (
                        <option key={vehicle.id} value={vehicle.id}>
                          {vehicle.model || 'Unknown Model'} - {vehicle.vehicleId || vehicle.id} (₹{vehicle.rentRate || 0}/day) - {vehicle.status || 'Unknown'}
                        </option>
                      ))
                    }
                  </select>
                  {vehicles.filter(v => v.status === 'Available').length === 0 && (
                    <p className="text-sm text-orange-600 mt-1">
                      ⚠️ No vehicles are currently available. Showing all vehicles for selection.
                    </p>
                  )}
                </>
              )}
            </div>

            <div className="mb-4">
              <label className="label">Select Customer</label>
              <select
                name="customerId"
                value={formData.customerId}
                onChange={handleChange}
                className="input-field"
                required
              >
                <option value="">Choose a customer</option>
                {customers.map(customer => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name} - {customer.phone}
                  </option>
                ))}
              </select>
            </div>

            <InputField
              label="Start Date"
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              required
            />

            <InputField
              label="End Date"
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              required
            />
          </div>

          <div className="my-6">
            <h4 className="font-semibold text-gray-900 mb-3">Additional Charges</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <InputField
                label="Diesel (₹)"
                type="number"
                name="additionalCharges.diesel"
                value={formData.additionalCharges.diesel}
                onChange={handleChange}
                placeholder="0"
              />

              <InputField
                label="Transport (₹)"
                type="number"
                name="additionalCharges.transport"
                value={formData.additionalCharges.transport}
                onChange={handleChange}
                placeholder="0"
              />

              <InputField
                label="Driver Fee (₹)"
                type="number"
                name="additionalCharges.driverFee"
                value={formData.additionalCharges.driverFee}
                onChange={handleChange}
                placeholder="0"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="label">Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Additional notes..."
              rows="3"
              className="input-field"
            />
          </div>

          {formData.startDate && formData.endDate && formData.rentRate && (
            <div className="bg-primary-50 p-4 rounded-lg mb-4">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-900">Total Rent:</span>
                <span className="text-2xl font-bold text-primary-600">
                  ₹{calculateTotalRent().toLocaleString()}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Duration: {differenceInDays(new Date(formData.endDate), new Date(formData.startDate)) + 1} days × ₹{formData.rentRate}/day
                {Object.values(formData.additionalCharges).some(v => v > 0) && ' + Additional Charges'}
              </p>
            </div>
          )}

          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setIsModalOpen(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {editingRental ? 'Update' : 'Create'} Rental
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Rentals;
