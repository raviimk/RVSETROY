import React, { useState } from 'react';

export default function PacketVerifier() {
  const [bunchNo, setBunchNo] = useState('');
  const [serverPackets, setServerPackets] = useState([]);
  const [scannedPackets, setScannedPackets] = useState([]);
  const [extraPackets, setExtraPackets] = useState([]);
  const [inputValue, setInputValue] = useState('');

  const fetchBunchData = async () => {
    if (!bunchNo) return alert('Please enter bunch no');
    const filterJSON = JSON.stringify([
      { field: 'BUNCHNO', op: 'eq', data: bunchNo }
    ]);
    const url = `http://192.168.192.253/Common/BindMastersDetails?serviceName=STOCK_GALAXY_LOTMAKING_DETAIL_GET&myfilters=${encodeURIComponent(filterJSON)}&page=1&rows=100`;

    try {
      const res = await fetch(url);
      const result = await res.json();
      const packets = result.rows || [];
      const formatted = packets.map(pkt => ({
        packetNo: pkt.STONENAME,
        shape: pkt.Shape,
        centWeight: parseFloat(pkt['Ro Wgt']) || 0,
        caratWeight: parseFloat(pkt['EP Wgt']) || 0,
      }));
      setServerPackets(formatted);
      setScannedPackets([]);
      setExtraPackets([]);
    } catch (err) {
      alert('Server error fetching bunch data');
    }
  };

  const handleScan = (e) => {
    if (e.key === 'Enter') {
      const code = inputValue.trim();
      setInputValue('');
      if (!code) return;

      const match = serverPackets.find(pkt => pkt.packetNo === code);

      if (match) {
        if (!scannedPackets.find(pkt => pkt.packetNo === code)) {
          setScannedPackets(prev => [...prev, match]);
        }
      } else {
        // Not found in original 25
        const dummy = {
          packetNo: code,
          shape: 'UNKNOWN',
          note: 'Not in original bunch'
        };
        setExtraPackets(prev => [...prev, dummy]);
      }
    }
  };

  const isScanned = (packetNo) => scannedPackets.some(pkt => pkt.packetNo === packetNo);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">📦 Packet Verifier</h1>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Enter Bunch No (e.g. B-1011)"
          value={bunchNo}
          onChange={(e) => setBunchNo(e.target.value)}
          className="border px-3 py-2 mr-2 rounded"
        />
        <button onClick={fetchBunchData} className="bg-blue-600 text-white px-4 py-2 rounded">Fetch Packets</button>
      </div>

      {serverPackets.length > 0 && (
        <>
          <div className="mb-4">
            <input
              type="text"
              placeholder="Scan Packet Barcode"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleScan}
              className="border px-3 py-2 w-72"
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <h2 className="text-xl font-semibold mb-2">✅ Expected Packets (From Bunch)</h2>
              <table className="w-full border">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="border px-2">Packet No</th>
                    <th className="border px-2">Shape</th>
                    <th className="border px-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {serverPackets.map((pkt, i) => (
                    <tr key={i} className={isScanned(pkt.packetNo) ? 'bg-green-100' : 'bg-white'}>
                      <td className="border px-2 py-1">{pkt.packetNo}</td>
                      <td className="border px-2 py-1">{pkt.shape}</td>
                      <td className="border px-2 py-1">{isScanned(pkt.packetNo) ? 'Matched' : 'Missing'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-2 text-red-600">❌ Extra Scanned Packets</h2>
              <table className="w-full border">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="border px-2">Packet No</th>
                    <th className="border px-2">Note</th>
                  </tr>
                </thead>
                <tbody>
                  {extraPackets.map((pkt, i) => (
                    <tr key={i} className="bg-red-100">
                      <td className="border px-2 py-1">{pkt.packetNo}</td>
                      <td className="border px-2 py-1">{pkt.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
