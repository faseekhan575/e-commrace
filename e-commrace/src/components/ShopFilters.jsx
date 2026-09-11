import { ChevronDown, Check, RotateCcw } from "lucide-react";
import { SIZES } from "../utils/catalog";

const PRESETS = [{ label: "Under 10k", min: "0", max: "10000" }, { label: "10k – 25k", min: "10000", max: "25000" }, { label: "25k – 50k", min: "25000", max: "50000" }, { label: "50k +", min: "50000", max: "" }];
function Section({ title, children }) {
  return <details className="shop-filter-section" open><summary>{title}<ChevronDown size={14} /></summary><div>{children}</div></details>;
}
export default function ShopFilters({ filters, update, categories, fabrics, categoriesError, retryCategories, reset }) {
  const toggleSize = (size) => update({ sizes: (filters.sizes.includes(size) ? filters.sizes.filter((s) => s !== size) : [...filters.sizes, size]).join(","), size: "" });
  return <div className="shop-filter-content">
    <div className="shop-filter-title"><h2>Refine your edit</h2><button onClick={reset} className="shop-text-button" aria-label="Reset all filters"><RotateCcw size={13} /> Reset</button></div>
    <Section title="Collections">
      <label className="shop-category-option"><input type="radio" name="collection" checked={!filters.category} onChange={() => update({ category: "" })} /><span>All products</span></label>
      {categories.map((category) => <label className="shop-category-option" key={category._id || category.slug}><input type="radio" name="collection" checked={[category._id, category.slug].includes(filters.category)} onChange={() => update({ category: category.slug || category._id })} /><span>{category.name}</span>{category.productCount !== undefined && <small>{category.productCount}</small>}</label>)}
      {categoriesError && <p className="shop-filter-error">Collections couldn’t load. <button onClick={retryCategories}>Try again</button></p>}
    </Section>
    <Section title="Price range">
      <div className="shop-price-values"><label>From<input type="number" min="0" aria-label="Minimum price" placeholder="0" value={filters.minPrice} onChange={(event) => update({ minPrice: event.target.value }, true)} /></label><span>—</span><label>To<input type="number" min="0" aria-label="Maximum price" placeholder="No limit" value={filters.maxPrice} onChange={(event) => update({ maxPrice: event.target.value }, true)} /></label></div>
      <label className="shop-range-label">Maximum budget <span>PKR {Number(filters.maxPrice || 100000).toLocaleString()}</span><input type="range" min="0" max="100000" step="500" aria-label="Maximum budget" value={Math.min(100000, Number(filters.maxPrice || 100000))} onChange={(event) => update({ maxPrice: event.target.value, minPrice: Number(filters.minPrice) > Number(event.target.value) ? event.target.value : filters.minPrice }, true)} /></label>
      <div className="shop-price-presets">{PRESETS.map((preset) => <button key={preset.label} aria-pressed={filters.minPrice === preset.min && filters.maxPrice === preset.max} onClick={() => update({ minPrice: preset.min, maxPrice: preset.max })}>{preset.label}</button>)}</div>
      {filters.minPrice && filters.maxPrice && Number(filters.minPrice) > Number(filters.maxPrice) && <p className="shop-filter-error" role="alert">Minimum price must be below maximum price.</p>}
    </Section>
    <Section title="Fabric & feel"><div className="shop-fabric-options">{fabrics.map((fabric) => <button key={fabric} aria-pressed={filters.fabric === fabric} onClick={() => update({ fabric: filters.fabric === fabric ? "" : fabric })}>{filters.fabric === fabric && <Check size={12} />}{fabric}</button>)}{!fabrics.length && <span className="shop-muted">No fabric options available.</span>}</div></Section>
    <Section title="Your size"><div className="shop-size-options">{SIZES.map((size) => <button key={size} aria-pressed={filters.sizes.includes(size)} onClick={() => toggleSize(size)}>{size}</button>)}</div><p className="shop-filter-hint">Choose one or more available sizes.</p></Section>
    <Section title="Stitching"><div className="shop-stitching-options">{[["", "All pieces"], ["stitched", "Ready to wear"], ["unstitched", "Unstitched"]].map(([value, label]) => <button key={value} aria-pressed={filters.stitching === value} onClick={() => update({ stitching: value })}>{label}</button>)}</div></Section>
    <div className="shop-filter-section shop-switches"><label><span>In stock only<small>Ready for your wardrobe</small></span><input type="checkbox" role="switch" checked={filters.inStock} onChange={(event) => update({ inStock: event.target.checked ? "true" : "" })} /></label><label><span>Special offers<small>A little more to love</small></span><input type="checkbox" role="switch" checked={filters.sale} onChange={(event) => update({ sale: event.target.checked ? "true" : "" })} /></label></div>
    <div className="shop-filter-note"><span>Considered. Crafted. Yours.</span><p>Discover pieces that feel as beautiful as they look.</p></div>
  </div>;
}
