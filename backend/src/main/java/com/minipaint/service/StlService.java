package com.minipaint.service;

import com.minipaint.model.dto.response.StlResponse;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;
import java.util.UUID;

public interface StlService {
    StlResponse upload(UUID userId, MultipartFile file);
    List<StlResponse> list(UUID userId);
    StlResponse update(UUID userId, UUID fileId, String displayName, Double rx, Double ry, Double rz, Double h);
    void delete(UUID userId, UUID fileId);
}
