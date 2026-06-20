import StarRating from "./StarRating";

/**
 * JobRatingBadge — compact pill shown on job cards.
 * Shows the aggregate star score + review count.
 */
const JobRatingBadge = ({ averageRating = 0, ratingCount = 0, size = "sm" }) => {
  if (ratingCount === 0) return null;

  return (
    <div className="flex items-center gap-1.5">
      <StarRating value={Math.round(averageRating)} size={size} readOnly />
      <span className="text-xs font-bold text-amber-600">{averageRating.toFixed(1)}</span>
      <span className="text-xs text-gray-400">({ratingCount})</span>
    </div>
  );
};

export default JobRatingBadge;
