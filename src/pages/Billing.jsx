import React, { useState, useEffect } from 'react';
import { ref, onValue, push, set } from 'firebase/database';
import { database } from '../config/firebase';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import InputField from '../components/common/InputField';
import Modal from '../components/common/Modal';
import Table from '../components/common/Table';
import { CreditCard, Plus, Search, Download, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const Billing = () => {
  const [bills, setBills] = useState([]);
  const [filteredBills, setFilteredBills] = useState([]);
  const [rentals, setRentals] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewBillModal, setViewBillModal] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [formData, setFormData] = useState({
    rentalId: '',
    paymentMode: 'Cash',
    amountPaid: 0,
    status: 'Pending',
    notes: ''
  });

  useEffect(() => {
    // Fetch bills
    const billsRef = ref(database, 'billing');
    const unsubBills = onValue(billsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const billsArray = Object.entries(data).map(([id, bill]) => ({
          id,
          ...bill
        }));
        setBills(billsArray);
        setFilteredBills(billsArray);
      } else {
        setBills([]);
        setFilteredBills([]);
      }
    });

    // Fetch completed rentals
    const rentalsRef = ref(database, 'rentals');
    const unsubRentals = onValue(rentalsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const rentalsArray = Object.entries(data).map(([id, rental]) => ({
          id,
          ...rental
        }));
        // Show completed rentals, or all rentals if no completed ones exist
        const completedRentals = rentalsArray.filter(r => r.status === 'Completed');
        console.log('All rentals:', rentalsArray);
        console.log('Completed rentals:', completedRentals);
        
        // If no completed rentals, show all rentals for testing
        const availableRentals = completedRentals.length > 0 ? completedRentals : rentalsArray;
        setRentals(availableRentals);
      }
    });

    return () => {
      unsubBills();
      unsubRentals();
    };
  }, []);

  useEffect(() => {
    const filtered = bills.filter(bill =>
      bill.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bill.vehicleName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bill.billNumber?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredBills(filtered);
  }, [searchTerm, bills]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'rentalId') {
      const rental = rentals.find(r => r.id === value);
      if (rental) {
        setFormData({
          ...formData,
          rentalId: value,
          vehicleName: rental.vehicleName,
          customerName: rental.customerName,
          totalAmount: parseFloat(rental.totalRent) || 0,
          amountPaid: parseFloat(rental.totalRent) || 0
        });
      }
    } else {
      setFormData({
        ...formData,
        [name]: name === 'amountPaid' ? parseFloat(value) || 0 : value
      });
    }
  };

  const generateBillNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const time = String(date.getHours()).padStart(2, '0') + String(date.getMinutes()).padStart(2, '0');
    return `BILL-${year}${month}${day}-${time}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const billNumber = generateBillNumber();
      const billData = {
        ...formData,
        billNumber,
        totalAmount: parseFloat(formData.totalAmount) || 0,
        amountPaid: parseFloat(formData.amountPaid) || 0,
        dueAmount: (parseFloat(formData.totalAmount) || 0) - (parseFloat(formData.amountPaid) || 0),
        createdAt: new Date().toISOString()
      };

      const billRef = ref(database, `billing/${billNumber}`);
      await set(billRef, {
        ...billData,
        id: billNumber
      });
      
      toast.success('Bill generated successfully!');
      resetForm();
      setIsModalOpen(false);
    } catch (error) {
      toast.error('Error generating bill: ' + error.message);
    }
  };

  const handlePayment = async (bill) => {
    const amountPaid = parseFloat(prompt('Enter amount paid:'));
    
    if (isNaN(amountPaid) || amountPaid <= 0) {
      toast.error('Invalid amount');
      return;
    }

    try {
      const currentAmountPaid = parseFloat(bill.amountPaid) || 0;
      const totalAmount = parseFloat(bill.totalAmount) || 0;
      const newAmountPaid = currentAmountPaid + amountPaid;
      const dueAmount = totalAmount - newAmountPaid;
      const status = dueAmount <= 0 ? 'Paid' : 'Partial';

      const billRef = ref(database, `billing/${bill.id}`);
      await set(billRef, {
        ...bill,
        amountPaid: newAmountPaid,
        dueAmount,
        status,
        updatedAt: new Date().toISOString()
      });

      toast.success('Payment recorded successfully!');
    } catch (error) {
      toast.error('Error recording payment: ' + error.message);
    }
  };

  const formatCurrency = (amount) => {
    return (amount || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const downloadPDF = (bill) => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(245, 158, 11);
    doc.text('JCB & Earthmover Rental', 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('INVOICE', 105, 30, { align: 'center' });
    
    // Bill Details
    doc.setFontSize(10);
    doc.text(`Bill Number: ${bill.billNumber}`, 20, 45);
    doc.text(`Date: ${format(new Date(bill.createdAt), 'PP')}`, 20, 52);
    
    // Customer Details
    doc.text('Bill To:', 20, 65);
    doc.text(bill.customerName, 20, 72);
    
    // Table
    doc.autoTable({
      startY: 85,
      head: [['Description', 'Amount (INR)']],
      body: [
        ['Vehicle: ' + bill.vehicleName, formatCurrency(bill.totalAmount)],
        ['Amount Paid', formatCurrency(bill.amountPaid)],
        ['Due Amount', formatCurrency(bill.dueAmount)]
      ],
      theme: 'grid',
      headStyles: { fillColor: [245, 158, 11] }
    });
    
    // Footer
    const finalY = doc.lastAutoTable.finalY + 20;
    doc.setFontSize(10);
    doc.text('Payment Mode: ' + bill.paymentMode, 20, finalY);
    doc.text('Status: ' + bill.status, 20, finalY + 7);
    
    if (bill.notes) {
      doc.text('Notes: ' + bill.notes, 20, finalY + 14);
    }
    
    doc.text('Thank you for your business!', 105, finalY + 30, { align: 'center' });
    
    // Save
    doc.save(`${bill.billNumber}.pdf`);
    toast.success('PDF downloaded successfully!');
  };

  const viewBill = (bill) => {
    setSelectedBill(bill);
    setViewBillModal(true);
  };

  const resetForm = () => {
    setFormData({
      rentalId: '',
      paymentMode: 'Cash',
      amountPaid: 0,
      status: 'Pending',
      notes: ''
    });
  };

  const columns = [
    {
      header: 'Bill Number',
      accessor: 'billNumber'
    },
    {
      header: 'Customer',
      accessor: 'customerName'
    },
    {
      header: 'Vehicle',
      accessor: 'vehicleName'
    },
    {
      header: 'Total Amount',
      accessor: 'totalAmount',
      render: (row) => `₹${row.totalAmount?.toLocaleString() || 0}`
    },
    {
      header: 'Paid',
      accessor: 'amountPaid',
      render: (row) => `₹${(row.amountPaid || 0).toLocaleString()}`
    },
    {
      header: 'Due',
      accessor: 'dueAmount',
      render: (row) => `₹${(row.dueAmount || 0).toLocaleString()}`
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${
            row.status === 'Paid'
              ? 'bg-green-100 text-green-800'
              : row.status === 'Partial'
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {row.status}
        </span>
      )
    },
    {
      header: 'Date',
      accessor: 'createdAt',
      render: (row) => format(new Date(row.createdAt), 'PP')
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex gap-2">
          <button
            onClick={() => viewBill(row)}
            className="text-blue-600 hover:text-blue-800"
            title="View Bill"
          >
            <Eye size={18} />
          </button>
          <button
            onClick={() => downloadPDF(row)}
            className="text-green-600 hover:text-green-800"
            title="Download PDF"
          >
            <Download size={18} />
          </button>
          {row.status !== 'Paid' && (
            <button
              onClick={() => handlePayment(row)}
              className="text-primary-600 hover:text-primary-800"
              title="Record Payment"
            >
              <CreditCard size={18} />
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Billing & Payments</h1>
          <p className="text-gray-600 mt-2">Manage invoices and payments</p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          icon={Plus}
        >
          Generate Bill
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">Total Billed</p>
            <p className="text-3xl font-bold text-gray-900">
              ₹{bills.reduce((sum, b) => sum + (parseFloat(b.totalAmount) || 0), 0).toLocaleString()}
            </p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">Total Received</p>
            <p className="text-3xl font-bold text-green-600">
              ₹{bills.reduce((sum, b) => sum + (parseFloat(b.amountPaid) || 0), 0).toLocaleString()}
            </p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">Total Due</p>
            <p className="text-3xl font-bold text-red-600">
              ₹{bills.reduce((sum, b) => sum + (parseFloat(b.dueAmount) || 0), 0).toLocaleString()}
            </p>
          </div>
        </Card>
      </div>

      <Card>
        <div className="mb-4">
          <InputField
            type="text"
            placeholder="Search bills..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={Search}
          />
        </div>

        <Table columns={columns} data={filteredBills} />
      </Card>

      {/* Generate Bill Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        title="Generate New Bill"
        size="md"
      >
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="label">Select Rental</label>
            {rentals.length === 0 ? (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-800 text-sm">
                  No rentals available for billing. Please create some rentals first or mark existing rentals as completed.
                </p>
              </div>
            ) : (
              <select
                name="rentalId"
                value={formData.rentalId}
                onChange={handleChange}
                className="input-field"
                required
              >
                <option value="">Choose a rental</option>
                {rentals.map(rental => (
                  <option key={rental.id} value={rental.id}>
                    {rental.vehicleName} - {rental.customerName} (₹{rental.totalRent?.toLocaleString()}) - {rental.status}
                  </option>
                ))}
              </select>
            )}
          </div>

          {formData.rentalId && (
            <>
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <p className="text-sm text-gray-600">Vehicle: <span className="font-semibold text-gray-900">{formData.vehicleName}</span></p>
                <p className="text-sm text-gray-600">Customer: <span className="font-semibold text-gray-900">{formData.customerName}</span></p>
                <p className="text-sm text-gray-600">Total Amount: <span className="font-semibold text-gray-900">₹{formData.totalAmount?.toLocaleString()}</span></p>
              </div>

              <div className="mb-4">
                <label className="label">Payment Mode</label>
                <select
                  name="paymentMode"
                  value={formData.paymentMode}
                  onChange={handleChange}
                  className="input-field"
                  required
                >
                  <option value="Cash">Cash</option>
                  <option value="UPI">UPI</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Cheque">Cheque</option>
                </select>
              </div>

              <InputField
                label="Amount Paid (₹)"
                type="number"
                name="amountPaid"
                value={formData.amountPaid}
                onChange={handleChange}
                placeholder="0"
                required
              />

              <div className="mb-4">
                <label className="label">Payment Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="input-field"
                  required
                >
                  <option value="Pending">Pending</option>
                  <option value="Partial">Partial</option>
                  <option value="Paid">Paid</option>
                </select>
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
            </>
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
            <Button type="submit" variant="primary" disabled={!formData.rentalId || rentals.length === 0}>
              Generate Bill
            </Button>
          </div>
        </form>
      </Modal>

      {/* View Bill Modal */}
      <Modal
        isOpen={viewBillModal}
        onClose={() => setViewBillModal(false)}
        title="Bill Details"
        size="md"
      >
        {selectedBill && (
          <div className="space-y-4">
            <div className="border-b pb-4">
              <h3 className="text-xl font-bold text-gray-900">{selectedBill.billNumber}</h3>
              <p className="text-sm text-gray-600">Date: {format(new Date(selectedBill.createdAt), 'PPP')}</p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Customer Details</h4>
              <p className="text-gray-700">{selectedBill.customerName}</p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Vehicle Details</h4>
              <p className="text-gray-700">{selectedBill.vehicleName}</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Total Amount:</span>
                <span className="font-semibold">₹{selectedBill.totalAmount?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Amount Paid:</span>
                <span className="font-semibold text-green-600">₹{selectedBill.amountPaid?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between pt-2 border-t">
                <span className="text-gray-900 font-semibold">Due Amount:</span>
                <span className="font-bold text-red-600">₹{selectedBill.dueAmount?.toLocaleString()}</span>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-600">Payment Mode: <span className="font-semibold">{selectedBill.paymentMode}</span></p>
              <p className="text-sm text-gray-600">Status: <span className={`font-semibold ${
                selectedBill.status === 'Paid' ? 'text-green-600' : 'text-red-600'
              }`}>{selectedBill.status}</span></p>
            </div>

            {selectedBill.notes && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Notes</h4>
                <p className="text-gray-700">{selectedBill.notes}</p>
              </div>
            )}

            <div className="flex gap-3 justify-end pt-4 border-t">
              <Button
                variant="secondary"
                onClick={() => setViewBillModal(false)}
              >
                Close
              </Button>
              <Button
                variant="primary"
                onClick={() => downloadPDF(selectedBill)}
                icon={Download}
              >
                Download PDF
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Billing;
