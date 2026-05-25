package com.minipaint.service.impl;

import com.minipaint.service.FileStorageService;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.nio.file.*;
import java.util.UUID;

@Service
public class FileStorageServiceImpl implements FileStorageService {

    private final Path baseDir;

    public FileStorageServiceImpl(@org.springframework.beans.factory.annotation.Value("${file-storage.stl-dir:./stl-files}") String stlDir) {
        this.baseDir = Path.of(stlDir).toAbsolutePath();
    }

    @Override
    public String store(InputStream inputStream, String originalName, String subdir) {
        try {
            Path dir = baseDir.resolve(subdir);
            Files.createDirectories(dir);
            String ext = "";
            int dot = originalName.lastIndexOf('.');
            if (dot >= 0) ext = originalName.substring(dot);
            String name = UUID.randomUUID() + ext;
            Path file = dir.resolve(name);
            Files.copy(inputStream, file, StandardCopyOption.REPLACE_EXISTING);
            return file.toString();
        } catch (Exception e) {
            throw new RuntimeException("文件存储失败", e);
        }
    }

    @Override
    public void delete(String path) {
        try { Files.deleteIfExists(Path.of(path)); }
        catch (Exception e) { throw new RuntimeException("文件删除失败", e); }
    }

    @Override
    public String toAccessUrl(String path) {
        String p = path.replace("\\", "/");
        return p.startsWith("/") ? p : "/" + p;
    }
}
