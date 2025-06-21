import jsPDF from 'jspdf';
import { useState, useRef, useEffect } from 'react';


import QRCode from 'react-qr-code';
import { Download, Copy, Check, QrCode, Link, AlertCircle } from 'lucide-react';

function luminance(hex: string) {
  const rgb = hex.replace('#', '').match(/.{2}/g)!.map(x => parseInt(x, 16) / 255);
  const [r, g, b] = rgb.map(c => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function calculateContrast(hex1: string, hex2: string) {
  const lum1 = luminance(hex1);
  const lum2 = luminance(hex2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
}

const QRCodeGenerator: React.FC = () => {
  const [url, setUrl] = useState('');
  const [dataType, setDataType] = useState('url');

  const [copied, setCopied] = useState(false);
  const [fgColor, setFgColor] = useState('#000000');
const [bgColor, setBgColor] = useState('#ffffff');
const [qrSize, setQrSize] = useState(256);
useEffect(() => {
  if (!url) return;

  const contrast = calculateContrast(bgColor, fgColor);
  if (contrast < 4.5) {
    setError('⚠️ Low contrast may make your QR code unscannable.');
  } else {
    setError('');
  }
}, [bgColor, fgColor, url]);


  const [error, setError] = useState('');
  const qrRef = useRef<HTMLDivElement>(null);

 const isValidUrl = (string: string) => {
  try {
    const url = new URL(string);
    return ['http:', 'https:'].includes(url.protocol);
  } catch (_) {
    try {
      new URL('http://' + string);
      return true;
    } catch {
      return false;
    }
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

 const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
  e.preventDefault();
  const text = e.dataTransfer.getData('text/plain');

  if (!text) return;

  // Custom logic based on selected data type
  switch (dataType) {
    case 'url':
      if (isValidUrl(text)) {
        setUrl(text);
        setError('');
      } else {
        setError('Dropped content is not a valid URL');
      }
      break;

    case 'email':
      if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text)) {
        setUrl(text);
        setError('');
      } else {
        setError('Dropped content is not a valid email address');
      }
      break;

    case 'phone':
      if (/^\+?[0-9\s\-()]{7,}$/.test(text)) {
        setUrl(text);
        setError('');
      } else {
        setError('Dropped content is not a valid phone number');
      }
      break;

    case 'location':
    case 'text':
    default:
      setUrl(text);
      setError('');
      break;
  }
};


const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
  const pastedText = e.clipboardData.getData('Text');

  if (!pastedText) return;

  switch (dataType) {
    case 'url':
      if (isValidUrl(pastedText)) {
        setUrl(pastedText);
        setError('');
      } else {
        setError('Pasted content is not a valid URL');
      }
      break;

    case 'email':
      if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(pastedText)) {
        setUrl(pastedText);
        setError('');
      } else {
        setError('Pasted content is not a valid email address');
      }
      break;

    case 'phone':
      if (/^\+?[0-9\s\-()]{7,}$/.test(pastedText)) {
        setUrl(pastedText);
        setError('');
      } else {
        setError('Pasted content is not a valid phone number');
      }
      break;

    case 'location':
    case 'text':
    default:
      setUrl(pastedText);
      setError('');
      break;
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
   const exportAsSVG = () => {
  const svgElement = qrRef.current?.querySelector('svg');
  if (!svgElement) return;

  const svgData = new XMLSerializer().serializeToString(svgElement);
  const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = 'qrcode.svg';
  link.click();
};

const exportAsPDF = () => {
  const svg = qrRef.current?.querySelector('svg');
  if (!svg) return;

  const svgData = new XMLSerializer().serializeToString(svg);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const img = new Image();

  canvas.width = qrSize;
  canvas.height = qrSize;

  img.onload = () => {
    ctx?.drawImage(img, 0, 0, qrSize, qrSize);
    const imgData = canvas.toDataURL('image/png');

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'px',
      format: [qrSize + 40, qrSize + 40], // add margin
    });

    pdf.addImage(imgData, 'PNG', 20, 20, qrSize, qrSize);
    pdf.save('qrcode.pdf');
  };

  img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
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
    <div
  className="w-full max-w-2xl mx-auto p-6"
  onDrop={handleDrop}
  onDragOver={(e) => e.preventDefault()}
  onPaste={handlePaste}
>

      <div className="bg-white dark:bg-gray-900 bg-opacity-80 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-300">

        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
          <div className="flex items-center gap-3 mb-2">
            <QrCode className="w-8 h-8" />
            <h1 className="text-4xl font-extrabold mb-3 text-center text-gray-800 dark:text-white tracking-tight">
  QR Code Generator
</h1>

          </div>
          <p className="text-blue-100">Transform any URL into a scannable QR code instantly</p>
        </div>

        {/* Input Section */}
        <div className="p-6">
          <div className="space-y-4">
            <div>
              <div className="mb-4">
  <label htmlFor="data-type" className="block text-sm font-medium text-gray-700 mb-2">
    Select Data Type
  </label>
  <select
    id="data-type"
    value={dataType}
    onChange={(e) => setDataType(e.target.value)}
    className="block w-full border border-gray-300 rounded-lg px-3 py-2"
  >
    <option value="url">🔗 URL</option>
    <option value="text">📝 Text</option>
    <option value="email">📧 Email</option>
    <option value="phone">📱 Phone</option>
    <option value="location">📍 Location</option>
  </select>
</div>

              <label htmlFor="url-input" className="block text-sm font-medium text-gray-700 mb-2">
  Enter value for QR ({dataType.toUpperCase()})
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
                 className={`block w-full pl-10 pr-3 py-3 text-base border rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 dark:bg-gray-800 dark:text-white dark:border-gray-700 ${
  error
    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
    : 'border-gray-300 focus:border-blue-500'
}`}

                />
              </div>
              <p className="text-sm text-gray-400 mt-2">
  💡 Tip: You can also drag a URL here or paste (Ctrl+V)
</p>

              {error && (
                <div className="mt-2 flex items-center gap-2 text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>{error}</span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            {hasValidUrl && (
  <>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Foreground Color</label>
        <input
          type="color"
          value={fgColor}
          onChange={(e) => setFgColor(e.target.value)}
          className="w-full h-10 rounded-lg cursor-pointer"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Background Color</label>
        <input
          type="color"
          value={bgColor}
          onChange={(e) => setBgColor(e.target.value)}
          className="w-full h-10 rounded-lg cursor-pointer"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Size</label>
        <select
          value={qrSize}
          onChange={(e) => setQrSize(parseInt(e.target.value))}
          className="w-full h-10 border border-gray-300 rounded-lg px-3"
        >
          <option value={128}>128 x 128</option>
          <option value={256}>256 x 256</option>
          <option value={512}>512 x 512</option>
        </select>
      </div>
    </div>

  <div className="flex flex-wrap gap-3">
  <button
    onClick={copyToClipboard}
    className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors 
  bg-gradient-to-r from-blue-500 to-purple-500 text-white 
  hover:from-blue-600 hover:to-purple-600 dark:from-blue-600 dark:to-purple-700"

  >
    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
    {copied ? 'Copied!' : 'Copy URL'}
  </button>

  <button
    onClick={downloadQRCode}
   className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors 
  bg-gradient-to-r from-blue-500 to-purple-500 text-white 
  hover:from-blue-600 hover:to-purple-600 dark:from-blue-600 dark:to-purple-700"

  >
    <Download className="w-4 h-4" />
    Download PNG
  </button>

  <button
    onClick={exportAsSVG}
    className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors 
  bg-gradient-to-r from-blue-500 to-purple-500 text-white 
  hover:from-blue-600 hover:to-purple-600 dark:from-blue-600 dark:to-purple-700"

  >
    <Download className="w-4 h-4" />
    Export SVG
  </button>

  <button
    onClick={exportAsPDF}
   className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors 
  bg-gradient-to-r from-blue-500 to-purple-500 text-white 
  hover:from-blue-600 hover:to-purple-600 dark:from-blue-600 dark:to-purple-700"

  >
    <Download className="w-4 h-4" />
    Export PDF
  </button>
</div>


  </>
)}

          </div>
        </div>

        {/* QR Code Display */}
        {hasValidUrl && (
          <div className="px-6 pb-6">
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-8 text-center">
              <div ref={qrRef} className="inline-block p-4 bg-white rounded-lg shadow-lg">
              <div className="p-6 animate-fade-in">
               <QRCode
  size={qrSize}
  style={{ height: "auto", maxWidth: "100%", width: "100%" }}
  value={ dataType === 'url' ? url :
  dataType === 'text' ? url :
  dataType === 'email' ? `mailto:${url}` :
  dataType === 'phone' ? `tel:${url}` :
  dataType === 'location' ? `geo:${url}` :
  url}
  viewBox="0 0 256 256"
  bgColor={bgColor}
  fgColor={fgColor}
/>
 
</div>

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