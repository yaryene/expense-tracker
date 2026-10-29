import React, { useState, useEffect, useCallback } from 'react';
import {
  RefreshCw,
  Trash2,
  Eye,
  PlusCircle,
  Layers,
  ShieldAlert,
  Activity,
  X,
  LogOut,
} from 'lucide-react';
import { Login, UserSession } from './Login';
import { BirrSign } from './BirrSign';

/* ==========================================================================
   1. TYPES
   ========================================================================== */

export interface Expense {
  id: number;
  description: string;
  amount: number;
  category: string;
  date: string;
}

export interface CreateExpensePayload {
  description: string;
  amount: number | '';
  category: string;
  date: string;
}

export interface SpringValidationErrors {
  [field: string]: string;
}

export interface HttpLogEntry {
  method: 'GET' | 'POST' | 'DELETE';
  endpoint: string;
  springAnnotation: string;
  status: number | string;
  statusText: string;
  timestamp: string;
  isSuccess: boolean;
  message?: string;
}

/* ==========================================================================
   2. CONFIGURATION
   ========================================================================== */

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || '/api/v1/expenses';

const CATEGORIES = ['Food', 'Utilities', 'Infrastructure'] as const;

function extractValidationErrors(data: any): SpringValidationErrors {
  const errors: SpringValidationErrors = {};
  if (!data || typeof data !== 'object') return errors;

  if (data.validationErrors && typeof data.validationErrors === 'object') {
    Object.assign(errors, data.validationErrors);
  }

  if (Array.isArray(data.errors)) {
    data.errors.forEach((err: any) => {
      if (err.field && err.defaultMessage) {
        errors[err.field] = err.defaultMessage;
      }
    });
  }

  return errors;
}

/* ==========================================================================
   3. MAIN APPLICATION COMPONENT
   ========================================================================== */

