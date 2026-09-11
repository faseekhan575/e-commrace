import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useOutletContext, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { ArrowDown, ArrowRight, ChevronDown, Grid2X2, Grid3X3, RotateCcw, Search, SlidersHorizontal, Sparkles, X } from "lucide-react";
import { fetchCatalog, fetchCategories, fetchFabrics, setCatalogFilters } from "../../store/productsSlice";
import { filterCatalog, readFilters, SORTS } from "../../utils/catalog";
import ProductCard from "../../components/ProductCard";
import ShopFilters from "../../components/ShopFilters";
import "../../styles/shop.css";

export default function ProductsPage() {
  const dispatch = useDispatch();
  const { onOpenCart } = useOutletContext() || {};
  const [params, setParams] = useSearchParams();
  const filters = useMemo(() => readFilters(params), [params]);
  const { catalog, catalogLoading, catalogError, categories, categoriesError, fabrics: serverFabrics } = useSelector((state) => state.products);
  const [searchDraft, setSearchDraft] = useState(filters.search);
  const [columns, setColumns] = useState(3);
  const [retry, setRetry] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const searchTimer = useRef(null);
  const dialog = useRef(null);
  const filterTrigger = useRef(null);
  const update = useCallback((values, replace = false) => {
    setParams((current) => {
      const next = new URLSearchParams(current);
      Object.entries(values).forEach(([key, value]) => value === "" || value === false || value == null ? next.delete(key) : next.set(key, String(value)));
      next.delete("page");
      return next;
    }, { replace });
  }, [setParams]);
  const reset = () => { clearTimeout(searchTimer.current); setSearchDraft(""); setParams({}); };
  useEffect(() => { setSearchDraft(filters.search); }, [filters.search]);
  useEffect(() => () => clearTimeout(searchTimer.current), []);
  useEffect(() => { dispatch(fetchCategories()); dispatch(fetchFabrics()); }, [dispatch]);
  useEffect(() => { dispatch(setCatalogFilters(filters)); }, [dispatch, filters]);
  const query = JSON.stringify({ category: filters.category, search: filters.search, fabric: filters.fabric, minPrice: filters.minPrice, maxPrice: filters.maxPrice, inStock: filters.inStock ? "true" : "", sort: filters.sort });
  useEffect(() => {
    let request;
    const timer = setTimeout(() => { request = dispatch(fetchCatalog(JSON.parse(query))); }, 180);
    return () => { clearTimeout(timer); request?.abort(); };
  }, [dispatch, query, retry]);
  useEffect(() => {
    const refresh = () => setRetry((value) => value + 1);
    window.addEventListener("commerce:low_stock", refresh);
    return () => window.removeEventListener("commerce:low_stock", refresh);
  }, []);
  useEffect(() => {
    if (!mobileOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog.current?.focus();
    const keydown = (event) => {
      if (event.key === "Escape") setMobileOpen(false);
      if (event.key !== "Tab") return;
      const nodes = [...(dialog.current?.querySelectorAll('button, input, select, summary, [tabindex="0"]') || [])].filter((node) => !node.disabled && node.getClientRects().length);
      const first = nodes[0], last = nodes[nodes.length - 1];
      if (event.shiftKey && (document.activeElement === first || document.activeElement === dialog.current)) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    document.addEventListener("keydown", keydown);
    return () => { document.body.style.overflow = previousOverflow; document.removeEventListener("keydown", keydown); filterTrigger.current?.focus(); };
  }, [mobileOpen]);
  const matchingProducts = useMemo(() => filterCatalog(catalog, filters, categories), [catalog, filters, categories]);
  const fabrics = useMemo(() => [...new Set([...serverFabrics, ...catalog.flatMap((product) => [product.fabricType || product.fabric]).filter(Boolean)])].sort(), [serverFabrics, catalog]);
  const category = categories.find((item) => [item._id, item.slug].includes(filters.category));
  const active = [
    ...(filters.search ? [{ label: `Search: ${filters.search}`, clear: { search: "" } }] : []),
    ...(filters.category ? [{ label: category?.name || filters.category, clear: { category: "" } }] : []),
    ...(filters.fabric ? [{ label: filters.fabric, clear: { fabric: "" } }] : []),
    ...filters.sizes.map((size) => ({ label: `Size ${size}`, clear: { sizes: filters.sizes.filter((value) => value !== size).join(","), size: "" } })),
    ...(filters.stitching ? [{ label: filters.stitching === "stitched" ? "Ready to wear" : "Unstitched", clear: { stitching: "" } }] : []),
    ...(filters.minPrice || filters.maxPrice ? [{ label: `PKR ${Number(filters.minPrice || 0).toLocaleString()} - ${filters.maxPrice ? Number(filters.maxPrice).toLocaleString() : "any"}`, clear: { minPrice: "", maxPrice: "" } }] : []),
    ...(filters.inStock ? [{ label: "In stock", clear: { inStock: "" } }] : []),
    ...(filters.sale ? [{ label: "Special offers", clear: { sale: "" } }] : []),
  ];
  const filterProps = { filters, update, categories, fabrics, categoriesError, retryCategories: () => dispatch(fetchCategories()), reset };
  const invalidPrice = filters.minPrice && filters.maxPrice && Number(filters.minPrice) > Number(filters.maxPrice);
  return <main className="shop-page">
    <div className="shop-container">
      <nav className="shop-breadcrumb" aria-label="Breadcrumb"><Link to="/">Home</Link><span>/</span><span>Collections</span><span>/</span><strong>{category?.name || "All products"}</strong></nav>
      <header className="shop-heading">
        <div><p className="shop-eyebrow"><span /> THE CLOTHING DEN EDIT</p><h1>{category?.name || "An everyday kind of"}{!category && <em> extraordinary.</em>}</h1><p className="shop-intro">{category?.description || "Beautiful fabrics. Thoughtful details. Discover pieces made to be part of your story."}</p></div>
        <div className="shop-heading-note"><Sparkles size={21} strokeWidth={1} /><span>Wear what<br /><em>feels like you.</em></span><a href="#shop-results" aria-label="Browse the collection"><ArrowDown size={18} /></a></div>
      </header>
      <div className="shop-collection-tabs" aria-label="Browse collections"><button className={!filters.category ? "selected" : ""} onClick={() => update({ category: "" })}>All products</button>{categories.map((item) => <button key={item._id || item.slug} className={[item._id, item.slug].includes(filters.category) ? "selected" : ""} onClick={() => update({ category: item.slug || item._id })}>{item.name}<ArrowRight size={13} /></button>)}</div>
      <section className="shop-toolbar" aria-label="Catalog controls">
        <div className="shop-search"><Search size={17} /><input aria-label="Search products" placeholder="Find your next favourite..." value={searchDraft} onChange={(event) => { const value = event.target.value; setSearchDraft(value); clearTimeout(searchTimer.current); searchTimer.current = setTimeout(() => update({ search: value.trim() }, true), 300); }} />{searchDraft && <button aria-label="Clear search" onClick={() => { clearTimeout(searchTimer.current); setSearchDraft(""); update({ search: "" }); }}><X size={15} /></button>}</div>
        <label className="shop-select"><span className="sr-only">Category</span><select aria-label="Category" value={category?.slug || category?._id || filters.category} onChange={(event) => update({ category: event.target.value })}><option value="">All categories</option>{filters.category && !category && <option value={filters.category}>{filters.category}</option>}{categories.map((item) => <option key={item._id || item.slug} value={item.slug || item._id}>{item.name}</option>)}</select><ChevronDown size={13} /></label>
        <label className="shop-select shop-sort"><span>Sort by</span><select aria-label="Sort products" value={filters.sort} onChange={(event) => update({ sort: event.target.value })}>{Object.entries(SORTS).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select><ChevronDown size={13} /></label>
        <div className="shop-grid-toggle" aria-label="Grid layout"><button aria-label="Two column grid" aria-pressed={columns === 2} onClick={() => setColumns(2)}><Grid2X2 size={18} /></button><button aria-label="Three column grid" aria-pressed={columns === 3} onClick={() => setColumns(3)}><Grid3X3 size={18} /></button></div>
      </section>
      <div className="shop-layout">
        <aside className="shop-desktop-filters"><ShopFilters {...filterProps} /></aside>
        <section className="shop-results" id="shop-results" aria-busy={catalogLoading}>
          <div className="shop-results-heading"><p aria-live="polite">{catalogLoading ? "Finding your favourites..." : catalogError ? "Collection unavailable" : <><strong>{matchingProducts.length}</strong> {matchingProducts.length === 1 ? "piece" : "pieces"} to discover</>}</p><button ref={filterTrigger} className="shop-mobile-filter-trigger" onClick={() => setMobileOpen(true)}><SlidersHorizontal size={15} /> Filters {active.length > 0 && <span>{active.length}</span>}</button><span className="shop-curated-note">A wardrobe, thoughtfully chosen.</span></div>
          {active.length > 0 && <div className="shop-active-filters">{active.map((filter) => <button key={filter.label} onClick={() => update(filter.clear)} aria-label={`Remove ${filter.label} filter`}>{filter.label}<X size={12} /></button>)}<button className="shop-clear-all" onClick={reset}>Clear all</button></div>}
          {catalogLoading ? <div className={`shop-product-grid columns-${columns}`}>{Array.from({ length: 6 }, (_, index) => <div className="shop-skeleton" key={index}><div /><span /><span /></div>)}</div> : catalogError ? <div className="shop-empty" role="alert"><RotateCcw size={32} strokeWidth={1} /><h2>Let us try that again.</h2><p>{catalogError}</p><button className="shop-primary-button" onClick={() => setRetry((value) => value + 1)}>Reload collection <RotateCcw size={14} /></button></div> : !matchingProducts.length || invalidPrice ? <div className="shop-empty"><Search size={32} strokeWidth={1} /><span className="shop-eyebrow">A FRESH PERSPECTIVE</span><h2>A little room to explore.</h2><p>{invalidPrice ? "Adjust your price range so the minimum is below the maximum." : active.length ? "No pieces match this combination just yet. Try another fabric, size, or collection." : "Our next collection is on its way. Please check back soon."}</p>{active.length > 0 && <button className="shop-primary-button" onClick={reset}>Explore all products <ArrowRight size={15} /></button>}</div> : <div className={`shop-product-grid columns-${columns}`}>{matchingProducts.map((product, index) => <div className="shop-product-reveal" key={product._id || product.id} style={{ "--card-delay": `${Math.min(index % 12, 5) * 45}ms` }}><ProductCard product={product} index={index} onOpenCart={onOpenCart} /></div>)}</div>}
          {!catalogLoading && !catalogError && matchingProducts.length > 0 && <div className="shop-endnote"><span /><p>You have explored all {matchingProducts.length} pieces.<br /><em>Your next favourite is waiting.</em></p><span /></div>}
        </section>
      </div>
      <footer className="shop-footer-note"><Sparkles size={16} strokeWidth={1} /><p>Made for moments. Chosen for you.</p><Link to="/contact">Need a little guidance? <ArrowRight size={14} /></Link></footer>
    </div>
    {mobileOpen && <div className="shop-filter-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) setMobileOpen(false); }}><div className="shop-filter-dialog" role="dialog" aria-modal="true" aria-label="Filter collection" tabIndex={-1} ref={dialog}><div className="shop-mobile-filter-header"><span>Your perfect edit</span><button aria-label="Close filters" onClick={() => setMobileOpen(false)}><X size={20} /></button></div><div className="shop-mobile-filter-body"><ShopFilters {...filterProps} /></div><div className="shop-mobile-filter-footer"><button className="shop-primary-button" onClick={() => setMobileOpen(false)}>{catalogLoading ? "View collection" : `Show ${matchingProducts.length} pieces`}<ArrowRight size={16} /></button></div></div></div>}
  </main>;
}
