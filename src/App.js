import React, { useState } from 'react';
import './index.css';

function App() {
  const [diamonds, setDiamonds] = useState([]);

  const [inputText, setInputText] = useState('');

  const handleAdd = () => {
    const parsed = parseDiamondData(inputText);
    if (parsed) {
      setDiamonds([...diamonds, parsed]);
      setInputText('');
    } else {
      alert("Invalid barcode data");
    }
  };

  const parseDiamondData = (text) => {
    const parts = text.split(',');
    if (parts.length < 13) return null;

    return {
      centWeight: parseFloat(parts[7]),
      caratWeight: parseFloat(parts[8]),
      shape: parts[12],
    };
  };

  const groupByShape = (list) => {
    const grouped = {};
    list.forEach(d => {
      if (!grouped[d.shape]) grouped[d.shape] = [];
      grouped[d.shape].push(d);
    });
    return grouped;
  };

  const normalDiamonds = diamonds.filter(d => d.caratWeight <= 0.1);
  const bigDiamonds = diamonds.filter(d => d.caratWeight > 0.1);

  const renderBoxes = (data, title) => {
    const grouped = groupByShape(data);
    return (
      <div>
        <h2>{title}</h2>
        {Object.entries(grouped).map(([shape, list], idx) => {
          const totalCent = list.reduce((sum, d) => sum + d.centWeight, 0);
          const totalCarat = list.reduce((sum, d) => sum + d.caratWeight, 0);
          return (
            <div className="box" key={shape}>
              <strong>{idx + 1}. Shape: {shape}</strong>
              <p>Total Packets: {list.length}</p>
              <p>Total Cent Weight: {totalCent.toFixed(3)}</p>
              <p>Total Carat Weight: {totalCarat.toFixed(3)}</p>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div>
      <h1>Diamond Sorter</h1>
      <input
        type="text"
        placeholder="Paste barcode data..."
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
      />
      <button onClick={handleAdd}>Add</button>

      {renderBoxes(normalDiamonds, 'Normal Diamonds (≤ 0.100 ct)')}
      {renderBoxes(bigDiamonds, 'Big Diamonds (> 0.100 ct)')}
    </div>
  );
}

export default App;
