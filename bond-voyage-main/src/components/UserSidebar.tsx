import {
  Home,
  Plane,
  Sparkles,
  Calendar,
  Archive,
  MessageSquare,
  Star,
  Grid3x3,
  Bell,
  X,
  ChevronRight,
  User,
  Sun,
  Moon,
  Check,
  ArrowLeftRight,
  CloudRain,
  Languages,
  Disc,
  LogOut,
  Car,
} from "lucide-react";
import { useState, useEffect, useRef, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSide } from "./SideContext";
import { useProfile } from "../hooks/useAuth";
import bondVoyage from "../assets/BondVoyage Logo White (logo only).png";
import SidebarSkeleton from "./SidebarSkeleton";
import { getInitials } from "../utils/helpers/getInitials";
import { useLogout } from "../hooks/useAuth";
import { useNotifications } from "../hooks/useNotifications";
import { toast } from "sonner";
import { User as IUser } from "../types/types";

interface UserSidebarProps {
  currentTheme: string;
  onThemeChange: (theme: string) => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
}

export function UserSidebar({
  currentTheme,
  onThemeChange,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
}: UserSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { switchSide } = useSide();
  const { data: userProfileData, isLoading: profileDataIsLoading } =
    useProfile();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotificationMenu, setShowNotificationMenu] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [showSideMenu, setShowSideMenu] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  // Memoize profile data with proper fallback
  const profileData: IUser = useMemo(() => {
    return userProfileData?.data?.user
      ? userProfileData.data.user
      : {
          id: "",
          email: "",
          firstName: "",
          middleName: "",
          lastName: "",
          mobile: "",
          role: "",
          isActive: false,
          createdAt: "",
          updatedAt: "",
          lastLogin: "",
          avatarUrl: "",
          birthday: "",
          companyName: "",
          employeeId: "",
          customerRating: 0,
        };
  }, [userProfileData?.data?.user]);

  // Use real notifications hook if available
  const { data: notificationsResponse } = useNotifications();
  const { mutate: logout } = useLogout();

  const menuItems = [
    { id: "/user/home", icon: Home, label: "Home" },
    { id: "/user/travels", icon: Car, label: "Travels" },
    { id: "/user/smart-trip", icon: Sparkles, label: "Smart Trip" },
    { id: "/user/bookings", icon: Calendar, label: "Bookings" },
    { id: "/user/history", icon: Archive, label: "History" },
    { id: "/user/feedback", icon: Star, label: "Feedback" },
  ];

  const moreMenuItems = [
    { id: "/user/weather", icon: CloudRain, label: "Weather Forecast" },
    { id: "/user/spin-wheel", icon: Disc, label: "Spin the Wheel" },
  ];

  // Refs for menu overlays
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notificationMenuRef = useRef<HTMLDivElement>(null);
  const themeMenuRef = useRef<HTMLDivElement>(null);
  const sideMenuRef = useRef<HTMLDivElement>(null);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  // Close menus when navigating or clicking outside
  const handleNavigate = (path: string) => {
    setShowUserMenu(false);
    setShowNotificationMenu(false);
    setShowThemeMenu(false);
    setShowSideMenu(false);
    setShowMoreMenu(false);
    setIsMobileMenuOpen(false);
    navigate(path);
  };

  // Handle side switch
  const handleSwitchToAdmin = () => {
    switchSide("admin");
    setShowSideMenu(false);
    setIsMobileMenuOpen(false);
    navigate("/");
  };

  // Handle logout with proper error handling
  const handleLogout = () => {
    logout(undefined, {
      onSuccess: () => {
        navigate("/");
        setShowUserMenu(false);
      },
      onError: () => {
        toast.error("Logout failed. Please try again");
      },
    });
  };

  // Calculate unread count from real API data
  const unreadCount =
    notificationsResponse?.data?.items.filter((n) => !n.isRead).length || 0;

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setShowUserMenu(false);
      }
      if (
        notificationMenuRef.current &&
        !notificationMenuRef.current.contains(event.target as Node)
      ) {
        setShowNotificationMenu(false);
      }
      if (
        themeMenuRef.current &&
        !themeMenuRef.current.contains(event.target as Node)
      ) {
        setShowThemeMenu(false);
      }
      if (
        sideMenuRef.current &&
        !sideMenuRef.current.contains(event.target as Node)
      ) {
        setShowSideMenu(false);
      }
      if (
        moreMenuRef.current &&
        !moreMenuRef.current.contains(event.target as Node)
      ) {
        setShowMoreMenu(false);
      }
    };

    if (
      showUserMenu ||
      showNotificationMenu ||
      showThemeMenu ||
      showSideMenu ||
      showMoreMenu
    ) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [
    showUserMenu,
    showNotificationMenu,
    showThemeMenu,
    showSideMenu,
    showMoreMenu,
  ]);

  return (
    <>
      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-screen w-20 bg-sidebar border-r border-sidebar-border flex flex-col items-center shadow-[0_0_20px_rgba(0,0,0,0.03)] z-50 transition-transform duration-300 ${
          isMobileMenuOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {profileDataIsLoading && <SidebarSkeleton />}

        {/* Mountain Logo Brand Button with Side Menu */}
        <div className="relative" ref={sideMenuRef}>
          <button
            onClick={() => setShowSideMenu(!showSideMenu)}
            className="mt-5 mb-6 w-14 h-14 p-2 rounded-2xl flex items-center justify-center transition-all duration-200 hover:scale-105 hover:rotate-2"
            style={{
              background: `linear-gradient(135deg, var(--gradient-from), var(--gradient-to))`,
              boxShadow: `0 4px 12px var(--shadow-color-strong)`,
            }}
          >
            <img src={bondVoyage} alt="Bond Voyage" />
          </button>
        </div>

        {/* Navigation Menu Items */}
        <div className="flex flex-col items-center gap-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleNavigate(item.id)}
                className={`
                relative w-14 h-14 rounded-xl flex flex-col items-center justify-center gap-1.5
                transition-all duration-200 hover:-translate-y-0.5
                ${
                  isActive
                    ? "bg-sidebar-accent border-l-[3px] border-sidebar-primary"
                    : "hover:bg-sidebar-accent/50"
                }
              `}
                style={
                  isActive
                    ? {
                        boxShadow: `0 0 0 3px var(--shadow-color)`,
                      }
                    : undefined
                }
              >
                <div
                  className={`w-10 h-10 rounded-[10px] flex items-center justify-center ${
                    isActive ? "" : "group-hover:bg-sidebar-accent"
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 ${
                      isActive
                        ? "text-sidebar-primary"
                        : "text-sidebar-foreground/60"
                    } transition-colors`}
                    strokeWidth={2.5}
                  />
                </div>
                <span
                  className={`text-[10.5px] ${
                    isActive
                      ? "text-sidebar-primary font-semibold"
                      : "text-sidebar-foreground/60 font-medium"
                  } tracking-tight transition-all`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}

          {/* More Menu Button */}
          <div className="relative" ref={moreMenuRef}>
            <button
              onClick={() => setShowMoreMenu(!showMoreMenu)}
              className="relative w-14 h-14 rounded-xl flex flex-col items-center justify-center gap-1.5 transition-all duration-200 hover:-translate-y-0.5 hover:bg-sidebar-accent/50"
            >
              <div className="w-10 h-10 rounded-[10px] flex items-center justify-center">
                <Grid3x3
                  className="w-5 h-5 text-sidebar-foreground/60 transition-colors"
                  strokeWidth={2.5}
                />
              </div>
              <span className="text-[10.5px] text-sidebar-foreground/60 font-medium tracking-tight transition-all">
                More
              </span>
            </button>

            {/* More Menu Overlay */}
            {showMoreMenu && (
              <div className="absolute left-20 top-0 ml-3 w-56 bg-card border border-border rounded-xl shadow-lg overflow-hidden z-50 animate-in fade-in slide-in-from-left-2 duration-200">
                {moreMenuItems.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavigate(item.id)}
                      className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-accent transition-colors ${
                        index < moreMenuItems.length - 1
                          ? "border-b border-border"
                          : ""
                      }`}
                    >
                      <Icon className="w-5 h-5 text-primary" strokeWidth={2} />
                      <span className="text-sm text-card-foreground">
                        {item.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Bottom Section - More Menu, Notification, User Avatar */}
        <div className="mt-auto mb-3 flex flex-col items-center gap-2">
          {/* Notification Bell Button */}
          <div className="relative" ref={notificationMenuRef}>
            <button
              onClick={() => {
                setShowNotificationMenu(!showNotificationMenu);
                setShowUserMenu(false);
                setShowThemeMenu(false);
              }}
              className="w-14 h-14 rounded-xl bg-sidebar-accent/50 hover:bg-sidebar-accent flex items-center justify-center transition-all duration-200 hover:scale-105 relative group"
            >
              <Bell
                className="w-5 h-5 text-sidebar-foreground/60 group-hover:animate-[wiggle_0.5s_ease-in-out]"
                strokeWidth={2.5}
              />
              {unreadCount > 0 && (
                <div className="absolute top-2 right-2 w-2.5 h-2.5 bg-destructive rounded-full border-2 border-sidebar" />
              )}
            </button>

            {/* Notification Overlay */}
            {showNotificationMenu && (
              <div className="fixed bottom-3 left-24 w-96 max-w-[calc(100vw-6rem)] bg-card/80 backdrop-blur-xl rounded-2xl shadow-[0_8px_32px_rgba(10,122,255,0.12),0_2px_8px_rgba(0,0,0,0.08)] border border-border/50 z-200 overflow-hidden">
                <div className="p-5 border-b border-border/50 bg-linear-to-br from-primary/5 to-accent/5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base text-popover-foreground font-semibold">
                        Notifications
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {unreadCount} unread messages
                      </p>
                    </div>
                    <button
                      onClick={() => setShowNotificationMenu(false)}
                      className="w-8 h-8 rounded-lg hover:bg-accent/50 flex items-center justify-center transition-colors"
                    >
                      <X className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </div>
                </div>

                <div className="max-h-100 overflow-y-auto">
                  {notificationsResponse?.data &&
                    notificationsResponse?.data?.items.map((notification) => (
                      <button
                        key={notification.id}
                        className="w-full p-4 hover:bg-accent/30 transition-colors border-b border-border/30 text-left"
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-2 h-2 rounded-full mt-2 shrink-0 ${
                              notification.isRead ? "bg-muted" : "bg-primary"
                            }`}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-popover-foreground truncate">
                              {notification.title}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {notification.message}
                            </p>
                            <p className="text-xs text-muted-foreground/60 mt-1">
                              {notification.createdAt}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                </div>

                <div className="p-3 border-t border-border/50 bg-muted/20">
                  <button
                    onClick={() => {
                      setShowNotificationMenu(false);
                      navigate("/user/notifications");
                    }}
                    className="w-full px-4 py-2 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary font-medium text-sm transition-colors text-center"
                  >
                    View All Notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Avatar with Expanded Menu */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="w-12 h-12 rounded-full bg-linear-to-br from-primary to-accent flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-105 overflow-hidden"
            >
              {profileData && profileData.avatarUrl ? (
                <img
                  src={profileData.avatarUrl}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-white text-lg font-semibold">
                  <span className="text-white text-lg font-semibold">
                    {profileData.firstName && profileData.lastName
                      ? getInitials(
                          `${profileData.firstName} ${profileData.lastName}`
                        )
                      : "?"}
                  </span>
                </span>
              )}
            </button>

            {/* User Menu Overlay*/}
            {showUserMenu && (
              <div className="fixed bottom-3 left-24 w-72 max-w-[calc(100vw-6rem)] bg-card/80 backdrop-blur-xl rounded-2xl shadow-[0_8px_32px_rgba(10,122,255,0.12),0_2px_8px_rgba(0,0,0,0.08)] border border-border/50 z-200 overflow-hidden">
                <div className="p-5 border-b border-border/50 bg-linear-to-br from-primary/5 to-accent/5">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-linear-to-br from-primary to-accent flex items-center justify-center shadow-md overflow-hidden">
                      {profileData && profileData.avatarUrl ? (
                        <img
                          src={profileData.avatarUrl}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-7 h-7 text-white" strokeWidth={2} />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base text-popover-foreground">
                        {profileData.firstName || "User"}{" "}
                        {profileData.lastName || ""}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {profileData.email}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-2">
                  <button
                    onClick={() => handleNavigate("/user/profile/edit")}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-accent/50 transition-all text-left group"
                  >
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <User className="w-4 h-4 text-primary" strokeWidth={2} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-popover-foreground">
                        Edit Profile
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Manage account settings
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-popover-foreground transition-colors" />
                  </button>

                  <button
                    onClick={() => {
                      setShowThemeMenu(!showThemeMenu);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-accent/50 transition-all text-left group"
                  >
                    <div className="w-9 h-9 rounded-lg bg-warning/10 flex items-center justify-center group-hover:bg-warning/20 transition-colors">
                      {currentTheme === "dark" ? (
                        <Moon
                          className="w-4 h-4 text-warning"
                          strokeWidth={2}
                        />
                      ) : (
                        <Sun className="w-4 h-4 text-warning" strokeWidth={2} />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-popover-foreground">Theme</p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {currentTheme} mode
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-popover-foreground transition-colors" />
                  </button>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-destructive/10 transition-all text-left group"
                  >
                    <div className="w-9 h-9 rounded-lg bg-destructive/10 flex items-center justify-center group-hover:bg-destructive/20 transition-colors">
                      <LogOut
                        className="w-4 h-4 text-destructive"
                        strokeWidth={2}
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-destructive">Log Out</p>
                      <p className="text-xs text-muted-foreground">
                        Sign out of your account
                      </p>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Theme Menu Overlay - Positioned to the right of User Menu */}
        {showThemeMenu && (
          <div
            ref={themeMenuRef}
            className="fixed bottom-3 left-24 lg:left-100 w-80 max-w-[calc(100vw-6rem)] bg-card/80 backdrop-blur-xl rounded-2xl shadow-[0_8px_32px_rgba(10,122,255,0.12),0_2px_8px_rgba(0,0,0,0.08)] border border-border/50 z-200 overflow-hidden"
          >
            <div className="p-5 border-b border-border/50 bg-linear-to-br from-warning/5 to-warning/10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-linear-to-br from-warning to-warning/80 flex items-center justify-center shadow-md">
                  {currentTheme === "dark" ? (
                    <Moon className="w-6 h-6 text-white" strokeWidth={2} />
                  ) : (
                    <Sun className="w-6 h-6 text-white" strokeWidth={2} />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-base text-popover-foreground">
                    Theme Settings
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Customize your experience
                  </p>
                </div>
              </div>
            </div>

            <div className="p-3">
              {/* Light Theme */}
              <button
                onClick={() => {
                  onThemeChange("light");
                  setShowThemeMenu(false);
                }}
                className={`w-full flex items-center gap-4 px-4 py-4 rounded-xl transition-all group ${
                  currentTheme === "light"
                    ? "bg-primary/10 border-2 border-primary"
                    : "hover:bg-accent/50 border-2 border-transparent"
                }`}
              >
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center transition-colors ${
                    currentTheme === "light"
                      ? "bg-primary/20"
                      : "bg-muted group-hover:bg-muted/80"
                  }`}
                >
                  <Sun
                    className={`w-5 h-5 ${
                      currentTheme === "light"
                        ? "text-primary"
                        : "text-muted-foreground"
                    }`}
                    strokeWidth={2.5}
                  />
                </div>
                <div className="flex-1 text-left">
                  <p
                    className={`text-sm font-medium ${
                      currentTheme === "light"
                        ? "text-primary"
                        : "text-popover-foreground"
                    }`}
                  >
                    Light
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Bright and clean interface
                  </p>
                </div>
                {currentTheme === "light" && (
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" strokeWidth={3} />
                  </div>
                )}
              </button>

              {/* Dark Theme */}
              <button
                onClick={() => {
                  onThemeChange("dark");
                  setShowThemeMenu(false);
                }}
                className={`w-full flex items-center gap-4 px-4 py-4 rounded-xl transition-all group mt-2 ${
                  currentTheme === "dark"
                    ? "bg-primary/10 border-2 border-primary"
                    : "hover:bg-accent/50 border-2 border-transparent"
                }`}
              >
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center transition-colors ${
                    currentTheme === "dark"
                      ? "bg-primary/20"
                      : "bg-muted group-hover:bg-muted/80"
                  }`}
                >
                  <Moon
                    className={`w-5 h-5 ${
                      currentTheme === "dark"
                        ? "text-primary"
                        : "text-muted-foreground"
                    }`}
                    strokeWidth={2.5}
                  />
                </div>
                <div className="flex-1 text-left">
                  <p
                    className={`text-sm font-medium ${
                      currentTheme === "dark"
                        ? "text-primary"
                        : "text-popover-foreground"
                    }`}
                  >
                    Dark
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Reduced eye strain at night
                  </p>
                </div>
                {currentTheme === "dark" && (
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" strokeWidth={3} />
                  </div>
                )}
              </button>
            </div>

            <div className="p-4 border-t border-border/50 bg-muted/30">
              <p className="text-xs text-muted-foreground text-center">
                Theme preference is saved automatically
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
