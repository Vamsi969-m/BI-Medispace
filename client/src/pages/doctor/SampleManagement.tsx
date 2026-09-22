import { useCallback, useEffect, useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  FlaskConical,
  Loader2,
  MapPin,
  Package,
  Truck,
  XCircle,
} from 'lucide-react';
import { useApp } from '@/store/AppContext';
import { Card, EmptyState, PageHeader, StatusBadge } from '@/components/ui';
import { formatDate } from '@/lib/utils';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

type SampleStatus = 'PENDING' | 'APPROVED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

type Sample = {
  _id: string;
  quantity: number;
  deliveryOrganization: string;
  deliveryAddress: string;
  notes?: string;
  status: SampleStatus;
  trackingNumber?: string;
  createdAt: string;
  product?: { _id: string; name: string; image?: string; purpose?: string; price?: number };
  doctor?: { fullName: string; email: string; phone?: string };
};

export function SampleManagement() {
  const { token, role, products, pageParams, navigate, user, showToast } = useApp();
  const [samples, setSamples] = useState<Sample[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [deliveryOrganization, setDeliveryOrganization] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [notes, setNotes] = useState('');

  const isDoctor = role === 'doctor';
  const isRequestPage = isDoctor && Boolean(pageParams.productId);
  const selectedProduct = products.find((product) => product.id === pageParams.productId);

  const loadSamples = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');
      const endpoint = isDoctor ? `${API_URL}/samples/my` : `${API_URL}/samples/all`;
      const response = await fetch(endpoint, { headers: { Authorization: `Bearer ${token}` } });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to load sample requests');
      setSamples(data.samples || []);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Failed to load sample requests');
    } finally {
      setLoading(false);
    }
  }, [token, isDoctor]);

  useEffect(() => {
    void loadSamples();
  }, [loadSamples]);

  const submitRequest = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token || !selectedProduct) return;

    const parsedQuantity = Number(quantity);
    if (!Number.isInteger(parsedQuantity) || parsedQuantity < 1) {
      showToast('Quantity must be at least 1', 'error');
      return;
    }
    if (!deliveryOrganization.trim() || !deliveryAddress.trim()) {
      showToast('Delivery organization and address are required', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch(`${API_URL}/samples`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          product: selectedProduct.id,
          quantity: parsedQuantity,
          deliveryOrganization: deliveryOrganization.trim(),
          deliveryAddress: deliveryAddress.trim(),
          notes: notes.trim(),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to submit sample request');
      showToast('Sample request submitted successfully', 'success');
      navigate('samples');
    } catch (requestError) {
      showToast(requestError instanceof Error ? requestError.message : 'Failed to submit sample request', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const updateStatus = async (sampleId: string, status: SampleStatus) => {
    if (!token) return;
    try {
      const response = await fetch(`${API_URL}/samples/${sampleId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to update sample status');
      setSamples((current) => current.map((sample) => sample._id === sampleId ? { ...sample, status: data.sample.status } : sample));
      showToast('Sample status updated', 'success');
    } catch (requestError) {
      showToast(requestError instanceof Error ? requestError.message : 'Failed to update sample status', 'error');
    }
  };

  if (isRequestPage && !selectedProduct) {
    return <EmptyState icon={Package} title="Product not found" description="Select a valid product before requesting a sample." action={<button className="btn-primary" onClick={() => navigate('products')}>Back to Products</button>} />;
  }

  if (isRequestPage && selectedProduct) {
    return (
      <div>
        <PageHeader title="Request Product Sample" subtitle={`Request a sample of ${selectedProduct.name}`} />
        <Card className="max-w-2xl p-5">
          <div className="flex items-center gap-3 mb-5">
            {selectedProduct.image ? <img src={selectedProduct.image} alt={selectedProduct.name} className="h-16 w-16 rounded-lg object-cover" /> : <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-brand-50"><FlaskConical className="h-7 w-7 text-brand-600" /></div>}
            <div><h2 className="font-semibold text-ink-900">{selectedProduct.name}</h2><p className="text-sm text-ink-500">{selectedProduct.category}</p></div>
          </div>
          <form className="space-y-4" onSubmit={submitRequest}>
            <div><label className="label" htmlFor="quantity">Quantity</label><input id="quantity" className="input" type="number" min="1" value={quantity} onChange={(event) => setQuantity(event.target.value)} /></div>
            <div><label className="label" htmlFor="organization">Delivery Organization</label><input id="organization" className="input" value={deliveryOrganization} onChange={(event) => setDeliveryOrganization(event.target.value)} placeholder={user?.organizationId || 'Hospital or clinic name'} required /></div>
            <div><label className="label" htmlFor="address">Delivery Address</label><textarea id="address" className="input resize-none" rows={3} value={deliveryAddress} onChange={(event) => setDeliveryAddress(event.target.value)} placeholder="Full delivery address" required /></div>
            <div><label className="label" htmlFor="notes">Notes (Optional)</label><textarea id="notes" className="input resize-none" rows={3} value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Add instructions for the representative" /></div>
            <div className="flex gap-3"><button type="button" className="btn-secondary" onClick={() => navigate('products')}>Cancel</button><button type="submit" className="btn-primary" disabled={submitting}>{submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <FlaskConical className="h-4 w-4" />} Submit Request</button></div>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title={isDoctor ? 'My Sample Requests' : 'Sample Management'} subtitle={isDoctor ? 'Track your product sample requests' : 'Review and process sample requests'} />
      {loading ? <Card className="flex min-h-[260px] items-center justify-center"><Loader2 className="mr-2 h-5 w-5 animate-spin" />Loading sample requests...</Card> : error ? <Card className="p-6 text-center text-red-600">{error}<button className="btn-secondary ml-3" onClick={() => void loadSamples()}>Retry</button></Card> : samples.length === 0 ? <Card><EmptyState icon={FlaskConical} title="No sample requests" description={isDoctor ? 'Request a product sample to see it here.' : 'There are no sample requests to review.'} action={isDoctor ? <button className="btn-primary" onClick={() => navigate('products')}>Browse Products</button> : undefined} /></Card> : <div className="space-y-3">{samples.map((sample) => <SampleRow key={sample._id} sample={sample} canManage={!isDoctor} onStatusChange={updateStatus} />)}</div>}
    </div>
  );
}

function SampleRow({ sample, canManage, onStatusChange }: { sample: Sample; canManage: boolean; onStatusChange: (id: string, status: SampleStatus) => void }) {
  const nextStatus: Partial<Record<SampleStatus, SampleStatus>> = { PENDING: 'APPROVED', APPROVED: 'PROCESSING', PROCESSING: 'SHIPPED', SHIPPED: 'DELIVERED' };
  return <Card className="p-5"><div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"><div className="flex items-start gap-3"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50"><FlaskConical className="h-5 w-5 text-brand-600" /></div><div><p className="font-semibold text-ink-900">{sample.product?.name || 'Product sample'}</p><div className="mt-1 flex flex-wrap gap-3 text-xs text-ink-500"><span className="flex items-center gap-1"><Package className="h-3.5 w-3.5" />{sample.quantity} units</span><span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{formatDate(sample.createdAt)}</span><span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{sample.deliveryOrganization}</span></div>{sample.doctor && <p className="mt-2 text-sm text-ink-600">Requested by {sample.doctor.fullName}</p>}{sample.trackingNumber && <p className="mt-1 flex items-center gap-1 text-xs text-ink-500"><Truck className="h-3.5 w-3.5" />Tracking: {sample.trackingNumber}</p>}</div></div><div className="flex items-center gap-3"><StatusBadge status={sample.status} />{canManage && nextStatus[sample.status] && <button className="btn-secondary text-sm" onClick={() => onStatusChange(sample._id, nextStatus[sample.status] as SampleStatus)}>{nextStatus[sample.status] === 'DELIVERED' ? <CheckCircle2 className="h-4 w-4" /> : <Package className="h-4 w-4" />}{nextStatus[sample.status]}</button>}{canManage && sample.status !== 'DELIVERED' && sample.status !== 'CANCELLED' && <button className="p-2 text-red-600 hover:bg-red-50" title="Cancel request" onClick={() => onStatusChange(sample._id, 'CANCELLED')}><XCircle className="h-4 w-4" /></button>}</div></div></Card>;
}
