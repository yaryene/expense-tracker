package com.site.expensetracker.service;

import com.site.expensetracker.dto.ExpenseResponse;
import com.site.expensetracker.dto.PagedResponse;
import com.site.expensetracker.entity.Expense;
import com.site.expensetracker.repo.ExpenseRepo;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
@Service
public class ExpenseService {
    private final ExpenseRepo expenseRepo;

    public ExpenseService(ExpenseRepo expenseRepo) {
        this.expenseRepo = expenseRepo;
    }

    public Expense recordExpense(Expense expense) {
        if(expense.getAmount() == null || expense.getAmount().compareTo(BigDecimal.ZERO) <= 0){
            throw new IllegalArgumentException("Amount must be positive");
        }
        return expenseRepo.save(expense);
    }

    public ExpenseResponse getExpenseById(Long id) {
        Expense expense = expenseRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Expense not found with ID: " + id));
        return ExpenseResponse.from(expense);
    }
    public void deleteExpense(Long id) {
        expenseRepo.deleteById(id);
    }

    public PagedResponse<ExpenseResponse> searchExpenses(String category, String query, Pageable pageable) {
        Page<Expense> page = expenseRepo.searchExpenses(category, query, pageable);
        Page<ExpenseResponse> responsePage = page.map(ExpenseResponse::from);
        return PagedResponse.from(responsePage);
    }
}
