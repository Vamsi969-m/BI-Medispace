import { useMemo, useState } from 'react';
import {
  Phone,
  Users,
  Plus,
  Calendar,
  MessageSquare,
  Search,
} from 'lucide-react';

import { useApp } from '@/store/AppContext';

import {
  Card,
  StatusBadge,
  PageHeader,
  Tabs,
  EmptyState,
} from '@/components/ui';

import { Modal } from '@/components/Modal';
import { formatDate, cn } from '@/lib/utils';

import type {
  Interaction,
  InteractionType,
  InterestLevel,
} from '@/types';

const API_URL = 'http://localhost:5000/api';

interface AssignedDoctor {
  _id: string;
  fullName: string;
  email: string;
  phone?: string;
  specialization?: string;
  organizationId?: string | null;
}

interface FormState {
  type: InteractionType;
  doctorId: string;
  productId: string;
  date: string;
  summary: string;
  doctorResponse: string;
  samplesProvided: number;
  interestLevel: InterestLevel;
  followUpDate: string;
  notes: string;
}

const getToday = () => {
  return new Date().toISOString().split('T')[0];
};

const initialForm: FormState = {
  type: 'Call',
  doctorId: '',
  productId: '',
  date: getToday(),
  summary: '',
  doctorResponse: '',
  samplesProvided: 0,
  interestLevel: 'Medium',
  followUpDate: '',
  notes: '',
};

