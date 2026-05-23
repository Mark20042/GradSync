import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useForm, useFieldArray } from "react-hook-form";
import { ArrowLeft, Save, Plus, Trash2, Shield, Calendar, Clock, Target } from "lucide-react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { API_PATH } from "../../utils/apiPath";
import axiosInstance from "../../utils/axiosInstance";
import toast from "react-hot-toast";

const EmployerAssessmentBuilder = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const assessmentId = searchParams.get("id");
  const [loading, setLoading] = useState(!!assessmentId);
  const [jobs, setJobs] = useState([]);

  const { register, control, handleSubmit, reset, watch, setValue, getValues } = useForm({
    defaultValues: {
      title: "",
      description: "",
      timeLimit: 15,
      passingScore: 80,
      strictProtocols: true,
      validFrom: "",
      validUntil: "",
      job: "",
      questions: [
        {
          type: "multiple-choice",
          questionText: "",
          codeSnippet: "",
          options: ["", "", "", ""],
          correctAnswer: "",
          explanation: "",
          category: "Technical"
        }
      ]
    }
  });

  const { fields: questionFields, append: appendQuestion, remove: removeQuestion } = useFieldArray({
    control,
    name: "questions"
  });

  useEffect(() => {
    fetchJobs();
    if (assessmentId) {
      fetchAssessment();
    }
  }, [assessmentId]);

  const fetchJobs = async () => {
    try {
      const res = await axiosInstance.get(API_PATH.JOBS.GET_JOBS_EMPLOYER);
      setJobs(res.data);
    } catch (error) {
      console.error("Failed to load jobs", error);
    }
  };

  const fetchAssessment = async () => {
    try {
      const res = await axiosInstance.get(`/api/employer-assessments/detail/${assessmentId}`);
      const data = res.data;
      
      // Format dates for input fields (YYYY-MM-DD)
      const validFrom = data.validFrom ? new Date(data.validFrom).toISOString().split('T')[0] : "";
      const validUntil = data.validUntil ? new Date(data.validUntil).toISOString().split('T')[0] : "";

      reset({
        ...data,
        validFrom,
        validUntil,
        job: data.job || ""
      });
    } catch (error) {
      toast.error("Failed to load assessment details");
      navigate('/employer-assessments');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      const payload = {
        ...data,
        validFrom: data.validFrom || null,
        validUntil: data.validUntil || null,
        job: data.job || null,
        questions: data.questions.map(q => ({
          ...q,
          options: q.type === 'identification' ? [] : q.options.filter(o => o.trim() !== '')
        }))
      };

      if (assessmentId) {
        await axiosInstance.put(`/api/employer-assessments/${assessmentId}`, payload);
        toast.success("Assessment updated successfully!");
      } else {
        await axiosInstance.post(`/api/employer-assessments`, payload);
        toast.success("Assessment created successfully!");
      }
      navigate("/employer-assessments");
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.error || "Failed to save assessment");
    }
  };

  if (loading) {
    return (
      <DashboardLayout activeMenu="employer-assessments">
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout activeMenu="employer-assessments">
      <div className="max-w-4xl mx-auto pb-10">
        <button
          onClick={() => navigate("/employer-assessments")}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Assessments
        </button>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* General Settings */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4">General Settings</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assessment Title *</label>
                <input
                  {...register("title", { required: true })}
                  placeholder="e.g. React Native Technical Test"
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  {...register("description")}
                  placeholder="Provide instructions or context for the candidate..."
                  rows="3"
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" /> Time Limit (mins)
                  </label>
                  <input
                    type="number"
                    {...register("timeLimit", { valueAsNumber: true, min: 1 })}
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                    <Target className="w-4 h-4 text-gray-400" /> Passing Score (%)
                  </label>
                  <input
                    type="number"
                    {...register("passingScore", { valueAsNumber: true, min: 1, max: 100 })}
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Linked Job (Optional)</label>
                  <select
                    {...register("job")}
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all"
                  >
                    <option value="">General Assessment</option>
                    {jobs.map(job => (
                      <option key={job._id} value={job._id}>{job.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" /> Available From (Optional)
                  </label>
                  <input
                    type="date"
                    {...register("validFrom")}
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" /> Available Until (Optional)
                  </label>
                  <input
                    type="date"
                    {...register("validUntil")}
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="mt-4 p-4 bg-indigo-50 border border-indigo-100 rounded-xl flex items-start gap-3">
                <div className="mt-0.5">
                  <input
                    type="checkbox"
                    id="strictProtocols"
                    {...register("strictProtocols")}
                    className="w-5 h-5 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label htmlFor="strictProtocols" className="font-semibold text-indigo-900 cursor-pointer flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Enable Strict Anti-Cheating Protocols
                  </label>
                  <p className="text-sm text-indigo-700 mt-1">
                    If enabled, candidates will be forced into fullscreen mode, and any tab-switching will be recorded as a violation. High violation counts will auto-submit the test.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Questions Section */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
              <h2 className="text-xl font-bold text-gray-900">Questions</h2>
              <button
                type="button"
                onClick={() => appendQuestion({
                  type: "multiple-choice",
                  questionText: "",
                  codeSnippet: "",
                  options: ["", "", "", ""],
                  correctAnswer: "",
                  explanation: "",
                  category: "Technical"
                })}
                className="text-blue-600 font-semibold hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-2 text-sm"
              >
                <Plus className="w-4 h-4" /> Add Question
              </button>
            </div>

            <div className="space-y-6">
              {questionFields.map((field, index) => (
                <div key={field.id} className="p-5 border border-gray-200 rounded-2xl relative bg-gray-50/50">
                  <div className="absolute top-4 right-4 text-sm font-semibold text-gray-400 bg-white px-2 py-1 rounded-md border border-gray-100">
                    Q{index + 1}
                  </div>
                  
                  {questionFields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeQuestion(index)}
                      className="absolute -top-3 -right-3 bg-red-100 text-red-600 p-2 rounded-full hover:bg-red-200 transition-colors shadow-sm"
                      title="Remove Question"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}

                  <div className="space-y-4 mt-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Question Type *</label>
                        <select
                          {...register(`questions.${index}.type`)}
                          className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all bg-white"
                          onChange={(e) => {
                            const t = e.target.value;
                            const currentQuestion = getValues(`questions.${index}`);
                            const newOptions = t === 'true-false' 
                              ? ['True', 'False', '', ''] 
                              : (currentQuestion.type === 'true-false' ? ["", "", "", ""] : currentQuestion.options);
                            
                            setValue(`questions.${index}.type`, t);
                            setValue(`questions.${index}.options`, newOptions);
                            setValue(`questions.${index}.correctAnswer`, '');
                          }}
                        >
                          <option value="multiple-choice">Multiple Choice</option>
                          <option value="true-false">True / False</option>
                          <option value="identification">Identification</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Question Text *</label>
                        <input
                          {...register(`questions.${index}.questionText`, { required: true })}
                          placeholder="What is the output of the following code?"
                          className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                      <select
                        {...register(`questions.${index}.category`)}
                        className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all bg-white"
                      >
                        <option value="Technical">Technical</option>
                        <option value="Behavioral">Behavioral</option>
                        <option value="Communication">Communication</option>
                        <option value="General">General</option>
                        <option value="Logical">Logical</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Code Snippet (Optional)</label>
                      <textarea
                        {...register(`questions.${index}.codeSnippet`)}
                        placeholder="console.log('Hello World');"
                        rows="3"
                        className="w-full p-3 border border-gray-300 rounded-xl font-mono text-sm focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all"
                      />
                    </div>

                    {watch(`questions.${index}.type`) !== 'identification' && (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* We fix it to 4 options for simplicity */}
                          {[0, 1, 2, 3].slice(0, watch(`questions.${index}.type`) === 'true-false' ? 2 : 4).map((optIndex) => (
                            <div key={optIndex}>
                              <label className="block text-xs font-medium text-gray-500 mb-1">Option {optIndex + 1} *</label>
                              <input
                                {...register(`questions.${index}.options.${optIndex}`, { required: true })}
                                disabled={watch(`questions.${index}.type`) === 'true-false'}
                                className={`w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all ${watch(`questions.${index}.type`) === 'true-false' ? 'bg-gray-100' : ''}`}
                              />
                            </div>
                          ))}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Correct Answer *</label>
                          <select
                            {...register(`questions.${index}.correctAnswer`, { required: true })}
                            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all font-semibold text-green-700 bg-green-50"
                          >
                            <option value="">Select correct answer</option>
                            {watch(`questions.${index}.options`).slice(0, watch(`questions.${index}.type`) === 'true-false' ? 2 : 4).map((opt, i) => opt && (
                              <option key={i} value={opt}>{opt}</option>
                            ))}
                          </select>
                        </div>
                      </>
                    )}

                    {watch(`questions.${index}.type`) === 'identification' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Exact Correct Answer *</label>
                        <input
                          {...register(`questions.${index}.correctAnswer`, { required: true })}
                          placeholder="e.g. React"
                          className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all font-semibold text-green-700 bg-green-50"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-center border-t border-dashed border-gray-200 pt-6">
              <button
                type="button"
                onClick={() => appendQuestion({
                  type: "multiple-choice",
                  questionText: "",
                  codeSnippet: "",
                  options: ["", "", "", ""],
                  correctAnswer: "",
                  explanation: "",
                  category: "Technical"
                })}
                className="text-blue-600 font-semibold bg-blue-50 hover:bg-blue-100 px-6 py-2.5 rounded-xl transition-colors flex items-center gap-2"
              >
                <Plus className="w-5 h-5" /> Add Another Question
              </button>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-600/20 flex items-center gap-2"
            >
              <Save className="w-5 h-5" />
              {assessmentId ? "Update Assessment" : "Save Assessment"}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default EmployerAssessmentBuilder;
