import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { X, ShieldCheck, CreditCard, Sparkles, CheckCircle } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';

interface PaystackWebViewModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const PaystackWebViewModal: React.FC<PaystackWebViewModalProps> = ({
  visible,
  onClose,
  onSuccess
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [paymentDone, setPaymentDone] = useState(false);

  // Paystack HTML Checkout Form Embedded with Public Key configuration
  const paystackHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            background-color: #0F172A;
            color: #FFFFFF;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100vh;
            margin: 0;
            padding: 20px;
            box-sizing: border-box;
          }
          .card {
            background-color: #1E293B;
            border: 1px solid #334155;
            border-radius: 20px;
            padding: 24px;
            width: 100%;
            max-width: 360px;
            text-align: center;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
          }
          .logo {
            font-size: 32px;
            font-weight: 900;
            color: #F59E0B;
            margin-bottom: 8px;
          }
          .title {
            font-size: 20px;
            font-weight: bold;
            margin-bottom: 4px;
          }
          .subtitle {
            color: #94A3B8;
            font-size: 12px;
            margin-bottom: 20px;
          }
          .price {
            font-size: 36px;
            font-weight: 900;
            color: #10B981;
            margin-bottom: 20px;
          }
          .btn {
            background-color: #F59E0B;
            color: #0F172A;
            font-weight: bold;
            font-size: 15px;
            border: none;
            border-radius: 12px;
            padding: 16px;
            width: 100%;
            cursor: pointer;
            text-transform: uppercase;
            letter-spacing: 1px;
            box-shadow: 0 10px 15px -3px rgba(245, 158, 11, 0.3);
          }
          .badge {
            background-color: rgba(245, 158, 11, 0.1);
            color: #F59E0B;
            border: 1px solid rgba(245, 158, 11, 0.3);
            border-radius: 20px;
            padding: 4px 12px;
            font-size: 11px;
            display: inline-block;
            margin-bottom: 16px;
          }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="logo">CineConnect</div>
          <div class="badge">PRO INDUSTRY VERIFICATION</div>
          <div class="title">Upgrade to Premium</div>
          <div class="subtitle">Get Gold Badge, Unlimited Matchmaking & Priority Casting</div>
          <div class="price">₦15,000 <span style="font-size: 14px; color: #94A3B8;">/yr</span></div>
          <button class="btn" onclick="payWithPaystack()">Pay Now via Paystack</button>
        </div>

        <script src="https://js.paystack.co/v1/inline.js"></script>
        <script>
          function payWithPaystack() {
            var handler = PaystackPop.setup({
              key: 'pk_test_cineconnect_paystack_public_key',
              email: '${user?.email || 'actor@cineconnect.app'}',
              amount: 1500000, // in kobo
              currency: "NGN",
              ref: 'CC_'+Math.floor((Math.random() * 1000000000) + 1),
              onClose: function(){
                window.ReactNativeWebView.postMessage(JSON.stringify({ status: 'cancelled' }));
              },
              callback: function(response){
                window.ReactNativeWebView.postMessage(JSON.stringify({ status: 'success', reference: response.reference }));
              }
            });
            handler.openIframe();
          }
        </script>
      </body>
    </html>
  `;

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.status === 'success') {
        setPaymentDone(true);
        onSuccess();
        setTimeout(() => {
          setPaymentDone(false);
          onClose();
        }, 1500);
      }
    } catch (e) {
      console.warn('Paystack message error:', e);
    }
  };

  const handleSimulatePayment = () => {
    setPaymentDone(true);
    onSuccess();
    setTimeout(() => {
      setPaymentDone(false);
      onClose();
    }, 1500);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <View className="flex-1 bg-slate-950">
        {/* Header */}
        <View className="bg-slate-900 border-b border-slate-800 p-4 pt-12 flex-row items-center justify-between">
          <View className="flex-row items-center">
            <CreditCard size={20} color="#F59E0B" className="mr-2" />
            <Text className="text-lg font-bold text-white">Secure Paystack Checkout</Text>
          </View>

          <TouchableOpacity onPress={onClose} className="p-2 bg-slate-800 rounded-full">
            <X size={18} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        {paymentDone ? (
          <View className="flex-1 justify-center items-center p-6">
            <CheckCircle size={64} color="#10B981" />
            <Text className="text-white font-black text-2xl mt-4">Payment Successful!</Text>
            <Text className="text-amber-400 font-bold text-sm mt-1">Verified & Premium Status Activated ✨</Text>
            <Text className="text-slate-400 text-xs mt-2 text-center">
              Updated /users/{user?.uid} Firestore profile status to verified: true.
            </Text>
          </View>
        ) : (
          <View className="flex-1 relative">
            <WebView
              originWhitelist={['*']}
              source={{ html: paystackHtml }}
              onMessage={handleMessage}
              onLoadEnd={() => setLoading(false)}
              className="flex-1"
            />

            {/* Quick Demo Bypass button for testing */}
            <View className="p-4 bg-slate-900 border-t border-slate-800">
              <TouchableOpacity
                onPress={handleSimulatePayment}
                className="bg-emerald-500 py-3 rounded-xl items-center flex-row justify-center"
              >
                <Sparkles size={16} color="#0F172A" className="mr-1.5" />
                <Text className="text-slate-950 font-bold text-xs uppercase tracking-wider">
                  Instant Complete Paystack Upgrade (Demo Bypass)
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
};
