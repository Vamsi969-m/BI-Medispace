import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';

import { getProducts } from '@/services/productService';

import type {
  Role,
  Notification,
  Product,
  DemoSession,
  SampleRequest,
  Order,
  Interaction,
} from '@/types';

import {
  notifications as initialNotifications,
  demoSessions as initialDemos,
  sampleRequests as initialSamples,
  orders as initialOrders,
  interactions as initialInteractions,
} from '@/data/mockData';

// -----------------------------------------
// AUTH USER
// -----------------------------------------

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  role: 'DOCTOR' | 'REPRESENTATIVE' | 'ADMIN';
  phone?: string;
  specialization?: string;
  avatar?: string;
  organizationId?: string | null;
  isActive?: boolean;
}

// -----------------------------------------
// TOAST
// -----------------------------------------

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

// -----------------------------------------
// APP STATE
// -----------------------------------------

interface AppState {
  // Authentication
  user: AuthUser | null;
  token: string | null;
  logout: () => void;

  // Role
  role: Role;
  setRole: (role: Role) => void;

  // Navigation
  page: string;
  navigate: (
    page: string,
    params?: Record<string, string>
  ) => void;
  pageParams: Record<string, string>;

  // Products
  products: Product[];
  productsLoading: boolean;
  toggleFavorite: (productId: string) => void;

  // Notifications
  notifications: Notification[];
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  unreadCount: number;

  // Demos
  demos: DemoSession[];
  addDemo: (demo: DemoSession) => void;
  updateDemo: (
    id: string,
    updates: Partial<DemoSession>
  ) => void;

  // Samples
  samples: SampleRequest[];
  addSample: (sample: SampleRequest) => void;
  updateSample: (
    id: string,
    status: SampleRequest['status']
  ) => void;

  // Orders
  orders: Order[];
  addOrder: (order: Order) => void;
  updateOrder: (
    id: string,
    status: Order['status']
  ) => void;

  // Interactions
  interactions: Interaction[];
  addInteraction: (
    interaction: Interaction
  ) => void;

  // Toasts
  toasts: Toast[];
  showToast: (
    message: string,
    type?: Toast['type']
  ) => void;
  dismissToast: (id: string) => void;
}

// -----------------------------------------
// API PRODUCT
// -----------------------------------------

interface ApiProduct {
  _id?: string;
  id?: string;

  name?: string;
  description?: string;
  shortDescription?: string;

  image?: string;

  manufacturer?: string;
  madeIn?: string;
  manufacturedIn?: string;

  purpose?: string;

  approvedUses?: string[];
  uses?: string[];

  category?: Product['category'];

  price?: number;
  rating?: number;
  reviewCount?: number;

  features?: string[];

  specifications?: Product['specifications'];

  importantInfo?: string[];

  documentation?: Product['documentation'];

  availability?: Product['availability'];

  isFavorite?: boolean;
}

// -----------------------------------------
// CONTEXT
// -----------------------------------------

const AppContext =
  createContext<AppState | null>(null);

// -----------------------------------------
// BACKEND ROLE → FRONTEND ROLE
// -----------------------------------------

function getFrontendRole(
  backendRole: AuthUser['role']
): Role {
  switch (backendRole) {
    case 'DOCTOR':
      return 'doctor';

    case 'REPRESENTATIVE':
      return 'rep';

    case 'ADMIN':
      return 'admin';

    default:
      return 'doctor';
  }
}

// -----------------------------------------
// READ SAVED USER
// -----------------------------------------

function getSavedUser(): AuthUser | null {
  const savedUser =
    localStorage.getItem('bi_user');

  if (!savedUser) {
    return null;
  }

  try {
    return JSON.parse(savedUser);
  } catch (error) {
    console.error(
      'Invalid saved user:',
      error
    );

    localStorage.removeItem('bi_user');

    return null;
  }
}

// -----------------------------------------
// PROVIDER
// -----------------------------------------

