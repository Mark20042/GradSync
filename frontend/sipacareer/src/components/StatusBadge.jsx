const StatusBadge = ({ status }) => {
  const statusConfig = {
    Applied: "bg-gray-300 text-gray-800",
    "In Review": "bg-yellow-300 text-yellow-800",
    Accepted: "bg-green-300 text-green-800",
    Rejected: "bg-red-300 text-red-800",
  };

  return (
    <span
      className={`px-3 py-1 text-sm font-medium rounded ${
        statusConfig[status] || "bg-gray-100 text-gray-800"
      }`}
    >
      {status}
    </span>
  );
};

export default StatusBadge;
