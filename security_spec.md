# Security Specification - Meu Controle de Parcelas

## 1. Data Invariants
1. A person document must belong to the authenticated user (`request.auth.uid == userId`).
2. An expense document must belong to the authenticated user (`request.auth.uid == userId`) and reference a valid `personId`.
3. An expense document must contain valid positive numbers for `originalAmount`, `installmentAmount`, and `totalInstallments` (1 to 360).
4. An expense cannot exceed 360 installments.
5. All IDs must match `^[a-zA-Z0-9_\-]+$` and have a length $\le 128$.
6. String fields must enforce length constraints (`name <= 100`, `title <= 150`, `notes <= 500`).
7. User PII is protected: No blanket reads or query scraping across other users' data.

## 2. Dirty Dozen Threat Vectors & Mitigations
1. **Unauthenticated Read/Write**: Blocked by `isSignedIn() && isOwner(userId)`.
2. **Cross-Tenant Impersonation**: Attacker tries to read/write `/users/{victimId}/expenses`. Blocked because `request.auth.uid != victimId`.
3. **Ghost Fields Injection**: Blocked on create and update via strict key allowlists.
4. **Huge String Denial of Wallet**: Prevented by string length guards (`<= 100`, `<= 150`, `<= 500`).
5. **Path ID Poisoning**: Document IDs validated with `isValidId()`.
6. **Negative/Zero Installments Attack**: Blocked by checking `totalInstallments >= 1 && totalInstallments <= 360`.
7. **Negative Amounts Attack**: Blocked by checking `amount >= 0`.
8. **Invalid Enum Types**: Type restricted strictly to `['emprestimo', 'despesa']` and frequency to `['diaria', 'semanal', 'mensal']`.
9. **Blanket Query Scraping**: `allow list` evaluated strictly against the owner `userId == request.auth.uid`.
10. **Installments Array Overload**: Array size bounded by `<= 360`.
11. **Modifying Another User's Record**: Strictly restricted to matching `request.auth.uid`.
12. **Tampering with Owner ID**: `userId` field is immutable on updates (`incoming().userId == existing().userId`).
