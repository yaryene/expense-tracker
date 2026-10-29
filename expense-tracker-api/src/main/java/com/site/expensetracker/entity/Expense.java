package com.site.expensetracker.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * JPA Entity representing an expense in the database.
 * Demonstrates:
 * - JPA annotations for ORM mapping (@Entity, @Table, @Column)
 * - Lombok for reducing boilerplate code (@Data, @NoArgsConstructor)
 * - Primary key generation strategy (@GeneratedValue)
 * - Column constraints (nullable, length, precision)
 */
@Entity
@Data
@ToString
@NoArgsConstructor
@Table(name = "expenses")
public class Expense {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String description;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @Column(nullable = false, length = 50)
    private String category;

    @Column(nullable = false)
    private LocalDate date;

    public Expense(String description, BigDecimal amount, String category, LocalDate date) {
        this.description = description;
        this.amount = amount;
        this.category = category;
        this.date = date;
    }
}