export function InteractionManagement() {
  const {
    user,
    token,
    role,
    products,
    interactions,
    addInteraction,
    showToast,
  } = useApp();

  const [tab, setTab] = useState('all');
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  const [assignedDoctors, setAssignedDoctors] = useState<
    AssignedDoctor[]
  >([]);

  const [loadingDoctors, setLoadingDoctors] = useState(true);

  const [form, setForm] = useState<FormState>(
    initialForm
  );

  /*
   * Load assigned doctors from the real backend.
   *
   * GET /api/assignments/my-doctors
   */
  const loadAssignedDoctors = async () => {
    if (!token) {
      setAssignedDoctors([]);
      setLoadingDoctors(false);
      return;
    }

    setLoadingDoctors(true);

    try {
      const response = await fetch(
        `${API_URL}/assignments/my-doctors`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            'Failed to load assigned doctors'
        );
      }

      /*
       * Depending on your controller response,
       * assignments may be returned as:
       *
       * { assignments: [...] }
       */
      const assignments = Array.isArray(
        data.assignments
      )
        ? data.assignments
        : [];

      const doctors = assignments
        .map((assignment: { doctor?: AssignedDoctor }) => assignment.doctor)
        .filter(Boolean);

      setAssignedDoctors(doctors as AssignedDoctor[]);
    } catch (error: unknown) {
      setAssignedDoctors([]);

      showToast(
        error instanceof Error
          ? error.message
          : 'Failed to load assigned doctors',
        'error'
      );
    } finally {
      setLoadingDoctors(false);
    }
  };

  /*
   * NOTE:
   * This function is intentionally not called during render.
   *
   * The page currently uses AppContext interactions because
   * Interaction backend has not been implemented yet.
   *
   * Once Interaction API is created, replace this with
   * useEffect/useCallback API loading.
   */

  /*
   * Get interactions belonging to the logged-in representative.
   *
   * Backend migration is still pending, so these are currently
   * the interaction records stored in AppContext.
   */
  const myInteractions = useMemo(() => {
    if (!user) {
      return [];
    }

    return interactions.filter(
      (interaction) =>
        interaction.repId === user.id
    );
  }, [interactions, user]);

  const tabData = [
    {
      id: 'all',
      label: 'All Interactions',
      count: myInteractions.length,
    },
    {
      id: 'calls',
      label: 'Calls',
      count: myInteractions.filter(
        (interaction) =>
          interaction.type === 'Call'
      ).length,
    },
    {
      id: 'visits',
      label: 'Face-to-Face Visits',
      count: myInteractions.filter(
        (interaction) =>
          interaction.type ===
          'Face-to-Face Visit'
      ).length,
    },
  ];

  const filtered = useMemo(() => {
    const normalizedSearch =
      search.trim().toLowerCase();

    return myInteractions
      .filter((interaction) => {
        if (tab === 'calls') {
          return interaction.type === 'Call';
        }

        if (tab === 'visits') {
          return (
            interaction.type ===
            'Face-to-Face Visit'
          );
        }

        return true;
      })
      .filter((interaction) => {
        if (!normalizedSearch) {
          return true;
        }

        return (
          interaction.doctorName
            .toLowerCase()
            .includes(normalizedSearch) ||
          interaction.productName
            .toLowerCase()
            .includes(normalizedSearch)
        );
      });
  }, [myInteractions, tab, search]);

  if (role !== 'rep') {
    return (
      <Card className="p-8 text-center">
        <Users className="w-10 h-10 mx-auto mb-3 text-ink-400" />
        <h2 className="text-lg font-semibold text-ink-900">
          Representative Access Required
        </h2>
        <p className="text-sm text-ink-500 mt-1">
          Interaction management is available only for representatives.
        </p>
      </Card>
    );
  }

  /*
   * Open modal and load assigned doctors.
   */
  const openInteractionModal = async () => {
    setForm(initialForm);
    setModalOpen(true);

    await loadAssignedDoctors();
  };

  const handleSubmit = () => {
    if (!user) {
      showToast(
        'Please login again',
        'error'
      );
      return;
    }

    const doctor = assignedDoctors.find(
      (item) =>
        item._id === form.doctorId
    );

    const product = products.find(
      (item) =>
        item.id === form.productId
    );

    if (!doctor) {
      showToast(
        'Please select an assigned doctor',
        'error'
      );
      return;
    }

    if (!product) {
      showToast(
        'Please select a product',
        'error'
      );
      return;
    }

    if (!form.summary.trim()) {
      showToast(
        'Please enter a discussion summary',
        'error'
      );
      return;
    }

    const newInteraction: Interaction = {
      id: `int-${Date.now()}`,
      type: form.type,

      doctorId: doctor._id,
      doctorName: doctor.fullName,

      /*
       * Organization backend is not implemented yet.
       * Therefore we use a safe fallback instead of mockData.
       */
      organization:
        doctor.organizationId ||
        'Organization not linked',

      productId: product.id,
      productName: product.name,

      date: form.date,

      summary: form.summary.trim(),

      doctorResponse:
        form.doctorResponse.trim(),

      samplesProvided:
        Math.max(0, form.samplesProvided),

      interestLevel:
        form.interestLevel,

      followUpDate:
        form.followUpDate || undefined,

      notes: form.notes.trim(),

      repId: user.id,
      repName: user.fullName,
    };

    addInteraction(newInteraction);

    showToast(
      'Interaction recorded successfully',
      'success'
    );

    setModalOpen(false);
    setForm(initialForm);
  };

  return (
    <div>
      <PageHeader
        title="Interaction Management"
        subtitle="Record and track doctor interactions"
        action={
          <button
            type="button"
            onClick={openInteractionModal}
            className="btn-primary"
          >
            <Plus className="w-4 h-4" />
            Record Interaction
          </button>
        }
      />

      <Card className="p-5">
        {/* Search */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search by doctor or product..."
              className="input pl-9"
            />
          </div>
        </div>

        {/* Tabs */}
        <Tabs
          tabs={tabData}
          active={tab}
          onChange={setTab}
        />

        <div className="pt-4">
          {filtered.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No interactions recorded"
              description="Record a call or face-to-face visit to track your doctor engagement."
              action={
                <button
                  type="button"
                  className="btn-primary"
                  onClick={openInteractionModal}
                >
                  <Plus className="w-4 h-4" />
                  Record Interaction
                </button>
              }
            />
          ) : (
            <div className="space-y-3">
              {filtered.map((interaction) => (
                <div
                  key={interaction.id}
                  className="p-4 rounded-xl border border-ink-100 hover:border-ink-200 transition-colors"
                >
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          'w-10 h-10 rounded-lg flex items-center justify-center',
                          interaction.type ===
                            'Call'
                            ? 'bg-blue-50'
                            : 'bg-purple-50'
                        )}
                      >
                        {interaction.type ===
                        'Call' ? (
                          <Phone className="w-5 h-5 text-blue-600" />
                        ) : (
                          <Users className="w-5 h-5 text-purple-600" />
                        )}
                      </div>

                      <div>
                        <p className="font-medium text-ink-900">
                          {
                            interaction.doctorName
                          }
                        </p>

                        <p className="text-xs text-ink-500">
                          {
                            interaction.organization
                          }{' '}
                          •{' '}
                          {formatDate(
                            interaction.date
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="badge bg-ink-50 text-ink-600">
                        {interaction.type}
                      </span>

                      <StatusBadge
                        status={
                          interaction.interestLevel
                        }
                      />
                    </div>
                  </div>

                  {/* Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-ink-400 font-medium">
                        Product Discussed
                      </p>

                      <p className="text-ink-700">
                        {
                          interaction.productName
                        }
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-ink-400 font-medium">
                        Discussion Summary
                      </p>

                      <p className="text-ink-700">
                        {interaction.summary ||
                          'No summary provided'}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-ink-400 font-medium">
                        Doctor Response
                      </p>

                      <p className="text-ink-700">
                        {interaction.doctorResponse ||
                          'No response recorded'}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-ink-400 font-medium">
                        Samples Provided
                      </p>

                      <p className="text-ink-700">
                        {
                          interaction.samplesProvided
                        }{' '}
                        units
                      </p>
                    </div>
                  </div>

                  {/* Follow-up */}
                  {interaction.followUpDate && (
                    <div className="mt-3 pt-3 border-t border-ink-100 flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-brand-600" />

                      <span className="text-ink-600">
                        Follow-up scheduled:{' '}
                        <strong className="text-ink-800">
                          {formatDate(
                            interaction.followUpDate
                          )}
                        </strong>
                      </span>
                    </div>
                  )}

                  {/* Notes */}
                  {interaction.notes && (
                    <div className="mt-2 p-2.5 rounded-lg bg-ink-50 text-sm text-ink-600 flex items-start gap-2">
                      <MessageSquare className="w-4 h-4 text-ink-400 mt-0.5 flex-shrink-0" />

                      <span>
                        {interaction.notes}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Record Interaction Modal */}
      <Modal
        open={modalOpen}
        onClose={() =>
          setModalOpen(false)
        }
        title="Record Interaction"
        subtitle="Log a call or face-to-face visit"
        size="lg"
        footer={
          <>
            <button
              type="button"
              className="btn-secondary"
              onClick={() =>
                setModalOpen(false)
              }
            >
              Cancel
            </button>

            <button
              type="button"
              className="btn-primary"
              onClick={handleSubmit}
              disabled={
                !form.doctorId ||
                !form.productId ||
                !form.summary.trim()
              }
            >
              <Plus className="w-4 h-4" />
              Save Interaction
            </button>
          </>
        }
      >
        <div className="space-y-4">
          {/* Interaction Type */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() =>
                setForm({
                  ...form,
                  type: 'Call',
                })
              }
              className={cn(
                'p-4 rounded-xl border-2 text-left transition-all',
                form.type === 'Call'
                  ? 'border-brand-500 bg-brand-50'
                  : 'border-ink-200 hover:border-ink-300'
              )}
            >
              <Phone
                className={cn(
                  'w-5 h-5 mb-2',
                  form.type === 'Call'
                    ? 'text-brand-600'
                    : 'text-ink-400'
                )}
              />

              <p className="text-sm font-medium text-ink-800">
                Call
              </p>

              <p className="text-xs text-ink-500">
                Phone conversation
              </p>
            </button>

            <button
              type="button"
              onClick={() =>
                setForm({
                  ...form,
                  type: 'Face-to-Face Visit',
                })
              }
              className={cn(
                'p-4 rounded-xl border-2 text-left transition-all',
                form.type ===
                  'Face-to-Face Visit'
                  ? 'border-brand-500 bg-brand-50'
                  : 'border-ink-200 hover:border-ink-300'
              )}
            >
              <Users
                className={cn(
                  'w-5 h-5 mb-2',
                  form.type ===
                    'Face-to-Face Visit'
                    ? 'text-brand-600'
                    : 'text-ink-400'
                )}
              />

              <p className="text-sm font-medium text-ink-800">
                Face-to-Face Visit
              </p>

              <p className="text-xs text-ink-500">
                In-person meeting
              </p>
            </button>
          </div>

          {/* Doctor + Product */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="interaction-doctor"
                className="label"
              >
                Doctor
              </label>

              <select
                id="interaction-doctor"
                value={form.doctorId}
                onChange={(event) =>
                  setForm({
                    ...form,
                    doctorId:
                      event.target.value,
                  })
                }
                className="input cursor-pointer"
                disabled={loadingDoctors}
              >
                <option value="">
                  {loadingDoctors
                    ? 'Loading doctors...'
                    : 'Select doctor...'}
                </option>

                {assignedDoctors.map(
                  (doctor) => (
                    <option
                      key={doctor._id}
                      value={doctor._id}
                    >
                      {doctor.fullName}
                      {doctor.specialization
                        ? ` — ${doctor.specialization}`
                        : ''}
                    </option>
                  )
                )}
              </select>

              {!loadingDoctors &&
                assignedDoctors.length ===
                  0 && (
                  <p className="text-xs text-red-500 mt-1">
                    No doctors are assigned to
                    you.
                  </p>
                )}
            </div>

            <div>
              <label
                htmlFor="interaction-product"
                className="label"
              >
                Product Discussed
              </label>

              <select
                id="interaction-product"
                value={form.productId}
                onChange={(event) =>
                  setForm({
                    ...form,
                    productId:
                      event.target.value,
                  })
                }
                className="input cursor-pointer"
              >
                <option value="">
                  Select product...
                </option>

                {products
                  .filter(
                    (product) =>
                      product.availability !== 'Backorder'
                  )
                  .map((product) => (
                    <option
                      key={product.id}
                      value={product.id}
                    >
                      {product.name}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          {/* Date + Interest */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="interaction-date"
                className="label"
              >
                Date
              </label>

              <input
                id="interaction-date"
                type="date"
                value={form.date}
                onChange={(event) =>
                  setForm({
                    ...form,
                    date: event.target.value,
                  })
                }
                className="input"
              />
            </div>

            <div>
              <label
                htmlFor="interest-level"
                className="label"
              >
                Interest Level
              </label>

              <select
                id="interest-level"
                value={form.interestLevel}
                onChange={(event) =>
                  setForm({
                    ...form,
                    interestLevel:
                      event.target
                        .value as InterestLevel,
                  })
                }
                className="input cursor-pointer"
              >
                <option value="High">
                  High
                </option>

                <option value="Medium">
                  Medium
                </option>

                <option value="Low">
                  Low
                </option>

                <option value="None">
                  None
                </option>
              </select>
            </div>
          </div>

          {/* Summary */}
          <div>
            <label
              htmlFor="discussion-summary"
              className="label"
            >
              Discussion Summary
            </label>

            <textarea
              id="discussion-summary"
              value={form.summary}
              onChange={(event) =>
                setForm({
                  ...form,
                  summary: event.target.value,
                })
              }
              rows={3}
              maxLength={1000}
              placeholder="Brief summary of what was discussed..."
              className="input resize-none"
            />

            <p className="text-xs text-ink-400 mt-1 text-right">
              {form.summary.length}/1000
            </p>
          </div>

          {/* Doctor Response */}
          <div>
            <label
              htmlFor="doctor-response"
              className="label"
            >
              Doctor Response
            </label>

            <textarea
              id="doctor-response"
              value={form.doctorResponse}
              onChange={(event) =>
                setForm({
                  ...form,
                  doctorResponse:
                    event.target.value,
                })
              }
              rows={3}
              maxLength={1000}
              placeholder="How did the doctor respond?"
              className="input resize-none"
            />
          </div>

          {/* Samples + Follow-up */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="samples-provided"
                className="label"
              >
                Samples Provided
              </label>

              <input
                id="samples-provided"
                type="number"
                value={form.samplesProvided}
                onChange={(event) => {
                  const value =
                    Number(event.target.value);

                  setForm({
                    ...form,
                    samplesProvided:
                      Number.isFinite(value)
                        ? Math.max(
                            0,
                            Math.min(1000, value)
                          )
                        : 0,
                  });
                }}
                min="0"
                max="1000"
                className="input"
              />
            </div>

            <div>
              <label
                htmlFor="follow-up-date"
                className="label"
              >
                Follow-up Date
              </label>

              <input
                id="follow-up-date"
                type="date"
                value={form.followUpDate}
                onChange={(event) =>
                  setForm({
                    ...form,
                    followUpDate:
                      event.target.value,
                  })
                }
                className="input"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label
              htmlFor="interaction-notes"
              className="label"
            >
              Notes
            </label>

            <textarea
              id="interaction-notes"
              value={form.notes}
              onChange={(event) =>
                setForm({
                  ...form,
                  notes: event.target.value,
                })
              }
              rows={3}
              maxLength={1000}
              placeholder="Additional notes..."
              className="input resize-none"
            />

            <p className="text-xs text-ink-400 mt-1 text-right">
              {form.notes.length}/1000
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}