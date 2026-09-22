import {
  useEffect,
  useMemo,
  useState,
  type ComponentType,
} from "react";

import {
  ShoppingCart,
  FlaskConical,
  Video,
  Heart,
  Package,
  Calendar,
  CheckCircle2,
  ArrowRight,
  Activity as ActivityIcon,
  Phone,
  Users,
  ClipboardCheck,
  Loader2,
} from "lucide-react";

import { useApp } from "@/store/AppContext";

import {
  StatCard,
  Card,
  StatusBadge,
  PageHeader,
  Rating,
} from "@/components/ui";

import { getMyDemos } from "@/services/demoService";

import {
  formatCurrency,
  formatDate,
  timeAgo,
} from "@/lib/utils";

/*
 * ==========================================
 * API
 * ==========================================
 */

const API_URL = "http://localhost:5000/api";

/*
 * ==========================================
 * TYPES
 * ==========================================
 */

interface Doctor {
  _id: string;
  fullName: string;
  email: string;
  role: "DOCTOR";
  phone?: string;
  avatar?: string;
  specialization?: string;
  organizationId?: string | null;
  isActive?: boolean;
}

interface Demo {
  _id: string;

  demoType:
    | "VIDEO"
    | "PHONE"
    | "FACE_TO_FACE";

  scheduledDate: string;

  status:
    | "PENDING"
    | "APPROVED"
    | "DISPATCHED"
    | "LIVE"
    | "COMPLETED"
    | "CANCELLED";

  notes?: string;

  product?: {
    _id: string;
    name: string;
    image?: string;
    purpose?: string;
    price?: number;
    rating?: number;
    category?: string;
  };

  representative?: {
    _id?: string;
    fullName?: string;
    email?: string;
    phone?: string;
  };
}

interface Sample {
  _id: string;

  quantity: number;

  deliveryOrganization: string;

  deliveryAddress: string;

  notes?: string;

  status:
    | "PENDING"
    | "APPROVED"
    | "PROCESSING"
    | "SHIPPED"
    | "DELIVERED"
    | "CANCELLED";

  trackingNumber?: string;

  createdAt: string;

  updatedAt?: string;

  product?: {
    _id: string;
    name: string;
    image?: string;
    purpose?: string;
    price?: number;
    rating?: number;
    category?: string;
  };

  representative?: {
    _id?: string;
    fullName?: string;
    email?: string;
    phone?: string;
  };
}

interface Order {
  _id: string;

  quantity: number;

  unitPrice: number;

  subtotal: number;

  total: number;

  deliveryOrganization: string;

  deliveryAddress: string;

  notes?: string;

  status:
    | "PENDING"
    | "CONFIRMED"
    | "PROCESSING"
    | "SHIPPED"
    | "DELIVERED"
    | "CANCELLED";

  trackingNumber?: string;

  createdAt: string;

  updatedAt?: string;

  representative?: {
    _id?: string;
    fullName?: string;
    email?: string;
    phone?: string;
  };

  product?: {
    _id: string;
    name: string;
    image?: string;
    purpose?: string;
    price?: number;
    rating?: number;
    category?: string;
  };
}

interface Product {
  _id: string;

  name: string;

  shortDescription?: string;

  description: string;

  image?: string;

  manufacturedIn?: string;

  purpose: string;

  uses: string[];

  category: string;

  price: number;

  rating: number;

  isFavorite?: boolean;

  isActive: boolean;

  approvalStatus?:
    | "PENDING"
    | "APPROVED"
    | "REJECTED";
}

interface Activity {
  id: string;

  description: string;

  date: string;

  icon: string;
}

/*
 * ==========================================
 * ICON MAP
 * ==========================================
 */

const iconMap: Record<
  string,
  ComponentType<{ className?: string }>
> = {
  ShoppingCart,
  FlaskConical,
  Video,
  Heart,
  CheckCircle2,
  Package,
  Phone,
  Users,
  ClipboardCheck,
};

/*
 * ==========================================
 * DASHBOARD
 * ==========================================
 */

