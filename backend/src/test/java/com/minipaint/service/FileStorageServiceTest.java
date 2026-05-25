package com.minipaint.service;

import com.minipaint.service.impl.FileStorageServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

import java.io.ByteArrayInputStream;
import java.nio.file.Files;
import java.nio.file.Path;

import static org.assertj.core.api.Assertions.*;

class FileStorageServiceTest {

    @TempDir
    Path tempDir;

    @Test
    void shouldStoreFileAndReturnPath() throws Exception {
        var svc = new FileStorageServiceImpl(tempDir.toString());
        byte[] content = "hello stl".getBytes();
        String path = svc.store(new ByteArrayInputStream(content), "test.stl", "stl");
        assertThat(path).isNotNull();
        assertThat(Files.exists(Path.of(path))).isTrue();
        assertThat(Files.readAllBytes(Path.of(path))).isEqualTo(content);
    }

    @Test
    void shouldDeleteFile() throws Exception {
        var svc = new FileStorageServiceImpl(tempDir.toString());
        String path = svc.store(new ByteArrayInputStream("data".getBytes()), "del.stl", "stl");
        svc.delete(path);
        assertThat(Files.exists(Path.of(path))).isFalse();
    }

    @Test
    void shouldGenerateUniqueFilenames() throws Exception {
        var svc = new FileStorageServiceImpl(tempDir.toString());
        String p1 = svc.store(new ByteArrayInputStream("a".getBytes()), "same.stl", "stl");
        String p2 = svc.store(new ByteArrayInputStream("b".getBytes()), "same.stl", "stl");
        assertThat(p1).isNotEqualTo(p2);
    }

    @Test
    void toAccessUrlShouldPrefixCorrectly() {
        var svc = new FileStorageServiceImpl(tempDir.toString());
        String url = svc.toAccessUrl("/uploads/stl/file.stl");
        assertThat(url).startsWith("/uploads/");
    }
}
