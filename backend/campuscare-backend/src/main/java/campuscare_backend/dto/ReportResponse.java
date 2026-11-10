
package campuscare_backend.dto;

import campuscare_backend.entity.MaintenanceReport;
import campuscare_backend.entity.User;
import java.time.LocalDateTime;

public class ReportResponse {
private String imagePath;
    private Long id;
    private String title;
    private String description;
    private String category;
    private String location;
    private String priority;
    private String status;
    private LocalDateTime createdAt;

    // GPS coordinates
    private Double latitude;
    private Double longitude;

    // Report submitter details
    private String submittedBy;
    private String submitterUsn;
    private String submitterRole;

    public ReportResponse(MaintenanceReport report) {
        this.id = report.getId();
        this.title = report.getTitle();
        this.description = report.getDescription();
        this.category = report.getCategory();
        this.location = report.getLocation();
        this.priority = report.getPriority();
        this.status = report.getStatus();
        this.createdAt = report.getCreatedAt();
        this.imagePath = report.getImagePath();
        this.latitude = report.getLatitude();
        this.longitude = report.getLongitude();

        User user = report.getUser();

        if (user != null) {
            this.submittedBy = user.getFullName();
            this.submitterUsn = user.getUsn();
            this.submitterRole = user.getRole();
        }
    }

    public Long getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public String getDescription() {
        return description;
    }

    public String getCategory() {
        return category;
    }

    public String getLocation() {
        return location;
    }

    public String getPriority() {
        return priority;
    }

    public String getStatus() {
        return status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public Double getLatitude() {
        return latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public String getSubmittedBy() {
        return submittedBy;
    }

    public String getSubmitterUsn() {
        return submitterUsn;
    }

    public String getSubmitterRole() {
        return submitterRole;
    }
    public String getImagePath() {
    return imagePath;
    }
}
