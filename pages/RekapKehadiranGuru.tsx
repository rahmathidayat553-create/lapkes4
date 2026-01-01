
import React, { useContext, useState, useMemo } from 'react';
import { DataContext } from '../context/DataContext';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

const RekapKehadiranGuruPage: React.FC = () => {
    const context = useContext(DataContext);
    const [filterTipe, setFilterTipe] = useState<string>('bulan');
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
    const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().slice(0, 7));
    const inputStyles = "mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500";


    if (!context) return null;
    const { kehadiranGuru, gurus } = context;

    const filteredData = useMemo(() => {
        let data = [...kehadiranGuru];

        // Filter by date
        if (filterTipe === 'rentang') {
            if (startDate && endDate) {
                data = data.filter(d => d.tanggal >= startDate && d.tanggal <= endDate);
            }
        } else if (filterTipe === 'bulan') {
            data = data.filter(d => d.tanggal.startsWith(selectedMonth));
        } else if (filterTipe === 'minggu') {
            const today = new Date();
            const firstDayOfWeek = new Date(today.setDate(today.getDate() - today.getDay())).toISOString().split('T')[0];
            const lastDayOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 6)).toISOString().split('T')[0];
            data = data.filter(d => d.tanggal >= firstDayOfWeek && d.tanggal <= lastDayOfWeek);
        }
        
        // Aggregate data
        const aggregated: { [guruId: string]: { totalPertemuan: number } } = {};
        
        data.forEach(harian => {
            harian.kehadiran.forEach(rekaman => {
                if (!aggregated[rekaman.guruId]) {
                    aggregated[rekaman.guruId] = { totalPertemuan: 0 };
                }
                aggregated[rekaman.guruId].totalPertemuan += rekaman.jumlahPertemuan;
            });
        });
        
        return Object.entries(aggregated).map(([guruId, { totalPertemuan }]) => ({
            guru: gurus.find(g => g.id === guruId),
            totalPertemuan,
        })).filter(item => item.guru);

    }, [kehadiranGuru, filterTipe, startDate, endDate, selectedMonth, gurus]);

    const exportToPDF = () => {
        const doc = new jsPDF();
        doc.text("Rekap Kehadiran Guru", 14, 16);
        
        const tableData = filteredData.map(d => [
            d.guru?.nama_guru || 'N/A',
            d.guru?.status || 'N/A',
            d.guru?.nip || '-',
            d.totalPertemuan
        ]);

        (doc as any).autoTable({
            head: [['Nama Guru', 'Status', 'NIP', 'Total Pertemuan']],
            body: tableData,
            startY: 20,
        });
        doc.save("rekap_kehadiran_guru.pdf");
    };
    
    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-100 mb-6">Rekap Kehadiran Guru</h1>

            <div className="bg-gray-800 p-4 rounded-lg shadow-md mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <div>
                        <label className="block text-sm font-medium text-gray-300">Filter Tanggal</label>
                        <select value={filterTipe} onChange={e => setFilterTipe(e.target.value)} className={inputStyles}>
                            <option value="bulan">Per Bulan</option>
                            <option value="minggu">Per Minggu Ini</option>
                            <option value="rentang">Rentang Tanggal</option>
                        </select>
                    </div>
                    {filterTipe === 'rentang' && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-gray-300">Tanggal Awal</label>
                                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className={inputStyles} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300">Tanggal Akhir</label>
                                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className={inputStyles} />
                            </div>
                        </>
                    )}
                     {filterTipe === 'bulan' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-300">Pilih Bulan</label>
                            <input type="month" value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} className={inputStyles} />
                        </div>
                    )}
                </div>
                 <div className="flex justify-end mt-4">
                    <button onClick={exportToPDF} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">Export PDF</button>
                </div>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg shadow-md">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-700">
                        <thead className="bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider whitespace-nowrap">Nama Guru</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider whitespace-nowrap">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider whitespace-nowrap">NIP</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider whitespace-nowrap">Total Pertemuan</th>
                            </tr>
                        </thead>
                        <tbody className="bg-gray-800 divide-y divide-gray-700">
                            {filteredData.map(({ guru, totalPertemuan }) => (
                                <tr key={guru?.id} className="hover:bg-gray-700">
                                    <td className="px-6 py-4 whitespace-nowrap">{guru?.nama_guru}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{guru?.status}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{guru?.nip || '-'}</td>
                                    <td className="px-6 py-4 text-center whitespace-nowrap">{totalPertemuan}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default RekapKehadiranGuruPage;
