import React, { useState, useEffect, useRef } from 'react';
import './App.css';

function App() {
  const [input, setInput] = useState('');
  const [autoScan, setAutoScan] = useState(false);
  const [diamonds, setDiamonds] = useState([]);
  const [scannedPackets, setScannedPackets] = useState(new Set());
  const inputRef = useRef(null);

  useEffect(() => {
    if (autoScan && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoScan]);

  useEffect(() => {
    if (autoScan && input.endsWith('L')) {
      setTimeout(() => {
        handleAdd();
      }, 100);
    }
  }, [input]);

  const parseDiamond = (data) => {
    const parts = data.split(',');
    if (parts.length < 16) return null;
    const cent = parseFloat(parts[7]);
    const carat = parseFloat(parts[8]);
    const shape = parts[12];
    const packet = parts[15];
    return { cent, carat, shape, packet, raw: data };
  };

  const handleAdd = () => {
    const diamond = parseDiamond(input.trim());
    if (!diamond) return;
    if (scannedPackets.has(diamond.packet)) {
      if (!window.confirm('AA PACKET AVI GYU CHE MOTA TOY KARVUJ CHE ?')) {
        setInput('');
        return;
      }
    }
    setDiamonds([...diamonds, diamond]);
    setScannedPackets(new Set([...scannedPackets, diamond.packet]));
    setInput('');
  };

  const grouped = diamonds.reduce((acc, d) => {
    const key = `${d.carat > 0.1 ? 'Big' : 'Normal'}-${d.shape}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(d);
    return acc;
  }, {});

  const handlePrintReceipt = () => {
    window.print();
  };

  return (
    <div className="App">
      <h1>Diamond Sorter</h1>
      <input
        ref={inputRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Paste barcode data..."
      />
      <button onClick={handleAdd}>Add</button>
      <label>
        <input
          type="checkbox"
          checked={autoScan}
          onChange={() => setAutoScan(!autoScan)}
        />{' '}
        Auto Scan Mode
      </label>

      {Object.entries(grouped).map(([key, items]) => {
        const [size, shape] = key.split('-');
        const totalCent = items.reduce((sum, d) => sum + d.cent, 0).toFixed(3);
        const totalCarat = items.reduce((sum, d) => sum + d.carat, 0).toFixed(3);
        return (
          <div key={key}>
            <h3>
              {size} Diamonds - Shape: {shape} (Packets: {items.length})
            </h3>
            <p>Total Cent: {totalCent}, Total Carat: {totalCarat}</p>
          </div>
        );
      })}

      <button onClick={handlePrintReceipt} style={{ marginTop: '20px' }}>🧾 Print Receipt</button>

      {/* Hidden receipt for printing */}
      <div id="receipt-content" style={{ display: 'none' }}>
        <h3>BLOCKING</h3>
        <p>FACTORY LALJIBHAI</p>
        <p>UID No.: 2697</p>
        <p>{new Date().toLocaleString()}</p>
        {Object.entries(grouped).map(([key, items]) => {
          const [size, shape] = key.split('-');
          const totalCent = items.reduce((sum, d) => sum + d.cent, 0).toFixed(3);
          const totalCarat = items.reduce((sum, d) => sum + d.carat, 0).toFixed(3);
          return (
            <div key={key} style={{ borderTop: '1px solid black', marginTop: '5px' }}>
              <p>Shape: {shape}</p>
              <p>Packets: {items.length}</p>
              <p>Cent: {totalCent}</p>
              <p>Carat: {totalCarat}</p>
            </div>
          );
        })}
        <p style={{ marginTop: '10px' }}>Receiver's Sign: __________</p>
      </div>
    </div>
  );
}

export default App;
