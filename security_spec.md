# security_spec.md

## Data Invariants
1. A user cannot set their own role during creation unless it's their first time and we lack an admin? (Actually, usually we'd want a separate check or a bootstrapping process. For this app, I'll allow the first user to be admin or just set 'member' by default).
2. A loan cannot be created if the book is not available (`availableCount > 0`).
3. Only admins can create/edit/delete books.
4. Users can only see their own loans.
5. Users cannot delete their own loans (only returned status).

## The Dirty Dozen Payloads
1. **Identity Spoofing**: User A tries to create a user profile for User B.
2. **Privilege Escalation**: User A tries to set `role: 'admin'` in their profile.
3. **Ghost Write**: User A tries to update User B's displayName.
4. **Loan Theft**: User A tries to borrow a book in the name of User B.
5. **Over-Borrowing**: User A tries to borrow a book when `availableCount` is 0.
6. **Timeline Faking**: User A tries to set `borrowDate` to a week ago.
7. **Immediate Return**: User A tries to create a loan that is already 'returned'.
8. **Illegal Book Entry**: Member tries to create a new book document.
9. **Price/Count Poisoning**: Member tries to update a book's `quantity`.
10. **Shadow Field**: User A adds `isVerifiedByAdmin: true` to their profile update.
11. **Negative Count**: Admin tries to set `quantity: -1`.
12. **ID Poisoning**: User tries to use a 2MB string as a loan ID.

## Evaluation
The `DRAFT_firestore.rules` handles:
- `isOwner(userId)` checks for user profile.
- `isValidUser` checks `role` is not easily switchable (though `in ['member', 'admin']` might be too loose without an admin check, I should tighten this to only allow 'member' unless `isAdmin()`).
- `isValidLoan` enforces `userId == request.auth.uid`.
- `isValidLoan` enforces `borrowDate == request.time`.
- `create` for loans checks `availableCount > 0` on the book.
- `isAdmin()` checks for book management.
- `affectedKeys().hasOnly()` protects against shadow fields in updates.
