import React, { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { Plus, Trash2, Save } from "lucide-react";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATH } from "../../utils/apiPath";
import toast from "react-hot-toast";

const JobFAQManager = () => {
    const { register, control, handleSubmit, reset, watch } = useForm({
        defaultValues: {
            faqs: []
        }
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "faqs"
    });

    const [loading, setLoading] = useState(true);
    const [jobs, setJobs] = useState([]);

    useEffect(() => {
        const loadData = async () => {
            await Promise.all([fetchFAQs(), fetchJobs()]);
            setLoading(false);
        };
        loadData();
    }, []);

    const fetchJobs = async () => {
        try {
            const res = await axiosInstance.get(API_PATH.JOBS.GET_JOBS_EMPLOYER);
            setJobs(res.data);
        } catch (error) {
            console.error("Error fetching jobs:", error);
        }
    };

    const fetchFAQs = async () => {
        try {
            const res = await axiosInstance.get(API_PATH.EMPLOYER.FAQS);
            // Transform for form
            const formattedFAQs = res.data.map(faq => ({
                id: faq._id,
                question: faq.question,
                answer: faq.answer,
                job: faq.job || ""
            }));
            reset({ faqs: formattedFAQs });
        } catch (error) {
            console.error("Error fetching FAQs:", error);
        }
    };

    const onSubmit = async (data) => {
        try {
            for (const faq of data.faqs) {
                const payload = {
                    question: faq.question,
                    answer: faq.answer,
                    job: faq.job || null
                };

                if (faq.id) {
                    await axiosInstance.put(API_PATH.EMPLOYER.FAQ_ID(faq.id), payload);
                } else {
                    await axiosInstance.post(API_PATH.EMPLOYER.FAQS, payload);
                }
            }

            toast.success("FAQs saved successfully");
            fetchFAQs(); // Refresh
        } catch (error) {
            toast.error("Failed to save FAQs");
            console.error(error);
        }
    };

    const handleDelete = async (index, id) => {
        if (id) {
            try {
                await axiosInstance.delete(API_PATH.EMPLOYER.FAQ_ID(id));
                toast.success("FAQ deleted");
            } catch (error) {
                toast.error("Failed to delete FAQ");
            }
        }
        remove(index);
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-lg font-semibold">Automated FAQs</h3>
                    <p className="text-sm text-gray-500">Automated responses based on question matching.</p>
                </div>
                <button
                    type="button"
                    onClick={() => append({ question: "", answer: "", job: "" })}
                    className="flex items-center gap-2 text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Add FAQ
                </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {fields.map((field, index) => (
                    <div key={field.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200 relative group">
                        <button
                            type="button"
                            onClick={() => handleDelete(index, watch(`faqs.${index}.id`))}
                            className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>

                        <div className="grid gap-4">
                            {/* Hidden field to preserve database _id */}
                            <input type="hidden" {...register(`faqs.${index}.id`)} />

                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Specific Job (Optional)</label>
                                <select
                                    {...register(`faqs.${index}.job`)}
                                    className="w-full p-2 border border-gray-300 rounded-md text-sm"
                                >
                                    <option value="">All Jobs / General</option>
                                    {jobs.map(job => (
                                        <option key={job._id} value={job._id}>{job.title}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Question (Internal Label)</label>
                                <input
                                    {...register(`faqs.${index}.question`)}
                                    placeholder="e.g., Salary Inquiry"
                                    className="w-full p-2 border border-gray-300 rounded-md text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Auto-Response</label>
                                <textarea
                                    {...register(`faqs.${index}.answer`)}
                                    placeholder="The answer to send automatically..."
                                    rows="2"
                                    className="w-full p-2 border border-gray-300 rounded-md text-sm"
                                />
                            </div>
                        </div>
                    </div>
                ))}

                {fields.length > 0 && (
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <Save className="w-4 h-4" />
                            Save Changes
                        </button>
                    </div>
                )}

                {fields.length === 0 && (
                    <div className="text-center py-8 text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
                        No FAQs configured yet.
                    </div>
                )}
            </form>
        </div>
    );
};

export default JobFAQManager;
