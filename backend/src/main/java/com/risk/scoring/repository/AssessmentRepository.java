package com.risk.scoring.repository;

import com.risk.scoring.model.Assessment;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AssessmentRepository extends MongoRepository<Assessment, String> {
    List<Assessment> findByCompanyIdOrderByCreatedAtDesc(String companyId);
    List<Assessment> findAllByOrderByCreatedAtDesc();
    List<Assessment> findByIdIn(List<String> ids);
}