export function DoctorDashboard() {
  const {
    navigate,
    token,
    showToast,
  } = useApp();

  const [doctor, setDoctor] =
    useState<Doctor | null>(null);

  const [products, setProducts] =
    useState<Product[]>([]);

  const [demos, setDemos] =
    useState<Demo[]>([]);

  const [samples, setSamples] =
    useState<Sample[]>([]);

  const [orders, setOrders] =
    useState<Order[]>([]);

  const [loading, setLoading] =
    useState(true);

  /*
   * ==========================================
   * LOAD DASHBOARD
   * ==========================================
   */

  useEffect(() => {
    let mounted = true;

    const loadDashboard = async () => {
      /*
       * Authentication
       */
      if (!token) {
        if (mounted) {
          setLoading(false);

          showToast(
            "Please login again",
            "error"
          );
        }

        return;
      }

      try {
        if (mounted) {
          setLoading(true);
        }

        const headers = {
          Authorization: `Bearer ${token}`,
        };

        /*
         * Fetch all dashboard data
         *
         * These endpoints are all available
         * in your current backend.
         */
        const [
          doctorResponse,
          productsResponse,
          demosResponse,
          samplesResponse,
          ordersResponse,
        ] = await Promise.all([
          fetch(`${API_URL}/auth/me`, {
            method: "GET",
            headers,
          }),

          fetch(`${API_URL}/products`, {
            method: "GET",
            headers,
          }),

          getMyDemos(token),

          fetch(`${API_URL}/samples/my`, {
            method: "GET",
            headers,
          }),

          fetch(`${API_URL}/orders/my`, {
            method: "GET",
            headers,
          }),
        ]);

        /*
         * Parse responses
         */
        const doctorData =
          await doctorResponse.json();

        const productsData =
          await productsResponse.json();

        const samplesData =
          await samplesResponse.json();

        const ordersData =
          await ordersResponse.json();

        /*
         * Validate API responses
         */
        if (!doctorResponse.ok) {
          throw new Error(
            doctorData.message ||
              "Failed to load doctor profile"
          );
        }

        if (!productsResponse.ok) {
          throw new Error(
            productsData.message ||
              "Failed to load products"
          );
        }

        if (!samplesResponse.ok) {
          throw new Error(
            samplesData.message ||
              "Failed to load samples"
          );
        }

        if (!ordersResponse.ok) {
          throw new Error(
            ordersData.message ||
              "Failed to load orders"
          );
        }

        /*
         * Prevent state update after unmount
         */
        if (!mounted) {
          return;
        }

        setDoctor(
          doctorData.user || null
        );

        setProducts(
          productsData.products || []
        );

        setDemos(
          demosResponse.demos || []
        );

        setSamples(
          samplesData.samples || []
        );

        setOrders(
          ordersData.orders || []
        );
      } catch (error) {
        if (!mounted) {
          return;
        }

        showToast(
          error instanceof Error
            ? error.message
            : "Failed to load dashboard",
          "error"
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    void loadDashboard();

    return () => {
      mounted = false;
    };
  }, [token, showToast]);

  /*
   * ==========================================
   * UPCOMING DEMOS
   * ==========================================
   */

  const upcomingDemos = useMemo(() => {
    return demos
      .filter((demo) =>
        [
          "PENDING",
          "APPROVED",
          "DISPATCHED",
          "LIVE",
        ].includes(demo.status)
      )
      .sort(
        (a, b) =>
          new Date(
            a.scheduledDate
          ).getTime() -
          new Date(
            b.scheduledDate
          ).getTime()
      );
  }, [demos]);

  /*
   * ==========================================
   * PENDING SAMPLES
   * ==========================================
   */

  const pendingSamples = useMemo(() => {
    return samples.filter((sample) =>
      [
        "PENDING",
        "APPROVED",
        "PROCESSING",
        "SHIPPED",
      ].includes(sample.status)
    );
  }, [samples]);

  /*
   * ==========================================
   * CURRENT ORDERS
   * ==========================================
   */

  const currentOrders = useMemo(() => {
    return orders.filter(
      (order) =>
        order.status !== "DELIVERED" &&
        order.status !== "CANCELLED"
    );
  }, [orders]);

  /*
   * ==========================================
   * PREVIOUS ORDERS
   * ==========================================
   */

  const previousOrders = useMemo(() => {
    return orders.filter(
      (order) =>
        order.status === "DELIVERED" ||
        order.status === "CANCELLED"
    );
  }, [orders]);

  /*
   * ==========================================
   * FAVORITE PRODUCTS
   * ==========================================
   */

  const favoriteProducts = useMemo(() => {
    return products.filter(
      (product) => product.isFavorite
    );
  }, [products]);

  /*
   * ==========================================
   * RECOMMENDED PRODUCTS
   * ==========================================
   *
   * Only approved + active products should
   * appear in the doctor's catalog.
   */

  const recommendedProducts = useMemo(() => {
    const availableProducts =
      products.filter(
        (product) =>
          product.isActive &&
          (product.approvalStatus ===
            undefined ||
            product.approvalStatus ===
              "APPROVED")
      );

    if (!doctor?.specialization) {
      return availableProducts.slice(0, 4);
    }

    const specialization =
      doctor.specialization
        .toLowerCase()
        .trim();

    if (!specialization) {
      return availableProducts.slice(0, 4);
    }

    const matched =
      availableProducts.filter(
        (product) => {
          const category =
            product.category
              ?.toLowerCase()
              .trim() || "";

          const purpose =
            product.purpose
              ?.toLowerCase()
              .trim() || "";

          return (
            category.includes(
              specialization
            ) ||
            specialization.includes(
              category
            ) ||
            purpose.includes(
              specialization
            )
          );
        }
      );

    return matched.length > 0
      ? matched.slice(0, 4)
      : availableProducts.slice(0, 4);
  }, [products, doctor]);

  /*
   * ==========================================
   * RECENT ACTIVITY
   * ==========================================
   */

  const recentActivities =
    useMemo<Activity[]>(() => {
      const activities: Activity[] =
        [];

      /*
       * Orders
       */
      orders.forEach((order) => {
        activities.push({
          id: `order-${order._id}`,

          description: `Order placed for ${
            order.product?.name ||
            "product"
          }`,

          date: order.createdAt,

          icon: "ShoppingCart",
        });
      });

      /*
       * Samples
       */
      samples.forEach((sample) => {
        activities.push({
          id: `sample-${sample._id}`,

          description: `Sample request for ${
            sample.product?.name ||
            "product"
          }`,

          date: sample.createdAt,

          icon: "FlaskConical",
        });
      });

      /*
       * Demos
       */
      demos.forEach((demo) => {
        activities.push({
          id: `demo-${demo._id}`,

          description: `Demo session for ${
            demo.product?.name ||
            "product"
          }`,

          /*
           * scheduledDate is the only date
           * currently available in Demo.
           */
          date: demo.scheduledDate,

          icon: "Video",
        });
      });

      return activities
        .filter((activity) => {
          const date =
            new Date(activity.date);

          return !Number.isNaN(
            date.getTime()
          );
        })
        .sort(
          (a, b) =>
            new Date(b.date).getTime() -
            new Date(a.date).getTime()
        )
        .slice(0, 6);
    }, [orders, samples, demos]);

  /*
   * ==========================================
   * DEMO TYPE
   * ==========================================
   */

  const getDemoType = (
    type: Demo["demoType"]
  ) => {
    switch (type) {
      case "VIDEO":
        return "Video Call";

      case "PHONE":
        return "Phone Call";

      case "FACE_TO_FACE":
        return "Face-to-Face";

      default:
        return "Demo";
    }
  };

  /*
   * ==========================================
   * LOADING STATE
   * ==========================================
   */

  if (loading) {
    return (
      <div>
        <PageHeader
          title="Doctor Dashboard"
          subtitle="Loading your dashboard..."
        />

        <Card className="p-10">
          <div className="flex items-center justify-center gap-3 text-ink-500">
            <Loader2 className="w-5 h-5 animate-spin" />

            <p className="text-sm">
              Loading your information...
            </p>
          </div>
        </Card>
      </div>
    );
  }

  /*
   * ==========================================
   * DOCTOR NOT FOUND
   * ==========================================
   */

  if (!doctor) {
    return (
      <div>
        <PageHeader
          title="Doctor Dashboard"
          subtitle="Unable to load your profile"
        />

        <Card className="p-10 text-center">
          <p className="text-sm text-ink-500">
            Please login again to continue.
          </p>

          <button
            type="button"
            onClick={() =>
              navigate("login")
            }
            className="btn-primary mt-4"
          >
            Login Again
          </button>
        </Card>
      </div>
    );
  }

  /*
   * ==========================================
   * DASHBOARD UI
   * ==========================================
   */

  return (
    <div>
      {/* =====================================
          HEADER
      ===================================== */}

      <PageHeader
        title={`Welcome, ${doctor.fullName}`}
        subtitle={
          doctor.specialization
            ? `${doctor.specialization}${
                doctor.organizationId
                  ? " • Healthcare Organization"
                  : ""
              }`
            : "Doctor Dashboard"
        }
      />

      {/* =====================================
          STATISTICS
      ===================================== */}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={Video}
          label="Upcoming Demos"
          value={upcomingDemos.length}
          trend={
            upcomingDemos.length > 0
              ? "Scheduled sessions"
              : "No upcoming demos"
          }
          trendUp
          color="brand"
        />

        <StatCard
          icon={FlaskConical}
          label="Pending Samples"
          value={pendingSamples.length}
          trend="Track sample requests"
          trendUp
          color="teal"
        />

        <StatCard
          icon={ShoppingCart}
          label="Current Orders"
          value={currentOrders.length}
          trend="Orders in progress"
          trendUp
          color="amber"
        />

        <StatCard
          icon={Heart}
          label="Favorite Products"
          value={favoriteProducts.length}
          trend="Browse catalog"
          color="red"
        />
      </div>

      {/* =====================================
          RECENT ACTIVITY + UPCOMING DEMOS
      ===================================== */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Recent Activity */}
        <Card className="lg:col-span-2 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-ink-900">
              Recent Activity
            </h3>

            <button
              type="button"
              onClick={() =>
                navigate("orders")
              }
              className="text-sm text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1"
            >
              View orders

              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-1">
            {recentActivities.length ===
            0 ? (
              <p className="text-sm text-ink-400 text-center py-6">
                No recent activity
              </p>
            ) : (
              recentActivities.map(
                (activity, index) => {
                  const Icon =
                    iconMap[
                      activity.icon
                    ] ||
                    ActivityIcon;

                  return (
                    <div
                      key={activity.id}
                      className="flex items-start gap-3 py-3 border-b border-ink-50 last:border-0"
                    >
                      <div className="w-9 h-9 rounded-lg bg-ink-50 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-4 h-4 text-ink-500" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-ink-700">
                          {
                            activity.description
                          }
                        </p>

                        <p className="text-xs text-ink-400 mt-0.5">
                          {timeAgo(
                            activity.date
                          )}{" "}
                          •{" "}
                          {formatDate(
                            activity.date
                          )}
                        </p>
                      </div>

                      {index === 0 && (
                        <span className="badge bg-brand-50 text-brand-600 text-[10px]">
                          New
                        </span>
                      )}
                    </div>
                  );
                }
              )
            )}
          </div>
        </Card>

        {/* ===================================
            UPCOMING DEMOS
        =================================== */}

        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-ink-900">
              Upcoming Demos
            </h3>

            <button
              type="button"
              onClick={() =>
                navigate("demos")
              }
              className="text-sm text-brand-600 hover:text-brand-700 font-medium"
            >
              View all
            </button>
          </div>

          <div className="space-y-3">
            {upcomingDemos.length ===
            0 ? (
              <p className="text-sm text-ink-400 py-4 text-center">
                No upcoming demos scheduled
              </p>
            ) : (
              upcomingDemos
                .slice(0, 4)
                .map((demo) => {
                  const demoDate =
                    new Date(
                      demo.scheduledDate
                    );

                  const validDate =
                    !Number.isNaN(
                      demoDate.getTime()
                    );

                  return (
                    <button
                      key={demo._id}
                      type="button"
                      onClick={() =>
                        navigate(
                          "demo-session",
                          {
                            id: demo._id,
                          }
                        )
                      }
                      className="w-full text-left flex items-start gap-3 p-3 rounded-lg bg-ink-50/50 hover:bg-ink-50 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-300"
                    >
                      <div className="w-10 h-10 rounded-lg bg-brand-100 flex items-center justify-center flex-shrink-0">
                        <Video className="w-5 h-5 text-brand-600" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-ink-800 truncate">
                          {demo.product
                            ?.name ||
                            "Product"}
                        </p>

                        <p className="text-xs text-ink-500 mt-0.5">
                          {validDate
                            ? formatDate(
                                demo.scheduledDate
                              )
                            : "Date unavailable"}
                        </p>

                        <p className="text-xs text-ink-500 mt-0.5">
                          {validDate
                            ? demoDate.toLocaleTimeString(
                                "en-IN",
                                {
                                  hour: "numeric",
                                  minute:
                                    "2-digit",
                                }
                              )
                            : "Time unavailable"}
                        </p>

                        <div className="flex items-center gap-2 mt-1.5">
                          <StatusBadge
                            status={
                              demo.status
                            }
                          />

                          <span className="text-xs text-ink-400">
                            {getDemoType(
                              demo.demoType
                            )}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })
            )}
          </div>

          <button
            type="button"
            onClick={() =>
              navigate("products")
            }
            className="w-full mt-3 btn-secondary text-sm"
          >
            <Calendar className="w-4 h-4" />
            Book a Demo
          </button>
        </Card>
      </div>

      {/* =====================================
          SAMPLES + ORDERS
      ===================================== */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Samples */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-ink-900">
              Pending Sample Requests
            </h3>

            <button
              type="button"
              onClick={() =>
                navigate("samples")
              }
              className="text-sm text-brand-600 hover:text-brand-700 font-medium"
            >
              View all
            </button>
          </div>

          <div className="space-y-2">
            {pendingSamples
              .slice(0, 5)
              .map((sample) => (
                <button
                  key={sample._id}
                  type="button"
                  onClick={() =>
                    navigate("samples")
                  }
                  className="w-full text-left flex items-center justify-between gap-3 p-3 rounded-lg border border-ink-100 hover:border-ink-200 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-300"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-teal-50 flex items-center justify-center flex-shrink-0">
                      <FlaskConical className="w-4 h-4 text-teal-600" />
                    </div>

                    <div className="min-w-0">
                      <p className="text-sm font-medium text-ink-800 truncate">
                        {sample
                          .product
                          ?.name ||
                          "Product"}
                      </p>

                      <p className="text-xs text-ink-500">
                        Qty:{" "}
                        {sample.quantity}{" "}
                        •{" "}
                        {formatDate(
                          sample.createdAt
                        )}
                      </p>
                    </div>
                  </div>

                  <StatusBadge
                    status={sample.status}
                  />
                </button>
              ))}

            {pendingSamples.length ===
              0 && (
              <p className="text-sm text-ink-400 text-center py-4">
                No pending samples
              </p>
            )}
          </div>
        </Card>

        {/* Orders */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-ink-900">
              Current Orders
            </h3>

            <button
              type="button"
              onClick={() =>
                navigate("orders")
              }
              className="text-sm text-brand-600 hover:text-brand-700 font-medium"
            >
              View all
            </button>
          </div>

          <div className="space-y-2">
            {currentOrders
              .slice(0, 5)
              .map((order) => (
                <button
                  key={order._id}
                  type="button"
                  onClick={() =>
                    navigate("orders")
                  }
                  className="w-full text-left flex items-center justify-between gap-3 p-3 rounded-lg border border-ink-100 hover:border-ink-200 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-300"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
                      <Package className="w-4 h-4 text-amber-600" />
                    </div>

                    <div className="min-w-0">
                      <p className="text-sm font-medium text-ink-800 truncate">
                        {order.product
                          ?.name ||
                          "Product"}
                      </p>

                      <p className="text-xs text-ink-500">
                        Order #
                        {order._id.slice(
                          -6
                        )}{" "}
                        • Qty:{" "}
                        {order.quantity}
                      </p>
                    </div>
                  </div>

                  <div className="text-right ml-3 flex-shrink-0">
                    <p className="text-sm font-semibold text-ink-800">
                      {formatCurrency(
                        order.total
                      )}
                    </p>

                    <StatusBadge
                      status={
                        order.status
                      }
                    />
                  </div>
                </button>
              ))}

            {currentOrders.length ===
              0 && (
              <p className="text-sm text-ink-400 text-center py-4">
                No current orders
              </p>
            )}
          </div>
        </Card>
      </div>

      {/* =====================================
          RECOMMENDED PRODUCTS
      ===================================== */}

      <Card className="p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-ink-900">
              Recommended BI Products
            </h3>

            <p className="text-sm text-ink-500 mt-0.5">
              Products from the BI catalog
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              navigate("products")
            }
            className="text-sm text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1"
          >
            Browse catalog

            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recommendedProducts.length ===
        0 ? (
          <p className="text-sm text-ink-400 text-center py-6">
            No products available
          </p>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {recommendedProducts.map(
              (product) => (
                <button
                  key={product._id}
                  type="button"
                  onClick={() =>
                    navigate(
                      "product-details",
                      {
                        id: product._id,
                      }
                    )
                  }
                  className="text-left cursor-pointer group rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-300"
                >
                  <div className="h-28 rounded-xl overflow-hidden bg-ink-100 mb-2">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-8 h-8 text-ink-300" />
                      </div>
                    )}
                  </div>

                  <p className="text-sm font-medium text-ink-800 truncate">
                    {product.name}
                  </p>

                  <div className="flex items-center justify-between gap-2 mt-1">
                    <Rating
                      value={
                        product.rating ||
                        0
                      }
                    />

                    <span className="text-sm font-semibold text-ink-700">
                      {formatCurrency(
                        product.price
                      )}
                    </span>
                  </div>
                </button>
              )
            )}
          </div>
        )}
      </Card>

      {/* =====================================
          PREVIOUS ORDERS
      ===================================== */}

      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-ink-900">
            Previous Orders
          </h3>

          <button
            type="button"
            onClick={() =>
              navigate("orders")
            }
            className="text-sm text-brand-600 hover:text-brand-700 font-medium"
          >
            View all
          </button>
        </div>

        <div className="space-y-2">
          {previousOrders
            .slice(0, 5)
            .map((order) => (
              <button
                key={order._id}
                type="button"
                onClick={() =>
                  navigate("orders")
                }
                className="w-full text-left flex items-center justify-between gap-3 p-3 rounded-lg border border-ink-100 hover:border-ink-200 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-300"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  </div>

                  <div className="min-w-0">
                    <p className="text-sm font-medium text-ink-800 truncate">
                      {order.product
                        ?.name ||
                        "Product"}
                    </p>

                    <p className="text-xs text-ink-500">
                      Order #
                      {order._id.slice(
                        -6
                      )}{" "}
                      •{" "}
                      {formatDate(
                        order.createdAt
                      )}
                    </p>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-semibold text-ink-800">
                    {formatCurrency(
                      order.total
                    )}
                  </p>

                  <StatusBadge
                    status={order.status}
                  />
                </div>
              </button>
            ))}

          {previousOrders.length ===
            0 && (
            <p className="text-sm text-ink-400 text-center py-4">
              No previous orders
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}