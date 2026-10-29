package com.site.expensetracker.controller;

import com.site.expensetracker.dto.CreateExpenseRequest;
import com.site.expensetracker.dto.ExpenseResponse;
import com.site.expensetracker.dto.PagedResponse;
import com.site.expensetracker.entity.Expense;
import com.site.expensetracker.service.ExpenseService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.data.web.SortDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.time.LocalDate;

/**
 * REST Controller for Expense CRUD operations.
 * Demonstrates:
 * - RESTful API design with proper HTTP methods (GET, POST, PUT, DELETE)
 * - Request validation using @Valid
 * - Pagination and sorting with Spring Data
 * - DTO pattern for request/response objects
 * - Proper HTTP status codes and response headers
 */
@RestController
@RequestMapping("/api/v1/expenses")
public class ExpenseController {
    private final ExpenseService expenseService;

    public ExpenseController(ExpenseService camelCaseExpenseService) {
        this.expenseService = camelCaseExpenseService;
    }

    @PostMapping
    public ResponseEntity<ExpenseResponse> createExpense(@Valid @RequestBody CreateExpenseRequest req){
        Expense newExpense = new Expense(
                req.getDescription(),
                req.getAmount(),
                req.getCategory(),
                req.getDate() != null ? req.getDate() : LocalDate.now()
        );
        Expense saved = expenseService.recordExpense(newExpense);
        URI location = URI.create("/api/v1/expenses/" + saved.getId());
        return ResponseEntity.created(location).body(ExpenseResponse.from(saved));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ExpenseResponse> getExpenseById(@PathVariable Long id) {
        return ResponseEntity.ok(expenseService.getExpenseById(id));
    }


    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteExpense(@PathVariable Long id) {
        expenseService.deleteExpense(id);
        return ResponseEntity.noContent().build(); // HTTP 204 No Content
    }

    @GetMapping
    public ResponseEntity<PagedResponse<ExpenseResponse>> getExpenses(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search,
            @PageableDefault(page = 0, size = 10)
            @SortDefault(sort = "date", direction = Sort.Direction.DESC) Pageable pageable) {

        PagedResponse<ExpenseResponse> response = expenseService.searchExpenses(category, search, pageable);
        return ResponseEntity.ok(response);
    }
}
