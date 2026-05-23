package com.minipaint.security;

import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.*;

class JwtTokenProviderTest {

    private static final String SECRET = "test-secret-key-that-is-long-enough-for-hs256-algorithm-minimum-length-requirement-32-bytes";
    private final JwtTokenProvider provider = new JwtTokenProvider(SECRET, 3600000L);

    @Test
    void shouldGenerateTokenAndExtractEmail() {
        String token = provider.generateToken("test@example.com");
        assertThat(token).isNotNull().isNotEmpty();
        assertThat(provider.extractEmail(token)).isEqualTo("test@example.com");
    }

    @Test
    void shouldValidateValidToken() {
        String token = provider.generateToken("test@example.com");
        assertThat(provider.validateToken(token)).isTrue();
    }

    @Test
    void shouldRejectExpiredToken() throws InterruptedException {
        JwtTokenProvider shortLived = new JwtTokenProvider(SECRET, 1L);
        String token = shortLived.generateToken("test@example.com");
        Thread.sleep(2);
        assertThat(shortLived.validateToken(token)).isFalse();
    }

    @Test
    void shouldRejectTokenWithWrongSecret() {
        String token = provider.generateToken("test@example.com");
        JwtTokenProvider other = new JwtTokenProvider("other-secret-key-that-is-also-long-enough-for-hs256-to-work-correctly-ok", 3600000L);
        assertThat(other.validateToken(token)).isFalse();
    }

    @Test
    void shouldRejectMalformedToken() {
        assertThat(provider.validateToken("not.a.valid.token")).isFalse();
    }
}
