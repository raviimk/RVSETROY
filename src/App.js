import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './App.css';

const App = () => {
  const [input, setInput] = useState('');
  const [diamonds, setDiamonds] = useState([]);
  const [autoMode, setAutoMode] = useState(false);
  const [scannedPackets, setScannedPackets] = useState(new Set());
  const [expandedShape, setExpandedShape] = useState(null);

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
      packetNo: parts[14].trim(),
    };
  };

  const addDiamond = useCallback((text) => {
    const diamond = parseDiamondData(text);
    if (!diamond) return;

    if (scannedPackets.has(diamond.packetNo)) {
      const confirmAdd = window.confirm(
        `⚠️ AA PACKET AVI GYU CHE. MOTA TOY KARVUJ CHE ?`
      );
      if (!confirmAdd) return;
    }

    setDiamonds(prev => [...prev, diamond]);
    setScannedPackets(prev => new Set(prev).add(diamond.packetNo));
  }, [scannedPackets]);

  const handleAddClick = () => {
    addDiamond(input.trim());
    setInput('');
  };

  useEffect(() => {
    if (!autoMode || input.trim() === '') return;

    const timeout = setTimeout(() => {
      addDiamond(input.trim());
      setInput('');
    }, 300);

    return () => clearTimeout(timeout);
  }, [input, autoMode, addDiamond]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [input]);

  const grouped = diamonds.reduce((acc, d) => {
    const key = `${d.shape}_${d.caratWeight > 0.1 ? 'Big' : 'Normal'}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(d);
    return acc;
  }, {});

  const toggleSummary = (key) => {
    setExpandedShape(prev => (prev === key ? null : key));
  };

  const handlePrint = () => {
    const printWindow = window.open('', '', 'width=400,height=600');
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
            const totalCent = group.reduce((sum, d) => sum + d.centWeight, 0).toFixed(3);
            const totalCarat = group.reduce((sum, d) => sum + d.caratWeight, 0).toFixed(3);
            const totalPcs = group.length;

            return `
              <div>
                <h3>${shape} (${type})</h3>
                <table>
                  <thead>
                    <tr><th>Total Pcs</th><th>Cent</th><th>Carat</th></tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>${totalPcs}</td>
                      <td>${totalCent}</td>
                      <td>${totalCarat}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            `;
          }).join('')}
          <div style="margin-top: 30px;">Receiver Sign: __________________</div>
        </body>
      </html>
    `;
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.print();
  };

  const handleSaveToFile = () => {
    const dataStr = JSON.stringify(diamonds, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
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

    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Auto-clear data after save
    setDiamonds([]);
    setScannedPackets(new Set());
    localStorage.removeItem('diamondData');
  };

  const handleLoadFromFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        if (Array.isArray(data)) {
          setDiamonds(data);
          const packets = new Set(data.map(d => d.packetNo));
          setScannedPackets(packets);
        } else {
          alert('Invalid file format!');
        }
      } catch (err) {
        alert('Failed to load file!');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-100 p-4 text-gray-800">
      <motion.h1 layout className="text-3xl font-bold mb-4 text-center text-indigo-600">
        💎 Diamond Sorter
      </motion.h1>

      <div className="flex flex-col md:flex-row gap-4 justify-center items-center mb-6">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={autoMode}
            onChange={() => setAutoMode(!autoMode)}
          />
          <span className="text-sm">Auto Scan Mode</span>
        </label>

        <input
          type="text"
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Scan or paste barcode..."
          className="border px-3 py-2 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />

        <button
          onClick={handleAddClick}
          disabled={autoMode}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
        >
          Add
        </button>

        <button
          onClick={handlePrint}
          className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 transition"
        >
          🧾 Print Receipt
        </button>

        <button
          onClick={handleSaveToFile}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
        >
          💾 Save Data
        </button>

        <label className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition cursor-pointer">
          📂 Load Data
          <input
            type="file"
            accept="application/json"
            onChange={handleLoadFromFile}
            style={{ display: 'none' }}
          />
        </label>
      </div>

      <div className="grid gap-4">
        {Object.entries(grouped).map(([key, group], i) => {
          const [shape, type] = key.split('_');
          const totalCent = group.reduce((sum, d) => sum + d.centWeight, 0).toFixed(3);
          const totalCarat = group.reduce((sum, d) => sum + d.caratWeight, 0).toFixed(3);
          const visiblePackets = group.slice(0, 3);

          return (
            <motion.div
              layout
              key={key}
              className="rounded-lg shadow border border-gray-300 bg-white p-4"
            >
              <h3 className="text-lg font-semibold text-indigo-700 mb-2">
                Box {i + 1}: {shape} ({type})
              </h3>
              <ul className="list-disc pl-6 text-sm mb-2">
                {visiblePackets.map((d, idx) => (
                  <li key={idx}>
                    Cent: {d.centWeight} | Carat: {d.caratWeight} | Packet: {d.packetNo}
                  </li>
                ))}
              </ul>
              {group.length > 3 && (
                <button
                  onClick={() => toggleSummary(key)}
                  className="text-xs text-blue-500 hover:underline mb-2"
                >
                  {expandedShape === key ? 'Hide Summary' : 'View Summary'}
                </button>
              )}
              <AnimatePresence>
                {expandedShape === key && (
                  <motion.ul
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="list-disc pl-6 text-sm mb-2"
                  >
                    {group.slice(3).map((d, idx) => (
                      <li key={idx}>
                        Cent: {d.centWeight} | Carat: {d.caratWeight} | Packet: {d.packetNo}
                      </li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
              <div className="text-sm font-semibold text-gray-700">
                Total Cent: {totalCent}, Carat: {totalCarat}, Packets: {group.length}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default App;
