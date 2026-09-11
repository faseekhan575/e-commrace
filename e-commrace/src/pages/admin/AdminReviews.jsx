import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Star, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import axios from "../../axiosConfig";
import { dataOf, dateLabel, EmptyState, ErrorNotice, errorMessage, LoadingState, Modal, PageHeader, Pagination, Panel, useCommerceRefresh } from "./adminShared";

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(null);
  const [busy, setBusy] = useState(false);
  const request = useRef(0);
  const load = useCallback(async () => {
    const requestId = ++request.current;
    setLoading(true); setError("");
    try {
      const data = dataOf(await axios.get("/api/v7/review/admin/all", { params: { page, limit: 15, rating: rating || undefined } }));
      if (requestId !== request.current) return;
      setReviews(data.reviews || []); setPagination({ total: data.total ?? data.totalReviews ?? 0, pages: data.totalPages || 1 });
      if (page > Math.max(1, data.totalPages || 1)) setPage(Math.max(1, data.totalPages || 1));
    } catch (failure) { if (requestId === request.current) { setError(errorMessage(failure)); setReviews([]); } }
    finally { if (requestId === request.current) setLoading(false); }
  }, [page, rating]);
  useEffect(() => { load(); }, [load]);
  useCommerceRefresh(load, "new_review");
  const remove = async () => {
    setBusy(true);
    try { await axios.delete(`/api/v7/review/${deleting._id}/delete`); toast.success("Review deleted"); setDeleting(null); await load(); }
    catch (failure) { toast.error(errorMessage(failure)); }
    finally { setBusy(false); }
  };
  return <div className="studio"><PageHeader eyebrow="Community / Reviews" title="Listen to your customers." description="Review feedback across your collection and remove inappropriate content." /><ErrorNotice error={error} retry={load} /><Panel><div className="studio-toolbar"><Star size={17} className="text-amber-500" /><span className="studio-note studio-search">{pagination.total} customer reviews</span><select className="studio-select" aria-label="Filter reviews by rating" value={rating} onChange={(event) => { setRating(event.target.value); setPage(1); }}><option value="">All ratings</option>{[5, 4, 3, 2, 1].map((value) => <option key={value} value={value}>{value} stars</option>)}</select></div>{loading ? <LoadingState /> : reviews.length ? <div className="divide-y divide-slate-100">{reviews.map((review) => <article key={review._id} className="studio-panel-body"><div className="flex justify-between gap-4"><div><div className="studio-actions"><strong className="text-sm">{review.user?.fullname || "Customer"}</strong><span className="text-amber-500 text-xs" aria-label={`${review.rating} out of 5 stars`}>{"★".repeat(Math.max(0, Math.min(5, Number(review.rating) || 0)))}{"☆".repeat(Math.max(0, 5 - Math.min(5, Number(review.rating) || 0)))}</span><span className="studio-note">{dateLabel(review.createdAt)}</span></div>{review.product?._id && <Link className="studio-link text-xs inline-block mt-2" to={`/admin/products/${review.product._id}/edit`}>{review.product.title}</Link>}<p className="text-sm leading-relaxed text-slate-600 mt-3 whitespace-pre-wrap">{review.comment}</p>{review.images?.length > 0 && <div className="studio-actions mt-4">{review.images.map((image, index) => <a href={image.url} target="_blank" rel="noopener noreferrer" key={image.public_id || index}><img src={image.url} alt={`Review attachment ${index + 1}`} className="w-20 h-20 rounded-lg object-cover" loading="lazy" /></a>)}</div>}</div><button className="studio-icon-button studio-button-danger self-start" onClick={() => setDeleting(review)} aria-label="Delete review"><Trash2 size={16} /></button></div></article>)}</div> : !error && <EmptyState title="No reviews to display" description="Customer reviews will appear here as they are submitted." />}<Pagination page={page} pages={pagination.pages} total={pagination.total} onChange={setPage} disabled={loading} /></Panel>{deleting && <Modal title="Remove this review?" onClose={() => setDeleting(null)} busy={busy}><div className="studio-panel-body"><p className="studio-note">This permanently removes the review and its photos.</p><blockquote className="text-sm text-slate-600 my-5">{deleting.comment}</blockquote><div className="studio-actions"><button className="studio-button" onClick={() => setDeleting(null)} disabled={busy}>Keep review</button><button className="studio-button studio-button-danger" onClick={remove} disabled={busy}>{busy ? "Deleting…" : "Delete review"}</button></div></div></Modal>}</div>;
}
