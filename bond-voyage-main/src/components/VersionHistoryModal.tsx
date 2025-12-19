import { ScrollArea } from "./ui/scroll-area";
import { History, RotateCcw, ChevronRight, MapPin, Calendar, Clock } from "lucide-react";

interface Activity {
  id: string;
  time: string;
  icon: string;
  title: string;
  description: string;
  location: string;
}

interface Day {
  id: string;
  day: number;
  title: string;
  activities: Activity[];
}

interface BookingFormData {
  destination: string;
  travelDateFrom: string;
  travelDateTo: string;
  travelers: string;
  totalAmount: string;
}

interface Version {
  id: string;
  timestamp: number;
  author: string;
  bookingData: BookingFormData;
  itineraryDays: Day[];
  label?: string;
}

interface VersionHistoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  versions: Version[];
  selectedVersionId: string | null;
  setSelectedVersionId: (id: string | null) => void;
  currentUser: string;
  currentBookingData: BookingFormData;
  currentItineraryDays: Day[];
  onRestoreVersion: (version: Version) => void;
  getChangesSummary: (version: Version, previousVersion: Version | null) => string[];
  getIconComponent: (iconName: string) => any;
  convertTo12Hour: (time24h: string) => string;
}

export function VersionHistoryModal({
  open,
  onOpenChange,
  versions,
  selectedVersionId,
  setSelectedVersionId,
  currentUser,
  currentBookingData,
  currentItineraryDays,
  onRestoreVersion,
  getChangesSummary,
  getIconComponent,
  convertTo12Hour,
}: VersionHistoryModalProps) {
  if (!open) return null;

  const displayData = selectedVersionId 
    ? versions.find(v => v.id === selectedVersionId) 
    : { bookingData: currentBookingData, itineraryDays: currentItineraryDays };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-white/50 backdrop-blur"
        onClick={() => onOpenChange(false)}
      />
      
      {/* Modal */}
      <div className="relative w-[98vw] max-w-[1800px] h-[92vh] bg-background rounded-2xl shadow-2xl border-2 border-border overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-8 py-6 border-b border-border bg-muted/30 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#8B5CF6] to-[#A78BFA] flex items-center justify-center shadow-lg shadow-[#8B5CF6]/20">
                <History className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-card-foreground">Version History</h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Browse and restore previous versions of your booking
                </p>
              </div>
            </div>
            <button
              onClick={() => onOpenChange(false)}
              className="w-10 h-10 rounded-xl hover:bg-muted flex items-center justify-center transition-colors group"
            >
              <svg className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-1 min-h-0">
          {/* Left Sidebar - Version Timeline */}
          <div className="w-[380px] border-r border-border bg-muted/20 flex flex-col shrink-0">
            <div className="p-6 border-b border-border shrink-0">
              <h3 className="font-semibold text-card-foreground mb-1 text-[19px]">Timeline</h3>
              <p className="text-xs text-muted-foreground text-[14px]">
                {versions.length} {versions.length === 1 ? 'version' : 'versions'} saved
              </p>
            </div>

            <ScrollArea className="flex-1 p-4 overflow-auto">
              <div className="space-y-3">
                {/* Current Version */}
                <button
                  onClick={() => setSelectedVersionId(null)}
                  className={`w-full p-5 rounded-xl text-left transition-all ${
                    selectedVersionId === null
                      ? "bg-primary text-primary-foreground shadow-lg scale-[1.02]"
                      : "bg-card hover:bg-accent border-2 border-border hover:border-primary/30"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-semibold">Current Version</span>
                    <span className="px-2.5 py-1 bg-green-500/20 text-green-600 dark:text-green-400 text-xs font-medium rounded-full">
                      Latest
                    </span>
                  </div>
                  <div className="text-xs opacity-70 font-medium">
                    {new Date().toLocaleString('en-US', { 
                      month: 'short', 
                      day: 'numeric', 
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                  <div className="text-xs opacity-70 mt-1.5 flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-[10px] font-semibold">{currentUser.charAt(0)}</span>
                    </div>
                    By {currentUser}
                  </div>
                </button>

                {/* Previous Versions */}
                {versions.length === 0 ? (
                  <div className="text-center py-12 px-4">
                    <History className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-20" />
                    <p className="text-sm text-muted-foreground font-medium">
                      No previous versions yet
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Versions are saved automatically when you save changes
                    </p>
                  </div>
                ) : (
                  [...versions].reverse().map((version, index) => {
                    const previousVersion = index < versions.length - 1 ? versions[versions.length - 2 - index] : null;
                    const changes = getChangesSummary(version, previousVersion);
                    
                    return (
                      <button
                        key={version.id}
                        onClick={() => setSelectedVersionId(version.id)}
                        className={`w-full p-5 rounded-xl text-left transition-all ${
                          selectedVersionId === version.id
                            ? "bg-primary text-primary-foreground shadow-lg scale-[1.02]"
                            : "bg-card hover:bg-accent border-2 border-border hover:border-primary/30"
                        }`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold mb-1.5">
                              {version.label || `Version ${versions.length - index}`}
                            </div>
                            <div className="text-xs opacity-70 font-medium">
                              {new Date(version.timestamp).toLocaleString('en-US', { 
                                month: 'short', 
                                day: 'numeric', 
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                            <div className="text-xs opacity-70 mt-1.5 flex items-center gap-1.5">
                              <div className="w-5 h-5 rounded-full bg-current/20 flex items-center justify-center">
                                <span className="text-[10px] font-semibold">{version.author.charAt(0)}</span>
                              </div>
                              By {version.author}
                            </div>
                          </div>
                          <ChevronRight className={`w-4 h-4 transition-transform shrink-0 ml-2 ${
                            selectedVersionId === version.id ? "rotate-90" : ""
                          }`} />
                        </div>
                        <div className="mt-3 pt-3 border-t border-current/10 space-y-1.5">
                          {changes.slice(0, 3).map((change, i) => (
                            <div key={i} className="text-xs opacity-70 flex items-start gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-current mt-1.5 shrink-0" />
                              <span className="flex-1">{change}</span>
                            </div>
                          ))}
                          {changes.length > 3 && (
                            <div className="text-xs opacity-70 font-medium pl-3.5">
                              +{changes.length - 3} more {changes.length - 3 === 1 ? 'change' : 'changes'}
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Right Content - Version Preview */}
          <div className="flex-1 flex flex-col min-w-0 overflow-auto">
            <div className="px-8 py-6 border-b border-border flex items-center justify-between shrink-0 bg-muted/10">
              <div>
                <h3 className="text-lg font-semibold text-card-foreground">
                  {selectedVersionId ? "Version Preview" : "Current Version"}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {selectedVersionId 
                    ? `Viewing version from ${new Date(versions.find(v => v.id === selectedVersionId)?.timestamp || 0).toLocaleString()}`
                    : "This is your current working version with unsaved changes"
                  }
                </p>
              </div>
              {selectedVersionId && (
                <button
                  onClick={() => {
                    const version = versions.find(v => v.id === selectedVersionId);
                    if (version) onRestoreVersion(version);
                  }}
                  className="h-11 px-8 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#A78BFA] hover:from-[#7C3AED] hover:to-[#9333EA] text-white flex items-center gap-2.5 font-semibold shadow-lg shadow-[#8B5CF6]/30 transition-all hover:scale-105"
                >
                  <RotateCcw className="w-4 h-4" />
                  Restore This Version
                </button>
              )}
            </div>

            <ScrollArea className="flex-1 p-8">
              {displayData && (
                <div className="space-y-8 max-w-5xl">
                  {/* Travel Information */}
                  <div className="p-8 rounded-2xl border-2 border-border bg-gradient-to-br from-[rgba(10,122,255,0.03)] to-[rgba(20,184,166,0.03)]">
                    <h4 className="text-base font-semibold text-card-foreground mb-6 flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#14B8A6] to-[#10B981] flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-white" />
                      </div>
                      Travel Information
                    </h4>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Destination</span>
                        <p className="text-base text-card-foreground font-semibold">
                          {displayData.bookingData.destination || "N/A"}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Travelers</span>
                        <p className="text-base text-card-foreground font-semibold">
                          {displayData.bookingData.travelers || "1"} {parseInt(displayData.bookingData.travelers || "1") === 1 ? 'person' : 'people'}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Travel Dates</span>
                        <p className="text-base text-card-foreground font-semibold">
                          {displayData.bookingData.travelDateFrom && displayData.bookingData.travelDateTo 
                            ? `${new Date(displayData.bookingData.travelDateFrom).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} - ${new Date(displayData.bookingData.travelDateTo).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
                            : "N/A"}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Budget</span>
                        <p className="text-base text-card-foreground font-semibold">
                          {displayData.bookingData.totalAmount 
                            ? `₱${parseFloat(displayData.bookingData.totalAmount).toLocaleString()}` 
                            : "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Itinerary Details */}
                  <div>
                    <h4 className="text-base font-semibold text-card-foreground mb-5 flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0A7AFF] to-[#14B8A6] flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-white" />
                      </div>
                      Itinerary Details
                      <span className="ml-2 px-3 py-1 bg-muted text-muted-foreground text-xs font-semibold rounded-full">
                        {displayData.itineraryDays.length} {displayData.itineraryDays.length === 1 ? 'Day' : 'Days'}
                      </span>
                    </h4>
                    <div className="space-y-5">
                      {displayData.itineraryDays.map((day) => (
                        <div key={day.id} className="p-7 rounded-2xl border-2 border-border bg-card shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex items-center gap-4 mb-5 pb-5 border-b border-border">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#0A7AFF] to-[#14B8A6] flex items-center justify-center shadow-lg shadow-primary/20">
                              <span className="text-white font-bold">D{day.day}</span>
                            </div>
                            <div className="flex-1">
                              <h5 className="text-sm font-medium text-muted-foreground">Day {day.day}</h5>
                              <p className="text-base font-semibold text-card-foreground mt-0.5">{day.title || "Untitled Day"}</p>
                            </div>
                          </div>
                          <div className="space-y-5 pl-6 border-l-2 border-primary/20 ml-6">
                            {day.activities.length === 0 ? (
                              <div className="text-center py-8">
                                <p className="text-sm text-muted-foreground italic">No activities added for this day yet</p>
                              </div>
                            ) : (
                              day.activities.map((activity) => {
                                const IconComponent = getIconComponent(activity.icon);
                                return (
                                  <div key={activity.id} className="flex items-start gap-4 pb-5 border-b border-border last:border-0 last:pb-0">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[rgba(10,122,255,0.15)] to-[rgba(20,184,166,0.15)] flex items-center justify-center flex-shrink-0 mt-1">
                                      <IconComponent className="w-5 h-5 text-primary" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-3 mb-2">
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-lg">
                                          <Clock className="w-3.5 h-3.5" />
                                          {activity.time ? convertTo12Hour(activity.time) : "No time set"}
                                        </span>
                                        <span className="font-semibold text-card-foreground">
                                          {activity.title || "Untitled Activity"}
                                        </span>
                                      </div>
                                      {activity.description && (
                                        <p className="text-sm text-muted-foreground mb-2 leading-relaxed">
                                          {activity.description}
                                        </p>
                                      )}
                                      {activity.location && (
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-lg w-fit">
                                          <MapPin className="w-3.5 h-3.5" />
                                          {activity.location}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                );
                              })
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  );
}
