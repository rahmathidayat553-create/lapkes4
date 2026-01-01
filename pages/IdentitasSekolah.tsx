
import React, { useContext, useState, useEffect } from 'react';
import { DataContext } from '../context/DataContext';
import { IdentitasSekolah, Jenjang, HariFormat } from '../types';

const IdentitasSekolahPage: React.FC = () => {
    const context = useContext(DataContext);
    const [formData, setFormData] = useState<IdentitasSekolah>({
        id: '1', npsn: '', nama_sekolah: '', jenjang: Jenjang.SMA, nama_kepsek: '', nama_wakasek: '', alamat: '', logo: '', format: HariFormat.LIMA
    });

    useEffect(() => {
        if (context?.identitasSekolah) {
            setFormData(context.identitasSekolah);
        }
    }, [context?.identitasSekolah]);

    if (!context) return <div>Loading...</div>;

    const { setIdentitasSekolah, setIsLoading, setNotification } = context;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validasi ukuran file maks 2MB
            if (file.size > 2 * 1024 * 1024) {
                alert("Ukuran file logo maksimal 2MB");
                e.target.value = ''; // Reset input
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, logo: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validasi NPSN (8 digit angka)
        if (!/^\d{8}$/.test(formData.npsn)) {
            alert("NPSN harus terdiri dari 8 digit angka!");
            return;
        }

        setIsLoading(true);
        setTimeout(() => {
            // Gunakan UUID jika ID masih default '1'
            const finalData = { ...formData };
            if (finalData.id === '1') {
                finalData.id = crypto.randomUUID();
            }

            setIdentitasSekolah(finalData);
            setIsLoading(false);
            setNotification({ type: 'success', message: 'Data identitas sekolah berhasil diperbarui!' });
        }, 500);
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-100 mb-6">Data Identitas Sekolah</h1>
            <div className="bg-gray-800 p-8 rounded-lg shadow-md">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-300">Nama Sekolah</label>
                            <input type="text" name="nama_sekolah" value={formData.nama_sekolah} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" required/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300">NPSN (8 Digit Angka)</label>
                            <input type="text" name="npsn" value={formData.npsn} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" required maxLength={8}/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300">Jenjang</label>
                            <select name="jenjang" value={formData.jenjang} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                                {Object.values(Jenjang).map(j => <option key={j} value={j}>{j}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300">Format Hari Sekolah</label>
                            <select name="format" value={formData.format} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                                {Object.values(HariFormat).map(f => <option key={f} value={f}>{f}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300">Nama Kepala Sekolah</label>
                            <input type="text" name="nama_kepsek" value={formData.nama_kepsek} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" required/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300">Nama Wakasek Kesiswaan</label>
                            <input type="text" name="nama_wakasek" value={formData.nama_wakasek} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" required/>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-300">Alamat</label>
                            <textarea name="alamat" value={formData.alamat} onChange={handleChange} rows={3} className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" required></textarea>
                        </div>
                         <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-300">Logo Sekolah (Maks 2MB)</label>
                            <div className="mt-1 flex items-center space-x-4">
                                {formData.logo && <img src={formData.logo} alt="Logo" className="h-16 w-16 object-contain rounded-md border border-gray-600" />}
                                <input type="file" accept="image/*" onChange={handleLogoChange} className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-500 file:text-white hover:file:bg-indigo-600"/>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <button type="submit" className="px-6 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                            Simpan Perubahan
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default IdentitasSekolahPage;
