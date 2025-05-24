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
    if (!autoMode || input.trim() === '') return;

    const timeout = setTimeout(() => {
      addDiamond(input.trim());
      setInput('');
    }, 300); // Wait 300ms after user stops typing

    return () => clearTimeout(timeout); // Clear previous timeout if input changes quickly
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
      <button onClick={handlePrint} style={{ marginLeft: '10px' }}>🧾 Print Receipt</button>

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