export function AppProvider({
  children,
}: {
  children: ReactNode;
}) {
  // ---------------------------------------
  // AUTHENTICATION
  // ---------------------------------------

  const [user, setUser] =
    useState<AuthUser | null>(() =>
      getSavedUser()
    );

  const [token, setToken] =
    useState<string | null>(() =>
      localStorage.getItem('bi_token')
    );

  const [role, setRoleState] =
    useState<Role>(() => {
      const savedUser = getSavedUser();

      if (!savedUser) {
        return 'doctor';
      }

      return getFrontendRole(
        savedUser.role
      );
    });

  // ---------------------------------------
  // ROLE
  // ---------------------------------------

  const setRole = useCallback(
    (newRole: Role) => {
      /*
       * This is currently useful for your
       * development/testing role switcher.
       *
       * In production, role should be taken
       * only from the authenticated backend user.
       */
      setRoleState(newRole);
    },
    []
  );

  // ---------------------------------------
  // LOGOUT
  // ---------------------------------------

  const logout = useCallback(() => {
    localStorage.removeItem('bi_token');
    localStorage.removeItem('bi_user');

    setToken(null);
    setUser(null);
    setRoleState('doctor');

    setProducts([]);
    setProductsLoading(false);

    setPage('dashboard');
    setPageParams({});
  }, []);

  // ---------------------------------------
  // NAVIGATION
  // ---------------------------------------

  const [page, setPage] =
    useState('dashboard');

  const [pageParams, setPageParams] =
    useState<Record<string, string>>({});

  const navigate = useCallback(
    (
      nextPage: string,
      params: Record<string, string> = {}
    ) => {
      setPage(nextPage);
      setPageParams(params);

      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    },
    []
  );

  // ---------------------------------------
  // PRODUCTS
  // ---------------------------------------

  const [products, setProducts] =
    useState<Product[]>([]);

  const [productsLoading, setProductsLoading] =
    useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      if (!token) {
        setProducts([]);
        setProductsLoading(false);
        return;
      }

      try {
        setProductsLoading(true);

        const data = await getProducts(token);

        const mappedProducts: Product[] =
          (data.products || []).map(
            (product: ApiProduct) => ({
              ...product,

              id:
                product._id ||
                product.id ||
                '',

              name:
                product.name ||
                'Unnamed Product',

              description:
                product.description || '',

              shortDescription:
                product.shortDescription ||
                product.description ||
                '',

              image:
                product.image || '',

              manufacturer:
                product.manufacturer ||
                'BI Pharmaceuticals',

              madeIn:
                product.madeIn ||
                product.manufacturedIn ||
                'Not specified',

              approvedUses:
                product.approvedUses ||
                product.uses ||
                [],

              uses:
                product.uses || [],

              features:
                product.features || [],

              specifications:
                product.specifications || [],

              importantInfo:
                product.importantInfo || [],

              documentation:
                product.documentation || [],

              availability:
                product.availability ||
                'In Stock',

              category:
                product.category ||
                'Other',

              price:
                typeof product.price === 'number'
                  ? product.price
                  : 0,

              rating:
                typeof product.rating === 'number'
                  ? product.rating
                  : 0,

              reviewCount:
                product.reviewCount || 0,

              isFavorite:
                product.isFavorite || false,
            })
          );

        setProducts(mappedProducts);
      } catch (error) {
        console.error(
          'Failed to load products:',
          error
        );

        setProducts([]);
      } finally {
        setProductsLoading(false);
      }
    };

    loadProducts();
  }, [token]);

  // ---------------------------------------
  // NOTIFICATIONS
  // ---------------------------------------

  const [notifications, setNotifications] =
    useState<Notification[]>(
      initialNotifications
    );

  // ---------------------------------------
  // DEMOS
  // ---------------------------------------

  const [demos, setDemos] =
    useState<DemoSession[]>(initialDemos);

  // ---------------------------------------
  // SAMPLES
  // ---------------------------------------

  const [samples, setSamples] =
    useState<SampleRequest[]>(initialSamples);

  // ---------------------------------------
  // ORDERS
  // ---------------------------------------

  const [orders, setOrders] =
    useState<Order[]>(initialOrders);

  // ---------------------------------------
  // INTERACTIONS
  // ---------------------------------------

  const [interactions, setInteractions] =
    useState<Interaction[]>(
      initialInteractions
    );

  // ---------------------------------------
  // TOASTS
  // ---------------------------------------

  const [toasts, setToasts] =
    useState<Toast[]>([]);

  // =======================================
  // PRODUCT FUNCTIONS
  // =======================================

  const toggleFavorite = useCallback(
    (productId: string) => {
      setProducts((previous) =>
        previous.map((product) =>
          product.id === productId
            ? {
                ...product,
                isFavorite:
                  !product.isFavorite,
              }
            : product
        )
      );
    },
    []
  );

  // =======================================
  // NOTIFICATION FUNCTIONS
  // =======================================

  const markNotificationRead =
    useCallback((id: string) => {
      setNotifications((previous) =>
        previous.map((notification) =>
          notification.id === id
            ? {
                ...notification,
                read: true,
              }
            : notification
        )
      );
    }, []);

  const markAllNotificationsRead =
    useCallback(() => {
      setNotifications((previous) =>
        previous.map((notification) => ({
          ...notification,
          read: true,
        }))
      );
    }, []);

  const unreadCount =
    notifications.filter(
      (notification) =>
        !notification.read
    ).length;

  // =======================================
  // DEMO FUNCTIONS
  // =======================================

  const addDemo = useCallback(
    (demo: DemoSession) => {
      setDemos((previous) => [
        demo,
        ...previous,
      ]);
    },
    []
  );

  const updateDemo = useCallback(
    (
      id: string,
      updates: Partial<DemoSession>
    ) => {
      setDemos((previous) =>
        previous.map((demo) =>
          demo.id === id
            ? {
                ...demo,
                ...updates,
              }
            : demo
        )
      );
    },
    []
  );

  // =======================================
  // SAMPLE FUNCTIONS
  // =======================================

  const addSample = useCallback(
    (sample: SampleRequest) => {
      setSamples((previous) => [
        sample,
        ...previous,
      ]);
    },
    []
  );

  const updateSample = useCallback(
    (
      id: string,
      status: SampleRequest['status']
    ) => {
      setSamples((previous) =>
        previous.map((sample) =>
          sample.id === id
            ? {
                ...sample,
                status,
              }
            : sample
        )
      );
    },
    []
  );

  // =======================================
  // ORDER FUNCTIONS
  // =======================================

  const addOrder = useCallback(
    (order: Order) => {
      setOrders((previous) => [
        order,
        ...previous,
      ]);
    },
    []
  );

  const updateOrder = useCallback(
    (
      id: string,
      status: Order['status']
    ) => {
      setOrders((previous) =>
        previous.map((order) =>
          order.id === id
            ? {
                ...order,
                status,
              }
            : order
        )
      );
    },
    []
  );

  // =======================================
  // INTERACTION FUNCTIONS
  // =======================================

  const addInteraction = useCallback(
    (interaction: Interaction) => {
      setInteractions((previous) => [
        interaction,
        ...previous,
      ]);
    },
    []
  );

  // =======================================
  // TOAST FUNCTIONS
  // =======================================

  const showToast = useCallback(
    (
      message: string,
      type: Toast['type'] = 'success'
    ) => {
      const id =
        `toast-${Date.now()}-${Math.random()}`;

      setToasts((previous) => [
        ...previous,
        {
          id,
          message,
          type,
        },
      ]);

      setTimeout(() => {
        setToasts((previous) =>
          previous.filter(
            (toast) =>
              toast.id !== id
          )
        );
      }, 3500);
    },
    []
  );

  const dismissToast = useCallback(
    (id: string) => {
      setToasts((previous) =>
        previous.filter(
          (toast) =>
            toast.id !== id
        )
      );
    },
    []
  );

  // =======================================
  // PROVIDER
  // =======================================

  return (
    <AppContext.Provider
      value={{
        // Authentication
        user,
        token,
        logout,

        // Role
        role,
        setRole,

        // Navigation
        page,
        navigate,
        pageParams,

        // Products
        products,
        productsLoading,
        toggleFavorite,

        // Notifications
        notifications,
        markNotificationRead,
        markAllNotificationsRead,
        unreadCount,

        // Demos
        demos,
        addDemo,
        updateDemo,

        // Samples
        samples,
        addSample,
        updateSample,

        // Orders
        orders,
        addOrder,
        updateOrder,

        // Interactions
        interactions,
        addInteraction,

        // Toasts
        toasts,
        showToast,
        dismissToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

// -----------------------------------------
// USE APP
// -----------------------------------------

export function useApp() {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error(
      'useApp must be used within AppProvider'
    );
  }

  return context;
}