import React, { useState, useEffect } from 'react';
import { ref, onValue, push, set, remove } from 'firebase/database';
import { database } from '../config/firebase';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import InputField from '../components/common/InputField';
import Modal from '../components/common/Modal';
import Table from '../components/common/Table';
import { Truck, Plus, Edit, Trash2, Search } from 'lucide-react';
import toast from 'react-hot-toast';

const Vehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [filteredVehicles, setFilteredVehicles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [formData, setFormData] = useState({
    vehicleId: '',
    model: '',
    type: '',
    condition: 'Good',
    status: 'Available',
    rentRate: '',
    description: ''
  });

  useEffect(() => {
    const vehiclesRef = ref(database, 'vehicles');
    const unsubscribe = onValue(vehiclesRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const vehiclesArray = Object.entries(data).map(([id, vehicle]) => ({
          id,
          ...vehicle
        }));
        setVehicles(vehiclesArray);
        setFilteredVehicles(vehiclesArray);
      } else {
        setVehicles([]);
        setFilteredVehicles([]);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const filtered = vehicles.filter(vehicle =>
      vehicle.vehicleId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.type?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredVehicles(filtered);
  }, [searchTerm, vehicles]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingVehicle) {
        // Update existing vehicle
        const vehicleRef = ref(database, `vehicles/${editingVehicle.id}`);
        await set(vehicleRef, {
          ...formData,
          updatedAt: new Date().toISOString()
        });
        toast.success('Vehicle updated successfully!');
      } else {
        // Add new vehicle using vehicleId as the database key
        const vehicleId = formData.vehicleId.toUpperCase().replace(/\s+/g, '_');
        const vehicleRef = ref(database, `vehicles/${vehicleId}`);
        await set(vehicleRef, {
          ...formData,
          id: vehicleId,
          createdAt: new Date().toISOString()
        });
        toast.success('Vehicle added successfully!');
      }
      
      resetForm();
      setIsModalOpen(false);
    } catch (error) {
      toast.error('Error saving vehicle: ' + error.message);
    }
  };

  const handleEdit = (vehicle) => {
    setEditingVehicle(vehicle);
    setFormData({
      vehicleId: vehicle.vehicleId,
      model: vehicle.model,
      type: vehicle.type,
      condition: vehicle.condition,
      status: vehicle.status,
      rentRate: vehicle.rentRate,
      description: vehicle.description || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (vehicleId) => {
    if (window.confirm('Are you sure you want to delete this vehicle?')) {
      try {
        const vehicleRef = ref(database, `vehicles/${vehicleId}`);
        await remove(vehicleRef);
        toast.success('Vehicle deleted successfully!');
      } catch (error) {
        toast.error('Error deleting vehicle: ' + error.message);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      vehicleId: '',
      model: '',
      type: '',
      condition: 'Good',
      status: 'Available',
      rentRate: '',
      description: ''
    });
    setEditingVehicle(null);
  };

  const columns = [
    {
      header: 'Vehicle ID',
      accessor: 'vehicleId'
    },
    {
      header: 'Model',
      accessor: 'model'
    },
    {
      header: 'Type',
      accessor: 'type'
    },
    {
      header: 'Condition',
      accessor: 'condition'
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${
            row.status === 'Available'
              ? 'bg-green-100 text-green-800'
              : row.status === 'On Rent'
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {row.status}
        </span>
      )
    },
    {
      header: 'Rent Rate (₹/day)',
      accessor: 'rentRate',
      render: (row) => `₹${row.rentRate}`
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
          <h1 className="text-3xl font-bold text-gray-900">Vehicle Management</h1>
          <p className="text-gray-600 mt-2">Manage your fleet of vehicles</p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          icon={Plus}
        >
          Add Vehicle
        </Button>
      </div>

      <Card>
        <div className="mb-4">
          <InputField
            type="text"
            placeholder="Search vehicles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={Search}
          />
        </div>

        <Table columns={columns} data={filteredVehicles} />
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        title={editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
        size="md"
      >
        <form onSubmit={handleSubmit}>
          <InputField
            label="Vehicle ID"
            type="text"
            name="vehicleId"
            value={formData.vehicleId}
            onChange={handleChange}
            placeholder="e.g., JCB-001"
            required
          />

          <InputField
            label="Model"
            type="text"
            name="model"
            value={formData.model}
            onChange={handleChange}
            placeholder="e.g., JCB 3DX"
            required
          />

          <div className="mb-4">
            <label className="label">Type</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="input-field"
              required
            >
              <option value="">Select Type</option>
              <option value="JCB">JCB</option>
              <option value="Excavator">Excavator</option>
              <option value="Bulldozer">Bulldozer</option>
              <option value="Loader">Loader</option>
              <option value="Grader">Grader</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="label">Condition</label>
            <select
              name="condition"
              value={formData.condition}
              onChange={handleChange}
              className="input-field"
              required
            >
              <option value="Excellent">Excellent</option>
              <option value="Good">Good</option>
              <option value="Fair">Fair</option>
              <option value="Needs Maintenance">Needs Maintenance</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="label">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="input-field"
              required
            >
              <option value="Available">Available</option>
              <option value="On Rent">On Rent</option>
              <option value="Under Maintenance">Under Maintenance</option>
            </select>
          </div>

          <InputField
            label="Rent Rate (₹/day)"
            type="number"
            name="rentRate"
            value={formData.rentRate}
            onChange={handleChange}
            placeholder="e.g., 5000"
            required
          />

          <div className="mb-4">
            <label className="label">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Additional details..."
              rows="3"
              className="input-field"
            />
          </div>

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
              {editingVehicle ? 'Update' : 'Add'} Vehicle
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Vehicles;
