import { collection, doc, getDocs, getDoc, query, where, orderBy, addDoc, setDoc, updateDoc, deleteDoc, runTransaction, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db, OperationType, handleFirestoreError } from '../lib/firebase';
import { addDays } from 'date-fns';
const BOOKS_COL = 'books';
const LOANS_COL = 'loans';
const USERS_COL = 'users';
const RESERVATIONS_COL = 'reservations';
export const libraryService = {
    // Books
    async getBooks() {
        try {
            const q = query(collection(db, BOOKS_COL));
            const snapshot = await getDocs(q);
            return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        }
        catch (e) {
            handleFirestoreError(e, OperationType.LIST, BOOKS_COL);
            return [];
        }
    },
    async getBook(id) {
        try {
            const d = await getDoc(doc(db, BOOKS_COL, id));
            return d.exists() ? { id: d.id, ...d.data() } : null;
        }
        catch (e) {
            handleFirestoreError(e, OperationType.GET, `${BOOKS_COL}/${id}`);
            return null;
        }
    },
    async upsertBook(book) {
        try {
            if (book.id) {
                await updateDoc(doc(db, BOOKS_COL, book.id), {
                    ...book,
                    updatedAt: serverTimestamp(),
                });
                return book.id;
            }
            else {
                const docRef = await addDoc(collection(db, BOOKS_COL), {
                    ...book,
                    createdAt: serverTimestamp(),
                });
                return docRef.id;
            }
        }
        catch (e) {
            handleFirestoreError(e, OperationType.WRITE, BOOKS_COL);
            throw e;
        }
    },
    async deleteBook(id) {
        try {
            await deleteDoc(doc(db, BOOKS_COL, id));
        }
        catch (e) {
            handleFirestoreError(e, OperationType.DELETE, `${BOOKS_COL}/${id}`);
        }
    },
    // Loans
    async borrowBook(userId, book, durationDays = 14) {
        const loanId = `${userId}_${book.id}`;
        try {
            await runTransaction(db, async (transaction) => {
                const bookRef = doc(db, BOOKS_COL, book.id);
                const loanRef = doc(db, LOANS_COL, loanId);
                const [bookDoc, loanDoc] = await Promise.all([
                    transaction.get(bookRef),
                    transaction.get(loanRef)
                ]);
                if (!bookDoc.exists())
                    throw new Error('Book not found in archive');
                const bookData = bookDoc.data();
                if (loanDoc.exists() && loanDoc.data()?.status === 'active') {
                    return; // Already borrowed, just return silently
                }
                if (bookData.availableCount <= 0 && !bookData.isDigital) {
                    throw new Error('All copies of this volume are currently held by other scholars');
                }
                const dueDate = addDays(new Date(), durationDays);
                transaction.set(loanRef, {
                    bookId: book.id,
                    bookTitle: book.title,
                    bookAuthor: book.author,
                    bookCoverUrl: book.coverUrl,
                    userId,
                    borrowDate: serverTimestamp(),
                    dueDate: Timestamp.fromDate(dueDate),
                    status: 'active',
                    returnDate: null
                });
                if (!bookData.isDigital) {
                    transaction.update(bookRef, {
                        availableCount: bookData.availableCount - 1
                    });
                }
            });
        }
        catch (e) {
            if (e instanceof Error && e.message.includes('All copies')) {
                throw new Error('All copies of this volume are currently held by other scholars');
            }
            else {
                handleFirestoreError(e, OperationType.WRITE, LOANS_COL);
                throw e;
            }
        }
    },
    async returnBook(loan) {
        const loanId = loan.id || `${loan.userId}_${loan.bookId}`;
        try {
            await runTransaction(db, async (transaction) => {
                const bookRef = doc(db, BOOKS_COL, loan.bookId);
                const loanRef = doc(db, LOANS_COL, loanId);
                const [bookDoc, currentLoanDoc] = await Promise.all([
                    transaction.get(bookRef),
                    transaction.get(loanRef)
                ]);
                if (currentLoanDoc.exists() && currentLoanDoc.data()?.status === 'returned') {
                    return; // Already returned
                }
                transaction.update(loanRef, {
                    status: 'returned',
                    returnDate: serverTimestamp()
                });
                if (bookDoc.exists()) {
                    const bookData = bookDoc.data();
                    if (!bookData.isDigital) {
                        transaction.update(bookRef, {
                            availableCount: Math.min(bookData.availableCount + 1, bookData.quantity)
                        });
                    }
                }
            });
        }
        catch (e) {
            handleFirestoreError(e, OperationType.WRITE, LOANS_COL);
        }
    },
    async getUserLoans(userId) {
        try {
            const q = query(collection(db, LOANS_COL), where('userId', '==', userId));
            const snapshot = await getDocs(q);
            const loans = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
            // Sort in memory to avoid index requirements
            return loans.sort((a, b) => {
                const dateA = a.borrowDate?.toMillis?.() || 0;
                const dateB = b.borrowDate?.toMillis?.() || 0;
                return dateB - dateA;
            });
        }
        catch (e) {
            handleFirestoreError(e, OperationType.LIST, LOANS_COL);
            return [];
        }
    },
    async getAllLoans() {
        try {
            const q = query(collection(db, LOANS_COL));
            const snapshot = await getDocs(q);
            const loans = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
            return loans.sort((a, b) => {
                const dateA = a.borrowDate?.toMillis?.() || 0;
                const dateB = b.borrowDate?.toMillis?.() || 0;
                return dateB - dateA;
            });
        }
        catch (e) {
            handleFirestoreError(e, OperationType.LIST, LOANS_COL);
            return [];
        }
    },
    async getLoan(loanId) {
        try {
            const d = await getDoc(doc(db, LOANS_COL, loanId));
            if (d.exists()) {
                return { id: d.id, ...d.data() };
            }
            return null;
        }
        catch (e) {
            handleFirestoreError(e, OperationType.GET, `${LOANS_COL}/${loanId}`);
            return null;
        }
    },
    async updateReadingProgress(loanId, progress) {
        try {
            await updateDoc(doc(db, LOANS_COL, loanId), {
                readingProgress: progress,
                lastReadAt: serverTimestamp()
            });
        }
        catch (e) {
            handleFirestoreError(e, OperationType.WRITE, `${LOANS_COL}/${loanId}`);
        }
    },
    // Reservations
    async reserveBook(userId, book) {
        try {
            // Check if already reserved
            const q = query(collection(db, RESERVATIONS_COL), where('userId', '==', userId), where('bookId', '==', book.id), where('status', '==', 'pending'));
            const existing = await getDocs(q);
            if (!existing.empty)
                return; // Idempotent: already reserved
            await addDoc(collection(db, RESERVATIONS_COL), {
                bookId: book.id,
                bookTitle: book.title,
                bookAuthor: book.author,
                bookCoverUrl: book.coverUrl,
                userId,
                requestDate: serverTimestamp(),
                status: 'pending'
            });
        }
        catch (e) {
            handleFirestoreError(e, OperationType.WRITE, RESERVATIONS_COL);
            throw e;
        }
    },
    async getUserReservations(userId) {
        try {
            const q = query(collection(db, RESERVATIONS_COL), where('userId', '==', userId), orderBy('requestDate', 'desc'));
            const snapshot = await getDocs(q);
            return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        }
        catch (e) {
            handleFirestoreError(e, OperationType.LIST, RESERVATIONS_COL);
            return [];
        }
    },
    async cancelReservation(resId) {
        try {
            await updateDoc(doc(db, RESERVATIONS_COL, resId), {
                status: 'cancelled'
            });
        }
        catch (e) {
            handleFirestoreError(e, OperationType.WRITE, `${RESERVATIONS_COL}/${resId}`);
        }
    },
    async deleteReservation(resId) {
        try {
            await deleteDoc(doc(db, RESERVATIONS_COL, resId));
        }
        catch (e) {
            handleFirestoreError(e, OperationType.DELETE, `${RESERVATIONS_COL}/${resId}`);
        }
    },
    // Users
    async updateUserProfile(uid, data) {
        try {
            await updateDoc(doc(db, USERS_COL, uid), data);
        } catch (e) {
            handleFirestoreError(e, OperationType.WRITE, `${USERS_COL}/${uid}`);
        }
    },
    async ensureUserProfile(user) {
        try {
            const userRef = doc(db, USERS_COL, user.uid);
            const userDoc = await getDoc(userRef);
            const existingData = userDoc.exists() ? userDoc.data() : {};
            const role = user.email === 'aaronjamesvillamonte@gmail.com' ? 'admin' : 'member';
            const profile = {
                ...existingData,
                uid: user.uid,
                email: user.email,
                role,
                displayName: user.displayName || existingData.displayName || 'Anonymous',
                photoURL: existingData.photoURL || user.photoURL || '',
                createdAt: existingData.createdAt || serverTimestamp()
            };
            if (!userDoc.exists()) {
                await setDoc(userRef, profile);
            }
            else {
                // Sync Auth display name if changed
                if (user.displayName && existingData.displayName !== user.displayName) {
                    profile.displayName = user.displayName;
                    await updateDoc(userRef, {
                        displayName: user.displayName
                    });
                }
            }
            return profile;
        }
        catch (e) {
            handleFirestoreError(e, OperationType.WRITE, USERS_COL);
            throw e;
        }
    },
    async seedBooks() {
        const books = [
            { title: "The Architecture of Silence", author: "Julian Thorne", category: "Architecture", description: "A minimalist exploration of sonic void in modern structures.", coverUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=400" },
            { title: "Quantum Ethics", author: "Dr. Elena Vance", category: "Science", description: "The moral implications of observer-dependent reality.", coverUrl: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=400" },
            { title: "The Silk Road Chronicles", author: "Amina Al-Farsi", category: "History", description: "Hidden tales from the trade routes that shaped the world.", coverUrl: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=400" },
            { title: "Branching the Void", author: "Marcus Solis", category: "Philosophy", description: "Finding meaning in the recursive patterns of existence.", coverUrl: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&q=80&w=400" },
            { title: "Urban Cartography", author: "Lydia West", category: "Sociology", description: "Mapping the invisible flows of city life.", coverUrl: "https://images.unsplash.com/photo-1449156001931-82d420727314?auto=format&fit=crop&q=80&w=400" },
            { title: "Observation Theory", author: "Peter Thorne", category: "Physics", description: "How looking changes what is seen.", coverUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=400" },
            { title: "The Great Gatsby", author: "F. Scott Fitzgerald", category: "Classic", description: "A story of ambition and obsession.", coverUrl: "https://images.unsplash.com/photo-1543004218-29471b610996?auto=format&fit=crop&q=80&w=400", isDigital: true },
            { title: "Dune", author: "Frank Herbert", category: "Sci-Fi", description: "Epic space opera set on Arrakis.", coverUrl: "https://images.unsplash.com/photo-1593910113921-697a50975885?auto=format&fit=crop&q=80&w=400", isDigital: true },
            { title: "The Lost Manuscript", author: "Unknown", category: "Mystery", description: "A legendary volume that has been missing for decades.", coverUrl: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=400", quantity: 1, availableCount: 0, isDigital: false },
            { title: "Digital Alchemy", author: "Sarah Chen", category: "Technology", description: "Converting raw data into digital gold.", coverUrl: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=400", isDigital: true },
            { title: "Stellar Cartography", author: "Jameson T. Kirk", category: "Science", description: "Navigating the galaxy via primary reference points.", coverUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=400" },
            { title: "The Art of War", author: "Sun Tzu", category: "Strategy", description: "Classic military treatise on strategy and tactics.", coverUrl: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=400", isDigital: true },
            { title: "Neuromancer", author: "William Gibson", category: "Sci-Fi", description: "The novel that defined cyberpunk.", coverUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=400", isDigital: true },
            { title: "Meditations", author: "Marcus Aurelius", category: "Philosophy", description: "Store observations on virtue and duty.", coverUrl: "https://images.unsplash.com/photo-1509021436665-8f07dbf5bf1d?auto=format&fit=crop&q=80&w=400" },
            { title: "The Odyssey", author: "Homer", category: "Classic", description: "The epic journey of Odysseus.", coverUrl: "https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&q=80&w=400" },
            { title: "1984", author: "George Orwell", category: "Fiction", description: "Dystopian classic about surveillance and control.", coverUrl: "https://images.unsplash.com/photo-1476275466078-4007374efbbe?auto=format&fit=crop&q=80&w=400", isDigital: true },
            { title: "Pride and Prejudice", author: "Jane Austen", category: "Classic", description: "A classic tale of manners and marriage.", coverUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=400" },
            { title: "The Alchemist", author: "Paulo Coelho", category: "Fiction", description: "A journey of finding one's personal legend.", coverUrl: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=400" },
            { title: "Thinking, Fast and Slow", author: "Daniel Kahneman", category: "Psychology", description: "How two systems drive the way we think.", coverUrl: "https://images.unsplash.com/photo-1535905557558-afc4877a26fc?auto=format&fit=crop&q=80&w=400" }
        ];
        const batch = [];
        for (const b of books) {
            // Use slugified title + author initials as ID to prevent duplicates
            const id = (b.title + "-" + b.author).toLowerCase().replace(/[^a-z0-9]/g, "-").substring(0, 50);
            batch.push(setDoc(doc(db, BOOKS_COL, id), {
                quantity: 5,
                availableCount: 5,
                ...b,
                createdAt: serverTimestamp()
            }, { merge: true }));
        }
        await Promise.all(batch);
    }
};
