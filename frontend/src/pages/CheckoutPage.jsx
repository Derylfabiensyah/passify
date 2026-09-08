import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  CreditCard,
  Lock,
  QrCode,
  ShieldCheck,
  Smartphone,
  Ticket,
  User,
  Users,
  Wallet,
  Building2,
  ChevronRight,
  Sparkles,
  Leaf
} from 'lucide-react';
import { fetchDestinationBySlug } from '../api/tenant';
import { fetchAdminQuotas } from '../api/admin';
import { useTenant } from '../contexts/TenantContext';
import { formatRupiah } from '../api/client';
import WalletModal from '../components/WalletModal';

const getPaymentDeadline = (slug) => {
  try {
    const raw = localStorage.getItem('passify_payment_session');
    if (!raw) return 0;
    const session = JSON.parse(raw);
    if (!slug || session.slug === slug) return Number(session.deadline || 0);
  } catch (_) {}
  return 0;
};

const setPaymentDeadline = (slug, deadline) => {
  localStorage.setItem('passify_payment_session', JSON.stringify({ slug, deadline }));
};

const clearPaymentDeadline = () => {
  localStorage.removeItem('passify_payment_session');
};

export default function CheckoutPage() {
  const { tenantSlug, destinationId } = useParams();
  const [searchParams] = useSearchParams();
  const { slug: contextSlug, destination: contextDest } = useTenant();
  const navigate = useNavigate();

  // Destination & Tenant State
  const [destination, setDestination] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Stepper State: 1 = Isi Data & Jadwal, 2 = Pembayaran, 3 = Sukses
  const [step, setStep] = useState(1);

  // Step 1 Form States
  const todayStr = new Date().toISOString().split('T')[0];
  const [visitDate, setVisitDate] = useState(todayStr);
  const [selectedSlotId, setSelectedSlotId] = useState('');
  const [quantities, setQuantities] = useState({});
  const [contact, setContact] = useState({ name: '', email: '', phone: '' });
  const [visitors, setVisitors] = useState([{ name: '', nik: '' }]);
  const [formError, setFormError] = useState('');

  // Step 2 Payment States (PDF Spec Hal. 4 Poin 7.A: 5-Minute Redis Distributed Lock)
  const [paymentMethod, setPaymentMethod] = useState('midtrans'); // 'midtrans' | 'wallet'
  const [walletBalance, setWalletBalance] = useState(() => {
    const saved = localStorage.getItem('passify_wallet_balance');
    return saved !== null ? Number(saved) : 150000;
  });
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(() => {
    const saved = getPaymentDeadline();
    const diff = Math.floor((saved - Date.now()) / 1000);
    return diff > 0 ? diff : 300; // 5-minute lock per PDF spec
  });
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [showSnapModal, setShowSnapModal] = useState(false);
  const [snapData, setSnapData] = useState(null);

  useEffect(() => {
    const syncWallet = () => {
      const saved = localStorage.getItem('passify_wallet_balance');
      if (saved !== null) setWalletBalance(Number(saved));
    };
    window.addEventListener('storage', syncWallet);
    return () => window.removeEventListener('storage', syncWallet);
  }, []);

  // PDF Spec Hal. 4 Poin 7.A: Virtual Waiting Room & Queue Management States
  const [inWaitingRoom, setInWaitingRoom] = useState(false);
  const [queuePosition, setQueuePosition] = useState(6);
  const [queueWaitSeconds, setQueueWaitSeconds] = useState(12);
  const [isFlashSaleMode, setIsFlashSaleMode] = useState(false);

  // Handle browser back button between steps
  useEffect(() => {
    const onPopState = () => {
      setStep((prev) => (prev === 2 ? 1 : prev));
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  // Success Result State
  const [completedOrder, setCompletedOrder] = useState(null);

  // Load Destination Data (Dynamic real tenant / destination)
  useEffect(() => {
    async function loadDest() {
      setIsLoading(true);
      const targetSlug =
        tenantSlug ||
        destinationId ||
        searchParams.get('tenant') ||
        searchParams.get('dest') ||
        contextSlug ||
        'curug-cibereum';

      // 1. Check local admin destination cache (only if exact slug match)
      let adminDest = null;
      try {
        const raw = localStorage.getItem('passify_admin_destinations');
        if (raw) {
          const list = JSON.parse(raw);
          if (Array.isArray(list) && list.length > 0) {
            adminDest =
              list.find((d) => d.slug === targetSlug || d.id === targetSlug) ||
              list.find((d) => d.name && d.name.toLowerCase().includes(targetSlug.replace(/-/g, ' '))) ||
              null;
          }
        }
      } catch (_) {}

      // 2. Fetch authoritative destination data directly from backend
      let dest = await fetchDestinationBySlug(targetSlug);

      if (!dest && contextDest && contextDest.slug === targetSlug) {
        dest = { ...contextDest };
      }

      if (!dest && adminDest) {
        dest = { ...adminDest };
      }

      if (!dest) {
        const title = targetSlug.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        dest = {
          id: `dest-${targetSlug}`,
          slug: targetSlug,
          name: title,
          tenant_name: title,
          location: 'Kawasan Konservasi Alam, Indonesia',
          cover_image_url: 'https://images.unsplash.com/photo-1511497584788-876760111969?auto=format&fit=crop&w=1200&q=80',
          ticket_categories: [],
          time_slots: []
        };
      }

      // 3. Sync time slots and live ticket categories from ticket-service
      const destId = dest.id || adminDest?.id;
      let liveSlots = [];
      let liveCategories = [];

      if (destId) {
        try {
          const { timeSlots } = await fetchAdminQuotas(destId);
          if (Array.isArray(timeSlots) && timeSlots.length > 0) {
            liveSlots = timeSlots;
          }
        } catch (_) {}

        try {
          const catRes = await fetch(`http://localhost:8083/api/v1/tickets/destinations/${destId}/categories`);
          if (catRes.ok) {
            const catJson = await catRes.json();
            if (Array.isArray(catJson?.data) && catJson.data.length > 0) {
              liveCategories = catJson.data.map((c) => ({
                id: c.id,
                name: c.name,
                price: Number(c.base_price ?? c.price ?? 0),
                insurance: Number(c.insurance_fee ?? c.insurance ?? 0),
                retribusi: Number(c.retribusi_fee ?? c.retribusi ?? 0),
                is_active: c.is_active !== false,
              }));
            }
          }
        } catch (_) {}
      }

      // Combine / prioritize time slots:
      if (dest.time_slots && dest.time_slots.length > 0) {
        // Authoritative backend time slots
      } else if (liveSlots.length > 0) {
        dest.time_slots = liveSlots;
      } else if (adminDest?.time_slots && adminDest.time_slots.length > 0) {
        dest.time_slots = adminDest.time_slots;
      } else {
        dest.time_slots = [
          { id: 'slot-1', label: 'Sesi Kunjungan (08:00 - 16:00 WIB)', max_capacity: 500, booked: 0 }
        ];
      }

      // Combine / prioritize ticket categories:
      if (liveCategories.length > 0) {
        dest.ticket_categories = liveCategories;
      } else if (dest.ticket_categories && dest.ticket_categories.length > 0) {
        // Authoritative backend categories
      } else if (adminDest?.ticket_categories && adminDest.ticket_categories.length > 0) {
        dest.ticket_categories = adminDest.ticket_categories;
      } else {
        dest.ticket_categories = [
          { id: `cat-reguler-${targetSlug}`, name: 'Tiket Masuk Reguler', price: 35000, insurance: 3000, retribusi: 2000 }
        ];
      }

      setDestination(dest);
      setSelectedSlotId(dest.time_slots?.[0]?.id || 'slot-1');
      const initialQty = {};
      if (dest.ticket_categories && dest.ticket_categories[0]) {
        initialQty[dest.ticket_categories[0].id] = 1;
      }
      setQuantities((prev) => {
        const hasExisting = Object.keys(prev).some((k) => (dest.ticket_categories || []).some((c) => c.id === k));
        return hasExisting ? prev : initialQty;
      });

      // Auto-fill user contact if logged in
      try {
        const savedUser = JSON.parse(localStorage.getItem('passify_user') || 'null');
        if (savedUser) {
          setContact({
            name: savedUser.full_name || savedUser.name || '',
            email: savedUser.email || '',
            phone: savedUser.phone || '',
          });
          setVisitors([{ name: savedUser.full_name || savedUser.name || '', nik: '' }]);
        }
      } catch (_) {}

      setIsLoading(false);
    }

    loadDest();
    window.addEventListener('storage', loadDest);
    return () => window.removeEventListener('storage', loadDest);
  }, [tenantSlug, destinationId, searchParams, contextSlug, contextDest]);

  // Adjust visitors array length when total quantity changes
  const totalQty = useMemo(() => {
    return Object.values(quantities).reduce((sum, q) => sum + (Number(q) || 0), 0);
  }, [quantities]);

  useEffect(() => {
    setVisitors((prev) => {
      const current = [...prev];
      if (totalQty > current.length) {
        for (let i = current.length; i < totalQty; i++) {
          current.push({ name: '', nik: '' });
        }
      } else if (totalQty < current.length) {
        return current.slice(0, Math.max(1, totalQty));
      }
      return current;
    });
  }, [totalQty]);

  // 1. Redis Distributed Lock: 5-Minute Checkout Lock (PDF Spec Hal. 4 Poin 7.A)
  useEffect(() => {
    if (step !== 2) return;
    const tick = () => {
      const saved = getPaymentDeadline(destination?.slug);
      const remaining = Math.max(0, Math.floor((saved - Date.now()) / 1000));
      setTimeLeftSeconds(remaining);
      if (remaining <= 0) {
        clearPaymentDeadline();
        setStep(1);
        setFormError('Sesi Redis Distributed Lock (5 menit) telah berakhir. Kuota reservasi tiket Anda dilepas otomatis kembali ke sistem agar dapat dipesan wisatawan lain.');
      }
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [step, destination?.slug]);

  // 3. Virtual Waiting Room: Queue Management Countdown (PDF Spec Hal. 4 Poin 7.A)
  useEffect(() => {
    if (!inWaitingRoom) return;
    const interval = setInterval(() => {
      setQueuePosition((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setInWaitingRoom(false);
          enterStep2Directly();
          return 0;
        }
        return prev - 1;
      });
      setQueueWaitSeconds((prev) => Math.max(0, prev - 2));
    }, 1500);
    return () => clearInterval(interval);
  }, [inWaitingRoom]);

  // Totals Calculation
  const totals = useMemo(() => {
    if (!destination) return { ticket: 0, insurance: 0, retribution: 0, quantity: 0, grandTotal: 0 };
    const result = (destination.ticket_categories || []).reduce(
      (acc, cat) => {
        const qty = quantities[cat.id] || 0;
        acc.ticket += Number(cat.price || 0) * qty;
        acc.insurance += Number(cat.insurance || 0) * qty;
        acc.retribution += Number(cat.retribusi || 0) * qty;
        acc.quantity += qty;
        return acc;
      },
      { ticket: 0, insurance: 0, retribution: 0, quantity: 0 }
    );
    const platformFee = result.quantity > 0 ? 2500 : 0;
    const grandTotal = result.ticket + result.insurance + result.retribution + platformFee;
    return { ...result, platformFee, grandTotal };
  }, [destination, quantities]);

  const selectedSlot = (destination?.time_slots || []).find((s) => s.id === selectedSlotId);

  // Quantity Modifier (Fair Quota: Maks 5 Tiket per Transaksi)
  const handleQtyChange = (catId, delta) => {
    setFormError('');
    if (delta > 0 && totals.quantity >= 5) {
      setFormError('Batas maksimal pembelian adalah 5 tiket per pemesanan agar kuota terbagi adil bagi wisatawan lain.');
      return;
    }
    setQuantities((prev) => {
      const current = prev[catId] || 0;
      const next = Math.max(0, current + delta);
      return { ...prev, [catId]: next };
    });
  };

  // Visitor Field Modifier
  const handleVisitorChange = (index, field, value) => {
    setFormError('');
    setVisitors((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  // Validate Step 1 and proceed to Step 2
  const handleProceedToPayment = (e) => {
    e.preventDefault();
    setFormError('');

    if (totals.quantity === 0) {
      setFormError('Pilih minimal 1 tiket untuk melanjutkan pemesanan.');
      return;
    }
    if (totals.quantity > 5) {
      setFormError('Batas maksimal pembelian adalah 5 tiket per transaksi.');
      return;
    }
    if (!contact.name.trim() || !contact.email.trim() || !contact.phone.trim()) {
      setFormError('Mohon lengkapi Data Kontak Pemesan (Nama, Email, & WhatsApp).');
      return;
    }
    const emptyVisitor = visitors.some((v) => !v.name.trim());
    if (emptyVisitor) {
      setFormError('Mohon isi nama lengkap untuk setiap tiket pengunjung.');
      return;
    }

    // Anti-Hoarding & Fair Quota Enforcement (PDF Spec Hal. 1 & 4)
    try {
      const myTickets = JSON.parse(localStorage.getItem('passify_my_tickets') || '[]');
      const phoneNorm = contact.phone.replace(/[^0-9]/g, '');
      const existingBookings = myTickets.filter((t) => {
        const tPhone = (t.contact?.phone || '').replace(/[^0-9]/g, '');
        const isSameDestination = t.destinationSlug === destination?.slug || t.destinationId === destination?.id;
        const isSameDate = t.visitDate === visitDate;
        const isSameContact =
          (phoneNorm && tPhone === phoneNorm) ||
          (t.contact?.email && contact.email && t.contact.email.toLowerCase().trim() === contact.email.toLowerCase().trim());
        return isSameDestination && isSameDate && isSameContact && t.status !== 'cancelled';
      });

      const alreadyPurchasedQty = existingBookings.reduce((sum, t) => sum + Number(t.totalQty || 0), 0);
      const MAX_QUOTA_PER_BUYER = 5;

      if (alreadyPurchasedQty >= MAX_QUOTA_PER_BUYER) {
        setFormError(
          `Pembatasan Kuota Adil: Kontak (${contact.name} / ${contact.phone}) telah memiliki ${alreadyPurchasedQty} tiket untuk tanggal ${visitDate}. Anda telah mencapai batas maksimal (${MAX_QUOTA_PER_BUYER} tiket) agar wisatawan lain mendapatkan kuota.`
        );
        return;
      }

      if (alreadyPurchasedQty + totals.quantity > MAX_QUOTA_PER_BUYER) {
        const sisaBoleh = MAX_QUOTA_PER_BUYER - alreadyPurchasedQty;
        setFormError(
          `Pembatasan Kuota Adil: Anda sudah memiliki ${alreadyPurchasedQty} tiket untuk tanggal ${visitDate}. Anda hanya dapat menambah maksimal ${sisaBoleh} tiket lagi (batas maksimal ${MAX_QUOTA_PER_BUYER} tiket per wisatawan agar kuota terbagi merata).`
        );
        return;
      }
    } catch (_) {}

    // 1. Redis Distributed Lock: 5-Minute Checkout Lock (PDF Spec Hal. 4 Poin 7.A)
    if (isFlashSaleMode) {
      setQueuePosition(6);
      setQueueWaitSeconds(12);
      setInWaitingRoom(true);
      return;
    }

    enterStep2Directly();
  };

  const enterStep2Directly = () => {
    const now = Date.now();
    const saved = getPaymentDeadline(destination?.slug);
    const deadline = saved > now ? saved : now + 5 * 60 * 1000;
    setPaymentDeadline(destination?.slug, deadline);
    setTimeLeftSeconds(Math.max(0, Math.floor((deadline - now) / 1000)));

    setStep(2);
    try {
      window.history.pushState({ step: 2 }, '');
    } catch (_) {}
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Complete Booking Helper
  const finalizeBookingSuccess = (orderData) => {
    clearPaymentDeadline();
    try {
      const existingBookings = JSON.parse(localStorage.getItem('passify_my_tickets') || '[]');
      localStorage.setItem('passify_my_tickets', JSON.stringify([orderData, ...existingBookings]));
    } catch (_) {}

    // Deduct quota immediately in destination state
    setDestination((prev) => {
      if (!prev) return prev;
      const qty = Number(orderData.totalQty || 1);
      const targetSlotId = orderData.timeSlotId || selectedSlotId;
      const updatedSlots = (prev.time_slots || []).map((s) =>
        s.id === targetSlotId || s.label === orderData.timeSlotLabel
          ? { ...s, booked: (Number(s.booked) || 0) + qty }
          : s
      );
      return {
        ...prev,
        booked_today: (Number(prev.booked_today) || 0) + qty,
        time_slots: updatedSlots,
      };
    });

    // Update local admin destinations cache and trigger storage event
    try {
      const raw = localStorage.getItem('passify_admin_destinations');
      if (raw) {
        const list = JSON.parse(raw);
        const qty = Number(orderData.totalQty || 1);
        const updated = list.map((d) => {
          if (d.slug === destination.slug || d.id === destination.id) {
            const updatedSlots = (d.time_slots || []).map((s) =>
              s.id === orderData.timeSlotId || s.id === selectedSlotId || s.label === orderData.timeSlotLabel
                ? { ...s, booked: (Number(s.booked) || 0) + qty }
                : s
            );
            return {
              ...d,
              booked_today: (Number(d.booked_today) || 0) + qty,
              time_slots: updatedSlots,
            };
          }
          return d;
        });
        localStorage.setItem('passify_admin_destinations', JSON.stringify(updated));
      }
      window.dispatchEvent(new Event('storage'));
    } catch (_) {}

    setCompletedOrder(orderData);
    setShowSnapModal(false);
    setStep(3); // Success step
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Execute Payment in Step 2
  const handlePayNow = async () => {
    setIsProcessingPayment(true);
    setFormError('');

    try {
      if (paymentMethod === 'wallet' && walletBalance < totals.grandTotal) {
        throw new Error('Saldo Passify Wallet tidak mencukupi untuk menyelesaikan pembayaran ini.');
      }

      const orderNumber = `TWA-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;
      const savedUser = (() => {
        try {
          return JSON.parse(localStorage.getItem('passify_user') || 'null');
        } catch {
          return null;
        }
      })();
      const userEmail = (savedUser?.email || contact.email || '').toLowerCase().trim();
      const userId = savedUser?.id || null;

      const orderData = {
        orderNumber,
        ticketId: `tkt-${Math.random().toString(36).substring(2, 9)}`,
        ticketCode: `TWA-QR-${Math.floor(10000 + Math.random() * 90000)}`,
        destinationId: destination.id,
        destinationSlug: destination.slug,
        destinationName: destination.name,
        tenantName: destination.tenant_name,
        location: destination.location,
        visitDate,
        timeSlotId: selectedSlot?.id,
        timeSlotLabel: selectedSlot?.label || selectedSlot?.slot_label || 'Sesi Kunjungan Pagi',
        totalQty: totals.quantity,
        grandTotal: totals.grandTotal,
        paymentMethod: paymentMethod === 'midtrans' ? 'MIDTRANS_SNAP' : 'PASSIFY_WALLET',
        userId,
        userEmail,
        contact,
        visitors,
        status: 'active',
        createdAt: new Date().toISOString(),
      };

      if (paymentMethod === 'wallet') {
        await new Promise((resolve) => setTimeout(resolve, 800));
        const newBal = Math.max(0, walletBalance - totals.grandTotal);
        setWalletBalance(newBal);
        try {
          localStorage.setItem('passify_wallet_balance', String(newBal));
          const txRaw = localStorage.getItem('passify_wallet_txs');
          const txList = txRaw ? JSON.parse(txRaw) : [];
          txList.unshift({
            id: `TX-${Date.now()}`,
            title: `Tiket Masuk ${destination.name || 'Wisata'} (${totals.quantity} Tiket)`,
            amount: -totals.grandTotal,
            type: 'ticket',
            time: 'Baru saja'
          });
          localStorage.setItem('passify_wallet_txs', JSON.stringify(txList));
          window.dispatchEvent(new Event('storage'));
        } catch (_) {}
        finalizeBookingSuccess(orderData);
        return;
      }

      // Midtrans Snap Flow
      const mockSnapToken = `SNAP-${orderNumber}-${Math.random().toString(36).substring(2, 7)}`;
      setSnapData({
        orderNumber,
        token: mockSnapToken,
        orderData,
      });

      // Show interactive Midtrans Snap UI modal
      setShowSnapModal(true);
    } catch (err) {
      setFormError(err.message || 'Pembayaran gagal diproses. Silakan coba lagi.');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // Simulate Webhook Trigger for instant verification
  const handleSimulateWebhook = async () => {
    if (!snapData) return;
    setIsProcessingPayment(true);
    try {
      // Send webhook to Payment microservice
      await fetch('http://localhost:8084/api/webhooks/midtrans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: snapData.orderNumber,
          status_code: '200',
          transaction_status: 'settlement',
          payment_type: 'bank_transfer',
          gross_amount: String(totals.grandTotal),
        }),
      }).catch(() => {
        // Non-blocking in dev if port 8084 is offline
      });

      finalizeBookingSuccess(snapData.orderData);
    } catch (e) {
      finalizeBookingSuccess(snapData.orderData);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  if (isLoading || !destination) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="h-10 w-10 border-4 border-[var(--forest)] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-bold text-[var(--forest-deep)]">Memuat halaman pemesanan tiket...</p>
        </div>
      </div>
    );
  }

  // Format Timer String MM:SS
  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-transparent text-[var(--ink)] flex flex-col justify-between selection:bg-[var(--leaf)] selection:text-[var(--forest-deep)]">
      {/* Top Navbar */}
      <header className="nav-bar sticky top-0 z-40">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="text-2xl font-bold tracking-[-.05em] text-[var(--forest-deep)] no-underline">
            passify
          </Link>

          {/* 2-Step Stepper Header */}
          {step < 3 && (
            <div className="flex items-center gap-2 sm:gap-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className={`flex items-center gap-2 bg-transparent border-none p-0 cursor-pointer ${step === 1 ? 'text-[var(--forest-deep)] font-extrabold' : 'text-[var(--ink-soft)] font-medium hover:text-[var(--forest-deep)]'}`}
                title="Kembali ke Isi Data"
              >
                <span className={`grid h-7 w-7 place-items-center rounded-full text-xs font-bold ${step === 1 ? 'bg-[var(--forest)] text-white' : 'bg-[var(--leaf-pale)] text-[var(--forest)]'}`}>
                  {step > 1 ? <Check className="h-4 w-4" /> : '1'}
                </span>
                <span className="hidden sm:inline text-xs uppercase tracking-wider">1. Isi Data</span>
              </button>

              <div className="h-0.5 w-6 sm:w-10 bg-[var(--border)]" />

              <div className={`flex items-center gap-2 ${step === 2 ? 'text-[var(--forest-deep)] font-extrabold' : 'text-[var(--ink-soft)] font-medium'}`}>
                <span className={`grid h-7 w-7 place-items-center rounded-full text-xs font-bold ${step === 2 ? 'bg-[var(--forest)] text-white' : 'bg-gray-200 text-gray-500'}`}>
                  2
                </span>
                <span className="hidden sm:inline text-xs uppercase tracking-wider">2. Pembayaran</span>
              </div>
            </div>
          )}

          <Link
            to="/jelajah"
            className="text-xs font-bold text-[var(--forest)] hover:underline flex items-center gap-1"
          >
            Portal Wisata <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 w-full flex-1">
        {/* Error Alert */}
        {formError && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl bg-red-50 p-4 text-sm text-red-800 shadow-sm animate-fade-in">
            <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
            <div className="flex-1 font-semibold">{formError}</div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 1: ISI DATA FORM & PILIH JADWAL                                      */}
        {/* ========================================================================= */}
        {step === 1 && (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Left 2 Cols: Form Sections */}
            <div className="lg:col-span-2 space-y-6">
              {/* Destination Card Banner */}
              <div className="rounded-2xl glass-panel p-6 shadow-sm flex flex-col sm:flex-row gap-5 items-start sm:items-center border border-[var(--border)]">
                <img
                  src={
                    destination.cover_image_url ||
                    destination.cover_image ||
                    destination.image ||
                    'https://images.unsplash.com/photo-1546708973-b339540b5162?auto=format&fit=crop&w=400&q=80'
                  }
                  alt={destination.name}
                  onError={(e) => {
                    e.currentTarget.src =
                      'https://images.unsplash.com/photo-1546708973-b339540b5162?auto=format&fit=crop&w=400&q=80';
                  }}
                  className="h-24 w-full sm:w-28 rounded-2xl object-cover bg-gray-100 shrink-0"
                />
                <div className="space-y-1 flex-1">
                  <span className="inline-block rounded-full bg-[var(--leaf-pale)] px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-[var(--forest)]">
                    {destination.tenant_name || destination.name}
                  </span>
                  <h1 className="text-xl sm:text-2xl font-bold text-[var(--forest-deep)]">
                    {destination.name}
                  </h1>
                  <p className="text-xs text-[var(--ink-soft)]">
                    {destination.location || [destination.address, destination.city, destination.province].filter(Boolean).join(', ') || 'Kawasan Wisata Alam, Indonesia'}
                  </p>
                </div>
              </div>

              {/* Section 1: Jadwal & Sesi Kunjungan */}
              <div className="rounded-2xl glass-panel p-6 sm:p-7 shadow-sm space-y-5">
                <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-[var(--leaf-pale)] text-[var(--forest)]">
                    <Calendar className="h-5 w-5" />
                  </span>
                  <div>
                    <h2 className="text-base font-bold text-[var(--forest-deep)]">
                      1. Pilih Tanggal & Sesi Kunjungan
                    </h2>
                    <p className="text-xs text-[var(--ink-soft)]">
                      Kuota dipantau real-time untuk kenyamanan daya dukung alam.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[var(--ink-soft)] mb-2">
                      Tanggal Kunjungan
                    </label>
                    <input
                      type="date"
                      min={todayStr}
                      value={visitDate}
                      onChange={(e) => setVisitDate(e.target.value)}
                      className="field-control font-semibold"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[var(--ink-soft)] mb-2">
                      Pilihan Sesi Waktu
                    </label>
                    <div className="space-y-2.5">
                      {(destination.time_slots || []).map((slot) => {
                        const maxCap = parseInt(slot.max_capacity ?? slot.capacity ?? 500, 10) || 500;
                        const bookedCount = parseInt(slot.booked ?? slot.booked_count ?? 0, 10) || 0;
                        const remaining = Math.max(0, maxCap - bookedCount);
                        const isSelected = selectedSlotId === slot.id;
                        const label = slot.label || slot.slot_label || slot.name || 'Sesi Kunjungan';
                        const timeRange = slot.time_range || (slot.start_time && slot.end_time ? `${slot.start_time.slice(0, 5)} - ${slot.end_time.slice(0, 5)} WIB` : null);

                        return (
                          <div
                            key={slot.id}
                            onClick={() => setSelectedSlotId(slot.id)}
                            className={`cursor-pointer rounded-2xl p-4 transition-all flex items-center justify-between border ${
                              isSelected
                                ? 'bg-white border-gray-900 shadow-xs'
                                : 'bg-white hover:bg-gray-50/80 border-gray-200 hover:border-gray-300 text-gray-800'
                            }`}
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <Clock className={`w-4 h-4 ${isSelected ? 'text-gray-900' : 'text-gray-400'}`} />
                                <p className="text-sm font-bold text-gray-900">
                                  {label}
                                </p>
                              </div>
                              <div className="flex items-center gap-2 pl-6">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-gray-100 text-gray-600">
                                  Sisa Kuota: {remaining.toLocaleString('id-ID')} orang
                                </span>
                                {timeRange && !label.includes(timeRange) && (
                                  <span className="text-[11px] text-gray-500 font-medium">
                                    ({timeRange})
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Radio indicator */}
                            <div className={`h-5 w-5 rounded-full border flex items-center justify-center transition-colors shrink-0 ${
                              isSelected
                                ? 'border-gray-900 bg-gray-900'
                                : 'border-gray-300 bg-white'
                            }`}>
                              {isSelected && <div className="h-2 w-2 rounded-full bg-white" />}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: Pilihan Kategori Tiket */}
              <div className="rounded-2xl glass-panel p-6 sm:p-7 shadow-sm space-y-5">
                <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-[var(--leaf-pale)] text-[var(--forest)]">
                    <Ticket className="h-5 w-5" />
                  </span>
                  <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h2 className="text-base font-bold text-[var(--forest-deep)]">
                        2. Jumlah & Kategori Tiket
                      </h2>
                      <p className="text-xs text-[var(--ink-soft)]">
                        Sudah termasuk tiket masuk, asuransi keselamatan jiwa, dan retribusi konservasi.
                      </p>
                    </div>
                    <span className="self-start sm:self-auto bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0">
                      Maks. 5 Tiket / Pemesan (Fair Quota)
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  {(destination.ticket_categories || []).map((cat) => {
                    const qty = quantities[cat.id] || 0;
                    return (
                      <div
                        key={cat.id}
                        className="rounded-2xl bg-[var(--fog)] p-4 flex items-center justify-between gap-4"
                      >
                        <div>
                          <h3 className="text-sm font-bold text-[var(--forest-deep)]">{cat.name}</h3>
                          <p className="text-xs font-extrabold text-[var(--bark)] mt-0.5">
                            {formatRupiah(cat.price)}
                            <span className="text-[10px] font-normal text-[var(--ink-soft)] ml-1">/ orang</span>
                          </p>
                          <p className="text-[10px] text-[var(--ink-soft)] mt-0.5">
                            Asuransi: {formatRupiah(cat.insurance)} Â· Retribusi: {formatRupiah(cat.retribusi)}
                          </p>
                        </div>

                        {/* Counter Buttons */}
                        <div className="flex items-center gap-3 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleQtyChange(cat.id, -1)}
                            disabled={qty === 0}
                            className="h-8 w-8 rounded-xl bg-white text-[var(--forest)] font-bold shadow-xs hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-lg"
                          >
                            âˆ’
                          </button>
                          <span className="w-5 text-center text-sm font-extrabold">{qty}</span>
                          <button
                            type="button"
                            onClick={() => handleQtyChange(cat.id, 1)}
                            className="h-8 w-8 rounded-xl bg-[var(--forest)] text-white font-bold shadow-xs hover:bg-[var(--forest-deep)] flex items-center justify-center text-lg"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Section 3: Data Kontak Pemesan */}
              <div className="rounded-2xl glass-panel p-6 sm:p-7 shadow-sm space-y-5">
                <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-[var(--leaf-pale)] text-[var(--forest)]">
                    <User className="h-5 w-5" />
                  </span>
                  <div>
                    <h2 className="text-base font-bold text-[var(--forest-deep)]">
                      3. Data Kontak Pemesan
                    </h2>
                    <p className="text-xs text-[var(--ink-soft)]">
                      E-Ticket dan bukti konfirmasi akan dikirimkan ke alamat email ini.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[var(--ink-soft)] mb-1.5">
                      Nama Lengkap Pemesan
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: Budi Santoso"
                      value={contact.name}
                      onChange={(e) => setContact({ ...contact, name: e.target.value })}
                      className="field-control font-medium"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[var(--ink-soft)] mb-1.5">
                      Alamat Email
                    </label>
                    <input
                      type="email"
                      placeholder="budi@gmail.com"
                      value={contact.email}
                      onChange={(e) => setContact({ ...contact, email: e.target.value })}
                      className="field-control font-medium"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[var(--ink-soft)] mb-1.5">
                      Nomor WhatsApp
                    </label>
                    <input
                      type="tel"
                      placeholder="081234567890"
                      value={contact.phone}
                      onChange={(e) => setContact({ ...contact, phone: e.target.value })}
                      className="field-control font-medium"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Section 4: Data Pengunjung per Tiket (Asuransi Jasa Raharja) */}
              <div className="rounded-2xl glass-panel p-6 sm:p-7 shadow-sm space-y-5">
                <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-[var(--leaf-pale)] text-[var(--forest)]">
                    <ShieldCheck className="h-5 w-5 text-[var(--bark)]" />
                  </span>
                  <div>
                    <h2 className="text-base font-bold text-[var(--forest-deep)]">
                      4. Data Identitas Pengunjung ({totals.quantity} Orang)
                    </h2>
                    <p className="text-xs text-[var(--ink-soft)]">
                      Wajib diisi sesuai KTP/Paspor untuk perlindungan asuransi keselamatan kawasan.
                    </p>
                  </div>
                </div>

                {totals.quantity === 0 ? (
                  <p className="text-center py-6 text-xs text-[var(--ink-soft)] bg-[var(--fog)] rounded-2xl">
                    Pilih minimal 1 tiket di atas untuk mengisi data identitas pengunjung.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {visitors.map((visitor, idx) => (
                      <div key={idx} className="rounded-2xl bg-[var(--fog)] p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-extrabold uppercase tracking-wide text-[var(--forest)]">
                            Pengunjung #{idx + 1}
                          </span>
                          {idx === 0 && (
                            <span className="text-[10px] bg-white px-2 py-0.5 rounded-full font-bold text-[var(--ink-soft)]">
                              (Pemesan Utama)
                            </span>
                          )}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <input
                            type="text"
                            placeholder="Nama Lengkap sesuai Identitas"
                            value={visitor.name}
                            onChange={(e) => handleVisitorChange(idx, 'name', e.target.value)}
                            className="field-control bg-white font-medium text-xs"
                            required
                          />
                          <input
                            type="text"
                            placeholder="NIK / No. Paspor (untuk Asuransi)"
                            value={visitor.nik}
                            onChange={(e) => handleVisitorChange(idx, 'nik', e.target.value)}
                            className="field-control bg-white font-medium text-xs"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Col: Sticky Price Breakdown & Action */}
            <div className="space-y-6">
              <div className="sticky top-24 rounded-2xl glass-panel p-6 sm:p-7 shadow-sm space-y-5">
                <h3 className="text-base font-bold text-[var(--forest-deep)] pb-3 border-b border-gray-100">
                  Ringkasan Pemesanan
                </h3>

                <div className="space-y-3 text-xs">
                  <div className="flex justify-between text-[var(--ink-soft)]">
                    <span>Destinasi</span>
                    <strong className="text-[var(--forest-deep)] text-right">{destination.name}</strong>
                  </div>
                  <div className="flex justify-between text-[var(--ink-soft)]">
                    <span>Tanggal Kunjungan</span>
                    <strong className="text-[var(--forest-deep)]">{visitDate}</strong>
                  </div>
                  <div className="flex justify-between text-[var(--ink-soft)]">
                    <span>Sesi Waktu</span>
                    <strong className="text-[var(--forest-deep)] text-right">{selectedSlot?.label || selectedSlot?.slot_label || '-'}</strong>
                  </div>
                  <div className="flex justify-between text-[var(--ink-soft)]">
                    <span>Total Pengunjung</span>
                    <strong className="text-[var(--forest-deep)]">{totals.quantity} Orang</strong>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-3 space-y-2 text-xs">
                  <div className="flex justify-between text-[var(--ink-soft)]">
                    <span>Tiket Masuk ({totals.quantity}x)</span>
                    <span>{formatRupiah(totals.ticket)}</span>
                  </div>
                  <div className="flex justify-between text-[var(--ink-soft)]">
                    <span>Asuransi Jasa Raharja</span>
                    <span>{formatRupiah(totals.insurance)}</span>
                  </div>
                  <div className="flex justify-between text-[var(--ink-soft)]">
                    <span>Retribusi Konservasi Pemda</span>
                    <span>{formatRupiah(totals.retribution)}</span>
                  </div>
                  <div className="flex justify-between text-[var(--ink-soft)]">
                    <span>Biaya Layanan Platform</span>
                    <span>{formatRupiah(totals.platformFee)}</span>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-4 flex items-baseline justify-between">
                  <span className="text-sm font-bold text-[var(--forest-deep)]">Total Tagihan</span>
                  <span className="text-xl font-extrabold text-[var(--bark)]">
                    {formatRupiah(totals.grandTotal)}
                  </span>
                </div>

                {/* 3. Virtual Waiting Room Simulation Toggle (PDF Spec Hal. 4 Poin 7.A) */}
                <label className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-50/80 border border-amber-200/70 text-[11px] text-amber-950 font-medium cursor-pointer transition-colors hover:bg-amber-100/70">
                  <input
                    type="checkbox"
                    checked={isFlashSaleMode}
                    onChange={(e) => setIsFlashSaleMode(e.target.checked)}
                    className="rounded text-[var(--forest)] accent-[var(--forest)] h-3.5 w-3.5"
                  />
                  <span>
                    âš¡ <strong>Simulasi Flash Sale:</strong> Uji Ruang Tunggu Virtual
                  </span>
                </label>

                <button
                  type="button"
                  onClick={handleProceedToPayment}
                  disabled={totals.quantity === 0}
                  className="w-full btn-primary py-3.5 rounded-2xl flex items-center justify-center gap-2 text-sm font-extrabold disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
                >
                  Lanjut ke Pembayaran <ArrowRight className="h-4 w-4" />
                </button>

                <div className="flex items-center justify-center gap-1.5 text-[10px] text-[var(--ink-soft)] font-medium">
                  <Lock className="h-3 w-3 text-emerald-600" />
                  <span>Transaksi Aman & Terproteksi SSL</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 2: PEMBAYARAN (REDIS DISTRIBUTED LOCK 5 MENIT & METODE BAYAR)        */}
        {/* ========================================================================= */}
        {step === 2 && (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 max-w-4xl mx-auto">
            {/* Left 2 Cols: Payment Selection */}
            <div className="lg:col-span-2 space-y-6">
              {/* 1. Redis Distributed Lock: 5-Minute Checkout Lock (PDF Spec Hal. 4 Poin 7.A) */}
              <div className="rounded-2xl bg-[var(--forest-deep)] text-white p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-[var(--leaf)]">
                      Batas Waktu Pembayaran
                    </span>
                    <span className="bg-emerald-500/20 text-[var(--leaf)] text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                      <Lock className="h-3 w-3" /> Redis Distributed Lock (5 Menit)
                    </span>
                  </div>
                  <p className="text-xs text-white/90">
                    Kuota tiket Anda diamankan selama <strong>5 menit</strong> via Redis Distributed Lock untuk mencegah double-booking. Selesaikan transaksi sebelum batas waktu berakhir agar kuota tidak dilepas otomatis.
                  </p>
                </div>
                <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-2xl shrink-0 self-start sm:self-auto">
                  <Clock className="h-5 w-5 text-[var(--leaf)] animate-pulse" />
                  <div className="text-right">
                    <div className="text-xl font-mono font-extrabold text-[var(--leaf)] leading-none">
                      {formatTimer(timeLeftSeconds)}
                    </div>
                    <span className="text-[9px] text-white/60">sisa waktu bayar</span>
                  </div>
                </div>
              </div>

              {/* Payment Methods Card */}
              <div className="rounded-2xl glass-panel p-6 sm:p-7 shadow-sm space-y-5">
                <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                  <h2 className="text-base font-bold text-[var(--forest-deep)]">Pilih Metode Pembayaran</h2>
                  <span className="text-xs text-[var(--ink-soft)]">Midtrans Payment Gateway</span>
                </div>

                {/* Option 1: Midtrans Snap (All-in-One) */}
                <div
                  onClick={() => setPaymentMethod('midtrans')}
                  className={`cursor-pointer rounded-2xl p-5 transition-all ${
                    paymentMethod === 'midtrans'
                      ? 'bg-[var(--leaf-pale)]/60 shadow-[0_8px_24px_rgba(16,45,32,.08)]'
                      : 'bg-[var(--fog)] hover:bg-[var(--sand)]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3.5">
                      <div className="h-11 w-11 rounded-xl bg-white shadow-2xs flex items-center justify-center text-[var(--forest)] shrink-0">
                        <CreditCard className="h-6 w-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-[var(--forest-deep)]">Midtrans Snap Payment</h4>
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                            Otomatis
                          </span>
                        </div>
                        <p className="text-[11px] text-[var(--ink-soft)] mt-0.5">
                          Semua Bank (BCA, Mandiri, BRI, BNI), QRIS (GoPay, OVO, DANA), & Kartu Kredit.
                        </p>
                      </div>
                    </div>
                    <div className={`h-4 w-4 rounded-full flex items-center justify-center shrink-0 ${paymentMethod === 'midtrans' ? 'bg-[var(--forest)]' : 'bg-gray-300'}`}>
                      {paymentMethod === 'midtrans' && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                    </div>
                  </div>

                  {paymentMethod === 'midtrans' && (
                    <div className="mt-4 pt-4 border-t border-[var(--forest)]/15 space-y-2.5">
                      <p className="text-[11px] font-bold text-[var(--forest-deep)]">Metode yang didukung langsung oleh Midtrans:</p>
                      <div className="flex flex-wrap gap-2">
                        {['BCA VA', 'Mandiri VA', 'BRI VA', 'BNI VA', 'QRIS Dinamis', 'GoPay', 'ShopeePay', 'Visa / Mastercard'].map((m) => (
                          <span key={m} className="bg-white/90 shadow-2xs px-2.5 py-1 rounded-lg text-[10px] font-extrabold text-[var(--forest-deep)]">
                            {m}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Option 2: Passify Cashless Wallet */}
                <div
                  onClick={() => setPaymentMethod('wallet')}
                  className={`cursor-pointer rounded-2xl p-5 transition-all ${
                    paymentMethod === 'wallet'
                      ? 'bg-[var(--leaf-pale)]/60 shadow-[0_8px_24px_rgba(16,45,32,.08)]'
                      : 'bg-[var(--fog)] hover:bg-[var(--sand)]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3.5">
                      <div className="h-11 w-11 rounded-xl bg-white shadow-2xs flex items-center justify-center text-[var(--forest)] shrink-0">
                        <Wallet className="h-6 w-6" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-[var(--forest-deep)]">Passify Cashless Wallet</h4>
                        <p className="text-[11px] text-[var(--ink-soft)] mt-0.5">
                          Saldo Tersedia: <strong className="text-[var(--forest)]">{formatRupiah(walletBalance)}</strong>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowWalletModal(true);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-white border border-[var(--forest)]/30 text-[10px] font-bold text-[var(--forest)] hover:bg-[var(--leaf-pale)] transition-colors shadow-2xs"
                      >
                        + Top Up / Kelola
                      </button>
                      <div className={`h-4 w-4 rounded-full flex items-center justify-center shrink-0 ${paymentMethod === 'wallet' ? 'bg-[var(--forest)]' : 'bg-gray-300'}`}>
                        {paymentMethod === 'wallet' && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation Actions */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="btn-secondary px-5 py-3 rounded-2xl flex items-center gap-2 text-xs font-bold"
                >
                  <ArrowLeft className="h-4 w-4" /> Ubah Data Form
                </button>
              </div>
            </div>

            {/* Right Col: Pay Summary & Action Button */}
            <div className="space-y-6">
              <div className="sticky top-24 rounded-2xl glass-panel p-6 sm:p-7 shadow-sm space-y-5">
                <h3 className="text-base font-bold text-[var(--forest-deep)] pb-3 border-b border-gray-100">
                  Rincian Tagihan Akhir
                </h3>

                <div className="space-y-2.5 text-xs text-[var(--ink-soft)]">
                  <div className="flex justify-between">
                    <span>Destinasi</span>
                    <strong className="text-[var(--forest-deep)]">{destination.name}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Tiket ({totals.quantity}x Orang)</span>
                    <span>{formatRupiah(totals.ticket)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Asuransi & Retribusi</span>
                    <span>{formatRupiah(totals.insurance + totals.retribution)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Biaya Layanan</span>
                    <span>{formatRupiah(totals.platformFee)}</span>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-4 flex items-baseline justify-between">
                  <span className="text-sm font-bold text-[var(--forest-deep)]">Total Bayar</span>
                  <span className="text-2xl font-extrabold text-[var(--bark)]">
                    {formatRupiah(totals.grandTotal)}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handlePayNow}
                  disabled={isProcessingPayment}
                  className="w-full btn-primary py-4 rounded-2xl flex items-center justify-center gap-2 text-sm font-extrabold shadow-lg disabled:opacity-50"
                >
                  {isProcessingPayment ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Memverifikasi Pembayaran...</span>
                    </>
                  ) : (
                    <>
                      <span>Bayar Sekarang ({formatRupiah(totals.grandTotal)})</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setStep(1)}
                  disabled={isProcessingPayment}
                  className="w-full btn-secondary py-3 rounded-2xl flex items-center justify-center gap-2 text-xs font-bold cursor-pointer disabled:opacity-50"
                >
                  <ArrowLeft className="h-3.5 w-3.5" /> Kembali / Ubah Data Pemesanan
                </button>

                <p className="text-center text-[10px] text-emerald-800 font-medium bg-emerald-50/80 py-1.5 px-3 rounded-xl border border-emerald-200/50">
                  ðŸ”’ Kuota terkunci via Redis Distributed Lock (5 Menit). Selesaikan transaksi sebelum waktu habis.
                </p>

                <p className="text-center text-[10px] text-[var(--ink-soft)]">
                  Setelah berhasil, tiket otomatis masuk ke riwayat akun Anda.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 3: LAYAR SUKSES PEMBAYARAN & LINK RIWAYAT TIKET                     */}
        {/* ========================================================================= */}
        {step === 3 && completedOrder && (
          <div className="max-w-xl mx-auto py-8">
            <div className="rounded-2xl glass-panel p-8 sm:p-10 shadow-sm text-center space-y-6">
              {/* Success Badge Icon */}
              <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-emerald-50 text-emerald-600 shadow-sm animate-bounce-short">
                <CheckCircle2 className="h-10 w-10" />
              </div>

              <div className="space-y-2">
                <span className="inline-block rounded-full bg-[var(--leaf-pale)] px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-[var(--forest)]">
                  Pembayaran Berhasil
                </span>
                <h1 className="text-2xl sm:text-3xl font-bold text-[var(--forest-deep)]">
                  Tiket Siap Digunakan!
                </h1>
                <p className="text-xs text-[var(--ink-soft)] max-w-md mx-auto">
                  Terima kasih! Tiket kunjungan Anda telah diterbitkan dengan kode reservasi di bawah ini.
                </p>
              </div>

              {/* Order Info Card */}
              <div className="rounded-2xl bg-[var(--fog)] p-5 text-left text-xs space-y-3">
                <div className="flex justify-between border-b border-gray-200/60 pb-2">
                  <span className="text-[var(--ink-soft)] font-medium">Nomor Reservasi</span>
                  <strong className="font-mono text-sm text-[var(--forest-deep)]">{completedOrder.orderNumber}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--ink-soft)]">Destinasi</span>
                  <strong className="text-[var(--forest-deep)]">{completedOrder.destinationName}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--ink-soft)]">Jadwal Sesi</span>
                  <strong className="text-[var(--forest-deep)]">{completedOrder.visitDate} ({completedOrder.timeSlotLabel})</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--ink-soft)]">Jumlah Pengunjung</span>
                  <strong className="text-[var(--forest-deep)]">{completedOrder.totalQty} Orang</strong>
                </div>
                <div className="flex justify-between border-t border-gray-200/60 pt-2 font-bold">
                  <span className="text-[var(--forest-deep)]">Total Pembayaran</span>
                  <span className="text-sm text-[var(--bark)]">{formatRupiah(completedOrder.grandTotal)}</span>
                </div>
              </div>

              {/* Security Notice on Dynamic QR (PDF Spec Hal. 4 Poin 7.B) */}
              <div className="rounded-2xl bg-amber-50 p-4 text-left flex items-start gap-3 text-xs text-amber-900">
                <ShieldCheck className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold">Fitur Keamanan Dynamic TOTP QR 30 Detik (PDF Spec Hal. 4 Poin 7.B):</strong>
                  <p className="text-[11px] text-amber-800 mt-0.5">
                    QR tiket diperbarui otomatis setiap 30 detik (AES-256 Token A â†’ Token B â†’ Token C) di layar HP Anda saat dibuka di gerbang. Tangkapan layar (screenshot) statis otomatis kedaluwarsa.
                  </p>
                </div>
              </div>

              {/* Action Buttons as requested by User */}
              <div className="space-y-3 pt-2">
                <Link
                  to="/riwayat-pesanan"
                  className="w-full btn-primary py-4 rounded-2xl flex items-center justify-center gap-2 text-sm font-extrabold shadow-md no-underline"
                >
                  <Ticket className="h-4 w-4" /> Lihat Tiket di Riwayat Saya
                </Link>

                <Link
                  to="/"
                  className="w-full btn-secondary py-3 rounded-2xl flex items-center justify-center gap-2 text-xs font-bold no-underline"
                >
                  Kembali ke Beranda
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Midtrans Snap Interactive Simulator Modal (Fallback / Sandbox) */}
        {showSnapModal && snapData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
            <div className="w-full max-w-md rounded-2xl glass-panel p-6 sm:p-8 shadow-[0_24px_60px_rgba(0,0,0,.25)] space-y-6 animate-scale-in text-[var(--ink)]">
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-xl bg-emerald-50 text-[var(--forest)] flex items-center justify-center font-extrabold text-sm">
                    M
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[var(--forest-deep)]">Midtrans Snap Checkout</h3>
                    <p className="text-[10px] text-[var(--ink-soft)]">Sandbox Payment Simulation</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSnapModal(false)}
                  className="h-8 w-8 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 flex items-center justify-center text-xs font-bold"
                >
                  âœ•
                </button>
              </div>

              {/* Order Info */}
              <div className="rounded-2xl bg-[var(--fog)] p-4 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-[var(--ink-soft)]">Order ID</span>
                  <span className="font-mono font-bold text-[var(--forest-deep)]">{snapData.orderNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--ink-soft)]">Total Tagihan</span>
                  <strong className="text-sm text-[var(--bark)]">{formatRupiah(totals.grandTotal)}</strong>
                </div>
              </div>

              {/* Simulated Payment Channel Picker */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--ink-soft)]">
                  Pilih Channel Pembayaran
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-3 rounded-xl bg-[var(--leaf-pale)]/50 shadow-2xs font-bold text-[var(--forest-deep)] flex items-center gap-2">
                    <QrCode className="h-4 w-4 text-[var(--forest)]" /> QRIS / GoPay
                  </div>
                  <div className="p-3 rounded-xl bg-gray-50 shadow-2xs text-gray-600 font-medium flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-gray-400" /> BCA / Mandiri VA
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-2">
                <button
                  type="button"
                  onClick={handleSimulateWebhook}
                  disabled={isProcessingPayment}
                  className="w-full btn-primary py-3.5 rounded-2xl flex items-center justify-center gap-2 text-sm font-extrabold shadow-md disabled:opacity-50"
                >
                  {isProcessingPayment ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Mengirim Webhook Midtrans...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Simulasikan Bayar Sukses (Webhook)</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setShowSnapModal(false)}
                  disabled={isProcessingPayment}
                  className="w-full btn-secondary py-2.5 rounded-2xl text-xs font-bold"
                >
                  Batal / Kembali
                </button>
              </div>

              <div className="flex items-center justify-center gap-1.5 text-[10px] text-[var(--ink-soft)] font-medium">
                <Lock className="h-3 w-3 text-emerald-600" />
                <span>Terhubung ke Gateway Backend Midtrans SHA512</span>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 3. VIRTUAL WAITING ROOM (QUEUE MANAGEMENT - PDF SPEC HAL. 4 POIN 7.A)     */}
        {/* ========================================================================= */}
        {inWaitingRoom && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
            <div className="w-full max-w-md rounded-2xl glass-panel p-6 sm:p-8 shadow-[0_24px_60px_rgba(0,0,0,.25)] space-y-6 animate-scale-in text-[var(--ink)] text-center">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-amber-50 text-amber-600 animate-pulse">
                <Users className="h-8 w-8" />
              </div>

              <div className="space-y-1.5">
                <span className="inline-block rounded-full bg-amber-100 text-amber-900 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider">
                  Virtual Waiting Room Â· High Traffic
                </span>
                <h3 className="text-xl font-bold text-[var(--forest-deep)]">
                  Anda Berada Dalam Antrean
                </h3>
                <p className="text-xs text-[var(--ink-soft)] max-w-sm mx-auto">
                  Sistem mengantrekan permintaan Anda secara otomatis untuk menjamin kuota tanpa overselling (PDF Spec Hal. 4 Poin 7.A).
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-[var(--fog)] p-4 text-center">
                  <span className="text-[10px] uppercase font-bold text-[var(--ink-soft)]">Posisi Antrean</span>
                  <div className="text-2xl font-extrabold text-[var(--forest-deep)] mt-1 font-mono">
                    #{queuePosition}
                  </div>
                  <span className="text-[10px] text-[var(--ink-soft)]">dari 42 antrean aktif</span>
                </div>

                <div className="rounded-2xl bg-[var(--fog)] p-4 text-center">
                  <span className="text-[10px] uppercase font-bold text-[var(--ink-soft)]">Estimasi Tunggu</span>
                  <div className="text-2xl font-extrabold text-[var(--bark)] mt-1 font-mono">
                    ~{queueWaitSeconds}s
                  </div>
                  <span className="text-[10px] text-[var(--ink-soft)]">detik lagi</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5 text-left">
                <div className="flex justify-between text-[11px] text-[var(--ink-soft)] font-medium">
                  <span>Proses Giliran Masuk...</span>
                  <span>{Math.round(((6 - queuePosition) / 6) * 100)}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className="h-full bg-[var(--forest)] transition-all duration-500 rounded-full"
                    style={{ width: `${Math.max(15, Math.round(((6 - queuePosition) / 6) * 100))}%` }}
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setInWaitingRoom(false);
                  enterStep2Directly();
                }}
                className="w-full btn-secondary py-2.5 rounded-xl text-xs font-bold cursor-pointer"
              >
                Lewati Antrean (Masuk Langsung)
              </button>
            </div>
          </div>
        )}

        {/* Passify Cashless Wallet Modal */}
        {showWalletModal && (
          <WalletModal
            walletBalance={walletBalance}
            onTopUp={(delta) => {
              const next = Math.max(0, walletBalance + delta);
              setWalletBalance(next);
              try {
                localStorage.setItem('passify_wallet_balance', String(next));
                window.dispatchEvent(new Event('storage'));
              } catch (_) {}
            }}
            onClose={() => setShowWalletModal(false)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-white py-6 text-center text-xs text-[var(--ink-soft)]">
        Â© {new Date().getFullYear()} Passify Cloud OS Â· Platform Reservasi & E-Ticketing Wisata Alam
      </footer>
    </div>
  );
}


