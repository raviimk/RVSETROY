import React, { useState, useEffect, useRef, useCallback } from 'react';

const App = () => {
  const [input, setInput] = useState('');
  const [diamonds, setDiamonds] = useState([]);
  const [autoMode, setAutoMode] = useState(false);
  const [scannedPackets, setScannedPackets] = useState(new Set());

  const inputRef = useRef(null);

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
    if (autoMode && input.trim() !== '') {
      addDiamond(input.trim());
      setInput('');
    }
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

  return (
    <div style={{ padding: '20px' }}>
      <h1>💎 Diamond Sorter</h1>

      <label>
        <input
          type="checkbox"
          checked={autoMode}
          onChange={() => setAutoMode(!autoMode)}
        /> Auto Scan Mode
      </label>

      <br /><br />

      <input
        type="text"
        ref={inputRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Scan or paste barcode..."
        autoFocus
      />
      <button onClick={handleAddClick} disabled={autoMode}>Add</button>

      <hr />

      {Object.entries(grouped).map(([key, group], i) => {
        const [shape, type] = key.split('_');
        const totalCent = group.reduce((sum, d) => sum + d.centWeight, 0).toFixed(3);
        const totalCarat = group.reduce((sum, d) => sum + d.caratWeight, 0).toFixed(3);

        return (
          <div key={key} style={{ marginBottom: '20px', border: '1px solid #ccc', padding: '10px' }}>
            <h3>Box {i + 1}: {shape} ({type})</h3>
            <ul>
              {group.map((d, idx) => (
                <li key={idx}>
                  Cent: {d.centWeight} | Carat: {d.caratWeight} | Packet: {d.packetNo}
                </li>
              ))}
            </ul>
            <strong>Total Cent: {totalCent}, Carat: {totalCarat}, Packets: {group.length}</strong>
          </div>
        );
      })}
    </div>
  );
};

export default App;
