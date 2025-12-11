import React, { useEffect, useState } from "react";
import axiosInstance from "../../../utils/axiosInstance";
import { API_PATH } from "../../../utils/apiPath";

const CompanyShowcase = () => {
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCompanies = async () => {
            try {
                const response = await axiosInstance.get(API_PATH.USERS.GET_ALL_EMPLOYERS);
                const validCompanies = response.data.filter(c => c.companyName);
                setCompanies(validCompanies);
            } catch (error) {
                console.error("Error fetching companies:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCompanies();
    }, []);

    if (loading || companies.length === 0) {
        return null;
    }

    return (
        <section className="py-16 bg-white border-b border-gray-100">
            <div className="container mx-auto px-6 text-center mb-10">
                <h2 className="text-2xl font-bold text-gray-500 uppercase tracking-widest">Trusted by Companies</h2>
            </div>

            {/* Static Company Grid */}
            <div className="container mx-auto px-6">
                <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 lg:gap-16">
                    {companies.map((company) => (
                        <div
                            key={company._id}
                            className="flex flex-col items-center justify-center grayscale hover:grayscale-0 transition-all duration-300 opacity-60 hover:opacity-100"
                        >
                            {company.companyLogo ? (
                                <img
                                    src={company.companyLogo}
                                    alt={company.companyName}
                                    className="h-16 md:h-20 w-auto object-contain max-w-[180px]"
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                        e.target.nextSibling.style.display = 'flex';
                                    }}
                                />
                            ) : null}

                            {/* Fallback if no logo */}
                            <div
                                className="flex items-center gap-2"
                                style={{ display: company.companyLogo ? 'none' : 'flex' }}
                            >
                                <span className="font-bold text-xl md:text-2xl text-gray-700">{company.companyName}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default CompanyShowcase;
