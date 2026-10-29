# Expense Tracker API

Backend RESTful service built with **Spring Boot 3**, **Spring Data JPA**, and **MySQL**.

## Tech Stack
- **Java**: 21
- **Framework**: Spring Boot 3 (Web MVC, Validation, Data JPA)
- **Database**: MySQL 8.x
- **Build Tool**: Maven (`./mvnw`)
- **Port**: `8084`

## Configuration
Database settings in `src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/expensedb
spring.datasource.username=root
spring.datasource.password=root1234
server.port=8084
```

## Running Locally
```bash
./mvnw spring-boot:run
```

## Running Tests
```bash
./mvnw test
```

## Packaging
```bash
./mvnw clean package -DskipTests
java -jar target/xpense-tracker-api-0.0.1-SNAPSHOT.jar
```
