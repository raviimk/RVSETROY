
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './App.css';

const colorMap = [
  'border-l-4 border-green-500 bg-green-50',
  'border-l-4 border-yellow-500 bg-yellow-50',
  'border-l-4 border-blue-500 bg-blue-50',
  'border-l-4 border-purple-500 bg-purple-50',
  'border-l-4 border-pink-500 bg-pink-50',
  'border-l-4 border-orange-500 bg-orange-50',
  'border-l-4 border-indigo-500 bg-indigo-50'
];

const App = () => {
  const [input, setInput] = useState('');
  const [diamonds, setDiamonds] = useState([]);
  const [autoMode, setAutoMode] = useState(false);
  const [scannedPackets, setScannedPackets] = useState(new Set());
  const [expandedShape, setExpandedShape] = useState(null);
  const [highlightPacket, setHighlightPacket] = useState(null);
  const [showPercentage, setShowPercentage] = useState(false);
  const [manual, setManual] = useState({
    centWeight: '',
    caratWeight: '',
    shape: '',
    packetNo: ''
  });

  const [separateBig, setSeparateBig] = useState(true);

  const inputRef = useRef(null);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('diamondData'));
    if (saved && Array.isArray(saved)) {
      setDiamonds(saved);
      const packets = new Set(saved.map(d => d.packetNo));
      setScannedPackets(packets);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('diamondData', JSON.stringify(diamonds));
  }, [diamonds]);

  const parseDiamondData = (text) => {
    const parts = text.split(',');
    if (parts.length < 15) return null;
    return {
      centWeight: parseFloat(parts[7]),
      caratWeight: parseFloat(parts[8]),
      shape: parts[11],
      packetNo: parts[14].trim()
    };
  };

  const addDiamond = useCallback((diamond) => {
    if (!diamond || !diamond.packetNo) return;
    if (scannedPackets.has(diamond.packetNo)) {
      const confirmAdd = window.confirm('⚠️ AA PACKET AVI GYU CHE. MOTA TOY KARVUJ CHE ?');
      if (!confirmAdd) return;
    }
    
    setHighlightPacket(diamond);
    setDiamonds(prev => [...prev, diamond]);
    setScannedPackets(prev => new Set(prev).add(diamond.packetNo));
  }, [scannedPackets]);

  const handleAddClick = () => {
    const diamond = parseDiamondData(input.trim());
    addDiamond(diamond);
    setInput('');
  };

  const handleManualAdd = () => {
    const { centWeight, caratWeight, shape, packetNo } = manual;
    if (!centWeight || !caratWeight || !shape || !packetNo) return alert('Fill all fields');
    const diamond = {
      centWeight: parseFloat(centWeight),
      caratWeight: parseFloat(caratWeight),
      shape,
      packetNo
    };
    addDiamond(diamond);
    setManual({ centWeight: '', caratWeight: '', shape: '', packetNo: '' });
  };

  useEffect(() => {
    if (!autoMode || input.trim() === '') return;
    const timeout = setTimeout(() => {
      const diamond = parseDiamondData(input.trim());
      addDiamond(diamond);
      setInput('');
    }, 300);
    return () => clearTimeout(timeout);
  }, [input, autoMode, addDiamond]);

  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, [input]);

  const grouped = diamonds.reduce((acc, d) => {
    const key = separateBig ? `${d.shape}_${d.caratWeight > 0.1 ? 'Big' : 'Normal'}` : d.shape;
    if (!acc[key]) acc[key] = [];
    acc[key].push(d);
    return acc;
  }, {});

  const toggleSummary = (key) => {
    setExpandedShape(prev => (prev === key ? null : key));
  };

  const handlePrint = () => {
    const printWindow = window.open('', '', 'width=400,height=600');
    const rawCent = diamonds.reduce((sum, d) => sum + d.centWeight, 0);
    const rawCarat = diamonds.reduce((sum, d) => sum + d.caratWeight, 0);
    const totalCent = rawCent.toFixed(3);
    const totalCarat = rawCarat.toFixed(3);
    const percentage = rawCent !== 0 ? ((rawCarat / rawCent) * 100).toFixed(2) : '0.00';

    const htmlContent = `
      <html>
        <head>
          <title>Receipt</title>
          <style>
            body { font-family: Arial; font-size: 12px; padding: 10px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
            th, td { border: 1px solid #000; padding: 4px; text-align: center; }
            h3 { margin: 10px 0 5px; }
          </style>
        </head>
        <body>
          <h2>Diamond Receipt</h2>
          ${Object.entries(grouped).map(([key, group]) => {
          const [shape, type] = key.split('_');
          const groupCent = group.reduce((sum, d) => sum + d.centWeight, 0).toFixed(3);
          const groupCarat = group.reduce((sum, d) => sum + d.caratWeight, 0).toFixed(3);
          const groupPercentage = groupCent !== 0 ? (groupCarat / groupCent * 100).toFixed(2) : '0.00';
          const totalPcs = group.length;
            return `
              <div>
                <h3>${shape} (${type})</h3>
                <table>
                  <thead><tr><th>Total Pcs</th><th>RO WGT</th><th>PO WGT</th></tr></thead>
                  <tbody><tr><td>${totalPcs}</td><td>${groupCent}</td><td>${groupCarat}</td></tr></tbody>
                </table>
                ${showPercentage ? `<div style="font-weight: bold; font-size: 11px;">Percentage: ${groupPercentage}%</div>` : ''}
              </div>`;
          }).join('')}
          
          ${showPercentage ? `
            <div style="margin-top: 10px; font-size: 13px;">
              Total Cent: ${totalCent} | Total Carat: ${totalCarat} | Overall %: ${percentage}%
            </div>
          ` : ''}

          <div style="margin-top: 30px;">Receiver Sign: __________________</div>
        </body>
      </html>`;
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.print();
  };

  const handleGujaratiPrint = () => {
  const last = diamonds[diamonds.length - 1];
  if (!last) return alert("કોઈ પણ પેકેટ સ્કેન થયેલ નથી!");

  const kapan = last.packetNo.split("-")[0];
  const shapeMap = {
    ROUND: "રાઉન્ડ 4P",
    PEAR: "પાન",
    EMERALD: "ચોકી",
    MARQUISE: "માર્કિસ",
  };
  const gujaratiShape = shapeMap[last.shape?.toUpperCase()] || last.shape;
    
  const rawCent = diamonds.reduce((sum, d) => sum + d.centWeight, 0);
  const rawCarat = diamonds.reduce((sum, d) => sum + d.caratWeight, 0);

  const totalCent = rawCent.toFixed(3);
  const totalCarat = rawCarat.toFixed(3);
  const percentage = rawCent !== 0 ? ((rawCarat / rawCent) * 100).toFixed(2) : '0.00';
  const mainPackets = diamonds.filter(d => /[Aa]$/.test(d.packetNo)).length;
  
  const grandTotalPcs = diamonds.length;
  
  const html = `
    <html>
      <head>
        <title>Gujarati Receipt</title>
        <style>
          body {
            font-family: 'Noto Sans Gujarati', sans-serif;
            font-size: 16px;
            padding: 10px 15px;
            box-sizing: border-box;
          }
          .top {
            display: flex;
            justify-content: space-between;
            margin-bottom: 40px;
            font-weight: bold;
          }
          .bottom {
            display: flex;
            justify-content: space-between;
            margin-top: 60px;
            font-weight: bold;
          }
          .left-block {
            text-align: left;
            line-height: 1.6;
          }
          .right-block {
            text-align: right;
          }
        </style>
      </head>
      <body>
        <div class="top">
          <div>કાપણ ${kapan}</div>
          <div>${gujaratiShape}</div>
        </div>

        <div class="bottom">
          <div class="left-block">
            <div>કા.વજન : ${totalCent}</div>
            <div>તૈ.વજન : ${totalCarat}</div>
            ${showPercentage ? `<div style="font-size:14px;">ટકા : ${percentage}%</div>` : ''}
          </div>
          <div class="right-block">
            ${showPercentage ? `<div>મેન : ${mainPackets}</div>` : ''}
            <div>થાન : ${grandTotalPcs}</div>
          </div>
        </div>
      </body>
    </html>
  `;

  const printWindow = window.open('', '', 'width=400,height=600');
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.print();
};

  const handleSaveToFile = () => {
    const dataStr = JSON.stringify(diamonds, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const now = new Date();
    const dd = String(now.getDate()).padStart(2, '0');
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const yy = String(now.getFullYear()).slice(2);
    let hh = now.getHours();
    const min = String(now.getMinutes()).padStart(2, '0');
    const ampm = hh >= 12 ? 'PM' : 'AM';
    hh = hh % 12 || 12;
    const hhStr = String(hh).padStart(2, '0');
    const filename = `RV_${dd}${mm}${yy}_${hhStr}${min}${ampm}.json`;

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDiamonds([]);
    setScannedPackets(new Set());
    localStorage.removeItem('diamondData');
  };

const handleLoadMultipleFiles = (e) => {
  const files = Array.from(e.target.files);
  if (!files.length) return;

  const readerPromises = files.map(file => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target.result);
          if (Array.isArray(data)) {
            resolve(data);
          } else {
            resolve([]); // Skip if invalid
          }
        } catch {
          resolve([]);
        }
      };
      reader.readAsText(file);
    });
  });

  Promise.all(readerPromises).then(results => {
    const merged = results.flat();
    setDiamonds(prev => [...prev, ...merged]);
    const packets = new Set(merged.map(d => d.packetNo));
    setScannedPackets(prev => {
      const newSet = new Set(prev);
      packets.forEach(p => newSet.add(p));
      return newSet;
    });
  });
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-white p-4 text-gray-800">
      <motion.h1 
        layout 
        className="text-5xl font-black mb-8 text-center bg-gradient-to-r from-pink-500 via-indigo-600 to-blue-500 text-transparent bg-clip-text drop-shadow-lg tracking-wider animate-pulse"
      >
        💎 D I A M O N D &nbsp; S O R T E R 💎
      </motion.h1>

      <div className="flex flex-col md:flex-row gap-4 justify-center items-center mb-6">
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={autoMode} onChange={() => setAutoMode(!autoMode)} />
          <span className="text-sm font-medium text-gray-700">Auto Scan Mode</span>
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={showPercentage} onChange={() => setShowPercentage(!showPercentage)} />
          <span className="text-sm font-medium text-gray-700"> % </span>
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={separateBig} onChange={() => setSeparateBig(!separateBig)} />
          <span className="text-sm font-medium text-gray-700">Separate Big Diamonds (Carat &gt; 0.100)</span>
        </label>
  
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Scan or type barcode..."
          className="border px-3 py-2 rounded-lg shadow-md text-black font-semibold"
          style={{ backgroundColor: 'white', marginRight: '10px', minWidth: '200px' }}
        />

       <button className="pixel-btn" onClick={handleAddClick} disabled={autoMode}>Add</button>

       <button className="pixel-btn" onClick={handlePrint}>🧾 Print Receipt</button>

       <button className="pixel-btn" onClick={handleGujaratiPrint}>🖨 Gujarati Receipt</button>

       <button className="pixel-btn" onClick={handleSaveToFile}>💾 Save Data</button>

        <label className="pixel-btn cursor-pointer">
          📂 Load Multiple JSONs
          <input type="file" accept="application/json" multiple onChange={handleLoadMultipleFiles} style={{ display: 'none' }} />
        </label>
      </div>
        
      <div className="bg-white border border-gray-300 rounded-lg shadow p-4 mb-6">
        <h2 className="text-lg font-bold text-gray-800 mb-3">CREAT BY RAVII™</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
  
          <input type="number" step="0.001" placeholder="Cent Weight" value={manual.centWeight} onChange={(e) => setManual({ ...manual, centWeight: e.target.value })} className="border px-2 py-2 rounded shadow-sm" />
  
          <input type="number" step="0.001" placeholder="Carat Weight" value={manual.caratWeight} onChange={(e) => setManual({ ...manual, caratWeight: e.target.value })} className="border px-2 py-2 rounded shadow-sm" />
  
          <input type="text" placeholder="Shape" value={manual.shape} onChange={(e) => setManual({ ...manual, shape: e.target.value })} className="border px-2 py-2 rounded shadow-sm" />
  
          <input type="text" placeholder="Packet No" value={manual.packetNo} onChange={(e) => setManual({ ...manual, packetNo: e.target.value })} className="border px-2 py-2 rounded shadow-sm" />
        </div>
        <button className="pixel-btn mt-4" onClick={handleManualAdd}>+ Add Manual</button>
      </div>
  
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {Object.entries(grouped).map(([key, group], i) => {
          const [shape, type] = key.split('_');
          const totalCent = group.reduce((sum, d) => sum + d.centWeight, 0).toFixed(3);
          const totalCarat = group.reduce((sum, d) => sum + d.caratWeight, 0).toFixed(3);
          const mainPackets = group.filter(d => d.packetNo.includes('A') || !/[A-Z]/i.test(d.packetNo)).length;
          const normalPackets = group.length - mainPackets;
          const visiblePackets = group.slice(0, 3);
          const colorStyle = colorMap[i % colorMap.length];
          const isHighlighted = group.some(d => d.packetNo === highlightPacket?.packetNo);

          return (
            <motion.div
              layout
              key={key}
              className={`w-full rounded-xl border p-4 shadow-md relative ${colorStyle} ${isHighlighted ? 'highlight-ring' : ''}`}
            >

              <button
                onClick={() => {
                  const updated = diamonds.filter(d => !group.includes(d));
                  setDiamonds(updated);
                  const updatedPackets = new Set(updated.map(d => d.packetNo));
                  setScannedPackets(updatedPackets);
                }}
                className="absolute top-2 right-2 text-red-600 hover:text-red-800 text-lg"
                title="Delete this box"
              >
                🗑
              </button>
                       
              <h3 className="text-lg font-extrabold uppercase mb-4 tracking-wide text-gray-700">
                Box {i + 1}: <span className="text-indigo-700">{shape}</span> <span className="text-sm text-gray-600">({type})</span>
              </h3>
              <ul className="list-disc pl-6 text-sm mb-2">
                {visiblePackets.map((d, idx) => (
                  <li key={idx}>Cent: {d.centWeight} | Carat: {d.caratWeight} | Packet: {d.packetNo}</li>
                ))}
              </ul>
              {group.length > 3 && (
                <button onClick={() => toggleSummary(key)} className="text-xs text-blue-700 hover:underline mb-2">
                  {expandedShape === key ? 'Hide Summary' : 'View Summary'}
                </button>
              )}
              <AnimatePresence>
                {expandedShape === key && (
                  <motion.ul initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="list-disc pl-6 text-sm mb-2">
                    {group.slice(3).map((d, idx) => (
                      <li key={idx}>Cent: {d.centWeight} | Carat: {d.caratWeight} | Packet: {d.packetNo}</li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
              <div className="text-sm font-semibold text-gray-800">
                Total Packets: {group.length}<br />
                Main Packets: {mainPackets}<br />
                Normal Packets: {normalPackets}<br />
                RO WGT: {totalCent}, PO WGT: {totalCarat}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default App;
