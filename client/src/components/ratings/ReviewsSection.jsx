import { useState, useEffect } from "react";
import { Star, ChevronDown, MessageSquare, ThumbsUp, Clock } from "lucide-react";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATH } from "../../utils/apiPath";
import StarRating from "./StarRating";

/**
 * ReviewsSection — used in both JobDetails and CompanyProfileView.
 * mode: "job" | "company"
 * entityId: jobId or companyId
 * summary: { averageRating, ratingCount, ratingSum } — pre-fetched from job/company object
 */
const ReviewsSection = ({ mode, entityId, summary = {}, filterJobId = null }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [expanded, setExpanded] = useState(false);

  const { averageRating = 0, ratingCount = 0 } = summary;

  const fetchReviews = async (p = 1) => {
    if (!entityId) return;
    setLoading(true);
    try {
      const endpoint =
        mode === "job"
          ? API_PATH.TERMINATION_REVIEWS.JOB_REVIEWS(entityId)
          : API_PATH.TERMINATION_REVIEWS.COMPANY_REVIEWS(entityId);
      const res = await axiosInstance.get(endpoint, { 
        params: { 
          page: p,
          ...(filterJobId ? { jobId: filterJobId } : {})
        } 
      });
      setReviews(p === 1 ? res.data.reviews : (prev) => [...prev, ...res.data.reviews]);
      setTotalPages(res.data.pages);
      setPage(p);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (expanded) {
      fetchReviews(1);
    }
  }, [expanded, filterJobId]);

  const ratingDistribution = () => {
    const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((r) => {
      if (r.rating >= 1 && r.rating <= 5) dist[r.rating]++;
    });
    return dist;
  };

  const dist = ratingDistribution();

  const tenureLabel = (days) => {
    if (!days) return null;
    if (days < 30) return `${days}d`;
    if (days < 365) return `${Math.round(days / 30)}mo`;
    return `${(days / 365).toFixed(1)}yr`;
  };

  if (ratingCount === 0) return null;

  return (
    <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header — always visible */}
      <button
        onClick={() => setExpanded((e) => !e)}
        className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50/50 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-center justify-center bg-amber-50 border border-amber-100 rounded-2xl w-16 h-16 shrink-0">
            <span className="text-2xl font-extrabold text-amber-600 leading-none">
              {averageRating.toFixed(1)}
            </span>
            <span className="text-[10px] text-amber-500 font-semibold mt-0.5">/ 5.0</span>
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
              {mode === "job" ? "Employee Reviews" : "Company Reviews"}
            </h2>
            <StarRating value={Math.round(averageRating)} size="sm" readOnly />
            <p className="text-xs text-gray-500 mt-1">
              Based on <strong>{ratingCount}</strong> anonymous{" "}
              {ratingCount === 1 ? "review" : "reviews"} from former employees
            </p>
          </div>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
        />
      </button>

      {/* Expandable content */}
      {expanded && (
        <div className="border-t border-gray-100 p-6 space-y-6">
          {/* Rating Distribution Bar */}
          {reviews.length > 0 && (
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((star) => (
                <div key={star} className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-gray-500 w-4">{star}</span>
                  <Star className="w-3 h-3 text-amber-400 fill-amber-400 shrink-0" />
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-500"
                      style={{
                        width: reviews.length > 0 ? `${(dist[star] / reviews.length) * 100}%` : "0%",
                      }}
                    />
                  </div>
                  <span className="text-xs text-gray-400 w-6 text-right">{dist[star]}</span>
                </div>
              ))}
            </div>
          )}

          {/* Review Cards */}
          {loading && reviews.length === 0 ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-gray-100 rounded w-1/4 mb-2" />
                  <div className="h-3 bg-gray-100 rounded w-3/4" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div
                  key={review._id}
                  className="bg-gray-50/80 rounded-xl p-4 border border-gray-100"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      {/* Anonymous avatar */}
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-violet-100 to-indigo-100 flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-indigo-500">A</span>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-700 capitalize">
                          Anonymous{" "}
                          {review.reviewerRole === "graduate"
                            ? "Graduate"
                            : review.reviewerRole === "jobseeker"
                            ? "Jobseeker"
                            : "Employee"}
                          {review.jobTitle && mode === "company" && (
                            <span className="text-gray-400 font-normal">
                              {" "}· {review.jobTitle}
                            </span>
                          )}
                        </p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <StarRating value={review.rating} size="sm" readOnly />
                          {review.tenureDays > 0 && (
                            <span className="text-[11px] text-gray-400 flex items-center gap-0.5 ml-1">
                              <Clock className="w-3 h-3" />
                              {tenureLabel(review.tenureDays)} tenure
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <span className="text-[11px] text-gray-400 shrink-0">
                      {new Date(review.ratedAt).toLocaleDateString("en-PH", {
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>

                  {/* Tags */}
                  {review.tags && review.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {review.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 bg-white border border-gray-200 text-gray-600 rounded-full text-[11px] font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Feedback */}
                  {review.feedback && (
                    <p className="text-sm text-gray-600 leading-relaxed">
                      "{review.feedback}"
                    </p>
                  )}
                </div>
              ))}

              {/* Load More */}
              {page < totalPages && (
                <button
                  onClick={() => fetchReviews(page + 1)}
                  disabled={loading}
                  className="w-full py-2.5 text-sm font-semibold text-indigo-600 border border-indigo-100 rounded-xl hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <span className="w-4 h-4 border-2 border-indigo-300 border-t-indigo-600 rounded-full animate-spin" />
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4" />
                      Load More Reviews
                    </>
                  )}
                </button>
              )}

              {reviews.length === 0 && !loading && (
                <div className="text-center py-8">
                  <MessageSquare className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">No reviews yet.</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default ReviewsSection;
