function StatCard({
  title,
  value,
  description,
  icon,
  className = "",
}) {
  return (
    <div className={`stat-card ${className}`}>

      <div className="stat-top">

        <div className="stat-icon">
          {icon}
        </div>

      </div>

      <div className="stat-value">
        {value}
      </div>

      <div className="stat-title">
        {title}
      </div>

      <p className="stat-description">
        {description}
      </p>

    </div>
  );
}

export default StatCard;