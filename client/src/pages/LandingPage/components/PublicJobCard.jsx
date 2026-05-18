import { Building, Building2, Calendar, MapPin, ArrowRight } from "lucide-react";
import moment from "moment";

const PublicJobCard = ({ job, onClick, className }) => {
    return (
        <div
            className={`bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-xl hover:shadow-gray-200 transition-all duration-300 group relative overflow-hidden cursor-pointer ${className}`}
            onClick={onClick}
        >
            {/* Top section */}
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                    {job?.company?.companyLogo ? (
                        <img
                            src={job?.company?.companyLogo}
                            alt="Company Logo"
                            className="w-10 h-10 object-cover rounded-xl border-2 border-white/20 shadow-sm"
                        />
                    ) : (
                        <div className="w-10 h-10 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-center">
                            <Building2 className="h-5 w-5 text-gray-400" />
                        </div>
                    )}

                    <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 text-sm group-hover:text-blue-600 transition-colors leading-snug">
                            {job?.title}
                        </h3>
                        <p className="text-gray-600 text-xs flex items-center gap-1.5 mt-0.5">
                            <Building className="w-3 h-3" />
                            {job?.company?.companyName}
                        </p>
                    </div>
                </div>
            </div>

            {/* Tags */}
            {/* <div className="mb-4">
                <div className="flex items-center gap-1.5 text-[10px] flex-wrap">
                    <span className="flex items-center gap-1 bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full font-medium">
                        <MapPin className="w-2.5 h-2.5" />
                        {job?.location || "Remote"}
                    </span>
                    <span
                        className={`px-2 py-0.5 rounded-full font-medium ${job?.type === "Full Time"
                            ? "bg-green-100 text-green-800"
                            : job?.type === "Part-Time"
                                ? "bg-yellow-100 text-yellow-800"
                                : job?.type === "Contract"
                                    ? "bg-blue-100 text-blue-800"
                                    : job?.type === "Internship"
                                        ? "bg-indigo-100 text-indigo-800"
                                        : "bg-gray-100 text-gray-800"
                            }`}
                    >
                        {job?.type}
                    </span>
                    <span className="flex items-center gap-1 bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full font-medium">
                        {job?.category}
                    </span>
                </div>
            </div> */}

            {/* Date and CTA */}
            <div className="flex items-center justify-between pt-3 ">
                <div className="flex items-center gap-1 text-[10px] font-medium text-gray-500">
                    <Calendar className="w-3 h-3" />
                    {job?.createdAt
                        ? moment(job?.createdAt).format("Do MMM, YYYY")
                        : "N/A"}
                </div>

                <div className="flex items-center gap-1 text-xs font-semibold text-blue-600 group-hover:translate-x-1 transition-transform">
                    View Details
                    <ArrowRight className="w-3 h-3" />
                </div>
            </div>
        </div>
    );
};

export default PublicJobCard;
