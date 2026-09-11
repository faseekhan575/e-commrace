import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import { ArrowRight, Edit3, ExternalLink, Plus, Tag, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { fetchCategories } from "../../store/productsSlice";
import { api, errorMessage } from "../../services/api";
import { EmptyState, ErrorNotice, Field, LoadingState, Modal, PageHeader, Panel } from "./adminShared";

const blankForm = { name: "", slug: "", subtitle: "", eyebrow: "", description: "", displayOrder: "0", isHot: false, isFeatured: false };
export default function AdminCategories() {
  const dispatch = useDispatch();
  const [params] = useSearchParams();
  const { categories, categoriesLoading: loading, categoriesError: error } = useSelector((state) => state.products);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(blankForm);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState(null);
  const [deleting, setDeleting] = useState(null);
  useEffect(() => { dispatch(fetchCategories()); }, [dispatch]);
  useEffect(() => {
    if (!file) { setPreview(""); return; }
    const url = URL.createObjectURL(file); setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);
  const showEditor = (category = null) => {
    setEditing(category); setForm(category ? { ...blankForm, ...category } : blankForm);
    setFile(null); setFailure(null); setOpen(true);
  };
  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const save = async (event) => {
    event.preventDefault();
    if (!form.name.trim()) return setFailure("Please enter a category name.");
    if (!editing && !file) return setFailure("Choose a category image before creating the collection.");
    if (!Number.isInteger(Number(form.displayOrder)) || Number(form.displayOrder) < 0) return setFailure("Display order must be a whole number of zero or more.");
    setBusy(true); setFailure(null);
    try {
      const body = new FormData();
      for (const key of Object.keys(blankForm)) body.append(key, typeof form[key] === "string" ? form[key].trim() : form[key]);
      body.set("slug", form.slug.trim() || form.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
      if (file) body.append("image", file);
      if (editing) await api.categories.update(editing._id, body); else await api.categories.create(body);
      toast.success(editing ? "Category updated" : "Category created. You can now add products to it.");
      setOpen(false); dispatch(fetchCategories());
    } catch (err) { setFailure(errorMessage(err)); } finally { setBusy(false); }
  };
  const remove = async () => {
    setBusy(true); setFailure(null);
    try { await api.categories.remove(deleting._id); setDeleting(null); dispatch(fetchCategories()); toast.success("Category deleted"); }
    catch (err) { setFailure(errorMessage(err)); } finally { setBusy(false); }
  };
  const visible = categories.filter((category) => `${category.name} ${category.slug || ""}`.toLowerCase().includes(search.toLowerCase()));
  // Preserve links from the product creation wizard and earlier bookmarks.
  if (params.get("selected")) return <Navigate replace to={`/admin/products?category=${encodeURIComponent(params.get("selected"))}`} />;
  return <div className="studio">
    <PageHeader eyebrow="Catalog / Categories" title="Every collection starts here." description="Create a category, add its products, then let customers explore and refine the collection."><Link to="/products" className="studio-button"><ExternalLink size={15} /> View store</Link><button className="studio-button studio-button-primary" onClick={() => showEditor()}><Plus size={16} /> Create category</button></PageHeader>
    <ErrorNotice error={error} retry={() => dispatch(fetchCategories())} />
    <Panel><div className="studio-toolbar"><input aria-label="Search categories" className="studio-input studio-search" placeholder="Find a category..." value={search} onChange={(event) => setSearch(event.target.value)} /><span className="text-sm text-stone-500">{visible.length} collections</span></div></Panel>
    {loading ? <LoadingState label="Loading categories..." /> : !visible.length ? <Panel><EmptyState title={search ? "No matching categories" : "Your first collection awaits"} description={search ? "Try a different category name." : "Create a category, then add products using its Add product button."} /></Panel> : <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">{visible.map((category) => <article key={category._id} className="studio-panel overflow-hidden">
      <Link className="block relative aspect-[16/9] bg-stone-100 overflow-hidden group" to={`/admin/products?category=${category._id}`} aria-label={`View ${category.name} products`}>{category.image?.url ? <img src={category.image.url} alt={category.name} loading="lazy" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" /> : <div className="grid place-items-center h-full text-stone-300"><Tag size={36} /></div>}<span className="absolute bottom-3 left-3 px-3 py-1 rounded-full bg-white/95 text-xs text-stone-700">{category.productCount ?? 0} active products</span></Link>
      <div className="p-5"><div className="flex justify-between gap-3 items-start"><div><Link to={`/admin/products?category=${category._id}`} className="text-xl font-serif text-stone-800 hover:underline">{category.name}</Link><p className="text-xs text-stone-500 mt-2">{category.subtitle || category.description || "Build a thoughtful edit of your collection."}</p></div><button aria-label={`Edit ${category.name}`} className="studio-icon-button" onClick={() => showEditor(category)}><Edit3 size={16} /></button></div><div className="flex flex-wrap gap-2 mt-5"><Link className="studio-button studio-button-small studio-button-primary" to={`/admin/products?category=${category._id}`}>View products <ArrowRight size={14} /></Link><Link className="studio-button studio-button-small" to={`/admin/products/create?category=${category._id}`}><Plus size={13} /> Add product</Link></div><div className="flex items-center justify-between border-t border-stone-100 mt-5 pt-3"><Link className="text-xs text-stone-500 flex items-center gap-1" to={`/products?category=${encodeURIComponent(category.slug || category._id)}`}>Preview collection <ExternalLink size={12} /></Link><button className="studio-icon-button" aria-label={`Delete ${category.name}`} onClick={() => { setDeleting(category); setFailure(null); }}><Trash2 size={14} /></button></div></div>
    </article>)}</div>}
    {open && <Modal title={editing ? "Edit category" : "Create category"} onClose={() => setOpen(false)} busy={busy}><form onSubmit={save} className="p-6 space-y-5"><ErrorNotice error={failure} /><div className="grid sm:grid-cols-2 gap-4"><Field label="Category name"><input className="studio-input" required value={form.name} onChange={(event) => set("name", event.target.value)} /></Field><Field label="URL slug" hint="Leave empty to create from the name."><input className="studio-input" pattern="[a-z0-9]+(-[a-z0-9]+)*" value={form.slug} onChange={(event) => set("slug", event.target.value)} /></Field><Field label="Subtitle"><input className="studio-input" value={form.subtitle} onChange={(event) => set("subtitle", event.target.value)} /></Field><Field label="Eyebrow"><input className="studio-input" value={form.eyebrow} onChange={(event) => set("eyebrow", event.target.value)} /></Field></div><Field label="Description"><textarea className="studio-input" rows={3} value={form.description} onChange={(event) => set("description", event.target.value)} /></Field><Field label="Display order"><input className="studio-input" type="number" min="0" step="1" value={form.displayOrder} onChange={(event) => set("displayOrder", event.target.value)} /></Field><Field label="Collection image" hint="JPEG, PNG or WebP, up to 10 MB."><input className="studio-input" type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => { const selected = event.target.files?.[0]; if (selected && (!['image/jpeg','image/png','image/webp'].includes(selected.type) || selected.size > 10 * 1024 * 1024)) { setFailure("Choose a JPEG, PNG or WebP image smaller than 10 MB."); event.target.value = ""; return; } setFile(selected || null); setFailure(null); }} /></Field>{(preview || editing?.image?.url) && <img src={preview || editing.image.url} className="h-36 w-full object-cover rounded-xl" alt="Collection preview" />}<div className="flex gap-5"><label className="studio-checkbox"><input type="checkbox" checked={form.isHot} onChange={(event) => set("isHot", event.target.checked)} /> Trending</label><label className="studio-checkbox"><input type="checkbox" checked={form.isFeatured} onChange={(event) => set("isFeatured", event.target.checked)} /> Featured</label></div><button className="studio-button studio-button-primary" disabled={busy}>{busy ? "Saving..." : editing ? "Save changes" : "Create category"}</button></form></Modal>}
    {deleting && <Modal title="Delete category" onClose={() => setDeleting(null)} busy={busy}><div className="p-6 space-y-4"><ErrorNotice error={failure} /><p className="text-sm text-stone-600">Delete {deleting.name}? Move its products to another category first.</p><div className="studio-actions"><button className="studio-button" onClick={() => setDeleting(null)} disabled={busy}>Keep category</button><button className="studio-button studio-button-danger" disabled={busy || Number(deleting.productCount) > 0} onClick={remove}>{busy ? "Deleting..." : "Delete category"}</button></div></div></Modal>}
  </div>;
}
