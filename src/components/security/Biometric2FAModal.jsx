import React, { useState, useEffect } from 'react';
import { Fingerprint, Scan, KeyRound, ShieldCheck, X, Check, ArrowRight, RefreshCw } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function Biometric2FAModal() {
  const { isBioModalOpen, setIsBioModalOpen, logAudit, role, t } = useApp();
  const [step, setStep] = useState('biometric'); // biometric, otp, success
  const [isScanning, setIsScanning] = useState(false);
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(30);

  useEffect(() => {
    let timer;
    if (isBioModalOpen && countdown > 0) {
      timer = setInterval(() => setCountdown(c => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [isBioModalOpen, countdown]);

  if (!isBioModalOpen) return null;

  const handleSimulateBiometric = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setStep('success');
      logAudit("BIOMETRIC_AUTH_VERIFIED", `TouchID/FaceID hardware biometric token verified for role [${role}]`, "SUCCESS");
      setTimeout(() => {
        setIsBioModalOpen(false);
        setStep('biometric');
      }, 1400);
    }, 1800);
  };

  const handleOtpChange = (idx, val) => {
    if (val.length > 1) val = val[0];
    const updated = [...otpCode];
    updated[idx] = val;
    setOtpCode(updated);

    // Auto focus next input
    if (val && idx < 5) {
      const nextInput = document.getElementById(`otp-${idx + 1}`);
      nextInput?.focus();
    }
    
    // Auto submit if complete
    if (updated.every(c => c !== '')) {
      setStep('success');
      logAudit("TOTP_TOKEN_VERIFIED", `Hardware TOTP Authenticator confirmed for ${role}`, "SUCCESS");
      setTimeout(() => {
        setIsBioModalOpen(false);
        setStep('biometric');
        setOtpCode(['', '', '', '', '', '']);
      }, 1400);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 dark:bg-black/75 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-2xl shadow-2xl p-6 overflow-hidden transition-colors">
        
        {/* Glow ambient accent */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-brand-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-violet-500/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-brand-500/10 dark:bg-brand-500/20 border border-brand-500/20 rounded-xl text-brand-600 dark:text-cyan-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-base">
                FIPS 140-3 Hardware Authentication
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Dual-custody biometric authorization</p>
            </div>
          </div>
          <button 
            onClick={() => setIsBioModalOpen(false)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Biometric Scan Mode */}
        {step === 'biometric' && (
          <div className="py-8 flex flex-col items-center text-center">
            <div 
              onClick={handleSimulateBiometric}
              className={`relative cursor-pointer group w-32 h-32 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                isScanning
                  ? 'border-brand-500 bg-brand-500/15 shadow-lg shadow-brand-500/25'
                  : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 hover:border-brand-500/60 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {/* Radar pulse rings when scanning */}
              {isScanning && (
                <>
                  <span className="absolute inset-0 rounded-full border border-brand-500 animate-ping opacity-75"></span>
                  <span className="absolute -inset-3 rounded-full border border-brand-500/40 animate-pulse"></span>
                </>
              )}

              <Fingerprint className={`w-16 h-16 transition-colors duration-300 ${
                isScanning ? 'text-brand-600 dark:text-cyan-300 animate-pulse' : 'text-slate-400 group-hover:text-brand-600 dark:group-hover:text-cyan-400'
              }`} />
            </div>

            <p className="mt-5 text-sm font-semibold text-slate-800 dark:text-slate-200">
              {isScanning ? "Scanning Secure Enclave..." : "Touch Fingerprint Sensor or Click to Scan"}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs">
              Matches macOS TouchID / WebAuthn FIDO2 token registered to <span className="text-brand-600 dark:text-cyan-400 font-mono font-medium">KA-BLR-OFFICER</span>
            </p>

            <button
              onClick={handleSimulateBiometric}
              disabled={isScanning}
              className="mt-6 px-6 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-semibold tracking-wider uppercase transition-all shadow-md shadow-brand-500/20 disabled:opacity-50"
            >
              {isScanning ? "Verifying Signature..." : "Scan Biometric Now"}
            </button>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 w-full flex justify-center">
              <button
                onClick={() => setStep('otp')}
                className="text-xs text-slate-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-cyan-400 flex items-center gap-1.5 transition-colors font-medium"
              >
                <KeyRound className="w-3.5 h-3.5" />
                Use 6-Digit Authenticator TOTP Fallback
              </button>
            </div>
          </div>
        )}

        {/* Modal Body: TOTP Fallback Mode */}
        {step === 'otp' && (
          <div className="py-6 flex flex-col items-center text-center">
            <div className="p-3 bg-violet-500/10 border border-violet-500/20 rounded-2xl text-violet-600 dark:text-purple-400 mb-3">
              <KeyRound className="w-8 h-8" />
            </div>
            
            <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Enter Hardware Authenticator Code</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Open Google Authenticator / YubiKey Authenticator</p>

            <div className="flex gap-2.5 my-6">
              {otpCode.map((val, idx) => (
                <input
                  key={idx}
                  id={`otp-${idx}`}
                  type="text"
                  maxLength={1}
                  value={val}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  className="w-11 h-12 text-center text-lg font-mono font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 rounded-xl text-slate-900 dark:text-slate-100 outline-none transition-all"
                />
              ))}
            </div>

            <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-slate-400" />
              <span>Token expires in <span className="font-mono text-brand-600 dark:text-cyan-400 font-bold">{countdown}s</span></span>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 w-full flex justify-between items-center text-xs">
              <button
                onClick={() => setStep('biometric')}
                className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 font-medium"
              >
                ← Back to Biometric
              </button>
              <button
                onClick={() => {
                  setOtpCode(['8', '4', '2', '9', '0', '1']);
                  setTimeout(() => {
                    setStep('success');
                    setIsBioModalOpen(false);
                  }, 800);
                }}
                className="text-brand-600 dark:text-cyan-400 hover:underline font-mono font-semibold"
              >
                Simulate Auto-Fill (842901)
              </button>
            </div>
          </div>
        )}

        {/* Modal Body: Success Mode */}
        {step === 'success' && (
          <div className="py-8 flex flex-col items-center text-center animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-3 shadow-lg shadow-emerald-500/25">
              <Check className="w-8 h-8 animate-bounce" />
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">Session Verified</h4>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-mono font-semibold">FIPS Level 3 Cryptographic Clearance Active</p>
          </div>
        )}

      </div>
    </div>
  );
}
