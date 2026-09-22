/* =========================================================
   Currency
   ========================================================= */

export function formatCurrency(
  amount: number | null | undefined
): string {
  const safeAmount =
    typeof amount === 'number' && Number.isFinite(amount)
      ? amount
      : 0;

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(safeAmount);
}

/* =========================================================
   Date Helpers
   ========================================================= */

function parseDate(dateValue: string | Date): Date | null {
  const date =
    dateValue instanceof Date
      ? dateValue
      : new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

export function formatDate(
  dateValue: string | Date
): string {
  const date = parseDate(dateValue);

  if (!date) {
    return '—';
  }

  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateLong(
  dateValue: string | Date
): string {
  const date = parseDate(dateValue);

  if (!date) {
    return '—';
  }

  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/* =========================================================
   Time Ago
   ========================================================= */

export function timeAgo(
  dateValue: string | Date
): string {
  const date = parseDate(dateValue);

  if (!date) {
    return 'Unknown';
  }

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();

  /*
   * Future dates
   */
  if (diffMs < 0) {
    const futureSeconds = Math.floor(
      Math.abs(diffMs) / 1000
    );

    if (futureSeconds < 60) {
      return 'In a few seconds';
    }

    const futureMinutes = Math.floor(
      futureSeconds / 60
    );

    if (futureMinutes < 60) {
      return `In ${futureMinutes} ${
        futureMinutes === 1 ? 'minute' : 'minutes'
      }`;
    }

    const futureHours = Math.floor(
      futureMinutes / 60
    );

    if (futureHours < 24) {
      return `In ${futureHours} ${
        futureHours === 1 ? 'hour' : 'hours'
      }`;
    }

    const futureDays = Math.floor(
      futureHours / 24
    );

    if (futureDays < 7) {
      return `In ${futureDays} ${
        futureDays === 1 ? 'day' : 'days'
      }`;
    }

    return `In ${Math.floor(futureDays / 7)} ${
      Math.floor(futureDays / 7) === 1
        ? 'week'
        : 'weeks'
    }`;
  }

  /*
   * Past dates
   */
  const seconds = Math.floor(diffMs / 1000);

  if (seconds < 10) {
    return 'Just now';
  }

  if (seconds < 60) {
    return `${seconds} seconds ago`;
  }

  const minutes = Math.floor(seconds / 60);

  if (minutes < 60) {
    return `${minutes} ${
      minutes === 1 ? 'minute' : 'minutes'
    } ago`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours} ${
      hours === 1 ? 'hour' : 'hours'
    } ago`;
  }

  const days = Math.floor(hours / 24);

  if (days === 1) {
    return 'Yesterday';
  }

  if (days < 7) {
    return `${days} days ago`;
  }

  const weeks = Math.floor(days / 7);

  if (weeks < 5) {
    return `${weeks} ${
      weeks === 1 ? 'week' : 'weeks'
    } ago`;
  }

  const months = Math.floor(days / 30);

  if (months < 12) {
    return `${months} ${
      months === 1 ? 'month' : 'months'
    } ago`;
  }

  const years = Math.floor(days / 365);

  return `${years} ${
    years === 1 ? 'year' : 'years'
  } ago`;
}

/* =========================================================
   Status Colors
   ========================================================= */

export function statusColor(
  status: string
): string {
  const normalizedStatus = status
    .trim()
    .toUpperCase();

  const map: Record<string, string> = {
    /* -------------------------
       Orders
       ------------------------- */
    PENDING:
      'bg-ink-100 text-ink-700',

    PLACED:
      'bg-ink-100 text-ink-700',

    CONFIRMED:
      'bg-blue-100 text-blue-700',

    PROCESSING:
      'bg-amber-100 text-amber-700',

    SHIPPED:
      'bg-indigo-100 text-indigo-700',

    DELIVERED:
      'bg-green-100 text-green-700',

    CANCELLED:
      'bg-red-100 text-red-700',

    /* -------------------------
       Samples
       ------------------------- */
    REQUESTED:
      'bg-ink-100 text-ink-700',

    APPROVED:
      'bg-blue-100 text-blue-700',

    DISPATCHED:
      'bg-amber-100 text-amber-700',

    REJECTED:
      'bg-red-100 text-red-700',

    /* -------------------------
       Demos
       ------------------------- */
    SCHEDULED:
      'bg-blue-100 text-blue-700',

    LIVE:
      'bg-amber-100 text-amber-700',

    'IN PROGRESS':
      'bg-amber-100 text-amber-700',

    COMPLETED:
      'bg-green-100 text-green-700',

    /* -------------------------
       Product Approval
       ------------------------- */
    ACTIVE:
      'bg-green-100 text-green-700',

    INACTIVE:
      'bg-ink-100 text-ink-500',

    PENDING_APPROVAL:
      'bg-amber-100 text-amber-700',

    /* -------------------------
       Interest
       ------------------------- */
    HIGH:
      'bg-green-100 text-green-700',

    MEDIUM:
      'bg-amber-100 text-amber-700',

    LOW:
      'bg-ink-100 text-ink-700',

    NONE:
      'bg-ink-100 text-ink-500',
  };

  return (
    map[normalizedStatus] ||
    'bg-ink-100 text-ink-700'
  );
}

/* =========================================================
   Availability Color
   ========================================================= */

export function availabilityColor(
  status: string
): string {
  const normalizedStatus = status
    .trim()
    .toLowerCase();

  const map: Record<string, string> = {
    'in stock':
      'text-green-600',

    'limited stock':
      'text-amber-600',

    backorder:
      'text-red-600',

    available:
      'text-green-600',

    unavailable:
      'text-red-600',
  };

  return (
    map[normalizedStatus] ||
    'text-ink-600'
  );
}

/* =========================================================
   Class Name Helper
   ========================================================= */

export function cn(
  ...classes: Array<
    string | false | null | undefined
  >
): string {
  return classes
    .filter(Boolean)
    .join(' ');
}
