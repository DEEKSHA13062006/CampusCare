
package campuscare_backend.service;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.Map;
import campuscare_backend.dto.ReportRequest;
import campuscare_backend.entity.MaintenanceReport;
import campuscare_backend.entity.User;
import campuscare_backend.repository.MaintenanceReportRepository;
import campuscare_backend.repository.UserRepository;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MaintenanceReportService {

    private final MaintenanceReportRepository reportRepository;
    private final UserRepository userRepository;

    public MaintenanceReportService(
            MaintenanceReportRepository reportRepository,
            UserRepository userRepository) {
        this.reportRepository = reportRepository;
        this.userRepository = userRepository;
    }

    // Submit a new maintenance report
    public MaintenanceReport createReport(
            ReportRequest request, String email) {

        User user = findUser(email);

        MaintenanceReport report = new MaintenanceReport();

        report.setTitle(request.getTitle());
        report.setDescription(request.getDescription());
        report.setCategory(request.getCategory());
        report.setLocation(request.getLocation());
        report.setPriority(request.getPriority());

        // Save GPS coordinates when available
        report.setLatitude(request.getLatitude());
        report.setLongitude(request.getLongitude());

        report.setImagePath(request.getImagePath());

        report.setStatus("PENDING");
        report.setUser(user);

        return reportRepository.save(report);
    }

    // Student: Get own reports
    public List<MaintenanceReport> getMyReports(String email) {
        User user = findUser(email);

        return reportRepository.findByUserIdOrderByCreatedAtDesc(
                user.getId());
    }

    // Student dashboard statistics
    public long getTotalReports(String email) {
        return reportRepository.countByUserId(findUser(email).getId());
    }

    public long getPendingReports(String email) {
        return reportRepository.countByUserIdAndStatus(
                findUser(email).getId(), "PENDING");
    }

    public long getInProgressReports(String email) {
        return reportRepository.countByUserIdAndStatus(
                findUser(email).getId(), "IN_PROGRESS");
    }

    public long getResolvedReports(String email) {
        return reportRepository.countByUserIdAndStatus(
                findUser(email).getId(), "RESOLVED");
    }

    // STAFF: Get all student reports
    public List<MaintenanceReport> getAllReports() {
        return reportRepository.findAllByOrderByCreatedAtDesc();
    }

    // STAFF: Update report status
    public MaintenanceReport updateReportStatus(
            Long reportId, String status) {

        if (!List.of("PENDING", "IN_PROGRESS", "RESOLVED")
                .contains(status)) {
            throw new IllegalArgumentException("Invalid report status");
        }

        MaintenanceReport report = reportRepository.findById(reportId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Report not found"));

        report.setStatus(status);

        return reportRepository.save(report);
    }

    private User findUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new IllegalArgumentException("User not found"));
    }
// Admin analytics
public Map<String, Object> getAdminAnalytics() {

    Map<String, Object> analytics = new LinkedHashMap<>();

    analytics.put("totalReports", reportRepository.count());
    analytics.put("categoryStats", convertStats(
            reportRepository.countReportsByCategory()));
    analytics.put("statusStats", convertStats(
            reportRepository.countReportsByStatus()));
    analytics.put("priorityStats", convertStats(
            reportRepository.countReportsByPriority()));
    analytics.put("monthlyStats", convertStats(
            reportRepository.countReportsByMonth()));

    return analytics;
}

private List<Map<String, Object>> convertStats(
        List<Object[]> results) {

    List<Map<String, Object>> stats = new ArrayList<>();

    for (Object[] row : results) {
        Map<String, Object> item = new LinkedHashMap<>();

        item.put("label", row[0]);
        item.put("count", ((Number) row[1]).longValue());

        stats.add(item);
    }

    return stats;
}
}
