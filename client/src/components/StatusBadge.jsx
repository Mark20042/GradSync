import { CheckCircle, XCircle, Clock, Send, AlertCircle } from "lucide-react";

const StatusBadge = ({ status }) => {
  const statusConfig = {
    Applied: {
      color: "bg-blue-50 text-blue-700 border-blue-200",
      icon: Send,
    },
    "In Review": {
      color: "bg-amber-50 text-amber-700 border-amber-200",
      icon: Clock,
    },
    Accepted: {
      color: "bg-emerald-50 text-emerald-700 border-emerald-200",
      icon: CheckCircle,
    },
    Rejected: {
      color: "bg-red-50 text-red-700 border-red-200",
      icon: XCircle,
    },
    default: {
      color: "bg-gray-50 text-gray-700 border-gray-200",
      icon: AlertCircle,
    },
  };

  const config = statusConfig[status] || statusConfig.default;
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full border ${config.color} shadow-sm transition-all duration-200 hover:shadow-md`}
    >
      <Icon className="w-3.5 h-3.5" />
      {status}
    </span>
  );
};

export default StatusBadge;