export const App: React.FC = () => {
  // Authentication / User Session State
  const [currentUser, setCurrentUser] = useState<UserSession | null>(() => {
    try {
      const saved = sessionStorage.getItem('expense_tracker_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const handleLogout = () => {
    sessionStorage.removeItem('expense_tracker_user');
    setCurrentUser(null);
  };

  // Data State
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);

  // UI State
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [viewingId, setViewingId] = useState<number | null>(null);

  // Backend Connectivity & Live HTTP Feedback
  const [isBackendOnline, setIsBackendOnline] = useState<boolean | null>(null);
  const [isCheckingHealth, setIsCheckingHealth] = useState<boolean>(false);
  const [latestHttpAction, setLatestHttpAction] = useState<HttpLogEntry | null>(null);

  // Form State
  const todayIso = new Date().toISOString().split('T')[0];
  const initialFormState: CreateExpensePayload = {
    description: '',
    amount: '',
    category: 'Food',
    date: todayIso,
  };
  const [formData, setFormData] = useState<CreateExpensePayload>(initialFormState);
  const [validationErrors, setValidationErrors] = useState<SpringValidationErrors>({});
  const [formGeneralError, setFormGeneralError] = useState<string | null>(null);

  const recordHttpAction = (
    method: HttpLogEntry['method'],
    endpoint: string,
    springAnnotation: string,
    status: number | string,
    statusText: string,
    isSuccess: boolean,
    message?: string
  ) => {
    setLatestHttpAction({
      method,
      endpoint,
      springAnnotation,
      status,
      statusText,
      timestamp: new Date().toLocaleTimeString(),
      isSuccess,
      message,
    });
  };

  /* ==========================================================================
     4. TARGET ENDPOINTS: LIST, CREATE, GET BY ID, DELETE
     ========================================================================== */

  // READ ALL (to populate the table)
  const fetchExpenses = useCallback(async () => {
    setIsLoading(true);
    const annotation = '@GetMapping';
    try {
      const response = await fetch(`${API_BASE_URL}?size=100&sort=date,desc`, {
        method: 'GET',
        headers: { Accept: 'application/json' },
      });

      if (!response.ok) {
        const errText = await response.text();
        recordHttpAction('GET', API_BASE_URL, annotation, response.status, response.statusText, false, errText);
        setIsBackendOnline(false);
        return;
      }

      const data = await response.json();
      const list: Expense[] = Array.isArray(data)
        ? data
        : Array.isArray(data.content)
        ? data.content
        : [];

      setExpenses(list);
      setIsBackendOnline(true);
      recordHttpAction(
        'GET',
        API_BASE_URL,
        annotation,
        response.status,
        response.statusText,
        true,
        `Retrieved ${list.length} expense record${list.length === 1 ? '' : 's'}`
      );
    } catch (err: any) {
      setIsBackendOnline(false);
      recordHttpAction('GET', API_BASE_URL, annotation, 'ERR', 'Connection Failed', false, err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 1. CREATE -> POST /api/v1/expenses
  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setValidationErrors({});
    setFormGeneralError(null);

    const annotation = '@PostMapping';
    const payload = {
      description: formData.description,
      amount: formData.amount === '' ? null : Number(formData.amount),
      category: formData.category,
      date: formData.date,
    };

    try {
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
      });

      // Handle 400 Bad Request: DTO Validation Errors
      if (response.status === 400) {
        let errorData: any = null;
        try {
          errorData = await response.json();
        } catch {
          // fallback
        }

        const fieldErrors = extractValidationErrors(errorData);
        setValidationErrors(fieldErrors);

        const summaryMsg =
          errorData?.message ||
          (Object.keys(fieldErrors).length > 0 ? 'Validation failed' : '400 Bad Request');

        setFormGeneralError(summaryMsg);
        recordHttpAction('POST', API_BASE_URL, annotation, 400, 'Bad Request', false, summaryMsg);
        return;
      }

      if (!response.ok) {
        const errorText = await response.text();
        setFormGeneralError(`Server error (${response.status})`);
        recordHttpAction('POST', API_BASE_URL, annotation, response.status, response.statusText, false, errorText);
        return;
      }

      const newExpense: Expense = await response.json();
      recordHttpAction(
        'POST',
        API_BASE_URL,
        annotation,
        response.status,
        response.statusText || 'Created',
        true,
        `Created expense #${newExpense.id}`
      );

      // Reset form
      setFormData(initialFormState);
      fetchExpenses();
    } catch (err: any) {
      setFormGeneralError(err.message || 'Network request failed');
      recordHttpAction('POST', API_BASE_URL, annotation, 'ERR', 'Connection Failed', false, err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 2. GET BY ID -> GET /api/v1/expenses/{id}
  const handleGetById = async (id: number) => {
    setViewingId(id);
    const detailUrl = `${API_BASE_URL}/${id}`;
    const annotation = '@GetMapping("/{id}")';

    try {
      const response = await fetch(detailUrl, {
        method: 'GET',
        headers: { Accept: 'application/json' },
      });

      if (response.ok) {
        const data: Expense = await response.json();
        setSelectedExpense(data);
        recordHttpAction('GET', detailUrl, annotation, response.status, 'OK', true, `Fetched #${id}`);
      } else {
        const errText = await response.text();
        recordHttpAction('GET', detailUrl, annotation, response.status, response.statusText, false, errText);
      }
    } catch (err: any) {
      recordHttpAction('GET', detailUrl, annotation, 'ERR', 'Failed', false, err.message);
    } finally {
      setViewingId(null);
    }
  };

  // 3. DELETE -> DELETE /api/v1/expenses/{id}
  const handleDeleteExpense = async (id: number) => {
    setDeletingId(id);
    const deleteUrl = `${API_BASE_URL}/${id}`;
    const annotation = '@DeleteMapping("/{id}")';

    try {
      const response = await fetch(deleteUrl, {
        method: 'DELETE',
        headers: { Accept: 'application/json' },
      });

      if (response.status === 204 || response.ok) {
        recordHttpAction(
          'DELETE',
          deleteUrl,
          annotation,
          response.status,
          response.status === 204 ? 'No Content' : 'OK',
          true,
          `Deleted expense #${id}`
        );
        setExpenses((prev) => prev.filter((item) => item.id !== id));
        if (selectedExpense?.id === id) setSelectedExpense(null);
      } else {
        const errText = await response.text();
        recordHttpAction('DELETE', deleteUrl, annotation, response.status, response.statusText, false, errText);
      }
    } catch (err: any) {
      recordHttpAction('DELETE', deleteUrl, annotation, 'ERR', 'Request Failed', false, err.message);
    } finally {
      setDeletingId(null);
    }
  };

  // Health Ping
  const pingBackend = useCallback(async () => {
    setIsCheckingHealth(true);
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 2000);
      const res = await fetch(`${API_BASE_URL}?size=1`, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      });
      clearTimeout(timeout);
      setIsBackendOnline(res.ok || res.status === 200);
    } catch {
      setIsBackendOnline(false);
    } finally {
      setIsCheckingHealth(false);
    }
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchExpenses();
      pingBackend();
    }
  }, [currentUser, fetchExpenses, pingBackend]);

  /* ==========================================================================
     5. RENDER
     ========================================================================== */

  // Auth Gate: Render Login page if user is not authenticated
  if (!currentUser) {
    return <Login onLogin={(session) => setCurrentUser(session)} />;
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col font-sans">
      {/* -------------------------------------------------------------
          TOP BAR: Brand, Connection Status & Manual Refresh
          ------------------------------------------------------------- */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center shadow-xs">
              <Layers className="w-4 h-4 text-indigo-400" />
            </div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              Expense Tracker
            </h1>
          </div>

          <div className="flex items-center space-x-3">
            <div
              className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                isBackendOnline === true
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : isBackendOnline === false
                  ? 'bg-rose-50 text-rose-800 border-rose-200'
                  : 'bg-slate-100 text-slate-600 border-slate-200'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isBackendOnline === true
                    ? 'bg-emerald-500 animate-pulse'
                    : isBackendOnline === false
                    ? 'bg-rose-500'
                    : 'bg-slate-400'
                }`}
              />
              <span className="font-mono text-[11px]">
                {isBackendOnline === true
                  ? 'Connected'
                  : isBackendOnline === false
                  ? 'Disconnected'
                  : 'Connecting...'}
              </span>
            </div>

            <button
              onClick={() => {
                pingBackend();
                fetchExpenses();
              }}
              disabled={isLoading || isCheckingHealth}
              title="Refresh Data"
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 active:bg-slate-100 border border-slate-300 rounded-lg shadow-2xs transition-all disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 text-slate-500 ${
                  isLoading || isCheckingHealth ? 'animate-spin' : ''
                }`}
              />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            {/* Logged in User & Logout */}
            <div className="flex items-center space-x-2 pl-3 border-l border-slate-200">
              <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200">
                <div className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-[10px]">
                  {currentUser.username.charAt(0).toUpperCase()}
                </div>
                <span className="text-xs font-semibold text-slate-800">
                  {currentUser.username}
                </span>
              </div>

              <button
                onClick={handleLogout}
                id="logout-button"
                title="Log out of session"
                className="inline-flex items-center space-x-1.5 px-2.5 py-1.5 text-xs font-medium text-rose-700 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* -------------------------------------------------------------
          LIVE HTTP ACTION FEEDBACK BANNER
          ------------------------------------------------------------- */}
      <section className="bg-slate-900 text-slate-200 border-b border-slate-800 px-4 py-2.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center space-x-2.5 overflow-x-auto py-0.5">
            <span className="text-slate-400 font-semibold flex items-center space-x-1 uppercase tracking-wider text-[10px]">
              <Activity className="w-3.5 h-3.5 text-indigo-400" />
              <span>HTTP:</span>
            </span>

            {latestHttpAction ? (
              <div className="flex items-center space-x-2 font-mono">
                {/* Method */}
                <span
                  className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                    latestHttpAction.method === 'GET'
                      ? 'bg-blue-900/70 text-blue-300 border border-blue-700/50'
                      : latestHttpAction.method === 'POST'
                      ? 'bg-emerald-900/70 text-emerald-300 border border-emerald-700/50'
                      : latestHttpAction.method === 'DELETE'
                      ? 'bg-rose-900/70 text-rose-300 border border-rose-700/50'
                      : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {latestHttpAction.method}
                </span>

                {/* Spring Annotation */}
                <span className="text-indigo-300 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-800/40 text-[11px]">
                  {latestHttpAction.springAnnotation}
                </span>

                {/* Status code */}
                <span
                  className={`px-1.5 py-0.5 rounded font-semibold text-[11px] ${
                    latestHttpAction.isSuccess
                      ? 'text-emerald-400 bg-emerald-950/40'
                      : 'text-rose-400 bg-rose-950/40'
                  }`}
                >
                  {latestHttpAction.status} {latestHttpAction.statusText}
                </span>

                {/* Message */}
                {latestHttpAction.message && (
                  <span className="text-slate-400 max-w-xs sm:max-w-md truncate font-sans text-[11px]">
                    — {latestHttpAction.message}
                  </span>
                )}
              </div>
            ) : (
              <span className="text-slate-400 italic font-mono text-[11px]">
                Ready
              </span>
            )}
          </div>

          <div className="text-[11px] text-slate-400 font-mono hidden md:block">
            {API_BASE_URL}
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------
          MAIN CONTENT AREA (2-Column Layout)
          ------------------------------------------------------------- */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* =========================================================
              LEFT COLUMN: CREATE EXPENSE FORM (POST)
              ========================================================= */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="p-5 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <PlusCircle className="w-5 h-5 text-indigo-600" />
                <h2 className="text-base font-bold text-slate-900">
                  Create Expense
                </h2>
              </div>
              <span className="font-mono text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                @PostMapping
              </span>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateExpense} className="p-5 space-y-4">
              {formGeneralError && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start space-x-2">
                  <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block">Error:</span>
                    <span>{formGeneralError}</span>
                  </div>
                </div>
              )}

              {/* Field: Description */}
              <div>
                <label htmlFor="description" className="block text-xs font-semibold text-slate-700 mb-1">
                  Description <span className="text-rose-500">*</span>
                </label>
                <input
                  id="description"
                  type="text"
                  placeholder="e.g., Cloud Hosting"
                  value={formData.description}
                  onChange={(e) => {
                    setFormData({ ...formData, description: e.target.value });
                    if (validationErrors.description) {
                      setValidationErrors({ ...validationErrors, description: '' });
                    }
                  }}
                  className={`w-full px-3 py-2 text-sm rounded-lg border bg-white focus:outline-none focus:ring-2 transition-all ${
                    validationErrors.description
                      ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-200 bg-rose-50/20'
                      : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-100'
                  }`}
                />
                {validationErrors.description && (
                  <p className="mt-1 text-xs text-rose-600 font-medium">
                    {validationErrors.description}
                  </p>
                )}
              </div>

              {/* Field: Amount */}
              <div>
                <label htmlFor="amount" className="block text-xs font-semibold text-slate-700 mb-1">
                  <span className="inline-flex items-center gap-1">
                    <span>Amount</span>
                    <span className="text-slate-500 font-normal">
                      (<BirrSign className="h-[0.9em] w-auto inline-block -mt-0.5 text-slate-700" />)
                    </span>
                  </span>{' '}
                  <span className="text-rose-500">*</span>
                </label>
                <input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => {
                    const val = e.target.value === '' ? '' : Number(e.target.value);
                    setFormData({ ...formData, amount: val });
                    if (validationErrors.amount) {
                      setValidationErrors({ ...validationErrors, amount: '' });
                    }
                  }}
                  className={`w-full px-3 py-2 text-sm rounded-lg border bg-white focus:outline-none focus:ring-2 transition-all ${
                    validationErrors.amount
                      ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-200 bg-rose-50/20'
                      : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-100'
                  }`}
                />
                {validationErrors.amount && (
                  <p className="mt-1 text-xs text-rose-600 font-medium">
                    {validationErrors.amount}
                  </p>
                )}
              </div>

              {/* Field: Category */}
              <div>
                <label htmlFor="category" className="block text-xs font-semibold text-slate-700 mb-1">
                  Category <span className="text-rose-500">*</span>
                </label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) => {
                    setFormData({ ...formData, category: e.target.value });
                    if (validationErrors.category) {
                      setValidationErrors({ ...validationErrors, category: '' });
                    }
                  }}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                {validationErrors.category && (
                  <p className="mt-1 text-xs text-rose-600 font-medium">
                    {validationErrors.category}
                  </p>
                )}
              </div>

              {/* Field: Date */}
              <div>
                <label htmlFor="date" className="block text-xs font-semibold text-slate-700 mb-1">
                  Date <span className="text-rose-500">*</span>
                </label>
                <input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => {
                    setFormData({ ...formData, date: e.target.value });
                    if (validationErrors.date) {
                      setValidationErrors({ ...validationErrors, date: '' });
                    }
                  }}
                  className={`w-full px-3 py-2 text-sm rounded-lg border bg-white focus:outline-none focus:ring-2 transition-all ${
                    validationErrors.date
                      ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-200 bg-rose-50/20'
                      : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-100'
                  }`}
                />
                {validationErrors.date && (
                  <p className="mt-1 text-xs text-rose-600 font-medium">
                    {validationErrors.date}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-sm font-semibold rounded-lg shadow-sm transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Add Expense</span>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* =========================================================
              RIGHT COLUMN: EXPENSES TABLE (READ, GET BY ID, DELETE)
              ========================================================= */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col">
            {/* Table Header */}
            <div className="p-5 border-b border-slate-100 bg-slate-50/70 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-slate-900">Expenses</h2>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-mono">
                  {expenses.length}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                  @GetMapping("/{'{id}'}")
                </span>
                <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                  @DeleteMapping("/{'{id}'}")
                </span>
              </div>
            </div>

            {/* Table Body */}
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/40 text-[11px] uppercase font-bold text-slate-500 tracking-wider">
                    <th className="py-3 px-4">ID</th>
                    <th className="py-3 px-4">Description</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4 text-right">Amount</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        <RefreshCw className="w-6 h-6 animate-spin mx-auto text-indigo-500 mb-2" />
                        <p className="text-xs">Loading expenses...</p>
                      </td>
                    </tr>
                  ) : expenses.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-14 text-center text-slate-400">
                        <p className="text-sm font-semibold text-slate-600">No expenses found</p>
                      </td>
                    </tr>
                  ) : (
                    expenses.map((expense) => {
                      const isDeletingThis = deletingId === expense.id;
                      const isViewingThis = viewingId === expense.id;
                      return (
                        <tr
                          key={expense.id}
                          className="hover:bg-slate-50/80 transition-colors"
                        >
                          <td className="py-3 px-4 font-mono text-xs text-slate-500 font-semibold">
                            #{expense.id}
                          </td>
                          <td className="py-3 px-4 font-medium text-slate-900">
                            {expense.description}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`inline-block px-2 py-0.5 text-xs font-semibold rounded-md border ${
                                expense.category === 'Food'
                                  ? 'bg-amber-50 text-amber-800 border-amber-200/80'
                                  : expense.category === 'Utilities'
                                  ? 'bg-sky-50 text-sky-800 border-sky-200/80'
                                  : expense.category === 'Infrastructure'
                                  ? 'bg-purple-50 text-purple-800 border-purple-200/80'
                                  : 'bg-slate-100 text-slate-700 border-slate-200'
                              }`}
                            >
                              {expense.category}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-mono font-bold text-slate-900 text-right">
                            <span className="inline-flex items-center justify-end gap-1">
                              <BirrSign className="h-[0.95em] w-auto text-slate-600" />
                              <span>{Number(expense.amount).toFixed(2)}</span>
                            </span>
                          </td>
                          <td className="py-3 px-4 text-xs text-slate-500 font-mono">
                            {expense.date}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <div className="inline-flex items-center space-x-1.5">
                              {/* GET BY ID Button */}
                              <button
                                onClick={() => handleGetById(expense.id)}
                                disabled={isViewingThis}
                                title={`Get by ID (${expense.id})`}
                                className="inline-flex items-center space-x-1 px-2.5 py-1 text-xs font-medium text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/60 rounded-md transition-colors disabled:opacity-50"
                              >
                                {isViewingThis ? (
                                  <RefreshCw className="w-3 h-3 animate-spin" />
                                ) : (
                                  <Eye className="w-3 h-3" />
                                )}
                                <span>View</span>
                              </button>

                              {/* DELETE Button */}
                              <button
                                onClick={() => handleDeleteExpense(expense.id)}
                                disabled={isDeletingThis}
                                title="Delete expense"
                                className="inline-flex items-center space-x-1 px-2.5 py-1 text-xs font-medium text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200/60 rounded-md transition-colors disabled:opacity-50"
                              >
                                {isDeletingThis ? (
                                  <RefreshCw className="w-3 h-3 animate-spin" />
                                ) : (
                                  <Trash2 className="w-3 h-3" />
                                )}
                                <span>Delete</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Total Balance Footer */}
            {expenses.length > 0 && (
              <div className="p-4 bg-slate-50/80 border-t border-slate-200 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Total:</span>
                <span className="font-mono text-sm font-bold text-slate-900 inline-flex items-center gap-1">
                  <BirrSign className="h-[1em] w-auto text-slate-900" />
                  <span>
                    {expenses
                      .reduce((sum, item) => sum + Number(item.amount || 0), 0)
                      .toFixed(2)}
                  </span>
                </span>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* -------------------------------------------------------------
          MODAL: GET BY ID INSPECTOR (GET /api/v1/expenses/{id})
          ------------------------------------------------------------- */}
      {selectedExpense && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-sm w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                  GET /{selectedExpense.id}
                </span>
                <h3 className="font-bold text-slate-900">Expense Details</h3>
              </div>
              <button
                onClick={() => setSelectedExpense(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500 font-medium">ID:</span>
                <span className="font-mono font-bold text-slate-800">#{selectedExpense.id}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Description:</span>
                <span className="font-semibold text-slate-800 text-right">{selectedExpense.description}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Category:</span>
                <span className="font-medium text-slate-800">{selectedExpense.category}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Amount:</span>
                <span className="font-mono font-bold text-emerald-600 text-sm inline-flex items-center gap-1">
                  <BirrSign className="h-[1em] w-auto text-emerald-600" />
                  <span>{Number(selectedExpense.amount).toFixed(2)}</span>
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500 font-medium">Date:</span>
                <span className="font-mono text-slate-800">{selectedExpense.date}</span>
              </div>
            </div>

            <button
              onClick={() => setSelectedExpense(null)}
              className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
