import React from "react";
import { motion } from "framer-motion";

const DifficultyCard = ({ level, description, isSelected, onSelect }) => {
    return (
        <motion.div
            className={`bg-white rounded-xl p-6 shadow-md transition-all duration-300 border-2 cursor-pointer hover:-translate-y-1 hover:shadow-lg ${
                isSelected ? "border-blue-500 bg-blue-50" : "border-transparent"
            }`}
            onClick={() => onSelect(level)}
            whileTap={{ scale: 0.98 }}
        >
            <h3 className="text-xl font-semibold mb-2 text-gray-800">{level}</h3>
            <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
        </motion.div>
    );
};

export default DifficultyCard;
