package campuscare_backend.controller;

import campuscare_backend.dto.ReportRequest;
import campuscare_backend.dto.ReportResponse;
import campuscare_backend.entity.MaintenanceReport;
import campuscare_backend.service.MaintenanceReportService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = "http://localhost:5173")
public class MaintenanceReportController {

    private final MaintenanceReportService reportService;

    public MaintenanceReportController(
            MaintenanceReportService reportService) {
        this.reportService = reportService;
    }

    // Submit a report
    @PostMapping
    public ResponseEntity<ReportResponse> createReport(
            @Valid @RequestBody ReportRequest request,
            Authentication authentication) {

        MaintenanceReport report = reportService.createReport(
                request, authentication.getName());

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ReportResponse(report));
    }

    // Get logged-in student's reports
    @GetMapping("/my")
    public ResponseEntity<List<ReportResponse>> getMyReports(
            Authentication authentication) {

        List<ReportResponse> reports = reportService
                .getMyReports(authentication.getName())
                .stream()
                .map(ReportResponse::new)
                .toList();

        return ResponseEntity.ok(reports);
    }

    // Get actual dashboard statistics
    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Long>> getDashboardStats(
            Authentication authentication) {

        String email = authentication.getName();

        Map<String, Long> stats = Map.of(
                "total", reportService.getTotalReports(email),
                "pending", reportService.getPendingReports(email),
                "inProgress", reportService.getInProgressReports(email),
                "resolved", reportService.getResolvedReports(email)
        );

        return ResponseEntity.ok(stats);
    }
}