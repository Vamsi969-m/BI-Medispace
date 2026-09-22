import {
  Building2,
  MapPin,
  Mail,
  Phone,
  BedDouble,
  Stethoscope,
  Users,
  Activity,
  Calendar,
  ShoppingBag,
} from 'lucide-react';

import { useApp } from '@/store/AppContext';
import {
  Card,
  PageHeader,
  StatCard,
  EmptyState,
} from '@/components/ui';

export function OrganizationPage() {
  const { user, navigate, role } = useApp();

  /*
   * Organization backend is not implemented yet.
   *
   * The User model currently contains:
   * organizationId
   *
   * Once the Organization model/API is added, this page
   * can load the complete organization using that ID.
   */

  const hasOrganization = Boolean(user?.organizationId);

  if (!user) {
    return (
      <Card className="p-8 text-center">
        <Building2 className="w-10 h-10 mx-auto text-ink-300 mb-3" />

        <h2 className="font-semibold text-ink-900">
          Login Required
        </h2>

        <p className="text-sm text-ink-500 mt-1">
          Please login to view organization information.
        </p>
      </Card>
    );
  }

  /*
   * Organization is not connected to the backend yet.
   */
  if (!hasOrganization) {
    return (
      <div>
        <PageHeader
          title="Healthcare Organization"
          subtitle="View your hospital, clinic, or healthcare organization information"
        />

        <Card className="p-8 text-center max-w-2xl mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-brand-100 flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-8 h-8 text-brand-600" />
          </div>

          <h2 className="text-xl font-semibold text-ink-900">
            No Organization Linked
          </h2>

          <p className="text-sm text-ink-500 mt-2 max-w-md mx-auto">
            Your account is not currently associated with
            a healthcare organization. Organization details
            will appear here once your account is linked.
          </p>

          {role === 'doctor' && (
            <button
              type="button"
              onClick={() => navigate('profile')}
              className="btn-primary mt-5"
            >
              Go to My Profile
            </button>
          )}
        </Card>
      </div>
    );
  }

  /*
   * Organization ID exists, but organization API is not
   * implemented yet.
   */
  return (
    <div>
      <PageHeader
        title="Healthcare Organization"
        subtitle="View and manage your organization information"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main organization information */}
        <div className="lg:col-span-2 space-y-5">
          <Card className="p-5">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-brand-100 flex items-center justify-center flex-shrink-0">
                <Building2 className="w-8 h-8 text-brand-600" />
              </div>

              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-bold text-ink-900">
                  Healthcare Organization
                </h2>

                <p className="text-sm text-ink-500 mt-1">
                  Organization ID: {user.organizationId}
                </p>

                <div className="flex items-center gap-2 mt-4 text-sm text-ink-500">
                  <MapPin className="w-4 h-4 text-ink-400" />
                  <span>
                    Organization address will appear here
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-ink-500">
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-4 h-4 text-ink-400" />
                    Organization email unavailable
                  </span>

                  <span className="flex items-center gap-1.5">
                    <Phone className="w-4 h-4 text-ink-400" />
                    Organization phone unavailable
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Departments */}
          <Card className="p-5">
            <h3 className="font-semibold text-ink-900 mb-4">
              Departments
            </h3>

            <EmptyState
              icon={Stethoscope}
              title="No department information"
              description="Department information will appear here once the organization backend is connected."
            />
          </Card>

          {/* Associated Doctors */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-ink-900">
                Associated Doctors / HCPs
              </h3>

              <span className="text-sm text-ink-500">
                0 doctors
              </span>
            </div>

            <EmptyState
              icon={Users}
              title="No doctors available"
              description="Doctors associated with this organization will appear here."
            />
          </Card>
        </div>

        {/* Organization statistics */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <StatCard
              icon={Users}
              label="Doctors"
              value={0}
              color="brand"
            />

            <StatCard
              icon={BedDouble}
              label="Bed Count"
              value="—"
              color="teal"
            />
          </div>

          {/* Activity */}
          <Card className="p-5">
            <h3 className="font-semibold text-ink-900 mb-3 flex items-center gap-2">
              <Activity className="w-4 h-4 text-brand-600" />
              Organization Activity
            </h3>

            <div className="space-y-3">
              <ActivityRow
                icon={Calendar}
                label="Total Orders"
                value="—"
                iconClass="text-amber-600"
                bgClass="bg-amber-50"
              />

              <ActivityRow
                icon={Activity}
                label="Demo Sessions"
                value="—"
                iconClass="text-brand-600"
                bgClass="bg-brand-50"
              />

              <ActivityRow
                icon={Stethoscope}
                label="Sample Requests"
                value="—"
                iconClass="text-teal-600"
                bgClass="bg-teal-50"
              />
            </div>
          </Card>

          {/* Recent orders */}
          <Card className="p-5">
            <h3 className="font-semibold text-ink-900 mb-3">
              Recent Orders
            </h3>

            <EmptyState
              icon={ShoppingBag}
              title="No order information"
              description="Organization order history will appear here."
            />
          </Card>
        </div>
      </div>
    </div>
  );
}

/*
 * Small reusable activity row
 */
function ActivityRow({
  icon: Icon,
  label,
  value,
  iconClass,
  bgClass,
}: {
  icon: React.ComponentType<{
    className?: string;
  }>;
  label: string;
  value: string | number;
  iconClass: string;
  bgClass: string;
}) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-ink-50">
      <div className="flex items-center gap-2">
        <div
          className={`w-8 h-8 rounded-lg ${bgClass} flex items-center justify-center`}
        >
          <Icon className={`w-4 h-4 ${iconClass}`} />
        </div>

        <span className="text-sm text-ink-700">
          {label}
        </span>
      </div>

      <span className="text-sm font-bold text-ink-900">
        {value}
      </span>
    </div>
  );
}