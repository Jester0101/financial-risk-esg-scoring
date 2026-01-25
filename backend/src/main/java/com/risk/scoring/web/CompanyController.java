package com.risk.scoring.web;

import com.risk.scoring.model.Assessment;
import com.risk.scoring.model.Company;
import com.risk.scoring.service.CompanyService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/companies")
@CrossOrigin(origins = "*")
public class CompanyController {

    private final CompanyService companyService;

    public CompanyController(CompanyService companyService) {
        this.companyService = companyService;
    }

    @PostMapping
    public ResponseEntity<?> createCompany(@RequestBody Company company) {
        try {
            Company created = companyService.createCompany(company);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to create company: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @GetMapping
    public ResponseEntity<List<Company>> getAllCompanies() {
        return ResponseEntity.ok(companyService.getAllCompanies());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getCompany(@PathVariable String id) {
        Optional<Company> company = companyService.getCompany(id);
        if (company.isPresent()) {
            return ResponseEntity.ok(company.get());
        }
        Map<String, String> error = new HashMap<>();
        error.put("error", "Company not found: " + id);
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateCompany(@PathVariable String id, @RequestBody Company company) {
        try {
            Company updated = companyService.updateCompany(id, company);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to update company: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCompany(@PathVariable String id) {
        boolean deleted = companyService.deleteCompany(id);
        if (deleted) {
            return ResponseEntity.noContent().build();
        }
        Map<String, String> error = new HashMap<>();
        error.put("error", "Company not found: " + id);
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }

    @GetMapping("/{id}/assessments")
    public ResponseEntity<List<Assessment>> getCompanyAssessments(@PathVariable String id) {
        List<Assessment> assessments = companyService.getAssessmentsByCompany(id);
        return ResponseEntity.ok(assessments);
    }

    @PostMapping("/assessments")
    public ResponseEntity<?> createAssessment(@RequestBody Assessment assessment) {
        try {
            Assessment created = companyService.createAssessment(assessment);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to create assessment: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @GetMapping("/assessments")
    public ResponseEntity<List<Assessment>> getAllAssessments(
            @RequestParam(required = false) Integer limit) {
        List<Assessment> assessments;
        if (limit != null && limit > 0) {
            assessments = companyService.getRecentAssessments(limit);
        } else {
            assessments = companyService.getAllAssessments();
        }
        return ResponseEntity.ok(assessments);
    }

    @GetMapping("/assessments/{id}")
    public ResponseEntity<?> getAssessment(@PathVariable String id) {
        Optional<Assessment> assessment = companyService.getAssessment(id);
        if (assessment.isPresent()) {
            return ResponseEntity.ok(assessment.get());
        }
        Map<String, String> error = new HashMap<>();
        error.put("error", "Assessment not found: " + id);
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }

    @DeleteMapping("/assessments/{id}")
    public ResponseEntity<?> deleteAssessment(@PathVariable String id) {
        boolean deleted = companyService.deleteAssessment(id);
        if (deleted) {
            return ResponseEntity.noContent().build();
        }
        Map<String, String> error = new HashMap<>();
        error.put("error", "Assessment not found: " + id);
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }

    @PostMapping("/assessments/compare")
    public ResponseEntity<?> compareAssessments(@RequestBody List<String> assessmentIds) {
        try {
            List<Assessment> assessments = companyService.getAssessmentsByIds(assessmentIds);
            if (assessments.isEmpty()) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "No assessments found for the provided IDs");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
            }
            return ResponseEntity.ok(assessments);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to compare assessments: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
}

