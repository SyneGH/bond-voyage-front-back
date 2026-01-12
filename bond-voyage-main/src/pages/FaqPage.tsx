import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Edit,
  Trash2,
  HelpCircle,
  Calendar,
  Search,
  X,
  ChevronLeft,
  RefreshCw,
} from "lucide-react";
import { ContentCard } from "../components/ContentCard";
import { ConfirmationModal } from "../components/ConfirmationModal";
import { Pagination } from "../components/Pagination";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { toast } from "sonner";
import { FAQ } from "../types/types";
import {
  useFaqs,
  useCreateFaq,
  useUpdateFaq,
  useDeleteFaq,
} from "../hooks/useFaqs";

export function FaqPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const { data: faqsResponse, refetch } = useFaqs();
  const createFaqMutation = useCreateFaq();
  const updateFaqMutation = useUpdateFaq();
  const deleteFaqMutation = useDeleteFaq();

  const faqs = useMemo(() => faqsResponse?.data || [], [faqsResponse?.data]);

  // Form state for creating/editing FAQ
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentFaq, setCurrentFaq] = useState<FAQ | null>(null);
  const [faqForm, setFaqForm] = useState({
    question: "",
    answer: "",
    tags: [] as string[],
    targetPages: [] as string[],
    pageKeywords: [] as string[],
  });
  const [tagInput, setTagInput] = useState("");
  const [keywordInput, setKeywordInput] = useState("");

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [faqToDelete, setFaqToDelete] = useState<FAQ | null>(null);

  // Calculate stats
  const totalFAQs = faqs.length;
  const totalTags = faqs.reduce((sum, faq) => sum + faq.tags.length, 0);

  const filteredFaqs = useMemo(() => {
    return faqs.filter(
      (faq: FAQ) =>
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.tags.some((tag: string) =>
          tag.toLowerCase().includes(searchQuery.toLowerCase())
        ) ||
        (faq.pageKeywords?.some((keyword: string) =>
          keyword.toLowerCase().includes(searchQuery.toLowerCase())
        ) ??
          false)
    );
  }, [faqs, searchQuery]);

  const totalItems = filteredFaqs.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const paginatedFaqs = filteredFaqs.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Handle create new FAQ
  const handleCreateFaq = async () => {
    if (!faqForm.question.trim() || !faqForm.answer.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (faqForm.tags.length === 0) {
      toast.error("Please add at least one tag");
      return;
    }

    try {
      await createFaqMutation.mutateAsync(faqForm);
      resetFaqForm();
      setIsCreateModalOpen(false);
      setCurrentPage(1);

      toast.success("FAQ Created!", {
        description: "Your new FAQ has been added successfully.",
      });
    } catch (error) {
      toast.error("Failed to create FAQ");
    }
  };

  const handleEditFaq = async () => {
    if (!currentFaq || !faqForm.question.trim() || !faqForm.answer.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (faqForm.tags.length === 0) {
      toast.error("Please add at least one tag");
      return;
    }

    try {
      await updateFaqMutation.mutateAsync({
        id: currentFaq.id,
        data: faqForm,
      });
      resetFaqForm();
      setIsEditModalOpen(false);
      setCurrentFaq(null);

      toast.success("FAQ Updated!", {
        description: "Your FAQ has been updated successfully.",
      });
    } catch (error) {
      toast.error("Failed to update FAQ");
    }
  };

  // Handle delete FAQ
  const handleDeleteFaq = async () => {
    if (faqToDelete) {
      try {
        await deleteFaqMutation.mutateAsync(faqToDelete.id);
        setDeleteConfirmOpen(false);
        setFaqToDelete(null);

        if (paginatedFaqs.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        }

        toast.success("FAQ Deleted!", {
          description: "The FAQ has been removed successfully.",
        });
      } catch (error) {
        toast.error("Failed to delete FAQ");
      }
    }
  };

  // Reset form
  const resetFaqForm = () => {
    setFaqForm({
      question: "",
      answer: "",
      tags: [],
      targetPages: [],
      pageKeywords: [],
    });
    setTagInput("");
    setKeywordInput("");
  };

  // Initialize form for editing
  const initializeEditForm = (faq: FAQ) => {
    setCurrentFaq(faq);
    setFaqForm({
      question: faq.question,
      answer: faq.answer,
      tags: [...faq.tags],
      targetPages: faq.targetPages || [],
      pageKeywords: faq.pageKeywords || [],
    });
    setIsEditModalOpen(true);
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !faqForm.tags.includes(tagInput.trim())) {
      setFaqForm({
        ...faqForm,
        tags: [...faqForm.tags, tagInput.trim()],
      });
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFaqForm({
      ...faqForm,
      tags: faqForm.tags.filter((tag) => tag !== tagToRemove),
    });
  };

  // Handle keyword input
  const handleAddKeyword = () => {
    if (
      keywordInput.trim() &&
      !faqForm.pageKeywords.includes(keywordInput.trim())
    ) {
      setFaqForm({
        ...faqForm,
        pageKeywords: [...faqForm.pageKeywords, keywordInput.trim()],
      });
      setKeywordInput("");
    }
  };

  const handleRemoveKeyword = (keywordToRemove: string) => {
    setFaqForm({
      ...faqForm,
      pageKeywords: faqForm.pageKeywords.filter(
        (keyword) => keyword !== keywordToRemove
      ),
    });
  };

  const clearSearch = () => {
    setSearchQuery("");
    setCurrentPage(1);
  };

  const handleBackToDashboard = () => {
    navigate("/");
  };

  const handleForceSync = () => {
    refetch();
    toast.success("FAQs Refreshed!", {
      description: "FAQ list has been refreshed with latest data.",
    });
  };

  // Get formatted date
  const getFormattedDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Page options for targetPages selection
  const pageOptions = [
    { path: "/user/travels", name: "Travels" },
    { path: "/user/bookings", name: "Bookings" },
    { path: "/user/history", name: "History" },
    { path: "/user/profile/edit", name: "Profile" },
    { path: "/user/feedback", name: "Feedback" },
    { path: "/user/notifications", name: "Notifications" },
    { path: "/user/weather", name: "Weather" },
    { path: "/user/standard-itinerary", name: "Standard Itinerary" },
    { path: "/user/requested-itinerary", name: "Requested Itinerary" },
    { path: "/user/customized-itinerary", name: "Customized Itinerary" },
    { path: "/user/smart-trip", name: "Smart Trip" },
    { path: "/user/create-new-travel", name: "Create Travel" },
    { path: "/user/home", name: "Dashboard" },
  ];

  return (
    <div>
      {/* Header with back button */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={handleBackToDashboard}
          className="w-10 h-10 rounded-xl bg-white border-2 border-[#E5E7EB] hover:border-[#0A7AFF] hover:bg-[rgba(10,122,255,0.05)] flex items-center justify-center transition-all"
        >
          <ChevronLeft className="w-5 h-5 text-[#64748B]" />
        </button>
        <div>
          <h2 className="text-[#1A2B4F] font-semibold">Back to Dashboard</h2>
        </div>
      </div>

      <ContentCard
        title="Frequently Asked Questions"
        subtitle={`Manage FAQs for the user assistant. ${totalFAQs} FAQs available.`}
        action={
          <div className="flex items-center gap-3">
            {/* Refresh FAQs button */}
            <button
              onClick={handleForceSync}
              disabled={
                createFaqMutation.isPending ||
                updateFaqMutation.isPending ||
                deleteFaqMutation.isPending
              }
              className="h-10 px-4 rounded-[20px] bg-[#10B981] text-white text-sm font-medium shadow-[0_2px_8px_rgba(10,122,255,0.25)] flex items-center gap-2 transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#0969e6] hover:shadow-[0_4px_12px_rgba(10,122,255,0.35)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh FAQs
            </button>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              disabled={
                createFaqMutation.isPending ||
                updateFaqMutation.isPending ||
                deleteFaqMutation.isPending
              }
              className="h-10 px-5 rounded-[20px] text-white text-sm font-medium shadow-[0_2px_8px_rgba(10,122,255,0.25)] flex items-center gap-2 transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: `linear-gradient(135deg, var(--gradient-from), var(--gradient-to))`,
              }}
            >
              <Plus className="w-4 h-4" />
              New FAQ
            </button>
          </div>
        }
      >
        {/* Search Bar */}
        <div className="relative w-full mb-6">
          <input
            type="text"
            placeholder="Search FAQs by question, answer, tags, or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-11 px-4 pl-10 rounded-xl border border-[#E5E7EB] bg-[#F8FAFB] text-sm text-[#334155] placeholder:text-[#64748B] focus:border-[#0A7AFF] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[rgba(10,122,255,0.08)] shadow-[0_2px_8px_rgba(0,0,0,0.05)] transition-all pr-10"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B] hover:text-[#334155] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* FAQs Grid - 2 Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 pt-2">
          {paginatedFaqs.length === 0 ? (
            <div className="lg:col-span-2 text-center py-12">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-linear-to-br from-[#0A7AFF] to-[#14B8A6] flex items-center justify-center mb-4">
                <HelpCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchQuery ? "No matching FAQs found" : "No FAQs available"}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchQuery
                  ? "Try a different search term"
                  : "Create your first FAQ to help users"}
              </p>
              {!searchQuery && (
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="px-4 py-2 bg-linear-to-r from-[#0A7AFF] to-[#14B8A6] text-white rounded-lg text-sm font-medium hover:shadow-lg hover:shadow-[#0A7AFF]/30 transition-all"
                >
                  Add New FAQ
                </button>
              )}
            </div>
          ) : (
            paginatedFaqs.map((faq: FAQ) => (
              <div
                key={faq.id}
                className="group rounded-xl border border-gray-200 hover:border-[#0A7AFF] hover:shadow-lg bg-white transition-all duration-200 overflow-hidden h-full flex flex-col"
              >
                <div className="p-5 flex-1">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 shadow-sm bg-linear-to-br from-[#0A7AFF] to-[#14B8A6] group-hover:scale-110 transition-transform duration-200">
                      <HelpCircle className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-gray-900 group-hover:text-[#0A7AFF] transition-colors mb-3 line-clamp-2">
                        {faq.question}
                      </h3>
                      <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                        {faq.answer}
                      </p>
                      {faq.tags.length > 0 && (
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className="text-xs text-gray-500">Tags:</span>
                          {faq.tags.map((tag: string) => (
                            <span
                              key={tag}
                              className="px-2 py-1 rounded text-xs bg-blue-50 text-blue-600 border border-blue-200"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      {faq.pageKeywords && faq.pageKeywords.length > 0 && (
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className="text-xs text-gray-500">
                            Keywords:
                          </span>
                          {faq.pageKeywords.map((keyword: string) => (
                            <span
                              key={keyword}
                              className="px-2 py-1 rounded text-xs bg-purple-50 text-purple-600 border border-purple-200"
                            >
                              {keyword}
                            </span>
                          ))}
                        </div>
                      )}
                      {faq.targetPages && faq.targetPages.length > 0 && (
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs text-gray-500">
                            Target Pages:
                          </span>
                          {faq.targetPages.slice(0, 2).map((page: string) => {
                            const pageOption = pageOptions.find(
                              (p) => p.path === page
                            );
                            return pageOption ? (
                              <span
                                key={page}
                                className="px-2 py-1 rounded text-xs bg-green-50 text-green-600 border border-green-200"
                              >
                                {pageOption.name}
                              </span>
                            ) : null;
                          })}
                          {faq.targetPages.length > 2 && (
                            <span className="text-xs text-gray-500">
                              +{faq.targetPages.length - 2} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="px-5 pb-5 pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Calendar className="w-4 h-4" />
                      <span>
                        Created{" "}
                        {getFormattedDate(
                          faq.createdAt || new Date().toISOString()
                        )}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => initializeEditForm(faq)}
                        disabled={
                          createFaqMutation.isPending ||
                          updateFaqMutation.isPending ||
                          deleteFaqMutation.isPending
                        }
                        className="p-2 rounded-lg text-gray-600 hover:text-[#0A7AFF] hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Edit FAQ"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setFaqToDelete(faq);
                          setDeleteConfirmOpen(true);
                        }}
                        disabled={
                          createFaqMutation.isPending ||
                          updateFaqMutation.isPending ||
                          deleteFaqMutation.isPending
                        }
                        className="p-2 rounded-lg text-gray-600 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Delete FAQ"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {filteredFaqs.length > 0 && (
          <div className="mt-8 pt-6 border-t border-gray-200">
            <Pagination
              currentPage={currentPage}
              totalItems={filteredFaqs.length}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
              showingStart={startIndex + 1}
              showingEnd={endIndex}
            />
          </div>
        )}
      </ContentCard>

      {/* Create FAQ Modal */}
      <ConfirmationModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        title="Create New FAQ"
        description="Add a new frequently asked question to help your users."
        icon={<HelpCircle className="w-5 h-5 text-white" />}
        iconGradient="bg-gradient-to-br from-[#0A7AFF] to-[#14B8A6]"
        iconShadow="shadow-[#0A7AFF]/20"
        contentGradient="bg-gradient-to-br from-[rgba(10,122,255,0.05)] to-[rgba(20,184,166,0.05)]"
        contentBorder="border-[rgba(10,122,255,0.2)]"
        content={
          <div className="space-y-4">
            <div>
              <Label htmlFor="question" className="text-[#1A2B4F] mb-2 block">
                Question <span className="text-[#FF6B6B]">*</span>
              </Label>
              <Input
                id="question"
                value={faqForm.question}
                onChange={(e) =>
                  setFaqForm({ ...faqForm, question: e.target.value })
                }
                placeholder="Enter the question users frequently ask"
                className="h-11 border-[#E5E7EB] focus:border-[#0A7AFF] focus:ring-4 focus:ring-[#0A7AFF]/10"
              />
            </div>
            <div>
              <Label htmlFor="answer" className="text-[#1A2B4F] mb-2 block">
                Answer <span className="text-[#FF6B6B]">*</span>
              </Label>
              <Textarea
                id="answer"
                value={faqForm.answer}
                onChange={(e) =>
                  setFaqForm({ ...faqForm, answer: e.target.value })
                }
                placeholder="Provide a clear and helpful answer"
                className="min-h-30 border-[#E5E7EB] focus:border-[#0A7AFF] focus:ring-4 focus:ring-[#0A7AFF]/10"
              />
            </div>

            {/* Tags Section */}
            <div>
              <Label htmlFor="tags" className="text-[#1A2B4F] mb-2 block">
                Tags <span className="text-[#FF6B6B]">*</span>
              </Label>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    id="tags"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) =>
                      e.key === "Enter" && (e.preventDefault(), handleAddTag())
                    }
                    placeholder="Type a tag and press Enter"
                    className="flex-1 h-11 border-[#E5E7EB] focus:border-[#0A7AFF] focus:ring-4 focus:ring-[#0A7AFF]/10"
                  />
                  <button
                    onClick={handleAddTag}
                    className="px-4 h-11 rounded-lg border border-[#E5E7EB] hover:border-[#0A7AFF] hover:bg-[rgba(10,122,255,0.05)] text-[#64748B] transition-colors"
                  >
                    Add
                  </button>
                </div>
                {faqForm.tags.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {faqForm.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm bg-blue-50 text-blue-600 border border-blue-200"
                      >
                        {tag}
                        <button
                          onClick={() => handleRemoveTag(tag)}
                          className="hover:text-blue-800"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-500">
                    At least one tag is required. Tags help users find relevant
                    FAQs.
                  </p>
                )}
              </div>
            </div>

            {/* Page Keywords Section */}
            <div>
              <Label htmlFor="keywords" className="text-[#1A2B4F] mb-2 block">
                Page Keywords (Optional)
              </Label>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    id="keywords"
                    value={keywordInput}
                    onChange={(e) => setKeywordInput(e.target.value)}
                    onKeyPress={(e) =>
                      e.key === "Enter" &&
                      (e.preventDefault(), handleAddKeyword())
                    }
                    placeholder="Type a keyword and press Enter"
                    className="flex-1 h-11 border-[#E5E7EB] focus:border-[#0A7AFF] focus:ring-4 focus:ring-[#0A7AFF]/10"
                  />
                  <button
                    onClick={handleAddKeyword}
                    className="px-4 h-11 rounded-lg border border-[#E5E7EB] hover:border-[#0A7AFF] hover:bg-[rgba(10,122,255,0.05)] text-[#64748B] transition-colors"
                  >
                    Add
                  </button>
                </div>
                {faqForm.pageKeywords.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {faqForm.pageKeywords.map((keyword) => (
                      <span
                        key={keyword}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm bg-purple-50 text-purple-600 border border-purple-200"
                      >
                        {keyword}
                        <button
                          onClick={() => handleRemoveKeyword(keyword)}
                          className="hover:text-purple-800"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                <p className="text-xs text-gray-500">
                  Keywords help the assistant match FAQs to page content.
                </p>
              </div>
            </div>

            {/* Target Pages Section */}
            <div className="pt-4 border-t border-gray-200">
              <Label className="text-[#1A2B4F] mb-2 block">
                Target Pages (Optional)
                <span className="text-xs text-gray-500 ml-2">
                  Select pages where this FAQ should appear
                </span>
              </Label>
              <div className="grid grid-cols-2 gap-2 p-2 bg-gray-50 rounded-lg max-h-40 overflow-y-auto">
                {pageOptions.map(({ path, name }) => (
                  <label
                    key={path}
                    className="flex items-center gap-2 cursor-pointer px-2 py-1 hover:bg-gray-100 rounded"
                  >
                    <input
                      type="checkbox"
                      checked={faqForm.targetPages?.includes(path) || false}
                      onChange={(e) => {
                        const newTargetPages = e.target.checked
                          ? [...(faqForm.targetPages || []), path]
                          : (faqForm.targetPages || []).filter(
                              (p) => p !== path
                            );
                        setFaqForm({ ...faqForm, targetPages: newTargetPages });
                      }}
                      className="w-4 h-4 text-[#0A7AFF] rounded"
                    />
                    <span className="text-sm text-gray-700">{name}</span>
                  </label>
                ))}
              </div>
              {faqForm.targetPages.length > 0 && (
                <p className="text-xs text-green-600 mt-2">
                  Selected {faqForm.targetPages.length} page(s)
                </p>
              )}
            </div>
          </div>
        }
        onConfirm={handleCreateFaq}
        onCancel={() => {
          setIsCreateModalOpen(false);
          resetFaqForm();
        }}
        confirmText="Create FAQ"
        cancelText="Cancel"
        confirmVariant="default"
        confirmButtonStyle="bg-gradient-to-r from-[#0A7AFF] to-[#14B8A6] hover:from-[#0969e6] hover:to-[#12a594] hover:shadow-lg hover:shadow-[#0A7AFF]/30"
        isLoading={createFaqMutation.isPending}
      />

      {/* Edit FAQ Modal */}
      <ConfirmationModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        title="Edit FAQ"
        description="Update the FAQ details below."
        icon={<Edit className="w-5 h-5 text-white" />}
        iconGradient="bg-gradient-to-br from-[#14B8A6] to-[#0A7AFF]"
        iconShadow="shadow-[#14B8A6]/20"
        contentGradient="bg-gradient-to-br from-[rgba(20,184,166,0.05)] to-[rgba(10,122,255,0.05)]"
        contentBorder="border-[rgba(20,184,166,0.2)]"
        content={
          <div className="space-y-4">
            <div>
              <Label
                htmlFor="edit-question"
                className="text-[#1A2B4F] mb-2 block"
              >
                Question <span className="text-[#FF6B6B]">*</span>
              </Label>
              <Input
                id="edit-question"
                value={faqForm.question}
                onChange={(e) =>
                  setFaqForm({ ...faqForm, question: e.target.value })
                }
                className="h-11 border-[#E5E7EB] focus:border-[#14B8A6] focus:ring-4 focus:ring-[#14B8A6]/10"
              />
            </div>
            <div>
              <Label
                htmlFor="edit-answer"
                className="text-[#1A2B4F] mb-2 block"
              >
                Answer <span className="text-[#FF6B6B]">*</span>
              </Label>
              <Textarea
                id="edit-answer"
                value={faqForm.answer}
                onChange={(e) =>
                  setFaqForm({ ...faqForm, answer: e.target.value })
                }
                className="min-h-30 border-[#E5E7EB] focus:border-[#14B8A6] focus:ring-4 focus:ring-[#14B8A6]/10"
              />
            </div>

            {/* Tags Section */}
            <div>
              <Label htmlFor="edit-tags" className="text-[#1A2B4F] mb-2 block">
                Tags <span className="text-[#FF6B6B]">*</span>
              </Label>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    id="edit-tags"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) =>
                      e.key === "Enter" && (e.preventDefault(), handleAddTag())
                    }
                    placeholder="Type a tag and press Enter"
                    className="flex-1 h-11 border-[#E5E7EB] focus:border-[#14B8A6] focus:ring-4 focus:ring-[#14B8A6]/10"
                  />
                  <button
                    onClick={handleAddTag}
                    className="px-4 h-11 rounded-lg border border-[#E5E7EB] hover:border-[#14B8A6] hover:bg-[rgba(20,184,166,0.05)] text-[#64748B] transition-colors"
                  >
                    Add
                  </button>
                </div>
                {faqForm.tags.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {faqForm.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm bg-emerald-50 text-emerald-600 border border-emerald-200"
                      >
                        {tag}
                        <button
                          onClick={() => handleRemoveTag(tag)}
                          className="hover:text-emerald-800"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-500">
                    At least one tag is required. Tags help users find relevant
                    FAQs.
                  </p>
                )}
              </div>
            </div>

            {/* Page Keywords Section */}
            <div>
              <Label
                htmlFor="edit-keywords"
                className="text-[#1A2B4F] mb-2 block"
              >
                Page Keywords (Optional)
              </Label>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    id="edit-keywords"
                    value={keywordInput}
                    onChange={(e) => setKeywordInput(e.target.value)}
                    onKeyPress={(e) =>
                      e.key === "Enter" &&
                      (e.preventDefault(), handleAddKeyword())
                    }
                    placeholder="Type a keyword and press Enter"
                    className="flex-1 h-11 border-[#E5E7EB] focus:border-[#14B8A6] focus:ring-4 focus:ring-[#14B8A6]/10"
                  />
                  <button
                    onClick={handleAddKeyword}
                    className="px-4 h-11 rounded-lg border border-[#E5E7EB] hover:border-[#14B8A6] hover:bg-[rgba(20,184,166,0.05)] text-[#64748B] transition-colors"
                  >
                    Add
                  </button>
                </div>
                {faqForm.pageKeywords.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {faqForm.pageKeywords.map((keyword) => (
                      <span
                        key={keyword}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm bg-purple-50 text-purple-600 border border-purple-200"
                      >
                        {keyword}
                        <button
                          onClick={() => handleRemoveKeyword(keyword)}
                          className="hover:text-purple-800"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                <p className="text-xs text-gray-500">
                  Keywords help the assistant match FAQs to page content.
                </p>
              </div>
            </div>

            {/* Target Pages Section */}
            <div className="pt-4 border-t border-gray-200">
              <Label className="text-[#1A2B4F] mb-2 block">
                Target Pages (Optional)
                <span className="text-xs text-gray-500 ml-2">
                  Select pages where this FAQ should appear
                </span>
              </Label>
              <div className="grid grid-cols-2 gap-2 p-2 bg-gray-50 rounded-lg max-h-40 overflow-y-auto">
                {pageOptions.map(({ path, name }) => (
                  <label
                    key={path}
                    className="flex items-center gap-2 cursor-pointer px-2 py-1 hover:bg-gray-100 rounded"
                  >
                    <input
                      type="checkbox"
                      checked={faqForm.targetPages?.includes(path) || false}
                      onChange={(e) => {
                        const newTargetPages = e.target.checked
                          ? [...(faqForm.targetPages || []), path]
                          : (faqForm.targetPages || []).filter(
                              (p) => p !== path
                            );
                        setFaqForm({ ...faqForm, targetPages: newTargetPages });
                      }}
                      className="w-4 h-4 text-[#14B8A6] rounded"
                    />
                    <span className="text-sm text-gray-700">{name}</span>
                  </label>
                ))}
              </div>
              {faqForm.targetPages.length > 0 && (
                <p className="text-xs text-green-600 mt-2">
                  Selected {faqForm.targetPages.length} page(s)
                </p>
              )}
            </div>

            {currentFaq && (
              <div className="pt-4 border-t border-gray-200">
                <div className="text-sm">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-gray-600 mb-1">FAQ ID:</p>
                    <p className="font-semibold text-gray-900 mb-3">
                      {currentFaq.id}
                    </p>
                    <p className="text-gray-600 mb-1">Created:</p>
                    <p className="font-semibold text-gray-900">
                      {getFormattedDate(
                        currentFaq.createdAt || new Date().toISOString()
                      )}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        }
        onConfirm={handleEditFaq}
        onCancel={() => {
          setIsEditModalOpen(false);
          resetFaqForm();
          setCurrentFaq(null);
        }}
        confirmText="Save Changes"
        cancelText="Cancel"
        confirmVariant="default"
        confirmButtonStyle="bg-gradient-to-r from-[#14B8A6] to-[#0A7AFF] hover:from-[#12a594] hover:to-[#0969e6] hover:shadow-lg hover:shadow-[#14B8A6]/30"
        isLoading={updateFaqMutation.isPending}
      />

      {/* Delete FAQ Confirmation Modal */}
      <ConfirmationModal
        open={deleteConfirmOpen}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteConfirmOpen(false);
            setFaqToDelete(null);
          }
        }}
        title="Delete FAQ"
        description="Are you sure you want to delete this FAQ? This action cannot be undone."
        icon={<Trash2 className="w-5 h-5 text-white" />}
        iconGradient="bg-gradient-to-br from-[#FF6B6B] to-[#FF5252]"
        iconShadow="shadow-[#FF6B6B]/30"
        contentGradient="bg-gradient-to-br from-[rgba(255,107,107,0.05)] to-[rgba(255,82,82,0.05)]"
        contentBorder="border-[rgba(255,107,107,0.2)]"
        content={
          faqToDelete ? (
            <div className="space-y-3">
              <div className="p-4 bg-white/50 rounded-lg border border-red-200">
                <p className="text-sm text-gray-600 mb-1">Question:</p>
                <p className="text-sm font-medium text-gray-900 mb-3">
                  {faqToDelete.question}
                </p>
                {faqToDelete.tags.length > 0 && (
                  <>
                    <p className="text-sm text-gray-600 mb-1">Tags:</p>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {faqToDelete.tags.map((tag: string) => (
                        <span
                          key={tag}
                          className="px-2 py-1 rounded text-xs bg-red-50 text-red-600 border border-red-200"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </>
                )}
                {faqToDelete.pageKeywords &&
                  faqToDelete.pageKeywords.length > 0 && (
                    <>
                      <p className="text-sm text-gray-600 mb-1">Keywords:</p>
                      <div className="flex flex-wrap gap-1 mb-3">
                        {faqToDelete.pageKeywords.map((keyword: string) => (
                          <span
                            key={keyword}
                            className="px-2 py-1 rounded text-xs bg-red-50 text-red-600 border border-red-200"
                          >
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </>
                  )}
                {faqToDelete.targetPages &&
                  faqToDelete.targetPages.length > 0 && (
                    <>
                      <p className="text-sm text-gray-600 mb-1">
                        Target Pages:
                      </p>
                      <div className="flex flex-wrap gap-1 mb-3">
                        {faqToDelete.targetPages
                          .slice(0, 3)
                          .map((page: string) => {
                            const pageOption = pageOptions.find(
                              (p) => p.path === page
                            );
                            return pageOption ? (
                              <span
                                key={page}
                                className="px-2 py-1 rounded text-xs bg-red-50 text-red-600 border border-red-200"
                              >
                                {pageOption.name}
                              </span>
                            ) : null;
                          })}
                      </div>
                    </>
                  )}
                <p className="text-xs text-gray-500">
                  Created:{" "}
                  {getFormattedDate(
                    faqToDelete.createdAt || new Date().toISOString()
                  )}
                </p>
              </div>
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                <p className="text-xs text-amber-700">
                  ⚠️ This FAQ will be permanently deleted and cannot be
                  recovered.
                </p>
              </div>
            </div>
          ) : null
        }
        onConfirm={handleDeleteFaq}
        onCancel={() => {
          setDeleteConfirmOpen(false);
          setFaqToDelete(null);
        }}
        confirmText="Delete FAQ"
        cancelText="Cancel"
        confirmVariant="destructive"
        confirmButtonStyle="bg-gradient-to-r from-[#FF6B6B] to-[#FF5252] hover:from-[#e55a5a] hover:to-[#e54a4a] hover:shadow-lg hover:shadow-[#FF6B6B]/30"
        isLoading={deleteFaqMutation.isPending}
      />
    </div>
  );
}
