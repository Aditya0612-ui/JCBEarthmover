import React, { useState, useEffect } from 'react';
import { ref, onValue, push, set, remove } from 'firebase/database';
import { database } from '../config/firebase';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import InputField from '../components/common/InputField';
import Modal from '../components/common/Modal';
import Table from '../components/common/Table';
import { Users, Plus, Edit, Trash2, Search, Phone, Mail, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    pan: '',
    gst: ''
  });

  useEffect(() => {
    const customersRef = ref(database, 'customers');
    const unsubscribe = onValue(customersRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const customersArray = Object.entries(data).map(([id, customer]) => ({
          id,
          ...customer
        }));
        setCustomers(customersArray);
        setFilteredCustomers(customersArray);
      } else {
        setCustomers([]);
        setFilteredCustomers([]);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const filtered = customers.filter(customer =>
      customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone?.includes(searchTerm) ||
      customer.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCustomers(filtered);
  }, [searchTerm, customers]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingCustomer) {
        const customerRef = ref(database, `customers/${editingCustomer.id}`);
        await set(customerRef, {
          ...formData,
          updatedAt: new Date().toISOString()
        });
        toast.success('Customer updated successfully!');
      } else {
        // Create meaningful ID using phone number (remove spaces and special chars)
        const customerId = `CUST_${formData.phone.replace(/\D/g, '')}`;
        const customerRef = ref(database, `customers/${customerId}`);
        await set(customerRef, {
          ...formData,
          id: customerId,
          createdAt: new Date().toISOString()
        });
        toast.success('Customer added successfully!');
      }
      
      resetForm();
      setIsModalOpen(false);
    } catch (error) {
      toast.error('Error saving customer: ' + error.message);
    }
  };

  const handleEdit = (customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      phone: customer.phone,
      email: customer.email || '',
      address: customer.address || '',
      pan: customer.pan || '',
      gst: customer.gst || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (customerId) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      try {
        const customerRef = ref(database, `customers/${customerId}`);
        await remove(customerRef);
        toast.success('Customer deleted successfully!');
      } catch (error) {
        toast.error('Error deleting customer: ' + error.message);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      email: '',
      address: '',
      pan: '',
      gst: ''
    });
    setEditingCustomer(null);
  };

  const columns = [
    {
      header: 'Name',
      accessor: 'name'
    },
    {
      header: 'Phone',
      accessor: 'phone'
    },
    {
      header: 'Email',
      accessor: 'email',
      render: (row) => row.email || 'N/A'
    },
    {
      header: 'Address',
      accessor: 'address',
      render: (row) => row.address || 'N/A'
    },
    {
      header: 'PAN',
      accessor: 'pan',
      render: (row) => row.pan || 'N/A'
    },
    {
      header: 'GST',
      accessor: 'gst',
      render: (row) => row.gst || 'N/A'
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex gap-2">
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
          <h1 className="text-3xl font-bold text-gray-900">Customer Management</h1>
          <p className="text-gray-600 mt-2">Manage your customer database</p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          icon={Plus}
        >
          Add Customer
        </Button>
      </div>

      <Card>
        <div className="mb-4">
          <InputField
            type="text"
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={Search}
          />
        </div>

        <Table columns={columns} data={filteredCustomers} />
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        title={editingCustomer ? 'Edit Customer' : 'Add New Customer'}
        size="md"
      >
        <form onSubmit={handleSubmit}>
          <InputField
            label="Full Name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter customer name"
            required
          />

          <InputField
            label="Phone Number"
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="+91 1234567890"
            required
            icon={Phone}
          />

          <InputField
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="customer@example.com"
            icon={Mail}
          />

          <div className="mb-4">
            <label className="label">Address</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Enter full address"
              rows="3"
              className="input-field"
            />
          </div>

          <InputField
            label="PAN Number"
            type="text"
            name="pan"
            value={formData.pan}
            onChange={handleChange}
            placeholder="ABCDE1234F"
          />

          <InputField
            label="GST Number"
            type="text"
            name="gst"
            value={formData.gst}
            onChange={handleChange}
            placeholder="22AAAAA0000A1Z5"
          />

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
              {editingCustomer ? 'Update' : 'Add'} Customer
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Customers;
