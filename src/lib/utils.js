import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
export function cn(...inputs) {
    return twMerge(clsx(inputs));
}
export function formatDate(date) {
    if (!date)
        return 'N/A';
    const d = date instanceof Date ? date : date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}
