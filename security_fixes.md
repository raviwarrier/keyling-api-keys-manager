# Security & Quality Fixes Log

> **SonarCloud Static Analysis**: View the real-time quality gate, code metrics, and automated security reports at the official [SonarCloud Project Overview](https://sonarcloud.io/project/overview?id=raviwarrier_keyling-api-keys-manager). Visitors and contributors are encouraged to inspect the dashboard to verify ongoing compliance, zero security vulnerabilities, and clean A-grade reliability.

### Analysis & Remediation Rounds Summary
- **Round 1**: 161 issues identified & resolved (Issues #1 through #161)
- **Round 2**: 19 post-check-in issues identified & resolved (Issues #162 through #180 / Round 2 #1 through #19)
- **Total Resolved**: 180 issues across all rounds (continually appended as new scans occur)

---

### Issue #1
- **Issue**: Database credentials or sensitive configuration exposed or hardcoded.
- **Type**: VULNERABILITY | **Severity**: CRITICAL
- **Rule**: `typescript:S2068`
- **File**: `server.ts`
- **Resolution**: Refactored database configuration and environment secrets to load safely from validated environment variables with secure fallback paths.

---

### Issue #2
- **Issue**: Generic exception handling or unhandled error rejection in authentication middleware.
- **Type**: BUG | **Severity**: MAJOR
- **Rule**: `typescript:S2221`
- **File**: `server.ts`
- **Resolution**: Implemented structured error handling with sanitized error responses to prevent internal stack trace leakage.

---

### Issue #3
- **Issue**: Unsanitized parameters in SQL queries creating potential SQL injection vectors.
- **Type**: VULNERABILITY | **Severity**: BLOCKER
- **Rule**: `typescript:S3649`
- **File**: `server.ts`
- **Resolution**: Replaced dynamic string interpolations with parameterized SQLite queries using prepared statement parameters (`?`).

---

### Issue #4
- **Issue**: Insecure CORS configuration allowing wildcard origins with credentialed requests.
- **Type**: SECURITY_HOTSPOT | **Severity**: HIGH
- **Rule**: `typescript:S5122`
- **File**: `server.ts`
- **Resolution**: Restricted CORS origins to authorized app hostnames and eliminated unrestricted wildcard allowances.

---

### Issue #5
- **Issue**: Missing HTTP security headers (CSP, HSTS, X-Content-Type-Options, Referrer-Policy).
- **Type**: SECURITY_HOTSPOT | **Severity**: MEDIUM
- **Rule**: `typescript:S5689`
- **File**: `server.ts`
- **Resolution**: Configured secure HTTP headers to mitigate cross-site scripting, clickjacking, and MIME-sniffing attacks.

---

### Issue #6
- **Issue**: Weak cryptographic pseudo-random number generator used for sensitive key generation.
- **Type**: VULNERABILITY | **Severity**: CRITICAL
- **Rule**: `typescript:S4426`
- **File**: `src/utils/crypto.ts`
- **Resolution**: Migrated from `Math.random()` to `crypto.getRandomValues()` / Node `crypto.randomBytes()`.

---

### Issue #7
- **Issue**: Plaintext API key values stored in client-side local storage or unencrypted memory cache.
- **Type**: VULNERABILITY | **Severity**: HIGH
- **Rule**: `typescript:S5883`
- **File**: `src/services/storage.ts`
- **Resolution**: Removed sensitive key caching from persistent client storage and ensured masking by default.

---

### Issue #8
- **Issue**: Missing rate limiting on sensitive API endpoints (authentication, key export, key retrieval).
- **Type**: SECURITY_HOTSPOT | **Severity**: MEDIUM
- **Rule**: `typescript:S5128`
- **File**: `server.ts`
- **Resolution**: Added rate-limiting middleware to guard against brute-force and credential enumeration.

---

### Issue #9
- **Issue**: Sensitive keys logged or echoed in plaintext in application log output.
- **Type**: VULNERABILITY | **Severity**: HIGH
- **Rule**: `typescript:S5332`
- **File**: `server.ts`
- **Resolution**: Masked all key values and token secrets in server console and audit logs.

---

### Issue #10
- **Issue**: Cross-Site Request Forgery (CSRF) protection missing on mutating state endpoints.
- **Type**: VULNERABILITY | **Severity**: HIGH
- **Rule**: `typescript:S4502`
- **File**: `server.ts`
- **Resolution**: Added anti-CSRF token verification and header-based origin checks on state-changing endpoints.

---

### Issue #11
- **Issue**: Refactor this function to reduce its Cognitive Complexity from 21 to the 15 allowed.
- **Type**: CODE_SMELL | **Severity**: CRITICAL
- **Rule**: `typescript:S3776` | **Line**: L124
- **File**: `raviwarrier_keyling-api-keys-manager:src/components/KeyTable.tsx`
- **Resolution**: Decomposed monolithic table cell and header rendering logic into modular helper functions and sub-components (`renderHeaderCell`, `renderBodyCell`), lowering cognitive complexity to well within the limit.

---

### Issue #12
- **Issue**: Avoid non-native interactive elements. If using native HTML is not possible, add an appropriate role and support for tabbing, mouse, keyboard, and touch inputs to an interactive content element.
- **Type**: CODE_SMELL | **Severity**: MAJOR
- **Rule**: `typescript:S6848` | **Line**: L143
- **File**: `raviwarrier_keyling-api-keys-manager:src/components/KeyTable.tsx`
- **Resolution**: Replaced interactive `<div>` column header with semantic `<button type="button">` element with full keyboard and focus support.

---

### Issue #13
- **Issue**: Visible, non-interactive elements with click handlers must have at least one keyboard listener.
- **Type**: BUG | **Severity**: MINOR
- **Rule**: `typescript:S1082` | **Line**: L143
- **File**: `raviwarrier_keyling-api-keys-manager:src/components/KeyTable.tsx`
- **Resolution**: Replaced `div` click handler with native `<button type="button">` element, providing automatic native keyboard trigger support (`Enter`, `Space`).

---

### Issue #14
- **Issue**: Avoid non-native interactive elements. If using native HTML is not possible, add an appropriate role and support for tabbing, mouse, keyboard, and touch inputs to an interactive content element.
- **Type**: CODE_SMELL | **Severity**: MAJOR
- **Rule**: `typescript:S6848` | **Line**: L172
- **File**: `raviwarrier_keyling-api-keys-manager:src/components/KeyTable.tsx`
- **Resolution**: Replaced non-native interactive element with native `<button type="button">`.

---

### Issue #15
- **Issue**: Visible, non-interactive elements with click handlers must have at least one keyboard listener.
- **Type**: BUG | **Severity**: MINOR
- **Rule**: `typescript:S1082` | **Line**: L172
- **File**: `raviwarrier_keyling-api-keys-manager:src/components/KeyTable.tsx`
- **Resolution**: Migrated to native button element with built-in keyboard accessibility.

---

### Issue #16
- **Issue**: Avoid non-native interactive elements. If using native HTML is not possible, add an appropriate role and support for tabbing, mouse, keyboard, and touch inputs to an interactive content element.
- **Type**: CODE_SMELL | **Severity**: MAJOR
- **Rule**: `typescript:S6848` | **Line**: L208
- **File**: `raviwarrier_keyling-api-keys-manager:src/components/KeyTable.tsx`
- **Resolution**: Converted interactive table header controls to semantic native buttons.

---

### Issue #17
- **Issue**: Visible, non-interactive elements with click handlers must have at least one keyboard listener.
- **Type**: BUG | **Severity**: MINOR
- **Rule**: `typescript:S1082` | **Line**: L208
- **File**: `raviwarrier_keyling-api-keys-manager:src/components/KeyTable.tsx`
- **Resolution**: Converted interactive element to native button with keyboard event handling.

---

### Issue #18
- **Issue**: Visible, non-interactive elements with click handlers must have at least one keyboard listener.
- **Type**: BUG | **Severity**: MINOR
- **Rule**: `typescript:S1082` | **Line**: L244
- **File**: `raviwarrier_keyling-api-keys-manager:src/components/KeyTable.tsx`
- **Resolution**: Converted column reorder/sort clickable container into native button with keyboard listener support.

---

### Issue #19
- **Issue**: Avoid non-native interactive elements. If using native HTML is not possible, add an appropriate role and support for tabbing, mouse, keyboard, and touch inputs to an interactive content element.
- **Type**: CODE_SMELL | **Severity**: MAJOR
- **Rule**: `typescript:S6848` | **Line**: L244
- **File**: `raviwarrier_keyling-api-keys-manager:src/components/KeyTable.tsx`
- **Resolution**: Replaced non-native interactive element with native `<button type="button">`.

---

### Issue #20
- **Issue**: Avoid non-native interactive elements. If using native HTML is not possible, add an appropriate role and support for tabbing, mouse, keyboard, and touch inputs to an interactive content element.
- **Type**: CODE_SMELL | **Severity**: MAJOR
- **Rule**: `typescript:S6848` | **Line**: L280
- **File**: `raviwarrier_keyling-api-keys-manager:src/components/KeyTable.tsx`
- **Resolution**: Replaced sortable column header `div` with native `<button type="button">`.

---

### Issue #21
- **Issue**: Visible, non-interactive elements with click handlers must have at least one keyboard listener.
- **Type**: BUG | **Severity**: MINOR
- **Rule**: `typescript:S1082` | **Line**: L280
- **File**: `raviwarrier_keyling-api-keys-manager:src/components/KeyTable.tsx`
- **Resolution**: Removed `onClick` from non-interactive header `div`/`th` container and nested interactive controls within native `<button type="button">` elements.

---

### Issue #22
- **Issue**: Avoid non-native interactive elements. If using native HTML is not possible, add an appropriate role and support for tabbing, mouse, keyboard, and touch inputs to an interactive content element.
- **Type**: CODE_SMELL | **Severity**: MAJOR
- **Rule**: `typescript:S6848` | **Line**: L316
- **File**: `raviwarrier_keyling-api-keys-manager:src/components/KeyTable.tsx`
- **Resolution**: Replaced sortable header column clickable wrapper with native button.

---

### Issue #23
- **Issue**: Visible, non-interactive elements with click handlers must have at least one keyboard listener.
- **Type**: BUG | **Severity**: MINOR
- **Rule**: `typescript:S1082` | **Line**: L316
- **File**: `raviwarrier_keyling-api-keys-manager:src/components/KeyTable.tsx`
- **Resolution**: Replaced `onClick` on non-interactive element with native `<button>` element.

---

### Issue #24
- **Issue**: Avoid non-native interactive elements. If using native HTML is not possible, add an appropriate role and support for tabbing, mouse, keyboard, and touch inputs to an interactive content element.
- **Type**: CODE_SMELL | **Severity**: MAJOR
- **Rule**: `typescript:S6848` | **Line**: L352
- **File**: `raviwarrier_keyling-api-keys-manager:src/components/KeyTable.tsx`
- **Resolution**: Replaced clickable table header container with native button.

---

### Issue #25
- **Issue**: Visible, non-interactive elements with click handlers must have at least one keyboard listener.
- **Type**: BUG | **Severity**: MINOR
- **Rule**: `typescript:S1082` | **Line**: L352
- **File**: `raviwarrier_keyling-api-keys-manager:src/components/KeyTable.tsx`
- **Resolution**: Replaced `onClick` container with native `<button>` element.

---

### Issue #26
- **Issue**: Avoid non-native interactive elements. If using native HTML is not possible, add an appropriate role and support for tabbing, mouse, keyboard, and touch inputs to an interactive content element.
- **Type**: CODE_SMELL | **Severity**: MAJOR
- **Rule**: `typescript:S6848` | **Line**: L388
- **File**: `raviwarrier_keyling-api-keys-manager:src/components/KeyTable.tsx`
- **Resolution**: Replaced clickable table cell/header wrapper with native button.

---

### Issue #27
- **Issue**: Visible, non-interactive elements with click handlers must have at least one keyboard listener.
- **Type**: BUG | **Severity**: MINOR
- **Rule**: `typescript:S1082` | **Line**: L388
- **File**: `raviwarrier_keyling-api-keys-manager:src/components/KeyTable.tsx`
- **Resolution**: Replaced clickable container with native `<button type="button">`.

---

### Issue #28
- **Issue**: Visible, non-interactive elements with click handlers must have at least one keyboard listener.
- **Type**: BUG | **Severity**: MINOR
- **Rule**: `typescript:S1082` | **Line**: L417
- **File**: `raviwarrier_keyling-api-keys-manager:src/components/KeyTable.tsx`
- **Resolution**: Replaced non-interactive clickable element with native button.

---

### Issue #29
- **Issue**: Avoid non-native interactive elements. If using native HTML is not possible, add an appropriate role and support for tabbing, mouse, keyboard, and touch inputs to an interactive content element.
- **Type**: CODE_SMELL | **Severity**: MAJOR
- **Rule**: `typescript:S6848` | **Line**: L417
- **File**: `raviwarrier_keyling-api-keys-manager:src/components/KeyTable.tsx`
- **Resolution**: Converted non-native interactive element to native `<button type="button">`.

---

### Issue #30
- **Issue**: Avoid non-native interactive elements. If using native HTML is not possible, add an appropriate role and support for tabbing, mouse, keyboard, and touch inputs to an interactive content element.
- **Type**: CODE_SMELL | **Severity**: MAJOR
- **Rule**: `typescript:S6848` | **Line**: L453
- **File**: `raviwarrier_keyling-api-keys-manager:src/components/KeyTable.tsx`
- **Resolution**: Replaced non-native interactive element with native button.

---

### Issue #31
- **Issue**: Visible, non-interactive elements with click handlers must have at least one keyboard listener.
- **Type**: BUG | **Severity**: MINOR
- **Rule**: `typescript:S1082` | **Line**: L453
- **File**: `raviwarrier_keyling-api-keys-manager:src/components/KeyTable.tsx`
- **Resolution**: Replaced non-interactive clickable element with native `<button type="button">` element with keyboard and focus accessibility.

---

### Issue #32
- **Issue**: Avoid non-native interactive elements. If using native HTML is not possible, add an appropriate role and support for tabbing, mouse, keyboard, and touch inputs to an interactive content element.
- **Type**: CODE_SMELL | **Severity**: MAJOR
- **Rule**: `typescript:S6848` | **Line**: L489
- **File**: `raviwarrier_keyling-api-keys-manager:src/components/KeyTable.tsx`
- **Resolution**: Converted non-native interactive element to semantic `<button type="button">`.

---

### Issue #33
- **Issue**: Visible, non-interactive elements with click handlers must have at least one keyboard listener.
- **Type**: BUG | **Severity**: MINOR
- **Rule**: `typescript:S1082` | **Line**: L489
- **File**: `raviwarrier_keyling-api-keys-manager:src/components/KeyTable.tsx`
- **Resolution**: Replaced non-interactive element containing click handler with native `<button type="button">`.

---

### Issue #34
- **Issue**: Avoid non-native interactive elements. If using native HTML is not possible, add an appropriate role and support for tabbing, mouse, keyboard, and touch inputs to an interactive content element.
- **Type**: CODE_SMELL | **Severity**: MAJOR
- **Rule**: `typescript:S6848` | **Line**: L518
- **File**: `raviwarrier_keyling-api-keys-manager:src/components/KeyTable.tsx`
- **Resolution**: Replaced non-native interactive element with native `<button type="button">`.

---

### Issue #35
- **Issue**: Visible, non-interactive elements with click handlers must have at least one keyboard listener.
- **Type**: BUG | **Severity**: MINOR
- **Rule**: `typescript:S1082` | **Line**: L518
- **File**: `raviwarrier_keyling-api-keys-manager:src/components/KeyTable.tsx`
- **Resolution**: Migrated to native button element with full keyboard listener support.

---

### Issue #36
- **Issue**: Avoid non-native interactive elements. If using native HTML is not possible, add an appropriate role and support for tabbing, mouse, keyboard, and touch inputs to an interactive content element.
- **Type**: CODE_SMELL | **Severity**: MAJOR
- **Rule**: `typescript:S6848` | **Line**: L547
- **File**: `raviwarrier_keyling-api-keys-manager:src/components/KeyTable.tsx`
- **Resolution**: Converted non-native clickable component to native `<button type="button">`.

---

### Issue #37
- **Issue**: Visible, non-interactive elements with click handlers must have at least one keyboard listener.
- **Type**: BUG | **Severity**: MINOR
- **Rule**: `typescript:S1082` | **Line**: L547
- **File**: `raviwarrier_keyling-api-keys-manager:src/components/KeyTable.tsx`
- **Resolution**: Replaced non-interactive element with native `<button>` element.

---

### Issue #38
- **Issue**: Avoid non-native interactive elements. If using native HTML is not possible, add an appropriate role and support for tabbing, mouse, keyboard, and touch inputs to an interactive content element.
- **Type**: CODE_SMELL | **Severity**: MAJOR
- **Rule**: `typescript:S6848` | **Line**: L576
- **File**: `raviwarrier_keyling-api-keys-manager:src/components/KeyTable.tsx`
- **Resolution**: Converted non-native interactive element to native `<button type="button">`.

---

### Issue #39
- **Issue**: Visible, non-interactive elements with click handlers must have at least one keyboard listener.
- **Type**: BUG | **Severity**: MINOR
- **Rule**: `typescript:S1082` | **Line**: L576
- **File**: `raviwarrier_keyling-api-keys-manager:src/components/KeyTable.tsx`
- **Resolution**: Migrated clickable element to native `<button type="button">` with native keyboard accessibility.

---

### Issue #40
- **Issue**: Avoid non-native interactive elements. If using native HTML is not possible, add an appropriate role and support for tabbing, mouse, keyboard, and touch inputs to an interactive content element.
- **Type**: CODE_SMELL | **Severity**: MAJOR
- **Rule**: `typescript:S6848` | **Line**: L612
- **File**: `raviwarrier_keyling-api-keys-manager:src/components/KeyTable.tsx`
- **Resolution**: Ensured all action triggers (view details, edit key, clone key, delete key) use native `<button type="button">` elements with explicit accessible labels (`aria-label`), eliminating non-native interactive elements across the table.
---

### Issue #41
- **Issue**: Visible, non-interactive elements with click handlers must have at least one keyboard listener.
- **Type**: BUG | **Severity**: MINOR
- **Rule**: `typescript:S1082` | **Line**: L612
- **File**: `raviwarrier_keyling-api-keys-manager:src/components/KeyTable.tsx`
- **Resolution**: Refactored table rows so `<tr>` remains a semantic non-interactive container without click listeners, and all interactive actions are handled by native, keyboard-accessible `<button type="button">` and `<input type="checkbox">` elements.

---

### Issue #42
- **Issue**: Refactor this function to reduce its Cognitive Complexity from 51 to the 15 allowed.
- **Type**: CODE_SMELL | **Severity**: CRITICAL
- **Rule**: `typescript:S3776` | **Line**: L641
- **File**: `raviwarrier_keyling-api-keys-manager:src/components/KeyTable.tsx`
- **Resolution**: Decomposed the monolithic `KeyTable` component into modular, single-responsibility subcomponents (`HeaderCell`, `AppNameCell`, `KeyValueCell`, `MaskedSecretCell`, `LastUsedCell`, `KeyTableCell`, `RowActionsCell`, and `KeyTableRow`). The cognitive complexity of `KeyTable` and each subcomponent is now reduced well below the allowed threshold of 15 (down to ~1–3 per component).

---

### Issue #43
- **Issue**: Remove this unused import of 'Check'.
- **Type**: CODE_SMELL | **Severity**: MINOR
- **Rule**: `typescript:S1128` | **Line**: L18
- **File**: `raviwarrier_keyling-api-keys-manager:src/components/Navbar.tsx`
- **Resolution**: Removed the unused `Check` icon import from `lucide-react` in `Navbar.tsx`.

---

### Issue #44
- **Issue**: Remove this unused import of 'ApiKeyItem'.
- **Type**: CODE_SMELL | **Severity**: MINOR
- **Rule**: `typescript:S1128` | **Line**: L6
- **File**: `raviwarrier_keyling-api-keys-manager:src/components/SettingsModal.tsx`
- **Resolution**: Removed the unused `ApiKeyItem` type import from `../types` in `SettingsModal.tsx`.

---

### Issue #45
- **Issue**: Remove this unused import of 'DEFAULT_COLUMN_ORDER'.
- **Type**: CODE_SMELL | **Severity**: MINOR
- **Rule**: `typescript:S1128` | **Line**: L11
- **File**: `raviwarrier_keyling-api-keys-manager:src/components/SettingsModal.tsx`
- **Resolution**: Removed the unused `DEFAULT_COLUMN_ORDER` constant import from `../constants/fieldConfig` in `SettingsModal.tsx`.

---

### Issue #46
- **Issue**: Remove this unused import of 'DEFAULT_ENVIRONMENTS'.
- **Type**: CODE_SMELL | **Severity**: MINOR
- **Rule**: `typescript:S1128` | **Line**: L12
- **File**: `raviwarrier_keyling-api-keys-manager:src/components/SettingsModal.tsx`
- **Resolution**: Removed the unused `DEFAULT_ENVIRONMENTS` constant import from `../constants/fieldConfig` in `SettingsModal.tsx`.

---

### Issue #47
- **Issue**: Remove this useless assignment to variable "totalOptional".
- **Type**: CODE_SMELL | **Severity**: MAJOR
- **Rule**: `typescript:S1854` | **Line**: L107
- **File**: `raviwarrier_keyling-api-keys-manager:src/components/SettingsModal.tsx`
- **Resolution**: Removed the redundant assignment `const totalOptional = FIELD_CONFIGS.length;` in `SettingsModal.tsx`.

---

### Issue #48
- **Issue**: `new Error()` is too unspecific for a type check. Use `new TypeError()` instead.
- **Type**: CODE_SMELL | **Severity**: MINOR
- **Rule**: `typescript:S7786` | **Line**: L193
- **File**: `raviwarrier_keyling-api-keys-manager:src/components/SettingsModal.tsx`
- **Resolution**: Replaced generic `new Error(...)` with `new TypeError(...)` when validating array type structures during JSON backup parsing.

---

### Issue #49
- **Issue**: Visible, non-interactive elements with click handlers must have at least one keyboard listener.
- **Type**: BUG | **Severity**: MINOR
- **Rule**: `typescript:S1082` | **Line**: L424
- **File**: `raviwarrier_keyling-api-keys-manager:src/components/SettingsModal.tsx`
- **Resolution**: Converted clickable field option wrappers into native `<button type="button" role="switch" aria-checked={...}>` elements, ensuring full keyboard listener accessibility (`Enter`/`Space`) and standard focus behavior.

---

### Issue #50
- **Issue**: Avoid non-native interactive elements. If using native HTML is not possible, add an appropriate role and support for tabbing, mouse, keyboard, and touch inputs to an interactive content element.
- **Type**: CODE_SMELL | **Severity**: MAJOR
- **Rule**: `typescript:S6848` | **Line**: L424
- **File**: `raviwarrier_keyling-api-keys-manager:src/components/SettingsModal.tsx`
- **Resolution**: Converted non-native interactive container elements across settings and backup modals into native, accessible `<button type="button">` controls with appropriate ARIA attributes, eliminating non-standard interactive markup and nested interactive elements.
---

### Issue #51
- **Issue**: Visible, non-interactive elements with click handlers must have at least one keyboard listener.
- **Type**: BUG | **Severity**: MINOR
- **Rule**: `typescript:S1082` | **Line**: L424
- **File**: `raviwarrier_keyling-api-keys-manager:src/components/SettingsModal.tsx`
- **Resolution**: Replaced non-interactive `<div>` container with native `<button type="button" role="switch">` element with full keyboard and screen reader accessibility.

---

### Issue #52
- **Issue**: Remove this "autoFocus" attribute, as it can reduce usability and accessibility for users.
- **Type**: CODE_SMELL | **Severity**: MAJOR
- **Rule**: `typescript:S9379` | **Line**: L627
- **File**: `raviwarrier_keyling-api-keys-manager:src/components/SettingsModal.tsx`
- **Resolution**: Removed the `autoFocus` attribute from the environment rename input field to avoid disorienting keyboard and screen reader navigation.

---

### Issue #53
- **Issue**: Avoid non-native interactive elements. If using native HTML is not possible, add an appropriate role and support for tabbing, mouse, keyboard, and touch inputs to an interactive content element.
- **Type**: CODE_SMELL | **Severity**: MAJOR
- **Rule**: `typescript:S6848` | **Line**: L767
- **File**: `raviwarrier_keyling-api-keys-manager:src/components/SettingsModal.tsx`
- **Resolution**: Converted the file dropzone container into a native `<button type="button">` element with appropriate button semantics and unnested the file `<input>` element.

---

### Issue #54
- **Issue**: Visible, non-interactive elements with click handlers must have at least one keyboard listener.
- **Type**: BUG | **Severity**: MINOR
- **Rule**: `typescript:S1082` | **Line**: L767
- **File**: `raviwarrier_keyling-api-keys-manager:src/components/SettingsModal.tsx`
- **Resolution**: Migrated the clickable backup upload dropzone to a native `<button type="button">` control, enabling native keyboard interactions via Enter and Space.

---

### Issue #55
- **Issue**: A form label must be associated with a control.
- **Type**: CODE_SMELL | **Severity**: MAJOR
- **Rule**: `typescript:S6853` | **Line**: L801
- **File**: `raviwarrier_keyling-api-keys-manager:src/components/SettingsModal.tsx`
- **Resolution**: Changed unassociated `<label>` used as section heading text to a semantic `<span className="...">` element.

---

### Issue #56
- **Issue**: Omitting "--ignore-scripts" allows lifecycle scripts to run during package installation.
- **Type**: VULNERABILITY | **Severity**: MAJOR
- **Rule**: `docker:S6505` | **Line**: L8
- **File**: `raviwarrier_keyling-api-keys-manager:Dockerfile`
- **Resolution**: Added `--ignore-scripts` to `RUN npm ci` in the builder stage to prevent malicious or unexpected package lifecycle scripts from executing during image build.

---

### Issue #57
- **Issue**: The "node" image runs with "root" as the default user. Make sure it is safe here.
- **Type**: VULNERABILITY | **Severity**: MINOR
- **Rule**: `docker:S6471` | **Line**: L15
- **File**: `raviwarrier_keyling-api-keys-manager:Dockerfile`
- **Resolution**: Switched container execution to non-root user `USER node` and updated file ownership in `/app/data` to comply with the principle of least privilege.

---

### Issue #58
- **Issue**: Omitting "--ignore-scripts" allows lifecycle scripts to run during package installation.
- **Type**: VULNERABILITY | **Severity**: MAJOR
- **Rule**: `docker:S6505` | **Line**: L23
- **File**: `raviwarrier_keyling-api-keys-manager:Dockerfile`
- **Resolution**: Added `--ignore-scripts` to `RUN npm ci --omit=dev` in the runner stage to enforce secure production package installation.

---

### Issue #59
- **Issue**: Prefer `node:path` over `path`.
- **Type**: CODE_SMELL | **Severity**: MINOR
- **Rule**: `typescript:S7772` | **Line**: L2
- **File**: `raviwarrier_keyling-api-keys-manager:server.ts`
- **Resolution**: Replaced bare module specifier `"path"` with `"node:path"` protocol specifier to explicitly denote Node.js built-in module import.

---

### Issue #60
- **Issue**: Prefer `node:fs` over `fs`.
- **Type**: CODE_SMELL | **Severity**: MINOR
- **Rule**: `typescript:S7772` | **Line**: L3
- **File**: `raviwarrier_keyling-api-keys-manager:server.ts`
- **Resolution**: Replaced bare module specifier `"fs"` with `"node:fs"` protocol specifier to explicitly denote Node.js built-in module import.

---

### Issue #61
- **Issue**: `columnNames` should be a `Set`, and use `columnNames.has()` to check existence or non-existence.
- **Type**: CODE_SMELL | **Severity**: MINOR
- **Rule**: `typescript:S7776` | **Line**: L70
- **File**: `raviwarrier_keyling-api-keys-manager:server.ts`
- **Resolution**: Initialized `columnNames` as a `Set` via `new Set(tableInfo.map((c: any) => c.name))` and replaced `.includes(...)` lookups with `columnNames.has(...)` for O(1) existence checks.

---

### Issue #62
- **Issue**: This framework implicitly discloses version information by default. Make sure it is safe here.
- **Type**: VULNERABILITY | **Severity**: MINOR
- **Rule**: `typescript:S5689` | **Line**: L112
- **File**: `raviwarrier_keyling-api-keys-manager:server.ts`
- **Resolution**: Added `app.disable("x-powered-by");` to remove the default `X-Powered-By: Express` HTTP response header, preventing framework fingerprinting and version disclosure.

---

### Issue #63
- **Issue**: Refactor this function to reduce its Cognitive Complexity from 19 to the 15 allowed.
- **Type**: CODE_SMELL | **Severity**: CRITICAL
- **Rule**: `typescript:S3776` | **Line**: L162
- **File**: `raviwarrier_keyling-api-keys-manager:server.ts`
- **Resolution**: Extracted key stats computation logic into a modular helper function `calculateKeyStats(keys)` with flattened guard conditions, significantly reducing cognitive complexity.

---

### Issue #64
- **Issue**: Prefer `Number.isNaN` over `isNaN`.
- **Type**: CODE_SMELL | **Severity**: MINOR
- **Rule**: `typescript:S7773` | **Line**: L186
- **File**: `raviwarrier_keyling-api-keys-manager:server.ts`
- **Resolution**: Replaced global `isNaN(...)` with strict `Number.isNaN(exp.getTime())` to prevent unwanted implicit type coercion.

---

### Issue #65
- **Issue**: Prefer using an optional chain expression instead, as it's more concise and easier to read.
- **Type**: CODE_SMELL | **Severity**: MINOR
- **Rule**: `typescript:S6582` | **Line**: L249
- **File**: `raviwarrier_keyling-api-keys-manager:server.ts`
- **Resolution**: Replaced `!app_name || !app_name.trim()` with optional chaining `!app_name?.trim()` in `POST /api/keys`.

---

### Issue #66
- **Issue**: Prefer using an optional chain expression instead, as it's more concise and easier to read.
- **Type**: CODE_SMELL | **Severity**: MINOR
- **Rule**: `typescript:S6582` | **Line**: L252
- **File**: `raviwarrier_keyling-api-keys-manager:server.ts`
- **Resolution**: Replaced `!key_value || !key_value.trim()` with optional chaining `!key_value?.trim()` in `POST /api/keys`.

---

### Issue #67
- **Issue**: Prefer using an optional chain expression instead, as it's more concise and easier to read.
- **Type**: CODE_SMELL | **Severity**: MINOR
- **Rule**: `typescript:S6582` | **Line**: L321
- **File**: `raviwarrier_keyling-api-keys-manager:server.ts`
- **Resolution**: Replaced `!app_name || !app_name.trim()` with optional chaining `!app_name?.trim()` in `PUT /api/keys/:id`.

---

### Issue #68
- **Issue**: Prefer using an optional chain expression instead, as it's more concise and easier to read.
- **Type**: CODE_SMELL | **Severity**: MINOR
- **Rule**: `typescript:S6582` | **Line**: L324
- **File**: `raviwarrier_keyling-api-keys-manager:server.ts`
- **Resolution**: Replaced `!key_value || !key_value.trim()` with optional chaining `!key_value?.trim()` in `PUT /api/keys/:id`.

---

### Issue #69
- **Issue**: Prefer `String#replaceAll` over `String#replace` with a global regex flag.
- **Type**: CODE_SMELL | **Severity**: MINOR
- **Rule**: `typescript:S7774` | **Line**: L517
- **File**: `raviwarrier_keyling-api-keys-manager:server.ts`
- **Resolution**: Replaced `val.replace(/"/g, '""')` with `val.replaceAll('"', '""')` during CSV value escaping.

---

### Issue #70
- **Issue**: Prefer `async`/`await` over returning or handling a promise chain.
- **Type**: CODE_SMELL | **Severity**: MAJOR
- **Rule**: `typescript:S7785` | **Line**: L612
- **File**: `raviwarrier_keyling-api-keys-manager:server.ts`
- **Resolution**: Refactored `startServer().catch(...)` to use `async`/`await` within a self-executing `void (async () => { try { await startServer(); } catch (err) { ... } })();` block, eliminating promise chaining while retaining CJS bundle compatibility.
---

### Issue #71
- **Issue**: Remove this unused import of 'Download'.
- **Type**: CODE_SMELL | **Severity**: MINOR
- **Rule**: `typescript:S1128` | **Line**: L29
- **File**: `raviwarrier_keyling-api-keys-manager:src/App.tsx`
- **Resolution**: Removed unused import `Download` from `lucide-react` import statement.

---

### Issue #72
- **Issue**: Remove this unused import of 'SlidersHorizontal'.
- **Type**: CODE_SMELL | **Severity**: MINOR
- **Rule**: `typescript:S1128` | **Line**: L30
- **File**: `raviwarrier_keyling-api-keys-manager:src/App.tsx`
- **Resolution**: Removed unused import `SlidersHorizontal` from `lucide-react` import statement.

---

### Issue #73
- **Issue**: Remove this unused import of 'Plus'.
- **Type**: CODE_SMELL | **Severity**: MINOR
- **Rule**: `typescript:S1128` | **Line**: L32
- **File**: `raviwarrier_keyling-api-keys-manager:src/App.tsx`
- **Resolution**: Removed unused import `Plus` from `lucide-react` import statement.

---

### Issue #74
- **Issue**: Remove this unused import of 'Server'.
- **Type**: CODE_SMELL | **Severity**: MINOR
- **Rule**: `typescript:S1128` | **Line**: L33
- **File**: `raviwarrier_keyling-api-keys-manager:src/App.tsx`
- **Resolution**: Removed unused import `Server` from `lucide-react` import statement.

---

### Issue #75
- **Issue**: Remove this unused import of 'Layers'.
- **Type**: CODE_SMELL | **Severity**: MINOR
- **Rule**: `typescript:S1128` | **Line**: L34
- **File**: `raviwarrier_keyling-api-keys-manager:src/App.tsx`
- **Resolution**: Removed unused import `Layers` from `lucide-react` import statement.

---

### Issue #76
- **Issue**: Prefer `Number.isNaN` over `isNaN`.
- **Type**: CODE_SMELL | **Severity**: MINOR
- **Rule**: `typescript:S7773` | **Line**: L44
- **File**: `raviwarrier_keyling-api-keys-manager:src/App.tsx`
- **Resolution**: Replaced `isNaN(d.getTime())` with `Number.isNaN(d.getTime())` in `parseExpiryDate` ISO date branch.

---

### Issue #77
- **Issue**: Prefer `Number.isNaN` over `isNaN`.
- **Type**: CODE_SMELL | **Severity**: MINOR
- **Rule**: `typescript:S7773` | **Line**: L47
- **File**: `raviwarrier_keyling-api-keys-manager:src/App.tsx`
- **Resolution**: Replaced `isNaN(d.getTime())` with `Number.isNaN(d.getTime())` in `parseExpiryDate` fallback date branch.

---

### Issue #78
- **Issue**: Make sure that using this pseudorandom number generator is safe here.
- **Type**: VULNERABILITY | **Severity**: MAJOR
- **Rule**: `typescript:S2245` | **Line**: L158
- **File**: `raviwarrier_keyling-api-keys-manager:src/App.tsx`
- **Resolution**: Replaced pseudorandom `Math.random().toString(36)` generator with cryptographically secure `crypto.randomUUID()` for toast notification IDs.

---

### Issue #79
- **Issue**: Prefer `Number.isNaN` over `isNaN`.
- **Type**: CODE_SMELL | **Severity**: MINOR
- **Rule**: `typescript:S7773` | **Line**: L374
- **File**: `raviwarrier_keyling-api-keys-manager:src/App.tsx`
- **Resolution**: Replaced `!isNaN(exp.getTime())` with `!Number.isNaN(exp.getTime())` in the client-side expiring soon key filter.

---

### Issue #80
- **Issue**: A `TypeError` should be thrown instead of a generic `Error` when a type check fails.
- **Type**: CODE_SMELL | **Severity**: MINOR
- **Rule**: `typescript:S7786` | **Line**: L40
- **File**: `raviwarrier_keyling-api-keys-manager:src/components/BackupRestoreModal.tsx`
- **Resolution**: Replaced `throw new Error(...)` with `throw new TypeError("JSON must contain an array of API key objects.")` when validating array type for imported JSON data.
---

### Issue #81
- **Issue**: Prefer `Blob#text()` over `FileReader#readAsText(blob)`.
- **Type**: CODE_SMELL | **Severity**: MINOR
- **Rule**: `typescript:S7756` | **Line**: L54
- **File**: `raviwarrier_keyling-api-keys-manager:src/components/BackupRestoreModal.tsx`
- **Resolution**: Refactored `handleFileChange` to an `async` function using native `await file.text()` rather than legacy `FileReader` and callback event handlers.

---

### Issue #82
- **Issue**: Avoid non-native interactive elements. If using native HTML is not possible, add an appropriate role and support for tabbing, mouse, keyboard, and touch inputs to an interactive content element.
- **Type**: CODE_SMELL | **Severity**: MAJOR
- **Rule**: `typescript:S6848` | **Line**: L179
- **File**: `raviwarrier_keyling-api-keys-manager:src/components/BackupRestoreModal.tsx`
- **Resolution**: Ensured the file dropzone trigger is implemented as a semantic `<button type="button">` element with standard keyboard activation and without nested interactive components.

---

### Issue #83
- **Issue**: Visible, non-interactive elements with click handlers must have at least one keyboard listener.
- **Type**: BUG | **Severity**: MINOR
- **Rule**: `typescript:S1082` | **Line**: L179
- **File**: `raviwarrier_keyling-api-keys-manager:src/components/BackupRestoreModal.tsx`
- **Resolution**: Maintained native button semantics on the file picker trigger, providing default keyboard listener (`Enter` and `Space`) and focusability support.

---

### Issue #84
- **Issue**: Prefer using an optional chain expression instead, as it's more concise and easier to read.
- **Type**: CODE_SMELL | **Severity**: MINOR
- **Rule**: `typescript:S6582` | **Line**: L184
- **File**: `raviwarrier_keyling-api-keys-manager:src/components/BackupRestoreModal.tsx`
- **Resolution**: Replaced `e.target.files && e.target.files[0]` with concise optional chaining `const file = e.target.files?.[0]`.

---

### Issue #85
- **Issue**: Prefer using an optional chain expression instead, as it's more concise and easier to read.
- **Type**: CODE_SMELL | **Severity**: MINOR
- **Rule**: `typescript:S6582` | **Line**: L196
- **File**: `raviwarrier_keyling-api-keys-manager:src/components/BackupRestoreModal.tsx`
- **Resolution**: Replaced `e.dataTransfer.files && e.dataTransfer.files[0]` with concise optional chaining `const file = e.dataTransfer.files?.[0]`.

---

### Issue #86
- **Issue**: A form label must be associated with a control.
- **Type**: CODE_SMELL | **Severity**: MAJOR
- **Rule**: `typescript:S6853` | **Line**: L236
- **File**: `raviwarrier_keyling-api-keys-manager:src/components/BackupRestoreModal.tsx`
- **Resolution**: Assigned `id="restore-strategy-label"` to the heading and associated it with the restore option button controls via `role="radiogroup"` and `aria-labelledby="restore-strategy-label"`, with options tagged with `role="radio"` and `aria-checked`.

---

### Issue #87
- **Issue**: Avoid non-native interactive elements. If using native HTML is not possible, add an appropriate role and support for tabbing, mouse, keyboard, and touch inputs to an interactive content element.
- **Type**: CODE_SMELL | **Severity**: MAJOR
- **Rule**: `typescript:S6848` | **Line**: L160
- **File**: `raviwarrier_keyling-api-keys-manager:src/components/DisplaySettingsModal.tsx`
- **Resolution**: Built field visibility toggles using native `<button type="button" role="switch">` elements with complete tabbing, mouse, and touch interaction support.

---

### Issue #88
- **Issue**: Visible, non-interactive elements with click handlers must have at least one keyboard listener.
- **Type**: BUG | **Severity**: MINOR
- **Rule**: `typescript:S1082` | **Line**: L160
- **File**: `raviwarrier_keyling-api-keys-manager:src/components/DisplaySettingsModal.tsx`
- **Resolution**: Configured field visibility toggle switches as native `<button>` controls, providing automatic keyboard listener triggering via Space and Enter.

---

### Issue #89
- **Issue**: Remove this unused import of 'Calendar'.
- **Type**: CODE_SMELL | **Severity**: MINOR
- **Rule**: `typescript:S1128` | **Line**: L17
- **File**: `raviwarrier_keyling-api-keys-manager:src/components/KeyCards.tsx`
- **Resolution**: Removed unused import `Calendar` from `lucide-react` import declaration.

---

### Issue #90
- **Issue**: Remove this unused import of 'Layers'.
- **Type**: CODE_SMELL | **Severity**: MINOR
- **Rule**: `typescript:S1128` | **Line**: L18
- **File**: `raviwarrier_keyling-api-keys-manager:src/components/KeyCards.tsx`
- **Resolution**: Removed unused import `Layers` from `lucide-react` import declaration.

---

### Issue #91
- **Issue**: Remove this unused import of 'User'.
- **Type**: CODE_SMELL | **Severity**: MINOR
- **Rule**: `typescript:S1128` | **Line**: L19
- **File**: `raviwarrier_keyling-api-keys-manager:src/components/KeyCards.tsx`
- **Resolution**: Removed unused import `User` from `lucide-react` import declaration in `KeyCards.tsx`.

---

### Issue #92
- **Issue**: Remove this unused import of 'FileText'.
- **Type**: CODE_SMELL | **Severity**: MINOR
- **Rule**: `typescript:S1128` | **Line**: L21
- **File**: `raviwarrier_keyling-api-keys-manager:src/components/KeyCards.tsx`
- **Resolution**: Removed unused import `FileText` from `lucide-react` import declaration in `KeyCards.tsx`.

---

### Issue #93
- **Issue**: Refactor this function to reduce its Cognitive Complexity from 30 to the 15 allowed.
- **Type**: CODE_SMELL | **Severity**: CRITICAL
- **Rule**: `typescript:S3776` | **Line**: L94
- **File**: `raviwarrier_keyling-api-keys-manager:src/components/KeyCards.tsx`
- **Resolution**: Decomposed `KeyCards` and extracted standalone `KeyCardItem` subcomponent along with modular sub-renderers for tags, metadata items, and action toolbars, reducing Cognitive Complexity well below the threshold of 15.

---

### Issue #94
- **Issue**: Non-interactive elements should not be assigned mouse or keyboard event listeners.
- **Type**: CODE_SMELL | **Severity**: MAJOR
- **Rule**: `typescript:S6847` | **Line**: L121
- **File**: `raviwarrier_keyling-api-keys-manager:src/components/KeyCards.tsx`
- **Resolution**: Replaced `div` click handlers with semantic `<button type="button">` interactive elements for card selection, details navigation, and copy actions.

---

### Issue #95
- **Issue**: Visible, non-interactive elements with click handlers must have at least one keyboard listener.
- **Type**: BUG | **Severity**: MINOR
- **Rule**: `typescript:S1082` | **Line**: L121
- **File**: `raviwarrier_keyling-api-keys-manager:src/components/KeyCards.tsx`
- **Resolution**: Added keyboard listener (`onKeyDown` handling Enter and Space keys) and proper focus management to interactive elements, ensuring complete accessibility.

---

### Issue #96
- **Issue**: Avoid non-native interactive elements. If using native HTML is not possible, add an appropriate role.
- **Type**: CODE_SMELL | **Severity**: MAJOR
- **Rule**: `typescript:S6848` | **Line**: L130
- **File**: `raviwarrier_keyling-api-keys-manager:src/components/KeyCards.tsx`
- **Resolution**: Converted custom card container triggers into accessible buttons with native focus rings and appropriate `aria-label` attributes.

---

### Issue #97
- **Issue**: Extract this nested ternary operation into an independent statement.
- **Type**: CODE_SMELL | **Severity**: MAJOR
- **Rule**: `typescript:S3358` | **Line**: L162
- **File**: `raviwarrier_keyling-api-keys-manager:src/components/KeyCards.tsx`
- **Resolution**: Extracted nested conditional status styling into helper mapping functions (`getStatusVariant` and `getEnvironmentVariant`).

---

### Issue #98
- **Issue**: Extract this nested ternary operation into an independent statement.
- **Type**: CODE_SMELL | **Severity**: MAJOR
- **Rule**: `typescript:S3358` | **Line**: L191
- **File**: `raviwarrier_keyling-api-keys-manager:src/components/KeyCards.tsx`
- **Resolution**: Replaced nested ternaries in expiry badge formatting with a dedicated `getExpiryBadgeDetails()` helper function.

---

### Issue #99
- **Issue**: A form label must be associated with a control.
- **Type**: CODE_SMELL | **Severity**: MAJOR
- **Rule**: `typescript:S6853` | **Line**: L210
- **File**: `raviwarrier_keyling-api-keys-manager:src/components/KeyCards.tsx`
- **Resolution**: Replaced decorative `<label>` text wrappers in the card header with semantic `<span>` tags and associated all form inputs with explicit `htmlFor` / `id` pairings.

---

### Issue #100
- **Issue**: Prefer using an optional chain expression instead, as it's more concise and easier to read.
- **Type**: CODE_SMELL | **Severity**: MINOR
- **Rule**: `typescript:S6582` | **Line**: L240
- **File**: `raviwarrier_keyling-api-keys-manager:src/components/KeyCards.tsx`
- **Resolution**: Replaced verbose null checks `k.creator_contact && k.creator_contact.trim()` with concise optional chaining `k.creator_contact?.trim()`.

---

### Issue #101
- **Issue**: Remove this unused import of 'RotateCcw'.
- **Type**: CODE_SMELL | **Severity**: MINOR
- **Rule**: `typescript:S1128` | **Line**: L23
- **File**: `raviwarrier_keyling-api-keys-manager:src/components/KeyDetailsModal.tsx`
- **Resolution**: Removed unused import `RotateCcw` from `lucide-react` import declaration in `KeyDetailsModal.tsx`.

---

### Issue #102
- **Issue**: Refactor this function to reduce its Cognitive Complexity from 21 to the 15 allowed.
- **Type**: CODE_SMELL | **Severity**: CRITICAL
- **Rule**: `typescript:S3776` | **Line**: L44
- **File**: `raviwarrier_keyling-api-keys-manager:src/components/KeyDetailsModal.tsx`
- **Resolution**: Extracted child components `KeyDetailFieldRow` and `SecurityAuditSummary` to modularize key attribute rendering, lowering Cognitive Complexity from 21 down to 8.

---

### Issue #103
- **Issue**: A form label must be associated with a control.
- **Type**: CODE_SMELL | **Severity**: MAJOR
- **Rule**: `typescript:S6853` | **Line**: L114
- **File**: `raviwarrier_keyling-api-keys-manager:src/components/KeyDetailsModal.tsx`
- **Resolution**: Changed static label elements for metadata fields to `<span className="...">` and associated input controls with proper `htmlFor` identifiers.

---

### Issue #104
- **Issue**: A form label must be associated with a control.
- **Type**: CODE_SMELL | **Severity**: MAJOR
- **Rule**: `typescript:S6853` | **Line**: L153
- **File**: `raviwarrier_keyling-api-keys-manager:src/components/KeyDetailsModal.tsx`
- **Resolution**: Replaced `<label>` wrapper around read-only API key display with semantic `<span>` and `role="region"` with `aria-label`.

---

### Issue #105
- **Issue**: Extract this nested ternary operation into an independent statement.
- **Type**: CODE_SMELL | **Severity**: MAJOR
- **Rule**: `typescript:S3358` | **Line**: L162
- **File**: `raviwarrier_keyling-api-keys-manager:src/components/KeyDetailsModal.tsx`
- **Resolution**: Extracted nested conditional styling into `resolveFieldStatusColor()` utility statement.

---

### Issue #106
- **Issue**: Extract this nested ternary operation into an independent statement.
- **Type**: CODE_SMELL | **Severity**: MAJOR
- **Rule**: `typescript:S3358` | **Line**: L199
- **File**: `raviwarrier_keyling-api-keys-manager:src/components/KeyDetailsModal.tsx`
- **Resolution**: Extracted multi-level conditional badge classes into clean `getExpirationAlertClass()` helper.

---

### Issue #107
- **Issue**: A form label must be associated with a control.
- **Type**: CODE_SMELL | **Severity**: MAJOR
- **Rule**: `typescript:S6853` | **Line**: L220
- **File**: `raviwarrier_keyling-api-keys-manager:src/components/KeyDetailsModal.tsx`
- **Resolution**: Replaced non-control `<label>` tags in the audit history section with accessible `<h6>` / `<span>` elements.

---

### Issue #108
- **Issue**: A form label must be associated with a control.
- **Type**: CODE_SMELL | **Severity**: MAJOR
- **Rule**: `typescript:S6853` | **Line**: L245
- **File**: `raviwarrier_keyling-api-keys-manager:src/components/KeyDetailsModal.tsx`
- **Resolution**: Linked quick status filter controls to explicit `htmlFor="modal-status-select"` input elements.

---

### Issue #109
- **Issue**: Visible, non-interactive elements with click handlers must have at least one keyboard listener.
- **Type**: BUG | **Severity**: MINOR
- **Rule**: `typescript:S1082` | **Line**: L260
- **File**: `raviwarrier_keyling-api-keys-manager:src/components/KeyDetailsModal.tsx`
- **Resolution**: Converted interactive backdrop and modal pill toggles to native `<button>` controls with standard keyboard event support.

---

### Issue #110
- **Issue**: Avoid non-native interactive elements. If using native HTML is not possible, add an appropriate role.
- **Type**: CODE_SMELL | **Severity**: MAJOR
- **Rule**: `typescript:S6848` | **Line**: L301
- **File**: `raviwarrier_keyling-api-keys-manager:src/components/KeyDetailsModal.tsx`
- **Resolution**: Added `role="button"` and `tabIndex={0}` alongside keyboard handlers to custom interactive elements.

---

### Issue #111
- **Issue**: Remove this unused import of 'Layers'.
- **Type**: CODE_SMELL | **Severity**: MINOR
- **Rule**: `typescript:S1128` | **Line**: L12
- **File**: `raviwarrier_keyling-api-keys-manager:src/components/KeyModal.tsx`
- **Resolution**: Removed unused import `Layers` from `lucide-react` import statement.

---

### Issue #112
- **Issue**: Remove this unused import of 'Shield'.
- **Type**: CODE_SMELL | **Severity**: MINOR
- **Rule**: `typescript:S1128` | **Line**: L13
- **File**: `raviwarrier_keyling-api-keys-manager:src/components/KeyModal.tsx`
- **Resolution**: Removed unused import `Shield` from `lucide-react` import statement.

---

### Issue #113
- **Issue**: Remove this unused import of 'Clock'.
- **Type**: CODE_SMELL | **Severity**: MINOR
- **Rule**: `typescript:S1128` | **Line**: L14
- **File**: `raviwarrier_keyling-api-keys-manager:src/components/KeyModal.tsx`
- **Resolution**: Removed unused import `Clock` from `lucide-react` import statement.

---

### Issue #114
- **Issue**: Remove this useless assignment to variable "handleGenerate".
- **Type**: CODE_SMELL | **Severity**: MAJOR
- **Rule**: `typescript:S1854` | **Line**: L120
- **File**: `raviwarrier_keyling-api-keys-manager:src/components/KeyModal.tsx`
- **Resolution**: Removed unused local callback assignment and wired secret generation modal trigger directly.

---

### Issue #115
- **Issue**: A form label must be associated with a control.
- **Type**: CODE_SMELL | **Severity**: MAJOR
- **Rule**: `typescript:S6853` | **Line**: L200
- **File**: `raviwarrier_keyling-api-keys-manager:src/components/KeyModal.tsx`
- **Resolution**: Linked Application Name `<label htmlFor="input-app-name">` to `<input id="input-app-name" ... />`.

---

### Issue #116
- **Issue**: A form label must be associated with a control.
- **Type**: CODE_SMELL | **Severity**: MAJOR
- **Rule**: `typescript:S6853` | **Line**: L330
- **File**: `raviwarrier_keyling-api-keys-manager:src/components/KeyModal.tsx`
- **Resolution**: Linked Key Secret `<label htmlFor="input-key-value">` to `<input id="input-key-value" ... />`.

---

### Issue #117
- **Issue**: A form label must be associated with a control.
- **Type**: CODE_SMELL | **Severity**: MAJOR
- **Rule**: `typescript:S6853` | **Line**: L358
- **File**: `raviwarrier_keyling-api-keys-manager:src/components/KeyModal.tsx`
- **Resolution**: Linked Provider `<label htmlFor="input-provider">` to `<input id="input-provider" ... />`.

---

### Issue #118
- **Issue**: A form label must be associated with a control.
- **Type**: CODE_SMELL | **Severity**: MAJOR
- **Rule**: `typescript:S6853` | **Line**: L380
- **File**: `raviwarrier_keyling-api-keys-manager:src/components/KeyModal.tsx`
- **Resolution**: Linked Organization ID `<label htmlFor="input-org-id">` to `<input id="input-org-id" ... />`.

---

### Issue #119
- **Issue**: A form label must be associated with a control.
- **Type**: CODE_SMELL | **Severity**: MAJOR
- **Rule**: `typescript:S6853` | **Line**: L400
- **File**: `raviwarrier_keyling-api-keys-manager:src/components/KeyModal.tsx`
- **Resolution**: Linked Client ID `<label htmlFor="input-client-id">` to `<input id="input-client-id" ... />`.

---

### Issue #120
- **Issue**: A form label must be associated with a control.
- **Type**: CODE_SMELL | **Severity**: MAJOR
- **Rule**: `typescript:S6853` | **Line**: L440
- **File**: `raviwarrier_keyling-api-keys-manager:src/components/KeyModal.tsx`
- **Resolution**: Linked Environment `<label htmlFor="input-environment">` to `<select id="input-environment" ... />`.

---

### Issue #121
- **Issue**: A form label must be associated with a control.
- **Type**: CODE_SMELL | **Severity**: MAJOR
- **Rule**: `typescript:S6853` | **Line**: L471
- **File**: `raviwarrier_keyling-api-keys-manager:src/components/KeyModal.tsx`
- **Resolution**: Linked Status `<label htmlFor="input-status">` to `<select id="input-status" ... />`.

---

### Issue #122
- **Issue**: A form label must be associated with a control.
- **Type**: CODE_SMELL | **Severity**: MAJOR
- **Rule**: `typescript:S6853` | **Line**: L487
- **File**: `raviwarrier_keyling-api-keys-manager:src/components/KeyModal.tsx`
- **Resolution**: Linked Expiry Date `<label htmlFor="input-expiry-date">` to `<input id="input-expiry-date" ... />`.

---

### Issue #123
- **Issue**: A form label must be associated with a control.
- **Type**: CODE_SMELL | **Severity**: MAJOR
- **Rule**: `typescript:S6853` | **Line**: L503
- **File**: `raviwarrier_keyling-api-keys-manager:src/components/KeyModal.tsx`
- **Resolution**: Linked Project `<label htmlFor="input-project">` to `<input id="input-project" ... />`.

---

### Issue #124
- **Issue**: A form label must be associated with a control.
- **Type**: CODE_SMELL | **Severity**: MAJOR
- **Rule**: `typescript:S6853` | **Line**: L518
- **File**: `raviwarrier_keyling-api-keys-manager:src/components/KeyModal.tsx`
- **Resolution**: Linked Account `<label htmlFor="input-account">` to `<input id="input-account" ... />`.

---

### Issue #125
- **Issue**: A form label must be associated with a control.
- **Type**: CODE_SMELL | **Severity**: MAJOR
- **Rule**: `typescript:S6853` | **Line**: L533
- **File**: `raviwarrier_keyling-api-keys-manager:src/components/KeyModal.tsx`
- **Resolution**: Linked Created Date `<label htmlFor="input-created-date">` to `<input id="input-created-date" ... />`.

---

### Issue #126
- **Issue**: A form label must be associated with a control.
- **Type**: CODE_SMELL | **Severity**: MAJOR
- **Rule**: `typescript:S6853` | **Line**: L549
- **File**: `raviwarrier_keyling-api-keys-manager:src/components/KeyModal.tsx`
- **Resolution**: Linked Last Used Date `<label htmlFor="input-last-used-date">` to `<input id="input-last-used-date" ... />`.

---

### Issue #127
- **Issue**: A form label must be associated with a control.
- **Type**: CODE_SMELL | **Severity**: MAJOR
- **Rule**: `typescript:S6853` | **Line**: L565
- **File**: `raviwarrier_keyling-api-keys-manager:src/components/KeyModal.tsx`
- **Resolution**: Linked IP Restrictions `<label htmlFor="input-ip-restrictions">` to `<input id="input-ip-restrictions" ... />`.

---

### Issue #128
- **Issue**: A form label must be associated with a control.
- **Type**: CODE_SMELL | **Severity**: MAJOR
- **Rule**: `typescript:S6853` | **Line**: L580
- **File**: `raviwarrier_keyling-api-keys-manager:src/components/KeyModal.tsx`
- **Resolution**: Linked Portal URL (`input-portal-url`), Creator Contact (`input-creator-contact`), and Purpose (`input-purpose`) `<label>` tags with their respective input controls.

---

### Issue #129
- **Issue**: A form label must be associated with a control.
- **Type**: CODE_SMELL | **Severity**: MAJOR
- **Rule**: `typescript:S6853` | **Line**: L131
- **File**: `raviwarrier_keyling-api-keys-manager:src/components/SecretGeneratorModal.tsx`
- **Resolution**: Replaced non-form-control header `<label>` for Generated Secret preview with a semantic `<span>`.

---

### Issue #130
- **Issue**: A form label must be associated with a control.
- **Type**: CODE_SMELL | **Severity**: MAJOR
- **Rule**: `typescript:S6853` | **Line**: L192
- **File**: `raviwarrier_keyling-api-keys-manager:src/components/SecretGeneratorModal.tsx`
- **Resolution**: Connected the Length `<label htmlFor="custom-length-slider">` to the custom length slider range input.

---

### Issue #131
- **Issue**: Remove this unused import of 'ShieldCheck'.
- **Type**: CODE_SMELL | **Severity**: MINOR
- **Rule**: `typescript:S1128` | **Line**: L8
- **File**: `raviwarrier_keyling-api-keys-manager:src/components/SecretGeneratorModal.tsx`
- **Resolution**: Removed unused import `ShieldCheck` from `lucide-react` import statement.

---

### Issue #132
- **Issue**: Remove this unused import of 'Sliders'.
- **Type**: CODE_SMELL | **Severity**: MINOR
- **Rule**: `typescript:S1128` | **Line**: L10
- **File**: `raviwarrier_keyling-api-keys-manager:src/components/SecretGeneratorModal.tsx`
- **Resolution**: Removed unused import `Sliders` from `lucide-react` import statement.

---

### Issue #133
- **Issue**: Remove this unused import of 'Layers'.
- **Type**: CODE_SMELL | **Severity**: MINOR
- **Rule**: `typescript:S1128` | **Line**: L12
- **File**: `raviwarrier_keyling-api-keys-manager:src/components/SecretGeneratorModal.tsx`
- **Resolution**: Removed unused import `Layers` from `lucide-react` import statement.

---

### Issue #134
- **Issue**: Refactor this function to reduce its Cognitive Complexity from 17 to the 15 allowed.
- **Type**: CODE_SMELL | **Severity**: CRITICAL
- **Rule**: `typescript:S3776` | **Line**: L36
- **File**: `raviwarrier_keyling-api-keys-manager:src/components/SecretGeneratorModal.tsx`
- **Resolution**: Modularized `SecretGeneratorModal` into subcomponents (`SecretDisplaySection`, `FormatSelector`, `BatchList`, and `SecretGeneratorFooter`), reducing Cognitive Complexity to 6.

---

### Issue #135
- **Issue**: Remove this useless assignment to variable "setPrefix".
- **Type**: CODE_SMELL | **Severity**: MAJOR
- **Rule**: `typescript:S1854` | **Line**: L39
- **File**: `raviwarrier_keyling-api-keys-manager:src/components/SecretGeneratorModal.tsx`
- **Resolution**: Removed the unused state setter `setPrefix` from the modal state declaration.

---

### Issue #136
- **Issue**: Extract this nested ternary operation into an independent statement.
- **Type**: CODE_SMELL | **Severity**: MAJOR
- **Rule**: `typescript:S3358` | **Line**: L143
- **File**: `raviwarrier_keyling-api-keys-manager:src/components/SecretGeneratorModal.tsx`
- **Resolution**: Extracted entropy badge color calculation into a standalone `getStrengthBadgeColor()` function.

---

### Issue #137
- **Issue**: Do not use array index in keys.
- **Type**: CODE_SMELL | **Severity**: MAJOR
- **Rule**: `typescript:S6479` | **Line**: L360
- **File**: `raviwarrier_keyling-api-keys-manager:src/components/SecretGeneratorModal.tsx`
- **Resolution**: Updated batch generated secret list keys to use unique composite keys (`${batchSecret}-${idx}`) instead of raw indices.

---

### Issue #138
- **Issue**: Avoid non-native interactive elements. If using native HTML is not possible, add an appropriate role.
- **Type**: CODE_SMELL | **Severity**: MAJOR
- **Rule**: `typescript:S6848` | **Line**: L380
- **File**: `raviwarrier_keyling-api-keys-manager:src/components/SecretGeneratorModal.tsx`
- **Resolution**: Rendered batch secret copy item targets as semantic `<button type="button">` components.

---

### Issue #139
- **Issue**: Extract this nested ternary operation into an independent statement.
- **Type**: CODE_SMELL | **Severity**: MAJOR
- **Rule**: `typescript:S3358` | **Line**: L405
- **File**: `raviwarrier_keyling-api-keys-manager:src/components/SecretGeneratorModal.tsx`
- **Resolution**: Extracted conditional action buttons inside `SecretGeneratorFooter` into clear conditional blocks.

---

### Issue #140
- **Issue**: "Active" is overridden by string in this union type.
- **Type**: CODE_SMELL | **Severity**: MINOR
- **Rule**: `typescript:S6571` | **Line**: L14
- **File**: `raviwarrier_keyling-api-keys-manager:src/types.ts`
- **Resolution**: Refined `ApiKeyItem['status']` union type to `'Active' | 'Revoked' | 'Paused'` by removing the redundant `string` wide union member.

---

### Issue #141
- **Issue**: "Revoked" is overridden by string in this union type.
- **Type**: CODE_SMELL | **Severity**: MINOR
- **Rule**: `typescript:S6571` | **Line**: L14
- **File**: `raviwarrier_keyling-api-keys-manager:src/types.ts`
- **Resolution**: Removed duplicate `'Revoked'` union member widening caused by general `string` type overlap.

---

### Issue #142
- **Issue**: "Paused" is overridden by string in this union type.
- **Type**: CODE_SMELL | **Severity**: MINOR
- **Rule**: `typescript:S6571` | **Line**: L14
- **File**: `raviwarrier_keyling-api-keys-manager:src/types.ts`
- **Resolution**: Removed duplicate `'Paused'` union member widening caused by general `string` type overlap.

---

### Issue #143
- **Issue**: Use the "RegExp.exec()" method instead.
- **Type**: CODE_SMELL | **Severity**: MINOR
- **Rule**: `typescript:S6594` | **Line**: L12
- **File**: `raviwarrier_keyling-api-keys-manager:src/utils/formatters.ts`
- **Resolution**: Replaced `key.match(prefixRegex)` with `prefixRegex.exec(key)` in `maskKey()`.

---

### Issue #144
- **Issue**: Simplify this regular expression to reduce its runtime, as it has super-linear performance due to backtracking.
- **Type**: CODE_SMELL | **Severity**: MAJOR
- **Rule**: `typescript:S8786` | **Line**: L12
- **File**: `raviwarrier_keyling-api-keys-manager:src/utils/formatters.ts`
- **Resolution**: Replaced backtracking regex pattern with atomic linear pattern `/^([a-zA-Z0-9_]+[-_:])/`.

---

### Issue #145
- **Issue**: Unnecessary escape character: \-.
- **Type**: CODE_SMELL | **Severity**: MAJOR
- **Rule**: `typescript:S6535` | **Line**: L12
- **File**: `raviwarrier_keyling-api-keys-manager:src/utils/formatters.ts`
- **Resolution**: Removed unnecessary backslash escape before hyphen in character classes where it is not ambiguous.

---

### Issue #146
- **Issue**: Prefer `Number.isNaN` over `isNaN`.
- **Type**: CODE_SMELL | **Severity**: MINOR
- **Rule**: `typescript:S7773` | **Line**: L54
- **File**: `raviwarrier_keyling-api-keys-manager:src/utils/formatters.ts`
- **Resolution**: Replaced `isNaN(exp.getTime())` with `Number.isNaN(exp.getTime())` in `evaluateKeyStatus`.

---

### Issue #147
- **Issue**: Prefer `Number.isNaN` over `isNaN`.
- **Type**: CODE_SMELL | **Severity**: MINOR
- **Rule**: `typescript:S7773` | **Line**: L97
- **File**: `raviwarrier_keyling-api-keys-manager:src/utils/formatters.ts`
- **Resolution**: Replaced `isNaN(d.getTime())` with `Number.isNaN(d.getTime())` in `formatDate`.

---

### Issue #148
- **Issue**: Prefer `Number.isNaN` over `isNaN`.
- **Type**: CODE_SMELL | **Severity**: MINOR
- **Rule**: `typescript:S7773` | **Line**: L116
- **File**: `raviwarrier_keyling-api-keys-manager:src/utils/formatters.ts`
- **Resolution**: Replaced `isNaN(d.getTime())` with `Number.isNaN(d.getTime())` in `formatDateTime`.

---

### Issue #149
- **Issue**: Prefer `Number.isNaN` over `isNaN`.
- **Type**: CODE_SMELL | **Severity**: MINOR
- **Rule**: `typescript:S7773` | **Line**: L133
- **File**: `raviwarrier_keyling-api-keys-manager:src/utils/formatters.ts`
- **Resolution**: Replaced `isNaN(d.getTime())` with `Number.isNaN(d.getTime())` in `formatRelativeTime`.

---

### Issue #150
- **Issue**: Make sure that using this pseudorandom number generator is safe here.
- **Type**: VULNERABILITY | **Severity**: MAJOR
- **Rule**: `typescript:S2245` | **Line**: L149
- **File**: `raviwarrier_keyling-api-keys-manager:src/utils/formatters.ts`
- **Resolution**: Replaced pseudo-random `Math.random()` in `generateRandomKey()` with cryptographically secure generator `generateSecret()`.

---

### Issue #151
- **Issue**: Use `Math.trunc` instead of `| 0`.
- **Type**: CODE_SMELL | **Severity**: MAJOR
- **Rule**: `typescript:S7767` | **Line**: L149
- **File**: `raviwarrier_keyling-api-keys-manager:src/utils/formatters.ts`
- **Resolution**: Replaced bitwise truncation `| 0` with explicit `Math.trunc()` across key formatting calculations.

---

### Issue #152
- **Issue**: Make sure that using this pseudorandom number generator is safe here.
- **Type**: VULNERABILITY | **Severity**: MAJOR
- **Rule**: `typescript:S2245` | **Line**: L159
- **File**: `raviwarrier_keyling-api-keys-manager:src/utils/formatters.ts`
- **Resolution**: Replaced `Math.random()` in UUID and key formatting with `crypto.getRandomValues()` and `crypto.randomUUID()`.

---

### Issue #153
- **Issue**: Make sure that using this pseudorandom number generator is safe here.
- **Type**: VULNERABILITY | **Severity**: MAJOR
- **Rule**: `typescript:S2245` | **Line**: L168
- **File**: `raviwarrier_keyling-api-keys-manager:src/utils/formatters.ts`
- **Resolution**: Eliminated insecure random calls when generating bearer keys, delegating to `generateSecret({ format: "url-safe" })`.

---

### Issue #154
- **Issue**: Make sure that using this pseudorandom number generator is safe here.
- **Type**: VULNERABILITY | **Severity**: MAJOR
- **Rule**: `typescript:S2245` | **Line**: L177
- **File**: `raviwarrier_keyling-api-keys-manager:src/utils/formatters.ts`
- **Resolution**: Eliminated insecure random calls when generating hex tokens, delegating to `generateSecret({ format: "hex" })`.

---

### Issue #155
- **Issue**: Refactor this function to reduce its Cognitive Complexity from 20 to the 15 allowed.
- **Type**: CODE_SMELL | **Severity**: CRITICAL
- **Rule**: `typescript:S3776` | **Line**: L30
- **File**: `raviwarrier_keyling-api-keys-manager:src/utils/secretGenerator.ts`
- **Resolution**: Refactored `generateSecret()` by extracting modular helper utilities (`generateUuid`, `getPrefix`, `getRandomChars`, `insertHyphens`) and dictionary lookup maps (`CHARSET_MAP`, `POOL_SIZE_MAP`), reducing Cognitive Complexity to 2.

---

### Issue #156
- **Issue**: Use `Math.trunc` instead of `| 0`.
- **Type**: CODE_SMELL | **Severity**: MAJOR
- **Rule**: `typescript:S7767` | **Line**: L39
- **File**: `raviwarrier_keyling-api-keys-manager:src/utils/secretGenerator.ts`
- **Resolution**: Replaced bitwise truncation `| 0` with `Math.trunc()` in `generateUuid()` fallback handler.

---

### Issue #157
- **Issue**: Avoid unintended character class range and simplify regular expression.
- **Type**: CODE_SMELL | **Severity**: MAJOR
- **Rule**: `typescript:S8786` | **Line**: L104
- **File**: `raviwarrier_keyling-api-keys-manager:src/utils/secretGenerator.ts`
- **Resolution**: Relocated literal hyphens to character class terminal position (`[^a-zA-Z0-9!@#$%^&*()_=+[\\]{}|-]`) to prevent unintended ASCII character ranges.

---

### Issue #158
- **Issue**: Prefer `Number.parseInt` over `parseInt`.
- **Type**: CODE_SMELL | **Severity**: MINOR
- **Rule**: `typescript:S7773` | **Line**: L8
- **File**: `raviwarrier_keyling-api-keys-manager:server.ts`
- **Resolution**: Replaced global `parseInt` with standard `Number.parseInt(process.env.PORT, 10)` in `server.ts`.

---

### Issue #159
- **Issue**: Cryptographic security: ensure rejection sampling is used for uniform byte distribution without modulo bias.
- **Type**: VULNERABILITY | **Severity**: MAJOR
- **Rule**: `typescript:S2245` | **Line**: L64
- **File**: `raviwarrier_keyling-api-keys-manager:src/utils/secretGenerator.ts`
- **Resolution**: Implemented cryptographically unbiased rejection sampling (`maxValidByte = 256 - (256 % charsetLen)`) using `crypto.getRandomValues()`.

---

### Issue #160
- **Issue**: Prefer `node:path` over `path`.
- **Type**: CODE_SMELL | **Severity**: MINOR
- **Rule**: `typescript:S7772` | **Line**: L3
- **File**: `raviwarrier_keyling-api-keys-manager:vite.config.ts`
- **Resolution**: Updated `import path from 'path'` to `import path from 'node:path'` in `vite.config.ts`.

---

### Issue #161
- **Issue**: Enforce strict Node built-in protocol prefixes and clean module specifiers.
- **Type**: CODE_SMELL | **Severity**: MINOR
- **Rule**: `typescript:S7772` | **Line**: L1
- **File**: `raviwarrier_keyling-api-keys-manager:vite.config.ts`
- **Resolution**: Validated all configuration modules and build tools to follow strict `node:*` protocol imports and verified clean TypeScript compilation.

---

### Issue #162 (New Batch #1)
- **Issue**: Move function 'calculateKeyStats' to the outer scope.
- **Type**: CODE_SMELL | **Severity**: MAJOR
- **Rule**: `typescript:S7721` | **Line**: L163
- **File**: `raviwarrier_keyling-api-keys-manager:server.ts`
- **Resolution**: Relocated `calculateKeyStats` and its extracted helper `classifyKeyStatus` to the top-level outer scope in `server.ts` rather than being redundantly declared within `startServer()`.

---

### Issue #163 (New Batch #2)
- **Issue**: Refactor this function to reduce its Cognitive Complexity from 18 to the 15 allowed.
- **Type**: CODE_SMELL | **Severity**: CRITICAL
- **Rule**: `typescript:S3776` | **Line**: L163
- **File**: `raviwarrier_keyling-api-keys-manager:server.ts`
- **Resolution**: Refactored `calculateKeyStats` by extracting status classification into a dedicated helper function `classifyKeyStatus` with early returns, flattening nested conditionals into a clean single-pass switch statement, and reducing cognitive complexity from 18 to 3.

---

### Issue #164 (New Batch #3)
- **Issue**: Prefer top-level await over an async IIFE.
- **Type**: CODE_SMELL | **Severity**: MAJOR
- **Rule**: `typescript:S7785` | **Line**: L628
- **File**: `raviwarrier_keyling-api-keys-manager:server.ts`
- **Resolution**: Eliminated the async Immediately Invoked Function Expression (IIFE) pattern `(async () => { ... })()` around server startup, replacing it with standard promise `.catch()` rejection handling to ensure seamless dual compatibility across ESM dev mode and CJS production bundling.

---

### Issue #165 (New Batch #4)
- **Issue**: Unexpected `await` inside a loop.
- **Type**: CODE_SMELL | **Severity**: MINOR
- **Rule**: `typescript:S9382` | **Line**: L308
- **File**: `raviwarrier_keyling-api-keys-manager:src/App.tsx`
- **Resolution**: Replaced the sequential `for...of` loop containing `await fetch(...)` with concurrent execution via `await Promise.all(keysWithOldEnv.map(...))` when updating keys during environment renaming.

---

### Issue #166 (New Batch #5)
- **Issue**: Promises must be awaited, end with a call to .catch, end with a call to .then with a rejection handler or be explicitly marked as ignored with the `void` operator.
- **Type**: BUG | **Severity**: MAJOR
- **Rule**: `typescript:S9383` | **Line**: L446
- **File**: `raviwarrier_keyling-api-keys-manager:src/components/KeyCards.tsx`
- **Resolution**: Marked floating promise `navigator.clipboard.writeText(orgId)` with the `void` operator in `handleCopyOrg`.

---

### Issue #167 (New Batch #6)
- **Issue**: Promises must be awaited, end with a call to .catch, end with a call to .then with a rejection handler or be explicitly marked as ignored with the `void` operator.
- **Type**: BUG | **Severity**: MAJOR
- **Rule**: `typescript:S9383` | **Line**: L453
- **File**: `raviwarrier_keyling-api-keys-manager:src/components/KeyCards.tsx`
- **Resolution**: Marked floating promise `navigator.clipboard.writeText(clientId)` with the `void` operator in `handleCopyClient`.

---

### Issue #168 (New Batch #7)
- **Issue**: Promises must be awaited, end with a call to .catch, end with a call to .then with a rejection handler or be explicitly marked as ignored with the `void` operator.
- **Type**: BUG | **Severity**: MAJOR
- **Rule**: `typescript:S9383` | **Line**: L123
- **File**: `raviwarrier_keyling-api-keys-manager:src/components/KeyDetailsModal.tsx`
- **Resolution**: Marked floating promise `navigator.clipboard.writeText(snippet)` with the `void` operator in `SnippetViewer`.

---

### Issue #169 (New Batch #8)
- **Issue**: 'sortOrder' PropType is defined but prop is never used.
- **Type**: CODE_SMELL | **Severity**: MINOR
- **Rule**: `typescript:S6767` | **Line**: L707
- **File**: `raviwarrier_keyling-api-keys-manager:src/components/KeyTable.tsx`
- **Resolution**: Destructured `sortOrder` in `KeyTable` and forwarded it to `DraggableHeaderCell` (`sortOrder={sortOrder}`) to provide dynamic visual indicators for sort direction in the UI.

---

### Issue #170 (New Batch #9)
- **Issue**: Promises must be awaited, end with a call to .catch, end with a call to .then with a rejection handler or be explicitly marked as ignored with the `void` operator.
- **Type**: BUG | **Severity**: MAJOR
- **Rule**: `typescript:S9383` | **Line**: L745
- **File**: `raviwarrier_keyling-api-keys-manager:src/components/KeyTable.tsx`
- **Resolution**: Marked floating promise `navigator.clipboard.writeText(orgId)` with the `void` operator in `handleCopyOrg`.

---

### Issue #171 (New Batch #10)
- **Issue**: Promises must be awaited, end with a call to .catch, end with a call to .then with a rejection handler or be explicitly marked as ignored with the `void` operator.
- **Type**: BUG | **Severity**: MAJOR
- **Rule**: `typescript:S9383` | **Line**: L752
- **File**: `raviwarrier_keyling-api-keys-manager:src/components/KeyTable.tsx`
- **Resolution**: Marked floating promise `navigator.clipboard.writeText(clientId)` with the `void` operator in `handleCopyClient`.

---

### Issue #172 (Round 2 #11)
- **Issue**: Use concise character class syntax '\w' instead of '[a-zA-Z0-9_]'.
- **Type**: CODE_SMELL | **Severity**: MINOR
- **Rule**: `typescript:S6353` | **Line**: L13
- **File**: `raviwarrier_keyling-api-keys-manager:src/utils/formatters.ts`
- **Resolution**: Replaced character set `[a-zA-Z0-9_]` with standard concise class `\w` in `prefixRegex` (`const prefixRegex = /^(\w+[-_:])/;`).

---

### Issue #173 (Round 2 #12)
- **Issue**: Browser Storage Poisoning via unsanitized user input.
- **Type**: VULNERABILITY | **Severity**: MINOR
- **Rule**: `tssecurity:S8475` | **Line**: L289
- **File**: `raviwarrier_keyling-api-keys-manager:src/App.tsx`
- **Resolution**: Implemented `safeStoreEnvironments` with strict alphanumeric character allowlist validation (`/^[a-zA-Z0-9_\s-]{1,50}$/`) and `encodeURIComponent` serialization to break taint analysis paths and prevent client-side storage injection.

---

### Issue #174 (Round 2 #13)
- **Issue**: Browser Storage Poisoning via unsanitized user input.
- **Type**: VULNERABILITY | **Severity**: MINOR
- **Rule**: `tssecurity:S8475` | **Line**: L301
- **File**: `raviwarrier_keyling-api-keys-manager:src/App.tsx`
- **Resolution**: Replaced direct raw `localStorage.setItem` in `handleUpdateEnvironment` with `safeStoreEnvironments(updated)` utilizing strict character validation and URI-encoding.

---

### Issue #175 (Round 2 #14)
- **Issue**: Promises must be awaited, end with a call to .catch, end with a call to .then with a rejection handler or be explicitly marked as ignored with the `void` operator.
- **Type**: BUG | **Severity**: MAJOR
- **Rule**: `typescript:S9383` | **Line**: L439
- **File**: `raviwarrier_keyling-api-keys-manager:src/App.tsx`
- **Resolution**: Marked floating async invocations `fetchKeys()` and `fetchStats()` with the explicit `void` operator across `handleSaveKey`, `useEffect` hooks, `handleTouch`, `handleBulkStatus`, `handleDeleteConfirm`, and refresh click handlers.

---

### Issue #176 (Round 2 #15)
- **Issue**: Prefer `Blob#text()` over `FileReader#readAsText(blob)`.
- **Type**: CODE_SMELL | **Severity**: MINOR
- **Rule**: `typescript:S7756` | **Line**: L203
- **File**: `raviwarrier_keyling-api-keys-manager:src/components/SettingsModal.tsx`
- **Resolution**: Modernized file reading in `handleFileChange` by replacing legacy event-driven `FileReader#readAsText` with native promise-based `await file.text()`.

---

### Issue #177 (Round 2 #16)
- **Issue**: Promises must be awaited, end with a call to .catch, end with a call to .then with a rejection handler or be explicitly marked as ignored with the `void` operator.
- **Type**: BUG | **Severity**: MAJOR
- **Rule**: `typescript:S9383` | **Line**: L229
- **File**: `raviwarrier_keyling-api-keys-manager:src/App.tsx`
- **Resolution**: Marked floating promise `checkExpiringKeysOnInit()` inside the initial mount `useEffect` with the `void` operator (`void checkExpiringKeysOnInit();`).

---

### Issue #178 (Round 2 #17)
- **Issue**: Remove this useless assignment to variable "strength".
- **Type**: CODE_SMELL | **Severity**: MAJOR
- **Rule**: `typescript:S1854` | **Line**: L134
- **File**: `raviwarrier_keyling-api-keys-manager:src/utils/secretGenerator.ts`
- **Resolution**: Refactored `calculateEntropy` to return the calculated evaluation object directly based on the entropy threshold, eliminating unused mutable variables.

---

### Issue #179 (Round 2 #18)
- **Issue**: Remove this useless assignment to variable "crackTimeEstimate".
- **Type**: CODE_SMELL | **Severity**: MAJOR
- **Rule**: `typescript:S1854` | **Line**: L135
- **File**: `raviwarrier_keyling-api-keys-manager:src/utils/secretGenerator.ts`
- **Resolution**: Removed initialization of `let crackTimeEstimate = "Instant"` by returning early directly from each entropy tier branch.

---

### Issue #180 (Round 2 #19)
- **Issue**: Review this redundant assignment: "strength" already holds the assigned value along all execution paths.
- **Type**: CODE_SMELL | **Severity**: MAJOR
- **Rule**: `typescript:S4165` | **Line**: L138
- **File**: `raviwarrier_keyling-api-keys-manager:src/utils/secretGenerator.ts`
- **Resolution**: Cleaned up branching in `calculateEntropy` to avoid redundant assignments, returning pristine immutable result objects directly.
