# Storefront and admin integration

The application is React 19 + Vite. Set `VITE_BACKEND_URL` in `.env` using `.env.example`; the default Express API is `http://localhost:4000`. `VITE_SOCKET_URL` can specify a separate Socket.IO origin.

## Main product flow

- `/products` collects every API page, rather than stopping at the first 100 results.
- Categories are fetched from the API for navigation, dropdowns, sidebar choices and admin forms. Category links use `/products?category=<slug-or-id>`.
- Search, category, fabric, price, availability and sorting are sent to the server. The full result set is refined by available sizes, stitching and offers. Category/search/fabric intersection is also enforced in the client to accommodate older backend query behavior.
- All controls use URL state, support back/forward navigation, and synchronize into Redux. Search is debounced; obsolete catalog requests are cancelled and ignored.
- Empty results and failed requests never substitute sample products. Public catalog, product details and admin inventory have separate request state.
- `/admin/categories` opens the selected category's inventory, exposes an Add product action with that category preselected, and provides a customer preview link.
- Published products retain their selected category; the inventory and collection pages fetch the updated data when opened.

## Connected features

`src/services/api.js` contains clients for the supplied authentication, profile, product, category, cart, order, review, CRM, dashboard, banner, spotlight and health endpoints. Existing pages also use the shared authenticated Axios client.

Session hydration validates the current user, including cookie-only sessions. Expired protected requests share a token refresh. Authenticated Socket.IO connections rejoin rooms on reconnect and broadcast the six documented events to the UI. Account changes clear private state.

Cart mutations identify the exact item/size/color. Guest bags merge after sign-in. Checkout submits real order items and totals and clears the bag only after an actual successful response. The current checkout supports cash on delivery; no payment gateway was provided in the API specification.

Admin screens include paginated inventory, category CRUD, customer CRM, review moderation, order/payment updates, courier tracking, CSV export and dashboard data. Product editing provides size stock/availability, product gallery operations and performance analytics. Profile avatar/password/account operations and customer order timelines use their documented endpoints.

The front page component and its visual layout were preserved. Shop styling is scoped to the catalog; the compact mobile header adjustment applies to secondary pages only.

## Verification

```sh
npm run lint -- --quiet
npm run build
npm test
```

Browser tests use API fixtures, including a 103-product catalog, empty/error results, category intersections, size availability, URL history, mobile filtering, admin navigation and publishing a product into a category. They do not certify a live database, email delivery, Cloudinary uploads or remote payment processing. Playwright uses the installed Microsoft Edge on this Windows workspace. Set `PLAYWRIGHT_BROWSER_PATH` to use another installed Chromium browser.

## Backend compatibility

The inspected backend differs from the supplied document in some response shapes. Dashboard/CRM handling accepts the observed alternatives, and gallery reordering sends both `imageOrder` and the older `public_ids` field. The frontend sends the documented product metadata. For the older backend, stitching also persists as a `stitched`/`unstitched` tag and piece count as `productTypeTag`; this keeps the filters working while the canonical `stitchingType`/`piecesCount` fields await backend support. No backend files were changed.
