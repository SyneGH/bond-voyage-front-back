const SidebarSkeleton = () => {
  return (
    <div
      className="h-screen absolute bg-white opacity-50 w-full z-50"
      style={{
        backdropFilter: "blur(10px)",
        backgroundColor: "rgba(255, 255, 255, 0.1)",
        borderRadius: "12px",
        padding: "20px",
        border: "1px solid rgba(255, 255, 255, 0.2)",
      }}
    ></div>
  );
};

export default SidebarSkeleton;
