
import React, { useContext, useState, useMemo } from 'react';
import { DataContext } from '../context/DataContext';
import { KehadiranSiswa, Kelas, Siswa } from '../types';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

const RekapKehadiranSiswaPage: React.FC = () => {
    const context = useContext(DataContext);
    const [filterKelas, setFilterKelas] = useState<string>('semua');
    const [filterTipe, setFilterTipe] = useState<string>('bulan');
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
    const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().slice(0, 7));
    const inputStyles = "mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500";


    if (!context) return null;
    const { kehadiranSiswa, siswas, kelasList } = context;

    const filteredData = useMemo(() => {
        let data = [...kehadiranSiswa];

        // Filter by class
        if (filterKelas !== 'semua') {
            data = data.filter(d => d.kelasId === filterKelas);
        }

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
        const aggregated: { [siswaId: string]: { siswa: Siswa | undefined, kelas: Kelas | undefined, H: number, S: number, I: number, A: number } } = {};
        
        data.forEach(harian => {
            harian.kehadiran.forEach(rekaman => {
                if (!aggregated[rekaman.siswaId]) {
                    aggregated[rekaman.siswaId] = {
                        siswa: siswas.find(s => s.id === rekaman.siswaId),
                        kelas: kelasList.find(k => k.id === harian.kelasId),
                        H: 0, S: 0, I: 0, A: 0
                    };
                }
                rekaman.status.forEach(status => {
                    if(status) aggregated[rekaman.siswaId][status]++;
                });
            });
        });
        
        return Object.values(aggregated).filter(item => item.siswa && item.kelas && !item.siswa.mutasi);

    }, [kehadiranSiswa, filterKelas, filterTipe, startDate, endDate, selectedMonth, siswas, kelasList]);

    const exportToPDF = () => {
        const doc = new jsPDF();
        doc.text("Rekap Kehadiran Siswa", 14, 16);

        const tableData = filteredData.map(d => [
            d.siswa?.nama_siswa || 'N/A',
            d.kelas?.nama_kelas || 'N/A',
            d.H,
            d.S,
            d.I,
            d.A
        ]);

        (doc as any).autoTable({
            head: [['Nama Siswa', 'Kelas', 'Hadir', 'Sakit', 'Izin', 'Alpa']],
            body: tableData,
            startY: 20,
        });
        doc.save("rekap_kehadiran_siswa.pdf");
    };

    const exportToExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(filteredData.map(d => ({
            "Nama Siswa": d.siswa?.nama_siswa,
            "Kelas": d.kelas?.nama_kelas,
            "Hadir": d.H,
            "Sakit": d.S,
            "Izin": d.I,
            "Alpa": d.A,
        })));
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Kehadiran Siswa");
        XLSX.writeFile(workbook, "rekap_kehadiran_siswa.xlsx");
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-100 mb-6">Rekap Kehadiran Siswa</h1>

            <div className="bg-gray-800 p-4 rounded-lg shadow-md mb-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div>
                        <label className="block text-sm font-medium text-gray-300">Kelas</label>
                        <select value={filterKelas} onChange={e => setFilterKelas(e.target.value)} className={inputStyles}>
                            <option value="semua">Semua Kelas</option>
                            {kelasList.map(k => <option key={k.id} value={k.id}>{k.nama_kelas}</option>)}
                        </select>
                    </div>
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
                 <div className="flex justify-end mt-4 space-x-2">
                    <button onClick={exportToPDF} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">Export PDF</button>
                    <button onClick={exportToExcel} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">Export Excel</button>
                </div>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg shadow-md">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-700">
                        <thead className="bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider whitespace-nowrap">Nama Siswa</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider whitespace-nowrap">Kelas</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider whitespace-nowrap">Hadir</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider whitespace-nowrap">Sakit</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider whitespace-nowrap">Izin</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider whitespace-nowrap">Alpa</th>
                            </tr>
                        </thead>
                        <tbody className="bg-gray-800 divide-y divide-gray-700">
                            {filteredData.map(({ siswa, kelas, H, S, I, A }) => (
                                <tr key={siswa?.id} className="hover:bg-gray-700">
                                    <td className="px-6 py-4 whitespace-nowrap">{siswa?.nama_siswa}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{kelas?.nama_kelas}</td>
                                    <td className="px-6 py-4 text-center whitespace-nowrap">{H}</td>
                                    <td className="px-6 py-4 text-center whitespace-nowrap">{S}</td>
                                    <td className="px-6 py-4 text-center whitespace-nowrap">{I}</td>
                                    <td className="px-6 py-4 text-center whitespace-nowrap">{A}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default RekapKehadiranSiswaPage;
