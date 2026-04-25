import React, { useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATH } from "../../utils/apiPath";
import { FileSpreadsheet, Download } from "lucide-react";
import * as XLSX from "xlsx";
import toast from "react-hot-toast";

const AdminReports = () => {
    const [loading, setLoading] = useState(false);

    const generateReport = async (type) => {
        setLoading(true);
        try {
            const response = await axiosInstance.get(API_PATH.ADMIN.REPORTS);
            const { users, jobs, applications, faqs, jobFaqs, employerSettings } = response.data;

            let data = [];
            let filename = "";

            // Helper function to style worksheet
            const styleWorksheet = (ws, headers) => {
                // Set column widths
                ws['!cols'] = headers.map(h => ({ wch: Math.max(h.length + 5, 15) }));
                return ws;
            };

            if (type === "users") {
                data = users.map((u) => ({
                    "Full Name": u.fullName || "N/A",
                    "Email Address": u.email || "N/A",
                    "Role": u.role ? u.role.charAt(0).toUpperCase() + u.role.slice(1) : "N/A",
                    "Phone": u.phone || "N/A",
                    "University": u.university || "N/A",
                    "Degree": u.degree || "N/A",
                    "Company": u.companyName || "N/A",
                    "Date Joined": new Date(u.createdAt).toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' }),
                }));
                filename = `Users_Report_${new Date().toISOString().split('T')[0]}`;
            } else if (type === "jobs") {
                data = jobs.map((j) => ({
                    "Job Title": j.title || "N/A",
                    "Company": j.company?.companyName || "N/A",
                    "Category": j.category || "N/A",
                    "Job Type": j.type || "N/A",
                    "Location": j.location || "N/A",
                    "Salary Range": j.salaryMin && j.salaryMax ? `₱${j.salaryMin.toLocaleString()} - ₱${j.salaryMax.toLocaleString()}` : "Not specified",
                    "Status": j.isClosed ? "Closed" : "Active",
                    "Date Posted": new Date(j.createdAt).toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' }),
                }));
                filename = `Jobs_Report_${new Date().toISOString().split('T')[0]}`;
            } else if (type === "applications") {
                data = applications.map((a) => ({
                    "Applicant Name": a.applicant?.fullName || "N/A",
                    "Email": a.applicant?.email || "N/A",
                    "Job Title": a.job?.title || "N/A",
                    "Company": a.job?.company?.companyName || "N/A",
                    "Application Status": a.status || "N/A",
                    "Cover Letter": a.coverLetter ? "Yes" : "No",
                    "Date Applied": new Date(a.createdAt).toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' }),
                }));
                filename = `Applications_Report_${new Date().toISOString().split('T')[0]}`;
            } else if (type === "faqs") {
                data = (faqs || []).map((f) => ({
                    "Question": f.question || "N/A",
                    "Answer": f.answer || "N/A",
                    "Category": f.category || "General",
                    "Order": f.order || 0,
                    "Active": f.isActive ? "Yes" : "No",
                }));
                filename = `FAQs_Report_${new Date().toISOString().split('T')[0]}`;
            } else if (type === "jobFaqs") {
                data = (jobFaqs || []).map((jf) => ({
                    "Question": jf.question || "N/A",
                    "Answer": jf.answer || "N/A",
                    "Keywords": (jf.keywords || []).join(", ") || "N/A",
                    "Employer": jf.employer?.companyName || jf.employer?.fullName || "N/A",
                    "Job Title": jf.job?.title || "General",
                    "Date Created": new Date(jf.createdAt).toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' }),
                }));
                filename = `Job_FAQs_Report_${new Date().toISOString().split('T')[0]}`;
            } else if (type === "employerSettings") {
                data = (employerSettings || []).map((es) => ({
                    "Employer": es.user?.companyName || es.user?.fullName || "N/A",
                    "Email": es.user?.email || "N/A",
                    "Timezone": es.timezone || "N/A",
                    "Business Hours": es.businessHours ? `${es.businessHours.start || "N/A"} - ${es.businessHours.end || "N/A"}` : "N/A",
                    "Auto Reply": es.autoReplyMessage || "No auto reply set",
                }));
                filename = `Employer_Settings_Report_${new Date().toISOString().split('T')[0]}`;
            } else if (type === "all") {
                // Create a workbook with multiple sheets
                const wb = XLSX.utils.book_new();

                const usersData = users.map((u) => ({
                    "Full Name": u.fullName || "N/A",
                    "Email Address": u.email || "N/A",
                    "Role": u.role ? u.role.charAt(0).toUpperCase() + u.role.slice(1) : "N/A",
                    "Phone": u.phone || "N/A",
                    "University": u.university || "N/A",
                    "Company": u.companyName || "N/A",
                    "Date Joined": new Date(u.createdAt).toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' }),
                }));
                if (usersData.length) {
                    const usersWs = styleWorksheet(XLSX.utils.json_to_sheet(usersData), Object.keys(usersData[0]));
                    XLSX.utils.book_append_sheet(wb, usersWs, "Users");
                }

                const jobsData = jobs.map((j) => ({
                    "Job Title": j.title || "N/A",
                    "Company": j.company?.companyName || "N/A",
                    "Category": j.category || "N/A",
                    "Job Type": j.type || "N/A",
                    "Location": j.location || "N/A",
                    "Salary Range": j.salaryMin && j.salaryMax ? `₱${j.salaryMin.toLocaleString()} - ₱${j.salaryMax.toLocaleString()}` : "Not specified",
                    "Status": j.isClosed ? "Closed" : "Active",
                    "Date Posted": new Date(j.createdAt).toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' }),
                }));
                if (jobsData.length) {
                    const jobsWs = styleWorksheet(XLSX.utils.json_to_sheet(jobsData), Object.keys(jobsData[0]));
                    XLSX.utils.book_append_sheet(wb, jobsWs, "Jobs");
                }

                const appsData = applications.map((a) => ({
                    "Applicant Name": a.applicant?.fullName || "N/A",
                    "Email": a.applicant?.email || "N/A",
                    "Job Title": a.job?.title || "N/A",
                    "Company": a.job?.company?.companyName || "N/A",
                    "Application Status": a.status || "N/A",
                    "Date Applied": new Date(a.createdAt).toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' }),
                }));
                if (appsData.length) {
                    const appsWs = styleWorksheet(XLSX.utils.json_to_sheet(appsData), Object.keys(appsData[0]));
                    XLSX.utils.book_append_sheet(wb, appsWs, "Applications");
                }

                const faqsData = (faqs || []).map((f) => ({
                    "Question": f.question || "N/A",
                    "Answer": f.answer || "N/A",
                    "Category": f.category || "General",
                    "Active": f.isActive ? "Yes" : "No",
                }));
                if (faqsData.length) {
                    const faqsWs = styleWorksheet(XLSX.utils.json_to_sheet(faqsData), Object.keys(faqsData[0]));
                    XLSX.utils.book_append_sheet(wb, faqsWs, "FAQs");
                }

                const jobFaqsData = (jobFaqs || []).map((jf) => ({
                    "Question": jf.question || "N/A",
                    "Answer": jf.answer || "N/A",
                    "Employer": jf.employer?.companyName || jf.employer?.fullName || "N/A",
                    "Job Title": jf.job?.title || "General",
                }));
                if (jobFaqsData.length) {
                    const jobFaqsWs = styleWorksheet(XLSX.utils.json_to_sheet(jobFaqsData), Object.keys(jobFaqsData[0]));
                    XLSX.utils.book_append_sheet(wb, jobFaqsWs, "Job FAQs");
                }

                const empSettingsData = (employerSettings || []).map((es) => ({
                    "Employer": es.user?.companyName || es.user?.fullName || "N/A",
                    "Email": es.user?.email || "N/A",
                    "Timezone": es.timezone || "N/A",
                    "Auto Reply": es.autoReplyMessage || "N/A",
                }));
                if (empSettingsData.length) {
                    const empSettingsWs = styleWorksheet(XLSX.utils.json_to_sheet(empSettingsData), Object.keys(empSettingsData[0]));
                    XLSX.utils.book_append_sheet(wb, empSettingsWs, "Employer Settings");
                }

                XLSX.writeFile(wb, `GradSync_Full_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
                toast.success("Full system report downloaded");
                setLoading(false);
                return;
            }

            // Single sheet export with styling
            if (data.length === 0) {
                toast.error("No data available for this report");
                setLoading(false);
                return;
            }
            const ws = styleWorksheet(XLSX.utils.json_to_sheet(data), Object.keys(data[0] || {}));
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Report");
            XLSX.writeFile(wb, `${filename}.xlsx`);
            toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} report downloaded`);

        } catch (error) {
            console.error("Error generating report:", error);
            toast.error("Failed to generate report");
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout activeMenu="admin-reports">
            <div className="p-6 max-w-7xl mx-auto">
                <h1 className="text-2xl font-bold text-gray-900 mb-8">
                    System Reports
                </h1>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <ReportCard
                        title="Full System Report"
                        description="Complete data dump including all users, jobs, applications, FAQs, and settings."
                        onClick={() => generateReport("all")}
                        loading={loading}
                        gradient="from-blue-500 to-blue-600"
                    />
                    <ReportCard
                        title="Users Report"
                        description="List of all registered graduates and employers."
                        onClick={() => generateReport("users")}
                        loading={loading}
                        gradient="from-green-500 to-green-600"
                    />
                    <ReportCard
                        title="Jobs Report"
                        description="Details of all active and closed job postings."
                        onClick={() => generateReport("jobs")}
                        loading={loading}
                        gradient="from-purple-500 to-purple-600"
                    />
                    <ReportCard
                        title="Applications Report"
                        description="Track all job applications and their status."
                        onClick={() => generateReport("applications")}
                        loading={loading}
                        gradient="from-orange-500 to-orange-600"
                    />
                    <ReportCard
                        title="FAQs Report"
                        description="All system FAQs with categories and status."
                        onClick={() => generateReport("faqs")}
                        loading={loading}
                        gradient="from-teal-500 to-teal-600"
                    />
                    <ReportCard
                        title="Job FAQs Report"
                        description="Employer-specific FAQs for job postings."
                        onClick={() => generateReport("jobFaqs")}
                        loading={loading}
                        gradient="from-pink-500 to-pink-600"
                    />
                    <ReportCard
                        title="Employer Settings Report"
                        description="Employer configurations and auto-reply settings."
                        onClick={() => generateReport("employerSettings")}
                        loading={loading}
                        gradient="from-indigo-500 to-indigo-600"
                    />
                </div>
            </div>
        </DashboardLayout>
    );
};

const ReportCard = ({ title, description, onClick, loading, gradient }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group" onClick={!loading ? onClick : undefined}>
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform duration-300`}>
            <FileSpreadsheet className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-500 text-sm mb-6 leading-relaxed">{description}</p>
        <button
            disabled={loading}
            className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 group-hover:translate-x-1 transition-transform"
        >
            <Download className="w-4 h-4" />
            {loading ? "Generating..." : "Download Excel"}
        </button>
    </div>
);

export default AdminReports;
