export function transformActivityLogs(logs: any) {
  if (!logs || !Array.isArray(logs)) return [];

  return logs.map((log) => {
    let icon = "check";

    // Determine icon based on action type
    const action = log.action.toLowerCase();
    if (action.includes("created") || action.includes("confirmed")) {
      icon = "check";
    } else if (action.includes("updated") || action.includes("profile")) {
      icon = "user";
    } else if (action.includes("cancelled") || action.includes("deleted")) {
      icon = "cancel";
    } else if (action.includes("payment") || action.includes("paid")) {
      icon = "payment";
    } else if (action.includes("itinerary") || action.includes("destination")) {
      icon = "itinerary";
    } else if (action.includes("pending") || action.includes("waiting")) {
      icon = "clock";
    }

    // Format the display text
    const userName = `${log.user.firstName} ${log.user.lastName}`;
    const timeAgo = formatTimeAgo(log.timestamp);

    return {
      id: log.id,
      icon: icon,
      text: log.details,
      userName: userName,
      timestamp: log.timestamp,
      timeAgo: timeAgo,
      action: log.action,
    };
  });
}

function formatTimeAgo(timestamp: any) {
  const now = new Date();
  const past = new Date(timestamp);
  const diffMs = now - past;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return `${Math.floor(diffDays / 30)}mo ago`;
}
