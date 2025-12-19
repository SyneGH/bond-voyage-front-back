import { ChevronRight, Menu, X } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { BreadcrumbItem } from "./BreadcrumbContext";

interface TopNavProps {
  pageTitle: string;
  pageSubtitle: string;
  breadcrumbs: BreadcrumbItem[];
  isMobileMenuOpen?: boolean;
  onMobileMenuToggle?: () => void;
}

export function TopNav({ pageTitle, pageSubtitle, breadcrumbs, isMobileMenuOpen, onMobileMenuToggle }: TopNavProps) {
  const navigate = useNavigate();
  const location = useLocation();

  // Hide the TopNav on desktop for both admin and user dashboard overview
  const isDashboardOverview = location.pathname === "/" || location.pathname === "/user/home";

  return (
    <div className={`${isDashboardOverview ? 'lg:hidden' : ''} bg-card border-b border-border shadow-[0_1px_3px_rgba(0,0,0,0.08)] z-30 px-4 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6`}>
      <div className="flex items-start gap-4">
        {/* Mobile Menu Button */}
        {onMobileMenuToggle && (
          <button
            onClick={onMobileMenuToggle}
            className="lg:hidden flex-shrink-0 w-10 h-10 rounded-xl bg-sidebar border border-sidebar-border shadow-md flex items-center justify-center hover:bg-sidebar-accent transition-colors"
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5 text-sidebar-foreground" strokeWidth={2.5} />
            ) : (
              <Menu className="w-5 h-5 text-sidebar-foreground" strokeWidth={2.5} />
            )}
          </button>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm mb-2 overflow-x-auto">
            {breadcrumbs.map((crumb, index) => (
              <div key={index} className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                {crumb.path && index !== breadcrumbs.length - 1 ? (
                  <button
                    onClick={() => navigate(crumb.path!)}
                    className="text-muted-foreground hover:text-primary transition-colors cursor-pointer hover:underline"
                  >
                    {crumb.label}
                  </button>
                ) : (
                  <span className={index === breadcrumbs.length - 1 ? "text-primary" : "text-muted-foreground"}>
                    {crumb.label}
                  </span>
                )}
                {index < breadcrumbs.length - 1 && (
                  <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
                )}
              </div>
            ))}
          </div>
          
          {/* Page Title */}
          <h1 className="text-xl sm:text-2xl text-card-foreground leading-tight">
            {pageTitle}
          </h1>
          
          {/* Page Subtitle */}
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            {pageSubtitle}
          </p>
        </div>
      </div>
    </div>
  );
}