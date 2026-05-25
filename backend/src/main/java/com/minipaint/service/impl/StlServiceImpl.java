package com.minipaint.service.impl;

import com.minipaint.model.dto.response.StlResponse;
import com.minipaint.model.entity.StlFile;
import com.minipaint.repository.StlFileRepository;
import com.minipaint.service.FileStorageService;
import com.minipaint.service.StlService;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class StlServiceImpl implements StlService {
    private final StlFileRepository repo;
    private final FileStorageService storage;

    public StlServiceImpl(StlFileRepository repo, FileStorageService storage) {
        this.repo = repo; this.storage = storage;
    }

    @Override
    public StlResponse upload(UUID userId, MultipartFile file) {
        try {
            String path = storage.store(file.getInputStream(), file.getOriginalFilename(), "stl");
            var entity = new StlFile(userId, file.getOriginalFilename(), file.getOriginalFilename(), path, file.getSize());
            return StlResponse.from(repo.save(entity));
        } catch (Exception e) {
            throw new RuntimeException("STL 上传失败", e);
        }
    }

    @Override
    public List<StlResponse> list(UUID userId) {
        return repo.findByUserId(userId).stream().map(StlResponse::from).collect(Collectors.toList());
    }

    @Override
    public StlResponse update(UUID userId, UUID fileId, String name, Double rx, Double ry, Double rz, Double h) {
        var f = repo.findById(fileId).orElseThrow(() -> new RuntimeException("文件不存在"));
        if (!f.getUserId().equals(userId)) throw new RuntimeException("无权修改");
        if (name != null) f.setDisplayName(name);
        if (rx != null) f.setRotationX(rx);
        if (ry != null) f.setRotationY(ry);
        if (rz != null) f.setRotationZ(rz);
        if (h != null) f.setHeightOffset(h);
        return StlResponse.from(repo.save(f));
    }

    @Override
    public void delete(UUID userId, UUID fileId) {
        var f = repo.findById(fileId).orElseThrow(() -> new RuntimeException("文件不存在"));
        if (!f.getUserId().equals(userId)) throw new RuntimeException("无权删除");
        storage.delete(f.getFilePath());
        repo.delete(f);
    }
}
