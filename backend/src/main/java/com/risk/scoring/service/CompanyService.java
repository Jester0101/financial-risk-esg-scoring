package com.risk.scoring.service;

import com.risk.scoring.model.Assessment;
import com.risk.scoring.model.Company;
import com.risk.scoring.repository.AssessmentRepository;
import com.risk.scoring.repository.CompanyRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class CompanyService {

    private final CompanyRepository companyRepository;
    private final AssessmentRepository assessmentRepository;

    public CompanyService(CompanyRepository companyRepository, AssessmentRepository assessmentRepository) {
        this.companyRepository = companyRepository;
        this.assessmentRepository = assessmentRepository;
    }

    public Company createCompany(Company company) {
        if (company.getCreatedAt() == null) {
            company.setCreatedAt(LocalDateTime.now());
        }
        if (company.getUpdatedAt() == null) {
            company.setUpdatedAt(LocalDateTime.now());
        }
        return companyRepository.save(company);
    }

    public Optional<Company> getCompany(String id) {
        return companyRepository.findById(id);
    }

    public List<Company> getAllCompanies() {
        return companyRepository.findAll();
    }

    public Company updateCompany(String id, Company updatedCompany) {
        Company existing = companyRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Company not found: " + id));
        
        updatedCompany.setId(id);
        updatedCompany.setCreatedAt(existing.getCreatedAt());
        updatedCompany.setUpdatedAt(LocalDateTime.now());
        updatedCompany.setAssessmentIds(existing.getAssessmentIds());
        
        return companyRepository.save(updatedCompany);
    }

    public boolean deleteCompany(String id) {
        if (companyRepository.existsById(id)) {
            List<Assessment> companyAssessments = assessmentRepository.findByCompanyIdOrderByCreatedAtDesc(id);
            assessmentRepository.deleteAll(companyAssessments);
            
            companyRepository.deleteById(id);
            return true;
        }
        return false;
    }

    public Optional<Company> findCompanyByName(String name) {
        return companyRepository.findByNameIgnoreCase(name);
    }

    public Assessment createAssessment(Assessment assessment) {
        try {
            System.out.println("CompanyService.createAssessment called");
            System.out.println("Assessment companyId: " + assessment.getCompanyId());
            System.out.println("Assessment companyName: " + assessment.getCompanyName());
            
            if (assessment.getCreatedAt() == null) {
                assessment.setCreatedAt(LocalDateTime.now());
            }
            
            System.out.println("Saving assessment to MongoDB repository...");
            Assessment saved = assessmentRepository.save(assessment);
            System.out.println("Assessment saved to MongoDB with ID: " + saved.getId());

            if (saved.getCompanyId() != null) {
                System.out.println("Linking assessment to company: " + saved.getCompanyId());
                companyRepository.findById(saved.getCompanyId()).ifPresent(company -> {
                    company.addAssessment(saved.getId());
                    companyRepository.save(company);
                    System.out.println("Company updated with new assessment ID");
                });
            } else {
                System.out.println("WARNING: Assessment has no companyId, not linking to company");
            }

            return saved;
        } catch (Exception e) {
            System.err.println("ERROR in CompanyService.createAssessment: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    public Optional<Assessment> getAssessment(String id) {
        return assessmentRepository.findById(id);
    }

    public List<Assessment> getAllAssessments() {
        return assessmentRepository.findAllByOrderByCreatedAtDesc();
    }

    public List<Assessment> getAssessmentsByCompany(String companyId) {
        return assessmentRepository.findByCompanyIdOrderByCreatedAtDesc(companyId);
    }

    public List<Assessment> getRecentAssessments(int limit) {
        return assessmentRepository.findAll(
                PageRequest.of(0, limit, Sort.by(Sort.Direction.DESC, "createdAt"))
        ).getContent();
    }

    public boolean deleteAssessment(String id) {
        Optional<Assessment> assessmentOpt = assessmentRepository.findById(id);
        if (assessmentOpt.isPresent()) {
            Assessment assessment = assessmentOpt.get();
            
            if (assessment.getCompanyId() != null) {
                companyRepository.findById(assessment.getCompanyId()).ifPresent(company -> {
                    company.removeAssessment(id);
                    companyRepository.save(company);
                });
            }
            
            assessmentRepository.deleteById(id);
            return true;
        }
        return false;
    }

    public List<Assessment> getAssessmentsByIds(List<String> ids) {
        return assessmentRepository.findByIdIn(ids);
    }
}

