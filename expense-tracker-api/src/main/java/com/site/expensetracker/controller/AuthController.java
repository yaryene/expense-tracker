package com.site.expensetracker.controller;

import com.site.expensetracker.entity.User;
import com.site.expensetracker.repo.UserRepo;
import jakarta.annotation.PostConstruct;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

/**
 * REST Controller for user authentication (Register and Login).
 * Demonstrates:
 * - Direct constructor injection
 * - Database lookup and credential verification
 * - HTTP status codes: 200 OK, 201 Created, 400 Bad Request, 401 Unauthorized, 409 Conflict
 */
@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final UserRepo userRepo;

    public AuthController(UserRepo userRepo) {
        this.userRepo = userRepo;
    }

    @PostConstruct
    public void initDefaultUser() {
        if (userRepo.findByEmail("root").isEmpty()) {
            userRepo.save(new User("root", "root"));
        }
    }

    /**
     * Simple request record for authentication requests.
     */
    public record AuthRequest(String email, String password) {}

    /**
     * POST /api/v1/auth/register
     * Saves a new user to the database.
     */
    @PostMapping("/register")
    public ResponseEntity<Map<String, String>> register(@RequestBody AuthRequest request) {
        if (request == null || request.email() == null || request.email().trim().isEmpty()
                || request.password() == null || request.password().isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Email and password are required"));
        }

        String email = request.email().trim();

        if (userRepo.existsByEmail(email)) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("message", "User with this email already exists"));
        }

        User newUser = new User(email, request.password());
        userRepo.save(newUser);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of("message", "Registration Successful", "email", newUser.getEmail()));
    }

    /**
     * POST /api/v1/auth/login
     * Finds user by email and compares password credentials.
     */
    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> login(@RequestBody AuthRequest request) {
        if (request == null || request.email() == null || request.password() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Invalid Credentials"));
        }

        String email = request.email().trim();
        Optional<User> userOpt = userRepo.findByEmail(email);

        if (userOpt.isPresent() && userOpt.get().getPassword().equals(request.password())) {
            return ResponseEntity.ok(Map.of(
                    "message", "Login Successful",
                    "email", userOpt.get().getEmail()
            ));
        }

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("message", "Invalid Credentials"));
    }
}
