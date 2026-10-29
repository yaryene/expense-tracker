package com.site.expensetracker.dto;

import com.site.expensetracker.entity.Expense;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ExpenseResponse {
        private Long id;
        private String description;
        private BigDecimal amount;
        private String category;
        private LocalDate date;

        public static ExpenseResponse from(Expense expense) {
                ExpenseResponse response = new ExpenseResponse();
                response.setId(expense.getId());
                response.setDescription(expense.getDescription());
                response.setAmount(expense.getAmount());
                response.setCategory(expense.getCategory());
                response.setDate(expense.getDate());
                return response;
        }
}
