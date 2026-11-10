package campuscare_backend.controller;

import campuscare_backend.dto.ReportResponse;
import campuscare_backend.service.MaintenanceReportService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/reports")
@CrossOrigin(origins = "http://localhost:5173")
public class AdminReportController {

    private final MaintenanceReportService reportService;

    public AdminReportController(
            MaintenanceReportService reportService) {
        this.reportService = reportService;
    }

    // Get all student reports
    @GetMapping
    public ResponseEntity<List<ReportResponse>> getAllReports() {

        List<ReportResponse> reports = reportService
                .getAllReports()
                .stream()
                .map(ReportResponse::new)
                .toList();

        return ResponseEntity.ok(reports);
    }

    // Update report status
    @PutMapping("/{id}/status")
    public ResponseEntity<ReportResponse> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {

        var report = reportService.updateReportStatus(
                id, request.get("status"));

        return ResponseEntity.ok(new ReportResponse(report));
    }

// Get admin analytics
@GetMapping("/analytics")
public ResponseEntity<Map<String, Object>> getAnalytics() {

    Map<String, Object> analytics =
            reportService.getAdminAnalytics();

    return ResponseEntity.ok(analytics);
}
}