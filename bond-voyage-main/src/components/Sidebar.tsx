import {
  LayoutDashboard,
  Users,
  Calendar,
  CheckCircle,
  Archive,
  FileText,
  MessageSquare,
  MoreHorizontal,
  Bell,
  HelpCircle,
  X,
  ChevronRight,
  User,
  Star,
  Sun,
  Moon,
  Check,
  ArrowLeftRight,
  LogOut,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSide } from "./SideContext";
import SidebarSkeleton from "./SidebarSkeleton";
import { useProfile } from "./ProfileContext";
import bondVoyage from "../assets/BondVoyage Logo White (logo only).png";

interface SidebarProps {
  currentTheme: string;
  onThemeChange: (theme: string) => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
}

export function Sidebar({
  currentTheme,
  onThemeChange,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
}: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { switchSide } = useSide();
  const { profileData } = useProfile();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotificationMenu, setShowNotificationMenu] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [showSideMenu, setShowSideMenu] = useState(false);
  const [showSkeleton, setShowSkeleton] = useState<boolean>(true);

  useEffect(() => {
    setTimeout(() => {
      setShowSkeleton(false);
    }, 3000);
  }, [setShowSkeleton]);

  const menuItems = [
    { id: "/", icon: LayoutDashboard, label: "Home" },
    { id: "/users", icon: Users, label: "Users" },
    { id: "/itinerary", icon: FileText, label: "Itinerary" },
    { id: "/approvals", icon: CheckCircle, label: "Approvals", badge: true },
    { id: "/bookings", icon: Calendar, label: "Bookings" },
    { id: "/history", icon: Archive, label: "History" },
    { id: "/feedback", icon: MessageSquare, label: "Feedback" },
  ];

  // Refs for menu overlays
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notificationMenuRef = useRef<HTMLDivElement>(null);
  const themeMenuRef = useRef<HTMLDivElement>(null);
  const sideMenuRef = useRef<HTMLDivElement>(null);

  // Close menus when navigating or clicking outside
  const handleNavigate = (path: string) => {
    setShowUserMenu(false);
    setShowNotificationMenu(false);
    setShowThemeMenu(false);
    setShowSideMenu(false);
    setIsMobileMenuOpen(false);
    navigate(path);
  };

  // Handle side switch
  const handleSwitchToUser = () => {
    switchSide("user");
    setShowSideMenu(false);
    setIsMobileMenuOpen(false);
    navigate("/user/home");
  };

  // Handle logout
  const handleLogout = () => {
    navigate("/");
    setShowUserMenu(false);
    // You can add actual logout logic here
  };

  // Get initials from company name
  const getInitials = () => {
    if (!profileData) return null;

    if (profileData && profileData.profilePicture) return null;
    // Extract initials from company name (e.g., "4B's Travel and Tours" -> "4T")
    const words = profileData.companyName.split(" ");
    if (words.length >= 2) {
      return (words[0][0] + words[words.length - 1][0]).toUpperCase();
    }
    return profileData.companyName.substring(0, 2).toUpperCase();
  };

  // Mock notifications data
  const recentNotifications = [
    {
      id: 1,
      type: "booking",
      title: "New Booking Request",
      message: "Juan Dela Cruz requested a customized trip to Boracay",
      timestamp: "5 minutes ago",
      read: false,
    },
    {
      id: 2,
      type: "approval",
      title: "Booking Approved",
      message: "Your approval for booking #BV-2024-089 was processed",
      timestamp: "1 hour ago",
      read: false,
    },
    {
      id: 3,
      type: "feedback",
      title: "New Feedback Received",
      message: "Maria Santos left a 5-star review for El Nido trip",
      timestamp: "2 hours ago",
      read: true,
    },
  ];

  const unreadCount = recentNotifications.filter((n) => !n.read).length;

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
    };

    if (showUserMenu || showNotificationMenu || showThemeMenu || showSideMenu) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showUserMenu, showNotificationMenu, showThemeMenu, showSideMenu]);

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
        {showSkeleton && <SidebarSkeleton />}

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

          {/* Side Switch Menu Overlay */}
          {showSideMenu && (
            <div className="absolute left-20 top-0 ml-3 w-56 bg-card border border-border rounded-xl shadow-lg overflow-hidden z-50 animate-in fade-in slide-in-from-left-2 duration-200">
              <button
                onClick={handleSwitchToUser}
                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-accent transition-colors"
              >
                <ArrowLeftRight
                  className="w-5 h-5 text-primary"
                  strokeWidth={2}
                />
                <span className="text-sm text-card-foreground">
                  Switch to User Side
                </span>
              </button>
            </div>
          )}
        </div>

        {/* Navigation Menu Items */}
        <div className="flex flex-col items-center gap-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              location.pathname === item.id ||
              (item.id === "/itinerary" &&
                location.pathname.startsWith("/itinerary"));

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
                {item.badge && (
                  <div className="absolute top-2 right-2 w-2.5 h-2.5 bg-warning rounded-full border-2 border-sidebar" />
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom Section - Notification, User Avatar */}
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
              <div className="fixed bottom-3 left-24 w-96 max-w-[calc(100vw-6rem)] bg-card/80 backdrop-blur-xl rounded-2xl shadow-[0_8px_32px_rgba(10,122,255,0.12),0_2px_8px_rgba(0,0,0,0.08)] border border-border/50 z-[200] overflow-hidden">
                <div className="p-5 border-b border-border/50 bg-gradient-to-br from-primary/5 to-accent/5">
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

                <div className="max-h-[400px] overflow-y-auto">
                  {recentNotifications.map((notification) => (
                    <button
                      key={notification.id}
                      className="w-full p-4 hover:bg-accent/30 transition-colors border-b border-border/30 text-left"
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                            notification.read ? "bg-muted" : "bg-primary"
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
                            {notification.timestamp}
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
                      navigate("/notifications");
                    }}
                    className="w-full px-4 py-2 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary font-medium text-sm transition-colors text-center"
                  >
                    View All Notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Avatar */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-105 overflow-hidden"
            >
              {profileData && profileData.profilePicture ? (
                <img
                  src={profileData.profilePicture}
                  alt="Profile"
                  className="w-full h-full object-cover rounded-[0px]"
                />
              ) : (
                <span className="text-white text-lg font-semibold">
                  {getInitials()}
                </span>
              )}
            </button>

            {/* User Menu Overlay */}
            {showUserMenu && (
              <div className="fixed bottom-3 left-24 w-72 max-w-[calc(100vw-6rem)] bg-card/80 backdrop-blur-xl rounded-2xl shadow-[0_8px_32px_rgba(10,122,255,0.12),0_2px_8px_rgba(0,0,0,0.08)] border border-border/50 z-[200] overflow-hidden">
                <div className="p-5 border-b border-border/50 bg-gradient-to-br from-primary/5 to-accent/5">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-md overflow-hidden">
                      {profileData && profileData.profilePicture ? (
                        <img
                          src={profileData.profilePicture}
                          alt="Profile"
                          className="w-full h-full object-cover rounded-[0px]"
                        />
                      ) : (
                        <User className="w-7 h-7 text-white" strokeWidth={2} />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base text-popover-foreground">
                        {profileData.companyName}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {profileData.email}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-2">
                  <button
                    onClick={() => handleNavigate("/profile/edit")}
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
            className="fixed bottom-3 left-24 lg:left-[400px] w-80 max-w-[calc(100vw-6rem)] bg-card/80 backdrop-blur-xl rounded-2xl shadow-[0_8px_32px_rgba(10,122,255,0.12),0_2px_8px_rgba(0,0,0,0.08)] border border-border/50 z-[200] overflow-hidden"
          >
            <div className="p-5 border-b border-border/50 bg-gradient-to-br from-warning/5 to-warning/10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-warning to-warning/80 flex items-center justify-center shadow-md">
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
