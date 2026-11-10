
package campuscare_backend.repository;

import campuscare_backend.entity.MaintenanceReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface MaintenanceReportRepository
        extends JpaRepository<MaintenanceReport, Long> {

    List<MaintenanceReport> findByUserIdOrderByCreatedAtDesc(Long userId);

    long countByUserId(Long userId);

    long countByUserIdAndStatus(Long userId, String status);

    List<MaintenanceReport> findAllByOrderByCreatedAtDesc();

    // Analytics: Reports grouped by category
    @Query("""
        SELECT r.category, COUNT(r)
        FROM MaintenanceReport r
        GROUP BY r.category
        ORDER BY COUNT(r) DESC
    """)
    List<Object[]> countReportsByCategory();

    // Analytics: Reports grouped by status
    @Query("""
        SELECT r.status, COUNT(r)
        FROM MaintenanceReport r
        GROUP BY r.status
    """)
    List<Object[]> countReportsByStatus();

    // Analytics: Reports grouped by priority
    @Query("""
        SELECT r.priority, COUNT(r)
        FROM MaintenanceReport r
        GROUP BY r.priority
    """)
    List<Object[]> countReportsByPriority();

    // Analytics: Monthly report submissions
    @Query(value = """
        SELECT TO_CHAR(created_at, 'YYYY-MM') AS month,
               COUNT(*) AS total
        FROM maintenance_reports
        GROUP BY TO_CHAR(created_at, 'YYYY-MM')
        ORDER BY month
    """, nativeQuery = true)
    List<Object[]> countReportsByMonth();
}
