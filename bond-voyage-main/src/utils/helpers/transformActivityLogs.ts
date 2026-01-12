import { ActivityLog } from "../../types/types";

interface RecentActivity {
  id: string;
  text: string;
  icon: string;
}

export const transformActivityLogs = (
  logs: ActivityLog[]
): RecentActivity[] => {
  if (!logs || logs.length === 0) {
    return getDefaultActivities();
  }

  const activities: RecentActivity[] = [];

  logs.forEach((log) => {
    let icon = "default";
    let text = "";

    switch (log.action) {
      case "SEED":
        icon = "seed";
        text = `System: ${log.details}`;
        break;
      case "LOGIN":
        icon = "login";
        text = `${log.user.firstName} ${log.user.lastName} logged in`;
        break;
      case "LOGOUT":
        icon = "logout";
        text = `${log.user.firstName} ${log.user.lastName} logged out`;
        break;
      case "CREATE_BOOKING":
        icon = "booking";
        text = `${log.user.firstName} created a new booking`;
        break;
      case "UPDATE_BOOKING":
        icon = "edit";
        text = `${log.user.firstName} updated booking ${log.details}`;
        break;
      case "CANCEL_BOOKING":
        icon = "cancel";
        text = `${log.user.firstName} cancelled booking ${log.details}`;
        break;
      case "COMPLETE_BOOKING":
        icon = "check";
        text = `${log.user.firstName} completed booking ${log.details}`;
        break;
      case "CREATE_USER":
        icon = "user";
        text = `${log.user.firstName} created a new user account`;
        break;
      case "UPDATE_USER":
        icon = "user-edit";
        text = `${log.user.firstName} updated user profile`;
        break;
      case "CREATE_ITINERARY":
        icon = "itinerary";
        text = `${log.user.firstName} created new itinerary`;
        break;
      case "APPROVE_BOOKING":
        icon = "approve";
        text = `${log.user.firstName} approved booking ${log.details}`;
        break;
      case "REJECT_BOOKING":
        icon = "reject";
        text = `${log.user.firstName} rejected booking ${log.details}`;
        break;
      default:
        icon = "default";
        text = `${log.user.firstName}: ${log.action} - ${log.details}`;
    }

    activities.push({
      id: log.id,
      text: text,
      icon: icon,
    });
  });

  return ensureMinimumActivities(activities, 4);
};

export const ensureMinimumActivities = (
  activities: RecentActivity[],
  minCount: number
): RecentActivity[] => {
  if (activities.length >= minCount) {
    return activities.slice(0, minCount);
  }

  const defaultActivities = getDefaultActivities();
  const additionalNeeded = minCount - activities.length;

  return [...activities, ...defaultActivities.slice(0, additionalNeeded)];
};

export const getDefaultActivities = (): RecentActivity[] => {
  return [
    {
      id: "default-1",
      text: "System initialized successfully",
      icon: "system",
    },
    {
      id: "default-2",
      text: "Welcome to BondVoyage Dashboard",
      icon: "welcome",
    },
    {
      id: "default-3",
      text: "No recent activities",
      icon: "info",
    },
    {
      id: "default-4",
      text: "Check back later for updates",
      icon: "clock",
    },
  ];
};
