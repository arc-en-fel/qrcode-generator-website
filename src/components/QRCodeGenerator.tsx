import React, { useState, useRef } from 'react';
import QRCode from 'react-qr-code';
import { Download, Copy, Check, QrCode, Link, AlertCircle } from 'lucide-react';

const QRCodeGenerator: React.FC = () => {
  const [url, setUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const qrRef = useRef<HTMLDivElement>(null);

  const isValidUrl = (string: string) => {
    try {
      const url = new URL(string);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (_) {
      return false;
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUrl(value);
    
    if (value && !isValidUrl(value)) {
      setError('Please enter a valid URL (must start with http:// or https://)');
    } else {
      setError('');
    }
  };

  const downloadQRCode = () => {
    const svg = qrRef.current?.querySelector('svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    canvas.width = 512;
    canvas.height = 512;

    img.onload = () => {
      ctx?.drawImage(img, 0, 0, 512, 512);
      const pngFile = canvas.toDataURL('image/png');
      
      const downloadLink = document.createElement('a');
      downloadLink.download = 'qrcode.png';
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  const copyToClipboard = async () => {
    if (!url) return;
    
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const hasValidUrl = url && isValidUrl(url);

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
          <div className="flex items-center gap-3 mb-2">
            <QrCode className="w-8 h-8" />
            <h1 className="text-2xl font-bold">QR Code Generator</h1>
          </div>
          <p className="text-blue-100">Transform any URL into a scannable QR code instantly</p>
        </div>

        {/* Input Section */}
        <div className="p-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="url-input" className="block text-sm font-medium text-gray-700 mb-2">
                Enter URL to generate QR code
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Link className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="url-input"
                  type="url"
                  value={url}
                  onChange={handleUrlChange}
                  placeholder="https://example.com"
                  className={`block w-full pl-10 pr-3 py-3 text-base border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                    error 
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                  }`}
                />
              </div>
              {error && (
                <div className="mt-2 flex items-center gap-2 text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>{error}</span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            {hasValidUrl && (
              <div className="flex gap-3">
                <button
                  onClick={copyToClipboard}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied!' : 'Copy URL'}
                </button>
                <button
                  onClick={downloadQRCode}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download QR
                </button>
              </div>
            )}
          </div>
        </div>

        {/* QR Code Display */}
        {hasValidUrl && (
          <div className="px-6 pb-6">
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-8 text-center">
              <div ref={qrRef} className="inline-block p-4 bg-white rounded-lg shadow-lg">
                <QRCode
                  size={200}
                  style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                  value={url}
                  viewBox="0 0 256 256"
                  bgColor="#ffffff"
                  fgColor="#000000"
                />
              </div>
              <p className="mt-4 text-sm text-gray-600">
                Scan this QR code to visit: <span className="font-medium break-all">{url}</span>
              </p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!url && (
          <div className="px-6 pb-6">
            <div className="bg-gray-50 rounded-xl p-8 text-center">
              <QrCode className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to Generate</h3>
              <p className="text-gray-600">
                Enter a URL above to generate your QR code instantly
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Features */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
        <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <QrCode className="w-5 h-5 text-blue-600" />
          </div>
          <h4 className="font-medium text-gray-900">Instant Generation</h4>
          <p className="text-sm text-gray-600">Real-time QR code creation</p>
        </div>
        <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4">
          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <Download className="w-5 h-5 text-purple-600" />
          </div>
          <h4 className="font-medium text-gray-900">High Quality</h4>
          <p className="text-sm text-gray-600">Download as PNG image</p>
        </div>
        <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <Check className="w-5 h-5 text-green-600" />
          </div>
          <h4 className="font-medium text-gray-900">URL Validation</h4>
          <p className="text-sm text-gray-600">Ensures valid links only</p>
        </div>
      </div>
    </div>
  );
};

export default QRCodeGenerator;