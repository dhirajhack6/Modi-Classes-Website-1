import React, { useState, useEffect, useRef } from 'react';
import { 
  QrCode, 
  Smartphone, 
  CheckCircle2, 
  ArrowLeft, 
  Copy, 
  Check, 
  RefreshCw, 
  ShieldCheck, 
  AlertCircle, 
  ExternalLink, 
  Lock, 
  Timer,
  Sparkles
} from 'lucide-react';
import { 
  getPaymentConfig, 
  initiatePayment,
  verifyPayment, 
  buildUpiUri, 
  getUpiQrImageUrl,
  PaymentConfig 
} from '../../services/paymentService';

interface UpiPaymentSectionProps {
  amount: number;
  orderNumber?: string;
  gatewayOrderId?: string;
  paymentUrl?: string | null;
  qrData?: string | null;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  onBackToAddress: () => void;
  onPaymentComplete: (verifiedData: any) => void;
}

type UpiSubMode = 'phonepe_direct' | 'qr_code' | 'upi_id';

export const UpiPaymentSection: React.FC<UpiPaymentSectionProps> = ({
  amount,
  orderNumber,
  gatewayOrderId: initialGatewayOrderId,
  paymentUrl: initialPaymentUrl,
  qrData: initialQrData,
  customerName,
  customerPhone,
  customerEmail,
  onBackToAddress,
  onPaymentComplete
}) => {
  const [config, setConfig] = useState<PaymentConfig | null>(null);
  const [selectedMode, setSelectedMode] = useState<UpiSubMode>('phonepe_direct');
  
  // Transaction & QR State
  const [merchantTxnId, setMerchantTxnId] = useState<string>(() => initialGatewayOrderId || `MCR_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`);
  const [phonePeUrl, setPhonePeUrl] = useState<string | null>(initialPaymentUrl || null);
  const [qrCodeData, setQrCodeData] = useState<string>(initialQrData || '');
  
  // Status & Polling
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [pollCount, setPollCount] = useState<number>(0);
  const [countdown, setCountdown] = useState<number>(300); // 5 minutes validity
  const [copiedVpa, setCopiedVpa] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // UPI ID collect state
  const [upiIdInput, setUpiIdInput] = useState<string>('');
  const [collectRequested, setCollectRequested] = useState<boolean>(false);
  
  // Manual UTR input state
  const [showUtrField, setShowUtrField] = useState<boolean>(false);
  const [utrInput, setUtrInput] = useState<string>('');

  const pollingRef = useRef<any>(null);

  // 1. Fetch payment configuration
  useEffect(() => {
    let mounted = true;
    getPaymentConfig().then((cfg) => {
      if (mounted) {
        setConfig(cfg);
        const upiString = buildUpiUri({
          vpa: cfg.merchantUpiVpa,
          name: cfg.merchantName,
          amount,
          txnId: merchantTxnId,
          note: `Modi Classes Book - ${customerName.split(' ')[0]}`
        });
        setQrCodeData(upiString);
      }
    });
    return () => {
      mounted = false;
    };
  }, [amount, customerName, merchantTxnId]);

  // 2. Countdown timer for QR / Session
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          // Reset timer and refresh txn ID
          const newTxnId = `MCR_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
          setMerchantTxnId(newTxnId);
          return 300;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // 3. Initiate payment when phonepe_direct is selected
  const handleInitiatePhonePe = async () => {
    setIsProcessing(true);
    setErrorMsg(null);

    try {
      const res = await initiatePayment({
        amount,
        customerName,
        customerPhone,
        customerEmail
      });

      if (res.merchantTransactionId) {
        setMerchantTxnId(res.merchantTransactionId);
      }

      if (res.paymentUrl) {
        setPhonePeUrl(res.paymentUrl);
        // Start background status polling
        startPolling(res.merchantTransactionId);
        // Open PhonePe checkout URL in new tab / redirect
        window.open(res.paymentUrl, '_blank', 'noopener,noreferrer');
      } else if (res.qrData) {
        setQrCodeData(res.qrData);
        setSelectedMode('qr_code');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to initiate PhonePe payment. Please scan UPI QR below.');
      setSelectedMode('qr_code');
    } finally {
      setIsProcessing(false);
    }
  };

  // Start polling for transaction status
  const startPolling = (txnId: string) => {
    if (pollingRef.current) clearInterval(pollingRef.current);
    
    let attempts = 0;
    pollingRef.current = setInterval(async () => {
      attempts++;
      setPollCount(attempts);

      if (attempts > 60) { // 3 minutes maximum polling
        clearInterval(pollingRef.current);
        return;
      }

      try {
        const res = await verifyPayment({
          orderNumber,
          gatewayOrderId: txnId,
          paymentId: txnId
        });
        if (res.verified && res.status === 'PAID') {
          clearInterval(pollingRef.current);
          onPaymentComplete(res);
        }
      } catch (e) {
        // Silently continue polling
      }
    }, 3500);
  };

  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  // Handle Server-Side Payment Verification
  const handleConfirmPaid = async () => {
    setIsVerifying(true);
    setErrorMsg(null);

    try {
      const res = await verifyPayment({
        orderNumber,
        gatewayOrderId: merchantTxnId,
        paymentId: utrInput.trim() || merchantTxnId
      });

      if (res.verified && res.status === 'PAID') {
        onPaymentComplete(res);
      } else {
        setErrorMsg(res.message || 'Payment verification in progress. Please check again in a few moments.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Could not verify payment with bank.');
    } finally {
      setIsVerifying(false);
    }
  };

  // Handle UPI ID Collect Request
  const handleSendUpiCollect = () => {
    if (!upiIdInput || !upiIdInput.includes('@')) {
      setErrorMsg('Please enter a valid UPI ID (e.g. name@okhdfcbank, mobile@ybl)');
      return;
    }

    setErrorMsg(null);
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      setCollectRequested(true);
      startPolling(merchantTxnId);
    }, 1200);
  };

  const handleCopyVpa = () => {
    const vpa = config?.merchantUpiVpa || 'modiclasses@okhdfcbank';
    navigator.clipboard.writeText(vpa);
    setCopiedVpa(true);
    setTimeout(() => setCopiedVpa(false), 2000);
  };

  const minutes = Math.floor(countdown / 60);
  const seconds = countdown % 60;
  const timerDisplay = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  const currentVpa = config?.merchantUpiVpa || 'modiclasses@okhdfcbank';
  const currentQrUrl = qrCodeData ? getUpiQrImageUrl(qrCodeData, 220) : '';

  return (
    <div className="space-y-5">
      {/* Top Header with Back Button and Total */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <button
          onClick={onBackToAddress}
          type="button"
          className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 cursor-pointer py-1 px-2 -ml-2 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Address</span>
        </button>

        <div className="text-right">
          <span className="text-xs text-slate-500 font-medium">Payable Amount:</span>
          <span className="text-lg font-black text-slate-950 ml-1.5 font-mono">
            ₹{amount}
          </span>
        </div>
      </div>

      {/* UPI Notice Banner */}
      <div className="bg-purple-50 border border-purple-200/70 rounded-2xl p-3.5 flex items-start gap-3 text-xs text-purple-950 shadow-xs">
        <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-sm">
          <Sparkles className="w-4 h-4" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-purple-950">100% UPI & PhonePe Payment</h4>
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
              Zero Extra Fee
            </span>
          </div>
          <p className="text-purple-800 text-[11px] mt-0.5 leading-relaxed">
            Fast, secure checkout via PhonePe, Google Pay, Paytm, or any BHIM UPI app with instant order confirmation.
          </p>
        </div>
      </div>

      {/* UPI Sub-Mode Selection Tabs */}
      <div className="grid grid-cols-3 gap-2 text-xs">
        <button
          type="button"
          onClick={() => {
            setSelectedMode('phonepe_direct');
            setErrorMsg(null);
          }}
          className={`p-3 rounded-xl border flex flex-col items-center text-center gap-1.5 cursor-pointer transition-all ${
            selectedMode === 'phonepe_direct'
              ? 'border-purple-600 bg-purple-50/70 text-purple-950 font-bold ring-2 ring-purple-400 shadow-sm'
              : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
          }`}
        >
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${selectedMode === 'phonepe_direct' ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
            <Smartphone className="w-4 h-4" />
          </div>
          <span className="leading-tight font-semibold">PhonePe Pay</span>
          <span className="text-[10px] text-purple-700 font-medium">Instant Gateway</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setSelectedMode('qr_code');
            setErrorMsg(null);
          }}
          className={`p-3 rounded-xl border flex flex-col items-center text-center gap-1.5 cursor-pointer transition-all ${
            selectedMode === 'qr_code'
              ? 'border-purple-600 bg-purple-50/70 text-purple-950 font-bold ring-2 ring-purple-400 shadow-sm'
              : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
          }`}
        >
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${selectedMode === 'qr_code' ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
            <QrCode className="w-4 h-4" />
          </div>
          <span className="leading-tight font-semibold">Scan UPI QR</span>
          <span className="text-[10px] text-slate-500 font-medium">Any UPI App</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setSelectedMode('upi_id');
            setErrorMsg(null);
          }}
          className={`p-3 rounded-xl border flex flex-col items-center text-center gap-1.5 cursor-pointer transition-all ${
            selectedMode === 'upi_id'
              ? 'border-purple-600 bg-purple-50/70 text-purple-950 font-bold ring-2 ring-purple-400 shadow-sm'
              : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
          }`}
        >
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${selectedMode === 'upi_id' ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
            <Lock className="w-4 h-4" />
          </div>
          <span className="leading-tight font-semibold">Enter UPI ID</span>
          <span className="text-[10px] text-slate-500 font-medium">Collect Request</span>
        </button>
      </div>

      {/* Error notification if any */}
      {errorMsg && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* MODE 1: PhonePe Direct Gateway */}
      {selectedMode === 'phonepe_direct' && (
        <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-950 via-slate-900 to-purple-900 text-white text-center space-y-4 shadow-lg border border-purple-800/40">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-200 text-[11px] font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Official PhonePe PG Integration</span>
            </div>
            <h3 className="text-base sm:text-lg font-black tracking-tight text-white pt-1">
              Pay ₹{amount} with PhonePe Gateway
            </h3>
            <p className="text-xs text-slate-300 max-w-sm mx-auto">
              Click below to proceed to PhonePe's secure checkout. Pay using PhonePe wallet, UPI, or saved payment instruments.
            </p>
          </div>

          <div className="py-2">
            <button
              type="button"
              onClick={handleInitiatePhonePe}
              disabled={isProcessing}
              className="w-full py-4 px-6 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-sm shadow-xl shadow-purple-900/40 transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-[0.99]"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Connecting to PhonePe...</span>
                </>
              ) : (
                <>
                  <ExternalLink className="w-4 h-4" />
                  <span>Proceed to PhonePe Pay (₹{amount})</span>
                </>
              )}
            </button>
          </div>

          {phonePeUrl && (
            <div className="p-3 bg-purple-900/50 border border-purple-700/50 rounded-xl text-xs text-purple-200 space-y-2">
              <p>PhonePe window opened. Waiting for payment confirmation...</p>
              <button
                type="button"
                onClick={handleConfirmPaid}
                disabled={isVerifying}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs transition-colors cursor-pointer"
              >
                {isVerifying ? 'Verifying with Bank...' : 'I Completed Payment in PhonePe'}
              </button>
            </div>
          )}

          {/* Quick Fallback action */}
          <div className="pt-1 border-t border-purple-900/60 flex items-center justify-center gap-4 text-[11px] text-purple-300">
            <span className="flex items-center gap-1">
              <Lock className="w-3 h-3 text-emerald-400" />
              256-Bit SSL Encrypted
            </span>
            <span>•</span>
            <button
              type="button"
              onClick={() => setSelectedMode('qr_code')}
              className="underline hover:text-white cursor-pointer"
            >
              Prefer scanning QR instead?
            </button>
          </div>
        </div>
      )}

      {/* MODE 2: Dynamic UPI QR Code */}
      {selectedMode === 'qr_code' && (
        <div className="p-5 rounded-2xl bg-slate-900 text-white text-center space-y-4 shadow-lg border border-slate-800">
          <div className="flex items-center justify-between text-xs px-2">
            <span className="text-slate-400 font-medium">Scan with PhonePe, GPay, Paytm</span>
            <span className="flex items-center gap-1 text-amber-400 font-mono font-bold bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-800/50">
              <Timer className="w-3 h-3" />
              {timerDisplay}
            </span>
          </div>

          {/* QR Code Container */}
          <div className="inline-block p-3.5 bg-white rounded-2xl shadow-2xl relative group">
            {currentQrUrl ? (
              <img
                src={currentQrUrl}
                alt="PhonePe UPI QR Code"
                className="w-48 h-48 sm:w-52 sm:h-52 mx-auto rounded-lg"
              />
            ) : (
              <div className="w-48 h-48 flex items-center justify-center">
                <RefreshCw className="w-6 h-6 animate-spin text-slate-400" />
              </div>
            )}
            
            <div className="mt-2 text-slate-900 font-black text-xs font-mono">
              ₹{amount}.00
            </div>
          </div>

          {/* Merchant VPA & Copy Button */}
          <div className="flex items-center justify-center gap-2 text-xs">
            <span className="text-slate-400 font-mono">UPI ID:</span>
            <span className="font-mono font-semibold text-slate-200 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700">
              {currentVpa}
            </span>
            <button
              type="button"
              onClick={handleCopyVpa}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg border border-slate-700 cursor-pointer transition-colors"
              title="Copy UPI ID"
            >
              {copiedVpa ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Quick Direct UPI App Links on Mobile */}
          <div className="pt-2">
            <span className="text-[11px] text-slate-400 block mb-2 font-medium">Or pay directly using your installed app:</span>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <a
                href={qrCodeData}
                className="py-2.5 px-3 bg-purple-950/80 hover:bg-purple-900 border border-purple-800 text-purple-200 rounded-xl font-bold text-center block transition-all"
              >
                PhonePe
              </a>
              <a
                href={qrCodeData}
                className="py-2.5 px-3 bg-blue-950/80 hover:bg-blue-900 border border-blue-800 text-blue-200 rounded-xl font-bold text-center block transition-all"
              >
                Google Pay
              </a>
              <a
                href={qrCodeData}
                className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-xl font-bold text-center block transition-all"
              >
                Paytm / BHIM
              </a>
            </div>
          </div>

          {/* Confirmation button */}
          <div className="pt-2 space-y-2">
            <button
              type="button"
              onClick={handleConfirmPaid}
              disabled={isVerifying}
              className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-md transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isVerifying ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Verifying Payment...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>I Have Completed Payment of ₹{amount}</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setShowUtrField(!showUtrField)}
              className="text-[11px] text-slate-400 hover:text-slate-300 underline cursor-pointer"
            >
              {showUtrField ? 'Hide 12-digit UTR Input' : 'Have a 12-digit UTR / Reference number?'}
            </button>

            {showUtrField && (
              <div className="flex gap-2 pt-1">
                <input
                  type="text"
                  placeholder="Enter 12-digit UPI UTR (optional)"
                  value={utrInput}
                  onChange={(e) => setUtrInput(e.target.value.replace(/[^0-9]/g, '').slice(0, 12))}
                  className="flex-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-mono placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
                />
                <button
                  type="button"
                  onClick={handleConfirmPaid}
                  disabled={isVerifying}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl cursor-pointer"
                >
                  Verify
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODE 3: UPI ID / Collect Request */}
      {selectedMode === 'upi_id' && (
        <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-4 text-xs shadow-sm">
          <div>
            <label className="block font-bold text-slate-800 mb-1">
              Enter Your Virtual Payment Address (VPA / UPI ID)
            </label>
            <p className="text-[11px] text-slate-500 mb-2">
              A collect request of ₹{amount} will be sent to your UPI app for one-click approval.
            </p>
            <div className="relative">
              <input
                type="text"
                placeholder="e.g. mobileNumber@ybl, name@okhdfcbank"
                value={upiIdInput}
                onChange={(e) => setUpiIdInput(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50/50 text-slate-900 font-mono text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-500"
              />
            </div>
          </div>

          {/* Quick handle pills */}
          <div>
            <span className="text-[11px] text-slate-500 block mb-1.5 font-medium">Quick Handle Select:</span>
            <div className="flex flex-wrap gap-1.5">
              {['@ybl', '@okhdfcbank', '@okaxis', '@paytm', '@ibl', '@postbank'].map((handle) => (
                <button
                  key={handle}
                  type="button"
                  onClick={() => {
                    const prefix = upiIdInput.split('@')[0] || customerPhone || '';
                    setUpiIdInput(`${prefix}${handle}`);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-purple-100 hover:text-purple-900 border border-slate-200 text-[11px] font-mono text-slate-700 cursor-pointer transition-colors"
                >
                  {handle}
                </button>
              ))}
            </div>
          </div>

          {collectRequested ? (
            <div className="p-4 rounded-xl bg-purple-50 border border-purple-200 text-center space-y-2 animate-fade-in">
              <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center mx-auto">
                <RefreshCw className="w-4 h-4 animate-spin" />
              </div>
              <h4 className="font-bold text-purple-950 text-sm">Payment Request Sent!</h4>
              <p className="text-purple-800 text-xs">
                Please open your UPI app ({upiIdInput}) and approve the request of <strong>₹{amount}</strong>.
              </p>
              <button
                type="button"
                onClick={handleConfirmPaid}
                disabled={isVerifying}
                className="mt-2 w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm cursor-pointer transition-colors"
              >
                {isVerifying ? 'Verifying...' : 'I have approved the payment'}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleSendUpiCollect}
              disabled={isProcessing || !upiIdInput}
              className="w-full py-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs shadow-md transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Requesting...</span>
                </>
              ) : (
                <>
                  <span>Request Payment of ₹{amount}</span>
                </>
              )}
            </button>
          )}
        </div>
      )}

      {/* Security Footer */}
      <div className="pt-2 text-center">
        <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>NPCI Unified Payments Interface • End-to-End Encrypted & Verified</span>
        </p>
      </div>
    </div>
  );
};
