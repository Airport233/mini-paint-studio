package com.minipaint.service.impl;

import com.minipaint.model.dto.response.StlResponse;
import com.minipaint.model.entity.StlFile;
import com.minipaint.repository.LightingPresetRepository;
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
    private final LightingPresetRepository presetRepo;
    private final FileStorageService storage;

    public StlServiceImpl(StlFileRepository repo, LightingPresetRepository presetRepo, FileStorageService storage) {
        this.repo = repo; this.presetRepo = presetRepo; this.storage = storage;
    }

    @Override
    public StlResponse upload(UUID userId, MultipartFile file) {
        try {
            byte[] bytes = file.getBytes();
            String hash = sha256(bytes);
            if (repo.existsByUserIdAndFileHash(userId, hash)) {
                throw new RuntimeException("该 STL 文件已存在（相同内容）");
            }
            String path = storage.store(new java.io.ByteArrayInputStream(bytes), file.getOriginalFilename(), "stl");
            var entity = new StlFile(userId, file.getOriginalFilename(), file.getOriginalFilename(), path, file.getSize());
            entity.setFileHash(hash);
            return StlResponse.from(repo.save(entity));
        } catch (RuntimeException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("STL 上传失败", e);
        }
    }

    private String sha256(byte[] data) {
        try {
            var md = java.security.MessageDigest.getInstance("SHA-256");
            byte[] digest = md.digest(data);
            StringBuilder sb = new StringBuilder();
            for (byte b : digest) sb.append(String.format("%02x", b));
            return sb.toString();
        } catch (Exception e) {
            throw new RuntimeException("SHA-256 error", e);
        }
    }

    @Override
    public StlResponse get(UUID userId, UUID fileId) {
        var f = repo.findById(fileId).orElseThrow(() -> new RuntimeException("文件不存在"));
        if (!f.getUserId().equals(userId)) throw new RuntimeException("无权访问");
        return StlResponse.from(f);
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
    public int delete(UUID userId, UUID fileId) {
        var f = repo.findById(fileId).orElseThrow(() -> new RuntimeException("文件不存在"));
        if (!f.getUserId().equals(userId)) throw new RuntimeException("无权删除");
        var presets = presetRepo.findByUserIdAndGeometryRefId(userId, fileId);
        int count = presets.size();
        presets.forEach(p -> {
            if (p.getCoverImagePath() != null) storage.delete(p.getCoverImagePath());
            presetRepo.delete(p);
        });
        storage.delete(f.getFilePath());
        repo.delete(f);
        return count;
    }
}
