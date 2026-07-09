import React, { useState, useEffect } from 'react';
import { 
  IndianRupee, FileText, CheckCircle, Clock, Search, Eye, Printer, Receipt, PlusCircle, X
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface Invoice {
  id: number;
  invoice_number: string;
  patient_name: string;
  doctor_name: string;
  total_amount: number;
  status: 'Pending' | 'Paid';
  created_at: string;
}

interface Doctor {
  user_id: number;
  name: string;
}

export function ReceptionistBillingTab() {
  const { token } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);

  // Create Invoice Form State
  const [formData, setFormData] = useState({
    patient: '', doctorId: '', consFee: 500, addCharges: 0, discount: 0
  });

  const totalAmount = (Number(formData.consFee) || 0) + (Number(formData.addCharges) || 0) - (Number(formData.discount) || 0);

  // Payment Modal State
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('UPI');

  useEffect(() => {
    fetchData();
  }, [token]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [invRes, docRes] = await Promise.all([
        fetch('http://localhost:5000/api/hospital/invoices', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('http://localhost:5000/api/hospital/doctors', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      if (invRes.ok) setInvoices(await invRes.json());
      if (docRes.ok) {
        const docData = await docRes.json();
        setDoctors(docData);
        if (docData.length > 0) setFormData(f => ({ ...f, doctorId: String(docData[0].user_id) }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.patient) return;

    try {
      const res = await fetch('http://localhost:5000/api/hospital/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          patient_name: formData.patient,
          doctor_id: formData.doctorId || null,
          consultation_fee: formData.consFee,
          additional_charges: formData.addCharges,
          discount: formData.discount
        })
      });

      if (res.ok) {
        fetchData();
        setFormData({ ...formData, patient: '', consFee: 500, addCharges: 0, discount: 0 });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCollectPayment = (id: number) => {
    setSelectedInvoiceForPayment(id);
    setPaymentModalOpen(true);
  };

  const confirmPayment = async () => {
    if (selectedInvoiceForPayment) {
      try {
        const res = await fetch(`http://localhost:5000/api/hospital/invoices/${selectedInvoiceForPayment}/pay`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ payment_method: paymentMethod })
        });
        if (res.ok) {
          fetchData();
        }
      } catch (err) {
        console.error(err);
      }
    }
    setPaymentModalOpen(false);
    setSelectedInvoiceForPayment(null);
  };

  const filteredInvoices = invoices.filter(inv => 
    (inv.invoice_number || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    (inv.patient_name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const todayStr = new Date().toISOString().split('T')[0];

  const stats = {
    revenue: invoices.filter(i => i.status === 'Paid' && i.created_at.startsWith(todayStr)).reduce((sum, i) => sum + Number(i.total_amount), 0),
    pending: invoices.filter(i => i.status === 'Pending').length,
    paid: invoices.filter(i => i.status === 'Paid').length,
    generated: invoices.length
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', position: 'relative' }}>
      
      {/* HEADER & STATS */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--gray-900)' }}>Billing Management</h1>
          <p style={{ color: 'var(--gray-500)', marginTop: '0.25rem' }}>Create invoices, collect payments, and track revenue.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
          {[
            { label: 'Today\'s Revenue', value: `₹${stats.revenue}`, icon: <IndianRupee color="#047857" />, bg: '#D1FAE5' },
            { label: 'Pending Payments', value: stats.pending, icon: <Clock color="#D97706" />, bg: '#FEF3C7' },
            { label: 'Paid Invoices', value: stats.paid, icon: <CheckCircle color="var(--primary-600)" />, bg: 'var(--primary-50)' },
            { label: 'Invoices Generated', value: stats.generated, icon: <FileText color="#4B5563" />, bg: '#F3F4F6' },
          ].map((stat, i) => (
            <div key={i} className="card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {stat.icon}
              </div>
              <div>
                <p style={{ color: 'var(--gray-500)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>{stat.label}</p>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--gray-900)', marginTop: '0.25rem' }}>{stat.value}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2.5fr', gap: '2rem' }}>
        
        {/* LEFT COLUMN: CREATE INVOICE FORM */}
        <div className="card" style={{ height: 'fit-content' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--gray-200)', background: 'var(--gray-50)' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--gray-900)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <PlusCircle size={18} color="var(--primary-600)" /> Create Invoice
            </h2>
          </div>
          <form onSubmit={handleCreateInvoice} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            <div>
              <label className="form-label">Patient Name <span style={{ color: 'red' }}>*</span></label>
              <input 
                type="text" className="form-input" placeholder="Search or Enter Name" required
                value={formData.patient} onChange={e => setFormData({...formData, patient: e.target.value})}
              />
            </div>

            <div>
              <label className="form-label">Doctor <span style={{ color: 'red' }}>*</span></label>
              <select className="form-input" required value={formData.doctorId} onChange={e => setFormData({...formData, doctorId: e.target.value})}>
                {doctors.map(d => (
                  <option key={d.user_id} value={d.user_id}>{d.name}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label className="form-label">Consultation Fee (₹)</label>
                <input 
                  type="number" className="form-input" 
                  value={formData.consFee} onChange={e => setFormData({...formData, consFee: Number(e.target.value)})}
                />
              </div>
              <div>
                <label className="form-label">Add. Charges (₹)</label>
                <input 
                  type="number" className="form-input" 
                  value={formData.addCharges} onChange={e => setFormData({...formData, addCharges: Number(e.target.value)})}
                />
              </div>
            </div>

            <div>
              <label className="form-label">Discount (₹)</label>
              <input 
                type="number" className="form-input" 
                value={formData.discount} onChange={e => setFormData({...formData, discount: Number(e.target.value)})}
              />
            </div>

            <div style={{ padding: '1rem', background: 'var(--primary-50)', borderRadius: 'var(--radius)', border: '1px dashed var(--primary-300)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 600, color: 'var(--primary-700)' }}>Total Amount:</span>
              <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary-700)' }}>₹{totalAmount > 0 ? totalAmount : 0}</span>
            </div>

            <div style={{ paddingTop: '0.5rem' }}>
              <button type="submit" className="btn-primary" style={{ width: '100%', padding: '0.875rem', fontSize: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
                <Receipt size={18} /> Generate Receipt
              </button>
            </div>
          </form>
        </div>

        {/* RIGHT COLUMN: INVOICE TABLE */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--gray-200)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--gray-900)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileText size={18} color="var(--gray-500)" /> Invoice List
            </h2>
            <div style={{ position: 'relative' }}>
              <Search size={16} color="var(--gray-400)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="text" placeholder="Search Invoice or Patient..." className="form-input" 
                value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                style={{ paddingLeft: '2rem', paddingRight: '1rem', paddingTop: '0.5rem', paddingBottom: '0.5rem', width: '250px' }} 
              />
            </div>
          </div>
          
          <div style={{ flex: 1, overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--gray-200)', color: 'var(--gray-500)', fontSize: '0.875rem', background: 'var(--gray-50)' }}>
                  <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Invoice ID</th>
                  <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Patient Name</th>
                  <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Doctor</th>
                  <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Date</th>
                  <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Amount</th>
                  <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Status</th>
                  <th style={{ padding: '1rem 1.5rem', fontWeight: 600, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} style={{ padding: '3rem', textAlign: 'center', color: 'var(--gray-500)' }}>
                      Loading invoices...
                    </td>
                  </tr>
                ) : filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: '3rem', textAlign: 'center', color: 'var(--gray-500)' }}>
                      No invoices found.
                    </td>
                  </tr>
                ) : filteredInvoices.map((inv) => (
                  <tr key={inv.id} style={{ borderBottom: '1px solid var(--gray-100)' }}>
                    <td style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--primary-600)' }}>{inv.invoice_number}</td>
                    <td style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--gray-900)' }}>{inv.patient_name}</td>
                    <td style={{ padding: '1rem 1.5rem', color: 'var(--gray-600)' }}>{inv.doctor_name || 'N/A'}</td>
                    <td style={{ padding: '1rem 1.5rem', color: 'var(--gray-600)' }}>{new Date(inv.created_at).toLocaleDateString()}</td>
                    <td style={{ padding: '1rem 1.5rem', fontWeight: 700, color: 'var(--gray-900)' }}>₹{inv.total_amount}</td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <span style={{ 
                        padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600,
                        background: inv.status === 'Paid' ? '#D1FAE5' : '#FEF3C7', 
                        color: inv.status === 'Paid' ? '#047857' : '#D97706', 
                        display: 'inline-block'
                      }}>
                        {inv.status}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                        <button className="btn-secondary" style={{ padding: '0.35rem', borderRadius: 'var(--radius)', color: 'var(--gray-600)' }} title="View Invoice">
                          <Eye size={16} />
                        </button>
                        <button className="btn-secondary" style={{ padding: '0.35rem', borderRadius: 'var(--radius)', color: 'var(--gray-600)' }} title="Print Invoice">
                          <Printer size={16} />
                        </button>
                        {inv.status === 'Pending' && (
                          <button 
                            onClick={() => handleCollectPayment(inv.id)}
                            className="btn-primary" 
                            style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', borderRadius: 'var(--radius)' }}
                          >
                            Collect
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* COLLECT PAYMENT MODAL */}
      {paymentModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div className="card" style={{ width: '400px', padding: '0' }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--gray-200)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--gray-900)' }}>Collect Payment</h2>
              <button onClick={() => setPaymentModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-500)' }}><X size={20} /></button>
            </div>
            
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ padding: '1rem', background: 'var(--gray-50)', borderRadius: 'var(--radius)', textAlign: 'center' }}>
                <div style={{ fontSize: '0.875rem', color: 'var(--gray-500)', marginBottom: '0.25rem' }}>Amount Due</div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--gray-900)' }}>
                  ₹{invoices.find(i => i.id === selectedInvoiceForPayment)?.total_amount}
                </div>
              </div>

              <div>
                <label className="form-label" style={{ marginBottom: '0.75rem' }}>Select Payment Method</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  {['Cash', 'UPI', 'Card', 'Net Banking'].map(method => (
                    <button
                      key={method}
                      onClick={() => setPaymentMethod(method)}
                      style={{
                        padding: '0.75rem', borderRadius: 'var(--radius)', border: '1px solid',
                        borderColor: paymentMethod === method ? 'var(--primary-600)' : 'var(--gray-200)',
                        background: paymentMethod === method ? 'var(--primary-50)' : 'white',
                        color: paymentMethod === method ? 'var(--primary-700)' : 'var(--gray-700)',
                        fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s'
                      }}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginTop: '0.5rem' }}>
                <button onClick={confirmPayment} className="btn-primary" style={{ width: '100%', padding: '0.875rem', fontSize: '1rem' }}>
                  Confirm Payment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
