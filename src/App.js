import React, { useState } from 'react';

export default function App() {
  const [input, setInput] = useState('');
  const [diamonds, setDiamonds] = useState([]);
  const [shapeBoxMap, setShapeBoxMap] = useState({});
  const [nextBox, setNextBox] = useState(1);

  const parseBarcode = (data) => {
    const parts = data.split(',');
    if (parts.length < 13) return null;
    const centWeight = parseFloat(parts[8]);
    const caratWeight = parseFloat(parts[9]);
    const clarity = parts[11];
    const shape = parts[12].toUpperCase();

    return { centWeight, caratWeight, clarity, shape };
  };

  const handleAdd = () => {
    const parsed = parseBarcode(input);
    if (!parsed) return;

    let boxNumber = shapeBoxMap[parsed.shape];
    const updatedMap = { ...shapeBoxMap };

    if (!boxNumber) {
      boxNumber = nextBox;
      updatedMap[parsed.shape] = boxNumber;
      setShapeBoxMap(updatedMap);
      setNextBox(nextBox + 1);
    }

    setDiamonds([
      ...diamonds,
      {
        ...parsed,
        box: boxNumber,
      },
    ]);
    setInput('');
  };

  const getSummary = (filterFn) => {
    const summary = {};
    diamonds.filter(filterFn).forEach((d) => {
      if (!summary[d.shape]) {
        summary[d.shape] = {
          box: d.box,
          count: 0,
          totalCent: 0,
          totalCarat: 0,
        };
      }
      summary[d.shape].count += 1;
      summary[d.shape].totalCent += d.centWeight;
      summary[d.shape].totalCarat += d.caratWeight;
    });
    return summary;
  };

  const normalSummary = getSummary((d) => d.caratWeight <= 0.1);
  const bigSummary = getSummary((d) => d.caratWeight > 0.1);

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-xl font-bold mb-4">Diamond Sorter</h1>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          className="border px-2 py-1 flex-1"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste barcode data..."
        />
        <button onClick={handleAdd} className="bg-blue-500 text-white px-4 py-1 rounded">
          Add
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h2 className="text-lg font-semibold mb-2">Normal Diamonds (≤ 0.100 ct)</h2>
          {Object.entries(normalSummary).map(([shape, data]) => (
            <div key={shape} className="border p-2 rounded mb-2">
              <strong>Box {data.box} - {shape}</strong><br />
              Packets: {data.count}<br />
              Total Cent: {data.totalCent.toFixed(3)}<br />
              Total Carat: {data.totalCarat.toFixed(3)}
            </div>
          ))}
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2 text-red-600">Big Diamonds (> 0.100 ct)</h2>
          {Object.entries(bigSummary).map(([shape, data]) => (
            <div key={shape} className="border p-2 rounded mb-2 bg-red-50">
              <strong>Box {data.box} - {shape}</strong><br />
              Packets: {data.count}<br />
              Total Cent: {data.totalCent.toFixed(3)}<br />
              Total Carat: {data.totalCarat.toFixed(3)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
