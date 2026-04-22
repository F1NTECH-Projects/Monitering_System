"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Activity, Pill, Printer, Calendar, FileText } from "lucide-react";
import axios from "axios";

export default function PrescriptionPage() {
    const params = useParams();
    const patientId = params.id as string;
    
    const [patient, setPatient] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch patient + clinic info based on the URL parameter
        const fetchDetails = async () => {
             try {
                // Because this might be shared, we usually pass a public token.
                // For demonstration, we simulate data based on the API hook, 
                // but in a real setting, it would hit a dedicated public endpoint.
                // We'll mock the specific patient details but use the dynamic ID context.
                // Or better, fetch locally from API using local storage token.
                
                const token = localStorage.getItem("auth-storage") 
                     ? JSON.parse(localStorage.getItem("auth-storage") as string).state.token 
                     : null;

                const url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
                const res = await axios.get(`${url}/patients/${patientId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                setPatient(res.data);
             } catch (e) {
                 console.error(e);
             } finally {
                 setLoading(false);
             }
        };

        fetchDetails();
    }, [patientId]);

    const handlePrint = () => {
        window.print();
    };

    if (loading) {
        return <div className="h-screen flex items-center justify-center font-bold text-[#818cf8]">Preparing Document...</div>;
    }

    if (!patient) {
        return <div className="h-screen flex items-center justify-center font-bold text-red-500">Patient Data Not Found</div>;
    }

    const today = new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10 print:py-0 print:bg-white text-black">
            
            <div className="mb-6 print:hidden">
                <button onClick={handlePrint} className="bg-[#6246ea] text-white px-6 py-2.5 rounded-full font-bold shadow-lg gap-2 flex items-center hover:bg-[#7c3aed] transition-colors">
                    <Printer size={18} /> Print Document
                </button>
            </div>

            <div className="w-full max-w-3xl bg-white shadow-2xl print:shadow-none p-12 print:p-0 rounded-2xl print:rounded-none relative">
                {/* Header */}
                <div className="flex justify-between items-start border-b-2 border-gray-100 pb-8 mb-8">
                     <div className="flex items-center gap-3">
                         <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center print:border print:border-black">
                             <Activity size={24} />
                         </div>
                         <div>
                             <h1 className="text-3xl font-black text-gray-900 tracking-tight" style={{ fontFamily: "Outfit, sans-serif" }}>ClinicFlow Clinic</h1>
                             <p className="text-sm text-gray-500 font-semibold uppercase tracking-widest mt-1">Specialized Healthcare</p>
                         </div>
                     </div>
                     <div className="text-right">
                         <p className="text-sm text-gray-600 font-semibold mb-1">Date: {today}</p>
                         <p className="text-sm text-gray-600 font-semibold">Rx No: #{patient._id?.substring(patient._id.length - 6).toUpperCase() || patient.id}</p>
                     </div>
                </div>

                {/* Patient Info Row */}
                <div className="flex justify-between bg-gray-50 print:bg-white print:border p-4 rounded-xl mb-8">
                    <div>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Patient Name</p>
                        <p className="text-lg font-bold text-gray-900">{patient.name}</p>
                    </div>
                    <div>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Age / Sex</p>
                        <p className="text-lg font-bold text-gray-900">{patient.age || 28} Yrs</p>
                    </div>
                    <div>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Contact</p>
                        <p className="text-lg font-bold text-gray-900">{patient.phone}</p>
                    </div>
                </div>

                {/* Main Content */}
                <div className="min-h-[400px]">
                     <div className="flex items-center gap-2 mb-6">
                         <FileText size={20} className="text-indigo-500" />
                         <h2 className="text-xl font-bold text-gray-900">Clinical Notes</h2>
                     </div>
                     
                     <div className="text-gray-700 leading-relaxed space-y-4 whitespace-pre-wrap ml-7 mb-10">
                        {patient.notes || "Patient presented with general symptoms. Standard observation prescribed."}
                     </div>

                     <div className="flex items-center gap-2 mb-6 mt-12">
                         <Pill size={20} className="text-indigo-500" />
                         <h2 className="text-xl font-bold text-gray-900">Prescription Rx</h2>
                     </div>

                     <div className="ml-7 border-l-4 border-indigo-100 pl-4 space-y-6">
                         <div>
                             <p className="font-bold text-gray-900 text-lg">1. Paracetamol 500mg</p>
                             <p className="text-gray-600 font-medium text-sm mt-1">1 Tablet - After Meals (1-0-1)</p>
                             <p className="text-gray-500 text-sm">Duration: 5 Days</p>
                         </div>
                         <div>
                             <p className="font-bold text-gray-900 text-lg">2. Vitamin C Complex</p>
                             <p className="text-gray-600 font-medium text-sm mt-1">1 Tablet - Morning (1-0-0)</p>
                             <p className="text-gray-500 text-sm">Duration: 10 Days</p>
                         </div>
                     </div>
                </div>

                {/* Footer Signature */}
                <div className="mt-16 pt-8 border-t border-gray-100 flex justify-between items-end">
                    <div className="text-gray-500 text-xs">
                        Generated by ClinicFlow Platform<br/>
                        Validity: 1 month from issued date.
                    </div>
                    <div className="text-center">
                        <div className="w-40 border-b border-gray-400 mb-2"></div>
                        <p className="font-bold text-gray-900">Doctor's Signature</p>
                    </div>
                </div>
            </div>
            <style jsx global>{`
                @media print {
                   body { background-color: white !important; }
                   nav { display: none !important; }
                   html { filter: none !important; }
                }
            `}</style>
        </div>
    );
}
