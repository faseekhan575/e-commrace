import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useOutletContext, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowDown,
  ArrowRight,
  ChevronDown,
  Grid2X2,
  Grid3X3,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Sparkles,
  X,
  Loader2,
} from "lucide-react";
import {
  fetchCatalogPage,
  clearCatalog,
  fetchCategories,
  fetchFabrics,
  setCatalogFilters,
} from "../../store/productsSlice";
import { filterCatalog, readFilters, SORTS } from "../../utils/catalog";
import ProductCard from "../../components/ProductCard";
import ShopFilters from "../../components/ShopFilters";
import "../../styles/shop.css";

export default function ProductsPage() {
  const dispatch = useDispatch();
  const { onOpenCart } = useOutletContext() || {};
  const [params, setParams] = useSearchParams();
  const filters = useMemo(() => readFilters(params), [params]);

  const {
    catalog,
    catalogLoading,
    catalogLoadingMore,
    catalogError,
    catalogTotal,
    catalogPage,
    catalogTotalPages,
    catalogHasMore,
    categories,
    categoriesError,
    fabrics: serverFabrics,
  } = useSelector((state) => state.products);

  const [searchDraft, setSearchDraft] = useState(filters.search);
  const [columns, setColumns] = useState(3);
  const [retry, setRetry] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);

  const searchTimer = useRef(null);
  const dialog = useRef(null);
  const filterTrigger = useRef(null);
  const sentinelRef = useRef(null);

  const update = useCallback(
    (values, replace = false) => {
      setParams(
        (current) => {
          const next = new URLSearchParams(current);
          Object.entries(values).forEach(([key, value]) => {
            if (value === "" || value === false || value == null) {
              next.delete(key);
            } else {
              next.set(key, String(value));
            }
          });
          next.delete("page");
          return next;
        },
        { replace }
      );
    },
    [setParams]
  );

  const reset = () => {
    clearTimeout(searchTimer.current);
    setSearchDraft("");
    setParams({});
  };

  useEffect(() => {
    setSearchDraft(filters.search);
  }, [filters.search]);

  useEffect(() => {
    return () => clearTimeout(searchTimer.current);
  }, []);

  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchFabrics());
  }, [dispatch]);

  useEffect(() => {
    dispatch(setCatalogFilters(filters));
  }, [dispatch, filters]);

  // Serialized query string for server-side fetching
  const queryObj = useMemo(
    () => ({
      category: filters.category,
      search: filters.search,
      fabric: filters.fabric,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      inStock: filters.inStock ? "true" : "",
      sizes: filters.sizes.join(","),
      stitching: filters.stitching,
      sort: filters.sort,
    }),
    [
      filters.category,
      filters.search,
      filters.fabric,
      filters.minPrice,
      filters.maxPrice,
      filters.inStock,
      filters.sizes,
      filters.stitching,
      filters.sort,
    ]
  );

  const queryString = JSON.stringify(queryObj);

  // Fetch Page 1 whenever filters change or retry is triggered
  useEffect(() => {
    let req;
    dispatch(clearCatalog());
    const timer = setTimeout(() => {
      req = dispatch(
        fetchCatalogPage({ ...JSON.parse(queryString), page: 1, limit: 12 })
      );
    }, 150);

    return () => {
      clearTimeout(timer);
      req?.abort();
    };
  }, [dispatch, queryString, retry]);

  // Infinite Scroll IntersectionObserver for Next Pages
  useEffect(() => {
    if (!catalogHasMore || catalogLoading || catalogLoadingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          catalogHasMore &&
          !catalogLoading &&
          !catalogLoadingMore
        ) {
          const nextPage = (catalogPage || 1) + 1;
          dispatch(
            fetchCatalogPage({
              ...JSON.parse(queryString),
              page: nextPage,
              limit: 12,
            })
          );
        }
      },
      {
        threshold: 0.1,
        rootMargin: "350px",
      }
    );

    const target = sentinelRef.current;
    if (target) observer.observe(target);

    return () => {
      if (target) observer.unobserve(target);
    };
  }, [
    catalogHasMore,
    catalogLoading,
    catalogLoadingMore,
    catalogPage,
    dispatch,
    queryString,
  ]);

  useEffect(() => {
    const refresh = () => setRetry((value) => value + 1);
    window.addEventListener("commerce:low_stock", refresh);
    return () => window.removeEventListener("commerce:low_stock", refresh);
  }, []);

  // Accessibility focus trap for mobile filter dialog
  useEffect(() => {
    if (!mobileOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog.current?.focus();

    const keydown = (event) => {
      if (event.key === "Escape") setMobileOpen(false);
      if (event.key !== "Tab") return;
      const nodes = [
        ...(dialog.current?.querySelectorAll(
          'button, input, select, summary, [tabindex="0"]'
        ) || []),
      ].filter((node) => !node.disabled && node.getClientRects().length);
      const first = nodes[0],
        last = nodes[nodes.length - 1];
      if (
        event.shiftKey &&
        (document.activeElement === first ||
          document.activeElement === dialog.current)
      ) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    document.addEventListener("keydown", keydown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", keydown);
      filterTrigger.current?.focus();
    };
  }, [mobileOpen]);

  const matchingProducts = useMemo(
    () => filterCatalog(catalog, filters, categories),
    [catalog, filters, categories]
  );

  const fabrics = useMemo(
    () => [
      ...new Set([
        ...serverFabrics,
        ...catalog
          .flatMap((product) => [product.fabricType || product.fabric])
          .filter(Boolean),
      ]),
    ].sort(),
    [serverFabrics, catalog]
  );

  const category = categories.find((item) =>
    [item._id, item.slug].includes(filters.category)
  );

  const active = [
    ...(filters.search
      ? [{ label: `Search: ${filters.search}`, clear: { search: "" } }]
      : []),
    ...(filters.category
      ? [
          {
            label: category?.name || filters.category,
            clear: { category: "" },
          },
        ]
      : []),
    ...(filters.fabric
      ? [{ label: filters.fabric, clear: { fabric: "" } }]
      : []),
    ...filters.sizes.map((size) => ({
      label: `Size ${size}`,
      clear: {
        sizes: filters.sizes.filter((value) => value !== size).join(","),
        size: "",
      },
    })),
    ...(filters.stitching
      ? [
          {
            label:
              filters.stitching === "stitched"
                ? "Ready to wear"
                : "Unstitched",
            clear: { stitching: "" },
          },
        ]
      : []),
    ...(filters.minPrice || filters.maxPrice
      ? [
          {
            label: `PKR ${Number(filters.minPrice || 0).toLocaleString()} - ${
              filters.maxPrice ? Number(filters.maxPrice).toLocaleString() : "any"
            }`,
            clear: { minPrice: "", maxPrice: "" },
          },
        ]
      : []),
    ...(filters.inStock ? [{ label: "In stock", clear: { inStock: "" } }] : []),
    ...(filters.sale ? [{ label: "Special offers", clear: { sale: "" } }] : []),
  ];

  const filterProps = {
    filters,
    update,
    categories,
    fabrics,
    categoriesError,
    retryCategories: () => dispatch(fetchCategories()),
    reset,
  };

  const invalidPrice =
    filters.minPrice &&
    filters.maxPrice &&
    Number(filters.minPrice) > Number(filters.maxPrice);

  const totalDisplayCount = catalogTotal || matchingProducts.length;

  return (
    <main className="shop-page">
      <div className="shop-container">
        <nav className="shop-breadcrumb" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <span>/</span>
          <span>Collections</span>
          <span>/</span>
          <strong>{category?.name || "All products"}</strong>
        </nav>

        <header className="shop-heading">
          <div>
            <p className="shop-eyebrow">
              <span /> THE CLOTHING DEN EDIT
            </p>
            <h1>
              {category?.name || "An everyday kind of"}
              {!category && <em> extraordinary.</em>}
            </h1>
            <p className="shop-intro">
              {category?.description ||
                "Beautiful fabrics. Thoughtful details. Discover pieces made to be part of your story."}
            </p>
          </div>
          <div className="shop-heading-note">
            <Sparkles size={21} strokeWidth={1.5} />
            <span>
              Wear what
              <br />
              <em>feels like you.</em>
            </span>
            <a href="#shop-results" aria-label="Browse the collection">
              <ArrowDown size={18} />
            </a>
          </div>
        </header>

        {/* Collection Filter Tabs */}
        <div className="shop-collection-tabs" aria-label="Browse collections">
          <button
            className={!filters.category ? "selected" : ""}
            onClick={() => update({ category: "" })}
          >
            All products
          </button>
          {categories.map((item) => (
            <button
              key={item._id || item.slug}
              className={
                [item._id, item.slug].includes(filters.category)
                  ? "selected"
                  : ""
              }
              onClick={() => update({ category: item.slug || item._id })}
            >
              {item.name}
              <ArrowRight size={13} />
            </button>
          ))}
        </div>

        {/* Toolbar with Search, Sort, Grid toggles */}
        <section className="shop-toolbar" aria-label="Catalog controls">
          <div className="shop-search">
            <Search size={17} />
            <input
              aria-label="Search products"
              placeholder="Find your next favourite..."
              value={searchDraft}
              onChange={(event) => {
                const value = event.target.value;
                setSearchDraft(value);
                clearTimeout(searchTimer.current);
                searchTimer.current = setTimeout(
                  () => update({ search: value.trim() }, true),
                  300
                );
              }}
            />
            {searchDraft && (
              <button
                aria-label="Clear search"
                onClick={() => {
                  clearTimeout(searchTimer.current);
                  setSearchDraft("");
                  update({ search: "" });
                }}
              >
                <X size={15} />
              </button>
            )}
          </div>

          <label className="shop-select">
            <span className="sr-only">Category</span>
            <select
              aria-label="Category"
              value={category?.slug || category?._id || filters.category}
              onChange={(event) => update({ category: event.target.value })}
            >
              <option value="">All categories</option>
              {filters.category && !category && (
                <option value={filters.category}>{filters.category}</option>
              )}
              {categories.map((item) => (
                <option key={item._id || item.slug} value={item.slug || item._id}>
                  {item.name}
                </option>
              ))}
            </select>
            <ChevronDown size={14} />
          </label>

          <label className="shop-select shop-sort">
            <span>Sort by</span>
            <select
              aria-label="Sort products"
              value={filters.sort}
              onChange={(event) => update({ sort: event.target.value })}
            >
              {Object.entries(SORTS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
            <ChevronDown size={14} />
          </label>

          <div className="shop-grid-toggle" aria-label="Grid layout">
            <button
              aria-label="Two column grid"
              aria-pressed={columns === 2}
              onClick={() => setColumns(2)}
            >
              <Grid2X2 size={18} />
            </button>
            <button
              aria-label="Three column grid"
              aria-pressed={columns === 3}
              onClick={() => setColumns(3)}
            >
              <Grid3X3 size={18} />
            </button>
          </div>
        </section>

        {/* Main Shop Layout: Sidebar + Product Grid */}
        <div className="shop-layout">
          <aside className="shop-desktop-filters">
            <ShopFilters {...filterProps} />
          </aside>

          <section
            className="shop-results"
            id="shop-results"
            aria-busy={catalogLoading}
          >
            <div className="shop-results-heading">
              <p aria-live="polite">
                {catalogLoading ? (
                  "Finding your favourites..."
                ) : catalogError ? (
                  "Collection unavailable"
                ) : (
                  <>
                    <strong>{totalDisplayCount}</strong>{" "}
                    {totalDisplayCount === 1 ? "piece" : "pieces"} to discover
                  </>
                )}
              </p>
              <button
                ref={filterTrigger}
                className="shop-mobile-filter-trigger"
                onClick={() => setMobileOpen(true)}
              >
                <SlidersHorizontal size={15} /> Filters{" "}
                {active.length > 0 && <span>{active.length}</span>}
              </button>
              <span className="shop-curated-note">
                A wardrobe, thoughtfully chosen.
              </span>
            </div>

            {/* Active filter pills */}
            {active.length > 0 && (
              <div className="shop-active-filters">
                {active.map((filter) => (
                  <button
                    key={filter.label}
                    onClick={() => update(filter.clear)}
                    aria-label={`Remove ${filter.label} filter`}
                  >
                    {filter.label}
                    <X size={12} />
                  </button>
                ))}
                <button className="shop-clear-all" onClick={reset}>
                  Clear all
                </button>
              </div>
            )}

            {/* Initial Shimmer Skeletons while loading page 1 */}
            {catalogLoading ? (
              <div className={`shop-product-grid columns-${columns}`}>
                {Array.from({ length: 9 }, (_, index) => (
                  <div className="shop-skeleton" key={index}>
                    <div />
                    <div className="shop-skeleton-meta">
                      <div className="shop-skeleton-line short" />
                      <div className="shop-skeleton-line" />
                      <div className="shop-skeleton-line price" />
                    </div>
                  </div>
                ))}
              </div>
            ) : catalogError ? (
              <div className="shop-empty" role="alert">
                <RotateCcw size={32} strokeWidth={1} />
                <h2>Let us try that again.</h2>
                <p>{catalogError}</p>
                <button
                  className="shop-primary-button"
                  onClick={() => setRetry((value) => value + 1)}
                >
                  Reload collection <RotateCcw size={14} />
                </button>
              </div>
            ) : !matchingProducts.length || invalidPrice ? (
              <div className="shop-empty">
                <Search size={32} strokeWidth={1} />
                <span className="shop-eyebrow">A FRESH PERSPECTIVE</span>
                <h2>A little room to explore.</h2>
                <p>
                  {invalidPrice
                    ? "Adjust your price range so the minimum is below the maximum."
                    : active.length
                    ? "No pieces match this combination just yet. Try another fabric, size, or collection."
                    : "Our next collection is on its way. Please check back soon."}
                </p>
                {active.length > 0 && (
                  <button className="shop-primary-button" onClick={reset}>
                    Explore all products <ArrowRight size={15} />
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className={`shop-product-grid columns-${columns}`}>
                  {matchingProducts.map((product, index) => (
                    <div
                      className="shop-product-reveal"
                      key={product._id || product.id || `prod-${index}`}
                      style={{
                        "--card-delay": `${Math.min(index % 12, 5) * 45}ms`,
                      }}
                    >
                      <ProductCard
                        product={product}
                        index={index}
                        onOpenCart={onOpenCart}
                      />
                    </div>
                  ))}

                  {/* Shimmer Skeletons Appended on Scroll when loading more */}
                  {catalogLoadingMore &&
                    Array.from({ length: 3 }, (_, index) => (
                      <div
                        className="shop-skeleton"
                        key={`more-skeleton-${index}`}
                      >
                        <div />
                        <div className="shop-skeleton-meta">
                          <div className="shop-skeleton-line short" />
                          <div className="shop-skeleton-line" />
                          <div className="shop-skeleton-line price" />
                        </div>
                      </div>
                    ))}
                </div>

                {/* Sentinel for infinite scroll */}
                <div
                  ref={sentinelRef}
                  className="h-10 w-full flex items-center justify-center my-4"
                >
                  {catalogLoadingMore && (
                    <div className="inline-flex items-center gap-2 text-xs font-mono font-bold text-[#111827] py-2 px-4 bg-white border border-gray-200 rounded-full shadow-xs">
                      <Loader2 size={14} className="animate-spin text-[#d4af37]" />
                      <span>Loading more handcrafted pieces...</span>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* End of catalog note */}
            {!catalogLoading &&
              !catalogLoadingMore &&
              !catalogHasMore &&
              matchingProducts.length > 0 && (
                <div className="shop-endnote">
                  <span />
                  <p>
                    You have explored all {totalDisplayCount} pieces.
                    <br />
                    <em>Your next favourite is waiting.</em>
                  </p>
                  <span />
                </div>
              )}
          </section>
        </div>

        <footer className="shop-footer-note">
          <Sparkles size={16} strokeWidth={1} />
          <p>Made for moments. Chosen for you.</p>
          <Link to="/contact">
            Need a little guidance? <ArrowRight size={14} />
          </Link>
        </footer>
      </div>

      {/* Mobile Filters Slide-over Modal */}
      {mobileOpen && (
        <div
          className="shop-filter-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setMobileOpen(false);
          }}
        >
          <div
            className="shop-filter-dialog"
            role="dialog"
            aria-modal="true"
            aria-label="Filter collection"
            tabIndex={-1}
            ref={dialog}
          >
            <div className="shop-mobile-filter-header">
              <span>Your perfect edit</span>
              <button
                aria-label="Close filters"
                onClick={() => setMobileOpen(false)}
              >
                <X size={20} />
              </button>
            </div>
            <div className="shop-mobile-filter-body">
              <ShopFilters {...filterProps} />
            </div>
            <div className="shop-mobile-filter-footer">
              <button
                className="shop-primary-button"
                onClick={() => setMobileOpen(false)}
              >
                {catalogLoading
                  ? "View collection"
                  : `Show ${totalDisplayCount} pieces`}
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
