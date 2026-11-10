import { MapPin, ArrowUpRight } from "lucide-react";

function ReportCard({
  title,
  location,
  date,
  status,
  priority,
}) {
  return (
    <div className="report-row">

      <div className="report-main">

        <div className="report-icon">
          <ArrowUpRight size={18} />
        </div>

        <div>
          <h3>{title}</h3>

          <div className="report-meta">
            <span>
              <MapPin size={13} />
              {location}
            </span>

            <span>•</span>

            <span>{date}</span>
          </div>
        </div>

      </div>

      <div className="report-right">

        <span
          className={`priority priority-${priority.toLowerCase()}`}
        >
          {priority}
        </span>

        <span
          className={`status status-${status
            .toLowerCase()
            .replace(" ", "-")}`}
        >
          {status}
        </span>

      </div>

    </div>
  );
}

export default ReportCard;