package com.site.expensetracker.repo;

import com.site.expensetracker.entity.Expense;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * Repository interface for Expense entity.
 * Demonstrates:
 * - Spring Data JPA for database operations
 * - Derived query methods (findByCategoryIgnoreCase)
 * - Custom JPQL queries with @Query
 * - Pagination support with Pageable
 * - Projection to DTOs (CategorySummary)
 */
@Repository
public interface ExpenseRepo extends JpaRepository<Expense, Long> {
    // 3. Custom native/JPQL search using parameter binding
    @Query("""
        SELECT e FROM Expense e
        WHERE (:category IS NULL OR LOWER(e.category) = LOWER(:category))
        AND (:searchTerm IS NULL OR LOWER(e.description) LIKE LOWER(CONCAT('%', :searchTerm, '%')))
    """)
    Page<Expense> searchExpenses(
            @Param("category") String category,
            @Param("searchTerm") String searchTerm,
            Pageable pageable
    );
}
