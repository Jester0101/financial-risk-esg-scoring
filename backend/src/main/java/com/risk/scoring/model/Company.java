package com.risk.scoring.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "companies")
public class Company {
    @Id
    private String id;
    private String name;
    private String industry;
    private String description;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<String> assessmentIds; // References to assessments

    public Company() {
        this.assessmentIds = new ArrayList<>();
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public Company(String name, String industry, String description) {
        this();
        this.name = name;
        this.industry = industry;
        this.description = description;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
        this.updatedAt = LocalDateTime.now();
    }

    public String getIndustry() {
        return industry;
    }

    public void setIndustry(String industry) {
        this.industry = industry;
        this.updatedAt = LocalDateTime.now();
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
        this.updatedAt = LocalDateTime.now();
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public List<String> getAssessmentIds() {
        return assessmentIds;
    }

    public void setAssessmentIds(List<String> assessmentIds) {
        this.assessmentIds = assessmentIds;
    }

    public void addAssessment(String assessmentId) {
        if (!this.assessmentIds.contains(assessmentId)) {
            this.assessmentIds.add(assessmentId);
            this.updatedAt = LocalDateTime.now();
        }
    }

    public void removeAssessment(String assessmentId) {
        this.assessmentIds.remove(assessmentId);
        this.updatedAt = LocalDateTime.now();
    }
}

