package com.minipaint.repository;

import com.minipaint.model.entity.StlFile;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface StlFileRepository extends JpaRepository<StlFile, UUID> {
    List<StlFile> findByUserId(UUID userId);
    boolean existsByUserIdAndFileHash(UUID userId, String fileHash);
}
